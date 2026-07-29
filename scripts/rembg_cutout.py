"""Recorta el fondo de las ilustraciones con rembg (segmentación por IA).
Maneja huecos internos (p. ej. el espacio entre las piernas) que el
flood-fill por bordes no puede resolver. Uso:
    python scripts/rembg_cutout.py public/modelos modelo1 modelo2 ...
"""
import sys
from pathlib import Path
from rembg import remove, new_session

directory = Path(sys.argv[1])
names = sys.argv[2:]

# u2netp es más ligero; u2net da mejores bordes en ilustraciones.
session = new_session("u2net")

for name in names:
    src = directory / f"{name}.jpeg"
    dst = directory / f"{name}.png"
    data = src.read_bytes()
    out = remove(
        data,
        session=session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=250,
        alpha_matting_background_threshold=15,
        alpha_matting_erode_size=6,
    )
    dst.write_bytes(out)
    print(f"{dst.name} listo")
