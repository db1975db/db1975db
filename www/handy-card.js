// Handy-Karte – kompakte Startseite fürs iPhone im Stil der Haus- und Raum-Karte (v0.6)
// Bereiche: Begrüßung, Personen, Wetter, Haustür, Energie, Müllkalender. Alle Bereiche sind optional.
// Müll: je Tonne optional `image` (z. B. /local/muell/blau.png), sonst wird die Tonne gezeichnet.
const P_fmt = (v, d = 1) => (v == null || isNaN(v)) ? '–' : Number(v).toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
const P_icon = (i, s = 18) => `<ha-icon icon="${i}" style="--mdc-icon-size:${s}px;width:${s}px;height:${s}px"></ha-icon>`;
const P_esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const P_FI = {"solar-power-variant":"M3.33 16H11V13H4L3.33 16M13 16H20.67L20 13H13V16M21.11 18H13V22H22L21.11 18M2 22H11V18H2.89L2 22M11 8H13V11H11V8M15.76 7.21L17.18 5.79L19.3 7.91L17.89 9.33L15.76 7.21M4.71 7.91L6.83 5.79L8.24 7.21L6.12 9.33L4.71 7.91M3 2H6V4H3V2M18 2H21V4H18V2M12 7C14.76 7 17 4.76 17 2H7C7 4.76 9.24 7 12 7Z","transmission-tower":"M8.28,5.45L6.5,4.55L7.76,2H16.23L17.5,4.55L15.72,5.44L15,4H9L8.28,5.45M18.62,8H14.09L13.3,5H10.7L9.91,8H5.38L4.1,10.55L5.89,11.44L6.62,10H17.38L18.1,11.45L19.89,10.56L18.62,8M17.77,22H15.7L15.46,21.1L12,15.9L8.53,21.1L8.3,22H6.23L9.12,11H11.19L10.83,12.35L12,14.1L13.16,12.35L12.81,11H14.88L17.77,22M11.4,15L10.5,13.65L9.32,18.13L11.4,15M14.68,18.12L13.5,13.64L12.6,15L14.68,18.12Z","home":"M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z","home-battery":"M12 20L5 20V12H2L12 3L14.78 5.5H14V7.17C12.84 7.58 12 8.7 12 10V20M15 9H16V7.5H20V9H21C21.55 9 22 9.45 22 10V21C22 21.55 21.55 22 21 22H15C14.45 22 14 21.55 14 21V10C14 9.45 14.45 9 15 9M16 11V14H20V11H16Z"};
const P_WX = {
  'clear-night': ['Klar', 'mdi:weather-night', ['#1b2550', '#33407a']], sunny: ['Sonnig', 'mdi:weather-sunny', ['#2f6fd0', '#5aa2f0']],
  partlycloudy: ['Teils bewölkt', 'mdi:weather-partly-cloudy', ['#3a5f9a', '#6b8fc4']], cloudy: ['Bewölkt', 'mdi:weather-cloudy', ['#3d4a5e', '#66758c']],
  fog: ['Nebel', 'mdi:weather-fog', ['#4a5160', '#7b8291']], rainy: ['Regen', 'mdi:weather-rainy', ['#2d4258', '#4f6a85']],
  pouring: ['Starkregen', 'mdi:weather-pouring', ['#24364a', '#425d78']], snowy: ['Schnee', 'mdi:weather-snowy', ['#566a85', '#8fa4bf']],
  'snowy-rainy': ['Schneeregen', 'mdi:weather-snowy-rainy', ['#4a5d75', '#7d91aa']], hail: ['Hagel', 'mdi:weather-hail', ['#3d4d63', '#6c7d93']],
  lightning: ['Gewitter', 'mdi:weather-lightning', ['#2a2d45', '#55597a']], 'lightning-rainy': ['Gewitter', 'mdi:weather-lightning-rainy', ['#2a2d45', '#55597a']],
  windy: ['Windig', 'mdi:weather-windy', ['#3a5570', '#62809e']], 'windy-variant': ['Windig', 'mdi:weather-windy-variant', ['#3a5570', '#62809e']], exceptional: ['Unwetter', 'mdi:alert', ['#5a2a2a', '#8a4040']],
};
const P_CSS = `
:host{display:block;--p-bg:#0e1118;--p-card:#181c26;--p-line:rgba(255,255,255,.08);--p-fg:#f2f4f8;--p-fg2:#9aa3b2;--p-ok:#1baf7a;--p-warn:#ef8a3c;--p-bad:#e34948;color:var(--p-fg);font-family:inherit}
*{box-sizing:border-box}
.wrap{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px 12px calc(14px + env(safe-area-inset-bottom))}
.full{grid-column:1/-1}
.t{background:var(--p-card);border:1px solid var(--p-line);border-radius:18px;padding:12px;min-width:0;position:relative;overflow:hidden}
.lnk{cursor:pointer}
.h{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:650;letter-spacing:.02em;color:var(--p-fg2);text-transform:uppercase;margin-bottom:8px}
.hello{padding:4px 2px 2px}.hello .g{font-size:22px;font-weight:750;line-height:1.15}.hello .d{font-size:13px;color:var(--p-fg2);margin-top:2px}
.ppl{display:flex;gap:8px}
.pp{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;padding:12px 4px 10px;border-radius:14px;background:rgba(255,255,255,.04);cursor:pointer}
.av{width:58px;height:58px;border-radius:50%;flex:none;background:#2b3242 center/cover;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:20px;position:relative;box-shadow:0 0 0 3px #5b6375,0 0 0 5px var(--p-card)}.pp.home .av{box-shadow:0 0 0 3px var(--p-ok),0 0 0 5px var(--p-card),0 0 16px rgba(27,175,122,.45)}
.av img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block}
.av i{position:absolute;right:-3px;bottom:-3px;width:20px;height:20px;border-radius:50%;border:2px solid var(--p-card);background:#5b6375;display:flex;align-items:center;justify-content:center;color:#fff}
.pp.home .av i{background:var(--p-ok)}
.pp .n{font-size:13px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pp .s{font-size:11.5px;color:var(--p-fg2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wx{color:#fff;border:none;padding:0}
.wx .sc{position:absolute;inset:0;width:100%;height:150px;pointer-events:none}
.wx .top{position:relative;display:grid;grid-template-columns:1fr auto;gap:8px;padding:14px 14px 8px;min-height:120px}
.wx .lc{font-size:12px;opacity:.85;display:flex;align-items:center;gap:4px}
.wx .tp2{font-size:52px;font-weight:200;line-height:1;margin-top:4px;letter-spacing:-1px}.wx .tp2 small{font-size:20px;font-weight:300;vertical-align:top;margin-left:2px}
.wx .cd2{font-size:14px;font-weight:650;margin-top:2px}
.wx .rt{text-align:right;font-size:12.5px;line-height:1.7;align-self:end;text-shadow:0 1px 4px rgba(0,0,0,.35)}
.wx .rt span{display:inline-flex;align-items:center;gap:3px}
.wx .warn{position:relative;margin:0 10px 8px;border-radius:12px;padding:8px 10px;display:flex;gap:8px;align-items:flex-start;font-size:12.5px;line-height:1.35;color:#1d1a10;cursor:pointer}
.wx .warn b{display:block;font-size:13px}
.wx .hr{position:relative;display:flex;gap:4px;overflow-x:auto;padding:4px 10px 8px;scrollbar-width:none}.wx .hr::-webkit-scrollbar{display:none}
.wx .hc{flex:0 0 46px;text-align:center;padding:6px 0;border-radius:12px;background:rgba(0,0,0,.16);font-size:12px}
.wx .hc .tt{opacity:.8;font-size:11px}.wx .hc .tv{font-weight:650;margin-top:2px}.wx .hc .pp2{font-size:10px;color:#9fd3ff;min-height:12px}
.wx .hc.now{background:rgba(255,255,255,.22)}
.wx .ch{position:relative;display:flex;flex-wrap:wrap;gap:6px;padding:2px 10px 12px}
.wx .cp{display:inline-flex;align-items:center;gap:4px;font-size:12px;padding:5px 9px;border-radius:20px;background:rgba(0,0,0,.18)}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes drift{from{transform:translateX(-60px)}to{transform:translateX(460px)}}
@keyframes fall{from{transform:translateY(-20px)}to{transform:translateY(160px)}}
@keyframes tw{0%,100%{opacity:.2}50%{opacity:1}}
@keyframes flash{0%,92%,100%{opacity:0}94%,96%{opacity:.7}}
@keyframes fogm{0%,100%{transform:translateX(-20px)}50%{transform:translateX(20px)}}
@keyframes glow{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes dash{to{stroke-dashoffset:-24}}
@keyframes dashr{to{stroke-dashoffset:24}}
.dr{display:flex;align-items:center;gap:10px}.dr .row{display:flex;align-items:center;gap:10px;flex:1;min-width:0;cursor:pointer}
.dr .lk{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none}
.dr .st{font-size:15px;font-weight:700;line-height:1.2}.dr .sub{font-size:12px;color:var(--p-fg2);margin-top:2px}
.dr .bt{display:flex;gap:6px;flex:none}.dr .btn{padding:10px 14px}
.btn{flex:1;border:none;border-radius:12px;padding:9px 6px;font:inherit;font-size:13px;font-weight:650;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;background:rgba(255,255,255,.08);color:var(--p-fg)}
.btn.pri{background:#2f6fd0;color:#fff}.btn.sm{flex:0 0 auto;padding:9px 10px}
.en{padding:0;border:none}
.en svg{width:100%;height:auto;display:block}
.en .eh{position:absolute;top:10px;left:12px;right:12px;display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:650;letter-spacing:.02em;text-transform:uppercase;color:rgba(255,255,255,.85);text-shadow:0 1px 3px rgba(0,0,0,.4);pointer-events:none}
.en .eh span{display:flex;align-items:center;gap:5px}
.en text{font-weight:700;font-size:13px;fill:#fff}.en text.lb{font-weight:500;font-size:10px;fill:rgba(255,255,255,.8)}
.en .lbl{cursor:pointer}
.en .st3{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:8px 10px 10px;background:#151922}
.en .sb{border-radius:12px;padding:7px 8px;background:rgba(255,255,255,.05);min-width:0}
.en .sb .k{font-size:11px;color:var(--p-fg2);display:flex;align-items:center;gap:4px;white-space:nowrap}.en .sb .v{font-size:15px;font-weight:700;margin-top:2px;white-space:nowrap}
.en .ring{width:100%;height:4px;border-radius:2px;background:rgba(255,255,255,.08);margin-top:5px;overflow:hidden}.en .ring i{display:block;height:100%;border-radius:2px}
.ws{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding-top:6px}
.wi{display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px;padding:8px 2px 8px;border-radius:14px;background:rgba(255,255,255,.04);min-width:0;cursor:pointer;position:relative}
.wi svg{width:46px;height:58px;display:block;margin-bottom:4px}
.wi .bi{width:52px;height:58px;object-fit:contain;display:block;margin-bottom:4px}
.wi.soon svg,.wi.soon .bi{animation:wob 2.4s ease-in-out infinite;transform-origin:50% 100%}
@keyframes wob{0%,80%,100%{transform:rotate(0)}85%{transform:rotate(-6deg)}90%{transform:rotate(5deg)}95%{transform:rotate(-3deg)}}
.wi .bd{position:absolute;top:-8px;left:50%;transform:translateX(-50%);white-space:nowrap;background:var(--p-warn);color:#fff;font-size:10px;font-weight:700;border-radius:8px;padding:1px 6px}
.wi .ic{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex:none}
.wi .n{font-size:12.5px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.wi .s{font-size:12px;color:var(--p-fg2)}.wi .s2{font-size:11px;color:var(--p-fg2);opacity:.75}
.wi.soon{background:rgba(239,138,60,.16);box-shadow:inset 0 0 0 1px rgba(239,138,60,.5)}.wi.soon .s{color:#ffb27a;font-weight:650}.wi.soon .s2{color:#ffb27a}
`;
class HandyCard extends HTMLElement {
  setConfig(c) { this.c = { persons: [], waste: [], waste_days: 1, ...c }; this._k = null; if (this.root) this.build(); }
  set hass(h) {
    this._hass = h; if (!this.root) { this.root = this.attachShadow({ mode: 'open' }); this.build(); }
    if (this.c.weather && !this._unsub) this.subFc();
    const k = this.keys(); if (k === this._k) return; this._k = k; this.render();
  }
  getCardSize() { return 8; }
  s(e) { return e && this._hass ? this._hass.states[e] : null; }
  n(e) { const s = this.s(e); const v = s ? parseFloat(s.state) : NaN; return isNaN(v) ? null : v; }
  keys() {
    const c = this.c, W = c.weather || {}, D = c.door || {}, E = c.energy || {};
    const ents = [W.entity, W.temperature, W.max, W.min, W.wind, W.rain_day, W.humidity, W.warning, W.prewarning, W.sun || 'sun.sun', D.lock, D.battery, D.contact, ...Object.values(E), ...c.persons.map(p => p.entity), ...c.waste.map(w => w.entity)];
    return ents.map(e => { const s = this.s(e); return s ? s.state + (s.attributes.entity_picture || '') : '-'; }).join('|') + new Date().toDateString();
  }
  build() {
    this.root.innerHTML = `<style>${P_CSS}</style><div class="wrap" id="w"></div>`;
    this.root.addEventListener('click', (ev) => this.onClick(ev));
  }
  nav(p) { if (!p) return; const path = p.startsWith('/') ? p : `${this.c.base_path || ''}/${p}`; history.pushState(null, '', path); window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } })); }
  call(d, s, data) { this._hass.callService(d, s, data); }
  onClick(ev) {
    const t = ev.target.closest('[data-act]'); if (!t) return;
    const a = t.dataset.act, e = t.dataset.e;
    if (a === 'nav') this.nav(t.dataset.p);
    else if (a === 'lock') { const sv = t.dataset.sv; if (sv !== 'lock' && !window.confirm(sv === 'open' ? 'Haustür wirklich öffnen?' : 'Haustür wirklich aufschließen?')) return; this.call('lock', sv, { entity_id: e }); }
    else if (a === 'more') this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: e } }));
  }
  render() {
    const c = this.c, out = [];
    out.push(this.hello());
    if (c.persons.length) out.push(this.persons());
    if (c.weather) out.push(this.weather());
    if (c.energy) out.push(this.energy());
    if (c.door) out.push(this.door());
    if (c.waste.length) out.push(this.waste());
    // Nur geänderte Bereiche ersetzen, damit laufende Animationen nicht neu starten
    const w = this.root.getElementById('w');
    while (w.children.length > out.length) w.lastChild.remove();
    out.forEach((html, i) => {
      let el = w.children[i];
      if (!el) { el = document.createElement('div'); el.style.display = 'contents'; w.appendChild(el); }
      if (el._h !== html) { el._h = html; el.innerHTML = html; }
    });
  }
  hello() {
    const h = new Date().getHours(), g = h < 5 ? 'Gute Nacht' : h < 11 ? 'Guten Morgen' : h < 17 ? 'Guten Tag' : h < 22 ? 'Guten Abend' : 'Gute Nacht';
    const u = this._hass.user && this._hass.user.name ? `, ${this._hass.user.name.split(' ')[0]}` : '';
    const d = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
    return `<div class="full hello"><div class="g">${g}${P_esc(u)}</div><div class="d">${d}</div></div>`;
  }
  persons() {
    const pic = (s) => { const p = s && s.attributes.entity_picture; return p ? (this._hass.hassUrl ? this._hass.hassUrl(p) : p) : null; };
    return `<div class="t full"><div class="ppl">${this.c.persons.map(p => {
      const s = this.s(p.entity), home = s && s.state === 'home', u = pic(s), name = p.name || (s && s.attributes.friendly_name) || '';
      const where = !s ? '–' : home ? 'zu Hause' : s.state === 'not_home' ? 'unterwegs' : s.state;
      return `<div class="pp ${home ? 'home' : ''}" data-act="more" data-e="${p.entity}"><div class="av">${u ? `<img src="${P_esc(u)}" alt="">` : P_esc(name[0] || '?')}<i>${P_icon(home ? 'mdi:home' : 'mdi:walk', 12)}</i></div><div style="min-width:0;max-width:100%"><div class="n">${P_esc(name)}</div><div class="s">${P_esc(where)}</div></div></div>`;
    }).join('')}</div></div>`;
  }
  // Vorhersage (z. B. DWD) stündlich abonnieren
  connectedCallback() { if (this._hass && this.c && this.c.weather) this.subFc(); }
  disconnectedCallback() { if (this._unsub) { this._unsub.then(u => u && u()).catch(() => {}); this._unsub = null; } }
  subFc() {
    const W = this.c.weather || {}, e = W.forecast || W.entity; if (this._unsub || !e || !this._hass || !this._hass.connection) return;
    this._unsub = this._hass.connection.subscribeMessage((m) => { this._fc = (m && m.forecast) || []; this._k = null; this.render(); }, { type: 'weather/subscribe_forecast', forecast_type: 'hourly', entity_id: e }).catch(() => null);
  }
  scene(key, day) {
    // Animierte Wetter-Szene hinter dem Wetter-Bereich
    const cloud = (x, y, k, o, d, dl) => `<g style="animation:drift ${d}s linear ${dl}s infinite" opacity="${o}"><g transform="translate(${x} ${y}) scale(${k})"><ellipse cx="0" cy="10" rx="34" ry="14" fill="#fff"/><ellipse cx="-14" cy="2" rx="18" ry="15" fill="#fff"/><ellipse cx="10" cy="-4" rx="22" ry="20" fill="#fff"/></g></g>`;
    const sun = (x, y) => `<g transform="translate(${x} ${y})"><circle r="44" fill="#ffd65a" opacity=".18" style="animation:glow 4s ease-in-out infinite"/><g style="animation:spin 30s linear infinite">${[...Array(12)].map((_, i) => `<rect x="-2" y="-40" width="4" height="12" rx="2" fill="#ffe28a" opacity=".85" transform="rotate(${i * 30})"/>`).join('')}</g><circle r="22" fill="#ffd34d"/></g>`;
    const moon = (x, y) => `<g transform="translate(${x} ${y})"><circle r="30" fill="#fff" opacity=".08"/><path d="M8,-18 A20,20 0 1 0 8,18 A15,15 0 1 1 8,-18Z" fill="#f2ecd2"/></g>`;
    const stars = [...Array(18)].map((_, i) => `<circle cx="${(i * 73) % 400}" cy="${(i * 37) % 110 + 6}" r="${i % 3 ? 1 : 1.6}" fill="#fff" style="animation:tw ${2 + i % 4}s ease-in-out ${i * .3}s infinite"/>`).join('');
    const drops = (n, snow) => [...Array(n)].map((_, i) => { const x = (i * 47) % 400, d = snow ? 5 + i % 4 : .7 + (i % 5) * .12, dl = -(i * .37) % d; return snow ? `<circle cx="${x}" cy="0" r="${1.5 + i % 2}" fill="#fff" opacity=".85" style="animation:fall ${d}s linear ${dl}s infinite"/>` : `<line x1="${x}" y1="0" x2="${x - 3}" y2="10" stroke="#bfe3ff" stroke-width="1.5" stroke-linecap="round" opacity=".8" style="animation:fall ${d}s linear ${dl}s infinite"/>`; }).join('');
    const clouds = (n, o) => [[30, 30, 1, 46], [220, 18, .8, 60], [120, 60, 1.2, 52], [330, 50, .9, 70]].slice(0, n).map(([x, y, k, d], i) => cloud(x, y, k, o, d, -i * 13)).join('');
    let g = '';
    if (key === 'sunny') g = sun(340, 42);
    else if (key === 'clear-night') g = stars + moon(340, 40);
    else if (key === 'partlycloudy') g = (day ? sun(330, 44) : stars + moon(330, 40)) + clouds(2, .85);
    else if (key === 'cloudy') g = clouds(4, .35);
    else if (key === 'fog') g = [20, 50, 80, 110].map((y, i) => `<rect x="-40" y="${y}" width="480" height="14" rx="7" fill="#fff" opacity=".14" style="animation:fogm ${8 + i * 2}s ease-in-out infinite"/>`).join('');
    else if (['rainy', 'pouring', 'lightning-rainy'].includes(key)) g = clouds(3, .45) + drops(key === 'pouring' ? 40 : 24) + (key === 'lightning-rainy' ? '<rect width="400" height="150" fill="#fff" style="animation:flash 6s linear infinite"/>' : '');
    else if (['snowy', 'snowy-rainy', 'hail'].includes(key)) g = clouds(3, .5) + drops(26, true);
    else if (key === 'lightning') g = clouds(3, .4) + '<rect width="400" height="150" fill="#fff" style="animation:flash 5s linear infinite"/>';
    else if (key.startsWith('windy')) g = clouds(4, .4);
    return `<svg class="sc" viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice">${g}</svg>`;
  }
  weather() {
    const W = this.c.weather, w = this.s(W.entity), A = w ? w.attributes : {}, sun = this.s(W.sun || 'sun.sun'), day = sun ? sun.state === 'above_horizon' : (new Date().getHours() > 7 && new Date().getHours() < 17);
    let key = w ? w.state : 'cloudy'; if (key === 'sunny' && !day) key = 'clear-night';
    const [txt, , bg0] = P_WX[key] || ['–', '', ['#3d4a5e', '#66758c']], bg = day ? bg0 : ['#0f1630', '#26305a'];
    const t = this.n(W.temperature) ?? A.temperature, mx = this.n(W.max), mn = this.n(W.min), wi = this.n(W.wind) ?? A.wind_speed, rn = this.n(W.rain_day), hu = this.n(W.humidity) ?? A.humidity;
    const dirs = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'], dir = A.wind_bearing != null ? dirs[Math.round(A.wind_bearing / 45) % 8] : '';
    const tm = (iso) => iso ? new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '–';
    // DWD-Warnung
    const ws = this.s(W.warning), wa = ws ? ws.attributes : {}, wc = +(wa.warning_count || 0), pre = this.s(W.prewarning), pc = pre ? +(pre.attributes.warning_count || 0) : 0;
    let warn = '';
    if (wc || pc) {
      const src = wc ? wa : pre.attributes, n = wc || pc, col = src.warning_1_color || '#ffeb3b', when = `${tm(src.warning_1_start)}–${tm(src.warning_1_end)}`;
      warn = `<div class="warn" style="background:${col}" data-act="more" data-e="${wc ? W.warning : W.prewarning}">${P_icon('mdi:alert', 18)}<div><b>${P_esc(src.warning_1_headline || 'Wetterwarnung')}${n > 1 ? ` (+${n - 1})` : ''}</b>${wc ? '' : 'Vorabinformation · '}${when} · ${P_esc(src.warning_1_description || '')}</div></div>`;
    }
    // Stündliche Vorhersage
    const fc = (this._fc || []).filter(f => new Date(f.datetime) > Date.now() - 36e5).slice(0, 12);
    const hrs = fc.length ? `<div class="hr">${fc.map((f, i) => { const h = new Date(f.datetime).getHours(), dn = h >= 7 && h < 17, k = f.condition === 'sunny' && !dn ? 'clear-night' : f.condition, ic = (P_WX[k] || [, 'mdi:weather-cloudy'])[1];
      return `<div class="hc ${i === 0 ? 'now' : ''}"><div class="tt">${i === 0 ? 'Jetzt' : h + ' Uhr'}</div>${P_icon(ic, 20)}<div class="tv">${P_fmt(f.temperature, 0)}°</div><div class="pp2">${f.precipitation_probability ? f.precipitation_probability + ' %' : f.precipitation ? P_fmt(f.precipitation) + ' mm' : ''}</div></div>`; }).join('')}</div>` : '';
    const chips = [
      wi != null ? `${P_icon('mdi:weather-windy', 14)}${P_fmt(wi, 0)} km/h ${dir}${A.wind_gust_speed ? ` · Böen ${P_fmt(A.wind_gust_speed, 0)}` : ''}` : '',
      A.pressure ? `${P_icon('mdi:gauge', 14)}${P_fmt(A.pressure, 0)} hPa` : '',
      hu != null ? `${P_icon('mdi:water-percent', 14)}${P_fmt(hu, 0)} %` : '',
      rn != null ? `${P_icon('mdi:weather-rainy', 14)}${P_fmt(rn)} mm heute` : '',
      sun ? `${P_icon('mdi:weather-sunset-up', 14)}${tm(sun.attributes.next_rising)} ${P_icon('mdi:weather-sunset-down', 14)}${tm(sun.attributes.next_setting)}` : '',
    ].filter(Boolean).map(x => `<span class="cp">${x}</span>`).join('');
    return `<div class="t full wx" style="background:linear-gradient(160deg,${bg[0]},${bg[1]})">${this.scene(key, day)}
      <div class="top ${W.path ? 'lnk' : ''}" ${W.path ? `data-act="nav" data-p="${P_esc(W.path)}"` : ''}>
        <div><div class="lc">${P_icon('mdi:map-marker', 13)}${P_esc(W.name || 'Zuhause')}</div><div class="tp2">${P_fmt(t)}<small>°C</small></div><div class="cd2">${P_esc(txt)}</div></div>
        <div class="rt"><span>${P_icon('mdi:arrow-up', 13)}${P_fmt(mx)}°  ${P_icon('mdi:arrow-down', 13)}${P_fmt(mn)}°</span>${A.cloud_coverage != null ? `<br><span>${P_icon('mdi:cloud-outline', 13)}${P_fmt(A.cloud_coverage, 0)} %</span>` : ''}${A.visibility != null ? `<br><span>${P_icon('mdi:eye-outline', 13)}${P_fmt(A.visibility, 0)} km</span>` : ''}</div></div>
      ${warn}${hrs}<div class="ch">${chips}</div></div>`;
  }
  door() {
    const D = this.c.door, l = this.s(D.lock), st = l ? l.state : 'unavailable', b = this.n(D.battery), ct = this.s(D.contact), open = ct && ct.state === 'on';
    const M = { locked: ['verriegelt', 'mdi:lock', '#1baf7a'], unlocked: ['entriegelt', 'mdi:lock-open-variant', '#ef8a3c'], open: ['offen', 'mdi:door-open', '#ef8a3c'], jammed: ['klemmt!', 'mdi:lock-alert', '#e34948'], locking: ['verriegelt …', 'mdi:lock-clock', '#3987e5'], unlocking: ['entriegelt …', 'mdi:lock-clock', '#3987e5'], opening: ['öffnet …', 'mdi:door-open', '#ef8a3c'] };
    const [txt, ic, col] = M[st] || ['nicht erreichbar', 'mdi:lock-off-outline', '#8a94a3'], canOpen = l && (l.attributes.supported_features || 0) & 1;
    const sub = [ct ? (open ? 'Tür offen' : 'Tür zu') : '', b != null ? `${P_fmt(b, 0)} % Akku` : ''].filter(Boolean).join(' · ');
    return `<div class="t full dr">
      <div class="row" data-act="more" data-e="${D.lock}"><div class="lk" style="background:${col}26;color:${col}">${P_icon(ic, 24)}</div><div style="min-width:0"><div class="sub" style="margin:0 0 1px">${P_esc(D.name || 'Haustür')}</div><div class="st" style="color:${col}">${txt}</div><div class="sub">${P_esc(sub)}</div></div></div>
      <div class="bt">${st === 'locked' ? `<button class="btn" data-act="lock" data-sv="unlock" data-e="${D.lock}">${P_icon('mdi:lock-open-variant', 15)}Aufschließen</button>` : `<button class="btn pri" data-act="lock" data-sv="lock" data-e="${D.lock}">${P_icon('mdi:lock', 15)}Abschließen</button>`}${canOpen ? `<button class="btn sm" data-act="lock" data-sv="open" data-e="${D.lock}" aria-label="Öffnen">${P_icon('mdi:door-open', 16)}</button>` : ''}</div></div>`;
  }
  energy() {
    // Energie als lebendige Szene: Sonne/Mond, Haus mit Solardach, Hausakku und Strommast; Ströme laufen sichtbar
    const E = this.c.energy, pv = Math.max(0, this.n(E.pv) || 0), home = Math.max(0, this.n(E.home) || 0), imp = Math.max(0, this.n(E.grid_import) || 0), exp = Math.max(0, this.n(E.grid_export) || 0);
    const soc = this.n(E.battery_soc), bp = this.n(E.battery_power) || 0, chg = Math.max(0, -bp), dis = Math.max(0, bp), day = this.n(E.pv_today);
    const sun = this.s(E.sun || 'sun.sun'), isDay = sun ? sun.state === 'above_horizon' : pv > 15;
    const kw = (w) => w >= 1000 ? `${P_fmt(w / 1000, 1)} kW` : `${P_fmt(w, 0)} W`, sp = (w) => Math.max(.5, Math.min(3, 3 - Math.log10(Math.max(w, 1)) * .8)).toFixed(2);
    const self = home > 0 ? Math.min(100, Math.round(Math.max(0, home - imp) / home * 100)) : 0;
    const pr = this.n(E.price), lvl = (this.s(E.price_level) || {}).state, prc = { very_cheap: '#1baf7a', cheap: '#5cc98f', normal: '#e2b400', expensive: '#ef8a3c', very_expensive: '#e34948' }[lvl] || '#e2b400';
    const sky = isDay ? ['#3a74c4', '#8ec0ee'] : ['#0b1230', '#23305e'], grass = isDay ? '#3f7d45' : '#1c3324';
    const pvOn = pv > 15, flowW = (w) => Math.min(5, 1.6 + w / 1200);
    const lbl = (x, y, v, l, col, ent, anc = 'middle') => { const wd = Math.max(v.length, l.length) * 6.6 + 14, x0 = anc === 'start' ? x : anc === 'end' ? x - wd : x - wd / 2;
      return `<g class="lbl" data-act="more" data-e="${ent}"><rect x="${x0}" y="${y - 13}" width="${wd}" height="30" rx="9" fill="rgba(10,14,24,.55)" stroke="${col}" stroke-opacity=".7"/><text x="${x0 + wd / 2}" y="${y + 1}" text-anchor="middle">${v}</text><text class="lb" x="${x0 + wd / 2}" y="${y + 12}" text-anchor="middle">${l}</text></g>`; };
    // Eigene Stadtvilla von vorne (nach Foto): Walmdach mit Schornstein, Fassade grau/rot, Haustür mit 2 Lampen; Varta-Speicher hinter dem HWR-Fenster rechts unten
    const red = isDay ? '#c8553f' : '#6e3428', grey = isDay ? '#a9afbd' : '#565a68', greyL = isDay ? '#b9bfcc' : '#61667a', frame = isDay ? '#8e95a3' : '#474b57', roofC = isDay ? '#5b5f69' : '#2c2e35';
    const lit = home > 150 ? '#ffd88a' : (isDay ? '#9fb4cf' : '#2c3240'), soc0 = Math.max(0, Math.min(100, soc || 0)), batCol = soc0 < 15 ? '#e34948' : soc0 < 40 ? '#e2b400' : '#3ddc97', batAct = chg > 15 || dis > 15;
    const win = (x1, y1, x2, y2, dbl) => `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" fill="${frame}"/><rect x="${x1 + 1.6}" y="${y1 + 1.6}" width="${x2 - x1 - 3.2}" height="${y2 - y1 - 3.2}" fill="${lit}"/>${dbl ? `<rect x="${(x1 + x2) / 2 - .8}" y="${y1}" width="1.6" height="${y2 - y1}" fill="${frame}"/>` : ''}<rect x="${x1 - 1}" y="${y2}" width="${x2 - x1 + 2}" height="1.8" fill="#d9d6d0"/>`;
    const panels = [0, 1, 2, 3, 4, 5, 6].map(c => `<path d="M${168 + c * 15},44 l14,0 l1.5,8 l-14,0Z" fill="${pvOn ? '#3b6fd6' : '#1d2a48'}" stroke="#9cb8ef" stroke-width=".5" ${pvOn ? `style="animation:glow ${2 + c * .3}s ease-in-out infinite"` : ''}/>`).join('');
    const rays = pvOn ? [0, 1, 2].map(k => `<line x1="330" y1="30" x2="${228 + k * 24}" y2="48" stroke="#ffd65a" stroke-width="${flowW(pv)}" stroke-dasharray="6 6" stroke-linecap="round" opacity=".75" style="animation:dash ${sp(pv)}s linear infinite"/>`).join('') : '';
    const lamp = (x) => `${!isDay ? `<ellipse cx="${x}" cy="148" rx="8" ry="11" fill="#ffd88a" opacity=".3"/>` : ''}<rect x="${x - 1.5}" y="144.5" width="3" height="5" rx="1" fill="${!isDay ? '#fff1c4' : '#e9edf3'}"/>`;
    const wire = 'M18,112 Q40,128 61,140';
    const gridFlow = imp > 15 || exp > 15 ? `<path d="${wire}" fill="none" stroke="${exp > imp ? '#3ddc97' : '#ff7a6b'}" stroke-width="${flowW(Math.max(imp, exp))}" stroke-dasharray="5 7" stroke-linecap="round" style="animation:${exp > imp ? 'dashr' : 'dash'} ${sp(Math.max(imp, exp))}s linear infinite"/>` : '';
    const sunG = isDay ? `<g transform="translate(340 24)"><circle r="${18 + Math.min(10, pv / 300)}" fill="#ffd65a" opacity="${pvOn ? .25 : .1}" style="animation:glow 3s ease-in-out infinite"/><g style="animation:spin ${pvOn ? Math.max(6, 40 - pv / 150) : 80}s linear infinite">${[...Array(10)].map((_, i) => `<rect x="-2" y="-${20 + Math.min(5, pv / 600)}" width="4" height="7" rx="2" fill="#ffe28a" transform="rotate(${i * 36})"/>`).join('')}</g><circle r="12" fill="${pvOn ? '#ffd34d' : '#e8d9a0'}"/></g>`
      : `<g transform="translate(340 24)"><path d="M5,-12 A13,13 0 1 0 5,12 A9,9 0 1 1 5,-12Z" fill="#f2ecd2"/></g>${[...Array(12)].map((_, i) => `<circle cx="${(i * 61) % 360}" cy="${(i * 23) % 50 + 6}" r="1.2" fill="#fff" style="animation:tw ${2 + i % 3}s ease-in-out ${i * .4}s infinite"/>`).join('')}`;
    // Varta Element backup im HWR (durchs Fenster gesehen): Schrank mit grünem Streifen und Ladestand
    const varta = `<rect x="232.8" y="160.4" width="20" height="30.6" fill="${isDay ? '#3b4250' : '#1c2029'}"/>
      ${batAct ? `<rect x="232.8" y="160.4" width="20" height="30.6" fill="${batCol}" opacity=".18" style="animation:glow 1.6s ease-in-out infinite"/>` : ''}
      <rect x="236.5" y="165" width="12.5" height="26" fill="#eef0f2"/><rect x="236" y="164" width="13.5" height="2" fill="#fafafa"/><rect x="236.5" y="166" width="12.5" height="1.2" fill="#2a2d33"/>
      <path d="M237.5,169 l5,0 l-1,1.6 l-4,0Z M237.5,171 l4.4,0 l-1,1.6 l-3.4,0Z" fill="#3fae49"/>
      <rect x="245.8" y="169" width="2.2" height="20" rx="1" fill="#c9ccd2"/><rect x="245.8" y="${169 + 20 - 20 * soc0 / 100}" width="2.2" height="${20 * soc0 / 100}" rx="1" fill="${batCol}"/>`;
    const scene = `<svg viewBox="0 0 360 236"><defs><linearGradient id="esk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
      <rect width="360" height="236" fill="url(#esk)"/>${sunG}
      <path d="M0,206 Q120,200 200,205 T360,202 L360,236 L0,236Z" fill="${grass}"/>
      <g stroke="#3a3530" stroke-width="3" stroke-linecap="round"><line x1="14" y1="106" x2="14" y2="214"/><line x1="4" y1="114" x2="24" y2="114"/><line x1="6" y1="124" x2="22" y2="124"/></g>
      <path d="${wire}" fill="none" stroke="#2a2622" stroke-width="1.5"/>${gridFlow}
      <rect x="187" y="30" width="9" height="14" fill="${isDay ? '#6f737d' : '#3a3c44'}"/><rect x="273" y="34" width="4" height="10" fill="#2e3036"/>
      <path d="M40,76 L70,42 L290,42 L319,76Z" fill="${roofC}"/>${panels}
      <rect x="38" y="74" width="283" height="4" rx="1" fill="${isDay ? '#7b7f88' : '#3a3c44'}"/>
      <rect x="60" y="78" width="240" height="129" fill="${greyL}"/><rect x="65.3" y="78" width="38.3" height="129" fill="${red}"/><rect x="207.4" y="78" width="81.3" height="129" fill="${red}"/>
      <rect x="103.6" y="77" width="103.8" height="130" fill="${grey}"/>
      ${win(113.4, 91.1, 129.4, 115.2)}${win(142.4, 90.2, 167.3, 120.5)}${win(180.2, 89, 197.1, 114.3)}${win(215.8, 88.5, 253.1, 120.5, true)}
      ${win(112.5, 159.7, 129.1, 183.3)}${win(180.2, 159.7, 197.1, 183.3)}
      <rect x="231.2" y="158.8" width="23.2" height="33.8" fill="${frame}"/>${varta}<rect x="231.2" y="192.6" width="25" height="1.8" fill="#d9d6d0"/>
      <rect x="141.9" y="159.7" width="24.9" height="47.3" fill="${frame}"/><rect x="143.6" y="161.4" width="21.5" height="45.6" fill="${isDay ? '#b3b9c5' : '#4c5160'}"/>
      ${[0, 1, 2, 3].map(k => `<rect x="151.5" y="${166 + k * 9.5}" width="6" height="6" fill="${home > 150 && !isDay ? '#ffd88a' : '#3a3f4a'}"/>`).join('')}<rect x="146.2" y="171" width="1.2" height="26" fill="#d0d4db"/>
      ${lamp(133.9)}${lamp(173.6)}
      <text x="279" y="157" text-anchor="middle" style="font-size:7px;font-weight:600;fill:${isDay ? '#e9e4dc' : '#a39f99'}">32c</text>
      <rect x="58" y="205" width="244" height="3" fill="#5a3c38"/>
      ${rays}
      ${lbl(268, 20, kw(pv), 'Solar', '#ffd65a', E.pv)}
      ${lbl(8, 217, exp > imp ? kw(exp) : kw(imp), exp > imp ? 'Einspeisung' : 'Netzbezug', exp > imp ? '#3ddc97' : '#ff7a6b', exp > imp ? E.grid_export : E.grid_import, 'start')}
      ${lbl(158, 217, kw(home), 'Haus', '#5aa9ff', E.home)}
      ${lbl(354, 217, soc != null ? `Varta ${P_fmt(soc, 0)} %` : 'Varta', chg > 15 ? 'lädt ' + kw(chg) : dis > 15 ? 'liefert ' + kw(dis) : `${P_fmt(E.battery_capacity || 6.5, 1)} kWh`, batCol, E.battery_soc, 'end')}
    </svg>`;
    return `<div class="t full en"><div style="position:relative">${scene}<div class="eh"><span>${P_icon('mdi:lightning-bolt', 14)}Energie</span></div></div>
      <div class="st3"><div class="sb"><div class="k">${P_icon('mdi:leaf', 13)}Autark</div><div class="v">${self} %</div><div class="ring"><i style="width:${self}%;background:#3ddc97"></i></div></div>
        <div class="sb"><div class="k">${P_icon('mdi:solar-power-variant', 13)}Heute</div><div class="v">${day != null ? P_fmt(day, 1) + ' kWh' : '–'}</div><div class="ring"><i style="width:${Math.min(100, (day || 0) / (E.pv_day_max || 30) * 100)}%;background:#ffc23d"></i></div></div>
        <div class="sb" ${E.price ? `data-act="more" data-e="${E.price}"` : ''}><div class="k">${P_icon('mdi:currency-eur', 13)}Strompreis</div><div class="v" style="color:${prc}">${pr != null ? P_fmt(pr, 1) + ' ct' : '–'}</div><div class="ring"><i style="width:${pr != null ? Math.min(100, pr / 70 * 100) : 0}%;background:${prc}"></i></div></div></div></div>`;
  }
  // Mülltonne als Bild: Korpus und Deckel in der Tonnenfarbe
  bin(col, lid) {
    const dk = (h, f) => '#' + h.replace('#', '').match(/../g).map(x => Math.round(parseInt(x, 16) * f).toString(16).padStart(2, '0')).join('');
    return `<svg viewBox="0 0 46 58"><path d="M8,14 L38,14 L35,50 L11,50 Z" fill="${col}"/><path d="M8,14 L38,14 L37.6,19 L8.4,19 Z" fill="${dk(col, .8)}"/>
      <path d="M21,20 L21,46 M27,20 L27,46" stroke="${dk(col, .75)}" stroke-width="1.6"/><path d="M5,9 Q23,4 41,9 L41,14 L5,14 Z" fill="${lid}"/><rect x="18" y="6" width="10" height="3" rx="1.5" fill="${dk(lid, .7)}"/>
      <circle cx="14" cy="52" r="4.5" fill="#1b1e25" stroke="#3a3f4a" stroke-width="1.5"/><circle cx="32" cy="52" r="4.5" fill="#1b1e25" stroke="#3a3f4a" stroke-width="1.5"/></svg>`;
  }
  waste() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const parse = (v) => { if (!v) return null; const m = String(v).match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/); const d = m ? new Date(+m[3], +m[2] - 1, +m[1]) : new Date(v); return isNaN(d) ? null : d; };
    const COL = { 'mdi:trash-can': ['#454b55', '#2a2e35'], 'mdi:recycle': ['#e9b80c', '#f5cd2e'], 'mdi:leaf': ['#6b4a2b', '#4f8a3c'], 'mdi:package-variant': ['#2c6fc9', '#3f86e0'] };
    const items = this.c.waste.map(w => { const s = this.s(w.entity), d = parse(s && s.state); return { ...w, d, days: d ? Math.round((d - today) / 864e5) : null }; })
      .sort((a, b) => (a.days ?? 999) - (b.days ?? 999));
    return `<div class="t full"><div class="h">${P_icon('mdi:calendar-month', 14)}Müllabfuhr</div><div class="ws">${items.map(w => {
      const when = w.days == null ? 'kein Termin' : w.days === 0 ? 'heute' : w.days === 1 ? 'morgen' : `in ${w.days} Tagen`;
      const dt = w.d ? w.d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' }) : '';
      const [col, lid] = w.color ? [w.color, w.lid || w.color] : COL[w.icon] || COL['mdi:trash-can'], soon = w.days != null && w.days <= this.c.waste_days;
      return `<div class="wi ${soon ? 'soon' : ''}" data-act="more" data-e="${w.entity}">${soon ? `<span class="bd">${w.days === 0 ? 'heute' : 'morgen'}</span>` : ''}${w.image ? `<img class="bi" src="${P_esc(this._hass.hassUrl ? this._hass.hassUrl(w.image) : w.image)}" alt="">` : this.bin(col, lid)}<div class="n">${P_esc(w.name)}</div><div class="s">${when}</div>${dt ? `<div class="s2">${dt}</div>` : ''}</div>`;
    }).join('')}</div></div>`;
  }
}
if (!customElements.get('handy-card')) customElements.define('handy-card', HandyCard);
window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === 'handy-card')) window.customCards.push({ type: 'handy-card', name: 'Handy-Karte', description: 'Kompakte Startseite fürs iPhone: Wetter, Haustür, Energie, Personen, Müll' });
