<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>NOPE — Jejak</title>
  <style>
    :root {
      --bg: #0a0a0a;
      --card: #111111cc;
      --border: #2a2a2a;
      --text: #e5e5e5;
      --muted: #888;
      --blue: #3b82f6;
      --purple: #a855f7;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Courier New', monospace;
      background: linear-gradient(to bottom, var(--bg), #0f0f0f);
      color: var(--text);
      font-size: 14px;
      line-height: 1.5;
    }
    .container {
      max-width: 640px;
      margin: 0 auto;
      padding: 24px 16px;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      background: linear-gradient(to right, var(--blue), var(--purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      backdrop-filter: blur(6px);
      transition: border-color 0.3s;
    }
    .card:hover {
      border-color: var(--blue);
    }
    textarea, input[type="text"] {
      width: 100%;
      background: #00000055;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px;
      color: var(--text);
      font-family: inherit;
      font-size: 13px;
      resize: none;
    }
    textarea:focus, input:focus {
      outline: none;
      border-color: var(--blue);
    }
    button {
      background: var(--blue);
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.3s;
    }
    button:disabled {
      background: #333;
      cursor: not-allowed;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .artefak-slot {
      aspect-ratio: 1;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: var(--muted);
      cursor: pointer;
      transition: transform 0.2s, border-color 0.3s;
    }
    .artefak-slot:hover {
      transform: scale(1.03);
      border-color: var(--blue);
    }
    .modal {
      position: fixed;
      inset: 0;
      background: #000000cc;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 50;
    }
    .modal-content {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      width: 100%;
      max-width: 360px;
    }
    .hidden { display: none; }
    .fade-in { animation: fadeIn 0.4s ease; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- HEADER -->
    <header>
      <div class="logo">NOPE</div>
      <button onclick="toggleSettings()">⋮</button>
    </header>

    <!-- ALERT -->
    <div id="alert" class="card hidden"></div>

    <!-- ARTEFAK UPLOAD -->
    <div class="card fade-in">
      <div id="artefak-upload">
        <label class="block cursor-pointer">
          <input type="file" accept="image/*" class="hidden" onchange="handleImageChange(event)">
          <div class="border border-dashed border-gray-600 rounded-lg p-8 text-center text-gray-500">
            <p>📷 unggah artefak (30 hari sekali)</p>
          </div>
        </label>
      </div>
      <div id="artefak-preview" class="hidden relative">
        <img id="preview-img" class="w-full rounded-lg" />
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <input id="notation" type="text" placeholder="notasi (max 4 kata)" maxlength="50">
          <button onclick="uploadArtefak()" class="mt-2 w-full">unggah</button>
        </div>
      </div>
    </div>

    <!-- JEJAK INPUT -->
    <div class="card fade-in">
      <h3>Jejakmu</h3>
      <textarea id="rant" rows="4" placeholder="...perasaanmu dalam 300 huruf" maxlength="300"></textarea>
      <div class="flex justify-between items-center mt-2">
        <span id="char-count" class="text-xs text-gray-500">0/300</span>
        <button onclick="submitRant()">lepaskan</button>
      </div>
    </div>

    <!-- TIMELINE -->
    <div id="timeline" class="space-y-3"></div>

    <!-- ARTEFAK TRAY -->
    <div class="card fade-in">
      <h3>Artefak</h3>
      <div class="grid-3" id="artefak-tray"></div>
    </div>

    <!-- FOOTER -->
    <footer class="text-center text-xs text-gray-500 mt-8">
      <p>"This is our era. And we're not asking for permission"</p>
      <p class="text-blue-400">— Glitch Generation</p>
    </footer>
  </div>

  <!-- MODAL NOTASI -->
  <div id="modal" class="modal hidden">
    <div class="modal-content">
      <h3>Tambah Notasi</h3>
      <textarea id="modal-notasi" rows="3" placeholder="catatan pribadi (max 300 huruf)" maxlength="300"></textarea>
      <div class="flex gap-2 mt-3">
        <button onclick="closeModal()" class="flex-1 bg-gray-700">Batal</button>
        <button onclick="saveNotasi()" class="flex-1">Simpan</button>
      </div>
    </div>
  </div>

  <script>
    // --- STATE ---
    let username = localStorage.getItem('nope_username') || 'anon';
    let artefakImage = null;
    let artefakList = [];
    let rantList = [];
    let activeArtefak = null;

    // --- INIT ---
    window.onload = () => {
      loadRants();
      loadArtefaks();
    };

    // --- HELPERS ---
    function showAlert(msg, type = 'error') {
      const el = document.getElementById('alert');
      el.textContent = msg;
      el.className = `card ${type === 'success' ? 'text-green-400' : 'text-red-400'}`;
      el.classList.remove('hidden');
      setTimeout(() => el.classList.add('hidden'), 3000);
    }

    function formatDate(iso) {
      const d = new Date(iso);
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    }

    // --- ARTEFAK ---
    function handleImageChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      artefakImage = file;
      const url = URL.createObjectURL(file);
      document.getElementById('preview-img').src = url;
      document.getElementById('artefak-upload').classList.add('hidden');
      document.getElementById('artefak-preview').classList.remove('hidden');
    }

    function uploadArtefak() {
      const notasi = document.getElementById('notation').value.trim();
      if (!notasi) return showAlert('Isi notasi dulu');
      const words = notasi.split(' ').filter(Boolean);
      if (words.length > 4) return showAlert('Maksimal 4 kata');
      // Simulasi upload
      const newItem = {
        id: Date.now(),
        content: notasi,
        created_at: new Date().toISOString()
      };
      artefakList.unshift(newItem);
      renderArtefaks();
      showAlert('Artefak diabadikan!', 'success');
      document.getElementById('artefak-preview').classList.add('hidden');
      document.getElementById('artefak-upload').classList.remove('hidden');
    }

    function loadArtefaks() {
      // Simulasi data
      artefakList = [
        { id: 1, content: 'sunset', created_at: new Date().toISOString() },
        { id: 2, content: 'kopi', created_at: new Date().toISOString() }
      ];
      renderArtefaks();
    }

    function renderArtefaks() {
      const tray = document.getElementById('artefak-tray');
      tray.innerHTML = '';
      for (let i = 0; i < 6; i++) {
        const item = artefakList[i];
        const div = document.createElement('div');
        div.className = 'artefak-slot';
        if (item) {
          div.innerHTML = `<div class="text-center"><p class="font-medium">${item.content}</p><p class="text-[10px] text-gray-500">${formatDate(item.created_at)}</p></div>`;
          div.onclick = () => openModal(item);
        } else {
          div.textContent = `#${i + 1}`;
        }
        tray.appendChild(div);
      }
    }

    // --- RANT ---
    function submitRant() {
      const text = document.getElementById('rant').value.trim();
      if (!text) return showAlert('Tulis dulu');
      if (text.length > 300) return showAlert('Maksimal 300 huruf');
      const newRant = {
        id: Date.now(),
        content: text,
        created_at: new Date().toISOString()
      };
      rantList.unshift(newRant);
      renderRants();
      document.getElementById('rant').value = '';
      document.getElementById('char-count').textContent = '0/300';
      showAlert('Jejak terlepaskan!', 'success');
    }

    function loadRants() {
      // Simulasi data
      rantList = [
        { id: 1, content: 'hari ini rasanya berat banget, tapi gapapa.', created_at: new Date().toISOString() }
      ];
      renderRants();
    }

    function renderRants() {
      const timeline = document.getElementById('timeline');
      timeline.innerHTML = '';
      rantList.forEach(r => {
        const div = document.createElement('div');
        div.className = 'card fade-in';
        div.innerHTML = `
          <span class="text-xs text-gray-400">${formatDate(r.created_at)}</span>
          <p class="mt-2">${r.content}</p>
        `;
        timeline.appendChild(div);
      });
    }

    // --- MODAL ---
    function openModal(item) {
      activeArtefak = item;
      document.getElementById('modal-notasi').value = item.content;
      document.getElementById('modal').classList.remove('hidden');
    }

    function closeModal() {
      document.getElementById('modal').classList.add('hidden');
    }

    function saveNotasi() {
      const val = document.getElementById('modal-notasi').value.trim();
      if (!val) return;
      activeArtefak.content = val;
      renderArtefaks();
      closeModal();
      showAlert('Notasi disimpan', 'success');
    }

    // --- CHAR COUNT ---
    document.getElementById('rant').addEventListener('input', e => {
      document.getElementById('char-count').textContent = `${e.target.value.length}/300`;
    });

    // --- SETTINGS ---
    function toggleSettings() {
      alert('Menu: Keluar (simulasi)');
    }
  </script>
</body>
</html>
