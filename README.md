# Cinematic Birthday Surprise Website

A premium, single-page, fully responsive birthday surprise website with a luxury matte black and gold aesthetic, custom canvas particle animations, synthed Web Audio API sound effects, and CSS-animated galaxy backgrounds.

## Features

- **Luxury Theme:** Deep matte black (`#090909`), matte gold, beige, and white tones.
- **Landing Galaxy Background:** Twinkling stars, drifting planets, soft clouds, and shooting stars built entirely with optimized HTML/CSS animations.
- **Circular SVG Countdown:** An elegant 10-to-0 timer with ticking sounds and screen shake transition.
- **SVG Cake & Cutting:** Slices in half with custom falling crumbs, chimes, and realistic fireworks.
- **Blow-Out Interactions:** Candle flames extinguish with smoke particles.
- **Typewriter Letter:** Centered card flips 180 degrees using CSS 3D perspective to reveal a custom typewriter printed letter.
- **Web Audio API Synth:** Gentle piano/harp melodies, ticks, and whooshes generated in-browser with zero external audio assets.
- **Music Controls:** Mute/unmute toggle in the top right.

## How to Customize the Letter

1. Open `script.js`.
2. Find the variable `fullMessage` (around line 1024):
   ```javascript
   const fullMessage = "Here's to celebrating another year...";
   ```
3. Change the string content to your own custom message.
4. Save the file.

## How to Deploy to GitHub Pages (Step-by-Step)

Follow these simple steps to host this website online for free and get a shareable link:

### Option 1: Using the GitHub Website (Easiest)

1. **Create a GitHub Account:** Go to [GitHub](https://github.com/) and sign up if you don't have an account.
2. **Create a New Repository:**
   - Click the **"+"** icon in the top-right corner and select **"New repository"**.
   - Name your repository (e.g., `birthday-surprise`).
   - Choose **Public** (required for free GitHub Pages hosting).
   - Leave "Add a README", ".gitignore", and license unchecked.
   - Click **"Create repository"**.
3. **Upload the Files:**
   - Under the "Quick setup" section, click the link that says **"uploading an existing file"**.
   - Drag and drop your project files (`index.html`, `style.css`, `script.js`, `README.md`) into the box.
   - Wait for the files to upload.
   - At the bottom of the page, click the green **"Commit changes"** button.

### Option 2: Using the Command Line (Git)

1. Open PowerShell/Terminal inside the project folder.
2. Link the repository you created on GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   ```
3. Rename the branch to `main` (if not already):
   ```bash
   git branch -M main
   ```
4. Push the code:
   ```bash
   git push -u origin main
   ```

---

### Enabling GitHub Pages to Get Your Public Link

Once your files are on GitHub:

1. Click on the **"Settings"** tab at the top of your repository.
2. On the left sidebar, click on **"Pages"** (under the "Code and automation" section).
3. Under the **"Build and deployment"** section:
   - For **Source**, select **"Deploy from a branch"**.
   - For **Branch**, select **`main`** (or `master`) and keep the folder as **`/ (root)`**.
   - Click the **"Save"** button.
4. **Get Your URL:**
   - Wait 1–2 minutes and refresh the page.
   - You will see a banner at the top of the settings page: **"Your site is live at `https://your-username.github.io/repository-name/`"**.
   - Share this link with your loved one!
