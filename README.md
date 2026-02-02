# ProteinTracker PWA

Welcome to **ProteinTracker PWA**! 🥤

Link to live app: [protein-shake-tracker.netlify.app](https://protein-shake-tracker.netlify.app/)

You can get this app onto your phone for free by selecting the "Add to Home" option on your mobile browser.

This is a simple Progressive Web App to track your daily protein drink intake.  
This project is **open-source** and primarily for **educational purposes**, so small features, bug fixes, and improvements are all welcome.
Below is a description of steps to follow to contribute to this project.

Additionally, here are some YouTube videos that walk through contributing to opensource projects!

* https://www.youtube.com/watch?v=dLRA1lffWBw

* https://www.youtube.com/watch?v=CML6vfKjQss

**DON'T BE AFRAID TO FORK YOUR OWN REPO AND PLAY AROUND WITH THE CODE, ADD NEW FEATURES, TEST THINGS OUT!**
---

## Contributing Guide

We encourage contributions from everyone. For a detailed, beginner-friendly guide on how to set up your environment and submit your first Pull Request, please see our [CONTRIBUTING.md](file:///c:/Users/Maruti/Desktop/protein-drink-tracker/CONTRIBUTING.md).

### Quick Steps
1. **Fork the Repository**
   Click the **Fork** button at the top-right of the GitHub page.

Click the **Fork** button at the top-right of the GitHub page.  
This creates a copy of the repository under your own GitHub account where you have write access.

---

### 2. Create a Branch

Create a new branch for your changes instead of working on `main` directly:

```bash
git checkout -b feature/my-feature
```
Use a descriptive branch name like fix/button-color or feature/dark-mode.

---

### 3. Make Your Changes
* Add features, fix bugs, or improve documentation.

* Keep your code clean, readable, and self-contained.

* Commit your changes with a descriptive message:

```bash
git add .
git commit -m "Add dark mode toggle"
```

---

### 4. Push Your Branch to Your Fork

Push the branch with your changes to your fork:
```bash
git push origin feature/my-feature
```

---

### 5. Open a Pull Request (PR)

1. Go to your fork on GitHub.

2. Click Compare & pull request.

3. Make sure the base repository is softwarewithnick/ProteinTracker and the base branch is main.

4. Give your PR a descriptive title and provide a clear description:

   * What changes you made

   * Why these changes are useful

   * Reference any related issue (e.g., Closes #5) if applicable

   * Submit the PR.

5. Small contributions are absolutely welcome! Even tiny fixes or minor UI improvements help the project.

---

### 6. PR Review

* Maintainers will review your PR.

* They may request changes or provide feedback — this is normal.

* Push updates to the same branch; your PR will automatically update.

* Once approved, your PR will be merged into main.

---

### 7. Stay in Sync

If other changes are merged while your PR is open, keep your fork up-to-date:
```bash
git fetch upstream
git checkout main
git merge upstream/main
```
Replace upstream with the remote pointing to the original repository.

---

### 8. Optional: Opening Issues First

For larger changes or new features, it’s helpful to open an issue first:

1. Describe the problem or feature idea.
2. Wait for discussion or approval before starting work.
3. Reference the issue in your PR (e.g., `Closes #10`).

> This keeps the project organized and prevents duplicate effort.

---

## Notes

- This project is **educational**, so experimentation is encouraged.
- Every contribution counts — from small bug fixes to new features.
- Make sure to write clear commit messages.
- Thank you for helping make ProteinTracker better! 🎉
