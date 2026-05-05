# CONTEXT — STATE PROYEK SAAT INI

## Update setiap akhir sesi coding (dan setelah simpan plan baru)

## Rantai konteks (wajib — supaya agent tidak keluar jalur)

Urutan **@ mention** di prompt pembuka (Agents / Chat):

1. [CHECKPOINT.md](CHECKPOINT.md) — tabel slice + checklist slice yang sedang aktif
2. [CONTEXT.md](CONTEXT.md) — file ini (state terkini)
3. **Plan slice yang sedang dikerjakan** — path di baris **Plan file (slice aktif)** di bawah (bukan plan slice lama yang sudah selesai)
4. (Opsional) file kode spesifik yang bermasalah

**Aturan singkat:**

- Satu slice aktif = **satu** file plan utama. Todo di plan (frontmatter `todos:`) harus **mirror** checklist slice yang sama di CHECKPOINT.
- Setelah **Save to workspace** dari Plan Mode: perbarui baris **Plan file (slice aktif)** di bawah agar mengarah ke file itu, lalu isi [PROMPT_LOG.md](PROMPT_LOG.md) bagian PLAN MODE.
- Sebelum utas chat panjang baru: tempel lagi prompt pembuka + @ file di atas agar konteks reset dengan benar.

---

## State Terkini

- **Slice Aktif        :** 6 — Frontend Chart & Tampilan
- **Status             :** ⏳ Belum Mulai
- **Plan file (slice aktif):** `belum ada` — setelah Plan Mode, simpan ke [.cursor/plans/slice-6-frontend.md](.cursor/plans/slice-6-frontend.md)
- **Plan slice selesai terakhir:** [.cursor/plans/slice-5-endpoints.md](.cursor/plans/slice-5-endpoints.md)
- **File Terakhir Diubah:** `backend/src/features/market/routes.ts`, `backend/src/features/indicators/routes.ts`, `backend/src/features/screening/routes.ts`, `backend/src/features/history/routes.ts`, `backend/src/index.ts`, `backend/src/utils/apiResponse.ts`
- **Masalah Saat Ini   :** -
- **Langkah Selanjutnya:** Plan Mode Slice 6 → save `slice-6-frontend.md` → integrasi chart dan fetch endpoint backend.
- **Terakhir Diupdate  :** 2026-05-05

---

## Template Update (salin setiap kali update)

```text
- **Slice Aktif        :** [nomor] — [nama slice]
- **Status             :** [Belum Mulai / Plan Dibuat / Sedang Dikerjakan / Selesai]
- **Plan file (slice aktif):** [.cursor/plans/slice-X-....md | belum ada — target: ...]
- **Plan slice selesai terakhir:** [path plan slice sebelumnya jika perlu]
- **File Terakhir Diubah:** [path/file.ts]
- **Masalah Saat Ini   :** [deskripsi atau '-']
- **Langkah Selanjutnya:** [apa yang harus dilakukan]
- **Terakhir Diupdate  :** [tanggal]
```

---

## Prompt pembuka setiap sesi baru (salin tempel)

```text
Baca @CHECKPOINT.md dan @CONTEXT.md.
Lalu baca plan slice aktif yang disebut di CONTEXT (baris "Plan file (slice aktif)").
Kerjakan hanya slice itu; jangan mengubah kode slice yang sudah Selesai di tabel CHECKPOINT kecuali bugfix eksplisit.
Ikuti todo di frontmatter plan jika ada; jika kosong, ikuti checklist CHECKPOINT untuk slice tersebut.
```

## Jika Cursor terasa kehilangan konteks

- Ulangi prompt pembuka di atas + @ tiga file pertama (CHECKPOINT, CONTEXT, plan aktif).
- Jangan melanjutkan slice baru tanpa update **Plan file (slice aktif)** di CONTEXT.
- Template plan baru: salin [.cursor/plans/TEMPLATE_SLICE.md](.cursor/plans/TEMPLATE_SLICE.md).

## Tips Cursor (Agents)

- Agents Window: `Cmd/Ctrl+Shift+P` → "Agents Window"
- Plan Mode: `Shift+Tab` di input agent (jika tersedia di build Anda)
- `/multitask` bila banyak subtask paralel
- Jika hasil salah: revisi plan file, jangan hanya chain prompt panjang tanpa rujukan file
