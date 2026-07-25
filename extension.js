const vscode = require('vscode');

let snippetMap = new Map();

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    // Keep runtime memory in sync with global storage
    function syncSnippets() {
        snippetMap.clear();
        const stored = context.globalState.get('userSnippets');
        if (stored && typeof stored === 'object') {
            for (const [k, v] of Object.entries(stored)) snippetMap.set(k, v);
        }
    }

    syncSnippets();

    // Command to create or edit snippets
    const createCmd = vscode.commands.registerCommand('extension.createSnippet', async () => {
        const languages = ['cpp', 'javascript', 'python', 'java', 'c', 'csharp', 'go', 'ruby'];
        const language = await vscode.window.showQuickPick(languages, { placeHolder: 'Select language' });
        if (!language) return;

        const keyword = await vscode.window.showInputBox({ prompt: 'Enter trigger keyword (no spaces)' });
        if (!keyword) return;

        const existing = snippetMap.get(keyword);
        const initial = existing ? existing.code : `// Write your ${language} snippet for '${keyword}' here\n`;
        
        const doc = await vscode.workspace.openTextDocument({ language, content: initial });
        await vscode.window.showTextDocument(doc);

        const saveBtn = 'Save Snippet';
        const selection = await vscode.window.showInformationMessage(`Click "${saveBtn}" when done editing.`, saveBtn);
        
        if (selection === saveBtn) {
            const code = doc.getText();
            snippetMap.set(keyword, { language, code });

            const toStore = {};
            for (const [k, v] of snippetMap.entries()) toStore[k] = v;
            
            await context.globalState.update('userSnippets', toStore);
            syncSnippets(); // Updates memory instantly

            vscode.window.showInformationMessage(`Snippet '${keyword}' saved successfully!`);
        }
    });

    // Global IntelliSense auto-complete provider
    const provider = vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language: '*' },
        {
            provideCompletionItems(document, position) {
                syncSnippets(); // Pulls latest global state across any folder/window

                const line = document.lineAt(position).text.slice(0, position.character);
                const word = line.split(/\s+/).pop();
                const items = [];

                for (const [key, { language, code }] of snippetMap.entries()) {
                    if (key.toLowerCase().startsWith(word.toLowerCase()) && document.languageId === language) {
                        const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Snippet);
                        item.insertText = new vscode.SnippetString(code);
                        item.detail = `SnippetCraft (${language})`;
                        items.push(item);
                    }
                }
                return items;
            }
        },
        ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    );

    context.subscriptions.push(createCmd, provider);
}

function deactivate() {}

module.exports = { activate, deactivate };