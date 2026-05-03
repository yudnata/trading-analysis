---
# Salin file ini → slice-X-nama.md setelah Plan Mode / sebelum eksekusi besar.
# Samakan isi `todos` dengan checklist di CHECKPOINT.md untuk slice yang sama.
# Update status: pending | in_progress | completed
name: "Slice N — Judul"
overview: "Satu kalimat tujuan slice."
todos:
  - id: plan-saved
    content: "Plan tersimpan & PROMPT_LOG diisi (bagian PLAN MODE)"
    status: pending
  - id: example-task
    content: "Salin baris checklist dari CHECKPOINT jadi todo di sini"
    status: pending
isProject: true
---

# Slice N — Judul

## Tujuan

(Ringkas dari plan Cursor atau CHECKPOINT.)

## Rujukan wajib agent

- [CHECKPOINT.md](../../CHECKPOINT.md) — checklist slice ini
- [CONTEXT.md](../../CONTEXT.md) — state terkini
- [.cursor/rules](../rules)

## Catatan eksekusi

(Tulis selama/ setelah coding: keputusan, file penting, utang teknis.)
