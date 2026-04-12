/**
 * Google Apps Script — GDPR Consent Email Handler
 *
 * SETUP:
 * 1. Go to https://script.google.com and create a new project
 * 2. Paste this code into Code.gs
 * 3. Click Deploy > New deployment
 * 4. Type: Web app
 * 5. Execute as: Me | Who has access: Anyone
 * 6. Copy the deployment URL and paste it into consimtamant.html (APPS_SCRIPT_URL)
 */

const RECIPIENT_EMAIL = 'hello@coresociety.ro';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const timestamp = new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' });

    // Build consent summary
    const consimtamant = [
      ['Fotografiere și filmare', data.foto_video || '—'],
      ['Publicare rețele sociale/site', data.social_media || '—'],
      ['Materiale de marketing', data.marketing || '—'],
      ['Newsletter și comunicări', data.newsletter || '—'],
    ];

    const consentRows = consimtamant
      .map(([label, val]) => {
        const color = val === 'Da' ? '#4CD964' : val === 'Nu' ? '#cc3333' : '#888';
        return '<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;">' + label + '</td>' +
               '<td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:700;color:' + color + ';">' + val + '</td></tr>';
      })
      .join('');

    // Minor section
    let minorHtml = '';
    if (data.isMinor === true) {
      minorHtml = '<div style="background:#fff8e1;border-left:3px solid #f0a500;padding:12px 16px;margin:16px 0;border-radius:0 6px 6px 0;">' +
        '<strong>Participant minor</strong><br>' +
        'Nume minor: ' + (data.minorNume || '—') + '<br>' +
        'Data nașterii: ' + (data.minorDOB || '—') + '<br>' +
        'Relația: ' + (data.minorRelatie || '—') +
        '</div>';
    }

    // Signature image
    const sigHtml = data.signature
      ? '<img src="' + data.signature + '" style="max-width:400px;border:1px solid #ddd;border-radius:4px;" alt="Semnatura">'
      : '<em>Semnătura nu a fost capturată</em>';

    const htmlBody = '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;">' +
      '<div style="background:#111;padding:24px;text-align:center;">' +
        '<span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:2px;">CORE SOCIETY</span>' +
        '<br><span style="color:#4CD964;font-size:11px;letter-spacing:2px;">CONSIMȚĂMÂNT GDPR</span>' +
      '</div>' +
      '<div style="padding:24px;">' +
        '<p style="color:#888;font-size:12px;margin-bottom:16px;">' + timestamp + '</p>' +
        '<h3 style="margin-bottom:4px;">' + data.nume + '</h3>' +
        '<p style="color:#555;margin-bottom:16px;">' + data.email + ' &bull; ' + data.telefon + '</p>' +
        minorHtml +
        '<table style="width:100%;border-collapse:collapse;margin:20px 0;">' +
          '<tr style="background:#f5f5f5;"><th style="padding:8px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888;">Categorie</th>' +
          '<th style="padding:8px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888;">Răspuns</th></tr>' +
          consentRows +
        '</table>' +
        '<div style="margin-top:24px;">' +
          '<p style="font-size:12px;color:#888;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">Semnătură</p>' +
          sigHtml +
        '</div>' +
      '</div>' +
      '<div style="background:#f5f5f5;padding:16px 24px;font-size:11px;color:#888;text-align:center;">' +
        'Formular completat pe coresociety.ro/consimtamant.html' +
      '</div>' +
    '</body></html>';

    MailApp.sendEmail({
      to: RECIPIENT_EMAIL,
      subject: 'Consimțământ GDPR — ' + data.nume,
      htmlBody: htmlBody,
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
