# How to Upload GMPI ASN Portal to GitHub

A step-by-step guide for uploading this project as a portfolio piece.

---

## Step 1 — Create a GitHub Account (if you don't have one)

1. Go to [https://github.com](https://github.com)
2. Click **Sign up**
3. Use your email and create a username (e.g. `michael-gmpi` or your own name)
4. Verify your email

---

## Step 2 — Create a New Repository

1. After logging in, click the **+** icon (top-right) → **New repository**
2. Fill in the details:
   - **Repository name:** `gmpi-asn-portal`
   - **Description:** `GMPI Delivery Management System — ASN Portal built with Google Apps Script and Firebase Firestore`
   - **Visibility:** `Public` ✅ *(required for portfolio)*
   - ✅ Check **Add a README file**
3. Click **Create repository**

---

## Step 3 — Install Git (if not installed)

1. Go to [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Download and install Git for Windows
3. During install, keep all defaults and click Next through everything
4. When done, open **Command Prompt** or **PowerShell** and type:
   ```
   git --version
   ```
   You should see something like `git version 2.x.x`

---

## Step 4 — Configure Git (first time only)

Open PowerShell and run these two commands (replace with your name and email):

```powershell
git config --global user.name "Michael Cadungog"
git config --global user.email "whsmanager.gmpi@gmail.com"
```

---

## Step 5 — Initialize the Project Folder

Open PowerShell and navigate to the project folder:

```powershell
cd "C:\Users\WHS Manager\Desktop\Zoro\TreasureChest\GMPI\ASN Portal"
```

Then run:

```powershell
git init
git add .
git commit -m "Initial commit: GMPI ASN Portal v7"
```

---

## Step 6 — Connect to GitHub and Push

1. Go to your new repository on GitHub
2. Copy the repository URL — it looks like:
   ```
   https://github.com/YOUR-USERNAME/gmpi-asn-portal.git
   ```
3. Back in PowerShell, run:
   ```powershell
   git remote add origin https://github.com/YOUR-USERNAME/gmpi-asn-portal.git
   git branch -M main
   git push -u origin main
   ```
4. A login window will pop up — sign in with your GitHub account

---

## Step 7 — Update the README on GitHub

1. Go to your repository on GitHub
2. Click the **README.md** file → click the ✏️ pencil icon to edit
3. Replace the contents with something like:

```markdown
# GMPI ASN Portal
**Delivery Management System** — Grand Majesty Pharmaceutical, Inc.

## About
A full-stack web application built on Google Apps Script (GAS) and Firebase Firestore
for managing Advanced Shipment Notifications (ASNs), delivery personnel,
lead times, and sales portal access.

## Features
- 🔐 Multi-role login (Dispatcher, Personnel, Sales, Customer)
- 📦 ASN creation, tracking, and manifest generation
- 👥 User management with superadmin controls
- 📊 Lead time and SLA tracking
- 📍 Live delivery tracker
- 📤 Excel export (SI Staging, SO Lines)

## Tech Stack
- Google Apps Script (backend + hosting)
- Firebase Firestore (database)
- Vanilla JavaScript, HTML, CSS
- SheetJS (Excel export)

## Live App
[Open GMPI ASN Portal](https://script.google.com/macros/s/AKfycbzqDYfrD4aHx4rjWuXcVQI6OiZwI6c5P_1I-x-4wy3aXNuuR2LWFmiyXMyYsS8jUXBk/exec)

## Author
Michael Cadungog — Warehouse Manager, GMPI
```

4. Click **Commit changes**

---

## Step 8 — For Future Updates

Whenever you make changes to the portal and want to sync GitHub:

```powershell
cd "C:\Users\WHS Manager\Desktop\Zoro\TreasureChest\GMPI\ASN Portal"
git add .
git commit -m "Brief description of what changed"
git push
```

---

## ✅ Done!

Your portfolio repository will be live at:
```
https://github.com/YOUR-USERNAME/gmpi-asn-portal
```

Share this link on your resume or LinkedIn under **Projects**. 🎉
