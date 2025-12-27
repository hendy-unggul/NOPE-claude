<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>NOPE — Jejak</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root{
      --bg:#000;
      --surface:#0a0a0a;
      --border:#1f1f1f;
      --text:#f5f5f5;
      --muted:#555;
      --accent:#00e0ff;
    }
    *{box-sizing:border-box;margin:0;padding:0}
    body{
      background:radial-gradient(ellipse at top,#0a0a0a,#000);
      color:var(--text);
      font-family:'Inter',sans-serif;
      font-size:14px;
      line-height:1.5;
      padding-bottom:80px;
    }
    .wrapper{max-width:480px;margin:0 auto;padding:0 16px}
    header{
      position:sticky;
      top:0;
      background:#000000cc;
      backdrop-filter:blur(6px);
      padding:12px 16px;
      display:flex;
      justify-content:space-between;
      align-items:center;
      z-index:10;
    }
    .logo{
      font-family:'Space Grotesk',sans-serif;
      font-size:26px;
      font-weight:700;
      letter-spacing:-0.02em;
      background:linear-gradient(90deg,var(--accent),#ff00ff);
      -webkit-background-clip:text;
      -webkit-text-fill-color:transparent;
    }
    .top-right{display:flex;flex-direction:column;align-items:flex-end;gap:4px}
    .settings-btn{background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer}
    .nav-mini{display:flex;gap:8px;font-size:11px;color:var(--muted)}
    .nav-mini span{cursor:pointer}
    .nav-mini span:hover{color:var(--text)}

    .hero{
      position:relative;
      width:100%;
      aspect-ratio:4/5;
      background:var(--surface);
      border:1px solid var(--border);
      border-radius:0 0 24px 24px;
      overflow:hidden;
      margin-bottom:24px;
    }
    .hero img{width:100%;height:100%;object-fit:cover}
    .hero-input{
      position:absolute;
      bottom:12px;
      right:12px;
      left:12px;
      display:flex;
      align-items:center;
      gap:8px;
    }
    .hero-input input{
      flex:1;
      background:#000000aa;
      border:1px solid var(--border);
      border-radius:8px;
      padding:8px 12px;
      color:var(--text);
      font-size:13px;
    }
    .hero-input input:focus{outline:none;border-color:var(--accent)}
    .hero-input button{
      background:var(--accent);
      color:#000;
      border:none;
      border-radius:8px;
      padding:6px 12px;
      font-size:12px;
      font-weight:600;
      opacity:.2;
      transition:opacity .3s;
    }
    .hero-input button:focus,
    .hero-input button:hover{opacity:1}

    .rant-box{
      background:var(--surface);
      border:1px solid var(--border);
      border-radius:16px;
      padding:12px;
      margin-bottom:24px;
    }
    .rant-box textarea{
      width:100%;
      background:transparent;
      border:none;
      color:var(--text);
      font-family:'Inter',sans-serif;
      font-size:14px;
      line-height:1.4;
      resize:none;
    }
    .rant-box textarea:focus{outline:none}
    .rant-footer{
      display:flex;
      justify-content:flex-end;
      margin-top:4px;
    }
    .rant-footer button{
      background:none;
      border:none;
      color:var(--accent);
      font-size:12px;
      font-weight:500;
      cursor:pointer;
    }

    .diary{
      background:var(--surface);
      border:1px solid var(--border);
      border-radius:16px;
      padding:16px;
      margin-bottom:24px;
    }
    .diary-entry{
      border-bottom:1px solid var(--border);
      padding:12px 0;
    }
    .diary-entry:last-child{border:none}
    .diary-entry time{
      font-size:10px;
      color:var(--muted);
      display:block;
      margin-bottom:2px;
    }
    .diary-entry p{
      font-size:14px;
      line-height:1.4;
    }

    .tray{
      display:grid;
      grid-template-columns:repeat(3,1fr);
      gap:8px;
      padding:0 16px 16px;
    }
    .tray-slot{
      aspect-ratio:1;
      background:var(--surface);
      border:1px solid var(--border);
      border-radius:8px;
      background-size:cover;
      background-position:center;
    }

    .tagline{
      text-align:center;
      font-size:11px;
      color:var(--muted);
      padding:0 16px 24px;
      font-family:'Inter',sans-serif;
    }
    .tagline span{color:var(--accent)}

    .ritual{
      position:fixed;
      inset:0;
      background:#000000ee;
      display:flex;
      align-items:center;
      justify-content:center;
      z-index:50;
    }
    .ritual.hidden{display:none}
    .ritual-lottie{width:120px;height:120px}
  </style>
</head>
<body>
  <header>
    <div class="logo">NOPE</div>
    <div class="top-right">
      <button class="settings-btn" onclick="toggleSettings()">⋯</button>
      <div class="nav-mini">
        <span>Jejak</span>
        <span>Frekuensi</span>
        <span>SayNOPE</span>
        <span>GLITCH</span>
      </div>
    </div>
  </header>

  <div id="ritual" class="ritual">
    <lottie-player
      src="https://assets3.lottiefiles.com/packages/lf20_wnqlfojb.json"
      background="transparent"
      speed="1"
      class="ritual-lottie"
      loop
      autoplay
    ></lottie-player>
  </div>

  <div class="hero">
    <img id="hero-img" src="https://picsum.photos/384/480?random=1" alt="artefak">
    <div class="hero-input">
      <input id="hero-notation" type="text" placeholder="notasi (max 4 kata)" maxlength="50">
      <button onclick="saveHero()">Simpan</button>
    </div>
  </div>

  <div class="rant-box">
    <textarea
      id="rant"
      rows="5"
      cols="60"
      maxlength="300"
      placeholder="tulis di sini..."
    ></textarea>
    <div class="rant-footer">
      <button onclick="postRant()">lepaskan</button>
    </div>
  </div>

  <div class="diary" id="diary"></div>

  <div class="tray" id="tray"></div>

  <div class="tagline">
    “This is our era. And we're not asking for permission”<br>
    <span>— Glitch Generation</span>
  </div>

  <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
  <script>
    const artefacts = Array.from({length:6},(_,i)=>({
      img:`https://picsum.photos/384/480?random=${i+1}`,
      content:['sunset','kopi','hujan','malam','jalan','senja'][i]
    }));
    const rants = Array.from({length:5},(_,i)=>({
      id:i+1,
      content:['hari ini rasanya berat','tapi gapapa','aku masih hidup','dan itu cukup','semesta diam'][i],
      created_at:new Date(Date.now()-i*86400000).toISOString()
    }));

    window.addEventListener('load',()=>{
      setTimeout(()=>document.getElementById('ritual').classList.add('hidden'),2200);
      renderHero();
      renderTray();
      renderDiary();
    });

    function renderHero(){
      const latest = artefacts[0];
      document.getElementById('hero-img').src = latest.img;
      document.getElementById('hero-notation').value = latest.content;
    }
    function saveHero(){
      const txt = document.getElementById('hero-notation').value.trim();
      if(!txt || txt.split(' ').filter(Boolean).length>4) return;
      artefacts.unshift({img:'https://picsum.photos/384/480?random='+Date.now(), content:txt});
      renderHero();
      renderTray();
    }

    function renderTray(){
      const tray = document.getElementById('tray');
      tray.innerHTML = '';
      artefacts.slice(0,6).forEach(a=>{
        const div = document.createElement('div');
        div.className = 'tray-slot';
        div.style.backgroundImage = `url(${a.img})`;
        tray.appendChild(div);
      });
    }

    function renderDiary(){
      const container = document.getElementById('diary');
      container.innerHTML = '';
      rants.forEach(r=>{
        const entry = document.createElement('div');
        entry.className = 'diary-entry';
        entry.innerHTML = `<time>${new Date(r.created_at).toLocaleDateString('id-ID',{day:'2-digit',month:'short'})}</time><p>${r.content}</p>`;
        container.appendChild(entry);
      });
    }

    function postRant(){
      const v = document.getElementById('rant').value.trim();
      if(!v) return;
      rants.unshift({id:Date.now(), content:v, created_at:new Date().toISOString()});
      if(rants.length>5) rants.pop();
      document.getElementById('rant').value = '';
      renderDiary();
    }

    function toggleSettings(){ alert('Menu: Keluar (simulasi)'); }
  </script>
</body>
</html>
