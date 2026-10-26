/**
 * Restate Deals CRM: receives leads from restate.deals and demo.restate.deals
 * and adds them to the "Deals" tab with stage "New lead".
 * Also emails ceo@restate.deals about every new lead.
 *
 * Setup: Extensions → Apps Script in the CRM sheet, paste this file,
 * Deploy → New deployment → Web app, Execute as: Me, Who has access: Anyone.
 * Put the web app URL into CONFIG.leadsUrl on both sites.
 */
const NOTIFY_EMAIL = 'ceo@restate.deals';
const SHEET_NAME = 'Deals';

function doPost(e) {
  const p = (e && e.parameter) || {};
  const clean = v => String(v || '').replace(/^[=+\-@]+/, '').slice(0, 500).trim();
  const lead = {
    name: clean(p.name),
    company: clean(p.company),
    whatsapp: clean(p.whatsapp),
    email: clean(p.email),
    type: clean(p.type) || 'Buyer (investor)',
    site: clean(p.site),
    src: clean(p.src),
    lang: clean(p.lang),
    notes: clean(p.notes),
  };
  if (!lead.name && !lead.whatsapp && !lead.email) return ok_();

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
    const colA = sh.getRange('A:A').getValues();
    let row = colA.length;
    while (row > 1 && colA[row - 1][0] === '') row--;
    row++;
    const today = Utilities.formatDate(new Date(), 'America/Panama', 'yyyy-MM-dd');
    // A..J: Date, Name, Type, Company, Country, WhatsApp, Email, Source, Stage, Plan
    sh.getRange(row, 1, 1, 10).setValues([[today, lead.name, lead.type, lead.company, '', lead.whatsapp, lead.email, 'Website form', 'New lead', '']]);
    // Q..T: Next step, Next step date, Owner, Notes
    const note = [lead.site, lead.lang && 'lang: ' + lead.lang, lead.src && 'utm: ' + lead.src, lead.notes].filter(Boolean).join(' · ');
    sh.getRange(row, 17, 1, 4).setValues([['Reply on WhatsApp', today, 'Artem', note]]);
  } finally {
    lock.releaseLock();
  }

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: 'New lead: ' + (lead.name || lead.whatsapp) + ' (' + lead.site + ')',
    body: [
      'Name: ' + lead.name,
      'Company / building: ' + lead.company,
      'WhatsApp: ' + lead.whatsapp,
      'Email: ' + lead.email,
      'Type: ' + lead.type,
      'Site: ' + lead.site,
      'Source (utm): ' + (lead.src || 'direct'),
      'Notes: ' + lead.notes,
      '',
      'CRM: ' + SpreadsheetApp.getActive().getUrl(),
    ].join('\n'),
  });
  return ok_();
}

function ok_() {
  return ContentService.createTextOutput('ok');
}

/** Run once from the editor to check the setup: adds a test row and sends a test email. */
function testLead() {
  doPost({ parameter: { name: 'Test lead', whatsapp: '+507 0000 0000', email: 'test@example.com', site: 'test', type: 'Developer (client)' } });
}
