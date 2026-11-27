// Wetterstation Garten – eigene Lovelace-Karte (v1.3.1)
const DEF = {
  temp: 'sensor.garden_wetterstation_temperatur',
  tmax24: 'sensor.garten_wetterstation_temperatur_max_24h',
  tmin24: 'sensor.garten_wetterstation_temperatur_min_24h',
  dew: 'sensor.garden_wetterstation_taupunkt',
  hum: 'sensor.garden_wetterstation_luftfeuchtigkeit',
  pressure: 'sensor.garden_wetterstation_druck',
  trend: 'sensor.garten_wetterstation_luftdruck_tendenz_3h',
  wind: 'sensor.garden_wetterstation_geschwindigkeit',
  gust: 'sensor.garden_wetterstation_geschwindigkeit_2',
  dir: 'sensor.garden_wetterstation_richtung',
  dirText: 'sensor.wetterstation_windrichtung',
  uv: 'sensor.garden_wetterstation_uv_index',
  lux: 'sensor.garden_wetterstation_beleuchtungsstarke',
  rainRate: 'sensor.garden_wetterstation_niederschlag_pro_stunde',
  rainDay: 'sensor.garten_wetterstation_niederschlag_heute',
  rainMonth: 'sensor.garten_wetterstation_niederschlag_monat',
  rainYear: 'sensor.garten_wetterstation_niederschlag_jahr',
  battery: 'sensor.garden_wetterstation_batterie',
};
const MON = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const MONL = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const fmt = (v, d = 1) => (v == null || isNaN(v)) ? '–' : Number(v).toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
const ddmm = (t) => { const d = new Date(t); return `${d.getDate()}. ${MONL[d.getMonth()]}`; };
const STOPS = [[-12, [86, 58, 190]], [-4, [52, 112, 214]], [4, [86, 178, 222]], [11, [214, 232, 214]], [17, [246, 205, 96]], [24, [238, 120, 52]], [32, [196, 36, 52]]];
function tcol(t, a = 1) {
  if (t == null || isNaN(t)) return 'transparent';
  let c = STOPS[0][1];
  if (t >= STOPS[STOPS.length - 1][0]) c = STOPS[STOPS.length - 1][1];
  else for (let i = 0; i < STOPS.length - 1; i++) {
    const [t0, c0] = STOPS[i], [t1, c1] = STOPS[i + 1];
    if (t >= t0 && t <= t1) { const k = (t - t0) / (t1 - t0); c = c0.map((v, j) => Math.round(v + (c1[j] - v) * k)); break; }
  }
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}
const BFT = [[1, 'Windstille'], [6, 'leiser Zug'], [12, 'leichte Brise'], [20, 'schwache Brise'], [29, 'mäßige Brise'], [39, 'frische Brise'], [50, 'starker Wind'], [62, 'steifer Wind'], [75, 'stürmischer Wind'], [89, 'Sturm'], [103, 'schwerer Sturm'], [118, 'orkanartiger Sturm'], [1e9, 'Orkan']];
const bft = (v) => { for (let i = 0; i < BFT.length; i++) if (v < BFT[i][0]) return [i, BFT[i][1]]; return [12, 'Orkan']; };
const uvTxt = (u) => u < 3 ? 'niedrig' : u < 6 ? 'mäßig' : u < 8 ? 'hoch' : u < 11 ? 'sehr hoch' : 'extrem';
const trTxt = (t) => Math.abs(t) < 0.5 ? 'gleichbleibend' : t > 0 ? (t > 2 ? 'steigt stark' : 'steigt leicht') : (t < -2 ? 'fällt stark' : 'fällt leicht');
const ROSENAMES = ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const ROSECOL = ['#cfe3f7', '#93c0ec', '#5597dc', '#2f6cc0', '#1f3f86'];
const ROSECLN = ['unter 6 km/h · Bft 0–1', '6–12 km/h · Bft 2', '12–20 km/h · Bft 3', '20–29 km/h · Bft 4', 'ab 29 km/h · Bft 5+'];
const icon = (i, s = 18) => `<ha-icon icon="${i}" style="--mdc-icon-size:${s}px;width:${s}px;height:${s}px"></ha-icon>`;

class Sky {
  constructor(cv) { this.cv = cv; this.ctx = cv.getContext('2d'); this.p = []; this.t = 0; this.mode = {}; this.run = false; }
  resize(w, h) { const r = window.devicePixelRatio || 1; this.w = w; this.h = h; this.cv.width = w * r; this.cv.height = h * r; this.ctx.setTransform(r, 0, 0, r, 0, 0); this.seed(); }
  set(m) { const k = JSON.stringify(m); if (k === this.key) return; this.key = k; this.mode = m; this.seed(); }
  seed() {
    if (!this.w) return;
    const m = this.mode, A = this.w * this.h / 1000, R = Math.random;
    this.stars = m.night ? Array.from({ length: Math.round(A * 0.35) }, () => ({ x: R() * this.w, y: R() * this.h * 0.75, r: R() * 1.3 + 0.3, ph: R() * 6.3 })) : [];
    this.clouds = Array.from({ length: m.sun ? 2 : 5 }, (_, i) => ({ x: R() * this.w, y: 20 + R() * this.h * 0.45, s: 70 + R() * 110, v: 0.08 + R() * 0.2 }));
    const n = m.rain ? Math.round(A * (m.snow ? 0.5 : 0.9)) : m.frost ? Math.round(A * 0.12) : 0;
    this.p = Array.from({ length: n }, () => ({ x: R() * this.w, y: R() * this.h, v: m.snow || m.frost ? 0.4 + R() * 0.9 : 7 + R() * 6, r: R() * 2 + 0.8, ph: R() * 6.3 }));
  }
  start() {
    if (this.run) return; this.run = true;
    const still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const loop = () => { if (!this.run) return; this.draw(); this.t += 1; if (!still) this.raf = requestAnimationFrame(loop); };
    loop();
  }
  stop() { this.run = false; cancelAnimationFrame(this.raf); }
  draw() {
    const c = this.ctx, m = this.mode, w = this.w, h = this.h; if (!w) return;
    c.clearRect(0, 0, w, h);
    const wx = m.wx || 0;
    for (const s of this.stars) { c.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(s.ph + this.t * 0.02)); c.fillStyle = '#fff'; c.beginPath(); c.arc(s.x, s.y, s.r, 0, 6.3); c.fill(); }
    c.globalAlpha = 1;
    if (m.sun && !m.night) {
      const g = c.createRadialGradient(w * 0.82, h * 0.12, 0, w * 0.82, h * 0.12, 220 + 12 * Math.sin(this.t * 0.02));
      g.addColorStop(0, 'rgba(255,240,180,.75)'); g.addColorStop(0.25, 'rgba(255,220,140,.25)'); g.addColorStop(1, 'rgba(255,220,140,0)');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
    }
    if (m.night) {
      const g = c.createRadialGradient(w * 0.8, h * 0.18, 0, w * 0.8, h * 0.18, 90);
      g.addColorStop(0, 'rgba(235,240,255,.9)'); g.addColorStop(0.18, 'rgba(235,240,255,.85)'); g.addColorStop(0.22, 'rgba(200,215,255,.18)'); g.addColorStop(1, 'rgba(200,215,255,0)');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
    }
    for (const k of this.clouds) {
      k.x += k.v * (1 + Math.abs(wx) * 0.3) * (wx < 0 ? -1 : 1);
      if (k.x > w + k.s * 2) k.x = -k.s * 2; if (k.x < -k.s * 2) k.x = w + k.s * 2;
      const al = m.night ? 0.07 : m.rain ? 0.22 : 0.16;
      for (const [dx, dy, f] of [[0, 0, 1], [k.s * 0.6, k.s * 0.15, 0.75], [-k.s * 0.6, k.s * 0.2, 0.7]]) {
        const g = c.createRadialGradient(k.x + dx, k.y + dy, 0, k.x + dx, k.y + dy, k.s * f);
        g.addColorStop(0, `rgba(255,255,255,${al})`); g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g; c.beginPath(); c.arc(k.x + dx, k.y + dy, k.s * f, 0, 6.3); c.fill();
      }
    }
    if (m.rain && !m.snow) {
      c.strokeStyle = 'rgba(210,230,255,.55)'; c.lineWidth = 1.2; c.beginPath();
      for (const p of this.p) { p.y += p.v; p.x += wx * 0.8; if (p.y > h) { p.y = -12; p.x = Math.random() * w; } if (p.x > w) p.x = 0; if (p.x < 0) p.x = w; c.moveTo(p.x, p.y); c.lineTo(p.x + wx * 1.6, p.y + p.v * 1.6); }
      c.stroke();
    } else if (this.p.length) {
      c.fillStyle = 'rgba(255,255,255,.85)';
      for (const p of this.p) { p.y += p.v; p.x += Math.sin(p.ph + this.t * 0.02) * 0.4 + wx * 0.25; if (p.y > h) { p.y = -4; p.x = Math.random() * w; } if (p.x > w) p.x = 0; if (p.x < 0) p.x = w; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.3); c.fill(); }
    }
  }
}

const CSS = `
:host{display:block;--wg-surface:var(--ha-card-background,var(--card-background-color,#fff));--wg-fg:var(--primary-text-color,#14191f);--wg-fg2:var(--secondary-text-color,#5b6672);--wg-line:var(--divider-color,rgba(0,0,0,.12));--wg-rain:#3987e5}
*{box-sizing:border-box}
.wrap{max-width:1240px;margin:0 auto;display:flex;flex-direction:column;gap:16px;padding:4px 0 24px}
.hero{position:relative;border-radius:28px;overflow:hidden;color:#fff;min-height:330px;transition:background 2s;box-shadow:0 18px 40px rgba(0,0,0,.22)}
.hero canvas{position:absolute;inset:0;width:100%;height:100%}
.hin{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;padding:24px 26px 22px}
.loc{font-size:14px;opacity:.9;font-weight:500;letter-spacing:.02em}
.back{font:inherit;display:inline-flex;align-items:center;gap:2px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.28);color:#fff;border-radius:999px;padding:5px 13px 5px 6px;font-size:13.5px;font-weight:600;cursor:pointer;backdrop-filter:blur(6px);margin-bottom:10px}
.wrap.pad{padding:max(16px,env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) max(14px,env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left))}
.big{font-size:clamp(64px,11vw,112px);font-weight:200;line-height:1;letter-spacing:-.04em;margin:6px 0 2px;font-variant-numeric:tabular-nums}
.big small{font-size:.32em;font-weight:400;letter-spacing:0;opacity:.85;margin-left:6px;vertical-align:.95em}
.sub{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:15px;opacity:.95;align-items:center}
.sub span{display:inline-flex;align-items:center;gap:3px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;min-height:26px}
.chip{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:4px 11px;font-size:12px;font-weight:600;backdrop-filter:blur(6px)}
.cmp{display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center}
.cmp svg{width:150px;height:150px}
.cmp .needle{transition:transform 1.5s cubic-bezier(.3,1.4,.5,1);transform-origin:75px 75px}
.cmp b{font-size:14px}.cmp em{font-style:normal;font-size:12px;opacity:.85}
.glass{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:8px;margin-top:8px}
.g{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);border-radius:18px;padding:11px 12px;backdrop-filter:blur(8px);display:flex;flex-direction:column;gap:1px;min-width:0}
.g .l{font-size:11px;text-transform:uppercase;letter-spacing:.07em;opacity:.8;display:flex;align-items:center;gap:5px}
.g .v{font-size:20px;font-weight:650;white-space:nowrap;font-variant-numeric:tabular-nums}
.g .v small{font-size:12px;font-weight:500;opacity:.85;margin-left:2px}
.g .h{font-size:11.5px;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.blk{background:var(--wg-surface);color:var(--wg-fg);border-radius:24px;padding:18px 20px;border:1px solid var(--wg-line);min-width:0}
.bh{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px}
.bh h2{margin:0;font-size:18px;font-weight:650;letter-spacing:-.01em}
.bh p{margin:0;color:var(--wg-fg2);font-size:13px}
.two{display:grid;grid-template-columns:minmax(0,1fr);gap:16px}
svg text{font-family:inherit}
.ax{fill:var(--wg-fg2);font-size:11px}.lb{fill:var(--wg-fg);font-size:11.5px;font-weight:650}
.grid{stroke:var(--wg-line);stroke-width:1}
.tbl{overflow-x:auto}
table{border-collapse:collapse;width:100%;min-width:760px;font-size:13.5px;font-variant-numeric:tabular-nums}
th,td{padding:9px 10px;text-align:right;border-bottom:1px solid var(--wg-line);white-space:nowrap}
th{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--wg-fg2);font-weight:600}
th:first-child,td:first-child{text-align:left}
tbody tr:last-child td{border-bottom:none}
.dot{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:8px;vertical-align:-1px}
.run{font-size:11px;color:var(--wg-fg2);margin-left:6px}
.pill{display:inline-block;min-width:26px;padding:1px 7px;border-radius:999px;font-size:12px;font-weight:650;text-align:center}
.recs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));gap:10px}
.rec{border-radius:20px;padding:14px 16px;color:#fff;display:flex;flex-direction:column;gap:2px;position:relative;overflow:hidden}
.rec .l{font-size:11px;text-transform:uppercase;letter-spacing:.08em;opacity:.9;display:flex;gap:6px;align-items:center}
.rec .v{font-size:clamp(22px,5vw,28px);font-weight:650;font-variant-numeric:tabular-nums}
.rec .v small{font-size:14px;font-weight:500;opacity:.9;margin-left:3px}
.rec .d{font-size:12.5px;opacity:.92}
.rec ha-icon.bgi{position:absolute;right:-10px;bottom:-14px;opacity:.18;--mdc-icon-size:84px}
.legend{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--wg-fg2)}
.legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.scale{height:8px;border-radius:4px;width:180px;background:linear-gradient(90deg,${STOPS.map(s => `rgb(${s[1]})`).join(',')})}
.msg{color:var(--wg-fg2);font-size:13px;padding:20px 0}
.seg{display:inline-flex;flex-wrap:wrap;background:var(--wg-line);border-radius:999px;padding:3px;gap:2px}
.seg button{font:inherit;font-size:12.5px;font-weight:600;border:0;background:transparent;color:var(--wg-fg2);padding:5px 12px;border-radius:999px;cursor:pointer}
.seg button.on{background:var(--wg-surface);color:var(--wg-fg);box-shadow:0 1px 3px rgba(0,0,0,.15)}
.seg button:focus-visible{outline:2px solid var(--wg-rain);outline-offset:1px}
.rosebox{display:grid;grid-template-columns:minmax(0,440px) minmax(0,1fr);gap:28px;align-items:center}
.rosebox svg{width:100%;height:auto;max-width:440px;display:block;margin:0 auto}
.rkpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:16px}
.rk{border:1px solid var(--wg-line);border-radius:16px;padding:12px 14px}
.rk .l{font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:var(--wg-fg2)}
.rk .v{font-size:22px;font-weight:650;font-variant-numeric:tabular-nums}
.rk .v small{font-size:13px;font-weight:500;color:var(--wg-fg2);margin-left:3px}
.rk .h{font-size:12px;color:var(--wg-fg2)}
.cls{display:flex;flex-direction:column;gap:6px;font-size:13px}
.cls div{display:flex;align-items:center;gap:8px}.cls i{width:14px;height:14px;border-radius:4px;flex:none}
.cls span.p{margin-left:auto;font-variant-numeric:tabular-nums;color:var(--wg-fg2)}
.rnote{font-size:12px;color:var(--wg-fg2);margin-top:12px}
.tip{position:fixed;z-index:99;pointer-events:none;background:rgba(20,25,31,.94);color:#fff;font-size:12px;line-height:1.45;padding:7px 10px;border-radius:9px;white-space:nowrap;box-shadow:0 6px 18px rgba(0,0,0,.3)}
.hit{fill:transparent}.hit:hover{fill:var(--wg-line)}
@media (max-width:640px){.hin{grid-template-columns:1fr;padding:20px 18px}.cmp{flex-direction:row;justify-content:flex-start;text-align:left}.cmp svg{width:110px;height:110px}.blk{padding:16px 14px}.rosebox{grid-template-columns:1fr;gap:16px}}
`;

class WetterstationGartenCard extends HTMLElement {
  setConfig(c) { this.cfg = c || {}; this.e = { ...DEF, ...(c && c.entities || {}) }; }
  getCardSize() { return 20; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  connectedCallback() { if (this.sky) this.sky.start(); }
  disconnectedCallback() { if (this.sky) this.sky.stop(); }
  st(k) { const s = this._hass && this._hass.states[this.e[k]]; return s ? s.state : undefined; }
  n(k) { const v = parseFloat(this.st(k)); return isNaN(v) ? null : v; }
  set hass(h) {
    this._hass = h;
    if (!this.root) this.build();
    const key = Object.keys(DEF).map(k => this.st(k)).join('|') + new Date().getMinutes();
    if (key !== this._key) { this._key = key; this.renderHero(); }
    const now = Date.now();
    if (!this._loading && (!this._loaded || now - this._loaded > 30 * 60e3)) this.load();
  }
  build() {
    this.root = this.attachShadow({ mode: 'open' });
    this.root.innerHTML = `<style>${CSS}</style><div class="wrap ${this.cfg.inset === 'ipad' && /iPad/.test(navigator.userAgent) ? 'pad' : ''}">
      <div class="hero" id="hero"><canvas id="sky"></canvas><div class="hin" id="hin"></div></div>
      <div class="blk"><div class="bh"><h2>Windrose</h2><div class="seg" id="roseseg"><button data-h="24">24 h</button><button data-h="72">3 Tage</button><button data-h="168" class="on">7 Tage</button><button data-h="240">10 Tage</button><button data-h="m">Monat</button><button data-h="y">Jahr</button><button data-h="all">Gesamt</button></div></div><div id="rose"><div class="msg">Lade Windverlauf …</div></div></div>
      <div class="blk"><div class="bh"><h2>Das Jahr in Farben</h2><p id="bandsub">Jeder Streifen ein Tag, gefärbt nach der Tagesmitteltemperatur</p></div><div id="band"><div class="msg">Lade Statistik …</div></div></div>
      <div class="blk"><div class="bh"><h2>Monate im Vergleich</h2><div class="legend"><span><i style="background:linear-gradient(${tcol(28)},${tcol(-2)})"></i>Spanne Min–Max</span><span><i style="background:var(--wg-fg);border-radius:50%"></i>Mittel</span><span><i style="background:var(--wg-rain)"></i>Niederschlag</span></div></div><div id="chart"></div></div>
      <div class="blk"><div class="bh"><h2>Monatsbilanz</h2><p>Sommertag: Max ≥ 25 °C · Frosttag: Min &lt; 0 °C · Regentag: ≥ 1 mm</p></div><div class="tbl" id="table"></div></div>
      <div class="blk"><div class="bh"><h2 id="rech">Rekorde</h2><p>Aus den Tageswerten der Langzeitstatistik</p></div><div class="recs" id="recs"></div></div>
    </div><div class="tip" id="tip" hidden></div>`;
    this.$ = (id) => this.root.getElementById(id);
    this.sky = new Sky(this.$('sky'));
    const ro = new ResizeObserver(() => {
      const r = this.$('hero').getBoundingClientRect(); if (r.width) this.sky.resize(r.width, r.height);
      const w = this.$('chart').clientWidth; if (w && Math.abs(w - (this._w || 0)) > 8) { this._w = w; this.renderData(); }
    });
    ro.observe(this.$('hero')); ro.observe(this.$('chart'));
    const tip = this.$('tip');
    this.root.addEventListener('mousemove', (ev) => {
      const t = ev.composedPath().find(x => x.getAttribute && x.getAttribute('data-tip'));
      if (!t) { tip.hidden = true; return; }
      tip.innerHTML = t.getAttribute('data-tip'); tip.hidden = false;
      const x = Math.min(ev.clientX + 14, window.innerWidth - tip.offsetWidth - 8);
      tip.style.left = x + 'px'; tip.style.top = (ev.clientY - tip.offsetHeight - 12) + 'px';
    });
    this.root.addEventListener('mouseleave', () => tip.hidden = true);
    this.$('roseseg').addEventListener('click', (ev) => {
      const b = ev.target.closest('button[data-h]'); if (!b) return;
      this._roseH = isNaN(+b.dataset.h) ? b.dataset.h : +b.dataset.h; this.$('roseseg').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); this.renderRose();
    });
    this.$('hero').addEventListener('click', (ev) => { if (ev.target.closest('[data-back]')) { const b = this.cfg.back, f = new URLSearchParams(location.search).get('from'), p = f && f.startsWith('/') ? f : b.startsWith('/') ? b : `${this.cfg.base_path || ''}/${b}`; history.pushState(null, '', p); window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } })); return; } this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: this.e.temp } })); });
    this.sky.start();
  }
  renderHero() {
    const t = this.n('temp'), lux = this.n('lux') || 0, rr = this.n('rainRate') || 0, v = this.n('wind') || 0, g = this.n('gust') || 0;
    const d = this.n('dir') || 0, tr = this.n('trend') || 0, dew = this.n('dew'), uv = this.n('uv') || 0, hum = this.n('hum');
    const night = lux < 5, rain = rr > 0, snow = rain && t != null && t <= 1, frost = !rain && t != null && t <= 0, sun = !night && lux > 25000;
    const wx = Math.sin((d + 180) * Math.PI / 180) * Math.min(v, 60) / 10;
    this.sky.set({ night, rain, snow, frost, sun, wx: Math.round(wx * 10) / 10 });
    const base = t == null ? ['#2f4558', '#4c6a82'] : t < 0 ? ['#2a1f78', '#3c6fd0'] : t < 8 ? ['#163c6e', '#2b8f9a'] : t < 16 ? ['#156b70', '#5fae63'] : t < 24 ? ['#2d7fc0', '#e0a43a'] : t < 30 ? ['#d07a1a', '#e5532f'] : ['#b8302c', '#6d1636'];
    const bg = night ? `linear-gradient(170deg,#060a1f 0%,#14204a 55%,${base[0]} 130%)` : rain ? `linear-gradient(160deg,#3a4a5e 0%,#56708a 60%,${base[0]} 140%)` : `linear-gradient(135deg,${base[0]} 0%,${base[1]} 100%)`;
    this.$('hero').style.background = bg;
    let feel = null; if (t != null && t <= 10 && v > 4.8) { const p = Math.pow(v, 0.16); feel = 13.12 + 0.6215 * t - 11.37 * p + 0.3965 * t * p; }
    const chips = [];
    const ch = (i, s) => chips.push(`<span class="chip">${icon(i, 15)}${s}</span>`);
    if (t != null) { if (t <= 0) ch('mdi:snowflake-alert', 'Frost'); else if (t <= 3) ch('mdi:car-traction-control', 'Glättegefahr'); if (t >= 30) ch('mdi:fire', 'Hitze'); else if (t >= 25) ch('mdi:sunglasses', 'Sommertag'); }
    if (t != null && dew != null && t - dew < 1.5 && !rain) ch('mdi:weather-fog', 'Nebel möglich');
    if (rain) ch(snow ? 'mdi:weather-snowy' : 'mdi:weather-pouring', `${snow ? 'Schnee/Regen' : 'Regen'} ${fmt(rr)} mm/h`);
    if (g >= 62) ch('mdi:weather-windy', 'Sturmböen'); else if (g >= 39) ch('mdi:weather-windy', 'Windböen');
    if (tr <= -2) ch('mdi:trending-down', 'Druck fällt stark'); if (tr >= 2) ch('mdi:trending-up', 'Druck steigt stark');
    if (uv >= 6) ch('mdi:sun-wireless', `UV ${uvTxt(uv)}`);
    const [bn, bname] = bft(g > v ? (v + g) / 2 : v);
    const ticks = Array.from({ length: 72 }, (_, i) => `<line x1="75" y1="9" x2="75" y2="${i % 18 === 0 ? 19 : i % 6 === 0 ? 15 : 12}" stroke="rgba(255,255,255,${i % 18 === 0 ? .95 : i % 6 === 0 ? .6 : .3})" stroke-width="${i % 18 === 0 ? 2 : 1}" transform="rotate(${i * 5} 75 75)"/>`).join('');
    const L = (x, y, s) => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="12" font-weight="700">${s}</text>`;
    const now = new Date();
    this.$('hin').innerHTML = `
      <div>
        ${this.cfg.back ? `<button class="back" data-back="1"><ha-icon icon="mdi:chevron-left" style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>${this.cfg.back_label || 'Zurück'}</button>` : ''}
        <div class="loc">Garten · ${now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })} · ${now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</div>
        <div class="big">${fmt(t)}<small>°C</small></div>
        <div class="sub">
          <span>${icon('mdi:arrow-up-thin')}${fmt(this.n('tmax24'))}°</span><span>${icon('mdi:arrow-down-thin')}${fmt(this.n('tmin24'))}°</span>
          ${feel != null ? `<span>gefühlt ${fmt(feel)}°</span>` : ''}<span>Taupunkt ${fmt(dew)}°</span>
        </div>
        <div class="chips">${chips.join('')}</div>
      </div>
      <div class="cmp">
        <svg viewBox="0 0 150 150"><circle cx="75" cy="75" r="68" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.3)"/>${ticks}
          ${L(75, 30, 'N')}${L(120, 75, 'O')}${L(75, 120, 'S')}${L(30, 75, 'W')}
          <g class="needle" style="transform:rotate(${d + 180}deg)"><path d="M75 22 L84 72 L75 64 L66 72 Z" fill="#fff"/><path d="M75 128 L80 80 L70 80 Z" fill="rgba(255,255,255,.4)"/></g>
          <circle cx="75" cy="75" r="22" fill="rgba(8,16,36,.72)" stroke="rgba(255,255,255,.35)"/><text x="75" y="72" text-anchor="middle" fill="#fff" font-size="15" font-weight="700">${fmt(v, 0)}</text><text x="75" y="85" text-anchor="middle" fill="#fff" font-size="8" opacity=".85">km/h</text>
        </svg>
        <div><b>aus ${this.st('dirText') || '–'} · Bft ${bn}</b><br><em>${bname} · Böe ${fmt(g)} km/h</em></div>
      </div>
      <div class="glass">
        ${this.glass('mdi:water-percent', 'Feuchte', fmt(hum, 0), '%', hum >= 90 ? 'sehr feucht' : hum <= 35 ? 'trocken' : 'angenehm')}
        ${this.glass(tr > 0.5 ? 'mdi:trending-up' : tr < -0.5 ? 'mdi:trending-down' : 'mdi:trending-neutral', 'Luftdruck', fmt(this.n('pressure'), 0), 'hPa', `${trTxt(tr)} (${tr > 0 ? '+' : ''}${fmt(tr)} / 3 h)`)}
        ${this.glass('mdi:weather-rainy', 'Regen heute', fmt(this.n('rainDay')), 'mm', rain ? `aktuell ${fmt(rr)} mm/h` : 'trocken')}
        ${this.glass('mdi:calendar-month', 'Regen Monat', fmt(this.n('rainMonth')), 'mm', MONL[now.getMonth()])}
        ${this.glass('mdi:calendar-star', 'Regen Jahr', fmt(this.n('rainYear'), 0), 'mm', String(now.getFullYear()))}
        ${this.glass('mdi:white-balance-sunny', 'UV · Licht', fmt(uv, 0), '', `${uvTxt(uv)} · ${lux >= 1000 ? fmt(lux / 1000, 0) + ' klx' : fmt(lux, 0) + ' lx'}`)}
      </div>`;
  }
  glass(i, l, v, u, h) { return `<div class="g"><span class="l">${icon(i, 14)}${l}</span><span class="v">${v}<small>${u}</small></span><span class="h">${h}</span></div>`; }
  async load() {
    this._loading = true;
    this.loadRose();
    try {
      const now = new Date(), y0 = new Date(now.getFullYear(), 0, 1), m0 = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      const start = (m0 < y0 ? m0 : y0).toISOString();
      const e = this.e, ids = [e.temp, e.rainMonth, e.rainDay, e.gust, e.hum, e.pressure];
      const q = (period) => this._hass.callWS({ type: 'recorder/statistics_during_period', start_time: start, end_time: now.toISOString(), statistic_ids: ids, period, types: ['mean', 'min', 'max', 'change'], units: { temperature: '°C', speed: 'km/h', pressure: 'hPa' } });
      const [m, d] = await Promise.all([q('month'), q('day')]);
      this.data = { m, d, at: now }; this._loaded = Date.now();
      this.renderData();
    } catch (err) {
      this.$('band').innerHTML = `<div class="msg">Statistik konnte nicht geladen werden: ${err && err.message || err}</div>`;
      this._loaded = Date.now() - 25 * 60e3;
    } finally { this._loading = false; }
  }
  async loadRose() {
    try {
      const now = new Date(), st = new Date(now.getTime() - 10 * 864e5);
      const r = await this._hass.callWS({ type: 'history/history_during_period', start_time: st.toISOString(), end_time: now.toISOString(), entity_ids: [this.e.dir, this.e.wind], minimal_response: true, no_attributes: true, significant_changes_only: false });
      const conv = (a) => (a || []).map(x => [x.lu != null ? x.lu * 1000 : Date.parse(x.last_updated), parseFloat(x.s != null ? x.s : x.state)]).filter(x => !isNaN(x[1]) && !isNaN(x[0])).sort((a, b) => a[0] - b[0]);
      this.rose = { dir: conv(r[this.e.dir]), wind: conv(r[this.e.wind]), at: now.getTime() };
      this.renderRose();
    } catch (err) { this.$('rose').innerHTML = `<div class="msg">Windverlauf konnte nicht geladen werden: ${err && err.message || err}</div>`; }
  }
  renderRose() {
    const h = this._roseH || 168, el = this.$('rose'), tok = this._roseTok = (this._roseTok || 0) + 1;
    if (typeof h === 'string') { this.roseLong(h, tok); return; }
    if (!this.rose) return;
    const { dir, wind, at } = this.rose;
    if (!dir.length || !wind.length) { el.innerHTML = '<div class="msg">Noch kein Windverlauf vorhanden.</div>'; return; }
    const first = Math.max(dir[0][0], wind[0][0]), t0 = Math.max(at - h * 36e5, first), STEP = 120e3;
    const CL = [6, 12, 20, 29, Infinity];
    const bins = Array.from({ length: 16 }, () => [0, 0, 0, 0, 0]), spd = Array(16).fill(0), mx = Array(16).fill(0), cls = [0, 0, 0, 0, 0];
    let calm = 0, n = 0, i = 0, j = 0, sum = 0, vmax = 0;
    for (let t = t0; t <= at; t += STEP) {
      while (i + 1 < dir.length && dir[i + 1][0] <= t) i++;
      while (j + 1 < wind.length && wind[j + 1][0] <= t) j++;
      const v = wind[j][1], d = dir[i][1]; n++; sum += v; vmax = Math.max(vmax, v);
      if (v < 1) { calm++; continue; }
      const s = Math.round((((d % 360) + 360) % 360) / 22.5) % 16, c = CL.findIndex(x => v < x);
      bins[s][c]++; cls[c]++; spd[s] += v; mx[s] = Math.max(mx[s], v);
    }
    if (!n) { el.innerHTML = '<div class="msg">Keine Daten im Zeitraum.</div>'; return; }
    const span = (at - t0) / 36e5;
    this.drawRose({
      seg: bins.map(b => b.map(x => x / n * 100)), cols: ROSECOL, calm: calm / n * 100, mean: sum / n, max: vmax,
      tip: (k) => { const c = bins[k].reduce((x, y) => x + y, 0); return c ? `<br>Ø ${fmt(spd[k] / c)} km/h · max ${fmt(mx[k])} km/h` : ''; },
      legend: `<div class="cls">${ROSECOL.map((c, k) => `<div><i style="background:${c}"></i>${ROSECLN[k]}<span class="p">${fmt(cls[k] / n * 100, 0)} %</span></div>`).reverse().join('')}</div>`,
      note: `Ausgewertet in 2-Minuten-Schritten seit ${new Date(t0).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}, ${new Date(t0).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr (${span >= 48 ? fmt(span / 24, 0) + ' Tage' : fmt(span, 0) + ' Stunden'}).${span < h - 1 ? ' Für den gewählten Zeitraum reicht der gespeicherte Verlauf noch nicht.' : ''}`,
    });
  }
  async roseLong(key, tok) {
    const el = this.$('rose'), now = new Date();
    const start = key === 'm' ? new Date(now.getFullYear(), now.getMonth(), 1) : key === 'y' ? new Date(now.getFullYear(), 0, 1) : new Date(2000, 0, 1);
    const ids = ROSENAMES.map(x => (this.cfg.rose_prefix || 'sensor.windrose_') + x.toLowerCase());
    try {
      const r = await this._hass.callWS({ type: 'recorder/statistics_during_period', start_time: start.toISOString(), end_time: now.toISOString(), statistic_ids: [...ids, this.e.wind], period: 'day', types: ['mean', 'max'], units: { speed: 'km/h' } });
      if (tok !== this._roseTok) return;
      const rows = ids.map(id => r[id] || []), nd = Math.max(...rows.map(x => x.length));
      if (!nd) { el.innerHTML = '<div class="msg">Die Langzeit-Windrose sammelt seit 24. November Daten. Erste Werte erscheinen nach etwa einer Stunde, aussagekräftig wird sie nach einigen Tagen.</div>'; return; }
      const p = rows.map(x => x.length ? x.reduce((a, q) => a + (q.mean || 0), 0) / nd : 0);
      const t0 = Math.min(...rows.filter(x => x.length).map(x => new Date(typeof x[0].start === 'number' ? x[0].start : Date.parse(x[0].start)).getTime()));
      const w = (r[this.e.wind] || []).filter(q => new Date(typeof q.start === 'number' ? q.start : Date.parse(q.start)).getTime() >= t0);
      const mean = w.length ? w.reduce((a, q) => a + (q.mean || 0), 0) / w.length : null, max = w.length ? Math.max(...w.map(q => q.max || 0)) : null;
      const label = key === 'm' ? MONL[now.getMonth()] + ' ' + now.getFullYear() : key === 'y' ? 'Jahr ' + now.getFullYear() : 'gesamte Aufzeichnung';
      this.drawRose({
        seg: p.map(x => [x]), cols: ['#3f7fd0'], calm: Math.max(0, 100 - p.reduce((a, b) => a + b, 0)), mean, max, tip: () => '',
        legend: `<div class="cls"><div><i style="background:#3f7fd0"></i>Anteil der Zeit je Richtung</div></div>`,
        note: `${label}: ${nd} ${nd === 1 ? 'Tag' : 'Tage'} aus der Langzeitstatistik seit ${new Date(t0).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}. Für lange Zeiträume ohne Aufteilung nach Windstärke.`,
      });
    } catch (err) { if (tok === this._roseTok) el.innerHTML = `<div class="msg">Langzeitwerte konnten nicht geladen werden: ${err && err.message || err}</div>`; }
  }
  drawRose(o) {
    const el = this.$('rose'), NAMES = ROSENAMES;
    const pct = o.seg.map(a => a.reduce((x, y) => x + y, 0)), top = Math.max(...pct, 0.0001);
    const stepR = top <= 8 ? 2 : top <= 20 ? 5 : top <= 40 ? 10 : 20, maxR = Math.max(stepR, Math.ceil(top / stepR) * stepR);
    const C = 200, R = 160, H0 = 22, rr = (p) => H0 + p / maxR * (R - H0);
    const pt = (a, r) => [(C + r * Math.sin(a)).toFixed(2), (C - r * Math.cos(a)).toFixed(2)];
    const wedge = (a0, a1, r0, r1) => { const [x0, y0] = pt(a0, r1), [x1, y1] = pt(a1, r1), [x2, y2] = pt(a1, r0), [x3, y3] = pt(a0, r0); return `M${x0},${y0}A${r1},${r1} 0 0 1 ${x1},${y1}L${x2},${y2}A${r0},${r0} 0 0 0 ${x3},${y3}Z`; };
    let s = '';
    for (let p = stepR; p <= maxR; p += stepR) { const r = rr(p), [lx, ly] = pt(Math.PI / 11, r); s += `<circle cx="${C}" cy="${C}" r="${r}" fill="none" class="grid" ${p === maxR ? '' : 'stroke-dasharray="3 4"'}/><text x="${lx}" y="${ly}" class="ax" dx="4" dy="-3">${p} %</text>`; }
    for (let k = 0; k < 8; k++) { const [x, y] = pt(k * Math.PI / 4, R); s += `<line x1="${C}" y1="${C}" x2="${x}" y2="${y}" class="grid"/>`; }
    for (let k = 0; k < 16; k++) {
      const a = k * 22.5 * Math.PI / 180, a0 = a - 9.6 * Math.PI / 180, a1 = a + 9.6 * Math.PI / 180;
      let acc = 0;
      o.seg[k].forEach((p, c) => { if (!(p > 0)) return; s += `<path d="${wedge(a0, a1, rr(acc), rr(acc + p))}" fill="${o.cols[c]}" stroke="var(--wg-surface)" stroke-width="1"/>`; acc += p; });
      s += `<path d="${wedge(a0, a1, H0, R)}" class="hit" data-tip="<b>aus ${NAMES[k]}</b> (${Math.round(k * 22.5)}°)<br>${fmt(pct[k])} % der Zeit${o.tip(k)}"/>`;
    }
    for (let k = 0; k < 16; k += 2) { const [x, y] = pt(k * 22.5 * Math.PI / 180, R + 20); s += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" class="${k % 4 ? 'ax' : 'lb'}" style="font-size:${k % 4 ? 11 : 14}px">${NAMES[k]}</text>`; }
    s += `<circle cx="${C}" cy="${C}" r="${H0 - 2}" fill="var(--wg-surface)" stroke="var(--wg-line)"/><text x="${C}" y="${C - 3}" text-anchor="middle" class="lb" style="font-size:11px">${fmt(o.calm, 0)} %</text><text x="${C}" y="${C + 9}" text-anchor="middle" class="ax" style="font-size:8px">still</text>`;
    const main = pct.indexOf(Math.max(...pct)), sec = pct.map((p, k) => [p, k]).sort((a, b) => b[0] - a[0])[1];
    const kp = (l, v, u, h) => `<div class="rk"><div class="l">${l}</div><div class="v">${v}<small>${u}</small></div><div class="h">${h}</div></div>`;
    el.innerHTML = `<div class="rosebox"><svg viewBox="0 0 400 400" role="img" aria-label="Windrose">${s}</svg><div>
      <div class="rkpi">
        ${kp('Hauptwindrichtung', NAMES[main], fmt(pct[main], 0) + ' %', `danach ${NAMES[sec[1]]} mit ${fmt(sec[0], 0)} %`)}
        ${o.mean != null ? kp('Ø Wind', fmt(o.mean), 'km/h', `Bft ${bft(o.mean)[0]} · ${bft(o.mean)[1]}`) : ''}
        ${o.max != null ? kp('Stärkster Wind', fmt(o.max), 'km/h', `Bft ${bft(o.max)[0]} · ${bft(o.max)[1]}`) : ''}
        ${kp('Windstille', fmt(o.calm, 0), '%', 'unter 1 km/h')}
      </div>${o.legend}
      <div class="rnote">${o.note} Die Richtung gibt an, woher der Wind kommt.</div>
    </div></div>`;
  }
  renderData() {
    if (!this.data) return;
    const { m, d, at } = this.data, e = this.e;
    const ts = (r) => new Date(typeof r.start === 'number' ? r.start : Date.parse(r.start));
    const byKey = (rows, f) => { const o = {}; (rows || []).forEach(r => { const t = ts(r); o[f(t)] = r; }); return o; };
    const mk = (t) => `${t.getFullYear()}-${t.getMonth()}`, dk = (t) => `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
    const M = {}, D = {};
    for (const k of ['temp', 'rainMonth', 'rainDay', 'gust', 'hum', 'pressure']) { M[k] = byKey(m[e[k]], mk); D[k] = byKey(d[e[k]], dk); }
    // Monate
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const t = new Date(at.getFullYear(), at.getMonth() - i, 1), k = mk(t), T = M.temp[k];
      if (!T) continue;
      const days = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
      let su = 0, fr = 0, ra = 0;
      for (let j = 1; j <= days; j++) {
        const kk = `${t.getFullYear()}-${t.getMonth()}-${j}`, dt = D.temp[kk], dr = D.rainDay[kk];
        if (dt) { if (dt.max >= 25) su++; if (dt.min < 0) fr++; }
        if (dr && dr.change >= 1) ra++;
      }
      months.push({ t, k, mean: T.mean, min: T.min, max: T.max, rain: M.rainMonth[k] ? M.rainMonth[k].change : null, gust: M.gust[k] && M.gust[k].max, hum: M.hum[k] && M.hum[k].mean, pmin: M.pressure[k] && M.pressure[k].min, pmax: M.pressure[k] && M.pressure[k].max, su, fr, ra, cur: i === 0 });
    }
    this.renderBand(D, at);
    this.renderChart(months);
    this.renderTable(months);
    this.renderRecords(D, months, at);
  }
  renderBand(D, at) {
    const W = Math.max(this._w || this.$('band').clientWidth || 600, 280), y = at.getFullYear(), H = 84, top = 4;
    const n = (new Date(y, 11, 31) - new Date(y, 0, 1)) / 864e5 + 1, bw = W / n;
    let rects = '', labels = '', first = null, cnt = 0;
    for (let i = 0; i < n; i++) {
      const t = new Date(y, 0, 1 + i), r = D.temp[`${y}-${t.getMonth()}-${t.getDate()}`], x = i * bw;
      if (t.getDate() === 1) { labels += `<line x1="${x}" x2="${x}" y1="${top + H}" y2="${top + H + 5}" class="grid"/><text x="${x + 3}" y="${top + H + 17}" class="ax">${W < 520 ? MON[t.getMonth()][0] : MON[t.getMonth()]}</text>`; }
      if (r) {
        if (!first) first = t; cnt++;
        const rain = D.rainDay[`${y}-${t.getMonth()}-${t.getDate()}`];
        rects += `<rect x="${x.toFixed(2)}" y="${top}" width="${(bw + 0.6).toFixed(2)}" height="${H}" fill="${tcol(r.mean)}" data-tip="<b>${t.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'long' })}</b><br>Ø ${fmt(r.mean)} °C · ${fmt(r.min)} bis ${fmt(r.max)} °C${rain ? `<br>Regen ${fmt(rain.change)} mm` : ''}"/>`;
      } else if (t > at) rects += `<rect x="${x.toFixed(2)}" y="${top + H / 2 - 0.5}" width="${(bw + 0.6).toFixed(2)}" height="1" fill="var(--wg-line)"/>`;
    }
    const tx = (at - new Date(y, 0, 1)) / 864e5 * bw;
    this.$('band').innerHTML = `<svg width="${W}" height="${H + 26}" viewBox="0 0 ${W} ${H + 26}" style="display:block"><rect x="0" y="${top}" width="${W}" height="${H}" rx="10" fill="var(--wg-line)" opacity=".35"/>${rects}<line x1="${tx}" x2="${tx}" y1="0" y2="${top + H + 4}" stroke="var(--wg-fg)" stroke-width="1.5"/><text x="${Math.min(tx + 4, W - 34)}" y="${top + 12}" class="lb">heute</text>${labels}</svg>
      <div class="legend" style="margin-top:8px;align-items:center"><span>kalt</span><span class="scale"></span><span>heiß</span><span>${cnt} Tage aufgezeichnet${first ? ` seit ${ddmm(first)}` : ''}</span></div>`;
  }
  renderChart(ms) {
    const el = this.$('chart'); if (!ms.length) { el.innerHTML = '<div class="msg">Noch keine Monatsdaten.</div>'; return; }
    const W = Math.max(this._w || el.clientWidth || 600, 280), L = 34, R = 8, T1 = 20, H1 = 220, G = 34, H2 = 110, B = 24, H = T1 + H1 + G + H2 + B;
    const lo = Math.floor(Math.min(...ms.map(x => x.min)) / 5) * 5 - 5, hi = Math.ceil(Math.max(...ms.map(x => x.max)) / 5) * 5 + 5;
    const y = (v) => T1 + H1 * (1 - (v - lo) / (hi - lo)), rmax = Math.max(20, ...ms.map(x => x.rain || 0)) * 1.25;
    const y2 = (v) => T1 + H1 + G + H2 * (1 - v / rmax), step = (W - L - R) / ms.length, bw = Math.min(28, step * 0.38), rbw = Math.min(36, step * 0.5);
    let s = '';
    for (let v = lo; v <= hi; v += 5) s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="grid" ${v === 0 ? 'style="stroke:var(--wg-fg2);stroke-dasharray:3 3"' : ''}/>${v % 10 === 0 ? `<text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" class="ax">${v}°</text>` : ''}`;
    s += `<line x1="${L}" x2="${W - R}" y1="${y2(0)}" y2="${y2(0)}" class="grid"/><text x="${L - 6}" y="${y2(0) + 4}" text-anchor="end" class="ax">0</text><text x="${L - 6}" y="${T1 + H1 + G + 8}" text-anchor="end" class="ax">mm</text>`;
    let defs = '', path = '';
    ms.forEach((m, i) => {
      const cx = L + step * i + step / 2;
      defs += `<linearGradient id="gr${i}" x1="0" y1="${y(m.max)}" x2="0" y2="${y(m.min)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${tcol(m.max)}"/><stop offset="1" stop-color="${tcol(m.min)}"/></linearGradient>`;
      s += `<rect x="${cx - bw / 2}" y="${y(m.max)}" width="${bw}" height="${Math.max(2, y(m.min) - y(m.max))}" rx="${bw / 2}" fill="url(#gr${i})"/>`;
      s += `<text x="${cx}" y="${y(m.max) - 6}" text-anchor="middle" class="lb">${fmt(m.max)}</text><text x="${cx}" y="${y(m.min) + 15}" text-anchor="middle" class="ax">${fmt(m.min)}</text>`;
      path += `${i ? 'L' : 'M'}${cx},${y(m.mean)}`;
      if (m.rain != null) { const h = y2(0) - y2(m.rain); s += `<rect x="${cx - rbw / 2}" y="${y2(m.rain)}" width="${rbw}" height="${Math.max(h, 1)}" rx="5" fill="var(--wg-rain)" opacity="${m.cur ? .55 : .9}"/><text x="${cx}" y="${y2(m.rain) - 5}" text-anchor="middle" class="lb">${fmt(m.rain)}</text>`; }
      s += `<text x="${cx}" y="${H - 6}" text-anchor="middle" class="ax">${MON[m.t.getMonth()]}${m.cur ? '*' : ''}</text>`;
      s += `<rect x="${L + step * i}" y="${T1 - 16}" width="${step}" height="${H - T1}" class="hit" data-tip="<b>${MONL[m.t.getMonth()]} ${m.t.getFullYear()}${m.cur ? ' (läuft)' : ''}</b><br>Max ${fmt(m.max)} · Ø ${fmt(m.mean)} · Min ${fmt(m.min)} °C<br>Niederschlag ${fmt(m.rain)} mm · ${m.ra} Regentage<br>Ø Feuchte ${fmt(m.hum, 0)} % · Böe bis ${fmt(m.gust)} km/h"/>`;
    });
    s += `<path d="${path}" fill="none" stroke="var(--wg-fg)" stroke-width="2" stroke-dasharray="1 0" opacity=".55"/>`;
    ms.forEach((m, i) => { const cx = L + step * i + step / 2; s += `<circle cx="${cx}" cy="${y(m.mean)}" r="5" fill="var(--wg-fg)" stroke="var(--wg-surface)" stroke-width="2" pointer-events="none"/>`; });
    el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block"><defs>${defs}</defs>${s}</svg>`;
    // Kreise über Hit-Flächen ziehen, Hit-Flächen bleiben für Tooltips aktiv
  }
  renderTable(ms) {
    const pill = (n, c) => n ? `<span class="pill" style="background:${c};color:#fff">${n}</span>` : '<span style="opacity:.4">0</span>';
    const rows = ms.slice().reverse().map(m => `<tr><td><span class="dot" style="background:${tcol(m.mean)}"></span>${MONL[m.t.getMonth()]} ${m.t.getFullYear()}${m.cur ? '<span class="run">läuft</span>' : ''}</td>
      <td>${fmt(m.mean)} °</td><td>${fmt(m.min)} °</td><td>${fmt(m.max)} °</td><td>${fmt(m.rain)} mm</td><td>${pill(m.ra, '#3987e5')}</td><td>${pill(m.su, '#e5732f')}</td><td>${pill(m.fr, '#4b5fd1')}</td><td>${fmt(m.hum, 0)} %</td><td>${fmt(m.gust)} km/h</td><td>${fmt(m.pmin, 0)}–${fmt(m.pmax, 0)}</td></tr>`).join('');
    const sum = (k) => ms.reduce((a, m) => a + (m[k] || 0), 0);
    this.$('table').innerHTML = `<table><thead><tr><th>Monat</th><th>Ø Temp</th><th>Min</th><th>Max</th><th>Regen</th><th>Regentage</th><th>Sommertage</th><th>Frosttage</th><th>Ø Feuchte</th><th>Böe max</th><th>Druck hPa</th></tr></thead><tbody>${rows}</tbody>
      <tfoot><tr><td><b>Summe</b></td><td></td><td></td><td></td><td><b>${fmt(sum('rain'))} mm</b></td><td>${pill(sum('ra'), '#3987e5')}</td><td>${pill(sum('su'), '#e5732f')}</td><td>${pill(sum('fr'), '#4b5fd1')}</td><td></td><td></td><td></td></tr></tfoot></table>`;
  }
  renderRecords(D, ms, at) {
    const y = at.getFullYear(), list = (k) => Object.entries(D[k]).filter(([kk]) => kk.startsWith(y + '-')).map(([, r]) => r);
    const ts = (r) => new Date(typeof r.start === 'number' ? r.start : Date.parse(r.start));
    const best = (arr, f, dir) => arr.reduce((a, r) => (f(r) != null && (a == null || (dir > 0 ? f(r) > f(a) : f(r) < f(a)))) ? r : a, null);
    const T = list('temp'), Rn = list('rainDay'), Gu = list('gust'), P = list('pressure');
    const hot = best(T, r => r.max, 1), cold = best(T, r => r.min, -1), wet = best(Rn, r => r.change, 1), gust = best(Gu, r => r.max, 1), plo = best(P, r => r.min, -1), warmD = best(T, r => r.mean, 1);
    const ym = ms.filter(m => m.t.getFullYear() === y), wetM = best(ym, m => m.rain, 1);
    const su = T.filter(r => r.max >= 25).length, hd = T.filter(r => r.max >= 30).length, fr = T.filter(r => r.min < 0).length, ice = T.filter(r => r.max < 0).length;
    const card = (c1, c2, i, l, v, u, d) => `<div class="rec" style="background:linear-gradient(135deg,${c1},${c2})"><span class="l">${icon(i, 14)}${l}</span><span class="v">${v}<small>${u}</small></span><span class="d">${d}</span>${icon(i, 84).replace('<ha-icon', '<ha-icon class="bgi"')}</div>`;
    this.$('rech').textContent = `Rekorde ${y}`;
    this.$('recs').innerHTML = [
      hot && card('#e08a1c', '#d8432f', 'mdi:thermometer-high', 'Höchstwert', fmt(hot.max), '°C', `am ${ddmm(ts(hot))}`),
      cold && card('#2a1f78', '#3f7ad6', 'mdi:snowflake-thermometer', 'Tiefstwert', fmt(cold.min), '°C', `am ${ddmm(ts(cold))}`),
      wet && card('#1d4e89', '#2a8fa8', 'mdi:weather-pouring', 'Nassester Tag', fmt(wet.change), 'mm', `am ${ddmm(ts(wet))}`),
      wetM && card('#204a7a', '#3b7fd0', 'mdi:calendar-month', 'Nassester Monat', fmt(wetM.rain), 'mm', `${MONL[wetM.t.getMonth()]}`),
      gust && card('#3f2fa6', '#8a67de', 'mdi:weather-windy-variant', 'Stärkste Böe', fmt(gust.max), 'km/h', `am ${ddmm(ts(gust))} · Bft ${bft(gust.max)[0]}`),
      plo && card('#334152', '#5d6d82', 'mdi:gauge-low', 'Tiefster Luftdruck', fmt(plo.min), 'hPa', `am ${ddmm(ts(plo))}`),
      card('#d0761f', '#e0a43a', 'mdi:sunglasses', 'Sommertage', su, '', `davon ${hd} heiße Tage ≥ 30 °C`),
      card('#3a3f9e', '#5d8fd8', 'mdi:snowflake', 'Frosttage', fr, '', `davon ${ice} Eistage (Max < 0 °C)`),
    ].filter(Boolean).join('');
  }
}
if (!customElements.get('wetterstation-garten-card')) customElements.define('wetterstation-garten-card', WetterstationGartenCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'wetterstation-garten-card', name: 'Wetterstation Garten', description: 'Live-Wetter, Jahresband, Monatsbilanz und Rekorde der Gartenwetterstation' });
