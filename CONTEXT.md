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

- **Slice Aktif        :** 2 — Database Schema & Koneksi
- **Status             :** ⏳ Belum Mulai
- **Plan file (slice aktif):** `belum ada` — setelah Plan Mode, simpan ke [.cursor/plans/slice-2-database.md](.cursor/plans/slice-2-database.md) lalu ganti baris ini dengan path tersebut
- **Plan slice selesai terakhir:** [.cursor/plans/slice-1-setup.md](.cursor/plans/slice-1-setup.md) (referensi saja, jangan jadi fokus eksekusi)
- **File Terakhir Diubah:** backend/db/, .cursor/rules
- **Masalah Saat Ini   :** -
- **Langkah Selanjutnya:** Plan Mode Slice 2 → save `slice-2-database.md` → samakan `todos` di frontmatter dengan checklist CHECKPOINT → eksekusi → update tabel CHECKPOINT + CONTEXT
- **Terakhir Diupdate  :** 2026-05-03

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
