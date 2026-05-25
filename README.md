# 📦 GMPI ASN Portal
### Advanced Shipment Notification & Delivery Management System
**Grand Majesty Pharmaceutical, Inc. — Warehouse Operations**

---

## 🌐 Live App
> **[Open GMPI ASN Portal](https://script.google.com/macros/s/AKfycbzqDYfrD4aHx4rjWuXcVQI6OiZwI6c5P_1I-x-4wy3aXNuuR2LWFmiyXMyYsS8jUXBk/exec)**

---

## 📌 About

The GMPI ASN Portal is a **custom-built, full-stack web application** designed to digitize and streamline the delivery operations of Grand Majesty Pharmaceutical, Inc. Built entirely in-house with zero licensing cost, it replaces manual spreadsheet tracking with a real-time, role-based delivery management system.

This project was conceived, designed, and developed by the **Warehouse Manager** to address accountability gaps, manual SLA monitoring, and the lack of customer visibility in the company's delivery chain.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 Multi-Role Login | Separate portals for Superadmin, Dispatcher, Delivery, Sales, and Customer |
| 📦 ASN Management | Create, track, assign, release, and close shipment notifications |
| 📤 SI Data Upload | Upload Excel files to auto-generate ASNs grouped by route and customer |
| 👥 Personnel Assignment | Assign delivery staff with automatic ETA calculation based on lead times |
| 📍 Live Delivery Tracker | Real-time status board for active runs and pending deliveries |
| 🏪 Customer Self-Service | Customers check their own delivery status using their customer code |
| 💼 Sales Portal | Sales team tracks order and delivery progress via shared PIN |
| 📊 Reports & Export | Export SI Staging and SO Lines to Excel via SheetJS |
| 👑 User Management | Superadmin can add, edit, reset, activate/deactivate dispatcher accounts |
| 🔒 Security | SHA-256 hashed passwords, forced first-login password change, role-based visibility |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              Browser (Client)                │
│         GMPI ASN V7.html (SPA)              │
│   Vanilla JS · HTML · CSS · No frameworks   │
└──────────────────┬──────────────────────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
┌──────▼──────┐       ┌────────▼────────┐
│  Google     │       │    Firebase      │
│  Apps Script│       │    Firestore     │
│  (Backend / │       │  (Database /     │
│   Hosting)  │       │   Real-time)     │
└─────────────┘       └─────────────────┘
```

---

## 👥 User Roles

### 🛡️ Superadmin
- Full system access
- Manage all user accounts (add, edit, reset password, activate/deactivate)
- Configure settings, PINs, lead times, and personnel

### 📋 Dispatcher
- Upload SI staging data (Excel)
- Generate and manage ASNs
- Assign delivery personnel and release dates
- Release runs and monitor delivery tracker

### 🚚 Delivery Personnel
- View assigned runs and ASN details
- Record departure and arrival
- Log delivery expenses

### 💼 Sales
- View order and delivery status
- PIN-protected shared access
- Read-only

### 🏪 Customer
- Self-service delivery lookup
- No account required — access via customer code

---

## 🔐 Security

- **SHA-256 password hashing** with salt — plain-text passwords never stored
- **Forced password change** on first login for all new accounts
- **Role-based access control** — each role sees only what they need
- **Account deactivation** — instant access revocation by superadmin
- **Firebase Firestore** — Google enterprise-grade cloud database

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Google Apps Script (GAS) |
| Database | Firebase Firestore (NoSQL) |
| Hosting | Google Apps Script Web App |
| Excel Export | SheetJS (xlsx) |
| Password Security | Web Crypto API (SHA-256) |
| QR Code | Google Charts API |

---

## 📁 Project Structure

```
gmpi-asn-portal/
├── GMPI ASN V7.html                    # Main portal (single-page app)
├── Code.js                             # GAS backend (doGet, data functions)
├── Index.html                          # GAS entry point
├── Firebase_Migration.html             # Migration & seed tool
├── ASN_Export.html                     # Firestore export to Excel
├── GMPI_ASN_Portal_Work_Instruction.html  # User guide
├── GMPI_ASN_QR.html                    # Printable QR code access card
├── GMPI_ASN_Presentation.html          # Management presentation deck
├── ASN V7 Bootstrap Guide.md          # First-time setup guide
├── appsscript.json                     # GAS manifest
├── .claspignore                        # Clasp ignore rules
└── .gitignore                          # Git ignore rules
```

---

## 🚀 Getting Started

### Prerequisites
- A Google account
- A Firebase project (Firestore enabled)
- [Clasp CLI](https://github.com/google/clasp) (for deployment)

### First-Time Setup
1. Clone or download this repository
2. Update Firebase config in `GMPI ASN V7.html` and `Firebase_Migration.html`
3. Deploy to Google Apps Script via `clasp push` and `clasp deploy`
4. Open `Firebase_Migration.html` → click **Seed WHS-MGR Superadmin**
5. Log in with `WHS-MGR` / `GMPI@2026` and change your password
6. Go to **Settings** to configure Lead Times, Personnel, PINs, and Users

See [`ASN V7 Bootstrap Guide.md`](ASN%20V7%20Bootstrap%20Guide.md) for the full setup walkthrough.

---

## 📸 Screenshots

> *Coming soon — portal walkthrough screenshots*

---

## 👨‍💼 Author

**Michael Ryan Cadungog**
Warehouse Manager — Grand Majesty Pharmaceutical, Inc.
📧 michaelryancadungog@gmail.com

---

## 📄 License

This project was built for internal use at GMPI. All rights reserved.

---

*Built with 💛 using Google Apps Script and Firebase — zero licensing cost, 100% owned by GMPI.*
