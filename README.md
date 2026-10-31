# HTTP Flood Control

Tool HTTP flood via Cloudflare Worker.
Request keluar dari edge Cloudflare — IP kamu tidak sampai ke target.

## Deploy ke Cloudflare (paling mudah)

### Cara 1 — Dashboard (tanpa CLI)
1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. **Create** → **Start with Hello World**
3. Setelah Worker dibuat, klik **Edit code**
4. Hapus semua kode default
5. Copy seluruh isi file `src/index.js` dari repo ini, paste
6. **Save and Deploy**
7. Buka URL Worker (`https://xxxx.workers.dev`)

### Cara 2 — GitHub + Cloudflare (otomatis update)
1. Fork / pakai repo ini
2. Di Cloudflare Dashboard → Workers & Pages → **Create** → **Connect to Git**
3. Pilih repo `http-flood-control`
4. Build settings:
   - Framework preset: **None**
   - Build command: kosongkan
   - Deploy command: `npx wrangler deploy`
   - Root directory: `/`
5. Save and Deploy

Setiap push ke `main` akan otomatis update Worker.

## Cara pakai
1. Buka URL Worker
2. Masukkan Target URL (contoh test: `https://httpbin.org/get`)
3. Pilih Method, Concurrency, Durasi
4. Tekan **Mulai Flood**
5. Lihat counter + log real-time

## Catatan
- Limit Cloudflare Workers (subrequest + CPU time) tetap berlaku
- Cocok untuk stress test ringan / pengujian sendiri
