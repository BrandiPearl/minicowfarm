/**
 * Paste into https://script.google.com (account: lynnjames09090@gmail.com)
 *
 * 1. New project → paste this file
 * 2. Set Script property WEBHOOK_SECRET to a long random string
 *    (Project Settings → Script properties)
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the web app URL into Cloudflare Worker secret GMAIL_WEBHOOK_URL
 * 5. Put the same secret value in Worker secret GMAIL_WEBHOOK_SECRET
 */
function doPost(e) {
  try {
    const secret = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");
    const body = JSON.parse(e.postData.contents || "{}");
    if (!secret || body.secret !== secret) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "unauthorized" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const to = String(body.to || "").trim();
    const subject = String(body.subject || "Website inquiry").trim();
    const text = String(body.text || "");
    const replyTo = String(body.replyTo || "").trim();

    if (!to) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "missing to" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    GmailApp.sendEmail(to, subject, text, replyTo ? { replyTo: replyTo } : {});

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err && err.message ? err.message : err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
