# Contributing to ProteinTracker PWA 🥤

First off, thank you for considering contributing to ProteinTracker! It’s people like you that make this an awesome educational resource for everyone.

This guide is designed for **complete beginners**. If you've never contributed to open source before, you're in the right place!

---

## 🛠️ Prerequisites

Before you start, you'll need three main tools:
1.  **A Web Browser**: (Chrome, Firefox, or Brave recommended).
2.  **A Code Editor**: We recommend [Visual Studio Code (VS Code)](https://code.visualstudio.com/).
3.  **Git**: This is the software that tracks changes in code.

---

## 💻 OS-Specific Setup Instructions

Find your Operating System below and follow the steps to get Git and VS Code ready.

### 🪟 Windows
1.  **Install VS Code**: Download and run the installer from [here](https://code.visualstudio.com/download).
2.  **Install Git**:
    - Download **Git for Windows** from [git-scm.com](https://git-scm.com/download/win).
    - Run the installer. You can click "Next" on all default settings.
3.  **Verify**: Open "PowerShell" or "Command Prompt" and type:
    ```bash
    git --version
    ```
    If it shows a version number, you're good!

### 🍎 macOS
1.  **Install VS Code**: Download the .zip file from [here](https://code.visualstudio.com/download), unzip it, and drag VS Code to your Applications folder.
2.  **Install Git**:
    - The easiest way is to open "Terminal" (found in Applications > Utilities) and type:
    ```bash
    git --version
    ```
    - If you don't have it, a window will pop up asking you to install "Xcode Command Line Tools." Click **Install**.
3.  **Alternative (Homebrew)**: If you use [Homebrew](https://brew.sh/), just run `brew install git`.

### 🐧 Linux
1.  **Install VS Code**: Download the `.deb` or `.rpm` package from [here](https://code.visualstudio.com/download) or use your software center.
2.  **Install Git**: Open your terminal and run:
    - **Ubuntu/Debian**: `sudo apt update && sudo apt install git`
    - **Fedora**: `sudo dnf install git`
    - **Arch**: `sudo pacman -S git`
3.  **Verify**: Type `git --version` in the terminal.

---

## 🚀 Your First Contribution (Step-by-Step)

### 1. Fork this Project
- Go to the top-right of this GitHub page and click the **Fork** button.
- This creates a personal copy of the code in your GitHub account.

### 2. Copy (Clone) your Fork to your Computer
- On your fork's page, click the green **<> Code** button and copy the URL.
- Open VS Code.
- Go to **File > Open Folder** and create or pick a spot on your computer.
- Open the **Terminal** in VS Code (`Ctrl + ` ` or Terminal > New Terminal).
- Type the following (replace the URL with your copied link):
  ```bash
  git clone https://github.com/YOUR_USERNAME/protein-drink-tracker.git
  ```
- Go into the folder:
  ```bash
  cd protein-drink-tracker
  ```

### 3. Create a "Branch"
Think of a branch as a "safe playground." It lets you work on changes without messing up the main code.
```bash
git checkout -b my-awesome-fix
```

### 4. Make Improvements!
- Open the files in VS Code (like `index.html` or `styles.css`).
- Change colors, fix typos, or add a new button.
- **To see your changes**: Install the **"Live Server"** extension in VS Code. Then, right-click `index.html` and select **"Open with Live Server"**.

### 5. Save and "Commit"
Once you're happy with your changes, save the files and run these in the terminal:
```bash
# This stage's your changes (marks them for saving)
git add .

# This saves them with a message describing what you did
git commit -m "Fixed a typo in the header"
```

### 6. Push to GitHub
```bash
git push origin my-awesome-fix
```

### 7. Open a Pull Request (PR)
- Go back to your fork on GitHub.com.
- You'll see a yellow bar saying "Compare & pull request". Click it!
- Write a short note about what you changed and click **Create pull request**.

---

## 📝 Coding Guidelines

- **Keep it Simple**: We love clean code.
- **CSS**: Try to keep your styles organized in `styles.css`.
- **JS**: If you're adding logic, try to match the style in `app.js`.
- **PWA**: Avoid breaking the `manifest.json` or `sw.js` unless you know what you're doing, as these make the app "installable."

---

## 🐛 Found a Bug?
If you're not ready to write code, you can still help by reporting a bug:
1.  Click the **Issues** tab at the top.
2.  Click **New Issue**.
3.  Describe what's wrong and how to reproduce it.

---

## 🎓 Learning Resources
- [Git & GitHub for Beginners (Video)](https://www.youtube.com/watch?v=RGOj5yH7evk)
- [How to use VS Code (Video)](https://www.youtube.com/watch?v=VqCgcpAypFQ)

**Congratulations!** You're on your way to becoming an open-source contributor. 🥳
