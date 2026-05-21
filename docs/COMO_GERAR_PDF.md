# Como gerar o PDF do manual

O manual completo está em **`SISTEMA_RPG.md`**.

## Opção 1 — Navegador (recomendado)

1. Abra **`SISTEMA_RPG.html`** no Chrome ou Edge (duplo clique no arquivo).
2. Pressione **Ctrl+P**.
3. Destino: **Salvar como PDF**.
4. Margens: padrão ou “Mínimas”.
5. Salvar.

Para atualizar o HTML após editar o Markdown:

```bash
python docs/build_html.py
```

## Opção 2 — VS Code / Cursor

1. Instale a extensão **Markdown PDF**.
2. Abra `docs/SISTEMA_RPG.md`.
3. Comando: **Markdown PDF: Export (pdf)**.

## Opção 3 — Pandoc (linha de comando)

Se tiver [Pandoc](https://pandoc.org/) instalado:

```bash
pandoc docs/SISTEMA_RPG.md -o docs/SISTEMA_RPG.pdf --pdf-engine=xelatex -V lang=pt-BR
```

## Documentos relacionados

- `ECO_OVERLOAD.md` — Sobrecarga de Eco (técnico)
- `ECO_SKILLS.md` — Habilidades de Eco (técnico)
