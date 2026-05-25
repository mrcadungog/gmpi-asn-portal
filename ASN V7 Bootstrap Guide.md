# ASN V7 Bootstrap Guide
*Run this once to go live on GMPI ASN V7.html*

Related: [[GMPI/ASN Portal/ASN Notes]] · [[GMPI/Firebase Migration Plan]]

---

## What you need
- `Firebase_Migration.html` — open via GAS Web App (or browser if hosted)
- `GMPI ASN V7.html` — deployed as GAS Web App (replace V6's doGet)

---

## 🛠 GAS Code Update (do this first)

> You only copy-paste — no new functions to write. The backend logic stays the same.

### Files to update in Google Apps Script (script.google.com):

| Local file | GAS file name | What changed |
|---|---|---|
| `Code_v6.gs` | `Code` | `doGet()` now serves `GMPI ASN V7` by default; V6 accessible via `?v=6` |
| `GMPI ASN V7.html` | `GMPI ASN V7` *(new file)* | The new portal — add as a new HTML file in GAS |
| `Firebase_Migration.html` | `Firebase_Migration` | Added 👑 Seed Superadmin button |

### Steps in GAS editor:
1. Open your GAS project → **script.google.com**
2. **Add new file** → HTML → name it exactly `GMPI ASN V7` → paste the full content of `GMPI ASN V7.html`
3. **Open `Code.gs`** → find the `doGet()` function → replace it with the updated version from `Code_v6.gs`
4. **Open `Firebase_Migration.html`** in GAS → replace with updated local file content
5. Click **Deploy → Manage Deployments → Edit** → bump the version → **Deploy**

> V6 is still accessible as a backup at your Web App URL + `?v=6` until you're confident V7 is stable.

---

## Step 1 — Set Emergency Dispatch PIN
1. Open **Firebase_Migration.html**
2. Scroll to **"🔐 Set Dispatch PIN"** section
3. Type the PIN you want for emergency access
4. Click **Set PIN** → wait for green ✓

> This PIN is the fallback login for emergencies (bypasses individual user accounts).

---

## Step 2 — Seed Superadmin Account
1. Still on **Firebase_Migration.html**
2. Click **"👑 Seed WHS-MGR Superadmin"**
3. Wait for green ✓
4. Default credentials created: Code = `WHS-MGR` / Password = `GMPI@2026`

> If WHS-MGR already exists, it will ask you to confirm overwrite.

---

## Step 3 — First Login + Change Password
1. Open **GMPI ASN V7.html**
2. Choose **"Dispatcher Login"**
3. Code: `WHS-MGR` / Password: `GMPI@2026`
4. You will be **forced to set a new password** — do this now

---

## Step 4 — Add Dispatchers
1. Go to **Settings → 👥 Users tab** (visible only to superadmin)
2. Click **Add Dispatcher**
3. Fill in: Employee Code, Name, Role (dispatcher / superadmin)
4. Default password for new accounts: `GMPI@2026` — they change it on first login

---

## Step 5 — Migrate Reference Data (optional but recommended)
1. Go back to **Firebase_Migration.html**
2. Click **▶ Run Migration**
3. This migrates: Personnel list + Lead Times from Google Sheets to Firestore
4. PIN is already set (Step 1), so it won't overwrite it

---

## Step 6 — Upload SI Data
- Go to **GMPI ASN V7.html → Dispatch → Upload tab**
- Upload `Workbook1_1_Checked.xlsx` (the "FOR UPLOAD" rows — ~10,341 records)
- Uploads in batches of 500 automatically

---

## Notes
- **V7 replaces V6** — update the GAS Web App `doGet()` to serve `GMPI ASN V7.html`
- **V6 GAS backend (Code_v6.gs) stays** — V7 still calls the same GAS functions
- **Emergency PIN** ≠ dispatcher password — it's a separate shared override
- Sales PIN is set in **Settings → 🔑 Sales PIN tab** after logging in as superadmin
