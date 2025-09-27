

<div align="center">


# 🧬 eDNA Explorer

**Interactive, modern dashboard for exploring environmental DNA (eDNA) biodiversity data**


✨ **Clean UX, instant feedback, and exportable insights for biodiversity analysis**

</div>

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🚀 **Performance**
- ⚡ **Instant analysis** - Upload and get insights in seconds
- 📊 **Real-time processing** - Live data visualization
- 🎯 **Optimized algorithms** - Fast biodiversity calculations

</td>
<td width="50%">

### 🔬 **Science-Ready**
- 🧪 **eDNA workflows** - Built for environmental DNA analysis
- 📈 **Advanced metrics** - Comprehensive biodiversity KPIs
- 🔍 **Data validation** - Quality checks and error handling

</td>
</tr>
<tr>
<td width="50%">

### 🎨 **User Experience**
- 💫 **Modern UI** - Clean, intuitive interface
- 📱 **Responsive design** - Works on all devices
- 🎛️ **Interactive dashboards** - Customizable views

</td>
<td width="50%">

### 📤 **Export & Share**
- 📥 **Multiple formats** - CSV, JSON, PDF reports
- 🖼️ **Visual exports** - High-quality charts and graphs
- 🔗 **Easy sharing** - Direct link generation

</td>
</tr>
</table>

---

 

## 🛠️ Tech Stack

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

</div>

<div align="center">

<table>
  <thead>
    <tr>
      <th style="text-align:center">Category</th>
      <th style="text-align:center">Technology</th>
      <th style="text-align:center">Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:center">🎨 <strong>Frontend</strong></td>
      <td style="text-align:center">React </td>
      <td style="text-align:center">Component-based UI framework</td>
    </tr>
    <tr>
      <td style="text-align:center">📝 <strong>Language</strong></td>
      <td style="text-align:center">TypeScript </td>
      <td style="text-align:center">Type-safe development</td>
    </tr>
    <tr>
      <td style="text-align:center">⚡ <strong>Build Tool</strong></td>
      <td style="text-align:center">Vite</td>
      <td style="text-align:center">Fast development & building</td>
    </tr>
    <tr>
      <td style="text-align:center">🎨 <strong>Styling</strong></td>
      <td style="text-align:center">Tailwind CSS</td>
      <td style="text-align:center">Utility-first CSS framework</td>
    </tr>
    <tr>
      <td style="text-align:center">🧩 <strong>UI Components</strong></td>
      <td style="text-align:center">shadcn/ui</td>
      <td style="text-align:center">Pre-built accessible components</td>
    </tr>
    <tr>
      <td style="text-align:center">📊 <strong>Charts</strong></td>
      <td style="text-align:center">Custom utilities</td>
      <td style="text-align:center">Lightweight data visualization</td>
    </tr>
  </tbody>
  </table>

</div>

---

## 🚀 Quick Start

### Prerequisites

- 📦 **Node.js**  ([Download](https://nodejs.org/))
- 📦 **npm** or **yarn** or **pnpm**

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/edna-explorer.git
cd edna-explorer

# Install dependencies
npm install

# Start development server
npm run dev
```


### Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Deployment

### Option 1: Vercel (Recommended) 🚀

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/edna-explorer)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → Import your repository

2. **Configure Settings**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Deploy** → Live at `https://your-project.vercel.app`

### Option 2: Netlify 🌐

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/edna-explorer)

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment: `NODE_VERSION=18`

3. **Deploy** → Live at `https://your-site.netlify.app`

---

### Project Structure

```text
edna-explorer-main/
├─ public/
│  ├─ DNAicon.ico
│  └─ placeholder.svg
├─ src/
│  ├─ assets/
│  │  └─ hero-edna-analysis.jpg
│  ├─ components/
│  │  ├─ eDNA/
│  │  │  ├─ BiodiversityDashboard.tsx
│  │  │  ├─ DataProcessor.tsx
│  │  │  ├─ ExportResults.tsx
│  │  │  └─ FileUpload.tsx
│  │  └─ ui/ (shadcn/ui components)
│  ├─ pages/
│  │  ├─ Index.tsx
│  │  └─ NotFound.tsx
│  ├─ App.tsx
│  └─ main.tsx
├─ index.html
└─ README.md
```

---

### Usage Guide

1) Launch the dev server.
2) Go to the main page (`Index.tsx`).
3) Use the **File Upload** to add your eDNA dataset (supported formats depend on your implementation of `FileUpload.tsx`).
4) The **Data Processor** will compute key biodiversity metrics.
5) Explore results in the **Biodiversity Dashboard** (charts, tables, summaries).
6) Use **Export Results** to save outputs for reporting.

Key modules:

- `src/components/eDNA/FileUpload.tsx`: Handles file ingestion.
- `src/components/eDNA/DataProcessor.tsx`: Parses and processes dataset.
- `src/components/eDNA/BiodiversityDashboard.tsx`: Renders insights and charts.
- `src/components/eDNA/ExportResults.tsx`: Exports data/visuals.

---

### Theming and UI

Styles are powered by Tailwind (`tailwind.config.ts`, `src/index.css`). UI primitives are in `src/components/ui/` using shadcn/ui patterns. Customize tokens, spacing, and colors via Tailwind config and component props.

---



### 📋 Guidelines

- 🎨 Follow the existing code style and conventions
- 📝 Write clear commit messages
- 🧪 Test your changes thoroughly
- 📖 Update documentation if needed
- 🐛 Report bugs using GitHub Issues

---


