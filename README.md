# Protein Drink Tracker

A **Progressive Web App** for tracking your daily protein drink intake. Works fully offline, supports 7 languages, and includes gamification features like streaks, badges, and heatmaps.

**Live app:** [protein-shake-tracker.netlify.app](https://protein-shake-tracker.netlify.app/)

> Install it on your phone for free: open the link above in your mobile browser and tap **"Add to Home Screen"**.

---

## Features

- One-tap daily protein tracking with undo
- Streak counter and milestone badges (7, 14, 30, 100 days)
- Weekly progress ring and 365-day heatmap
- Monthly stats with completion percentage
- Dark / light theme (auto-detects OS preference)
- 7 languages: English, French, Dutch, Turkish, Arabic, Spanish, Swedish
- Motivational daily quotes
- Full history table with CSV and PDF export
- World clock strip (7 cities)
- Push notification reminders
- Fully offline via service worker

---

## Quick Start

No build tools required. The app is plain HTML, CSS, and JavaScript.

```bash
# 1. Clone (or fork first, then clone your fork)
git clone https://github.com/softwarewithnick/protein-drink-tracker.git
cd protein-drink-tracker

# 2. Serve locally (any static server works)
npx serve .
# or: python3 -m http.server 8000
# or just open index.html in your browser
```

Open `http://localhost:3000` (or whatever port your server uses) and you are ready to go.

---

## Project Structure

```
protein-drink-tracker/
|-- index.html           # Main PWA shell
|-- protein-food.html    # Protein food chart page
|-- app.js               # Core application logic (14 sections)
|-- sw.js                # Service worker (offline + notifications)
|-- translations.js      # i18n dictionary (7 languages)
|-- styles.css           # Design system (17 sections)
|-- manifest.json        # PWA manifest
|-- icons/               # App icons (SVG)
|-- images/              # Illustrations (drank / not-drank)
|-- ARCHITECTURE.md      # Detailed technical reference
+-- README.md            # This file
```

For a deep dive into every function, data flow, and constant, see **[ARCHITECTURE.md](ARCHITECTURE.md)**.

---

## Contributing

This project is **open-source** and built for **learning**. Contributions of all sizes are welcome -- from typo fixes to new features.

**Don't be afraid to fork the repo and experiment!**

### Video Tutorials

If you are new to open-source contributions, these videos walk through the process:

- [How to Contribute to Open Source](https://www.youtube.com/watch?v=dLRA1lffWBw)
- [Your First Pull Request](https://www.youtube.com/watch?v=CML6vfKjQss)

### Step-by-Step Guide

#### 1. Fork & Clone

Click **Fork** at the top-right of the GitHub page, then clone your fork:

```bash
git clone https://github.com/<your-username>/protein-drink-tracker.git
cd protein-drink-tracker
```

#### 2. Create a Branch

Always work on a new branch -- never commit directly to `main`:

```bash
git checkout -b feature/my-feature
```

Use a descriptive name like `fix/button-color` or `feature/dark-mode`.

#### 3. Make Your Changes

- Read **[ARCHITECTURE.md](ARCHITECTURE.md)** to understand how the code is organized.
- Keep changes focused and self-contained.
- Follow the existing code style (see the JSDoc comments and section headers in each file).
- Test your changes locally by serving the app and clicking through the UI.

#### 4. Commit & Push

```bash
git add <files-you-changed>
git commit -m "Add dark mode toggle"
git push origin feature/my-feature
```

Write clear, descriptive commit messages. Only stage the files you actually changed (avoid `git add .`).

#### 5. Open a Pull Request

1. Go to your fork on GitHub.
2. Click **Compare & pull request**.
3. Set the base repository to `softwarewithnick/protein-drink-tracker` and the base branch to `main`.
4. Give your PR a descriptive title and explain:
   - **What** you changed
   - **Why** the change is useful
   - Reference any related issue (e.g. `Closes #5`)
5. Submit the PR.

#### 6. Review & Iterate

- A maintainer will review your PR and may request changes -- this is normal and part of the learning process.
- Push updates to the **same branch**; the PR updates automatically.
- Once approved, your changes will be merged.

#### 7. Stay in Sync

If other changes are merged while your PR is open:

```bash
git remote add upstream https://github.com/softwarewithnick/protein-drink-tracker.git
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

#### 8. (Optional) Open an Issue First

For larger changes or new features, open an issue before starting work:

1. Describe the problem or feature idea.
2. Wait for discussion or approval.
3. Reference the issue in your PR (e.g. `Closes #10`).

This keeps the project organized and prevents duplicate effort.

---

## Contribution Ideas

Not sure where to start? Here are some beginner-friendly ideas:

- **Add a new language** -- see the "Adding a New Language" section in [ARCHITECTURE.md](ARCHITECTURE.md)
- **Add a new protein food** to the chart page
- **Fix a UI bug** on mobile or a specific browser
- **Improve accessibility** (ARIA labels, keyboard navigation)
- **Write better error handling** for edge cases
- **Add a new badge milestone** (e.g. 50-day streak)

---

## License

This project is open-source and primarily for educational purposes. Every contribution counts -- from small bug fixes to new features. Thank you for helping make Protein Drink Tracker better!
