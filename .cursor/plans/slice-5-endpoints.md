---
name: Slice 5 — API Endpoints Backend
overview: Implement empat endpoint backend utama dengan validasi Zod, rate limit global 100 rpm, cache Redis TTL 60 detik, dan format respons konsisten.
todos:
  - id: plan-saved
    content: Plan Mode dijalankan & plan tersimpan di .cursor/plans/
    status: completed
  - id: endpoints-ready
    content: Semua 4 endpoint berjalan
    status: completed
  - id: rate-limit
    content: Rate limiting aktif (100 req/menit/IP)
    status: completed
  - id: zod-validation
    content: Validasi input menolak input salah
    status: completed
  - id: response-format
    content: Response format konsisten { success, data, error }
    status: completed
  - id: cache-working
    content: Caching berfungsi (Redis TTL 60 detik untuk response endpoint)
    status: completed
isProject: true
---

# Slice 5 — API Endpoints Backend

## Tujuan

- Menyediakan endpoint market, indicators, screening, dan history berbasis data DB/Redis.
- Menetapkan kontrak API konsisten agar frontend slice berikutnya tinggal konsumsi.

## Rujukan wajib agent

- [CHECKPOINT.md](../../CHECKPOINT.md)
- [CONTEXT.md](../../CONTEXT.md)
- [.cursor/rules](../rules)

## Catatan eksekusi

- Endpoint ditambahkan pada router feature terkait + feature baru `history`.
- Validasi path/query memakai Zod.
- Semua endpoint memanfaatkan cache Redis TTL 60 detik.
