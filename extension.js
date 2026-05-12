const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const Anthropic = require("@anthropic-ai/sdk");

const API_KEY_SECRET = "atlas.anthropicApiKey";

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("atlas.openDashboard", () => createPanel(context)),
    vscode.commands.registerCommand("atlas.reload", () => createPanel(context)),
    vscode.commands.registerCommand("atlas.setApiKey", () => promptForApiKey(context)),
    vscode.commands.registerCommand("atlas.clearApiKey", () => clearApiKey(context))
  );

  if (vscode.workspace.getConfiguration("atlas").get("openOnStartup")) {
    createPanel(context);
  }
}

async function promptForApiKey(context) {
  const key = await vscode.window.showInputBox({
    prompt: "Enter your Anthropic API key (starts with sk-ant-)",
    password: true,
    ignoreFocusOut: true,
    placeHolder: "sk-ant-..."
  });
  if (key && key.trim()) {
    await context.secrets.store(API_KEY_SECRET, key.trim());
    vscode.window.showInformationMessage("ATLAS: API key saved securely.");
    return true;
  }
  return false;
}

async function clearApiKey(context) {
  await context.secrets.delete(API_KEY_SECRET);
  vscode.window.showInformationMessage("ATLAS: API key cleared.");
}

function getConfigSnapshot() {
  const cfg = vscode.workspace.getConfiguration("atlas");
  const folders = vscode.workspace.workspaceFolders;
  return {
    userName: cfg.get("userName") || "User",
    location: cfg.get("location") || "",
    sprintStartDate: cfg.get("sprintStartDate") || "",
    sprintLength: cfg.get("sprintLength") || 0,
    projects: cfg.get("projects") || [],
    links: cfg.get("links") || [],
    journalPath: cfg.get("journalPath") || "JOURNAL.md",
    model: cfg.get("model") || "claude-opus-4-7",
    workspaceName: folders && folders[0] ? folders[0].name : "no-folder",
    workspaceRoot: folders && folders[0] ? folders[0].uri.fsPath : ""
  };
}

function readJournalTodos() {
  const cfg = getConfigSnapshot();
  if (!cfg.workspaceRoot) return { error: "No workspace folder open" };

  const journalFile = path.isAbsolute(cfg.journalPath)
    ? cfg.journalPath
    : path.join(cfg.workspaceRoot, cfg.journalPath);

  if (!fs.existsSync(journalFile)) return { error: cfg.journalPath + " not found" };

  const lines = fs.readFileSync(journalFile, "utf8").split(/\r?\n/);
  const todos = [];
  for (const line of lines) {
    const m = line.match(/^\s*-\s*\[( |x|X)\]\s*(.+)$/);
    if (m) todos.push({ done: m[1].toLowerCase() === "x", text: m[2].trim() });
  }
  return { todos };
}

async function handleChat(context, panel, payload) {
  const cfg = vscode.workspace.getConfiguration("atlas");
  let apiKey = await context.secrets.get(API_KEY_SECRET);

  if (!apiKey) {
    const action = await vscode.window.showWarningMessage(
      "ATLAS needs your Anthropic API key to chat.",
      "Set API Key",
      "Cancel"
    );
    if (action === "Set API Key") {
      const ok = await promptForApiKey(context);
      if (!ok) {
        panel.webview.postMessage({ command: "chatError", message: "API key required." });
        return;
      }
      apiKey = await context.secrets.get(API_KEY_SECRET);
    } else {
      panel.webview.postMessage({ command: "chatError", message: "API key required." });
      return;
    }
  }

  const userName = cfg.get("userName") || "User";
  const systemPrompt = cfg.get("systemPrompt") ||
    "You are ATLAS, a helpful AI assistant integrated into the user's VSCode dashboard.";
  const model = cfg.get("model") || "claude-opus-4-7";
  const maxTokens = cfg.get("maxTokens") || 2048;

  const folders = vscode.workspace.workspaceFolders;
  const workspaceName = folders && folders[0] ? folders[0].name : "no-folder";

  const fullSystem = [
    {
      type: "text",
      text: systemPrompt + "\n\nUser's preferred name: " + userName +
        "\nCurrent workspace: " + workspaceName,
      cache_control: { type: "ephemeral" }
    }
  ];

  try {
    const client = new Anthropic({ apiKey });
    const stream = client.messages.stream({
      model,
      max_tokens: maxTokens,
      system: fullSystem,
      messages: payload.messages
    });

    let buffer = "";
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta &&
        event.delta.type === "text_delta"
      ) {
        buffer += event.delta.text;
        panel.webview.postMessage({
          command: "chatDelta",
          text: event.delta.text,
          turnId: payload.turnId
        });
      }
    }

    const final = await stream.finalMessage();
    panel.webview.postMessage({
      command: "chatDone",
      text: buffer,
      turnId: payload.turnId,
      usage: final.usage
    });
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    panel.webview.postMessage({ command: "chatError", message: msg, turnId: payload.turnId });
  }
}

function createPanel(context) {
  const panel = vscode.window.createWebviewPanel(
    "atlasDashboard",
    "ATLAS",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "webview"))]
    }
  );

  const htmlPath = path.join(context.extensionPath, "webview", "index.html");
  let html = fs.readFileSync(htmlPath, "utf8");
  html = html.replace("__ATLAS_CONFIG__", JSON.stringify(getConfigSnapshot()));
  panel.webview.html = html;

  panel.webview.onDidReceiveMessage((msg) => {
    switch (msg.command) {
      case "openFile":
        openWorkspaceFile(msg.file);
        break;
      case "runCommand":
        vscode.commands.executeCommand(msg.id);
        break;
      case "openTerminal":
        vscode.window.activeTerminal
          ? vscode.window.activeTerminal.show()
          : vscode.window.createTerminal("ATLAS").show();
        break;
      case "openClaude":
        vscode.commands.executeCommand("claude-code.openChat").then(undefined, () => {
          vscode.commands.executeCommand("workbench.action.chat.open");
        });
        break;
      case "openProject":
        openProject(msg.targetPath);
        break;
      case "openExternal":
        vscode.env.openExternal(vscode.Uri.parse(msg.url));
        break;
      case "runLiveServer":
        vscode.commands.executeCommand("extension.liveServer.goOnline").then(
          undefined,
          () => vscode.window.showWarningMessage("Live Server extension not installed")
        );
        break;
      case "readJournal":
        panel.webview.postMessage({ command: "journalResult", data: readJournalTodos() });
        break;
      case "openSettings":
        vscode.commands.executeCommand(
          "workbench.action.openSettings",
          "@ext:paphangkorn.atlas-dashboard"
        );
        break;
      case "setApiKey":
        promptForApiKey(context);
        break;
      case "chat":
        handleChat(context, panel, msg);
        break;
    }
  });
}

function openWorkspaceFile(relPath) {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    vscode.window.showWarningMessage("No workspace folder open");
    return;
  }
  const target = path.join(folders[0].uri.fsPath, relPath);
  vscode.workspace.openTextDocument(target).then(
    (doc) => vscode.window.showTextDocument(doc),
    (err) => vscode.window.showErrorMessage("Could not open " + relPath + ": " + err.message)
  );
}

function openProject(projectPath) {
  if (!projectPath) return;
  const uri = vscode.Uri.file(projectPath);
  vscode.commands.executeCommand("vscode.openFolder", uri, { forceNewWindow: false });
}

function deactivate() {}

module.exports = { activate, deactivate };
