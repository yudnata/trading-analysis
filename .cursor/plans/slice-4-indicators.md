---
name: Slice 4 — Kalkulasi Indikator Teknikal
overview: Implementasi pure function indikator MA, Bollinger Bands, Stochastic, dan generator signal beserta unit test.
todos:
  - id: plan-saved
    content: Plan Mode dijalankan & plan tersimpan di .cursor/plans/
    status: completed
  - id: ma-accurate
    content: calculateMA() akurat
    status: completed
  - id: bb-accurate
    content: calculateBollingerBands() akurat
    status: completed
  - id: stoch-accurate
    content: calculateStochastic() akurat
    status: completed
  - id: signal-logic
    content: generateSignal() logika benar
    status: completed
  - id: tests-pass
    content: Semua unit test lulus
    status: completed
isProject: true
---

# Slice 4 — Kalkulasi Indikator Teknikal

## Tujuan

- Menyediakan fungsi indikator teknikal berbasis pure function.
- Menjaga perhitungan akurat dan mudah diuji untuk dipakai endpoint/fitur berikutnya.

## Rujukan wajib agent

- [CHECKPOINT.md](../../CHECKPOINT.md)
- [CONTEXT.md](../../CONTEXT.md)
- [.cursor/rules](../rules)

## Catatan eksekusi

- Implementasi indikator ditempatkan di `backend/src/services/indicators.ts`.
- Unit test ditempatkan di `backend/src/services/indicators.test.ts`.
- Test dijalankan dengan `vitest` via `npm run test` dan seluruh testcase lulus.
