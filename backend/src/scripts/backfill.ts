import 'dotenv/config';
import axios from 'axios';
import { query } from '../utils/db';
import { fetchHistoryFromBinance, type MarketPayload } from '../providers/binance';
import { fetchHistoryFromPolygon } from '../providers/polygon';

/**
 * Script untuk mengisi data historis awal (Backfill)
 * agar grafik tidak kosong saat sistem baru dijalankan.
 */
async function backfill() {
  console.log('🚀 Starting backfill process...');

  try {
    // 1. Ambil semua asset aktif
    const { rows: assets } = await query<{ symbol: string; asset_type: string; provider: string }>(
      'SELECT symbol, asset_type, provider FROM assets WHERE is_active = TRUE',
    );

    console.log(`Found ${assets.length} active assets to backfill.`);

    for (const asset of assets) {
      console.log(`\nProcessing ${asset.symbol} (${asset.asset_type}) via ${asset.provider}...`);

      let history: MarketPayload[] = [];

      try {
        if (asset.provider === 'BINANCE') {
          // Tarik data 7 hari terakhir (~10,080 menit)
          // Binance max 1000 per request, jadi kita loop
          const targetPoints = 10080;
          let endTime = Date.now();

          while (history.length < targetPoints) {
            const limit = Math.min(1000, targetPoints - history.length);
            const url = `https://api.binance.com/api/v3/klines?symbol=${asset.symbol}&interval=1m&limit=${limit}&endTime=${endTime}`;

            const { data } = await axios.get<any[][]>(url);
            if (data.length === 0) break;

            const batch = data.map((d) => ({
              symbol: asset.symbol,
              open: Number(d[1]),
              high: Number(d[2]),
              low: Number(d[3]),
              close: Number(d[4]),
              volume: Number(d[5]),
              time: new Date(d[0]),
            }));

            history = [...batch, ...history];
            endTime = data[0][0] - 1; // Mundur ke sebelum candle pertama batch ini
            console.log(`  Fetched ${history.length}/${targetPoints} points...`);

            // Jeda sedikit agar tidak kena rate limit
            await new Promise((r) => setTimeout(r, 200));
          }
        } else if (asset.provider === 'POLYGON') {
          // Tarik data 7 hari terakhir
          const to = new Date().toISOString().split('T')[0];
          const fromDate = new Date();
          fromDate.setDate(fromDate.getDate() - 7);
          const from = fromDate.toISOString().split('T')[0];

          history = await fetchHistoryFromPolygon(asset.symbol, 1, 'minute', from, to);
        }

        if (history.length === 0) {
          console.log(`⚠️ No history found for ${asset.symbol}`);
          continue;
        }

        console.log(`Fetched ${history.length} points for ${asset.symbol}. Saving to DB...`);

        // 2. Simpan ke price_history
        // Gunakan bulk insert agar cepat
        for (const p of history) {
          await query(
            `
            INSERT INTO price_history (symbol, open, high, low, close, volume, time)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (symbol, time) DO NOTHING
            `,
            [p.symbol, p.open, p.high, p.low, p.close, p.volume, p.time],
          );
        }

        console.log(`✅ ${asset.symbol} backfill complete.`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`❌ Failed to backfill ${asset.symbol}:`, msg);
      }
    }

    console.log('\n✨ Backfill process finished!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Critical error during backfill:', error);
    process.exit(1);
  }
}

backfill();
