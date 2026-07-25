const vscode = require('vscode');

let snippetMap = new Map();

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    // Load saved snippets from global storage on startup
    const stored = context.globalState.get('userSnippets');
    if (stored && typeof stored === 'object') {
        for (const [key, obj] of Object.entries(stored)) {
            snippetMap.set(key, obj);
        }
    }

    // Command to create or edit custom snippets
    const createCmd = vscode.commands.registerCommand(
        'extension.createSnippet',
        async () => {
            const languages = ['cpp', 'javascript', 'python', 'java', 'c', 'csharp', 'go', 'ruby'];
            const language = await vscode.window.showQuickPick(languages, {
                placeHolder: 'Select snippet language'
            });
            if (!language) return vscode.window.showWarningMessage('Snippet creation cancelled.');

            const keyword = await vscode.window.showInputBox({
                prompt: 'Enter the snippet trigger keyword (e.g., dsu, bfs)'
            });
            if (!keyword) return vscode.window.showWarningMessage('Snippet creation cancelled.');

            // Load existing code if editing, otherwise template
            const existing = snippetMap.get(keyword);
            const initial = existing ? existing.code
                : `// Write your ${language} snippet for '${keyword}' here\n`;
            
            const doc = await vscode.workspace.openTextDocument({
                language,
                content: initial
            });
            await vscode.window.showTextDocument(doc);

            const saveChoice = 'Save Snippet';
            const selection = await vscode.window.showInformationMessage(
                `When done editing, click "${saveChoice}" in the notification bar.`,
                saveChoice
            );

            // Save and persist updates
            if (selection === saveChoice) {
                const code = doc.getText();
                snippetMap.set(keyword, { language, code });

                const toStore = {};
                for (const [k, val] of snippetMap.entries()) {
                    toStore[k] = val;
                }
                await context.globalState.update('userSnippets', toStore);

                vscode.window.showInformationMessage(
                    `Snippet '${keyword}' successfully saved for ${language}!`
                );
            }
        }
    );

    // IntelliSense provider for keyword auto-complete injection
    const provider = vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language: '*' },
        {
            provideCompletionItems(document, position) {
                const line = document.lineAt(position).text.slice(0, position.character);
                const word = line.split(/\s+/).pop();
                const items = [];

                for (const [key, { language, code }] of snippetMap.entries()) {
                    if (
                        key.toLowerCase().startsWith(word.toLowerCase()) &&
                        document.languageId === language
                    ) {
                        const item = new vscode.CompletionItem(
                            key,
                            vscode.CompletionItemKind.Snippet
                        );
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