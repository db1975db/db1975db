// Handy-Karte – kompakte Startseite fürs iPhone im Stil der Haus- und Raum-Karte (v0.15)
// Bereiche: Begrüßung, Personen, Wetter, Haustür, Alarmanlage, Energie, Müllkalender. Alle Bereiche sind optional.
// Dazu: custom:handy-floor (Etagen-Seite mit kleinen Raumkacheln) und die Leiste unten (`nav: [{name, icon, path}]` an beiden Karten).
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
.hello{padding:4px 2px 2px;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px}.hello .mn{width:38px;height:38px;border-radius:50%;border:1px solid var(--p-line);background:var(--p-card);color:var(--p-fg);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}.hello .g{font-size:22px;font-weight:750;line-height:1.15}.hello .d{font-size:13px;color:var(--p-fg2);margin-top:2px}
.ppl{display:flex;gap:8px}
.pp{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;padding:12px 4px 10px;border-radius:14px;background:rgba(255,255,255,.04);cursor:pointer}
.av{width:58px;height:58px;border-radius:50%;flex:none;background:#2b3242 center/cover;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:20px;position:relative;box-shadow:0 0 0 3px #5b6375,0 0 0 5px var(--p-card)}.pp.home .av{box-shadow:0 0 0 3px var(--p-ok),0 0 0 5px var(--p-card),0 0 16px rgba(27,175,122,.45)}
.av img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block}
.av i{position:absolute;right:-3px;bottom:-3px;width:20px;height:20px;border-radius:50%;border:2px solid var(--p-card);background:#5b6375;display:flex;align-items:center;justify-content:center;color:#fff}
.pp.home .av i{background:var(--p-ok)}
.pp .n{font-size:13px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pp .s{font-size:11.5px;color:var(--p-fg2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wx{color:#fff;border:none;padding:12px 12px 10px}
.wx .row1{display:grid;grid-template-columns:64px 1fr 104px;align-items:center;gap:8px}
.wx .wic svg{width:64px;height:64px;display:block}
.wx .tp2{font-size:38px;font-weight:200;line-height:1;letter-spacing:-1px}.wx .tp2 small{font-size:16px;font-weight:300;vertical-align:top;margin-left:2px}
.wx .cd2{font-size:13.5px;font-weight:650;margin-top:3px}.wx .mm2{font-size:12px;opacity:.85;display:flex;align-items:center;gap:2px;margin-top:1px}
.wx .cmp{position:relative;width:104px;height:104px;cursor:pointer}.wx .cmp svg{width:104px;height:104px;display:block}
.wx .cmp text{fill:#fff}
.wx .wl{display:flex;gap:3px;align-items:flex-start;font-size:11.5px;line-height:1.3;opacity:.9;margin-top:4px}.wx .wl ha-icon,.wx .wl svg{flex:none;margin-top:1px}
.wx .rain{margin-top:8px;border-radius:12px;background:rgba(0,0,0,.16);padding:7px 10px 6px}.wx .rain.dry{padding:6px 10px;opacity:.9}
.wx .ms{display:grid;gap:6px;margin-top:10px}.wx .m{background:rgba(0,0,0,.16);border-radius:12px;padding:6px 4px 5px;text-align:center;cursor:pointer;min-width:0}
.wx .m .mi{opacity:.75;display:flex;justify-content:center}.wx .m span ha-icon,.wx .m span svg{vertical-align:-2px;--mdc-icon-size:12px}.wx .m b{display:block;font-size:16px;font-weight:650;line-height:1.15;white-space:nowrap;font-variant-numeric:tabular-nums}.wx .m b small{font-size:10.5px;font-weight:500;opacity:.8;margin-left:1px}.wx .m span{display:block;font-size:10.5px;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wx .rt2{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:650}
.wx .bars{display:grid;grid-template-columns:repeat(12,1fr);gap:3px;align-items:end;height:26px;margin-top:6px}
.wx .bars i{display:block;border-radius:3px 3px 1px 1px;background:#7cc4ff;min-height:2px}
.wx .bars i.z{background:rgba(255,255,255,.18)}
.wx .tk{display:grid;grid-template-columns:repeat(12,1fr);font-size:9.5px;opacity:.7;margin-top:2px}.wx .tk span{text-align:center}
.wx .warn{margin-top:7px;border-radius:20px;padding:4px 10px;display:flex;gap:6px;align-items:center;font-size:12px;font-weight:650;color:#1d1a10;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:fit-content;max-width:100%}
@keyframes wob2{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
@keyframes streak{from{stroke-dashoffset:40}to{stroke-dashoffset:0}}
@keyframes drop{from{transform:translateY(-6px);opacity:0}30%{opacity:1}to{transform:translateY(14px);opacity:0}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes drift{from{transform:translateX(-60px)}to{transform:translateX(460px)}}
@keyframes fall{from{transform:translateY(-20px)}to{transform:translateY(160px)}}
@keyframes tw{0%,100%{opacity:.2}50%{opacity:1}}
@keyframes flash{0%,92%,100%{opacity:0}94%,96%{opacity:.7}}
@keyframes fogm{0%,100%{transform:translateX(-20px)}50%{transform:translateX(20px)}}
@keyframes glow{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes dash{to{stroke-dashoffset:-24}}
@keyframes dashr{to{stroke-dashoffset:24}}
@keyframes sheen{0%{transform:translateX(0) skewX(-20deg)}100%{transform:translateX(170px) skewX(-20deg)}}
.dr{display:flex;align-items:center;gap:10px}.dr .row{display:flex;align-items:center;gap:10px;flex:1;min-width:0;cursor:pointer}
.dr .lk{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none}
.dr .st{font-size:15px;font-weight:700;line-height:1.2}.dr .sub{font-size:12px;color:var(--p-fg2);margin-top:2px}
.dr .bt{display:flex;gap:6px;flex:none}.dr .btn{padding:10px 14px}
.al{--ac:#8a94a3;transition:background .4s}.al .row{display:flex;align-items:center;gap:10px;cursor:pointer}
.al .sh{position:relative;width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none;background:color-mix(in srgb,var(--ac) 18%,transparent);color:var(--ac)}
.al.armed .sh:after{content:"";position:absolute;inset:-4px;border-radius:50%;border:2px solid var(--ac);opacity:.5;animation:alr 2.4s ease-out infinite}
@keyframes alr{0%{transform:scale(.85);opacity:.6}100%{transform:scale(1.25);opacity:0}}
.al .st{font-size:15px;font-weight:700;line-height:1.2;color:var(--ac)}.al .sub{font-size:12px;color:var(--p-fg2);margin-top:2px}.al .tl{font-size:12px;color:var(--p-fg2)}
.al .seg{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-top:10px}
.al .seg .btn{flex-direction:column;gap:2px;padding:7px 2px;font-size:11.5px}.al .seg .btn.on{background:var(--ac);color:#fff}
.al .prg{height:4px;border-radius:2px;background:rgba(255,255,255,.1);margin-top:8px;overflow:hidden}.al .prg i{display:block;height:100%;background:var(--ac);animation:alp linear forwards}
@keyframes alp{from{width:0}to{width:100%}}
.al.trig{background:linear-gradient(150deg,#7a1d22,#c3333a);border-color:transparent;animation:alt 1.2s ease-in-out infinite}.al.trig .st,.al.trig .sh{color:#fff}.al.trig .sub,.al.trig .tl{color:rgba(255,255,255,.85)}
@keyframes alt{50%{filter:brightness(1.25)}}
.al .stop{margin-top:10px;width:100%;background:#fff;color:#a3202a;padding:12px;font-size:15px}
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
.wrap.hasnav{padding-bottom:calc(84px + env(safe-area-inset-bottom))}
.nav{position:fixed;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));z-index:5;display:flex;justify-content:space-around;gap:4px;padding:6px;border-radius:22px;background:rgba(24,28,38,.82);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.1);box-shadow:0 8px 28px rgba(0,0,0,.45)}
.nav a{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px;border-radius:16px;color:var(--p-fg2);font-size:10.5px;font-weight:650;cursor:pointer;text-decoration:none}
.nav a.on{color:#fff;background:rgba(255,255,255,.1)}.nav a.on ha-icon{color:#ffd34d}
.fh{border:none;color:#fff;padding:14px}
.fh .tt{display:flex;align-items:center;gap:8px;font-size:22px;font-weight:750}
.fh .tv{font-size:13px;opacity:.85;margin-top:2px}
.fh .cps{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.fh .cp{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:650;padding:5px 10px;border-radius:20px;background:rgba(0,0,0,.2)}
.fh .cp.bad{background:rgba(227,73,72,.85)}.fh .cp.heat{background:rgba(239,138,60,.85)}
.fh .off{border:none;font:inherit;font-size:12px;font-weight:700;padding:5px 12px;border-radius:20px;background:#fff;color:#1d2230;cursor:pointer;display:inline-flex;align-items:center;gap:4px}
.rm{display:flex;flex-direction:column;gap:4px;cursor:pointer;min-height:92px;padding:10px 11px;transition:background .3s}
.rm .tp{display:flex;align-items:center;justify-content:space-between}
.rm .ic{width:34px;height:34px;border-radius:11px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center}
.rm .tmp{font-size:19px;font-weight:300}.rm .tmp small{font-size:11px;opacity:.7}
.rm .nm{font-size:14px;font-weight:700;display:flex;align-items:center;gap:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rm .bt2{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:auto}
.rm .inf{display:flex;flex-wrap:wrap;gap:4px;font-size:11.5px;color:var(--p-fg2);align-items:center}
.rm .bdg{display:inline-flex;align-items:center;gap:2px;font-size:10.5px;font-weight:700;padding:1px 6px;border-radius:8px}
.rm .bdg.bad{background:rgba(227,73,72,.22);color:#ff8f8e}.rm .bdg.heat{background:rgba(239,138,60,.22);color:#ffb27a}
.rm .lb2{width:38px;height:38px;flex:none;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:var(--p-fg2);display:flex;align-items:center;justify-content:center;cursor:pointer}
.rm.lit{background:linear-gradient(160deg,rgba(var(--lc),.28),var(--p-card) 75%)}.rm.lit .lb2{background:rgb(var(--lc));color:#2a1a05;border-color:transparent;box-shadow:0 0 16px rgba(var(--lc),.6)}
.gi{display:flex;flex-direction:column;gap:3px;cursor:pointer;min-height:92px;padding:10px 11px}
.gi .v{font-size:19px;font-weight:650}.gi .s{font-size:12px;color:var(--p-fg2)}
`;
// Leiste unten (gemeinsam für Start- und Etagen-Seiten)
const P_nav = (items, base) => items && items.length ? `<nav class="nav">${items.map(n => { const p = n.path.startsWith('/') ? n.path : `${base || ''}/${n.path}`, on = location.pathname === p || location.pathname.startsWith(p + '/');
  return `<a class="${on ? 'on' : ''}" data-act="nav" data-p="${P_esc(p)}">${P_icon(n.icon || 'mdi:circle', 22)}${P_esc(n.name)}</a>`; }).join('')}</nav>` : '';
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
    const ents = [W.entity, W.temperature, W.max, W.min, W.wind, W.wind_gust, W.wind_bearing, W.rain_rate, W.rain_day, W.humidity, W.warning, W.prewarning, W.sun || 'sun.sun', D.lock, D.battery, D.contact, W.pressure, W.pressure_trend, W.dew_point, W.uv, ...Object.values(E), ...c.persons.map(p => p.entity), ...c.waste.map(w => w.entity)];
    const al = this.s((c.alarm || {}).entity), ak = al ? al.state + JSON.stringify([al.attributes.open_sensors, al.attributes.delay, al.attributes.changed_by, al.last_changed]) : '-';
    return ents.map(e => { const s = this.s(e); return s ? s.state + (s.attributes.entity_picture || '') : '-'; }).join('|') + ak + new Date().toDateString();
  }
  build() {
    this.root.innerHTML = `<style>${P_CSS}</style><div class="wrap" id="w"></div>`;
    this.root.addEventListener('click', (ev) => this.onClick(ev));
  }
  // Ziele in anderen Dashboards bekommen ?from=<aktuelle Seite>, damit deren Zurück-Knopf hierher zurückführt
  nav(p, from) { if (!p) return; let path = p.startsWith('/') ? p : `${this.c.base_path || ''}/${p}`; if (from) { try { sessionStorage.setItem('nav-from', JSON.stringify({ to: path.split('?')[0], from: location.pathname })); } catch (e) {} path += (path.includes('?') ? '&' : '?') + 'from=' + encodeURIComponent(location.pathname); } history.pushState(null, '', path); window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } })); }
  call(d, s, data) { this._hass.callService(d, s, data); }
  onClick(ev) {
    const t = ev.target.closest('[data-act]'); if (!t) return;
    const a = t.dataset.act, e = t.dataset.e;
    if (a === 'nav') this.nav(t.dataset.p, t.dataset.f);
    else if (a === 'menu') this.dispatchEvent(new Event('hass-toggle-menu', { bubbles: true, composed: true }));
    else if (a === 'lock') { const sv = t.dataset.sv; if (sv !== 'lock' && !window.confirm(sv === 'open' ? 'Haustür wirklich öffnen?' : 'Haustür wirklich aufschließen?')) return; this.call('lock', sv, { entity_id: e }); }
    else if (a === 'alarm') {
      const sv = t.dataset.sv, al = this.s(e), A = al ? al.attributes : {};
      if (sv === 'alarm_disarm' && !window.confirm(al && al.state === 'triggered' ? 'Alarm stoppen und Anlage ausschalten?' : 'Alarmanlage wirklich ausschalten?')) return;
      const data = { entity_id: e };
      if (A.code_format && (sv === 'alarm_disarm' || A.code_arm_required)) { const code = window.prompt('Code eingeben'); if (!code) return; data.code = code; }
      this.call('alarm_control_panel', sv, data);
    }
    else if (a === 'more') this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: e } }));
  }
  render() {
    const c = this.c, out = [];
    out.push(this.hello());
    if (c.persons.length) out.push(this.persons());
    if (c.weather) out.push(this.weather());
    if (c.energy) out.push(this.energy());
    if (c.door) out.push(this.door());
    if (c.alarm) out.push(this.alarm());
    if (c.waste.length) out.push(this.waste());
    if (c.nav) out.push(P_nav(c.nav, c.base_path));
    // Nur geänderte Bereiche ersetzen, damit laufende Animationen nicht neu starten
    const w = this.root.getElementById('w'); w.classList.toggle('hasnav', !!c.nav);
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
    // Menü-Knopf öffnet die HA-Seitenleiste (die obere Kopfleiste ist im iPhone-Dashboard ausgeblendet)
    return `<div class="full hello"><div><div class="g">${g}${P_esc(u)}</div><div class="d">${d}</div></div><button class="mn" data-act="menu" aria-label="Menü">${P_icon('mdi:menu', 20)}</button></div>`;
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
  // Animiertes Wettersymbol (64×64)
  wicon(key, day) {
    const cloud = (x, y, k, f = '#fff', o = 1) => `<g transform="translate(${x} ${y}) scale(${k})" opacity="${o}"><ellipse cx="0" cy="6" rx="17" ry="8" fill="${f}"/><ellipse cx="-8" cy="1" rx="9" ry="8" fill="${f}"/><ellipse cx="5" cy="-3" rx="11" ry="10" fill="${f}"/></g>`;
    const sun = (x, y, r) => `<g transform="translate(${x} ${y})"><g style="animation:spin 14s linear infinite">${[...Array(8)].map((_, i) => `<rect x="-1.6" y="${-r - 9}" width="3.2" height="6" rx="1.6" fill="#ffe28a" transform="rotate(${i * 45})"/>`).join('')}</g><circle r="${r}" fill="#ffd34d"/></g>`;
    const moon = (x, y) => `<g transform="translate(${x} ${y})"><path d="M5,-13 A14,14 0 1 0 5,13 A10,10 0 1 1 5,-13Z" fill="#f2ecd2"/></g>`;
    const stars = [[10, 12], [52, 10], [46, 30], [14, 44]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.3" fill="#fff" style="animation:tw ${1.8 + i * .5}s ease-in-out infinite"/>`).join('');
    const drops = (snow) => [18, 28, 38, 48].map((x, i) => snow ? `<circle cx="${x}" cy="46" r="2" fill="#fff" style="animation:drop ${2.2 + i * .3}s linear ${-i * .6}s infinite"/>` : `<line x1="${x}" y1="44" x2="${x - 2}" y2="50" stroke="#8fd0ff" stroke-width="2.2" stroke-linecap="round" style="animation:drop ${.9 + i * .15}s linear ${-i * .3}s infinite"/>`).join('');
    const bobC = (c) => `<g style="animation:bob 3s ease-in-out infinite">${c}</g>`;
    let g;
    if (key === 'sunny') g = sun(32, 32, 13);
    else if (key === 'clear-night') g = stars + moon(34, 32);
    else if (key === 'partlycloudy') g = (day ? sun(24, 24, 10) : stars + moon(24, 24)) + bobC(cloud(36, 38, 1));
    else if (key === 'cloudy') g = bobC(cloud(24, 26, .8, '#cfd6e2', .9) + cloud(36, 36, 1));
    else if (key === 'fog') g = [20, 30, 40, 50].map((y, i) => `<rect x="${8 + i % 2 * 4}" y="${y}" width="${48 - i % 2 * 8}" height="4" rx="2" fill="#fff" opacity=".7" style="animation:fogm ${4 + i}s ease-in-out infinite"/>`).join('');
    else if (['rainy', 'pouring'].includes(key)) g = drops(false) + bobC(cloud(32, 26, 1.1));
    else if (['snowy', 'snowy-rainy', 'hail'].includes(key)) g = drops(true) + bobC(cloud(32, 26, 1.1));
    else if (key.startsWith('lightning')) g = bobC(cloud(32, 24, 1.1)) + `<path d="M34,36 L26,48 L32,48 L28,60 L40,44 L34,44 L38,36Z" fill="#ffd34d" style="animation:flash 3s linear infinite;opacity:1"/>`;
    else g = bobC(cloud(32, 30, 1.1));
    return `<svg viewBox="0 0 64 64">${g}</svg>`;
  }
  // Windkompass: Pfeil zeigt die Herkunft, Windlinien ziehen in Windrichtung, in der Mitte die Geschwindigkeit
  compass(ws, gust, deg) {
    const dirs = ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'], d = deg == null ? null : ((deg % 360) + 360) % 360;
    const spd = ws == null || ws < 1 ? 0 : Math.max(.35, 3 - Math.log10(ws + 1) * 1.6);
    const streaks = spd ? [-14, -4, 6, 16].map((o, i) => `<line x1="${o}" y1="-30" x2="${o}" y2="30" stroke="#fff" stroke-opacity=".25" stroke-width="1.3" stroke-dasharray="6 14" style="animation:streak ${(spd * (1 + i * .15)).toFixed(2)}s linear infinite"/>`).join('') : '';
    const ticks = [...Array(16)].map((_, i) => `<line x1="0" y1="-46" x2="0" y2="${i % 4 ? -43 : -40}" stroke="#fff" stroke-opacity="${i % 4 ? .35 : .8}" stroke-width="${i % 4 ? 1 : 1.6}" transform="rotate(${i * 22.5})"/>`).join('');
    const lbls = [['N', 0, -32], ['O', 32, 0], ['S', 0, 32], ['W', -32, 0]].map(([t, x, y]) => `<text x="${x}" y="${y + 3.5}" text-anchor="middle" style="font-size:9px;font-weight:700;opacity:.75">${t}</text>`).join('');
    // Pfeil: sitzt auf der Herkunftsrichtung und zeigt zur Mitte (in Windrichtung)
    const arrow = d == null ? '' : `<g transform="rotate(${d})"><g style="animation:wob2 ${spd ? Math.max(1, spd * 1.4).toFixed(2) : 4}s ease-in-out infinite;transform-origin:0 0">
      <path d="M0,-23 L7,-34 L2.2,-33 L2.2,-47 L-2.2,-47 L-2.2,-33 L-7,-34Z" fill="#ffd34d" stroke="#3a2a00" stroke-opacity=".25" stroke-width=".6"/></g></g>`;
    return `<svg viewBox="-52 -52 104 104"><circle r="47" fill="rgba(0,0,0,.18)" stroke="rgba(255,255,255,.35)"/>${ticks}
      <clipPath id="cmpc"><circle r="28"/></clipPath><g clip-path="url(#cmpc)" transform="rotate(${d ?? 0})">${streaks}</g>${lbls}${arrow}
      <circle r="21" fill="rgba(10,16,30,.55)"/><text y="1" text-anchor="middle" style="font-size:15px;font-weight:750">${ws == null ? '–' : P_fmt(ws, ws < 10 ? 1 : 0)}</text><text y="11" text-anchor="middle" style="font-size:7.5px;opacity:.8">km/h</text></svg>
`;
  }
  // Windbeschreibung als Text: Herkunft, Böen, Stärke in Worten
  windText(ws, gust, deg) {
    const dirs = ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'], name = deg == null ? '' : dirs[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
    const bf = ws == null ? '' : ws < 2 ? 'windstill' : ws < 6 ? 'leiser Zug' : ws < 12 ? 'leichte Brise' : ws < 20 ? 'schwache Brise' : ws < 29 ? 'mäßiger Wind' : ws < 39 ? 'frischer Wind' : ws < 50 ? 'starker Wind' : ws < 62 ? 'steifer Wind' : 'Sturm';
    return `${P_icon('mdi:weather-windy', 13)}<span><b>${bf}</b>${name ? ` aus ${name}` : ''}${gust != null ? ` · <span style="white-space:nowrap">Böen ${P_fmt(gust, 0)} km/h</span>` : ''}</span>`;
  }
  weather() {
    const W = this.c.weather, w = this.s(W.entity), A = w ? w.attributes : {}, sun = this.s(W.sun || 'sun.sun'), day = sun ? sun.state === 'above_horizon' : (new Date().getHours() > 7 && new Date().getHours() < 17);
    let key = w ? w.state : 'cloudy'; if (key === 'sunny' && !day) key = 'clear-night';
    const [txt, , bg0] = P_WX[key] || ['–', '', ['#3d4a5e', '#66758c']], bg = day ? bg0 : ['#0f1630', '#26305a'];
    const t = this.n(W.temperature) ?? A.temperature, mx = this.n(W.max), mn = this.n(W.min);
    const ws = this.n(W.wind) ?? A.wind_speed, gust = this.n(W.wind_gust) ?? A.wind_gust_speed, deg = this.n(W.wind_bearing) ?? A.wind_bearing;
    const tm = (iso) => iso ? new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '–';
    // DWD-Warnung als kurze Zeile
    const wsn = this.s(W.warning), wa = wsn ? wsn.attributes : {}, wc = +(wa.warning_count || 0), pre = this.s(W.prewarning), pc = pre ? +(pre.attributes.warning_count || 0) : 0;
    let warn = '';
    if (wc || pc) {
      const src = wc ? wa : pre.attributes, n = wc || pc, col = src.warning_1_color || '#ffeb3b';
      const ev = String(src.warning_1_name || (src.warning_1_headline || '').replace(/^.*vor\s+/i, '') || 'Wetterwarnung'), evt = ev.charAt(0) + ev.slice(1).toLowerCase();
      warn = `<div class="warn" style="background:${col}" data-act="more" data-e="${wc ? W.warning : W.prewarning}">${P_icon('mdi:alert', 15)}${wc ? '' : 'Vorwarnung: '}${P_esc(evt)} bis ${tm(src.warning_1_end)}${n > 1 ? ` (+${n - 1})` : ''}</div>`;
    }
    // Regen: wann beginnt/endet er (stündliche Vorhersage, 12 Stunden)
    const fc = (this._fc || []).filter(f => new Date(f.datetime) > Date.now() - 36e5).slice(0, 12);
    const wet = (f) => (f.precipitation || 0) >= .1 || (f.precipitation_probability || 0) >= 50 || ['rainy', 'pouring', 'snowy', 'snowy-rainy', 'hail', 'lightning-rainy'].includes(f.condition);
    const snowy = (f) => ['snowy', 'snowy-rainy', 'hail'].includes(f.condition) || (f.temperature != null && f.temperature <= 0.5);
    const hr = (f) => `${new Date(f.datetime).getHours()} Uhr`, nowRain = this.n(W.rain_rate) > 0 || ['rainy', 'pouring', 'snowy', 'snowy-rainy', 'hail', 'lightning-rainy'].includes(key);
    let rtxt = '', ric = 'mdi:weather-cloudy', dry = false;
    if (fc.length) {
      if (nowRain || wet(fc[0])) { const e = fc.findIndex(f => !wet(f)), what = snowy(fc[0]) ? 'Schnee' : 'Regen'; ric = snowy(fc[0]) ? 'mdi:weather-snowy' : 'mdi:weather-pouring'; rtxt = e > 0 ? `${what} hört gegen ${hr(fc[e])} auf` : e === 0 ? `${what} hört bald auf` : `${what} in den nächsten ${fc.length} Std.`; }
      else { const b = fc.findIndex(wet); if (b > 0) { const f = fc[b], what = snowy(f) ? 'Schnee' : 'Regen'; ric = snowy(f) ? 'mdi:weather-snowy' : 'mdi:umbrella'; rtxt = `${what} ab ca. ${hr(f)}${f.precipitation_probability ? ` (${f.precipitation_probability} %)` : ''}`; } else { dry = true; ric = 'mdi:umbrella-closed-outline'; rtxt = `Kein Regen in den nächsten ${fc.length} Stunden`; } }
    }
    // Messwerte der Wetterstation als kleine Kacheln (nur konfigurierte)
    const pt = this.n(W.pressure_trend), ms = [
      [W.humidity, 'mdi:water-percent', 'Feuchte', (v) => `${P_fmt(v, 0)}<small>%</small>`],
      [W.pressure, 'mdi:gauge', pt == null ? 'Luftdruck' : `Druck ${P_icon(pt > .5 ? 'mdi:trending-up' : pt < -.5 ? 'mdi:trending-down' : 'mdi:trending-neutral', 12)}`, (v) => `${P_fmt(v, 0)}<small>hPa</small>`],
      [W.dew_point, 'mdi:thermometer-water', 'Taupunkt', (v) => `${P_fmt(v, 1)}<small>°</small>`],
      [W.uv, 'mdi:white-balance-sunny', 'UV-Index', (v) => P_fmt(v, 0)],
      [W.rain_day, 'mdi:weather-rainy', 'Regen heute', (v) => `${P_fmt(v, 1)}<small>mm</small>`],
    ].filter(([e]) => e && this.n(e) != null).slice(0, 4);
    const meas = ms.length ? `<div class="ms" style="grid-template-columns:repeat(${ms.length},minmax(0,1fr))">${ms.map(([e, ic, l, f]) => `<div class="m" data-act="more" data-e="${e}"><div class="mi">${P_icon(ic, 14)}</div><b>${f(this.n(e))}</b><span>${l}</span></div>`).join('')}</div>` : '';
    const rain = !fc.length ? '' : dry ? `<div class="rain dry"><div class="rt2">${P_icon(ric, 15)}${rtxt}</div></div>` : `<div class="rain"><div class="rt2">${P_icon(ric, 15)}${rtxt}</div>
      <div class="bars">${fc.map(f => { const v = Math.max((f.precipitation_probability || 0) / 100, Math.min(1, (f.precipitation || 0) / 2)); return `<i class="${v < .05 ? 'z' : ''}" style="height:${Math.max(8, v * 100)}%;${snowy(f) && v >= .05 ? 'background:#e8f1ff' : ''}"></i>`; }).join('')}</div>
      <div class="tk">${fc.map((f, i) => `<span>${i % 3 === 0 ? new Date(f.datetime).getHours() : ''}</span>`).join('')}</div></div>`;
    return `<div class="t full wx" style="background:linear-gradient(160deg,${bg[0]},${bg[1]})">
      <div class="row1"><div class="wic ${W.path ? 'lnk' : ''}" ${W.path ? `data-act="nav" data-f="1" data-p="${P_esc(W.path)}"` : ''}>${this.wicon(key, day)}</div>
        <div class="${W.path ? 'lnk' : ''}" ${W.path ? `data-act="nav" data-f="1" data-p="${P_esc(W.path)}"` : ''}><div class="tp2">${P_fmt(t)}<small>°C</small></div><div class="cd2">${P_esc(txt)}</div><div class="mm2">${P_icon('mdi:arrow-up', 13)}${P_fmt(mx)}° ${P_icon('mdi:arrow-down', 13)}${P_fmt(mn)}°</div><div class="wl">${this.windText(ws, gust, deg)}</div></div>
        <div class="cmp" data-act="more" data-e="${W.wind || W.entity}">${this.compass(ws, gust, deg)}</div></div>
      ${meas}${rain}${warn}</div>`;
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
  // Alarmanlage (z. B. Alarmo): Status, Modus wählen, Verzögerung als Balken, bei Alarm rote Kachel mit Stopp-Knopf
  alarm() {
    const L = this.c.alarm, al = this.s(L.entity), st = al ? al.state : 'unavailable', A = al ? al.attributes : {}, f = A.supported_features || 0;
    const M = { disarmed: ['Aus', 'mdi:shield-off-outline', '#8a94a3'], armed_home: ['Scharf · zu Hause', 'mdi:shield-home', '#3987e5'], armed_away: ['Scharf · abwesend', 'mdi:shield-lock', '#1baf7a'], armed_night: ['Scharf · Nacht', 'mdi:shield-moon', '#8a7cf0'], armed_vacation: ['Scharf · Urlaub', 'mdi:shield-airplane', '#1baf7a'], armed_custom_bypass: ['Scharf · eigene', 'mdi:shield-star', '#1baf7a'], arming: ['Wird scharf geschaltet …', 'mdi:shield-sync', '#ef8a3c'], pending: ['Eingangsverzögerung!', 'mdi:shield-alert', '#ef8a3c'], disarming: ['Wird ausgeschaltet …', 'mdi:shield-sync', '#8a94a3'], triggered: ['ALARM!', 'mdi:alarm-light', '#ffffff'] };
    const [txt, ic, col] = M[st] || ['nicht erreichbar', 'mdi:shield-off', '#8a94a3'];
    const tm = al ? new Date(al.last_changed).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '';
    const nm = (e) => { const s = this.s(e); return P_esc(s ? s.attributes.friendly_name || e : e); };
    const open = A.open_sensors ? Object.keys(A.open_sensors) : [];
    const sub = st === 'triggered' ? (open.length ? `Ausgelöst: ${open.map(nm).join(', ')}` : 'Alarm wurde ausgelöst') : open.length ? `Offen: ${open.map(nm).join(', ')}` : st === 'pending' ? 'Jetzt ausschalten, sonst gibt es Alarm' : tm ? `seit ${tm} Uhr${A.changed_by ? ` · ${P_esc(A.changed_by)}` : ''}` : '';
    // Verzögerung (scharf schalten / Eingang) als ablaufender Balken
    let prg = '';
    if ((st === 'arming' || st === 'pending') && A.delay) { const gone = Math.max(0, (Date.now() - new Date(al.last_changed)) / 1000); prg = `<div class="prg"><i style="animation-duration:${A.delay}s;animation-delay:-${Math.min(gone, A.delay).toFixed(1)}s"></i></div>`; }
    const modes = [['alarm_disarm', 'disarmed', 'Aus', 'mdi:shield-off-outline', true], ['alarm_arm_home', 'armed_home', 'Zuhause', 'mdi:shield-home', f & 1], ['alarm_arm_away', 'armed_away', 'Abwesend', 'mdi:shield-lock', f & 2], ['alarm_arm_night', 'armed_night', 'Nacht', 'mdi:shield-moon', f & 4]].filter(m => m[4]);
    const cur = st === 'arming' || st === 'pending' ? A.arm_mode || A.next_state : st;
    const seg = st === 'triggered' || st === 'pending' ? `<button class="btn stop" data-act="alarm" data-sv="alarm_disarm" data-e="${L.entity}">${P_icon('mdi:alarm-light-off', 18)}Alarm aus</button>`
      : `<div class="seg" style="grid-template-columns:repeat(${modes.length},minmax(0,1fr))">${modes.map(([sv, s2, l, i]) => `<button class="btn ${cur === s2 ? 'on' : ''}" data-act="alarm" data-sv="${sv}" data-e="${L.entity}">${P_icon(i, 18)}${l}</button>`).join('')}</div>`;
    return `<div class="t full al ${st.startsWith('armed') ? 'armed' : ''} ${st === 'triggered' ? 'trig' : ''}" style="--ac:${col}">
      <div class="row" data-act="more" data-e="${L.entity}"><div class="sh">${P_icon(ic, 24)}</div><div style="min-width:0"><div class="tl">${P_esc(L.name || 'Alarmanlage')}</div><div class="st">${txt}</div><div class="sub">${sub}</div></div></div>${prg}${seg}</div>`;
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
    // Eigene Stadtvilla von vorne (nach Foto): symmetrisch – rote Flächen links (ohne Fenster) und rechts gleich breit, graue Mitte mit Haustür,
    // Walmdach mit Ziegelreihen, Graten, Überstand, Rinne und Fallrohr; Varta-Speicher hinter dem HWR-Fenster rechts unten
    const D = isDay, lit = home > 150 ? 1 : 0, soc0 = Math.max(0, Math.min(100, soc || 0)), batCol = soc0 < 15 ? '#e34948' : soc0 < 40 ? '#e2b400' : '#3ddc97', batAct = chg > 15 || dis > 15;
    const C = D ? { red: ['#cf5c45', '#b44a36'], grey: ['#b6bcc8', '#a2a8b5'], edge: ['#c4c9d3', '#aeb3bf'], frame: '#8b919e', roof: ['#8a8d93', '#73767d'], fascia: '#e6e8ec', sill: '#e2e0dc' }
                : { red: ['#6c3428', '#57291f'], grey: ['#575b69', '#4a4e5b'], edge: ['#5f6372', '#50545f'], frame: '#424652', roof: ['#3c3e44', '#303237'], fascia: '#4a4d55', sill: '#6a6966' };
    const glass = (id) => lit ? `url(#${id}l)` : `url(#${id}g)`;
    const win = (x, y, w, h, dbl) => `<rect x="${x - 1}" y="${y - 1}" width="${w + 2}" height="${h + 2}" fill="${C.frame}" opacity=".55"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.frame}"/>
      <rect x="${x + 1.8}" y="${y + 1.8}" width="${w - 3.6}" height="${h - 3.6}" fill="${glass('ewin')}"/>${!lit && D ? `<path d="M${x + 2.5},${y + h - 4} L${x + w * .55},${y + 2.5} L${x + w * .75},${y + 2.5} L${x + 2.5},${y + h * .9}Z" fill="#fff" opacity=".22"/>` : ''}
      ${dbl ? `<rect x="${x + w / 2 - .9}" y="${y}" width="1.8" height="${h}" fill="${C.frame}"/>` : ''}<rect x="${x - 2}" y="${y + h}" width="${w + 4}" height="2.2" rx=".6" fill="${C.sill}"/>`;
    const roofL = (y) => 36 + (80 - y) * 2.8, roofR = (y) => 324 - (80 - y) * 2.8;
    // Graue Betondachsteine: Reihen mit Schattenkante und versetzten Fugen
    const tiles = [52, 55.5, 59, 62.5, 66, 69.5, 73, 76.5].map((y, r) => { const l = roofL(y), rr = roofR(y);
      let j = ''; for (let x = l + (r % 2 ? 3 : 0); x < rr - 2; x += 6) j += `M${x.toFixed(1)},${y - 3.5} L${x.toFixed(1)},${y}`;
      return `<line x1="${l}" y1="${y}" x2="${rr}" y2="${y}" stroke="#000" stroke-opacity=".28" stroke-width=".9"/><line x1="${l}" y1="${y + .8}" x2="${rr}" y2="${y + .8}" stroke="#fff" stroke-opacity=".08" stroke-width=".6"/><path d="${j}" stroke="#000" stroke-opacity=".14" stroke-width=".5"/>`; }).join('');
    // Monokristalline Module: schwarze Zellen im Raster, silberner Alurahmen, Spiegelung; bei Ertrag wandert ein Lichtschimmer darüber
    const MW = 19.5, MH = 11, panel = (x, y) => `<rect x="${x}" y="${y}" width="${MW}" height="${MH}" rx=".4" fill="#c3c8d0"/><rect x="${x + .6}" y="${y + .6}" width="${MW - 1.2}" height="${MH - 1.2}" fill="url(#epv)"/><rect x="${x + .6}" y="${y + .6}" width="${MW - 1.2}" height="${MH - 1.2}" fill="url(#ecell)"/>`;
    // 9 Module mittig: oben 4, unten 5
    const row = (n, y) => [...Array(n)].map((_, i) => [180 - (n * MW + (n - 1) * 1) / 2 + i * (MW + 1), y]);
    const PX = [...row(4, 54.2), ...row(5, 66.2)];
    const panels = `<g>${PX.map(([x, y]) => panel(x, y)).join('')}</g><g clip-path="url(#epvc)"><rect x="125" y="50" width="110" height="30" fill="url(#eglr)"/>${pvOn ? `<rect x="95" y="50" width="26" height="30" fill="url(#eshn)" style="animation:sheen ${Math.max(2.5, 7 - pv / 800)}s linear infinite"/>` : ''}</g>`;
    const pvClip = `<clipPath id="epvc">${PX.map(([x, y]) => `<rect x="${x + .6}" y="${y + .6}" width="${MW - 1.2}" height="${MH - 1.2}"/>`).join('')}</clipPath>`;
    const rays = pvOn ? [0, 1, 2].map(k => `<line x1="330" y1="30" x2="${172 + k * 22}" y2="${62 + k * 3}" stroke="#ffe48a" stroke-width="${Math.min(3, flowW(pv))}" stroke-dasharray="3 7" stroke-linecap="round" opacity=".45" style="animation:dash ${sp(pv)}s linear infinite"/>`).join('') : '';
    const lamp = (x) => `${!D ? `<ellipse cx="${x}" cy="166" rx="9" ry="13" fill="#ffd88a" opacity=".3"/>` : ''}<rect x="${x - 1.6}" y="162" width="3.2" height="5.5" rx="1" fill="${!D ? '#fff1c4' : '#eef1f5'}"/><rect x="${x - 1.6}" y="167" width="3.2" height="1" fill="#8b919e"/>`;
    const wire = 'M18,112 Q36,126 50,136';
    const gridFlow = imp > 15 || exp > 15 ? `<path d="${wire}" fill="none" stroke="${exp > imp ? '#3ddc97' : '#ff7a6b'}" stroke-width="${flowW(Math.max(imp, exp))}" stroke-dasharray="5 7" stroke-linecap="round" style="animation:${exp > imp ? 'dashr' : 'dash'} ${sp(Math.max(imp, exp))}s linear infinite"/>` : '';
    const sunG = D ? `<g transform="translate(340 24)"><circle r="${18 + Math.min(10, pv / 300)}" fill="#ffd65a" opacity="${pvOn ? .25 : .1}" style="animation:glow 3s ease-in-out infinite"/><g style="animation:spin ${pvOn ? Math.max(6, 40 - pv / 150) : 80}s linear infinite">${[...Array(10)].map((_, i) => `<rect x="-2" y="-${20 + Math.min(5, pv / 600)}" width="4" height="7" rx="2" fill="#ffe28a" transform="rotate(${i * 36})"/>`).join('')}</g><circle r="12" fill="${pvOn ? '#ffd34d' : '#e8d9a0'}"/></g>`
      : `<g transform="translate(340 24)"><path d="M5,-12 A13,13 0 1 0 5,12 A9,9 0 1 1 5,-12Z" fill="#f2ecd2"/></g>${[...Array(12)].map((_, i) => `<circle cx="${(i * 61) % 360}" cy="${(i * 23) % 40 + 6}" r="1.2" fill="#fff" style="animation:tw ${2 + i % 3}s ease-in-out ${i * .4}s infinite"/>`).join('')}`;
    // Varta Element backup im HWR (durchs Fenster gesehen)
    const varta = `<rect x="254.8" y="159.8" width="22.4" height="31.4" fill="${D ? '#3b4250' : '#1c2029'}"/>
      ${batAct ? `<rect x="254.8" y="159.8" width="22.4" height="31.4" fill="${batCol}" opacity=".2" style="animation:glow 1.6s ease-in-out infinite"/>` : ''}
      <rect x="259" y="165" width="14" height="26.2" fill="#eef0f2"/><rect x="258.4" y="164" width="15.2" height="2" fill="#fafafa"/><rect x="259" y="166" width="14" height="1.2" fill="#2a2d33"/>
      <path d="M260,169.5 l5.5,0 l-1,1.6 l-4.5,0Z M260,171.6 l4.8,0 l-1,1.6 l-3.8,0Z" fill="#3fae49"/>
      <rect x="269.6" y="169" width="2.2" height="20" rx="1" fill="#c9ccd2"/><rect x="269.6" y="${169 + 20 - 20 * soc0 / 100}" width="2.2" height="${20 * soc0 / 100}" rx="1" fill="${batCol}"/>`;
    const scene = `<svg viewBox="0 0 360 236"><defs>
      <linearGradient id="esk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>
      <linearGradient id="ered" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.red[0]}"/><stop offset="1" stop-color="${C.red[1]}"/></linearGradient>
      <linearGradient id="egry" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.grey[0]}"/><stop offset="1" stop-color="${C.grey[1]}"/></linearGradient>
      <linearGradient id="eedg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.edge[0]}"/><stop offset="1" stop-color="${C.edge[1]}"/></linearGradient>
      <linearGradient id="eroof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.roof[1]}"/><stop offset="1" stop-color="${C.roof[0]}"/></linearGradient>
      <linearGradient id="eeave" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
      <linearGradient id="ewing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${D ? '#cfe0f2' : '#26304a'}"/><stop offset="1" stop-color="${D ? '#7f98b8' : '#1a2032'}"/></linearGradient>
      <linearGradient id="ewinl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3a3"/><stop offset="1" stop-color="#f5b45a"/></linearGradient>
      <linearGradient id="epv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${D ? '#1d2636' : '#11161f'}"/><stop offset="1" stop-color="${D ? '#0b0f17' : '#07090d'}"/></linearGradient>
      <pattern id="ecell" width="2.4" height="2.05" patternUnits="userSpaceOnUse"><rect width="2.4" height="2.05" fill="none" stroke="#3a4a66" stroke-width=".22"/></pattern>
      <linearGradient id="eglr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${D ? .22 : .06}"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#9ec3ff" stop-opacity="${D ? .12 : .03}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <linearGradient id="eshn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>${pvClip}</defs>
      <rect width="360" height="236" fill="url(#esk)"/>${sunG}
      <path d="M0,205 Q120,199 200,204 T360,201 L360,236 L0,236Z" fill="${grass}"/><path d="M168,206 L186,206 L194,236 L160,236Z" fill="${D ? '#8d9099' : '#3b3e46'}"/>
      <g stroke="#3a3530" stroke-width="3" stroke-linecap="round"><line x1="14" y1="106" x2="14" y2="214"/><line x1="4" y1="114" x2="24" y2="114"/><line x1="6" y1="124" x2="22" y2="124"/></g>
      <path d="${wire}" fill="none" stroke="#2a2622" stroke-width="1.5"/>${gridFlow}
      <rect x="181" y="38" width="12" height="14" fill="${D ? '#7a7e88' : '#3a3c44'}"/><rect x="179.5" y="36" width="15" height="3" fill="${D ? '#5f636c' : '#2e3036'}"/><rect x="266" y="42" width="3.4" height="12" fill="#26282e"/>
      <path d="M36,80 L120,50 L240,50 L324,80Z" fill="url(#eroof)"/>${tiles}
      <line x1="36" y1="80" x2="120" y2="50" stroke="#2a2c31" stroke-width="1.6"/><line x1="324" y1="80" x2="240" y2="50" stroke="#2a2c31" stroke-width="1.6"/><line x1="120" y1="50" x2="240" y2="50" stroke="#2a2c31" stroke-width="2"/>
      ${panels}
      <rect x="34" y="79" width="292" height="4.5" fill="${C.fascia}"/><rect x="34" y="83.5" width="292" height="2.4" rx="1.2" fill="${D ? '#c3c7ce' : '#3d4048'}"/>
      <rect x="50" y="86" width="260" height="120" fill="url(#egry)"/>
      <rect x="50" y="86" width="8" height="120" fill="url(#eedg)"/><rect x="302" y="86" width="8" height="120" fill="url(#eedg)"/>
      <rect x="58" y="86" width="65" height="120" fill="url(#ered)"/><rect x="237" y="86" width="65" height="120" fill="url(#ered)"/>
      <rect x="123" y="85.4" width="114" height="120.6" fill="url(#egry)"/><line x1="123" y1="86" x2="123" y2="206" stroke="#000" stroke-opacity=".12"/><line x1="237" y1="86" x2="237" y2="206" stroke="#000" stroke-opacity=".12"/>
      <rect x="50" y="86" width="260" height="9" fill="url(#eeave)"/>
      <rect x="44" y="86" width="2.6" height="118" rx="1.3" fill="${D ? '#c3c7ce' : '#3d4048'}"/>
      ${win(131, 96, 16, 24)}${win(162, 95, 28, 32)}${win(212, 94, 16, 24)}${win(246, 95, 44, 32, true)}
      ${win(131, 161, 16, 23)}${win(212, 161, 16, 23)}
      <rect x="253.2" y="158.2" width="25.6" height="34.6" fill="${C.frame}"/>${varta}<rect x="251.4" y="192.8" width="29.2" height="2.2" rx=".6" fill="${C.sill}"/>
      <rect x="161" y="158" width="30" height="48" fill="${C.frame}"/><rect x="163" y="160" width="26" height="46" fill="${D ? '#b8bec9' : '#4c5160'}"/>
      ${[0, 1, 2, 3].map(k => `<rect x="173" y="${165 + k * 9.6}" width="6.4" height="6.4" fill="${lit && !D ? '#ffd88a' : '#363b46'}"/>`).join('')}<rect x="167" y="170" width="1.4" height="28" rx=".7" fill="#e3e6eb"/>
      ${lamp(154)}${lamp(198)}
      <text x="294" y="155" text-anchor="middle" style="font-size:7px;font-weight:600;fill:${D ? '#ece7df' : '#a39f99'}">32c</text>
      <rect x="48" y="204" width="264" height="3.5" fill="${D ? '#5d3e39' : '#3a2723'}"/><rect x="156" y="205" width="40" height="3" fill="${D ? '#c9ccd2' : '#4a4d55'}"/>
      ${rays}
      ${lbl(268, 20, kw(pv), 'Solar', '#ffd65a', E.pv)}
      ${lbl(8, 217, exp > imp ? kw(exp) : kw(imp), exp > imp ? 'Einspeisung' : 'Netzbezug', exp > imp ? '#3ddc97' : '#ff7a6b', exp > imp ? E.grid_export : E.grid_import, 'start')}
      ${lbl(118, 217, kw(home), 'Haus', '#5aa9ff', E.home)}
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
// Etagen-Seite fürs iPhone: Kopf mit Zusammenfassung, kleine Raumkacheln (Licht direkt schaltbar), optional Garten-Kacheln
class HandyFloor extends HandyCard {
  setConfig(c) { this.c = { rooms: [], garden: [], ...c }; this._k = null; if (this.root) this.build(); }
  set hass(h) { this._hass = h; if (!this.root) { this.root = this.attachShadow({ mode: 'open' }); this.build(); } const k = this.keys(); if (k === this._k) return; this._k = k; this.render(); }
  keys() {
    const c = this.c, ents = [...c.rooms.flatMap(r => [r.temperature, r.humidity, r.climate, ...(r.lights || []), ...(r.windows || []).map(w => w.entity || w)]), ...c.garden.flatMap(g => [g.entity, g.battery, g.temperature, g.climate, g.recommendation, ...(g.zones || [])])];
    return ents.map(e => { const s = this.s(e); return s ? s.state + JSON.stringify((s.attributes || {}).rgb_color || '') + ((s.attributes || {}).hvac_action || '') : '-'; }).join('|');
  }
  onClick(ev) {
    const t = ev.target.closest('[data-act]'); if (!t) return; ev.stopPropagation();
    const a = t.dataset.act;
    if (a === 'lights' || a === 'alloff') { const ids = t.dataset.e.split(',').filter(Boolean), on = ids.filter(e => (this.s(e) || {}).state === 'on'); this.call('homeassistant', a === 'alloff' || on.length ? 'turn_off' : 'turn_on', { entity_id: a === 'alloff' ? on : on.length ? on : ids }); }
    else if (a === 'nav') this.nav(t.dataset.p, t.dataset.f);
    else if (a === 'more') this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: t.dataset.e } }));
  }
  rgb(s) { const a = s.attributes || {}; if (a.rgb_color) return a.rgb_color; if (a.color_temp_kelvin) { const k = a.color_temp_kelvin; return k < 3000 ? [255, 180, 107] : k < 4500 ? [255, 214, 170] : [235, 240, 255]; } return [255, 196, 122]; }
  render() {
    const c = this.c, rooms = c.rooms, base = c.room_base || c.base_path || '';
    const allL = rooms.flatMap(r => r.lights || []), onL = allL.filter(e => (this.s(e) || {}).state === 'on');
    const temps = rooms.map(r => this.n(r.temperature)).filter(v => v != null), tt = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : null;
    const open = rooms.filter(r => (r.windows || []).some(w => (this.s(w.entity || w) || {}).state === 'on')), heat = rooms.filter(r => { const x = this.s(r.climate); return x && x.attributes.hvac_action === 'heating'; });
    const head = `<div class="t full fh" style="background:${c.background || 'linear-gradient(150deg,#2b3a67,#4a5d8f)'}"><div class="tt">${P_icon(c.icon || 'mdi:home', 26)}${P_esc(c.title || '')}</div>
      <div class="tv">${tt != null ? `Ø ${P_fmt(tt)} °C · ` : ''}${rooms.length} ${rooms.length === 1 ? 'Raum' : 'Räume'}</div>
      <div class="cps">${allL.length ? `<span class="cp">${P_icon(onL.length ? 'mdi:lightbulb-on' : 'mdi:lightbulb-off-outline', 14)}${onL.length ? `${onL.length} ${onL.length === 1 ? 'Licht' : 'Lichter'} an` : 'Alle Lichter aus'}</span>` : ''}
        ${onL.length ? `<button class="off" data-act="alloff" data-e="${allL.join(',')}">${P_icon('mdi:power', 14)}Alle aus</button>` : ''}
        ${open.length ? `<span class="cp bad">${P_icon('mdi:window-open-variant', 14)}offen: ${open.map(r => P_esc(r.name)).join(', ')}</span>` : ''}
        ${heat.length ? `<span class="cp heat">${P_icon('mdi:fire', 14)}${heat.length} ${heat.length === 1 ? 'Raum heizt' : 'Räume heizen'}</span>` : ''}</div></div>`;
    const tiles = rooms.map(r => {
      const ls = (r.lights || []).map(e => this.s(e)).filter(Boolean), on = ls.filter(s => s.state === 'on'), t = this.n(r.temperature), hu = this.n(r.humidity);
      const op = (r.windows || []).some(w => (this.s(w.entity || w) || {}).state === 'on'), cl = this.s(r.climate), ht = cl && cl.attributes.hvac_action === 'heating';
      const lc = on.length ? this.rgb(on[0]).join(',') : '';
      const p = r.path ? (r.path.startsWith('/') ? r.path : `${base}/${r.path}`) : '';
      return `<div class="t rm ${on.length ? 'lit' : ''}" ${lc ? `style="--lc:${lc}"` : ''} ${p ? `data-act="nav" data-f="1" data-p="${P_esc(p)}"` : ''}>
        <div class="tp"><div class="ic">${P_icon(r.icon || 'mdi:door', 19)}</div>${t != null ? `<div class="tmp">${P_fmt(t)}<small>°</small></div>` : ''}</div>
        <div class="nm">${P_esc(r.name)}${p ? P_icon('mdi:chevron-right', 15) : ''}</div>
        <div class="bt2"><div class="inf">${hu != null ? `<span>${P_icon('mdi:water-percent', 13)}${P_fmt(hu, 0)} %</span>` : ''}${op ? `<span class="bdg bad">${P_icon('mdi:window-open-variant', 12)}offen</span>` : ''}${ht ? `<span class="bdg heat">${P_icon('mdi:fire', 12)}heizt</span>` : ''}</div>
          ${ls.length ? `<button class="lb2" data-act="lights" data-e="${(r.lights || []).join(',')}" aria-label="Licht ${P_esc(r.name)}">${P_icon(on.length ? 'mdi:lightbulb-on' : 'mdi:lightbulb-outline', 20)}</button>` : ''}</div></div>`;
    }).join('');
    const garden = c.garden.map(g => {
      const s = this.s(g.entity), p = g.path ? (g.path.startsWith('/') ? g.path : `${base}/${g.path}`) : '';
      let v = '–', sub = '';
      if (g.type === 'pool') { const t = this.n(g.temperature), cl = this.s(g.climate); v = t != null ? `${P_fmt(t)} °C` : '–'; sub = !cl || cl.state === 'unavailable' ? 'Wärmepumpe nicht erreichbar' : cl.state === 'off' ? 'Wärmepumpe aus' : `Wärmepumpe ${cl.attributes.hvac_action === 'heating' ? 'heizt' : 'an'}`; }
      else if (g.type === 'irrigation') { const run = (g.zones || []).filter(z => (this.s(z) || {}).state === 'on').length; v = run ? `${run} ${run === 1 ? 'Zone' : 'Zonen'} aktiv` : 'Bereit'; const r = this.s(g.recommendation); sub = r ? r.state : (s ? (s.state === 'on' ? 'verbunden' : 'getrennt') : ''); }
      else if (g.type === 'mower') { const M = { mowing: 'mäht', docked: 'in der Station', returning: 'fährt heim', paused: 'Pause', error: 'Fehler' }; v = s ? (M[s.state] || s.state) : 'nicht verfügbar'; const b = this.n(g.battery); sub = b != null ? `Akku ${P_fmt(b, 0)} %` : ''; }
      return `<div class="t gi" ${p ? `data-act="nav" data-f="1" data-p="${P_esc(p)}"` : g.entity ? `data-act="more" data-e="${g.entity}"` : ''}><div class="ic" style="width:34px;height:34px;border-radius:11px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center">${P_icon(g.icon || 'mdi:flower', 19)}</div>
        <div class="nm" style="font-size:14px;font-weight:700">${P_esc(g.name)}</div><div class="v" style="font-size:15px">${P_esc(v)}</div><div class="s">${P_esc(sub)}</div></div>`;
    }).join('');
    const out = [head, tiles, garden, P_nav(c.nav, c.base_path)];
    const w = this.root.getElementById('w'); w.classList.toggle('hasnav', !!c.nav);
    while (w.children.length > out.length) w.lastChild.remove();
    out.forEach((html, i) => { let el = w.children[i]; if (!el) { el = document.createElement('div'); el.style.display = 'contents'; w.appendChild(el); } if (el._h !== html) { el._h = html; el.innerHTML = html; } });
  }
}
if (!customElements.get('handy-card')) customElements.define('handy-card', HandyCard);
if (!customElements.get('handy-floor')) customElements.define('handy-floor', HandyFloor);
window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === 'handy-card')) window.customCards.push({ type: 'handy-card', name: 'Handy-Karte', description: 'Kompakte Startseite fürs iPhone: Wetter, Haustür, Energie, Personen, Müll' });
