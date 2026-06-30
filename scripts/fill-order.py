#!/usr/bin/env python3
"""
Rellena el campo `order:` del frontmatter de cada nota a partir del prefijo
numerico de su nombre de archivo, para que el Explorer y las paginas de listado
de Quartz respeten tu numeracion (01, 02, 03 ...).

Reglas:
  - "NN Titulo.md"  -> order = NN            (p.ej. "05 Foo.md" -> order: 5)
  - "index.md"      -> order = prefijo NN de la CARPETA que lo contiene
                       (asi la carpeta se ordena por su propio numero)
  - Archivos sin prefijo numerico            -> se omiten
  - Archivos sin frontmatter (--- al inicio) -> se omiten (se reportan)

Por defecto NO escribe nada (dry-run): muestra lo que haria. Usa --write para
aplicar los cambios. Es idempotente: si `order:` ya existe con el valor correcto
no toca el archivo; si existe con otro valor lo actualiza.

Uso:
    python3 scripts/fill-order.py            # dry-run, muestra el plan
    python3 scripts/fill-order.py --write    # aplica los cambios
    python3 scripts/fill-order.py --write --force-folders   # tambien sobreescribe
                                             # el order de los index.md existentes
"""

import argparse
import re
import sys
from pathlib import Path

# Carpeta de notas y directorios ignorados (igual que ignorePatterns de quartz.config.ts)
CONTENT_DIR = Path(__file__).resolve().parent.parent / "content"
IGNORED_DIRS = {"private", "templates", ".obsidian", "_private"}

LEADING_NUM = re.compile(r"^\s*(\d+)")
FM_DELIM = "---"


def leading_number(name: str):
    """Devuelve el entero del prefijo numerico de `name`, o None si no hay."""
    m = LEADING_NUM.match(name)
    return int(m.group(1)) if m else None


def desired_order(md_path: Path):
    """order esperado para una nota; None si no aplica."""
    if md_path.stem == "index":
        # el order de un index.md sale del prefijo de su carpeta
        return leading_number(md_path.parent.name)
    return leading_number(md_path.stem)


def split_frontmatter(lines):
    """
    Devuelve (start, end) con los indices de las lineas '---' que delimitan el
    frontmatter YAML, o None si el archivo no empieza con frontmatter.
    `start` es la linea del '---' de apertura (0); `end` la del '---' de cierre.
    """
    if not lines or lines[0].strip() != FM_DELIM:
        return None
    for i in range(1, len(lines)):
        if lines[i].strip() == FM_DELIM:
            return (0, i)
    return None


def apply_order(lines, fm_end, order, force_folders, is_index):
    """
    Inserta o actualiza `order:` dentro del frontmatter (lineas 1..fm_end-1).
    Devuelve (new_lines, action) donde action es 'set' | 'update' | 'skip'.
    """
    order_re = re.compile(r"^order:\s*(.*)$")
    title_idx = None
    for i in range(1, fm_end):
        if lines[i].lstrip().startswith("title:"):
            title_idx = i
        m = order_re.match(lines[i])
        if m:
            current = m.group(1).strip()
            # index.md existente: solo se sobreescribe con --force-folders
            if current == str(order):
                return lines, "skip"
            if is_index and not force_folders:
                return lines, "skip"
            new = lines[:]
            new[i] = f"order: {order}\n"
            return new, "update"

    # no existe order: insertarlo justo despues de title (o al final del FM)
    insert_at = (title_idx + 1) if title_idx is not None else fm_end
    new = lines[:insert_at] + [f"order: {order}\n"] + lines[insert_at:]
    return new, "set"


def main():
    ap = argparse.ArgumentParser(description="Rellena order: desde el prefijo numerico del nombre.")
    ap.add_argument("--write", action="store_true", help="aplica los cambios (por defecto: dry-run)")
    ap.add_argument("--force-folders", action="store_true",
                    help="sobreescribe el order existente de los index.md")
    args = ap.parse_args()

    if not CONTENT_DIR.is_dir():
        sys.exit(f"No encuentro la carpeta de contenido: {CONTENT_DIR}")

    set_n = update_n = skip_n = no_prefix_n = no_fm_n = 0
    no_fm_files = []

    for md in sorted(CONTENT_DIR.rglob("*.md")):
        if any(part in IGNORED_DIRS for part in md.relative_to(CONTENT_DIR).parts):
            continue

        order = desired_order(md)
        if order is None:
            no_prefix_n += 1
            continue

        lines = md.read_text(encoding="utf-8").splitlines(keepends=True)
        fm = split_frontmatter(lines)
        if fm is None:
            no_fm_n += 1
            no_fm_files.append(md.relative_to(CONTENT_DIR))
            continue

        _, fm_end = fm
        new_lines, action = apply_order(
            lines, fm_end, order, args.force_folders, md.stem == "index"
        )
        if action == "skip":
            skip_n += 1
            continue

        rel = md.relative_to(CONTENT_DIR)
        print(f"  [{action:6}] order: {order:<3} {rel}")
        if action == "set":
            set_n += 1
        else:
            update_n += 1

        if args.write:
            md.write_text("".join(new_lines), encoding="utf-8")

    print("\nResumen:")
    print(f"  nuevos (set):        {set_n}")
    print(f"  actualizados:        {update_n}")
    print(f"  sin cambios:         {skip_n}")
    print(f"  sin prefijo (omit.): {no_prefix_n}")
    print(f"  sin frontmatter:     {no_fm_n}")
    for f in no_fm_files[:20]:
        print(f"      - {f}")
    if len(no_fm_files) > 20:
        print(f"      ... y {len(no_fm_files) - 20} mas")

    if not args.write:
        print("\n(dry-run) No se escribio nada. Ejecuta con --write para aplicar.")


if __name__ == "__main__":
    main()
