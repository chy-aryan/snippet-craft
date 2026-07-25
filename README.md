# SnippetCraft

**SnippetCraft** is a lightweight, persistent VS Code extension designed for developers and competitive programmers to create, store, and auto-complete custom code templates using simple keywords in seconds.

---

## Features

* **Quick Snippet Creation:** Easily create and edit templates for any programming language directly from the Command Palette.
* **Global Persistence:** Your saved snippets are stored securely via VS Code's global state, making them available across all your local projects.
* **IntelliSense Auto-Complete:** Type your custom trigger keywords in any file, and your snippets will instantly appear in the auto-complete dropdown.

---

## Requirements

* Visual Studio Code (Version 1.85.0 or higher)

---

## Installation & Usage

1. Open the Command Palette using **`Ctrl + Shift + P`** (or `Cmd + Shift + P` on Mac).
2. Type and select **`SnippetCraft: Create or Edit Snippet`**.
3. Select your programming language (e.g., `cpp`, `python`, `javascript`).
4. Enter your custom trigger keyword. 
   > **Important Keyword Restriction:** Your keyword **must not contain any spaces** (e.g., use `dsu`, `bfs`, or `binarysearch` instead of `my template`). VS Code's auto-complete engine requires single continuous words to match properly.
5. Write or edit your code template in the opened editor tab.
6. Click the **`Save Snippet`** button in the bottom-right notification popup.
7. Open any file of that language, type your keyword, and press `Tab` or `Enter` to inject your template instantly!

---