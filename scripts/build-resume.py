#!/usr/bin/env python3
"""Embed a text-first PDF download and its visible base64 (Python stdlib only)."""

import base64
from pathlib import Path
import re
import zlib

ROOT = Path(__file__).resolve().parent.parent
WIDTH, HEIGHT, MARGIN = 612, 792, 44  # US Letter, points
# Standard Helvetica metrics, ASCII 32-126 (1/1000 em).
WIDTHS = [
    278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
    1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
    333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
    556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
]


def escape(text):
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def measure(text, size):
    return sum(WIDTHS[ord(char) - 32] for char in text) * size / 1000


def wrap(text, size, width):
    lines = []
    current = ""
    for word in text.split():
        candidate = f"{current} {word}".strip()
        if current and measure(candidate, size) > width:
            lines.append(current)
            current = word
        else:
            current = candidate
    return lines + [current]


def make_pdf(source):
    # ASCII source keeps the standard-font encoding unambiguous for text parsers.
    source.encode("ascii")
    pages = []
    for page_number, section in enumerate(source.split("<!-- pagebreak -->"), 1):
        commands = []
        y = HEIGHT - MARGIN

        def text(value, size=10, bold=False, x=MARGIN):
            nonlocal y
            font = "F2" if bold else "F1"
            commands.append(f"BT /{font} {size} Tf 1 0 0 1 {x} {y:.2f} Tm ({escape(value)}) Tj ET")
            y -= size * 1.32

        if page_number > 1:
            text("Jasjeet Mavi | Technology leadership & hands-on engineering", 10, True)
            y -= 6
        for line in section.strip().splitlines():
            if not line.strip():
                y -= 4
                continue
            if line.startswith("# "):
                text(line[2:], 24, True)
            elif line.startswith("## "):
                y -= 5
                text(line[3:].upper(), 10, True)
                commands.append(f"0.75 G {MARGIN} {y + 7:.2f} m {WIDTH - MARGIN} {y + 7:.2f} l S 0 G")
                y -= 4
            elif line.startswith("### "):
                text(line[4:], 11, True)
            else:
                bullet = line.startswith("- ")
                content = line[2:] if bullet else line
                inset = 10 if bullet else 0
                lines = wrap(content, 10, WIDTH - 2 * MARGIN - inset)
                for index, segment in enumerate(lines):
                    text(("- " if index == 0 else "  ") + segment if bullet else segment,
                         x=MARGIN)
                if bullet:
                    y -= 3
            if y < 48:
                raise ValueError(f"Page {page_number} overflows: shorten resume.md or add a page break")
        total = len(source.split("<!-- pagebreak -->"))
        commands.append(f"BT /F1 8 Tf 1 0 0 1 {MARGIN} 25 Tm (Jasjeet Mavi | {page_number} / {total}) Tj ET")
        pages.append("\n".join(commands).encode("ascii"))

    objects = []

    def add(value):
        objects.append(value if isinstance(value, bytes) else value.encode("ascii"))
        return len(objects)

    add("<< /Type /Catalog /Pages 2 0 R /Lang (en-CA) >>")
    add("")  # Filled after page IDs are known.
    add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
    add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")
    info = add("<< /Title (Jasjeet Mavi - Resume) /Author (Jasjeet Mavi) /Subject (Technology leadership and hands-on engineering) >>")
    page_ids = []
    for content in pages:
        compressed = zlib.compress(content, 9)
        stream = add(f"<< /Length {len(compressed)} /Filter /FlateDecode >>\nstream\n".encode("ascii") + compressed + b"\nendstream")
        page_ids.append(add(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {WIDTH} {HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {stream} 0 R >>"))
    objects[1] = f"<< /Type /Pages /Kids [{' '.join(f'{i} 0 R' for i in page_ids)}] /Count {len(page_ids)} >>".encode("ascii")
    output = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for index, obj in enumerate(objects, 1):
        offsets.append(len(output))
        output.extend(f"{index} 0 obj\n".encode("ascii") + obj + b"\nendobj\n")
    xref = len(output)
    output.extend(f"xref\n0 {len(offsets)}\n0000000000 65535 f \n".encode("ascii"))
    for offset in offsets[1:]:
        output.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    output.extend(f"trailer\n<< /Size {len(offsets)} /Root 1 0 R /Info {info} 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode("ascii"))
    return bytes(output)


if __name__ == "__main__":
    pdf = make_pdf((ROOT / "resume.md").read_text())
    encoded = base64.b64encode(pdf).decode("ascii")
    index_path = ROOT / "index.html"
    html, count = re.subn(
        r"(<!-- cv-pdf:start -->).*?(<!-- cv-pdf:end -->)",
        lambda match: f'{match[1]}<span class="cv-data" aria-hidden="true">{encoded}</span>{match[2]}',
        index_path.read_text(), flags=re.S,
    )
    if count != 1:
        raise ValueError("Expected exactly one CV embed marker in index.html")
    html, count = re.subn(
        r'(<a class="cv-link" href=")[^"]*(")',
        lambda match: f'{match[1]}data:application/pdf;base64,{encoded}{match[2]}',
        html,
    )
    if count != 1:
        raise ValueError("Expected exactly one CV download link in index.html")
    index_path.write_text(html)
    print(f"Embedded PDF ({len(pdf):,} bytes) in the download link and refreshed the visible base64.")
