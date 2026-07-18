# SAVDIR Deployment & Setup Guide

This guide provides clear, step-by-step instructions to take the downloaded **SAVDIR** ZIP file from Google AI Studio, upload it to a brand new GitHub repository, and automatically deploy it to **GitHub Pages** using GitHub Actions.

---

## 🛠️ Prerequisites
Before starting, ensure you have:
1. **Git** installed on your computer ([Download Git](https://git-scm.com/)).
2. A **GitHub Account** ([Sign up for GitHub](https://github.com/)).
3. **Node.js** (v18 or newer) installed (optional, only needed if you want to run it locally first).

---

## 📋 The 6-Step Deployment Process

### Step 1: Extract the Downloaded ZIP
1. Locate the downloaded `.zip` file from Google AI Studio on your computer.
2. Extract (unzip) the contents into a dedicated folder where you want to keep your project (e.g., `Documents/SAVDIR`).

### Step 2: Initialize Git Locally
1. Open your terminal (Mac/Linux) or Command Prompt/Git Bash (Windows).
2. Navigate into your extracted project folder:
   ```bash
   cd path/to/your/extracted/SAVDIR-folder
   ```
3. Initialize a new Git repository:
   ```bash
   git init -b main
   ```

### Step 3: Create a Blank GitHub Repository
1. Open your web browser and go to [GitHub](https://github.com/).
2. Log in and click the **"+"** icon in the top-right corner, then select **New repository**.
3. Configure your repository:
   - **Repository name**: `SAVDIR` *(Note: If you use a different name, see the "Crucial Configuration Note" below).*
   - **Publicity**: Select **Public** (required for free GitHub Pages hosting).
   - **Initialization**: Do **NOT** check any of the options to add a README, `.gitignore`, or License (keep it completely blank).
4. Click **Create repository**.
5. Copy the remote URL displayed on the quick setup page (it looks like `https://github.com/your-username/SAVDIR.git`).

### Step 4: Link and Push Code to GitHub
1. Go back to your terminal window inside the project directory.
2. Add all project files to Git:
   ```bash
   git add .
   ```
3. Commit the files with an initial message:
   ```bash
   git commit -m "Initial commit: SAVDIR Learning Hub"
   ```
4. Link your local project to your new GitHub repository (replace `YOUR_REMOTE_URL` with the link you copied in Step 3):
   ```bash
   git remote add origin YOUR_REMOTE_URL
   ```
5. Push your code to GitHub:
   ```bash
   git push -u origin main
   ```

### Step 5: Configure Repository Permissions
By default, GitHub Actions workflows do not have write access to create the deployment branch. We must enable this:
1. On your GitHub repository page, go to the **Settings** tab (the gear icon on the top menu bar).
2. In the left sidebar, click on **Actions** -> **General**.
3. Scroll down to the bottom of the page to find **Workflow permissions**.
4. Select **Read and write permissions**.
5. Click **Save**.

### Step 6: Configure and View Your Live Site
Once the files are pushed, your custom GitHub Action (`deploy.yml`) will automatically trigger, build the project, and create a deployment branch called `gh-pages`.
1. Go to your repository's **Actions** tab to watch the build finish (takes about 1-2 minutes).
2. Once successful, go to **Settings** -> **Pages** in the left sidebar.
3. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`.
   - **Branch**: Select `gh-pages` and folder `/ (root)`.
   - Click **Save**.
4. Within a minute, a notice will appear at the top of the Pages settings page with your live website URL (e.g., `https://your-username.github.io/SAVDIR/`).

---

## ⚠️ Crucial Base URL Configuration Note
GitHub Pages hosts project sites in subdirectories (e.g., `https://username.github.io/SAVDIR/`).
* **If your GitHub repository is named exactly `SAVDIR`**: The site will work perfectly immediately because your `vite.config.ts` base path is set to `/SAVDIR/`.
* **If you named your repository something else** (e.g., `learning-hub`):
  1. Open `vite.config.ts` in your text editor.
  2. Change line 8 from `base: '/SAVDIR/',` to `base: '/YOUR-REPO-NAME/',`.
  3. Commit and push the change to GitHub:
     ```bash
     git add vite.config.ts
     git commit -m "Update base path for github pages"
     git push
     ```
