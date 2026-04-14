<div align="center">
<img width="1200" height="475" alt="Libby Banner Logo" src="./public/banner.png" />
</div>

# Libby - Perpustakaan Ebook Indonesia

Libby is an Indonesian digital library and e-commerce platform for ebooks. It provides a clean interface for users to browse, purchase, and read digital books.

## Run Locally

**Prerequisites:**  Node.js 22 or higher.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up your environment variables (e.g. `GEMINI_API_KEY`) in `.env.local`.
3. Run the application:
   ```bash
   npm run dev
   ```

## Deployment (GitHub Pages)

This project is fully configured to automatically build and deploy to GitHub Pages using GitHub Actions whenever changes are pushed to the `main` branch.

**To enable the live site:**
1. Navigate to your repository on GitHub (`ridhoadilla/libby-frontend`).
2. Click on the **Settings** tab.
3. On the left sidebar, click on **Pages**.
4. Under the "Build and deployment" section, change the **Source** dropdown to **GitHub Actions** (do not select Deploy from a branch or Jekyll).

Once enabled, GitHub will automatically trigger the `.github/workflows/deploy.yml` action, and your site will be live at: `https://ridhoadilla.github.io/libby-frontend/`
