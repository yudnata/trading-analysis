# PROMPT LOG — DOKUMENTASI AI-ASSISTED DEVELOPMENT

## Catat SETIAP prompt dan plan yang dipakai di Cursor

**Integrasi:** Setelah Plan Mode, isi bagian **PLAN MODE** di bawah untuk slice yang sama, dan pastikan file plan di `.cursor/plans/` punya `todos:` yang mirror checklist [CHECKPOINT.md](CHECKPOINT.md). [CONTEXT.md](CONTEXT.md) baris **Plan file (slice aktif)** harus mengarah ke file plan itu.

---

## Cara Isi Log Ini

Untuk setiap slice ada DUA hal yang dicatat:

1. **Plan** yang dibuat Cursor lewat Plan Mode
2. **Prompt-prompt** yang diketik selama eksekusi

```text
### [Slice X] — PLAN MODE
- Tanggal      : DD/MM/YYYY HH:MM
- Cara aktifkan: Shift+Tab di Agents Window
- Plan tersimpan: .cursor/plans/slice-X-nama.md
- Isi plan     : [ringkasan poin-poin plan yang dibuat Cursor]
- Revisi plan  : [apa yang kamu edit dari plan awal, atau '-']

### [Slice X] — Prompt ke-N
- Tanggal   : DD/MM/YYYY HH:MM
- Tujuan    : [apa yang ingin dicapai]
- Prompt    :
  "[tulis prompt persis seperti yang kamu ketik]"
- Hasil     : [ ] Berhasil  [ ] Gagal  [ ] Perlu Revisi
- File      : [path/file.ts]
- Kendala   : [masalah atau '-']
- Solusi    : [cara mengatasi atau '-']
```

---

## SLICE 1 — Setup Project & Struktur Folder

### [Slice 1] — PLAN MODE

- Tanggal       : 03/05/2026
- Cara aktifkan : Agent mode (plan konfirmasi intent + eksekusi setup)
- Plan tersimpan: .cursor/plans/slice-1-setup.md
- Isi plan      : Next.js 14 + Express TS + feature routes + env FRONTEND_URL; DB via pg/SQL (bukan Prisma); ringkasan di slice-1-setup.md
- Revisi plan   : -

### [Slice 1] — Prompt ke-1

- Tanggal : 03/05/2026
- Tujuan  : Implementasi pemahaman intent / Slice 1 setup proyek
- Prompt  :
  "Implement the plan as specified... complete all to-dos."
- Hasil   : [x] Berhasil  [ ] Gagal  [ ] Perlu Revisi
- File    : frontend/*, backend/src/*, backend/db/, .env.example
- Kendala : -
- Solusi  : -

---

## SLICE 2 — Database Schema & Koneksi

### [Slice 2] — PLAN MODE

- Tanggal       : DD/MM/YYYY  HH:mm
- Cara aktifkan : Shift+Tab di Agents Window
- Plan tersimpan: .cursor/plans/slice-2-database.md
- Isi plan      : [tulis ringkasan poin plan yang Cursor buat]
- Revisi plan   : -

### [Slice 2] — Prompt ke-1

- Tanggal : DD/MM/YYYY  HH:mm
- Tujuan  : [isi]
- Prompt  :
  "[isi]"
- Hasil   : [ ] Berhasil  [ ] Gagal  [ ] Perlu Revisi
- File    : -
- Kendala : -
- Solusi  : -

---

## SLICE 3 — Redis Cache & Cron Job

### [Slice 3] — PLAN MODE

- Tanggal       : DD/MM/YYYY  HH:mm
- Cara aktifkan : Shift+Tab di Agents Window
- Plan tersimpan: .cursor/plans/slice-3-redis.md
- Isi plan      : [tulis ringkasan poin plan yang Cursor buat]
- Revisi plan   : -

### [Slice 3] — Prompt ke-1

- Tanggal : DD/MM/YYYY  HH:mm
- Tujuan  : [isi]
- Prompt  :
  "[isi]"
- Hasil   : [ ] Berhasil  [ ] Gagal  [ ] Perlu Revisi
- File    : -
- Kendala : -
- Solusi  : -

---

## SLICE 4 — Kalkulasi Indikator Teknikal

### [Slice 4] — PLAN MODE

- Tanggal       : DD/MM/YYYY  HH:mm
- Cara aktifkan : Shift+Tab di Agents Window
- Plan tersimpan: .cursor/plans/slice-4-indicators.md
- Isi plan      : [tulis ringkasan poin plan yang Cursor buat]
- Revisi plan   : -

### [Slice 4] — Prompt ke-1

- Tanggal : DD/MM/YYYY  HH:mm
- Tujuan  : [isi]
- Prompt  :
  "[isi]"
- Hasil   : [ ] Berhasil  [ ] Gagal  [ ] Perlu Revisi
- File    : -
- Kendala : -
- Solusi  : -

---

## SLICE 5 — API Endpoints Backend

### [Slice 5] — PLAN MODE

- Tanggal       : DD/MM/YYYY  HH:mm
- Cara aktifkan : Shift+Tab di Agents Window
- Plan tersimpan: .cursor/plans/slice-5-endpoints.md
- Isi plan      : [tulis ringkasan poin plan yang Cursor buat]
- Revisi plan   : -

### [Slice 5] — Prompt ke-1

- Tanggal : DD/MM/YYYY  HH:mm
- Tujuan  : [isi]
- Prompt  :
  "[isi]"
- Hasil   : [ ] Berhasil  [ ] Gagal  [ ] Perlu Revisi
- File    : -
- Kendala : -
- Solusi  : -

---

## SLICE 6 — Frontend Chart & Tampilan

### [Slice 6] — PLAN MODE

- Tanggal       : DD/MM/YYYY  HH:mm
- Cara aktifkan : Shift+Tab di Agents Window
- Plan tersimpan: .cursor/plans/slice-6-frontend.md
- Isi plan      : [tulis ringkasan poin plan yang Cursor buat]
- Revisi plan   : -

### [Slice 6] — Prompt ke-1

- Tanggal : DD/MM/YYYY  HH:mm
- Tujuan  : [isi]
- Prompt  :
  "[isi]"
- Hasil   : [ ] Berhasil  [ ] Gagal  [ ] Perlu Revisi
- File    : -
- Kendala : -
- Solusi  : -

---

## SLICE 7 — Screening Feature

### [Slice 7] — PLAN MODE

- Tanggal       : DD/MM/YYYY  HH:mm
- Cara aktifkan : Shift+Tab di Agents Window
- Plan tersimpan: .cursor/plans/slice-7-screening.md
- Isi plan      : [tulis ringkasan poin plan yang Cursor buat]
- Revisi plan   : -

### [Slice 7] — Prompt ke-1

- Tanggal : DD/MM/YYYY  HH:mm
- Tujuan  : [isi]
- Prompt  :
  "[isi]"
- Hasil   : [ ] Berhasil  [ ] Gagal  [ ] Perlu Revisi
- File    : -
- Kendala : -
- Solusi  : -

---

## SLICE 8 — Auth & Role Management

### [Slice 8] — PLAN MODE

- Tanggal       : DD/MM/YYYY  HH:mm
- Cara aktifkan : Shift+Tab di Agents Window
- Plan tersimpan: .cursor/plans/slice-8-auth.md
- Isi plan      : [tulis ringkasan poin plan yang Cursor buat]
- Revisi plan   : -

### [Slice 8] — Prompt ke-1

- Tanggal : DD/MM/YYYY  HH:mm
- Tujuan  : [isi]
- Prompt  :
  "[isi]"
- Hasil   : [ ] Berhasil  [ ] Gagal  [ ] Perlu Revisi
- File    : -
- Kendala : -
- Solusi  : -
