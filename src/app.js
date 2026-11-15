// ===== ZEKA ORMANI - uygulama kodu =====
const $ = s => document.querySelector(s);
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const lc = s => s.toLocaleLowerCase('tr-TR');
const uc = s => s.toLocaleUpperCase('tr-TR');
const today = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
const yesterday = () => { const d = new Date(Date.now() - 864e5); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };

// ---------- Durum ----------
const KEY = 'zekaormani_v1';
function defState() { return { name: '', pts: 0, facts: {}, seen: {}, mast: {}, stick: [], hat: '', last: '', streak: 0, best: {}, unl: {}, rounds: 0, set: { music: true, sfx: true, voice: true } }; }
let S = (() => { try { const d = JSON.parse(localStorage.getItem(KEY)); if (d) return Object.assign(defState(), d, { set: Object.assign(defState().set, d.set || {}) }); } catch (e) { } return defState(); })();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
const level = () => 1 + Math.floor(S.pts / 100);
const title = () => TITLES[Math.min(level() - 1, TITLES.length - 1)];

// ---------- İçerik ----------
const ITEMS = {
  bil: BILMECE.map((r, i) => ({ id: 'b' + i, q: r[0], a: r[1], e: r[2], g: r[3], f: FB[r[1]], fq: FQ[r[1]], hard: i >= HARD0.bil })),
  dey: DEYIM.map((r, i) => ({ id: 'd' + i, n: r[0], m: r[1], s: r[2], e: r[3], f: FD[r[0]], hard: i >= HARD0.dey })),
  ata: ATASOZU.map((r, i) => { const t = r[0].replace(/[{}]/g, ''); return { id: 'a' + i, t, raw: r[0], gap: r[0].match(/\{(.*?)\}/)[1], m: r[1], e: r[2], f: FA[t], hard: i >= HARD0.ata }; }),
  tek: TEKERLEME.map((r, i) => ({ id: 't' + i, n: r[0], t: r[1], h: r[2], f: FT[r[0]], hard: i >= HARD0.tek })),
  fik: FIKRA.map((r, i) => ({ id: 'f' + i, n: r[0], x: r[1], q: r[2], o: r[3], d: r[4], f: FF[r[0]], hard: i >= HARD0.fik }))
};
function learnFact(id) {
  if (S.facts[id]) return; S.facts[id] = 1; const n = Object.keys(S.facts).length; addPts(3);
  if (n % 10 === 0) evQ.push({ t: 'info', n }); save();
}
const factBox = f => f ? `<div class="fb" style="background:#fff7d6">🤓 <b>Biliyor muydun?</b><br>${f}</div>` : '';
const SEC = [
  { id: 'bil', name: 'Bilmece Bahçesi', e: '🧩', col: '#8b5cf6', need: 0, desc: 'Bilmeceleri çöz, cevabı bul!' },
  { id: 'tek', name: 'Tekerleme Tepesi', e: '🎵', col: '#ec4899', need: 60, desc: 'Dilini dolaştıran tekerlemeler!' },
  { id: 'oyn', name: 'Oyun Parkı', e: '🎡', col: '#ef4444', need: 100, desc: 'Eğlenceli oyunlar seni bekliyor!' },
  { id: 'dey', name: 'Deyim Denizi', e: '🌊', col: '#0ea5e9', need: 160, desc: 'Deyimlerin gizli anlamlarını keşfet!' },
  { id: 'ata', name: 'Atasözü Dağı', e: '⛰️', col: '#16a34a', need: 320, desc: 'Atalarımızın bilgece sözleri!' },
  { id: 'fik', name: 'Fıkra Kalesi', e: '🏰', col: '#f59e0b', need: 520, desc: 'Nasreddin Hoca ile gül, düşün!' },
  { id: 'haz', name: 'Bilgelik Hazinesi', e: '👑', col: '#d4a006', need: 800, desc: 'Büyük final! Her şeyden karışık sorular, çifte puan!' }
];
const secOf = id => SEC.find(s => s.id === id);
const GAMES = [
  { id: 'mem', name: 'Hafıza Kartları', e: '🃏', need: 100, desc: 'Resmi kelimeyle eşleştir', col: '#8b5cf6' },
  { id: 'bal', name: 'Balon Patlat', e: '🎈', need: 220, desc: 'Bilmecenin cevabını patlat', col: '#ec4899' },
  { id: 'mat', name: 'Deyim Eşleştir', e: '🔗', need: 380, desc: 'Deyimi anlamıyla bul', col: '#0ea5e9' },
  { id: 'srt', name: 'Atasözü Sırala', e: '🧱', need: 560, desc: 'Karışık kelimeleri sıraya diz', col: '#16a34a' }
];
const learned = id => ITEMS[id].filter(x => (S.mast[x.id] || 0) >= 2).length;

// ---------- Ses ----------
const A = {
  ctx: null, step: 0, next: 0, mood: 'menu',
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      const c = this.ctx = new C();
      this.mg = c.createGain(); this.mg.gain.value = .9; this.mg.connect(c.destination);
      this.mus = c.createGain(); this.mus.gain.value = .5; this.mus.connect(this.mg);
      this.sfx = c.createGain(); this.sfx.gain.value = .9; this.sfx.connect(this.mg);
      this.next = c.currentTime + .2;
      setInterval(() => this.sched(), 70);
    } catch (e) { }
  },
  tone(f, t, d, type, v, dest, f2) {
    const c = this.ctx; if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + d + .05);
  },
  bpm() { return this.mood === 'play' ? 118 : 96; },
  sched() {
    const c = this.ctx; if (!c) return;
    if (!S.set.music || c.state !== 'running') { this.next = c.currentTime + .15; return; }
    while (this.next < c.currentTime + .25) { this.play(this.step, this.next); this.next += 30 / this.bpm(); this.step++; }
  },
  play(step, t) {
    const CH = [[261.63, 329.63, 392], [220, 261.63, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66]];
    const BS = [130.81, 110, 87.31, 98];
    const SC = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    const PAT = [
      [2, -1, 3, 2, 0, -1, 1, -1, 2, -1, 4, 3, 2, -1, -1, -1],
      [4, -1, 3, 2, 3, -1, 1, -1, 0, 1, 2, -1, 3, -1, 2, -1],
      [0, 2, 4, 2, 3, -1, 2, -1, 1, 3, 5, 3, 4, -1, -1, -1]
    ];
    const bar = Math.floor(step / 8) % 4, pos = step % 8;
    if (step % 32 === 0) this.pat = PAT[rnd(3)];
    const play = this.mood === 'play';
    if (pos === 0 || pos === 4) this.tone(BS[bar], t, .5, 'triangle', .3, this.mus);
    if (play ? true : pos % 2 === 0) this.tone(CH[bar][pos % 3] * 2, t, .25, 'sine', .07, this.mus);
    const mi = (this.pat || PAT[0])[(step % 16)];
    if (mi >= 0 && (play || step % 16 < 8 || Math.random() < .5)) this.tone(SC[mi], t, .32, 'triangle', .13, this.mus);
    if (play && pos % 2 === 1) this.tone(8000, t, .03, 'square', .01, this.mus);
  },
  s(kind) {
    if (!this.ctx || !S.set.sfx) return; const c = this.ctx, t = c.currentTime, d = this.sfx;
    const seq = (a, step, ty, v, dur) => a.forEach((f, i) => this.tone(f, t + i * step, dur || .22, ty || 'triangle', v || .22, d));
    if (kind === 'ok') seq([523, 659, 784, 1046], .07, 'triangle', .25);
    else if (kind === 'no') { this.tone(330, t, .25, 'sine', .22, d, 220); }
    else if (kind === 'click') this.tone(760, t, .07, 'sine', .15, d);
    else if (kind === 'coin') seq([1318, 1760], .08, 'square', .08, .25);
    else if (kind === 'win') seq([523, 659, 784, 1046, 784, 1046, 1318], .11, 'triangle', .26, .3);
    else if (kind === 'pop') this.tone(900, t, .12, 'sine', .25, d, 120);
    else if (kind === 'chest') this.tone(200, t, .6, 'sawtooth', .08, d, 900);
    else if (kind === 'flip') this.tone(500, t, .08, 'sine', .12, d, 700);
    else if (kind === 'lvl') seq([392, 523, 659, 784, 1046, 1318, 1568], .09, 'triangle', .26, .35);
  }
};
document.addEventListener('pointerdown', () => A.init());
document.addEventListener('visibilitychange', () => { if (!A.ctx) return; if (document.hidden) A.ctx.suspend(); else A.ctx.resume(); });

function speak(t, rate) {
  if (!S.set.voice && rate !== 'force') return;
  forceSpeak(t, rate === 'force' ? .9 : (rate || .9));
}
function forceSpeak(t, rate) {
  try {
    if (window.Android && Android.speakRate) { Android.speakRate(t, rate || .9); return; }
    if (window.speechSynthesis) { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'tr-TR'; u.rate = rate || .9; speechSynthesis.speak(u); }
  } catch (e) { }
}
const plain = h => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// ---------- Konfeti ----------
let fxRun = false;
function confetti(n = 110) {
  const cv = $('#fx'); const dpr = 1; cv.width = innerWidth; cv.height = innerHeight; const g = cv.getContext('2d');
  const cols = ['#f43f5e', '#f59e0b', '#22c55e', '#0ea5e9', '#8b5cf6', '#ec4899', '#facc15'];
  const P = []; for (let i = 0; i < n; i++) P.push({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .45, vx: (Math.random() - .5) * 16, vy: -Math.random() * 16 - 4, w: 6 + Math.random() * 8, h: 4 + Math.random() * 7, c: cols[rnd(cols.length)], r: Math.random() * 6, vr: (Math.random() - .5) * .4 });
  const t0 = performance.now(); fxRun = true;
  (function f(t) {
    g.clearRect(0, 0, cv.width, cv.height); let alive = 0;
    P.forEach(p => { p.vy += .45; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vx *= .99; if (p.y < innerHeight + 20) alive++; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore(); });
    if (alive && t - t0 < 3500) requestAnimationFrame(f); else { g.clearRect(0, 0, cv.width, cv.height); fxRun = false; }
  })(t0);
}
function floatTxt(txt, el) {
  const d = document.createElement('div'); d.className = 'float'; d.textContent = txt;
  let x = innerWidth / 2 - 30, y = innerHeight / 2;
  if (el) { const r = el.getBoundingClientRect(); x = r.left + r.width / 2 - 20; y = r.top; }
  d.style.left = x + 'px'; d.style.top = y + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 1200);
}

// ---------- Baykuş ----------
function owl(sz) {
  return `<div class="owlbox ${sz || ''}"><svg class="owl" viewBox="0 0 120 130"><g class="o-body">
<ellipse cx="60" cy="125" rx="28" ry="5" fill="rgba(0,0,0,.12)"/>
<path d="M24 46 L30 6 L52 30Z" fill="#8a5630"/><path d="M96 46 L90 6 L68 30Z" fill="#8a5630"/>
<ellipse cx="60" cy="80" rx="42" ry="42" fill="#a86b3c"/><ellipse cx="60" cy="90" rx="27" ry="29" fill="#f8e3bd"/>
<path d="M48 84q4 4 8 0M64 84q4 4 8 0M48 98q4 4 8 0M64 98q4 4 8 0" stroke="#d9b98a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<ellipse class="wl" cx="20" cy="88" rx="11" ry="26" fill="#8a5630"/><ellipse class="wr" cx="100" cy="88" rx="11" ry="26" fill="#8a5630"/>
<circle cx="60" cy="52" r="38" fill="#b9794a"/>
<circle cx="43" cy="50" r="17" fill="#fff"/><circle cx="77" cy="50" r="17" fill="#fff"/>
<circle cx="45" cy="51" r="8" fill="#2b1b0f"/><circle cx="75" cy="51" r="8" fill="#2b1b0f"/>
<circle cx="48" cy="48" r="3" fill="#fff"/><circle cx="78" cy="48" r="3" fill="#fff"/>
<circle class="lid" cx="43" cy="50" r="17.5" fill="#b9794a"/><circle class="lid" cx="77" cy="50" r="17.5" fill="#b9794a"/>
<path d="M52 62 L68 62 L60 76Z" fill="#f59e0b"/>
<ellipse cx="46" cy="125" rx="9" ry="4" fill="#f59e0b"/><ellipse cx="74" cy="125" rx="9" ry="4" fill="#f59e0b"/>
</g></svg>${S.hat ? `<span class="hat">${S.hat}</span>` : ''}</div>`;
}
function owlAnim(c) { document.querySelectorAll('.owlbox').forEach(o => { o.classList.remove('cheer', 'sad'); void o.offsetWidth; o.classList.add(c); }); }

// ---------- Gezinme ----------
let NAV = [], cur = null, modalEl = null, evQ = [];
function go(name, p) { NAV.push({ name, p }); render(); }
function replace(name, p) { NAV.pop(); go(name, p); }
function render() {
  cur = NAV[NAV.length - 1]; const f = SCR[cur.name]; $('#app').scrollTop = 0;
  A.mood = (cur.name === 'quiz' || cur.name.startsWith('g_')) ? 'play' : 'menu';
  f(cur.p);
}
window.goBack = function () {
  if (modalEl) { if (modalEl.dataset.lock) return true; closeModal(); return true; }
  if (cur && cur.name === 'quiz') { exitQuiz(); return true; }
  if (NAV.length > 1) { NAV.pop(); render(); return true; }
  return false;
};
function setApp(h) { $('#app').innerHTML = `<div class="wrap">${h}</div>`; }

// ---------- Modal / olaylar ----------
function showModal(o) {
  closeModal(true);
  const m = document.createElement('div'); m.className = 'modal';
  if (o.lock) m.dataset.lock = '1';
  m.innerHTML = `<div class="mbox"><div class="${o.cls || 'em'}">${o.e || ''}</div><h2>${o.title || ''}</h2><p>${o.text || ''}</p>${(o.btns || [{ t: 'Tamam', a: 'close' }]).map(b => `<button class="btn ${b.c || ''}" data-act="${b.a}" ${b.d ? `data-d="${b.d}"` : ''}>${b.t}</button>`).join('')}</div>`;
  document.body.appendChild(m); modalEl = m;
  if (o.fx) { confetti(o.fx); }
  if (o.snd) A.s(o.snd);
  return m;
}
function closeModal(silent) { if (modalEl) { modalEl.remove(); modalEl = null; } if (!silent) setTimeout(flushEvents, 120); }
function flushEvents() {
  if (modalEl || !evQ.length) return;
  const e = evQ.shift();
  if (e.t === 'lvl') {
    const st = giveSticker();
    showModal({ e: '🎉', title: `Seviye ${e.lvl}!`, text: `Artık «${TITLES[Math.min(e.lvl - 1, TITLES.length - 1)]}» oldun!` + (st ? `<br>Hediye çıkartma: <span style="font-size:2rem">${st}</span>` : '') + (HATS.find(h => h.lvl === e.lvl) ? `<br>Bilo'nun dolabında yeni bir şey açıldı: ${HATS.find(h => h.lvl === e.lvl).e} ${HATS.find(h => h.lvl === e.lvl).n}!` : ''), fx: 200, snd: 'lvl', btns: [{ t: 'Harika! 🎈', a: 'close', c: 'green' }] });
  } else if (e.t === 'info') {
    const st = giveSticker();
    showModal({ e: '🤓', title: 'Bilgi Ustası!', text: `Şimdiye kadar <b>${e.n}</b> yeni bilgi öğrendin! Bilgi Defteri'nde hepsini tekrar okuyabilirsin.` + (st ? `<br>Hediye çıkartma: <span style="font-size:2rem">${st}</span>` : ''), fx: 120, snd: 'win', btns: [{ t: 'Süper! 📒', a: 'close', c: 'green' }] });
  } else if (e.t === 'unl') {
    showModal({ e: e.e, title: 'Yeni Bölüm Açıldı!', text: `<b>${e.name}</b> artık seninle! Hemen keşfetmeye ne dersin?`, fx: 160, snd: 'win', btns: [{ t: 'Haydi gidelim! 🚀', a: 'close', c: 'orange' }] });
  }
}
function addPts(n, el) {
  const lb = level(); const before = S.pts; S.pts += n; const la = level();
  for (let l = lb + 1; l <= la; l++) evQ.push({ t: 'lvl', lvl: l });
  SEC.forEach(s => { if (s.need > 0 && before < s.need && S.pts >= s.need && !S.unl[s.id]) { S.unl[s.id] = 1; evQ.push({ t: 'unl', e: s.e, name: s.name }); } });
  GAMES.forEach(g => { if (g.need > 100 && before < g.need && S.pts >= g.need && !S.unl[g.id]) { S.unl[g.id] = 1; evQ.push({ t: 'unl', e: g.e, name: g.name + ' oyunu' }); } });
  save(); if (n > 0) { floatTxt('+' + n + ' ⭐', el); A.s('coin'); }
}
function giveSticker() { const miss = STICKERS.filter(x => !S.stick.includes(x)); if (!miss.length) return null; const s = miss[rnd(miss.length)]; S.stick.push(s); save(); return s; }

// ---------- Sandık ----------
function chestFlow(gold, bonus) {
  showModal({ e: gold ? '🎁' : '📦', cls: 'chest', title: gold ? 'Altın Sürpriz!' : 'Sürpriz Sandık!', text: 'Dokunarak aç, içinden ne çıkacak?', lock: 1, snd: 'chest', btns: [{ t: 'Aç! ✨', a: 'chestopen', d: gold ? '1' : '0', c: 'orange' }] });
  A.s('chest');
}
function chestOpen(gold) {
  const miss = STICKERS.filter(x => !S.stick.includes(x)); const r = Math.random(); let out;
  if (miss.length && (gold || r < .6)) { const s = giveSticker(); out = { e: s, t: 'Yeni çıkartma!', x: 'Albümüne eklendi. Koleksiyonunu tamamlayabilir misin?' }; if (gold) addPts(20); }
  else if (r < .82) { const f = FACTS[rnd(FACTS.length)]; addPts(5); out = { e: f[0], t: 'Bilgi Kartı!', x: f[1] + '<br><small>(+5 puan)</small>' }; }
  else { const p = 15 + rnd(16); addPts(p); out = { e: '💎', t: `+${p} Puan!`, x: 'Parlak bir mücevher buldun!' }; }
  showModal({ e: out.e, title: out.t, text: out.x, fx: 160, snd: 'win', btns: [{ t: 'Süper! 🎉', a: 'close', c: 'green' }] });
  if (S.set.voice && out.t === 'Bilgi Kartı!') speak(plain(out.x));
}

// ---------- Ekranlar ----------
const SCR = {};
const secBar = need => { const nxt = SEC.filter(s => s.need > S.pts).sort((a, b) => a.need - b.need)[0]; return nxt; };

SCR.intro = function () {
  setApp(`<div style="text-align:center;padding-top:1rem">${owl('big')}<h1 style="margin:.6rem 0">Bilmece, Deyim, Atasözü Dünyasına Hoş Geldin!</h1><p style="font-size:1.1rem">Ben Bilo, bilge baykuş! Bilmeceler, deyimler, atasözleri, tekerlemeler ve fıkralarla dolu bir maceraya çıkacağız. Adın ne?</p><input class="name" id="nm" maxlength="14" placeholder="Adını yaz" autocomplete="off"><button class="btn green" data-act="intro">Başlayalım! 🚀</button></div>`);
  setTimeout(() => speak('Bilmece, deyim ve atasözü dünyasına hoş geldin! Ben Bilo, bilge baykuş. Adın ne?'), 500);
};
SCR.home = function () {
  const lv = level(), inLv = S.pts % 100;
  const nxt = SEC.filter(s => s.need > S.pts).sort((a, b) => a.need - b.need)[0];
  const daily = S.last !== today();
  const msgs = ['Bugün hangi macerayı seçiyoruz?', 'Bilmeceleri çözmeye hazır mısın?', 'Beynini çalıştıralım!', 'Yeni bir şey öğrenmeye ne dersin?'];
  let h = `<div class="top"><div class="chip">⭐ ${S.pts}</div><div class="chip">🏅 Seviye ${lv}</div><div style="flex:1"></div><div class="chip" data-act="mute" style="cursor:pointer">${S.set.music ? '🎵' : '🔇'}</div></div>
<div class="hero" data-act="owltap">${owl()}<div class="bub">Merhaba <b>${esc(S.name || 'Kaşif')}</b>!<br>${title()}<div class="bar"><i style="width:${inLv}%"></i></div><small>Sonraki seviyeye ${100 - inLv} puan</small></div></div>`;
  if (daily) h += `<button class="gift" data-act="daily"><span class="em">🎁</span><span><b>Günlük sürprizin hazır!</b><br><small>Açmak için dokun</small></span></button>`;
  if (nxt) h += `<div style="text-align:center;margin:.6rem 0 0;font-size:.95rem">🔓 <b>${nxt.name}</b> için ${nxt.need - S.pts} puan kaldı!</div>`;
  h += `<div class="cards">`;
  SEC.slice().sort((a, b) => a.need - b.need).forEach((s, i) => {
    const open = S.pts >= s.need, tot = ITEMS[s.id] ? ITEMS[s.id].length : 0;
    const stars = S.best[s.id] ? '⭐'.repeat(S.best[s.id]) : '';
    h += `<button class="sec ${open ? '' : 'lock'}" style="background:${s.col};animation-delay:${i * .06}s" data-act="${open ? 'sec' : 'locked'}" data-a="${s.id}"><span class="em">${open ? s.e : '🔒'}</span><span><span class="nm">${s.name}</span><small>${open ? s.desc + (tot ? ` · Öğrenilen ${learned(s.id)}/${tot}` : '') : s.need + ' puan kazanınca açılır'}</small></span><span class="stars">${stars}</span></button>`;
  });
  h += `</div><div class="dock"><button data-act="notebook"><span>📒</span>Defter</button><button data-act="album"><span>🏆</span>Albüm</button><button data-act="wardrobe"><span>🎩</span>Dolap</button><button data-act="settings"><span>⚙️</span>Ayarlar</button></div>`;
  setApp(h);
  setTimeout(flushEvents, 300);
};
SCR.sec = function (id) {
  const s = secOf(id);
  let h = `<div class="top"><button class="back" data-act="back">←</button><div class="title">${s.e} ${s.name}</div></div>`;
  if (id === 'oyn') {
    h += `<div class="hero">${owl()}<div class="bub">Oyun zamanı! Puan kazandıkça yeni oyunlar açılır.</div></div><div class="cards">`;
    GAMES.forEach((g, i) => { const open = S.pts >= g.need; h += `<button class="sec ${open ? '' : 'lock'}" style="background:${g.col};animation-delay:${i * .07}s" data-act="${open ? 'game' : 'locked'}" data-a="${g.id}" data-n="${g.need}"><span class="em">${open ? g.e : '🔒'}</span><span><span class="nm">${g.name}</span><small>${open ? g.desc : g.need + ' puanda açılır'}</small></span></button>`; });
    h += `</div>`;
  } else if (id === 'haz') {
    h += `<div class="hero">${owl()}<div class="bub">Büyük final! 10 karışık soru, <b>çifte puan</b>! Hazır mısın?</div></div><button class="btn orange" data-act="quiz" data-a="haz">🎯 Hazineyi Aç!</button>`;
  } else {
    const tot = ITEMS[id].length, ln = learned(id);
    h += `<div class="hero">${owl()}<div class="bub">${s.desc}<div class="bar"><i style="width:${ln / tot * 100}%"></i></div><small>Öğrenilen: ${ln} / ${tot}</small></div></div>
<button class="btn blue" data-act="learn" data-a="${id}">📚 Öğren</button><button class="btn" style="background:${s.col}" data-act="quiz" data-a="${id}">🎯 Soruları Çöz</button><p style="text-align:center;font-size:.9rem">Önce «Öğren», sonra «Soruları Çöz»! Doğru bildikçe puan ve sürpriz kazanırsın.</p>`;
  }
  setApp(h);
};
// --- Öğren ---
SCR.learn = function (p) {
  const id = p.id, L = p.list, i = p.i, it = L[i], s = secOf(id);
  if (!S.seen[it.id]) { S.seen[it.id] = 1; addPts(2); }
  let card = '', say = '';
  if (id === 'bil') { card = `<div class="em">🧩</div><p>${esc(it.q)}</p>${p.rev ? `<div class="em" style="animation:pop .5s">${it.e}</div><h2>${it.a}</h2>` : `<button class="btn orange" data-act="reveal">🤔 Cevabı göster</button>`}`; say = it.q + (p.rev ? ' Cevap: ' + it.a : ''); }
  else if (id === 'dey') { card = `<div class="em">${it.e}</div><h2>${it.n}</h2><p>💡 <b>${it.m}</b></p><p class="ex">${it.s.replace(/\{(.*?)\}/, '<b>$1</b>')}</p>`; say = it.n + '. Anlamı: ' + it.m + '. Örnek: ' + it.s.replace(/[{}]/g, ''); }
  else if (id === 'ata') { card = `<div class="em">${it.e}</div><h2>${it.t}</h2><p>💡 <b>${it.m}</b></p>`; say = it.t + '. Yani: ' + it.m; }
  else if (id === 'tek') { card = `<div class="em">🎵</div><h2>${it.n}</h2><p style="font-size:1.25rem">${it.t}</p><p>Önce yavaş, sonra hızlı söyle!</p><div class="speeds"><button data-act="say" data-r=".6">🐢</button><button data-act="say" data-r=".95">🐰</button><button data-act="say" data-r="1.35">🚀</button></div>`; say = it.t; }
  else { card = `<div class="em">🏰</div><h2>${it.n}</h2><p style="text-align:left">${it.x}</p><p class="ex">🌟 Ders: <b>${it.d[0]}</b></p>`; say = it.x + ' Ders: ' + it.d[0]; }
  if (it.f && (id !== 'bil' || p.rev)) { card += `<p class="ex" style="background:#fff7d6;font-style:normal">🤓 <b>Biliyor muydun?</b><br>${it.f}</p>`; say += ' Biliyor muydun? ' + it.f; learnFact(it.id); }
  p.say = say;
  setApp(`<div class="top"><button class="back" data-act="back">←</button><div class="title">${s.e} Öğren ${i + 1}/${L.length}</div><button class="back" data-act="say2">🔊</button></div>
<div class="lcard">${card}</div>
<div class="row" style="margin-top:.7rem"><button class="btn alt" data-act="lprev" ${i === 0 ? 'disabled' : ''}>◀ Geri</button>${i < L.length - 1 ? `<button class="btn blue" data-act="lnext">İleri ▶</button>` : `<button class="btn green" data-act="quiz" data-a="${id}">🎯 Sorular!</button>`}</div>`);
  if (!p.silent) setTimeout(() => speak(say), 250);
  p.silent = false;
};
SCR.album = function () {
  let h = `<div class="top"><button class="back" data-act="back">←</button><div class="title">🏆 Çıkartma Albümü</div></div><div class="chip" style="display:inline-flex;margin-bottom:.6rem">${S.stick.length} / ${STICKERS.length}</div><div class="grid">`;
  STICKERS.forEach(s => { const has = S.stick.includes(s); h += `<div class="stk ${has ? '' : 'no'}" ${has ? `data-act="stk" data-a="${s}"` : ''}>${has ? s : '❔'}</div>`; });
  h += `</div><p style="text-align:center">Soruları çöz, sürpriz sandıklardan çıkartma kazan!</p>`;
  setApp(h);
};
SCR.notebook = function () {
  const meta = { bil: ['🧩', 'Bilmece', it => it.a, it => it.e], dey: ['🌊', 'Deyim', it => it.n, it => it.e], ata: ['⛰️', 'Atasözü', it => it.t, it => it.e], tek: ['🎵', 'Tekerleme', it => it.n, () => '🎵'], fik: ['🏰', 'Fıkra', it => it.n, () => '🏰'] };
  let tot = 0, got = 0, body = '';
  Object.keys(meta).forEach(sec => {
    const L = ITEMS[sec].filter(x => x.f); tot += L.length; const G2 = L.filter(x => S.facts[x.id]); got += G2.length;
    if (G2.length) body += `<h3 style="margin:.9rem 0 .3rem">${meta[sec][0]} ${meta[sec][1]} bilgileri</h3>` + G2.map(x => `<div class="fb" style="background:#fff;box-shadow:0 3px 0 rgba(0,0,0,.1)" data-act="nspeak" data-k="${x.id}"><b>${meta[sec][3](x)} ${esc(meta[sec][2](x))}</b><br>${x.f}</div>`).join('');
  });
  setApp(`<div class="top"><button class="back" data-act="back">←</button><div class="title">📒 Bilgi Defteri</div></div><div class="chip" style="display:inline-flex">🤓 ${got} / ${tot} bilgi</div><p style="margin:.4rem 0">Soruları çözerken ve öğrenirken keşfettiğin bilgiler burada! Dinlemek için bir bilgiye dokun. Her 10 yeni bilgide hediye kazanırsın.</p>${got ? body : '<div class="fb" style="background:#fff">Henüz bilgi yok. Bir bölüme girip sorulara cevap ver, «Biliyor muydun?» bilgileri buraya eklenecek!</div>'}`);
};
SCR.wardrobe = function () {
  let h = `<div class="top"><button class="back" data-act="back">←</button><div class="title">🎩 Bilo'nun Dolabı</div></div><div style="width:9rem;margin:0 auto">${owl('big')}</div><p style="text-align:center">Seviye atladıkça yeni aksesuarlar açılır!</p><div class="hats">`;
  HATS.forEach(hd => { const open = level() >= hd.lvl; h += `<button class="hatc ${open ? '' : 'no'} ${S.hat === hd.e ? 'sel' : ''}" ${open ? `data-act="hat" data-a="${hd.e}"` : `data-act="hatlock" data-a="${hd.lvl}"`}><span class="em">${hd.e || '🦉'}</span>${hd.n}<br><small>${open ? '' : '🔒 Seviye ' + hd.lvl}</small></button>`; });
  setApp(h + '</div>');
};
SCR.settings = function () {
  const T = (k, l) => `<button class="tog" data-act="tog" data-a="${k}">${l}<b class="${S.set[k] ? 'on' : ''}">${S.set[k] ? 'AÇIK' : 'KAPALI'}</b></button>`;
  let rep = [['bil', 'Bilmece'], ['tek', 'Tekerleme'], ['dey', 'Deyim'], ['ata', 'Atasözü'], ['fik', 'Fıkra']].map(x => `${x[1]}: ${learned(x[0])}/${ITEMS[x[0]].length}`).join(' · ');
  setApp(`<div class="top"><button class="back" data-act="back">←</button><div class="title">⚙️ Ayarlar</div></div>${T('music', '🎵 Müzik')}${T('sfx', '🔔 Ses efektleri')}${T('voice', '🔊 Sesli okuma')}
<div style="margin-top:.8rem"><input class="name" id="nm" maxlength="14" value="${esc(S.name)}" placeholder="Adın"><button class="btn green" data-act="savename">Adı kaydet</button></div>
<div class="fb" style="background:#fff"><b>👨‍👩‍👧 Ebeveyn bilgisi</b><br>Toplam puan: ${S.pts} · Tamamlanan tur: ${S.rounds}<br>Öğrenilenler (en az 2 kez doğru): ${rep}<br>Çıkartma: ${S.stick.length}/${STICKERS.length} · Gün serisi: ${S.streak}</div>
<button class="btn alt" data-act="reset">🗑️ İlerlemeyi sıfırla</button>`);
};

// ---------- Soru üretimi ----------
function opts4(correct, pool, n = 4) {
  const seen = new Set([lc(correct)]), out = [];
  shuffle(pool.slice()).forEach(x => { if (out.length < n - 1 && !seen.has(lc(x))) { seen.add(lc(x)); out.push(x); } });
  return shuffle([{ t: correct, c: 1 }, ...out.map(t => ({ t, c: 0 }))]);
}
// Anlamca birbirine yakın olanlar aynı soruda seçenek olarak çıkmasın (iki doğru cevap olmasın)
const SYN = [
  ['El ele vermek', 'Elini taşın altına', 'Kolları sıvamak'],
  ['Gözü pek', 'Gözünü budaktan', 'Yüreği ağzına'],
  ['Can kulağıyla', 'Kulak vermek', 'Kulak asmamak'],
  ['Gözden düşmek', 'Pabucu dama'],
  ['Parmak ısırmak', 'Ağzı kulaklarına'],
  ['Göz yummak', 'Göz atmak', 'Göz kulak olmak'],
  ['Ağzı kulaklarına', 'Etekleri zil', 'Ayağı yere'],
  ['Dört gözle', 'Kulağı kirişte', 'İçi içine', 'Diken üstünde'],
  ['Sabreden', 'Sabır acıdır'],
  ['Rüzgâr eken', 'Ne ekersen', 'Ne verirsen', 'Bir fincan'],
  ['Sakla samanı', 'Ak akçe', 'Ayağını yorganına'],
  ['Bugünün işini', 'Erken kalkan', 'Kervan yolda']
];
const txt = it => it.n || it.t;
const sameGrp = (a, b) => SYN.some(g => g.some(k => txt(a).startsWith(k)) && g.some(k => txt(b).startsWith(k)));
const sentence = s => s.replace(/\{(.*?)\}/, '<b>$1</b>');
function makeQ(sec, it) {
  const q = { id: it.id, sec, tries: 0, hint: false };
  if (sec === 'bil') {
    let pool = ITEMS.bil.filter(x => x.id !== it.id && x.g === it.g).map(x => x.a);
    if (pool.length < 3) pool = ITEMS.bil.filter(x => x.id !== it.id).map(x => x.a);
    q.tag = 'Bilmece'; q.prompt = esc(it.q); q.speak = it.q; q.opts = opts4(it.a, pool);
    q.fb = `${it.e} Cevap: <b>${it.a}</b>`;
    if (it.fq && Math.random() < .4) {
      const f = it.fq; q.tag = 'Bilgi Avı'; q.prompt = `${it.e} ${esc(f[0])}`; q.speak = f[0];
      q.opts = shuffle([{ t: f[1], c: 1 }, { t: f[2], c: 0 }, { t: f[3], c: 0 }]);
    }
  } else if (sec === 'dey') {
    const t = rnd(4), others = ITEMS.dey.filter(x => x.id !== it.id && !sameGrp(x, it));
    q.tag = 'Deyim';
    if (t === 3) { q.prompt = `Bu cümlede kalın yazılan deyim ne anlama geliyor?<br><br>${sentence(it.s)}`; q.speak = 'Bu cümlede kalın yazılan deyim ne anlama geliyor? ' + it.s.replace(/[{}]/g, ''); q.opts = opts4(it.m, others.map(x => x.m)); } else
    if (t === 0) { q.prompt = `«<b>${it.n}</b>» ne demek?`; q.speak = it.n + ' ne demek?'; q.opts = opts4(it.m, others.map(x => x.m)); }
    else if (t === 1) { q.prompt = `Boşluğa hangi deyim yakışır?<br><br>${it.s.replace(/\{.*?\}/, '<u>&nbsp;&nbsp;_____&nbsp;&nbsp;</u>')}`; q.speak = 'Boşluğa hangi deyim yakışır? ' + it.s.replace(/\{.*?\}/, 'boşluk'); q.opts = opts4(it.n, others.map(x => x.n)); }
    else { q.prompt = `«<b>${it.m}</b>» anlamına gelen deyim hangisi?`; q.speak = it.m + ' anlamına gelen deyim hangisi?'; q.opts = opts4(it.n, others.map(x => x.n)); }
    q.fb = `${it.e} <b>${it.n}</b> = ${it.m}<br><i>${sentence(it.s)}</i>`;
  } else if (sec === 'ata') {
    const t = rnd(3), others = ITEMS.ata.filter(x => x.id !== it.id && !sameGrp(x, it));
    q.tag = 'Atasözü';
    if (t === 0) {
      // büyük/küçük harf ipucu vermesin: hepsini doğru kelimenin biçimine getir
      const cap = it.gap[0] === uc(it.gap[0]), fm = w => cap ? uc(w[0]) + lc(w.slice(1)) : lc(w);
      q.prompt = `Eksik kelimeyi bul:<br><br>${esc(it.raw.replace(/\{.*?\}/, '_____'))}`; q.speak = 'Eksik kelimeyi bul. ' + it.raw.replace(/\{.*?\}/, 'boşluk');
      q.opts = opts4(it.gap, others.map(x => fm(x.gap)));
    }
    else if (t === 1) { q.prompt = `«<b>${esc(it.t)}</b>» ne anlatıyor?`; q.speak = it.t + ' ne anlatıyor?'; q.opts = opts4(it.m, others.map(x => x.m)); }
    else { q.prompt = `«<b>${it.m}</b>»<br>Bu anlama gelen atasözü hangisi?`; q.speak = it.m + ' Bu anlama gelen atasözü hangisi?'; q.opts = opts4(it.t, others.map(x => x.t)); }
    q.fb = `${it.e} <b>${esc(it.t)}</b><br>${it.m}`;
  } else if (sec === 'tek') {
    const clean = w => w.replace(/[.,?!]/g, '');
    const words = it.t.split(/\s+/).map(clean);
    const rr = Math.random(), t = it.h ? (rr < .3 ? 1 : rr < .65 ? 2 : 0) : 0; q.tag = 'Tekerleme';
    const cnt = it.h ? it.t.split(/\s+/).filter(w => lc(w)[0] === it.h).length : 0;
    if (t === 2 && cnt >= 3) {
      const cs = [...new Set([cnt, cnt - 1, cnt + 1, cnt + 2])].filter(x => x > 0);
      q.prompt = `<i>${esc(it.t)}</i><br><br>Bu tekerlemede kaç sözcük «${uc(it.h)}» harfiyle başlıyor? Dikkatle say!`; q.speak = 'Bu tekerlemede kaç sözcük ' + it.h + ' harfiyle başlıyor?';
      q.opts = shuffle(cs.map(x => ({ t: String(x), c: x === cnt ? 1 : 0 })));
    } else if (t === 1) {
      const lets = shuffle('bkmtsdlpzrnygçşh'.split('').filter(x => x !== it.h)).slice(0, 3);
      q.prompt = `<i>${esc(it.t)}</i><br><br>Bu tekerlemede en çok hangi harf tekrar ediyor?`; q.speak = it.t + ' Bu tekerlemede en çok hangi harf tekrar ediyor?';
      q.opts = shuffle([{ t: uc(it.h) + ' harfi', c: 1 }, ...lets.map(l => ({ t: uc(l) + ' harfi', c: 0 }))]);
    } else {
      const cand = words.map((w, i) => i).filter(i => i > 0 && clean(words[i]).length >= 4);
      const gi = cand[rnd(cand.length)], gw = lc(words[gi]);
      const shown = it.t.split(/\s+/).map((w, i) => i === gi ? w.replace(clean(w), '_____') : w).join(' ');
      const pool = []; ITEMS.tek.filter(x => x.id !== it.id).forEach(x => x.t.split(/\s+/).forEach(w => { w = lc(clean(w)); if (w.length >= 4 && Math.abs(w.length - gw.length) <= 3) pool.push(w); }));
      if (new Set(pool).size < 4) ITEMS.tek.filter(x => x.id !== it.id).forEach(x => x.t.split(/\s+/).forEach(w => { w = lc(clean(w)); if (w.length >= 4) pool.push(w); }));
      q.prompt = `Eksik kelimeyi bul:<br><br><i>${esc(shown)}</i>`; q.speak = 'Eksik kelimeyi bul. ' + shown.replace('_____', 'boşluk'); q.opts = opts4(gw, pool);
    }
    q.fb = `🎵 <b>${it.n}</b><br>${esc(it.t)}<br><small>Şimdi sen de hızlıca söylemeyi dene!</small>`; q.say = it.t;
  } else {
    const t = rnd(2); q.tag = 'Fıkra';
    const body = `<b>${it.n}</b><br><span style="font-size:1.02rem;font-weight:600">${it.x}</span><hr style="border:0;border-top:2px dashed #ddd">`;
    if (t === 0) { q.prompt = body + it.q; q.opts = shuffle(it.o.map((x, i) => ({ t: x, c: i === 0 ? 1 : 0 }))); q.speak = it.x + ' ' + it.q; }
    else { q.prompt = body + 'Bu fıkradan ne öğreniyoruz?'; q.opts = shuffle(it.d.map((x, i) => ({ t: x, c: i === 0 ? 1 : 0 }))); q.speak = it.x + ' Bu fıkradan ne öğreniyoruz?'; }
    q.fb = `🌟 <b>Ders:</b> ${it.d[0]}`;
  }
  q.fact = it.f; q.hard = it.hard;
  return q;
}
function pickItems(sec, n) {
  const L = ITEMS[sec].slice(); L.forEach(x => x._r = (S.mast[x.id] || 0) + Math.random() * 2.2 + (x.hard ? (S.pts < 100 ? 1 : 0) : (S.pts > 300 ? .6 : 0)));
  return L.sort((a, b) => a._r - b._r).slice(0, n);
}
// ---------- Quiz ----------
let QZ = null;
SCR.quiz = function (sec) {
  if (!QZ || QZ.sec !== sec) {
    let qs;
    if (sec === 'haz') { qs = []; ['bil', 'tek', 'dey', 'ata', 'fik'].forEach(s => pickItems(s, 2).forEach(it => qs.push(makeQ(s, it)))); shuffle(qs); }
    else qs = pickItems(sec, 5).map(it => makeQ(sec, it));
    QZ = { sec, qs, n: qs.length, i: 0, ft: 0, gain: 0, combo: 0, res: [] };
  }
  quizShow();
};
function quizShow() {
  const Q = QZ, q = Q.qs[Q.i], s = secOf(Q.sec === 'haz' ? 'haz' : Q.sec);
  const tagCol = secOf(q.sec).col;
  let dots = ''; for (let k = 0; k < Q.qs.length; k++) dots += `<i class="${k < Q.i ? (Q.res[k] ? 'on' : 'bad') : k === Q.i ? 'cur' : ''}"></i>`;
  setApp(`<div class="top"><button class="back" data-act="exitq">✕</button><div class="dots">${dots}</div><div class="chip" id="qgain">⭐ ${Q.gain}</div></div>
<div style="display:flex;align-items:flex-end;gap:.5rem">${owl('sm')}<div class="chip" style="font-size:.9rem">${Q.combo >= 3 ? '🔥 Seri x' + Q.combo : 'Bilo seninle!'}</div></div>
<div class="qcard"><span class="tag" style="background:${tagCol}">${q.tag}${q.rep ? ' · tekrar' : ''}</span><button class="speak" data-act="qspeak">🔊</button><div>${q.prompt}</div></div>
<div id="opts">${q.opts.map((o, i) => `<button class="opt" style="animation-delay:${i * .07}s" data-act="pick" data-i="${i}">${esc(o.t)}</button>`).join('')}</div>
<div id="fbArea"><div style="text-align:center"><button class="hintbtn" data-act="hint">💡 İpucu (2 yanlışı ele)</button></div></div>`);
  if (!q.shown) { q.shown = 1; setTimeout(() => speak(q.speak), 350); }
}
function qPick(i, el) {
  const Q = QZ, q = Q.qs[Q.i]; if (q.done) return; const o = q.opts[i];
  const btns = document.querySelectorAll('#opts .opt');
  if (o.c) {
    q.done = true; const first = q.tries === 0 && !q.hint;
    let base = (S.mast[q.id] || 0) >= 3 ? 5 : 10; if (q.hard) base += 2; if (Q.sec === 'haz') base *= 2;
    if (!first) base = Math.ceil(base / 2);
    if (first) { Q.combo++; if (!q.rep) Q.ft++; if (Q.combo >= 3) base += Math.min(Q.combo - 2, 3) * 2; S.mast[q.id] = Math.min(5, (S.mast[q.id] || 0) + 1); } else Q.combo = 0;
    Q.res[Q.i] = first; Q.gain += base; $('#qgain').textContent = '⭐ ' + Q.gain; addPts(base, el); A.s('ok'); confetti(first ? 40 : 15);
    btns[i].classList.add('ok'); btns.forEach(b => { if (b !== btns[i]) b.classList.add('off'); }); owlAnim('cheer');
    if (!first && !q.rep) { Q.qs.push(Object.assign({}, makeQ(q.sec, ITEMS[q.sec].find(x => x.id === q.id)), { rep: true })); }
    quizDone(true, q);
  } else {
    q.tries++; Q.combo = 0; btns[i].classList.add('no'); btns[i].style.pointerEvents = 'none'; A.s('no'); owlAnim('sad');
    if (q.tries >= 2 || q.opts.length - q.tries <= 1) {
      q.done = true; Q.res[Q.i] = false; S.mast[q.id] = Math.max(0, (S.mast[q.id] || 0) - 1); save();
      q.opts.forEach((x, k) => { if (x.c) btns[k].classList.add('ok'); else btns[k].classList.add('off'); });
      if (!q.rep) Q.qs.push(Object.assign({}, makeQ(q.sec, ITEMS[q.sec].find(x => x.id === q.id)), { rep: true }));
      quizDone(false, q);
    } else { $('#fbArea').innerHTML = `<div class="fb no">Olmadı, bir daha dene! 💪 Sen yaparsın.</div>`; speak('Bir daha dene!'); }
  }
}
function quizDone(ok, q) {
  const last = QZ.i >= QZ.qs.length - 1;
  $('#fbArea').innerHTML = `<div class="fb ${ok ? 'ok' : 'no'}"><b>${ok ? ['Harika! 🎉', 'Bravo! 👏', 'Süper! ⭐', 'Muhteşem! 🌟'][rnd(4)] : 'Doğrusu şuydu:'}</b><br>${q.fb}</div>${factBox(q.fact)}${q.say ? `<button class="btn alt" data-act="qsay">🔊 Tekerlemeyi dinle</button>` : ''}<button class="btn green" data-act="qnext">${last ? 'Bitir 🏁' : 'Devam ▶'}</button>`;
  if (q.fact) learnFact(q.id);
  speak(plain(q.fb) + (q.fact ? '. Biliyor muydun? ' + plain(q.fact) : ''));
  setTimeout(() => { const b = $('[data-act=qnext]'); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 150);
}
function qHint() {
  const q = QZ.qs[QZ.i]; if (q.done || q.hint) return; q.hint = true;
  const btns = document.querySelectorAll('#opts .opt'); let rm = 0;
  shuffle(q.opts.map((o, i) => i)).forEach(i => { if (!q.opts[i].c && rm < 2 && !btns[i].classList.contains('no')) { btns[i].classList.add('off'); rm++; } });
  $('#fbArea').innerHTML = '';
  A.s('click');
}
function exitQuiz() { showModal({ e: '🤔', title: 'Çıkmak istiyor musun?', text: 'Bu turdaki ilerlemen kaybolacak.', btns: [{ t: 'Devam et 💪', a: 'close', c: 'green' }, { t: 'Çık', a: 'quitq', c: 'alt' }] }); }
function endQuiz() {
  const Q = QZ; const r = Q.ft / Q.n; const stars = r >= .99 ? 3 : r >= .6 ? 2 : 1;
  S.rounds++; S.best[Q.sec] = Math.max(S.best[Q.sec] || 0, stars); const bonus = stars * (Q.sec === 'haz' ? 10 : 5); addPts(bonus);
  const o = { title: Q.sec === 'haz' ? 'Hazine Turu Bitti!' : 'Tur Bitti!', ft: Q.ft, n: Q.n, gain: Q.gain + bonus, bonus, stars, again: Q.sec, back: Q.sec, gold: stars === 3 };
  QZ = null; replace('result', o);
}
SCR.result = function (o) {
  const msg = o.stars === 3 ? 'Mükemmel! Sen bir dahisin!' : o.stars === 2 ? 'Çok iyi gittin!' : 'Güzel deneme! Tekrar edince daha da iyi olacak.';
  let st = ''; for (let i = 0; i < 3; i++) st += `<span style="animation-delay:${i * .35}s;${i < o.stars ? '' : 'filter:grayscale(1);opacity:.3'}">⭐</span>`;
  setApp(`<div style="text-align:center;padding-top:1rem"><h1 style="margin:0">${o.title}</h1><div class="stars3">${st}</div>${owl('big')}<p style="font-size:1.2rem">${msg}</p>
<div class="chip" style="display:inline-flex;font-size:1.2rem">${o.ft != null ? `✅ ${o.ft}/${o.n} ilk seferde · ` : ''}⭐ +${o.gain} puan</div>
${o.stars >= 2 ? `<button class="gift" data-act="chest" data-g="${o.gold ? 1 : 0}"><span class="em">${o.gold ? '🎁' : '📦'}</span><span><b>Sürpriz sandığın hazır!</b><br><small>Açmak için dokun</small></span></button>` : ''}
<button class="btn green" data-act="${GAMES.some(g => g.id === o.again) ? 'game' : 'quiz'}" data-a="${o.again}">🔄 Tekrar oyna</button><button class="btn alt" data-act="back">🏠 Geri dön</button></div>`);
  A.s('win'); confetti(o.stars * 60); speak(msg);
  setTimeout(flushEvents, 1400);
};

// ---------- Oyunlar ----------
let G = null;
function gameStart(id) { G = null; NAV.push({ name: 'g_' + id }); render(); }
function gameEnd(title, gain, stars, again, extra) { addPts(gain); S.rounds++; replace('result', { title, gain: gain + (extra || 0), stars, again, back: 'oyn', gold: stars === 3 }); }
// Hafıza
SCR.g_mem = function () {
  if (!G) { const pool = shuffle(ITEMS.bil.slice()).slice(0, 6); const cards = []; pool.forEach((it, i) => { cards.push({ p: i, t: 'e', f: it.e }); cards.push({ p: i, t: 'w', f: it.a }); }); G = { cards: shuffle(cards), first: null, lock: false, moves: 0, matched: 0 }; }
  setApp(`<div class="top"><button class="back" data-act="back">←</button><div class="title">🃏 Hafıza Kartları</div><div class="chip" id="mv">Hamle ${G.moves}</div></div><p style="text-align:center;margin:.2rem">Resmi ve kelimesini eşleştir!</p><div class="mem">${G.cards.map((c, i) => `<button class="mc" data-act="mflip" data-i="${i}"><div class="in"><div class="ba">❓</div><div class="fa ${c.t === 'w' ? 'w' : ''}">${c.f}</div></div></button>`).join('')}</div>`);
};
function mFlip(i) {
  if (G.lock) return; const els = document.querySelectorAll('.mc'), el = els[i]; if (el.classList.contains('f') || el.classList.contains('m')) return;
  el.classList.add('f'); A.s('flip');
  if (G.cards[i].t === 'w') speak(G.cards[i].f);
  if (G.first === null) { G.first = i; return; }
  const a = G.first, b = i; G.first = null; G.moves++; $('#mv').textContent = 'Hamle ' + G.moves;
  if (G.cards[a].p === G.cards[b].p) {
    els[a].classList.add('m'); els[b].classList.add('m'); G.matched++; setTimeout(() => A.s('ok'), 300);
    if (G.matched === 6) { const g = Math.max(15, 55 - (G.moves - 6) * 4); const st = G.moves <= 9 ? 3 : G.moves <= 13 ? 2 : 1; setTimeout(() => { gameEnd('Hafıza Tamam!', g, st, 'mem'); }, 900); }
  } else { G.lock = true; setTimeout(() => { els[a].classList.remove('f'); els[b].classList.remove('f'); G.lock = false; }, 900); }
}
// Balon
const BCOL = ['#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ec4899'];
SCR.g_bal = function () {
  if (!G) G = { r: 0, items: shuffle(ITEMS.bil.slice()).slice(0, 5), wrong: 0, gain: 0, perf: 0 };
  const it = G.items[G.r];
  let pool = ITEMS.bil.filter(x => x.id !== it.id && x.g === it.g).map(x => x.a); if (pool.length < 3) pool = ITEMS.bil.filter(x => x.id !== it.id).map(x => x.a);
  G.opts = opts4(it.a, pool); G.wrong = 0;
  const pos = [[6, 4], [54, 14], [8, 52], [54, 58]]; const cs = shuffle(BCOL.slice());
  setApp(`<div class="top"><button class="back" data-act="back">←</button><div class="title">🎈 Balon Patlat ${G.r + 1}/5</div><div class="chip">⭐ ${G.gain}</div></div>
<div class="qcard"><button class="speak" data-act="gspeak">🔊</button>${esc(it.q)}</div>
<div class="balls">${G.opts.map((o, i) => `<button class="ball" style="left:${pos[i][0]}%;top:${pos[i][1]}%;background:${cs[i]};animation-delay:${i * .5}s" data-act="bpick" data-i="${i}">${o.t}</button>`).join('')}</div>`);
  setTimeout(() => speak(it.q), 300);
};
function bPick(i, el) {
  const o = G.opts[i];
  if (o.c) {
    el.classList.add('gone'); A.s('pop'); confetti(50); const g = G.wrong === 0 ? 10 : 5; G.gain += g; if (G.wrong === 0) G.perf++; addPts(g, el); owlAnim('cheer'); speak(G.items[G.r].e + ' ' + o.t);
    G.r++; setTimeout(() => { if (G.r >= 5) { const st = G.perf >= 5 ? 3 : G.perf >= 3 ? 2 : 1; gameEnd('Balonlar Patladı!', 10 + st * 5, st, 'bal', G.gain); } else render(); }, 1000);
    document.querySelectorAll('.ball').forEach(b => { if (b !== el) b.classList.add('gone'); });
  } else { G.wrong++; el.classList.add('bad'); A.s('no'); }
}
// Deyim eşleştir
SCR.g_mat = function () {
  if (!G) G = { r: 0, mist: 0, perfect: 0 };
  G.pairs = shuffle(ITEMS.dey.slice()).slice(0, 4); G.R = shuffle(G.pairs.slice()); G.selL = null; G.done = 0;
  setApp(`<div class="top"><button class="back" data-act="back">←</button><div class="title">🔗 Deyim Eşleştir ${G.r + 1}/2</div></div><p style="text-align:center;margin:.2rem">Deyimi, anlamıyla eşleştir!</p>
<div class="cols"><div>${G.pairs.map(p => `<button class="mt" data-act="mt" data-s="L" data-k="${p.id}">${p.n}</button>`).join('')}</div><div>${G.R.map(p => `<button class="mt" data-act="mt" data-s="R" data-k="${p.id}">${p.m}</button>`).join('')}</div></div>`);
};
function mtPick(el) {
  const s = el.dataset.s, k = el.dataset.k;
  if (s === 'L') { document.querySelectorAll('.mt[data-s=L]').forEach(b => b.classList.remove('sel')); el.classList.add('sel'); G.selL = k; speak(DEYIM.find((d, i) => 'd' + i === k)[0]); A.s('click'); return; }
  if (!G.selL) { A.s('click'); return; }
  if (G.selL === k) {
    document.querySelectorAll(`.mt[data-k=${k}]`).forEach(b => { b.classList.remove('sel'); b.classList.add('done'); }); G.selL = null; G.done++; A.s('ok'); addPts(5, el);
    if (G.done === 4) { G.r++; if (G.r >= 2) { const st = G.mist <= 1 ? 3 : G.mist <= 4 ? 2 : 1; const g = Math.max(10, 20 - G.mist * 2) + st * 5; setTimeout(() => gameEnd('Eşleştirme Tamam!', g, st, 'mat', 40), 700); } else setTimeout(render, 800); }
  } else { G.mist++; el.classList.add('no'); A.s('no'); setTimeout(() => el.classList.remove('no'), 500); }
}
// Atasözü sırala
SCR.g_srt = function () {
  if (!G) G = { r: 0, items: shuffle(ITEMS.ata.filter(x => x.t.split(' ').length <= 7)).slice(0, 3), fails: 0 };
  const it = G.items[G.r], w = it.t.split(' '); G.w = w; G.order = shuffle(w.map((x, i) => i)); G.placed = w.map(() => null); G.lock = w.map(() => false);
  drawSrt();
};
function drawSrt(msg) {
  const it = G.items[G.r], w = G.w;
  setApp(`<div class="top"><button class="back" data-act="back">←</button><div class="title">🧱 Atasözü Sırala ${G.r + 1}/3</div></div><p style="text-align:center;margin:.2rem">${it.e} Kelimeleri doğru sıraya diz!</p>
<div class="slots">${G.placed.map((p, i) => `<button class="slot ${p === null ? '' : 'fill'} ${G.lock[i] ? 'ok' : ''} ${G.bad && G.bad[i] ? 'bad' : ''}" data-act="sslot" data-i="${i}">${p === null ? '&nbsp;&nbsp;' : G.order.length ? w[G.order[p]] : ''}</button>`).join('')}</div>
<div class="chips">${G.order.map((wi, k) => `<button class="chip2 ${G.placed.includes(k) ? 'used' : ''}" data-act="schip" data-i="${k}">${w[wi]}</button>`).join('')}</div>${msg || ''}`);
}
function sChip(k) {
  const i = G.placed.indexOf(null); if (i < 0) return; G.placed[i] = k; A.s('click'); G.bad = null; drawSrt();
  if (G.placed.indexOf(null) < 0) {
    const bad = G.placed.map((p, j) => G.w[G.order[p]] !== G.w[j]);
    if (!bad.some(x => x)) { G.lock = G.lock.map(() => true); const it = G.items[G.r]; const g = Math.max(5, 15 - G.fails * 3); G.fails = 0; G.gain = (G.gain || 0) + g; A.s('ok'); confetti(60); addPts(g); speak(it.t + '. ' + it.m); drawSrt(`<div class="fb ok"><b>Doğru! 🎉</b><br>${it.m}</div><button class="btn green" data-act="snext">${G.r >= 2 ? 'Bitir 🏁' : 'Devam ▶'}</button>`); }
    else { G.fails++; G.totalFails = (G.totalFails || 0) + 1; G.bad = bad; A.s('no'); drawSrt(); setTimeout(() => { G.placed = G.placed.map((p, j) => bad[j] ? null : p); G.lock = G.placed.map((p, j) => p !== null); G.bad = null; drawSrt(); }, 800); }
  }
}
function sSlot(i) { if (G.lock[i] || G.placed[i] === null || G.bad) return; G.placed[i] = null; A.s('click'); drawSrt(); }

// ---------- Tıklama yönetimi ----------
const ACT = {
  close() { closeModal(); },
  back() { window.goBack(); },
  intro() { const v = ($('#nm').value || '').trim(); S.name = v || 'Kaşif'; save(); replace('home'); speak('Merhaba ' + S.name + '! Hadi başlayalım!'); },
  mute() { S.set.music = !S.set.music; save(); render(); },
  owltap() { owlAnim('cheer'); const t = ['Bugün de çok şey öğreneceğiz!', 'Ben Bilo! Sen de çok akıllısın!', 'Hu hu! Bilmece sorayım mı?', 'Beraber öğrenmek çok eğlenceli!']; speak(t[rnd(t.length)], 'force'); },
  daily() {
    const y = S.last === yesterday(); S.streak = y ? S.streak + 1 : 1; S.last = today(); const p = 10 * Math.min(S.streak, 5); addPts(p); save();
    showModal({ e: '🎁', cls: 'chest', title: 'Günlük Sürpriz!', text: `🔥 Üst üste <b>${S.streak}</b>. gün! Ödül: +${p} puan`, lock: 1, snd: 'chest', btns: [{ t: 'Aç! ✨', a: 'chestopen', d: '1', c: 'orange' }] });
    render();
  },
  locked(el) { const n = +(el.dataset.n || secOf(el.dataset.a).need); A.s('no'); showModal({ e: '🔒', title: 'Henüz kilitli!', text: `Bu bölüm için <b>${n - S.pts}</b> puan daha kazanmalısın. Soru çözerek hemen kazanabilirsin!`, btns: [{ t: 'Tamam 👍', a: 'close', c: 'green' }] }); },
  sec(el) { A.s('click'); go('sec', el.dataset.a); },
  quiz(el) { const id = el.dataset.a; QZ = null; if (cur.name === 'learn') NAV.pop(); if (cur.name === 'result') NAV.pop(); go('quiz', id); },
  learn(el) { const id = el.dataset.a; go('learn', { id, list: pickItems(id, 10), i: 0 }); },
  lnext() { cur.p.i++; cur.p.rev = false; render(); },
  lprev() { cur.p.i--; cur.p.rev = false; render(); },
  reveal() { cur.p.rev = true; A.s('ok'); render(); },
  say(el) { forceSpeak(cur.p.list[cur.p.i].t, +el.dataset.r); },
  say2() { forceSpeak(cur.p.say, .9); },
  pick(el) { qPick(+el.dataset.i, el); },
  hint: qHint,
  qspeak() { forceSpeak(QZ.qs[QZ.i].speak, .9); },
  qsay() { forceSpeak(QZ.qs[QZ.i].say, .8); },
  qnext() { QZ.i++; if (QZ.i >= QZ.qs.length) endQuiz(); else quizShow(); },
  exitq: exitQuiz,
  quitq() { closeModal(true); QZ = null; NAV.pop(); render(); },
  chest(el) { chestFlow(el.dataset.g === '1'); el.remove(); },
  chestopen(el) { closeModal(true); chestOpen(el.dataset.d === '1'); },
  notebook() { go('notebook'); },
  nspeak(el) { const k = el.dataset.k; const it = Object.values(ITEMS).flat().find(x => x.id === k); if (it) forceSpeak(it.f, .9); },
  album() { go('album'); }, wardrobe() { go('wardrobe'); }, settings() { go('settings'); },
  stk(el) { A.s('pop'); el.classList.add('new'); speak('Harika bir çıkartma!'); setTimeout(() => el.classList.remove('new'), 1200); },
  hat(el) { S.hat = el.dataset.a; save(); A.s('ok'); render(); },
  hatlock(el) { A.s('no'); showModal({ e: '🔒', title: 'Kilitli', text: `Bu aksesuar <b>Seviye ${el.dataset.a}</b>'de açılır!`, btns: [{ t: 'Tamam', a: 'close', c: 'green' }] }); },
  tog(el) { const k = el.dataset.a; S.set[k] = !S.set[k]; save(); render(); },
  savename() { S.name = ($('#nm').value || '').trim() || 'Kaşif'; save(); A.s('ok'); showModal({ e: '✅', title: 'Kaydedildi!', text: 'Merhaba ' + esc(S.name) + '!' }); },
  reset() { showModal({ e: '⚠️', title: 'Emin misin?', text: 'Tüm puanlar, çıkartmalar ve ilerleme silinecek!', btns: [{ t: 'Vazgeç', a: 'close', c: 'green' }, { t: 'Evet, sıfırla', a: 'reset2', c: 'alt' }] }); },
  reset2() { closeModal(true); S = defState(); save(); NAV = []; go('intro'); },
  game(el) { if (cur.name === 'result') NAV.pop(); gameStart(el.dataset.a); },
  mflip(el) { mFlip(+el.dataset.i); },
  gspeak() { forceSpeak(G.items[G.r].q, .9); },
  bpick(el) { bPick(+el.dataset.i, el); },
  mt(el) { mtPick(el); },
  schip(el) { sChip(+el.dataset.i); },
  sslot(el) { sSlot(+el.dataset.i); },
  snext() { G.r++; if (G.r >= 3) { const st = (G.totalFails || 0) === 0 ? 3 : G.totalFails <= 3 ? 2 : 1; gameEnd('Atasözleri Tamam!', 10 + st * 5, st, 'srt', G.gain); } else render(); }
};
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a) return;
  if (ACT[a.dataset.act]) { if (!['pick', 'bpick', 'mflip', 'schip', 'sslot', 'mt'].includes(a.dataset.act)) A.s('click'); ACT[a.dataset.act](a); }
});

// ---------- Başlat ----------
(function init() {
  const sky = $('#sky');
  for (let i = 0; i < 5; i++) { const c = document.createElement('div'); c.className = 'cloud'; c.textContent = '☁️'; c.style.top = (4 + i * 11) + 'vh'; c.style.animationDuration = (50 + i * 15) + 's'; c.style.animationDelay = (-i * 17) + 's'; c.style.fontSize = (2.4 + (i % 3)) + 'rem'; sky.appendChild(c); }
  sky.insertAdjacentHTML('beforeend', '<div class="hill"></div><div class="hill h2"></div>');
  if (!S.name) NAV.push({ name: 'intro' }); else NAV.push({ name: 'home' });
  render();
})();
