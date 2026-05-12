const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("atlas.openDashboard", () => createPanel(context)),
    vscode.commands.registerCommand("atlas.reload", () => createPanel(context))
  );

  if (vscode.workspace.getConfiguration("atlas").get("openOnStartup")) {
    createPanel(context);
  }
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
