/**
 * Restate Deals: Meta Ads stats -> Google Sheet, every 3 days.
 *
 * Install once (sheet "Restate Deals: Meta Ads stats"):
 *   1. Extensions -> Apps Script -> replace everything with this file -> Save.
 *   2. Reload the sheet. Menu "Meta Ads" -> "Connect": paste the access token and the ad account ID.
 *      The token is stored in the script's private properties, never in the sheet or in git.
 *   3. Menu "Meta Ads" -> "Turn on every 3 days" (also pulls the last 30 days right away).
 *
 * Tabs it writes:
 *   "Ads by day"  one row per day and ad (Graph API insights, level=ad, time_increment=1). Rows for the same
 *                 day + ad are replaced on the next run, because Meta keeps updating the last few days.
 *   "Settings"    B2 ad account ID (shown), B3 days to re-pull each run, B4 last update, B5 last status.
 */
var GRAPH = 'https://graph.facebook.com/v25.0/';
var SHEET_DATA = 'Ads by day';
var SHEET_SET = 'Settings';
var HEAD = ['Date', 'Campaign', 'Ad set', 'Ad', 'Spend ($)', 'Impressions', 'Reach', 'Link clicks', 'Landing page views',
  'Leads (site forms)', 'WhatsApp / Messenger chats', 'Ad ID'];

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Meta Ads')
    .addItem('Connect (token + ad account)', 'connect')
    .addItem('Pull now', 'pullNow')
    .addItem('Turn on every 3 days', 'turnOn')
    .addItem('Turn off', 'turnOff')
    .addToUi();
}

function connect() {
  var ui = SpreadsheetApp.getUi(), props = PropertiesService.getScriptProperties();
  var t = ui.prompt('Meta access token', 'Paste the token with ads_read permission.', ui.ButtonSet.OK_CANCEL);
  if (t.getSelectedButton() !== ui.Button.OK) return;
  var a = ui.prompt('Ad account ID', 'The number after act= in the Ads Manager address, for example 1234567890.', ui.ButtonSet.OK_CANCEL);
  if (a.getSelectedButton() !== ui.Button.OK) return;
  var acc = String(a.getResponseText()).replace(/\D/g, '');
  props.setProperty('META_TOKEN', String(t.getResponseText()).trim());
  props.setProperty('META_ACCOUNT', acc);
  sheet_(SHEET_SET).getRange('B2').setValue('act_' + acc);
  var r = UrlFetchApp.fetch(GRAPH + 'act_' + acc + '?fields=name,currency&access_token=' + encodeURIComponent(props.getProperty('META_TOKEN')), { muteHttpExceptions: true });
  status_(r.getResponseCode() === 200 ? 'Connected: ' + JSON.parse(r.getContentText()).name : 'Connect failed: ' + error_(r));
  ui.alert(sheet_(SHEET_SET).getRange('B5').getValue());
}

function turnOn() {
  turnOff();
  ScriptApp.newTrigger('pull').timeBased().everyDays(3).atHour(8).inTimezone('America/Panama').create();
  pull_(30);
  SpreadsheetApp.getUi().alert('On. The sheet updates every 3 days around 8:00 Panama time.');
}

function turnOff() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'pull') ScriptApp.deleteTrigger(t); });
}

function pullNow() { pull_(Number(sheet_(SHEET_SET).getRange('B3').getValue()) || 3); }

/* trigger entry point */
function pull() { pull_(Number(sheet_(SHEET_SET).getRange('B3').getValue()) || 3); }

function pull_(days) {
  var props = PropertiesService.getScriptProperties(), token = props.getProperty('META_TOKEN'), acc = props.getProperty('META_ACCOUNT');
  if (!token || !acc) { status_('Not connected: menu Meta Ads -> Connect'); return; }
  var tz = 'America/Panama', until = new Date(Date.now() - 864e5), since = new Date(until.getTime() - (days - 1) * 864e5);
  var range = JSON.stringify({ since: Utilities.formatDate(since, tz, 'yyyy-MM-dd'), until: Utilities.formatDate(until, tz, 'yyyy-MM-dd') });
  var url = GRAPH + 'act_' + acc + '/insights?level=ad&time_increment=1&limit=500' +
    '&fields=date_start,campaign_name,adset_name,ad_name,ad_id,spend,impressions,reach,inline_link_clicks,actions' +
    '&time_range=' + encodeURIComponent(range) + '&access_token=' + encodeURIComponent(token);
  var rows = [];
  while (url) {
    var r = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) { status_('Error: ' + error_(r)); return; }
    var j = JSON.parse(r.getContentText());
    (j.data || []).forEach(function (d) {
      var act = {}; (d.actions || []).forEach(function (x) { act[x.action_type] = Number(x.value) || 0; });
      var leads = act['lead'] != null ? act['lead'] : (act['offsite_conversion.fb_pixel_lead'] || 0) + (act['onsite_web_lead'] || 0);
      rows.push([d.date_start, d.campaign_name, d.adset_name, d.ad_name, Number(d.spend) || 0, Number(d.impressions) || 0,
        Number(d.reach) || 0, Number(d.inline_link_clicks) || 0, act['landing_page_view'] || 0, leads,
        act['onsite_conversion.messaging_conversation_started_7d'] || 0, String(d.ad_id)]);
    });
    url = j.paging && j.paging.next;
  }
  var sh = sheet_(SHEET_DATA);
  if (sh.getLastRow() === 0) sh.appendRow(HEAD);
  // replace rows for the same day + ad, keep everything else
  var keys = {}; rows.forEach(function (r) { keys[r[0] + '|' + r[11]] = 1; });
  var last = sh.getLastRow();
  if (last > 1) {
    var old = sh.getRange(2, 1, last - 1, HEAD.length).getValues();
    for (var i = old.length - 1; i >= 0; i--) {
      var d0 = old[i][0] instanceof Date ? Utilities.formatDate(old[i][0], tz, 'yyyy-MM-dd') : String(old[i][0]);
      if (keys[d0 + '|' + String(old[i][11])]) sh.deleteRow(i + 2);
    }
  }
  if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEAD.length).setValues(rows);
  if (sh.getLastRow() > 2) sh.getRange(2, 1, sh.getLastRow() - 1, HEAD.length).sort({ column: 1, ascending: false });
  sheet_(SHEET_SET).getRange('B4').setValue(Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm') + ' (Panama)');
  status_('OK: ' + rows.length + ' rows for ' + JSON.parse(range).since + ' to ' + JSON.parse(range).until);
}

function sheet_(name) { var ss = SpreadsheetApp.getActive(); return ss.getSheetByName(name) || ss.insertSheet(name); }
function status_(t) { sheet_(SHEET_SET).getRange('B5').setValue(t); }
function error_(r) { try { return JSON.parse(r.getContentText()).error.message; } catch (e) { return 'HTTP ' + r.getResponseCode(); } }
