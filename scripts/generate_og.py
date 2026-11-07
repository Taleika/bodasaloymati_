#!/usr/bin/env python3
"""Construye una miniatura para WhatsApp a partir de la foto de portada real."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont, ImageFilter

root = Path(__file__).resolve().parent.parent
photo = root / 'images' / 'Book S&M (89).jpg'
out = root / 'og-preview.jpg'
size = (1200, 630)
with Image.open(photo) as im:
    im = ImageOps.exif_transpose(im).convert('RGB')
    # Mantiene el encuadre reconocible de la portada, con recorte centrado.
    cover = ImageOps.fit(im, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.43))
overlay = Image.new('RGBA', size, (0, 0, 0, 0))
d = ImageDraw.Draw(overlay)
for y in range(size[1]):
    alpha = int(25 + 135 * (y / size[1]) ** 2.5)
    d.line((0, y, size[0], y), fill=(16, 16, 12, alpha))
canvas = Image.alpha_composite(cover.convert('RGBA'), overlay)
d = ImageDraw.Draw(canvas)
font_dir = Path('/usr/share/fonts/truetype/dejavu')
serif = font_dir / 'DejaVuSerif.ttf'
sans = font_dir / 'DejaVuSans.ttf'
name_font = ImageFont.truetype(str(serif), 78)
small_font = ImageFont.truetype(str(sans), 22)
def center_label(text, font, y, spacing=0):
    box = d.textbbox((0,0),text,font=font,stroke_width=0)
    x = (size[0]-(box[2]-box[0]))/2
    d.text((x,y),text,font=font,fill='white',stroke_width=1,stroke_fill='#5c5144')
center_label('Salo & Mati',name_font,453)
center_label('09  ·  01  ·  2027',small_font,568)
canvas.convert('RGB').save(out,quality=89,optimize=True,progressive=True,subsampling=0)
print('Generated:',out, 'size:',out.stat().st_size)
