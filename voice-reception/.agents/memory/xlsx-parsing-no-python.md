---
name: Parsing xlsx without python or the xlsx package
description: How to read attached .xlsx spreadsheets in this env when python3 and the xlsx npm package are unavailable.
---

# Reading .xlsx attachments in this environment

This repo's sandbox has **no `python3`** and the **`xlsx` npm package is not installed**, so the
usual quick paths fail. An `.xlsx` is just a ZIP of XML — extract and parse it directly.

**How to apply:**
1. `unzip` the file to a temp dir. The useful parts are `xl/sharedStrings.xml` (all text values,
   indexed) and `xl/worksheets/sheet1.xml` (cells).
2. Build a strings array from each `<si>...</si>` (concatenate its `<t>` runs; unescape entities).
3. For each `<c r="A1" ...>`, the value is in `<v>`. If the cell tag contains `t="s"`, the `<v>`
   is an **index into the shared-strings array**; otherwise it's a literal number.

**Gotcha (cost me a wrong first parse):** the `t="s"` type attribute can appear *after* the style
attribute (e.g. `<c r="B4" s="3" t="s">`). A lazy regex that grabs the type right after the cell
ref will miss it and silently treat string cells as numbers (you'll see raw shared-string indices
instead of text). Match the whole attribute list and test `/\bt="s"/` against it.
