/**
 * WhaleHome CRM: receive leads from the Telegram bot and the whalehome.io quiz.
 *
 * Setup (once, from the "WhaleHome CRM" Google Sheet):
 *   Extensions -> Apps Script -> paste this file -> Deploy -> New deployment ->
 *   type "Web app", Execute as "Me", Who has access "Anyone" -> Deploy -> copy the /exec URL.
 *   Put that URL into the bot (LEADS_URL) and into CONFIG.leadsUrl of panama-crypto-homes/index.html.
 *
 * Writes one row to the "Leads" tab (columns A-O) and emails NOTIFY_EMAIL.
 */
const NOTIFY_EMAIL = 'ceo@restate.deals';

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.hp) return ok_(); // honeypot from the site form

  const isBot = p.source === 'Telegram bot';
  const source = p.source || 'Website quiz';
  const name = clip_(p.name);
  const contact = clip_(p.contact || p.whatsapp);
  const email = clip_(p.email || (/\S+@\S+\.\S+/.test(contact) ? contact : ''));
  const interest = clip_(p.interest || (isBot ? '' : 'Buy a home'));
  const lang = clip_((p.lang || '').toUpperCase());
  const notes = clip_([p.notes, p.src && 'Source: ' + p.src, p.page && 'Page: ' + p.page].filter(String).join(' · '), 1000);
  if (!name && !contact && !notes) return ok_();

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = SpreadsheetApp.getActive().getSheetByName('Leads');
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    sh.appendRow([today, name, contact, email, source, interest, clip_(p.budget), clip_(p.pay), clip_(p.area), lang,
      'New', 'Reply within 1 business day', '', '', notes]);
  } finally {
    lock.releaseLock();
  }

  try {
    MailApp.sendEmail(NOTIFY_EMAIL, 'WhaleHome lead: ' + (name || contact) + ' (' + source + ')',
      [['Name', name], ['Contact', contact], ['Source', source], ['Interest', interest], ['Budget', p.budget], ['Language', lang], ['Notes', notes]]
        .filter(r => r[1]).map(r => r[0] + ': ' + r[1]).join('\n') +
      '\n\n' + SpreadsheetApp.getActive().getUrl());
  } catch (err) {}
  return ok_();
}

function doGet() { return ok_(); }

// Cells starting with = + - @ are written as text so a lead can't inject a formula.
function clip_(v, max) {
  let s = String(v == null ? '' : v).trim().slice(0, max || 300);
  if (/^[=+\-@]/.test(s) && !/^\+\d/.test(s)) s = "'" + s;
  return s;
}
function ok_() { return ContentService.createTextOutput('ok'); }
