const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

function activate(context) {
  const openDashboard = vscode.commands.registerCommand(
    "atlas.openDashboard",
    () => createPanel(context)
  );
  context.subscriptions.push(openDashboard);

  const config = vscode.workspace.getConfiguration("atlas");
  if (config.get("openOnStartup")) {
    createPanel(context);
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

  const userName = vscode.workspace.getConfiguration("atlas").get("userName") || "User";
  const htmlPath = path.join(context.extensionPath, "webview", "index.html");
  let html = fs.readFileSync(htmlPath, "utf8");
  html = html.replace(/\{\{userName\}\}/g, userName);
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
    (err) => vscode.window.showErrorMessage(`Could not open ${relPath}: ${err.message}`)
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
