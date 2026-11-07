/**
 * Boda de Salo y Mati — recepción de confirmaciones.
 * Pegá este archivo en Extensiones > Apps Script de la hoja de destino.
 * Implementación para enviar un formulario HTML de GitHub Pages a Google Sheets.
 */
const SHEET_ID = '1yu2zT4ilOlXZWi3LUqfU6j-aFcb1OgFLR2IWNh7_YgY';
const SHEET_TAB = 'Confirmaciones';
const SONGS_TAB = 'Canciones';
const TARGET_ORIGIN = 'https://taleika.github.io';
const HEADERS = ['Fecha de recepción','Nombre','Apellido','Asistencia','Email','Teléfono','Preferencia alimentaria','Detalle','Origen'];
const SONG_HEADERS = ['Fecha de recepción','Canción','Intérprete'];

function doPost(e) {
  let payload = {source:'salo-mati-rsvp',ok:false,requestId:'',message:'No se registró la respuesta.'};
  try {
    const p = e && e.parameter ? e.parameter : {};
    const nonce = String(p.requestId || '');
    if (!/^[A-Za-z0-9_-]{16,90}$/.test(nonce)) throw new Error('ID de envío inválido.');
    payload.requestId = nonce;
    if (String(p.website || '').trim()) throw new Error('Envío rechazado.');
    if (p.tipo === 'playlist') {
      let songs;
      try { songs = JSON.parse(String(p.canciones || '')); }
      catch (parseErr) { throw new Error('No pudimos interpretar las canciones.'); }
      if (!Array.isArray(songs) || songs.length < 1 || songs.length > 5) {
        throw new Error('Podés sugerir entre una y cinco canciones.');
      }
      const cleanSongs = songs.map(function(song) {
        const titulo = clean_(song && song.titulo, 120);
        const interprete = clean_(song && song.interprete, 120);
        if (!titulo || !interprete) throw new Error('Indicá el tema y su intérprete en cada canción.');
        return [safe_(titulo),safe_(interprete)];
      });
      const lock = LockService.getScriptLock();
      if (!lock.tryLock(15000)) throw new Error('Servidor ocupado. Intentá nuevamente.');
      try {
        const ss = SpreadsheetApp.openById(SHEET_ID);
        let sh = ss.getSheetByName(SONGS_TAB);
        if (!sh) sh = ss.insertSheet(SONGS_TAB);
        if (sh.getLastRow() === 0) sh.appendRow(SONG_HEADERS);
        const receivedAt = new Date();
        const rows = cleanSongs.map(function(song) { return [receivedAt,song[0],song[1]]; });
        sh.getRange(sh.getLastRow()+1,1,rows.length,SONG_HEADERS.length).setValues(rows);
      } finally {
        lock.releaseLock();
      }
      payload.ok = true;
      payload.message = '¡Gracias! Tus canciones fueron sugeridas.';
    } else {
    const name = clean_(p.nombre,100);
    const lastname = clean_(p.apellido,100);
    const answer = clean_(p.asistencia,4);
    const email = clean_(p.email,150);
    const phone = clean_(p.telefono,60);
    const food = clean_(p.alimentacion,80);
    const detail = clean_(p.detalle,250);
    if (!name || !lastname || !['Sí','No'].includes(answer)) throw new Error('Completá nombre, apellido y asistencia.');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email inválido.');
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) throw new Error('Servidor ocupado. Intentá nuevamente.');
    try {
      const ss = SpreadsheetApp.openById(SHEET_ID);
      let sh = ss.getSheetByName(SHEET_TAB);
      if (!sh) sh = ss.insertSheet(SHEET_TAB);
      if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
      sh.appendRow([new Date(),safe_(name),safe_(lastname),answer,safe_(email),safe_(phone),safe_(answer==='Sí'?food:''),safe_(answer==='Sí'?detail:''),'Web individual']);
    } finally {
      lock.releaseLock();
    }
    payload.ok = true;
    payload.message = 'Tu respuesta quedó registrada.';
    }
  } catch (err) {
    payload.message = String(err.message || 'No se pudo registrar.');
  }
  const serialized = JSON.stringify(payload).replace(/</g,'\\u003c');
  const html = '<!doctype html><html><body><script>window.top.postMessage(' + serialized + ',' + JSON.stringify(TARGET_ORIGIN) + ');<\/script></body></html>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function clean_(v,max) {return String(v==null?'':v).trim().replace(/[\u0000-\u001F\u007F]/g,' ').slice(0,max);}
function safe_(v) {return /^[=+@\-]/.test(v)?("'"+v):v;}
