# SewPlan APS: Local Setup & Implementation Guideline

A comprehensive step-by-step guide to installing, configuring, and running the **SewPlan APS (Advanced Planning & Scheduling)** platform on your local computer or enterprise on-premise server.

---

## 1. System Requirements & Required Tools

Before installing, ensure your machine has the following tools installed:

### Required Software:
| Tool | Minimum Version | Recommended Version | Download Link |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v18.18.0` | `v20.x LTS` or `v22.x LTS` | [https://nodejs.org](https://nodejs.org) |
| **npm** | `v9.x` | `v10.x` (bundled with Node.js) | Bundled with Node.js |
| **Git** | `v2.30+` | Latest | [https://git-scm.com](https://git-scm.com) |
| **Web Browser** | Any modern browser | Chrome, Edge, Firefox, Safari | - |

*(Optional alternative package managers: `pnpm`, `yarn`, or `bun` are also fully supported).*

---

## 2. Step-by-Step Installation Procedure

### Step 1: Open Terminal / Command Prompt
- **Windows**: Press `Win + R`, type `cmd` or `powershell`, and press Enter. (Or use Windows Terminal).
- **macOS**: Press `Cmd + Space`, type `Terminal`, and press Enter.
- **Linux**: Open your preferred shell terminal (e.g., `bash`, `zsh`).

### Step 2: Verify Node.js and npm
Run the following commands to confirm Node.js and npm are installed:
```bash
node -v
# Output should be v18.x.x, v20.x.x, or v22.x.x

npm -v
# Output should be v9.x.x or v10.x.x
```
*(If either command is unrecognized, download and run the installer from [nodejs.org](https://nodejs.org), making sure to check the option "Add to PATH").*

### Step 3: Clone or Extract the Project
If using Git:
```bash
git clone <your-repository-url> sewplan-aps
cd sewplan-aps
```
Or, if you downloaded a `.zip` archive:
1. Extract the folder to your preferred workspace (e.g., `C:\Projects\sewplan-aps` or `~/projects/sewplan-aps`).
2. Open terminal inside that directory:
```bash
cd sewplan-aps
```

### Step 4: Install Dependencies
Run the package installation command:
```bash
npm install
```
*This downloads all required libraries (React 19, Vite, Tailwind CSS v4, Lucide Icons, SheetJS XLSX exporter, etc.) into the `node_modules/` directory.*

### Step 5: Configure Environment Variables (Optional)
Copy `.env.example` to create `.env`:
```bash
# On Linux / macOS:
cp .env.example .env

# On Windows (Command Prompt):
copy .env.example .env

# On Windows (PowerShell):
Copy-Item .env.example .env
```
*(Note: For standard local running and planning operations, the application works 100% out of the box with zero external API dependencies).*

### Step 6: Start the Local Development Server
Execute:
```bash
npm run dev
```

You will see output similar to:
```text
  VITE v8.3.0  ready in 240 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.100:3000/
  ➜  press h + enter to show help
```

### Step 7: Open the Application in Your Browser
Open your browser and navigate to:
```text
http://localhost:3000
```

---

## 3. Architecture & Application Structure

### Frontend Stack:
- **Core Framework**: React 19 (SPA Architecture)
- **Build Tool & Dev Server**: Vite 8 (Hot Module Replacement, lightning fast build)
- **Language**: TypeScript 5+ (Strict Type Safety)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` engine)
- **Icons**: Lucide React
- **Export Engine**: SheetJS (`xlsx`) for binary Excel planning sheet generation

### Directory Layout:
```text
sewplan-aps/
├── index.html                 # HTML5 Entry Point
├── package.json               # Dependencies and build scripts
├── vite.config.ts             # Vite build & Tailwind configuration
├── tsconfig.json              # TypeScript compilation settings
├── DOCUMENTATION.md           # Full enterprise business logic & technical specification
├── README.md                  # This implementation & setup guide
├── src/
│   ├── main.tsx               # React root renderer
│   ├── App.tsx                # Main screen layout, view switcher & RBAC routing
│   ├── index.css              # Global styles & Tailwind CSS entry
│   ├── types/
│   │   └── index.ts           # Type definitions (SalesOrder, PlannedBlock, Workcenter, etc.)
│   ├── context/
│   │   └── PlanningContext.tsx# Reactive state engine & localStorage synchronization
│   ├── utils/
│   │   ├── planningEngine.ts  # Standard APS & AI Historical Scheduling Algorithms
│   │   ├── seeder.ts          # Generates initial 1,200 sales orders (5,000,000 pcs)
│   │   └── excelExporter.ts   # Formatted Excel sheet generation with KPI headers
│   └── components/
│       ├── Header.tsx         # Brand header, navigation bar, simulation banner & role toggle
│       ├── PlanningBoard.tsx  # Interactive Gantt chart (hours/days view, drag-ripple)
│       ├── AIPlanScreen.tsx   # AI Empirical Planning Workbench & Historical Matrix
│       ├── ProductionTableScreen.tsx # Shop-floor actuals logging table
│       ├── PlanningReportScreen.tsx  # Industrial planning report & Excel export
│       ├── WorkcenterPriorityScreen.tsx # Multi-tier category/buyer ranking
│       ├── WorkcenterAvailabilityScreen.tsx # Line splitting & cadre allocation
│       ├── WorkcenterShiftScreen.tsx # 9.83 hr shift master & working hours
│       ├── HolidayMasterScreen.tsx   # Friday weekly off & national festival calendar
│       ├── SourceDataScreen.tsx      # Sales Orders & RM PO tracking
│       ├── RescheduleModal.tsx       # Line transfer & timing adjustment modal
│       ├── RunPlanModal.tsx          # Dual-engine simulation modal (AI vs Standard APS)
│       └── SplitModal.tsx            # Quantity split modal across parallel sewing lines
```

---

## 4. How Local Data Persistence Works

1. **Automatic Master Seeding**:
   - On the very first launch, the application automatically seeds an enterprise dataset:
     - **1,200 Sales Orders** totaling exactly **5,000,000 garments** across 6 global buyers (Zara, H&M, Levi Strauss, Nike, Uniqlo, Gap).
     - **60 Sewing Lines** spanning Buildings A, B, and C with standard 43 operators.
     - **Raw Material POs** with in-house dates and delivery tracking.
     - **Shift Master**: Standard Day shift (08:00 - 18:50, 9.83 net working hours, 60m lunch break).
     - **Holiday Master**: Friday weekly off + Bangladesh garment export festival holidays.
2. **Persistent Local Storage**:
   - All changes (drag-and-drop moves, line splits, floor production logs, shift edits) are continuously saved in your browser's `localStorage` under key `sewplan_aps_data_v4`.
   - Refreshing or closing the browser will never lose your plan.
3. **Resetting Data**:
   - To reload the pristine default dataset at any time, click **Reset to Defaults** in the **Source Data** screen, or clear your browser's localStorage.

---

## 5. User Roles & Dedicated Views

The application provides two distinct operational modes:

### 1. Planner Mode (Full Controller):
- Full administrative access to all screens.
- Drag-and-drop Gantt bars with automatic adjacent ripple and time cascading.
- **Run Plan** and **AI Plan** engines.
- Access to Workcenter Priority, Availability, Shift Master, Holiday Master, and Production Table.

### 2. End-User Portal (View-Only):
- Switch via the **End User Portal** button in the header (or navigate to `http://localhost:3000/?role=enduser`).
- Menu is strictly restricted to:
  1. **Planning Board (View Only)**
  2. **Planning Report (View Only)**
- All editing features (drag-and-drop, quick shifts, splits) are locked.
- Clicking any block opens an **Inspection Dialog** with garment specs, Buyer PO, and shift timing.

---

## 6. Production Build & Deployment

### Building for Production
To create an optimized, minified production build:
```bash
npm run build
```
This generates a production-ready `/dist` folder containing bundled HTML, CSS, and JavaScript.

### Previewing the Production Build Locally
```bash
npm run preview
```
Runs a local web server serving the compiled `/dist` directory at `http://localhost:4173`.

### Deploying to a Web Server (e.g., Nginx, Apache, or Docker)
Simply copy the contents of the `dist/` directory to your web root:
- **Nginx configuration example**:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/sewplan-aps/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 7. How to Host This Project Online for Free (100% Free Hosting Guide)

Because SewPlan APS uses a **Self-Contained Internal Storage Engine** (in-memory scheduling algorithms + browser localStorage persistence), it has **zero dependency on external paid databases or backend server bills**. 

When you run `npm run build`, Vite bundles the application into pure static files inside the `dist/` directory. You can host it **100% free forever** on any of the following platforms:

### Universal Build Settings (Used Everywhere)
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---

### Option 1: Vercel (Recommended - Easiest & Fastest)
1. Push your project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of SewPlan APS"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/sewplan-aps.git
   git push -u origin main
   ```
2. Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
3. Click **"Add New..." > "Project"**, select your `sewplan-aps` repo, and click **Import**.
4. Vercel auto-detects `Vite`. Click **Deploy**.
5. Within 45 seconds, your site is live with a free SSL certificate (e.g., `https://sewplan-aps.vercel.app`)!
*(The included `vercel.json` already configures SPA routing rules).*

---

### Option 2: Netlify (Drag & Drop or Git)
- **Instant Drag & Drop (No Git needed)**:
  1. Run `npm run build` locally.
  2. Visit [https://app.netlify.com/drop](https://app.netlify.com/drop).
  3. Drag and drop the `dist` folder into the browser window.
  4. Your app is online immediately on a free `*.netlify.app` domain!
- **Via Git**:
  1. Connect your GitHub repository at [https://netlify.com](https://netlify.com).
  2. Set Build Command: `npm run build`, Publish directory: `dist`.
  3. Click **Deploy Site**.
*(The included `public/_redirects` file ensures all routes resolve to `index.html`).*

---

### Option 3: GitHub Pages (Free with your GitHub account)
1. In your project, create the file `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   permissions:
     contents: read
     pages: write
     id-token: write
   concurrency:
     group: "pages"
     cancel-in-progress: false
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: npm ci
         - run: npm run build
         - uses: actions/upload-pages-artifact@v3
           with:
             path: ./dist
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       needs: build
       steps:
         - id: deployment
           uses: actions/deploy-pages@v4
   ```
2. In your GitHub repo, go to **Settings > Pages > Source** and choose **GitHub Actions**.
3. Every commit pushed to `main` will automatically build and publish your site!

---

### Option 4: Cloudflare Pages
1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com) > **Workers & Pages**.
2. Click **Create Application > Pages > Connect to Git**.
3. Select repo, set framework to **Vite**, build command to `npm run build`, and output to `dist`.
4. Click **Save and Deploy** to publish across Cloudflare's global edge network.

---

### Custom Domains & Free HTTPS
All 4 providers support connecting your own custom domain (e.g. `planner.yourcompany.com`) at **zero cost**, complete with free auto-renewing Let's Encrypt SSL certificates.

---

## 8. Useful NPM Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server on port 3000 |
| `npm run build` | Compiles TypeScript and creates production build in `dist/` |
| `npm run preview`| Previews the production build locally |
| `npm run lint` | Runs TypeScript type-checker (`tsc --noEmit`) to verify zero errors |
| `npm run clean` | Deletes `dist/` and build artifacts |

---

## 9. Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `Port 3000 is in use` | Another app is running on port 3000 | Kill process or run `npx vite --port=3001` |
| `npm: command not found` | Node.js is not installed or not in PATH | Install Node.js from [nodejs.org](https://nodejs.org) and restart terminal |
| Changes not showing | Browser cache | Hard refresh using `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac) |
| TypeScript build error | Node version mismatch | Ensure Node.js version is 18.18+ or 20+ (`node -v`) |

