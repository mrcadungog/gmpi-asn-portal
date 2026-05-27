// ================================================================
// GMPI ASN PORTAL — Code.gs v4
// Grand Majesty Pharmaceutical Inc. | 2026
// Change Request: CR-001 — Stops Restructure, In-Transit Trigger,
//   Control Number Selection, Null Guards, Personnel Fix, Export
// ================================================================

const PROP_CFG_ID    = 'CONFIG_SHEET_ID';
const TAB_SETTINGS   = 'Settings';
const TAB_PERSONNEL  = 'Personnel';
const TAB_LEADTIME   = 'Route_Leadtime';
const TAB_ASN        = 'ASN_Master';
const TAB_LINES      = 'SO_Lines';
const TAB_TAGS       = 'Delivery_Tags';
const TAB_PHOTOS     = 'POD_Photos';
const TAB_SI         = 'SI_Staging';
const TAB_ARCH_IDX   = 'Archive_Index';

const LEAD_TIME_DATA = [
  ['NEGROS NORTH1',          'NEGROS NORTH',           4, 6],
  ['NEGROS NORTH2',          'NEGROS NORTH',           5, 7],
  ['NEGROS NORTH3',          'NEGROS NORTH',           5, 7],
  ['NEGROS SOUTH1',          'NEGROS SOUTH',           3, 5],
  ['NEGROS SOUTH2',          'NEGROS SOUTH',           4, 6],
  ['NEGROS SOUTH3',          'NEGROS SOUTH',           4, 6],
  ['NEGROS SOUTH4',          'NEGROS SOUTH',           4, 6],
  ['NEGROS SOUTH6',          'NEGROS SOUTH',           1, 3],
  ['CC NORTH INBASE',        'CEBU NORTH INBASE',      1, 3],
  ['CEBU NORTH INBASE',      'CEBU NORTH INBASE',      1, 3],
  ['CEBU SOUTH INBASE',      'CEBU SOUTH INBASE',      1, 3],
  ['NORTHMIN1',              'NORTH MINDANAO',         7, 9],
  ['NORTHMIN2',              'NORTH MINDANAO',         7, 9],
  ['SOUTHMIN1',              'SOUTH MINDANAO',         5, 7],
  ['SOUTHMIN2',              'SOUTH MINDANAO',         3, 5],
  ['SOUTHMIN4',              'SOUTH MINDANAO',         4, 6],
  ['SOUTH MIN5',             'SOUTH MINDANAO',         7, 9],
  ['SAMAR1',                 'SAMAR',                  4, 6],
  ['SAMAR2',                 'SAMAR',                  5, 7],
  ['SAMAR3',                 'SAMAR',                  6, 8],
  ['BOHOL',                  'BOHOL',                  4, 6],
  ['LAPULAPU/CORDOVA',       'LAPULAPU/CORDOVA',       1, 3],
  ['LEYTE 1',                'LEYTE',                  4, 6],
  ['LEYTE NORTH',            'LEYTE NORTH',            4, 6],
  ['LEYTE SOUTH',            'LEYTE SOUTH',            4, 6],
  ['CC SOUTH INBASE',        'CEBU SOUTH INBASE',      1, 3],
  ['CEBU SOUTH OUTBASE',     'CEBU SOUTH OUTBASE',     3, 5],
  ['CEBU SOUTHWEST OUTBASE', 'CEBU SOUTHWEST OUTBASE', 2, 4],
  ['CEBU NORTH OUTBASE',     'CEBU NORTH OUTBASE',     3, 5],
  ['ILOILO WAREHOUSE',       'ILOILO BRANCH TRANSFER', 3, 5],
  ['MASBATE1',               'MASBATE1',               1, 3],
  ['PANAY1',                 'PANAY',                  3, 5],
  ['PANAY2',                 'PANAY',                  3, 5],
  ['PANAY3',                 'PANAY',                  3, 5],
  ['PANAY4',                 'PANAY',                  3, 5],
  ['PANAY5',                 'PANAY',                  3, 5],
  ['PANAY6',                 'PANAY',                  3, 5],
  ['PANAY7',                 'PANAY',                  3, 5],
  ['LUZON1',                 'LUZON',                  1, 3]
];

// ── Entry Point ─────────────────────────────────────────────────

function doGet(e) {
  if (e && e.parameter && e.parameter.migrate === '1') {
    return HtmlService.createHtmlOutputFromFile('Firebase_Migration')
      .setTitle('GMPI Firebase Migration')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  if (e && e.parameter && e.parameter.export === '1') {
    return HtmlService.createHtmlOutputFromFile('ASN_Export')
      .setTitle('GMPI Data Export')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  // V6 fallback: ?v=6
  if (e && e.parameter && e.parameter.v === '6') {
    return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('GMPI ASN Portal (V6)')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width,initial-scale=1.0,maximum-scale=1.0');
  }
  // V7 — default (v58: AUTO_ROLE injected via GAS template scriptlet from ?role= param)
  var role = (e && e.parameter && e.parameter.role) ? e.parameter.role.replace(/[^a-z]/g, '') : '';
  var tpl = HtmlService.createTemplateFromFile('GMPI ASN V7');
  tpl.autoRole = role;
  return tpl.evaluate()
    .setTitle('GMPI ASN Portal')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width,initial-scale=1.0,maximum-scale=1.0');
}

// ── One-Time Initialization ─────────────────────────────────────

function initializeApp() {
  const existing = PropertiesService.getScriptProperties().getProperty(PROP_CFG_ID);
  if (existing) {
    console.log('Already initialized. Config Sheet ID: ' + existing);
    console.log('Delete CONFIG_SHEET_ID from Script Properties to re-initialize.');
    return { ok: false, msg: 'Already initialized.' };
  }
  const folder = DriveApp.createFolder('GMPI ASN Portal');
  const cfg    = SpreadsheetApp.create('GMPI_Config');
  DriveApp.getFileById(cfg.getId()).moveTo(folder);

  const sett = cfg.getActiveSheet().setName(TAB_SETTINGS);
  sett.appendRow(['Key', 'Value', 'Updated_At']);
  sett.appendRow(['DISPATCH_PIN',      _hash('GMPI2026'), _now()]);
  sett.appendRow(['ACTIVE_ASN_ID',     '',                _now()]);
  sett.appendRow(['POD_FOLDER_ID',     '',                _now()]);
  sett.appendRow(['ARCHIVE_FOLDER_ID', '',                _now()]);
  sett.appendRow(['APP_VERSION',       '6.0.0',           _now()]);

  const pers = cfg.insertSheet(TAB_PERSONNEL);
  pers.appendRow(['Code', 'Name', 'Contact', 'Created_At', 'Active']);

  const lt = cfg.insertSheet(TAB_LEADTIME);
  lt.appendRow(['Route', 'Cluster', 'Dispatch_SLA', 'Order_SLA', 'Updated_At']);
  if (LEAD_TIME_DATA.length) {
    lt.getRange(2, 1, LEAD_TIME_DATA.length, 5)
      .setValues(LEAD_TIME_DATA.map(r => [...r, _now()]));
  }
  // Archive index tab
  const archIdx = cfg.insertSheet(TAB_ARCH_IDX);
  archIdx.appendRow(['Control_No','Released_Date','Route','Archive_File_ID','Archive_File_Name','Archived_At']);

  PropertiesService.getScriptProperties().setProperty(PROP_CFG_ID, cfg.getId());

  const asn = SpreadsheetApp.create('GMPI_ASN_Active');
  DriveApp.getFileById(asn.getId()).moveTo(folder);
  asn.getActiveSheet().setName(TAB_ASN).appendRow([
    'ASN_ID','Created','Status','Cust_Name','Cust_Code','Cust_Address',
    'Route','Control_No','Released_Date','Expected_Delivery',
    'Truck_Plate','Personnel_Name','Personnel_Code','Personnel_Contact',
    'Void_Reason','Published_At'
  ]);
  asn.insertSheet(TAB_LINES).appendRow([
    'Line_ID','ASN_ID','Stop_No','SO_No','SI_No',
    'Item_Code','Item_Name','Qty','UOM','Lowest_Qty','Lowest_UOM',
    'Unit_Price','Line_Total','Cases','Bags','Free_Goods',
    'Deliv_Instr','Recv_From','Recv_To','MOP','Remarks','Group_Name','Branch'
  ]);
  asn.insertSheet(TAB_TAGS).appendRow([
    'Tag_ID','ASN_ID','SI_No','Personnel_Code','Personnel_Name',
    'Del_Status','Reason','Recipient','Deliv_TS','Sync_TS','Offline'
  ]);
  asn.insertSheet(TAB_PHOTOS).appendRow([
    'Photo_ID','Tag_ID','ASN_ID','File_ID','Drive_URL','Uploaded_At'
  ]);
  asn.insertSheet(TAB_SI).appendRow([
    'Posting_Date','SI_Number','Cust_Code','Cust_Name','Route',
    'Address','Group_Name','Item_Code','Item_Name','Quantity',
    'UOM','Lowest_Qty','Lowest_UOM','Unit_Price','Line_Total',
    'Branch','Del_Status','Tagged_By','Tagged_At','Archived'
  ]);

  const podFolder     = folder.createFolder('GMPI_POD_Photos');
  const archiveFolder = folder.createFolder('GMPI_ASN_Archives');
  _setCfg('ACTIVE_ASN_ID',     asn.getId());
  _setCfg('POD_FOLDER_ID',     podFolder.getId());
  _setCfg('ARCHIVE_FOLDER_ID', archiveFolder.getId());

  console.log('✅ Initialization complete! Default PIN: GMPI2026');
  return { ok: true, folderId: folder.getId(), cfgId: cfg.getId(), asnId: asn.getId() };
}

// ── Triggers ────────────────────────────────────────────────────

function setupArchiveTrigger() {
  ['archiveMonthly','archiveSIQuarterly'].forEach(fn => {
    ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === fn)
             .forEach(t => ScriptApp.deleteTrigger(t));
  });
  ScriptApp.newTrigger('archiveMonthly').timeBased().onMonthDay(1).atHour(0).nearMinute(0).create();
  ScriptApp.newTrigger('archiveSIQuarterly').timeBased().onMonthDay(1).atHour(1).nearMinute(0).create();
  console.log('✅ Triggers set.');
  return { ok: true };
}

// ── Private Helpers ─────────────────────────────────────────────

function _now()  { return new Date().toISOString(); }

function _hash(s) {
  const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s + 'GMPI_SALT_2026');
  return b.map(x => ('0' + (x & 0xFF).toString(16)).slice(-2)).join('');
}

function _id(pfx) {
  const d = Utilities.formatDate(new Date(), 'Asia/Manila', 'yyyyMMdd');
  return `${pfx}-${d}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
}

function _cfgSS() {
  const id = PropertiesService.getScriptProperties().getProperty(PROP_CFG_ID);
  if (!id) throw new Error('Config not found. Run initializeApp() first.');
  return SpreadsheetApp.openById(id);
}

function _asnSS() {
  const id = _getCfg('ACTIVE_ASN_ID');
  if (!id) throw new Error('ACTIVE_ASN_ID not set in Config.');
  return SpreadsheetApp.openById(id);
}

function _getCfg(key) {
  const d = _cfgSS().getSheetByName(TAB_SETTINGS).getDataRange().getValues();
  for (let i = 1; i < d.length; i++) if (d[i][0] === key) return d[i][1];
  return null;
}

function _setCfg(key, val) {
  const sh = _cfgSS().getSheetByName(TAB_SETTINGS);
  const d  = sh.getDataRange().getValues();
  for (let i = 1; i < d.length; i++) {
    if (d[i][0] === key) { sh.getRange(i+1,2,1,2).setValues([[val,_now()]]); return; }
  }
  sh.appendRow([key, val, _now()]);
}

function _rows(ss, tab) {
  const sh = ss.getSheetByName(tab);
  const d  = sh ? sh.getDataRange().getValues() : [];
  if (d.length < 2) return [];
  const h = d[0];
  return d.slice(1).map(r => Object.fromEntries(h.map((k, i) => {
    let v = r[i];
    if (v instanceof Date) v = Utilities.formatDate(v, 'Asia/Manila', "yyyy-MM-dd'T'HH:mm:ss");
    if (v === null || v === undefined) v = '';
    return [k, v];
  })));
}

function _setField(id, col, val) {
  const sh = _asnSS().getSheetByName(TAB_ASN);
  if (!sh) throw new Error('Sheet ' + TAB_ASN + ' not found.');
  const d  = sh.getDataRange().getValues();
  const ci = d[0].indexOf(col);
  if (ci < 0) throw new Error('Column not found: ' + col);
  for (let i = 1; i < d.length; i++) {
    if (String(d[i][0]) === String(id)) { sh.getRange(i+1, ci+1).setValue(val); return true; }
  }
  return false;
}

// ── Cache Helpers ────────────────────────────────────────────────

function _cache(key, fn, ttl) {
  const c = CacheService.getScriptCache();
  const hit = c.get(key);
  if (hit) { try { return JSON.parse(hit); } catch(e) {} }
  const val = fn();
  try { c.put(key, JSON.stringify(val), ttl); } catch(e) {}
  return val;
}

function _cacheDrop() {
  const keys = [].slice.call(arguments).filter(Boolean);
  if (keys.length) CacheService.getScriptCache().removeAll(keys);
}

// ── Authentication ──────────────────────────────────────────────

function validatePin(pin) {
  try   { return { ok: _hash(pin) === _getCfg('DISPATCH_PIN') }; }
  catch (e) { return { ok: false, err: e.message }; }
}

function changePin(cur, nw) {
  if (_hash(cur) !== _getCfg('DISPATCH_PIN')) return { ok: false, msg: 'Current PIN is incorrect.' };
  if (!nw || nw.length < 6) return { ok: false, msg: 'New PIN must be at least 6 characters.' };
  _setCfg('DISPATCH_PIN', _hash(nw));
  return { ok: true };
}

// CR-007: Null guard + case-insensitive trim
function validatePersonnel(code) {
  try {
    const codeStr = String(code).trim().toUpperCase();
    const sh = _cfgSS().getSheetByName(TAB_PERSONNEL);
    if (!sh) return { ok: false, msg: 'Personnel sheet not found. Contact administrator.' };
    const d = sh.getDataRange().getValues();
    for (let i = 1; i < d.length; i++) {
      if (String(d[i][0]).trim().toUpperCase() === codeStr && d[i][4] === true)
        return { ok: true, name: String(d[i][1]), contact: String(d[i][2] || ''), code: codeStr };
    }
    return { ok: false };
  } catch (e) { return { ok: false, err: e.message }; }
}

function validateCustomer(code) {
  try {
    const codeStr = String(code).trim().toUpperCase();
    const match = _rows(_asnSS(), TAB_ASN)
      .find(r => String(r.Cust_Code).trim().toUpperCase() === codeStr && r.Status !== 'Voided');
    return match ? { ok: true, name: String(match.Cust_Name) } : { ok: false };
  } catch (e) { return { ok: false, err: e.message }; }
}

// ── Personnel Management ────────────────────────────────────────

function getPersonnel() {
  return _cache('gasn_personnel', function() {
    try {
      const sh = _cfgSS().getSheetByName(TAB_PERSONNEL);
      if (!sh) return { ok: false, msg: 'Personnel sheet not found.' };
      const d = sh.getDataRange().getValues().slice(1)
        .filter(r => r[4] === true)
        .map(r => ({ code: String(r[0]), name: String(r[1]), contact: String(r[2] || '') }));
      return { ok: true, personnel: d };
    } catch (e) { return { ok: false, err: e.message }; }
  }, 1800);
}

// CR-006: Null guard
function addPersonnel(code, name, contact) {
  try {
    const codeStr = String(code).trim().toUpperCase();
    const sh = _cfgSS().getSheetByName(TAB_PERSONNEL);
    if (!sh) return { ok: false, msg: 'Personnel sheet not found. Contact administrator.' };
    const d  = sh.getDataRange().getValues();
    if (d.slice(1).some(r => String(r[0]).trim().toUpperCase() === codeStr))
      return { ok: false, msg: 'Personnel code already exists.' };
    sh.appendRow([codeStr, name, contact || '', _now(), true]);
    _cacheDrop('gasn_personnel');
    return { ok: true };
  } catch (e) { return { ok: false, err: e.message }; }
}

// CR-006: Null guard
function removePersonnel(code) {
  try {
    const codeStr = String(code).trim().toUpperCase();
    const sh = _cfgSS().getSheetByName(TAB_PERSONNEL);
    if (!sh) return { ok: false, msg: 'Personnel sheet not found. Contact administrator.' };
    const d  = sh.getDataRange().getValues();
    for (let i = 1; i < d.length; i++) {
      if (String(d[i][0]).trim().toUpperCase() === codeStr) {
        sh.getRange(i+1, 5).setValue(false);
        _cacheDrop('gasn_personnel');
        return { ok: true };
      }
    }
    return { ok: false, msg: 'Personnel not found.' };
  } catch (e) { return { ok: false, err: e.message }; }
}

// ── Lead Time Masterfile ────────────────────────────────────────

function getLeadTimes() {
  return _cache('gasn_leadtimes', function() {
    try { return { ok: true, leadTimes: _rows(_cfgSS(), TAB_LEADTIME) }; }
    catch (e) { return { ok: false, err: e.message }; }
  }, 1800);
}

function getLeadTimeByRoute(route) {
  try {
    const match = _rows(_cfgSS(), TAB_LEADTIME)
      .find(r => String(r.Route).trim().toUpperCase() === String(route).trim().toUpperCase());
    return match ? { ok: true, data: match } : { ok: false, msg: 'Route not found.' };
  } catch (e) { return { ok: false, err: e.message }; }
}

function saveLeadTime(route, cluster, dispatchSLA, orderSLA) {
  try {
    const sh   = _cfgSS().getSheetByName(TAB_LEADTIME);
    const d    = sh.getDataRange().getValues();
    const rStr = String(route).trim().toUpperCase();
    for (let i = 1; i < d.length; i++) {
      if (String(d[i][0]).trim().toUpperCase() === rStr) {
        sh.getRange(i+1,1,1,5).setValues([[route, cluster, Number(dispatchSLA), Number(orderSLA), _now()]]);
        _cacheDrop('gasn_leadtimes');
        return { ok: true, action: 'updated' };
      }
    }
    sh.appendRow([route, cluster, Number(dispatchSLA), Number(orderSLA), _now()]);
    _cacheDrop('gasn_leadtimes');
    return { ok: true, action: 'added' };
  } catch (e) { return { ok: false, err: e.message }; }
}

function deleteLeadTime(route) {
  try {
    const sh   = _cfgSS().getSheetByName(TAB_LEADTIME);
    const d    = sh.getDataRange().getValues();
    const rStr = String(route).trim().toUpperCase();
    for (let i = 1; i < d.length; i++) {
      if (String(d[i][0]).trim().toUpperCase() === rStr) { sh.deleteRow(i+1); _cacheDrop('gasn_leadtimes'); return { ok: true }; }
    }
    return { ok: false, msg: 'Route not found.' };
  } catch (e) { return { ok: false, err: e.message }; }
}

// ── SI Staging ──────────────────────────────────────────────────

function getSIStagingStats() {
  return _cache('gasn_si_stats', function() {
    try {
      const data   = _rows(_asnSS(), TAB_SI);
      const active = data.filter(r => r.Archived !== 'YES');
      return { ok: true, totalRows: active.length, uniqueSIs: new Set(active.map(r => String(r.SI_Number))).size };
    } catch (e) { return { ok: false, err: e.message }; }
  }, 300);
}

// CR-006: Null guard with auto-create
function uploadSIStaging(rows) {
  try {
    if (!rows || !rows.length) return { ok: false, msg: 'No data received.' };
    const ss = _asnSS();
    let sh   = ss.getSheetByName(TAB_SI);
    if (!sh) {
      sh = ss.insertSheet(TAB_SI);
      sh.appendRow([
        'Posting_Date','SI_Number','Cust_Code','Cust_Name','Route',
        'Address','Group_Name','Item_Code','Item_Name','Quantity',
        'UOM','Lowest_Qty','Lowest_UOM','Unit_Price','Line_Total',
        'Branch','Del_Status','Tagged_By','Tagged_At','Archived'
      ]);
    }
    const existing = sh.getDataRange().getValues().slice(1);
    const existSet = new Set(existing.map(r => String(r[1]).trim() + '|' + String(r[7]).trim()));
    const newRows  = [];
    const seen     = new Set();
    let   skipped  = 0;
    rows.forEach(r => {
      const siNo    = String(r.siNumber  || '').trim();
      const itemKey = siNo + '|' + String(r.itemCode || '').trim();
      if (!siNo || existSet.has(itemKey) || seen.has(itemKey)) { skipped++; return; }
      seen.add(itemKey);
      newRows.push([
        r.postingDate||'', siNo, r.custCode||'', r.custName||'',
        r.route||'', r.address||'', r.groupName||'',
        r.itemCode||'', r.itemName||'', Number(r.quantity)||0,
        r.uom||'', Number(r.lowestQty)||0, r.lowestUom||'',
        Number(r.unitPrice)||0, Number(r.lineTotal)||0,
        r.branch||'', 'Pending', '', '', 'NO'
      ]);
    });
    if (newRows.length)
      sh.getRange(sh.getLastRow()+1, 1, newRows.length, newRows[0].length).setValues(newRows);
    _cacheDrop('gasn_si_stats');
    const stats = getSIStagingStats();
    return { ok: true, added: newRows.length, skipped, totalRows: stats.uniqueSIs || 0 };
  } catch (e) { return { ok: false, err: e.message }; }
}

// CR-006: Null guard
function updateSIStatus(siNumber, status, personnelCode, timestamp) {
  try {
    const sh = _asnSS().getSheetByName(TAB_SI);
    if (!sh) return { ok: false, msg: 'SI_Staging sheet not found. Contact administrator.' };
    const data   = sh.getDataRange().getValues();
    const hdr    = data[0];
    const siIdx  = hdr.indexOf('SI_Number');
    const stIdx  = hdr.indexOf('Del_Status');
    const byIdx  = hdr.indexOf('Tagged_By');
    const atIdx  = hdr.indexOf('Tagged_At');
    const arcIdx = hdr.indexOf('Archived');
    const siStr  = String(siNumber).trim();
    let   updated = 0;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][siIdx]).trim() === siStr) {
        sh.getRange(i+1, stIdx+1).setValue(status);
        sh.getRange(i+1, byIdx+1).setValue(personnelCode||'');
        sh.getRange(i+1, atIdx+1).setValue(timestamp||_now());
        if (status === 'Delivered') sh.getRange(i+1, arcIdx+1).setValue('PENDING');
        updated++;
      }
    }
    return { ok: true, updated };
  } catch (e) { return { ok: false, err: e.message }; }
}

// ── ASN — Publish ───────────────────────────────────────────────

function detectDuplicateASNs(controlNo, releasedDate) {
  try {
    const matches = _rows(_asnSS(), TAB_ASN).filter(r =>
      String(r.Control_No) === String(controlNo) &&
      String(r.Released_Date).substring(0,10) === String(releasedDate).substring(0,10) &&
      r.Status !== 'Voided'
    );
    return { ok: true, hasDuplicates: matches.length > 0, count: matches.length };
  } catch (e) { return { ok: false, err: e.message }; }
}

// CR-006 + CR-007: Null guards + personnel validation
function publishBatch(batch) {
  try {
    const ss  = _asnSS();
    const msh = ss.getSheetByName(TAB_ASN);
    if (!msh) return { ok: false, msg: 'Sheet ' + TAB_ASN + ' not found. Contact administrator.' };
    const lsh = ss.getSheetByName(TAB_LINES);
    if (!lsh) return { ok: false, msg: 'Sheet ' + TAB_LINES + ' not found. Contact administrator.' };

    // CR-007: Pre-publish personnel validation
    for (const a of batch) {
      if (!a.personnelCode || !String(a.personnelCode).trim())
        return { ok: false, msg: `ASN for "${a.customerName}" is missing Delivery Personnel. Please assign personnel before publishing.` };
    }

    const ts         = _now();
    const masterRows = [];
    const lineRows   = [];
    const out        = [];

    batch.forEach(a => {
      const id = _id('ASN');
      masterRows.push([
        id, ts, 'Pending',
        a.customerName    || '', a.customerCode    || '', a.customerAddress || '',
        a.route           || '', a.controlNumber   || '', a.releasedDate    || '',
        a.expectedDelivery|| '', a.truckPlate      || '',
        a.personnelName   || '', String(a.personnelCode).trim(), a.personnelContact || '',
        '', ts
      ]);
      (a.lines || []).forEach(l => {
        lineRows.push([
          _id('LN'), id,
          l.stopNo||'', l.soNumber||'', l.siNumber||'',
          l.itemCode||'', l.itemName||'',
          Number(l.quantity)||0, l.uom||'',
          Number(l.lowestQty)||0, l.lowestUom||'',
          Number(l.unitPrice)||0, Number(l.lineTotal)||0,
          Number(l.cases)||0, Number(l.bags)||0, Number(l.freeGoods)||0,
          l.delivInstr||'', l.recvFrom||'', l.recvTo||'', l.mop||'',
          l.remarks||'', l.groupName||'', l.branch||''
        ]);
      });
      out.push({ id, customer: a.customerName, lineCount: (a.lines||[]).length });
    });

    if (masterRows.length)
      msh.getRange(msh.getLastRow()+1,1,masterRows.length,masterRows[0].length).setValues(masterRows);
    if (lineRows.length)
      lsh.getRange(lsh.getLastRow()+1,1,lineRows.length,lineRows[0].length).setValues(lineRows);

    _cacheDrop('gasn_asn_list', 'gasn_tracker', 'gasn_run_controls');
    console.log(`✅ Published ${batch.length} ASNs, ${lineRows.length} line items.`);
    return { ok: true, count: batch.length, results: out };
  } catch (e) { console.log('publishBatch error: ' + e.message); return { ok: false, err: e.message }; }
}

// ── ASN — Read ──────────────────────────────────────────────────

function getASNList() {
  return _cache('gasn_asn_list', function() {
    try { return { ok: true, list: _rows(_asnSS(), TAB_ASN) }; }
    catch (e) { return { ok: false, err: e.message }; }
  }, 120);
}

function getASNDetail(id) {
  try {
    const ss  = _asnSS();
    const asn = _rows(ss, TAB_ASN).find(r => String(r.ASN_ID) === String(id));
    if (!asn) return { ok: false, msg: 'ASN not found.' };
    return {
      ok: true, asn,
      lines:  _rows(ss, TAB_LINES).filter(r => String(r.ASN_ID) === String(id)),
      tags:   _rows(ss, TAB_TAGS).filter(r => String(r.ASN_ID) === String(id)),
      photos: _rows(ss, TAB_PHOTOS).filter(r => String(r.ASN_ID) === String(id))
    };
  } catch (e) { return { ok: false, err: e.message }; }
}

// CR-003 + CR-004: Control number + date filter; SI children
function getCustomerASNs(code, controlNo, releasedDate) {
  try {
    const codeStr = String(code).trim().toUpperCase();
    const ss      = _asnSS();
    let list = _rows(ss, TAB_ASN).filter(r =>
      String(r.Cust_Code).trim().toUpperCase() === codeStr && r.Status !== 'Voided'
    );
    if (controlNo) list = list.filter(r => String(r.Control_No) === String(controlNo));
    if (releasedDate) list = list.filter(r =>
      String(r.Released_Date).substring(0,10) === String(releasedDate).substring(0,10)
    );
    list.sort((a,b) => new Date(b.Expected_Delivery) - new Date(a.Expected_Delivery));

    // CR-004: Attach SI children with full items for each ASN
    const allLines = _rows(ss, TAB_LINES);
    const allTags  = _rows(ss, TAB_TAGS);
    list = list.map(asn => {
      const aLines = allLines.filter(l => String(l.ASN_ID) === String(asn.ASN_ID));
      const tagMap = {};
      allTags.filter(t => String(t.ASN_ID) === String(asn.ASN_ID))
             .forEach(t => { tagMap[String(t.SI_No)] = t; });
      const siMap = {};
      aLines.forEach(l => {
        const si = String(l.SI_No);
        if (!siMap[si]) siMap[si] = {
          siNo: si, soNo: String(l.SO_No),
          itemCount: 0, totalQty: 0,
          status: tagMap[si] ? String(tagMap[si].Del_Status) : 'Pending',
          tag: tagMap[si] || null,
          items: []
        };
        siMap[si].itemCount++;
        siMap[si].totalQty += Number(l.Qty) || 0;
        siMap[si].items.push({
          itemCode:  String(l.Item_Code  || ''),
          itemName:  String(l.Item_Name  || ''),
          qty:       Number(l.Qty)        || 0,
          uom:       String(l.UOM        || ''),
          unitPrice: Number(l.Unit_Price) || 0,
          lineTotal: Number(l.Line_Total) || 0,
          stopNo:    String(l.Stop_No    || ''),
          delivInstr:String(l.Deliv_Instr|| '')
        });
      });
      return { ...asn, salesInvoices: Object.values(siMap) };
    });
    return { ok: true, list };
  } catch (e) { return { ok: false, err: e.message }; }
}

// ── ASN — Update ────────────────────────────────────────────────

function setStatus(id, status) {
  try { return { ok: _setField(id, 'Status', status) }; }
  catch (e) { return { ok: false, err: e.message }; }
}

function voidASN(id, reason) {
  try {
    const asn = _rows(_asnSS(), TAB_ASN).find(r => String(r.ASN_ID) === String(id));
    if (!asn) return { ok: false, msg: 'ASN not found.' };
    if (asn.Status === 'Delivered') return { ok: false, msg: 'Cannot void a Delivered ASN.' };
    _setField(id, 'Status',      'Voided');
    _setField(id, 'Void_Reason',  reason);
    _cacheDrop('gasn_asn_list', 'gasn_tracker');
    return { ok: true };
  } catch (e) { return { ok: false, err: e.message }; }
}

function getDuplicateASNs() {
  try {
    const all    = _rows(_asnSS(), TAB_ASN).filter(r => r.Status !== 'Voided');
    const groups = {};
    all.forEach(a => {
      const key = `${String(a.Cust_Code).trim()}|${String(a.Control_No).trim()}|${String(a.Released_Date).substring(0,10)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    return { ok: true, duplicates: Object.values(groups).filter(g => g.length > 1) };
  } catch (e) { return { ok: false, err: e.message }; }
}

function bulkVoidASNs(ids, reason) {
  try {
    const sh  = _asnSS().getSheetByName(TAB_ASN);
    if (!sh) return { ok: false, msg: 'Sheet not found.' };
    const d   = sh.getDataRange().getValues();
    const hdr = d[0];
    const si  = hdr.indexOf('Status'), vi = hdr.indexOf('Void_Reason'), ii = hdr.indexOf('ASN_ID');
    let voided = 0;
    for (let i = 1; i < d.length; i++) {
      if (ids.includes(String(d[i][ii])) && d[i][si] !== 'Delivered') {
        sh.getRange(i+1,si+1).setValue('Voided');
        sh.getRange(i+1,vi+1).setValue(reason||'Bulk void — duplicate');
        voided++;
      }
    }
    _cacheDrop('gasn_asn_list', 'gasn_tracker');
    return { ok: true, voided };
  } catch (e) { return { ok: false, err: e.message }; }
}

// CR-007: Repair blank personnel fields on already-published ASNs
function repairPersonnelField(asnId, personnelCode) {
  try {
    const codeStr = String(personnelCode).trim().toUpperCase();
    const sh  = _cfgSS().getSheetByName(TAB_PERSONNEL);
    if (!sh) return { ok: false, msg: 'Personnel sheet not found.' };
    const d   = sh.getDataRange().getValues();
    let name = '', contact = '';
    for (let i = 1; i < d.length; i++) {
      if (String(d[i][0]).trim().toUpperCase() === codeStr) {
        name = String(d[i][1]); contact = String(d[i][2]||''); break;
      }
    }
    if (!name) return { ok: false, msg: `Personnel code "${personnelCode}" not found in masterfile.` };
    _setField(asnId, 'Personnel_Code',    codeStr);
    _setField(asnId, 'Personnel_Name',    name);
    _setField(asnId, 'Personnel_Contact', contact);
    return { ok: true, patched: { asnId, code: codeStr, name, contact } };
  } catch (e) { return { ok: false, err: e.message }; }
}

// ── Inline ASN Personnel + Date Assignment ───────────────────────
// Used by dispatch to patch blank-personnel ASNs without republishing

function assignPersonnelToASN(asnId, personnelCode, releasedDate) {
  try {
    const codeStr = String(personnelCode).trim().toUpperCase();
    const sh = _cfgSS().getSheetByName(TAB_PERSONNEL);
    if (!sh) return { ok: false, msg: 'Personnel sheet not found.' };
    const d = sh.getDataRange().getValues();
    let name = '', contact = '';
    for (let i = 1; i < d.length; i++) {
      if (String(d[i][0]).trim().toUpperCase() === codeStr && d[i][4] === true) {
        name = String(d[i][1]); contact = String(d[i][2] || ''); break;
      }
    }
    if (!name) return { ok: false, msg: `Personnel code "${personnelCode}" not found in masterfile.` };
    _setField(asnId, 'Personnel_Code',    codeStr);
    _setField(asnId, 'Personnel_Name',    name);
    _setField(asnId, 'Personnel_Contact', contact);
    if (releasedDate && String(releasedDate).trim())
      _setField(asnId, 'Released_Date', String(releasedDate).trim());
    console.log(`✅ assignPersonnelToASN: ${asnId} → ${codeStr} (${name})`);
    return { ok: true, asnId, code: codeStr, name };
  } catch (e) { return { ok: false, err: e.message }; }
}

// ── CR-003: Control Number Selection Helpers ─────────────────────

function getPersonnelControlNumbers(personnelCode) {
  const codeStr = String(personnelCode).trim().toUpperCase();
  return _cache('gasn_pctrls_' + codeStr, function() { try {
    const all = _rows(_asnSS(), TAB_ASN).filter(r =>
      String(r.Personnel_Code).trim().toUpperCase() === codeStr &&
      !['Voided'].includes(r.Status)
    );
    const seen = new Set();
    const pairs = [];
    all.forEach(r => {
      const key = `${String(r.Control_No)}|${String(r.Released_Date).substring(0,10)}`;
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push({
          controlNo:    String(r.Control_No),
          releasedDate: String(r.Released_Date).substring(0,10),
          route:        String(r.Route),
          label:        `${String(r.Control_No)} — ${String(r.Route)} (${String(r.Released_Date).substring(0,10)})`
        });
      }
    });
    pairs.sort((a,b) => b.releasedDate.localeCompare(a.releasedDate));
    return { ok: true, pairs };
  } catch (e) { return { ok: false, err: e.message }; } }, 180);
}

function getCustomerControlNumbers(custCode) {
  const codeStr = String(custCode).trim().toUpperCase();
  return _cache('gasn_cctrls_' + codeStr, function() { try {
    const all = _rows(_asnSS(), TAB_ASN).filter(r =>
      String(r.Cust_Code).trim().toUpperCase() === codeStr &&
      !['Voided'].includes(r.Status)
    );
    const seen = new Set();
    const pairs = [];
    all.forEach(r => {
      const key = `${String(r.Control_No)}|${String(r.Released_Date).substring(0,10)}`;
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push({
          controlNo:    String(r.Control_No),
          releasedDate: String(r.Released_Date).substring(0,10),
          route:        String(r.Route),
          eta:          String(r.Expected_Delivery),
          label:        `${String(r.Control_No)} — ${String(r.Route)} (${String(r.Released_Date).substring(0,10)})`
        });
      }
    });
    pairs.sort((a,b) => b.releasedDate.localeCompare(a.releasedDate));
    return { ok: true, pairs };
  } catch (e) { return { ok: false, err: e.message }; } }, 180);
}

// ── CR-001: Restructured Personnel Run (Customer-Primary, SI-Secondary) ──
// CR-002: In Transit trigger
// CR-007: Case-insensitive trim on Personnel_Code comparison

function getPersonnelRun(code, controlNo, releasedDate) {
  const codeStr = String(code).trim().toUpperCase();
  const _key = 'gasn_prun_' + codeStr + '_' + (controlNo||'') + '_' + (releasedDate||'');
  return _cache(_key, function() { try {
    const ss      = _asnSS();
    // Include all non-terminal statuses — handles both old ('In Transit') and new ('Released') values
    let asns = _rows(ss, TAB_ASN).filter(r =>
      String(r.Personnel_Code).trim().toUpperCase() === codeStr &&
      !['Delivered','Voided','Returned','Rescheduled'].includes(r.Status)
    );
    if (controlNo)    asns = asns.filter(r => String(r.Control_No) === String(controlNo));
    if (releasedDate) asns = asns.filter(r =>
      String(r.Released_Date).substring(0,10) === String(releasedDate).substring(0,10)
    );
    if (!asns.length) return { ok: true, run: [] };

    const allLines = _rows(ss, TAB_LINES);
    const allTags  = _rows(ss, TAB_TAGS);

    // CR-001: Group by customer (Cust_Code + Stop_No) as primary stop unit
    const stopMap = {};
    asns.forEach(a => {
      const aLines = allLines.filter(l => String(l.ASN_ID) === String(a.ASN_ID));
      const tagMap = {};
      allTags.filter(t => String(t.ASN_ID) === String(a.ASN_ID))
             .forEach(t => { tagMap[String(t.SI_No)] = t; });

      aLines.forEach(l => {
        const stopKey = `${String(a.Cust_Code).trim()}|${String(l.Stop_No).trim()}`;
        if (!stopMap[stopKey]) {
          stopMap[stopKey] = {
            stopKey, stopNo:  String(l.Stop_No),
            custCode: String(a.Cust_Code), custName: String(a.Cust_Name),
            address:  String(a.Cust_Address), asnId: String(a.ASN_ID),
            route: String(a.Route), eta: String(a.Expected_Delivery),
            salesInvoices: {}, cases: 0, bags: 0, freeGoods: 0, _siCounted: new Set()
          };
        }
        const si = String(l.SI_No);
        if (!stopMap[stopKey].salesInvoices[si]) {
          stopMap[stopKey].salesInvoices[si] = {
            siNo: si, soNo: String(l.SO_No),
            delivInstr: String(l.Deliv_Instr), recvFrom: String(l.Recv_From),
            recvTo: String(l.Recv_To), mop: String(l.MOP),
            items: [], tagged: !!tagMap[si], tag: tagMap[si] || null
          };
        }
        stopMap[stopKey].salesInvoices[si].items.push({
          code: String(l.Item_Code), name: String(l.Item_Name),
          qty: l.Qty, uom: String(l.UOM)
        });
        if (!stopMap[stopKey]._siCounted.has(si)) {
          stopMap[stopKey].cases     += Number(l.Cases      || 0);
          stopMap[stopKey].bags      += Number(l.Bags       || 0);
          stopMap[stopKey].freeGoods += Number(l.Free_Goods || 0);
          stopMap[stopKey]._siCounted.add(si);
        }
      });
    });

    // Finalize stops
    const stops = Object.values(stopMap).map(stop => {
      const siList = Object.values(stop.salesInvoices);
      const { _siCounted, ...rest } = stop;
      return {
        ...rest,
        salesInvoices: siList,
        allTagged:     siList.every(si => si.tagged),
        partialTagged: siList.some(si => si.tagged) && !siList.every(si => si.tagged)
      };
    }).sort((a,b) =>
      (parseInt(String(a.stopNo).replace(/\D/g,''))||0) -
      (parseInt(String(b.stopNo).replace(/\D/g,''))||0)
    );

    return { ok: true, run: stops, asnCount: asns.length };
  } catch (e) { return { ok: false, err: e.message }; } }, 90);
}

// CR-002: One-button In Transit trigger — batch write
function setRunReleased(personnelCode) {
  try {
    const codeStr = String(personnelCode).trim().toUpperCase();
    const ss  = _asnSS();
    const sh  = ss.getSheetByName(TAB_ASN);
    if (!sh) return { ok: false, msg: 'Sheet ' + TAB_ASN + ' not found.' };
    const d   = sh.getDataRange().getValues();
    const hdr = d[0];
    const si  = hdr.indexOf('Status');
    const pc  = hdr.indexOf('Personnel_Code');
    const updates = [];
    for (let i = 1; i < d.length; i++) {
      if (String(d[i][pc]).trim().toUpperCase() === codeStr && d[i][si] === 'Pending')
        updates.push(i + 1);
    }
    if (!updates.length) return { ok: true, count: 0, msg: 'No Pending ASNs found for this personnel.' };
    // Batch write In Transit to all matched rows
    updates.forEach(row => sh.getRange(row, si+1).setValue('Released'));
    _cacheDrop('gasn_asn_list', 'gasn_tracker');
    console.log(`✅ setRunReleased: ${updates.length} ASNs set to In Transit for ${codeStr}`);
    return { ok: true, count: updates.length };
  } catch (e) { return { ok: false, err: e.message }; }
}

// CR-006: Null guard on TAB_TAGS
function saveTag(tag) {
  try {
    const ss = _asnSS();
    const sh = ss.getSheetByName(TAB_TAGS);
    if (!sh) return { ok: false, msg: 'Sheet ' + TAB_TAGS + ' not found. Contact administrator.' };
    const tagId  = _id('TAG');
    const syncTs = _now();
    sh.appendRow([
      tagId, tag.asnId, tag.siNo,
      String(tag.personnelCode), String(tag.personnelName),
      tag.status, tag.reason||'', tag.recipient,
      tag.delivTs, syncTs, tag.offline ? 'YES':'NO'
    ]);
    updateSIStatus(tag.siNo, tag.status, tag.personnelCode, tag.delivTs);
    _resolveASNStatus(ss, tag.asnId);
    _cacheDrop('gasn_tracker', 'gasn_asn_list');
    return { ok: true, tagId, syncTs };
  } catch (e) { return { ok: false, err: e.message }; }
}

function _resolveASNStatus(ss, asnId) {
  // All SIs tagged (regardless of individual status) = Delivered. Otherwise = Released.
  const siNos    = [...new Set(_rows(ss,TAB_LINES).filter(r=>String(r.ASN_ID)===String(asnId)).map(r=>String(r.SI_No)))];
  const tags     = _rows(ss, TAB_TAGS).filter(r => String(r.ASN_ID) === String(asnId));
  const taggedSI = new Set(tags.map(t => String(t.SI_No)));
  const allDone  = siNos.every(si => taggedSI.has(si));
  _setField(asnId, 'Status', allDone ? 'Delivered' : 'Released');
}

// CR-006: Null guard on TAB_PHOTOS
function uploadPhoto(b64, tagId, asnId, mime) {
  try {
    const ss     = _asnSS();
    const sh     = ss.getSheetByName(TAB_PHOTOS);
    if (!sh) return { ok: false, msg: 'Sheet ' + TAB_PHOTOS + ' not found. Contact administrator.' };
    const parent = DriveApp.getFolderById(_getCfg('POD_FOLDER_ID'));
    const mLabel = Utilities.formatDate(new Date(), 'Asia/Manila', 'yyyy-MM');
    const subF   = parent.getFoldersByName(mLabel).hasNext()
      ? parent.getFoldersByName(mLabel).next()
      : parent.createFolder(mLabel);
    const blob = Utilities.newBlob(Utilities.base64Decode(b64), mime||'image/jpeg', `POD_${tagId}_${Date.now()}.jpg`);
    const file = subF.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const url = `https://drive.google.com/file/d/${file.getId()}/view`;
    sh.appendRow([_id('PHO'), tagId, asnId, file.getId(), url, _now()]);
    return { ok: true, url, fileId: file.getId() };
  } catch (e) { return { ok: false, err: e.message }; }
}

function getLiveTracker() {
  return _cache('gasn_tracker', function() { try {
    const ss       = _asnSS();
    const asns     = _rows(ss, TAB_ASN).filter(r => r.Status !== 'Voided');
    const allLn    = _rows(ss, TAB_LINES);
    const allTags  = _rows(ss, TAB_TAGS);
    const byPerson = {};
    asns.forEach(function(a) {
      const pk = String(a.Personnel_Code||'Unassigned').trim();
      if (!byPerson[pk]) byPerson[pk] = {
        code: String(a.Personnel_Code||''), name: String(a.Personnel_Name||'Unassigned'),
        route: String(a.Route||''), stopMap: {}
      };
      const aLines = allLn.filter(function(l){ return String(l.ASN_ID) === String(a.ASN_ID); });
      const tagMap = {};
      allTags.filter(function(t){ return String(t.ASN_ID) === String(a.ASN_ID); })
             .forEach(function(t){ tagMap[String(t.SI_No)] = t; });
      const sisSeen = {};
      aLines.forEach(function(l) {
        const si      = String(l.SI_No);
        const stopNo  = String(l.Stop_No||'');
        const stopKey = stopNo || String(a.Cust_Code);
        if (!byPerson[pk].stopMap[stopKey]) {
          byPerson[pk].stopMap[stopKey] = {
            stopNo: stopNo, customer: String(a.Cust_Name),
            custCode: String(a.Cust_Code), asnStatus: String(a.Status),
            salesInvoices: {}, cases: 0, bags: 0, freeGoods: 0
          };
        }
        const stop = byPerson[pk].stopMap[stopKey];
        if (!stop.salesInvoices[si]) {
          const tag = tagMap[si];
          stop.salesInvoices[si] = {
            siNo: si, soNo: String(l.SO_No||''),
            status: tag ? String(tag.Del_Status) : 'Pending',
            delivTs: tag ? String(tag.Deliv_TS||'') : null
          };
        }
        if (!sisSeen[si]) {
          stop.cases     += Number(l.Cases      || 0);
          stop.bags      += Number(l.Bags       || 0);
          stop.freeGoods += Number(l.Free_Goods || 0);
          sisSeen[si] = true;
        }
      });
    });
    const tracker = Object.values(byPerson).map(function(p) {
      const stops = Object.values(p.stopMap).map(function(stop) {
        const siList    = Object.values(stop.salesInvoices);
        const allTagged = siList.every(function(si){ return si.status !== 'Pending'; });
        const anyTagged = siList.some(function(si){ return si.status !== 'Pending'; });
        var derivedStatus;
        if      (allTagged) derivedStatus = 'Delivered';
        else if (anyTagged) derivedStatus = 'Partial';
        else if (stop.asnStatus === 'In Transit' || stop.asnStatus === 'Released') derivedStatus = 'In Transit';
        else    derivedStatus = 'Pending';
        const firstDelivTs = siList.reduce(function(acc,si){ return acc||(si.delivTs||null); }, null);
        return {
          stopNo: stop.stopNo, customer: stop.customer, custCode: stop.custCode,
          siCount: siList.length, salesInvoices: siList,
          cases: stop.cases, bags: stop.bags, freeGoods: stop.freeGoods,
          status: derivedStatus, delivTs: firstDelivTs
        };
      }).sort(function(a,b){
        return (parseInt(String(a.stopNo).replace(/\D/g,''))||0) -
               (parseInt(String(b.stopNo).replace(/\D/g,''))||0);
      });
      return {
        code: p.code, name: p.name, route: p.route, stops: stops,
        total: stops.length,
        done:  stops.filter(function(s){ return s.status === 'Delivered'; }).length
      };
    });
    return { ok: true, asOf: _now(), tracker: tracker };
  } catch (e) { return { ok: false, err: e.message }; } }, 60);
}

// CR-005: Export per ASN
function exportASNDetail(asnId) {
  try {
    const ss  = _asnSS();
    const asn = _rows(ss, TAB_ASN).find(r => String(r.ASN_ID) === String(asnId));
    if (!asn) return { ok: false, msg: 'ASN not found.' };
    const lines = _rows(ss, TAB_LINES).filter(r => String(r.ASN_ID) === String(asnId));
    const tags  = _rows(ss, TAB_TAGS).filter(r => String(r.ASN_ID) === String(asnId));
    const tagMap = {};
    tags.forEach(t => { tagMap[String(t.SI_No)] = t; });
    const rows = lines.map(l => {
      const tag = tagMap[String(l.SI_No)];
      return {
        asnId:        String(asn.ASN_ID),
        customer:     String(asn.Cust_Name),
        custCode:     String(asn.Cust_Code),
        route:        String(asn.Route),
        controlNo:    String(asn.Control_No),
        releasedDate: String(asn.Released_Date).substring(0,10),
        expDelivery:  String(asn.Expected_Delivery),
        truck:        String(asn.Truck_Plate),
        personnel:    String(asn.Personnel_Name),
        stopNo:       String(l.Stop_No),
        soNo:         String(l.SO_No),
        siNo:         String(l.SI_No),
        itemCode:     String(l.Item_Code),
        itemName:     String(l.Item_Name),
        qty:          l.Qty,
        uom:          String(l.UOM),
        unitPrice:    l.Unit_Price,
        lineTotal:    l.Line_Total,
        delStatus:    tag ? String(tag.Del_Status) : 'Pending',
        recipient:    tag ? String(tag.Recipient)  : '',
        delivTs:      tag ? String(tag.Deliv_TS)   : '',
        reason:       tag ? String(tag.Reason||'') : ''
      };
    });
    return { ok: true, asn, rows };
  } catch (e) { return { ok: false, err: e.message }; }
}

// CR-006: Null guards on archive tabs
function archiveMonthly() {
  try {
    const ss  = _asnSS();
    // Null-guard all four tabs before proceeding
    const tabs = [TAB_ASN, TAB_LINES, TAB_TAGS, TAB_PHOTOS];
    for (const tab of tabs) {
      if (!ss.getSheetByName(tab))
        return { ok: false, msg: `Sheet ${tab} not found. Contact administrator.` };
    }
    const ids = _rows(ss, TAB_ASN)
      .filter(r => ['Delivered','Voided','Partial'].includes(r.Status))
      .map(r => String(r.ASN_ID));
    if (!ids.length) return { ok: true, msg: 'Nothing to archive.' };

    const label = Utilities.formatDate(new Date(), 'Asia/Manila', 'MMM-yyyy');
    const arcF  = DriveApp.getFolderById(_getCfg('ARCHIVE_FOLDER_ID'));
    const arc   = SpreadsheetApp.create(`GMPI_ASN_Archive_${label}`);
    DriveApp.getFileById(arc.getId()).moveTo(arcF);

    [[TAB_ASN,0],[TAB_LINES,1],[TAB_TAGS,1],[TAB_PHOTOS,1]].forEach(([tab,asnCol],idx) => {
      const src  = ss.getSheetByName(tab);
      const data = src.getDataRange().getValues();
      const hdr  = data[0];
      const rows = data.slice(1).filter(r => ids.includes(String(r[asnCol])));
      const dst  = idx === 0 ? arc.getActiveSheet().setName(tab) : arc.insertSheet(tab);
      dst.appendRow(hdr);
      if (rows.length) dst.getRange(2,1,rows.length,hdr.length).setValues(rows);
    });
    [[TAB_ASN,0],[TAB_LINES,1],[TAB_TAGS,1],[TAB_PHOTOS,1]].forEach(([tab,asnCol]) => {
      const sh = ss.getSheetByName(tab);
      const d  = sh.getDataRange().getValues();
      for (let i = d.length; i >= 2; i--)
        if (ids.includes(String(d[i-1][asnCol]))) sh.deleteRow(i);
    });
    _setCfg(`ARCHIVE_ASN_${label}`, arc.getId());
    return { ok: true, count: ids.length, arcId: arc.getId() };
  } catch (e) { return { ok: false, err: e.message }; }
}

// CR-006: Null guard on TAB_SI
function archiveSIQuarterly() {
  try {
    const month = new Date().getMonth();
    if (![0,3,6,9].includes(month)) return { ok: true, msg: 'Not a quarter start. Skipped.' };
    const ss = _asnSS();
    const sh = ss.getSheetByName(TAB_SI);
    if (!sh) return { ok: false, msg: 'Sheet ' + TAB_SI + ' not found. Contact administrator.' };
    const d      = sh.getDataRange().getValues();
    const hdr    = d[0];
    const arcIdx = hdr.indexOf('Archived');
    const toArc  = d.slice(1).filter(r => r[arcIdx] === 'PENDING' || r[arcIdx] === 'YES');
    if (!toArc.length) return { ok: true, msg: 'Nothing to archive.' };
    const quarter = `Q${Math.floor(month/3)+1}-${new Date().getFullYear()}`;
    const arcF    = DriveApp.getFolderById(_getCfg('ARCHIVE_FOLDER_ID'));
    const arc     = SpreadsheetApp.create(`GMPI_SI_Archive_${quarter}`);
    DriveApp.getFileById(arc.getId()).moveTo(arcF);
    const dst = arc.getActiveSheet().setName(TAB_SI);
    dst.appendRow(hdr);
    dst.getRange(2,1,toArc.length,hdr.length).setValues(toArc);
    const siIdx     = hdr.indexOf('SI_Number');
    const archivedSIs = new Set(toArc.map(r => String(r[siIdx])));
    for (let i = d.length; i >= 2; i--)
      if (archivedSIs.has(String(d[i-1][siIdx]))) sh.deleteRow(i);
    _setCfg(`ARCHIVE_SI_${quarter}`, arc.getId());
    return { ok: true, count: toArc.length, quarter, arcId: arc.getId() };
  } catch (e) { return { ok: false, err: e.message }; }
}

// ── Combined Login Helpers ───────────────────────────────────────

function loginPersonnel(code) {
  try {
    const v = validatePersonnel(code);
    if (!v.ok) return v;
    const cr = getPersonnelControlNumbers(code);
    return { ok: true, name: v.name, contact: v.contact, code: v.code, pairs: cr.pairs || [] };
  } catch(e) { return { ok: false, err: e.message }; }
}

function loginCustomer(code) {
  try {
    const v = validateCustomer(code);
    if (!v.ok) return v;
    const cr = getCustomerControlNumbers(code);
    return { ok: true, name: v.name, code: String(code).trim().toUpperCase(), pairs: cr.pairs || [] };
  } catch(e) { return { ok: false, err: e.message }; }
}

// ── SI Staging Fetch ─────────────────────────────────────────────

function getSIStagingByNumbers(siNumbers) {
  try {
    if (!siNumbers || !siNumbers.length) return { ok: true, items: [] };
    const siSet = new Set(siNumbers.map(s => String(s).trim()));
    const items = _rows(_asnSS(), TAB_SI)
      .filter(r => siSet.has(String(r.SI_Number).trim()) && r.Archived !== 'YES');
    return { ok: true, items };
  } catch (e) { return { ok: false, err: e.message }; }
}

// ── Repair Utilities ─────────────────────────────────────────────

function repairMissingSheets() {
  const ss = _asnSS();
  if (!ss.getSheetByName(TAB_SI)) {
    ss.insertSheet(TAB_SI).appendRow([
      'Posting_Date','SI_Number','Cust_Code','Cust_Name','Route',
      'Address','Group_Name','Item_Code','Item_Name','Quantity',
      'UOM','Lowest_Qty','Lowest_UOM','Unit_Price','Line_Total',
      'Branch','Del_Status','Tagged_By','Tagged_At','Archived'
    ]);
    console.log('✅ SI_Staging sheet created.');
  }
}

// ── Run Report Functions (Phase Reports) ─────────────────────────

function getRunControlNumbers() {
  return _cache('gasn_run_controls', function() { try {
    const ss  = _asnSS();
    const all = _rows(ss, TAB_ASN).filter(r => r.Status !== 'Voided');
    const seen = new Set();
    const pairs = [];
    all.forEach(r => {
      const rd  = String(r.Released_Date).substring(0,10);
      const key = `${String(r.Control_No)}|${rd}`;
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push({
          controlNo:    String(r.Control_No),
          releasedDate: rd,
          route:        String(r.Route),
          source:       'active',
          label:        `${String(r.Control_No)} — ${String(r.Route)} (${rd})`
        });
      }
    });
    // Also read from archive index
    try {
      const idxData = _rows(_cfgSS(), TAB_ARCH_IDX);
      idxData.forEach(r => {
        const rd  = String(r.Released_Date).substring(0,10);
        const key = `${String(r.Control_No)}|${rd}`;
        if (!seen.has(key)) {
          seen.add(key);
          pairs.push({
            controlNo:     String(r.Control_No),
            releasedDate:  rd,
            route:         String(r.Route),
            source:        'archive',
            archiveFileId: String(r.Archive_File_ID),
            label:         `${String(r.Control_No)} — ${String(r.Route)} (${rd}) [Archive]`
          });
        }
      });
    } catch(e) { console.log('Archive index read skipped: '+e.message); }
    pairs.sort((a,b) => b.releasedDate.localeCompare(a.releasedDate));
    return { ok: true, pairs };
  } catch(e) { return { ok: false, err: e.message }; } }, 180);
}

function getRunReport(controlNo, releasedDate) {
  const _rptKey = 'gasn_rpt_' + String(controlNo).trim() + '_' + String(releasedDate).substring(0,10);
  return _cache(_rptKey, function() { try {
    const ctrlStr = String(controlNo).trim();
    const rdStr   = String(releasedDate).substring(0,10);

    // ── Find data source ────────────────────────────────────────
    let ss = _asnSS();
    let asns = _rows(ss, TAB_ASN).filter(r =>
      String(r.Control_No).trim() === ctrlStr &&
      String(r.Released_Date).substring(0,10) === rdStr &&
      r.Status !== 'Voided'
    );

    if (!asns.length) {
      // Try archive index
      const idxData = _rows(_cfgSS(), TAB_ARCH_IDX);
      const match   = idxData.find(r =>
        String(r.Control_No).trim() === ctrlStr &&
        String(r.Released_Date).substring(0,10) === rdStr
      );
      if (!match) return { ok: false, msg: 'No data found for this run. It may not exist or has been permanently deleted.' };
      ss   = SpreadsheetApp.openById(String(match.Archive_File_ID));
      asns = _rows(ss, TAB_ASN).filter(r =>
        String(r.Control_No).trim() === ctrlStr &&
        String(r.Released_Date).substring(0,10) === rdStr &&
        r.Status !== 'Voided'
      );
      if (!asns.length) return { ok: false, msg: 'ASNs found in archive index but not in archive file.' };
    }

    const asnIds   = asns.map(a => String(a.ASN_ID));
    const allLines = _rows(ss, TAB_LINES).filter(l => asnIds.includes(String(l.ASN_ID)));
    const allTags  = _rows(ss, TAB_TAGS).filter(t => asnIds.includes(String(t.ASN_ID)));

    // ── Build per-customer breakdown ────────────────────────────
    const customers = asns.map(asn => {
      const aLines  = allLines.filter(l => String(l.ASN_ID) === String(asn.ASN_ID));
      const tagMap  = {};
      allTags.filter(t => String(t.ASN_ID) === String(asn.ASN_ID))
             .forEach(t => { tagMap[String(t.SI_No)] = t; });

      // Group by SI
      const siMap = {};
      aLines.forEach(l => {
        const si = String(l.SI_No);
        if (!siMap[si]) siMap[si] = {
          siNo: si, soNo: String(l.SO_No),
          stopNo: String(l.Stop_No),
          itemCount: 0, totalQty: 0, totalValue: 0,
          status: tagMap[si] ? String(tagMap[si].Del_Status) : 'Pending',
          reason: tagMap[si] ? String(tagMap[si].Reason||'') : '',
          recipient: tagMap[si] ? String(tagMap[si].Recipient||'') : '',
          taggedAt: tagMap[si] ? String(tagMap[si].Deliv_TS||'') : ''
        };
        siMap[si].itemCount++;
        siMap[si].totalQty   += Number(l.Qty)        || 0;
        siMap[si].totalValue += Number(l.Line_Total)  || 0;
      });

      const siList  = Object.values(siMap);
      const lastTag = siList.filter(s=>s.taggedAt).sort((a,b)=>b.taggedAt.localeCompare(a.taggedAt))[0];
      const totVal  = siList.reduce((t,s)=>t+s.totalValue,0);

      return {
        asnId:        String(asn.ASN_ID),
        stopNo:       String(aLines[0]?.Stop_No||''),
        custCode:     String(asn.Cust_Code),
        custName:     String(asn.Cust_Name),
        address:      String(asn.Cust_Address),
        personnelName:String(asn.Personnel_Name),
        truckPlate:   String(asn.Truck_Plate),
        asnStatus:    String(asn.Status),
        siCount:      siList.length,
        itemCount:    siList.reduce((t,s)=>t+s.itemCount,0),
        totalValue:   totVal,
        delivered:    siList.filter(s=>s.status==='Delivered').length,
        returned:     siList.filter(s=>s.status==='Returned').length,
        rescheduled:  siList.filter(s=>s.status==='Rescheduled').length,
        pending:      siList.filter(s=>s.status==='Pending').length,
        deliveredVal: siList.filter(s=>s.status==='Delivered').reduce((t,s)=>t+s.totalValue,0),
        returnedVal:  siList.filter(s=>s.status==='Returned').reduce((t,s)=>t+s.totalValue,0),
        rescheduledVal:siList.filter(s=>s.status==='Rescheduled').reduce((t,s)=>t+s.totalValue,0),
        lastTaggedAt: lastTag ? lastTag.taggedAt : '',
        salesInvoices:siList.sort((a,b)=>a.siNo.localeCompare(b.siNo))
      };
    }).sort((a,b) => (parseInt(String(a.stopNo).replace(/\D/g,''))||0) -
                     (parseInt(String(b.stopNo).replace(/\D/g,''))||0));

    // ── Run-level summary ───────────────────────────────────────
    const summary = {
      controlNo:      ctrlStr,
      releasedDate:   rdStr,
      route:          String(asns[0]?.Route||''),
      personnelName:  String(asns[0]?.Personnel_Name||''),
      truckPlate:     String(asns[0]?.Truck_Plate||''),
      totalCustomers: customers.length,
      totalSIs:       customers.reduce((t,c)=>t+c.siCount,0),
      totalItems:     customers.reduce((t,c)=>t+c.itemCount,0),
      totalValue:     customers.reduce((t,c)=>t+c.totalValue,0),
      delivered:      customers.reduce((t,c)=>t+c.delivered,0),
      returned:       customers.reduce((t,c)=>t+c.returned,0),
      rescheduled:    customers.reduce((t,c)=>t+c.rescheduled,0),
      pending:        customers.reduce((t,c)=>t+c.pending,0),
      deliveredVal:   customers.reduce((t,c)=>t+c.deliveredVal,0),
      returnedVal:    customers.reduce((t,c)=>t+c.returnedVal,0),
      rescheduledVal: customers.reduce((t,c)=>t+c.rescheduledVal,0)
    };
    const total = summary.delivered + summary.returned + summary.rescheduled + summary.pending;
    summary.completionRate = total > 0
      ? Math.round((summary.delivered + summary.returned + summary.rescheduled) / total * 100)
      : 0;

    return { ok: true, summary, customers };
  } catch(e) { return { ok: false, err: e.message }; } }, 300);
}

// ── Firebase Migration Export (one-time use) ─────────────────────
function getMigrationData() {
  try {
    const cfgSS = _cfgSS();
    const asnSS = _asnSS();

    // Settings — dispatch PIN hash
    const settings      = _rows(cfgSS, TAB_SETTINGS);
    const pinRow        = settings.find(function(r){ return r.Key === 'DISPATCH_PIN'; });
    const dispatchPinHash = pinRow ? String(pinRow.Value) : null;

    // Personnel
    const pSheet = cfgSS.getSheetByName(TAB_PERSONNEL);
    const pVals  = pSheet ? pSheet.getDataRange().getValues() : [];
    const personnel = pVals.slice(1).filter(function(r){ return r[0]; }).map(function(r) {
      return {
        code:       String(r[0]).trim().toUpperCase(),
        Name:       String(r[1]),
        Contact:    String(r[2] || ''),
        Created_At: r[3] instanceof Date ? Utilities.formatDate(r[3],'Asia/Manila',"yyyy-MM-dd'T'HH:mm:ss") : String(r[3] || ''),
        Active:     r[4] === true
      };
    });

    // Lead Times
    const leadTimes = _rows(cfgSS, TAB_LEADTIME).map(function(lt) {
      return {
        route:        String(lt.Route || '').trim().toUpperCase(),
        Cluster:      String(lt.Cluster || ''),
        Dispatch_SLA: Number(lt.Dispatch_SLA || 0),
        Order_SLA:    Number(lt.Order_SLA || 0),
        Updated_At:   String(lt.Updated_At || _now())
      };
    }).filter(function(lt){ return lt.route; });

    // ASN Master
    const asns = _rows(asnSS, TAB_ASN).map(function(a) {
      return {
        id: String(a.ASN_ID),
        ASN_ID: String(a.ASN_ID), Created: String(a.Created || ''),
        Status: String(a.Status || 'Pending'),
        Cust_Name: String(a.Cust_Name || ''), Cust_Code: String(a.Cust_Code || ''),
        Cust_Address: String(a.Cust_Address || ''), Route: String(a.Route || ''),
        Control_No: String(a.Control_No || ''), Released_Date: String(a.Released_Date || ''),
        Expected_Delivery: String(a.Expected_Delivery || ''), Truck_Plate: String(a.Truck_Plate || ''),
        Personnel_Name: String(a.Personnel_Name || ''), Personnel_Code: String(a.Personnel_Code || ''),
        Personnel_Contact: String(a.Personnel_Contact || ''),
        Void_Reason: String(a.Void_Reason || ''), Published_At: String(a.Published_At || '')
      };
    }).filter(function(a){ return a.id; });

    // SO Lines
    const lines = _rows(asnSS, TAB_LINES).map(function(l) {
      return {
        id: String(l.Line_ID || _id('LN')),
        ASN_ID: String(l.ASN_ID || ''), Stop_No: String(l.Stop_No || ''),
        SO_No: String(l.SO_No || ''), SI_No: String(l.SI_No || ''),
        Item_Code: String(l.Item_Code || ''), Item_Name: String(l.Item_Name || ''),
        Qty: Number(l.Qty || 0), UOM: String(l.UOM || ''),
        Lowest_Qty: Number(l.Lowest_Qty || 0), Lowest_UOM: String(l.Lowest_UOM || ''),
        Unit_Price: Number(l.Unit_Price || 0), Line_Total: Number(l.Line_Total || 0),
        Cases: Number(l.Cases || 0), Bags: Number(l.Bags || 0), Free_Goods: Number(l.Free_Goods || 0),
        Deliv_Instr: String(l.Deliv_Instr || ''), Recv_From: String(l.Recv_From || ''),
        Recv_To: String(l.Recv_To || ''), MOP: String(l.MOP || ''),
        Remarks: String(l.Remarks || ''), Group_Name: String(l.Group_Name || ''),
        Branch: String(l.Branch || '')
      };
    }).filter(function(l){ return l.ASN_ID; });

    // Delivery Tags
    const tags = _rows(asnSS, TAB_TAGS).map(function(t) {
      return {
        id: String(t.Tag_ID || _id('TAG')),
        Tag_ID: String(t.Tag_ID || ''), ASN_ID: String(t.ASN_ID || ''),
        SI_No: String(t.SI_No || ''), Personnel_Code: String(t.Personnel_Code || ''),
        Personnel_Name: String(t.Personnel_Name || ''), Del_Status: String(t.Del_Status || ''),
        Reason: String(t.Reason || ''), Recipient: String(t.Recipient || ''),
        Deliv_TS: String(t.Deliv_TS || ''), Sync_TS: String(t.Sync_TS || ''),
        Offline: String(t.Offline || 'NO')
      };
    }).filter(function(t){ return t.ASN_ID; });

    // POD Photos
    const photos = _rows(asnSS, TAB_PHOTOS).map(function(p) {
      return {
        id: String(p.Photo_ID || _id('PHO')),
        Photo_ID: String(p.Photo_ID || ''), Tag_ID: String(p.Tag_ID || ''),
        ASN_ID: String(p.ASN_ID || ''), File_ID: String(p.File_ID || ''),
        Drive_URL: String(p.Drive_URL || ''), Uploaded_At: String(p.Uploaded_At || '')
      };
    }).filter(function(p){ return p.ASN_ID; });

    // SI Staging
    const si = _rows(asnSS, TAB_SI).map(function(s) {
      const siNo   = String(s.SI_Number || '').trim();
      const itCode = String(s.Item_Code || '').trim();
      return {
        id: (siNo + '_' + itCode).replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,400),
        Posting_Date: String(s.Posting_Date || ''), SI_Number: siNo,
        Cust_Code: String(s.Cust_Code || ''), Cust_Name: String(s.Cust_Name || ''),
        Route: String(s.Route || ''), Address: String(s.Address || ''),
        Group_Name: String(s.Group_Name || ''), Item_Code: itCode,
        Item_Name: String(s.Item_Name || ''),
        Quantity: Number(s.Quantity || 0), UOM: String(s.UOM || ''),
        Lowest_Qty: Number(s.Lowest_Qty || 0), Lowest_UOM: String(s.Lowest_UOM || ''),
        Unit_Price: Number(s.Unit_Price || 0), Line_Total: Number(s.Line_Total || 0),
        Branch: String(s.Branch || ''), Del_Status: String(s.Del_Status || 'Pending'),
        Tagged_By: String(s.Tagged_By || ''), Tagged_At: String(s.Tagged_At || ''),
        Archived: String(s.Archived || 'NO')
      };
    }).filter(function(s){ return s.SI_Number; });

    return { ok: true, dispatchPinHash, personnel, leadTimes, asns, lines, tags, photos, si };
  } catch(e) { return { ok: false, err: e.message }; }
}
