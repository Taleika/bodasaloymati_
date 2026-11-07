# Salo & Mati — invitación individual

Copia independiente de la invitación original para **confirmaciones de una sola persona**.

- Invitación: https://taleika.github.io/bodasaloymati_/
- Origen de confirmaciones en la hoja **Confirmaciones**: **Web individual**.
- Planilla de destino: la misma que usa `bodasaloymati`.
- Las sugerencias de canciones siguen enviándose al receptor existente y a la pestaña **Canciones**.
- La invitación original y su código permanecen sin cambios.

## Habilitar confirmaciones individuales

1. Abrí la misma planilla Google Sheets y entrá a **Extensiones → Apps Script**.
2. Para no modificar la aplicación que ya funciona, creá un **proyecto de Apps Script independiente** (desde https://script.google.com/home/projects/create), pegá el contenido de [apps-script/Code.gs](apps-script/Code.gs) y guardá.
3. Implementá como **Aplicación web** → ejecutar como **Yo** → acceso **Cualquier persona**.
4. Copiá la nueva URL `/exec` y pegala en `rsvpEndpoint` de [config.js](config.js). Dejá `songsEndpoint` sin cambios.
5. Probá con un nombre de prueba y verificá que en **Confirmaciones** figure **Web individual**.

## Habilitar GitHub Pages

En el repositorio `Taleika/bodasaloymati_`, entrá en **Settings → Pages** y seleccioná **GitHub Actions** como origen. Luego corré el flujo **Publish individual invitation** desde la pestaña Actions, o realizá un cambio en `main`.
