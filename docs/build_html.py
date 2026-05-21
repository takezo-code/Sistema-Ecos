"""Gera SISTEMA_RPG.html para impressão/PDF. Uso: python build_html.py"""
import markdown
from pathlib import Path

ROOT = Path(__file__).parent
md_text = (ROOT / "SISTEMA_RPG.md").read_text(encoding="utf-8")
body = markdown.markdown(md_text, extensions=["tables", "toc"])

css = """
@page { margin: 2cm; }
body { font-family: Georgia, serif; font-size: 11pt; line-height: 1.55; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 2rem; }
h1 { font-size: 22pt; border-bottom: 2px solid #991b1b; page-break-after: avoid; }
h2 { font-size: 14pt; color: #991b1b; margin-top: 1.5em; page-break-after: avoid; }
h3 { font-size: 12pt; margin-top: 1.2em; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 10pt; }
th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
th { background: #f5f5f5; }
code { background: #f0f0f0; padding: 1px 4px; font-size: 9pt; }
blockquote { border-left: 3px solid #d97706; margin: 1em 0; padding-left: 1em; color: #444; }
ul { margin: 0.5em 0; }
@media print { a { color: inherit; text-decoration: none; } }
"""

html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Sistema RPG — Manual do Mestre</title>
  <style>{css}</style>
</head>
<body>
{body}
<p style="margin-top:3em;font-size:9pt;color:#888;border-top:1px solid #ddd;padding-top:1em;">
  Para PDF: Ctrl+P neste arquivo → &quot;Salvar como PDF&quot;.
</p>
</body>
</html>
"""

out = ROOT / "SISTEMA_RPG.html"
out.write_text(html, encoding="utf-8")
print(f"Gerado: {out}")
