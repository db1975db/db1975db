// Handy-Karte – kompakte Startseite fürs iPhone im Stil der Haus- und Raum-Karte (v0.3)
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
.wx{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;color:#fff;border:none}
.wx .ic{width:46px;height:46px;border-radius:14px;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center}
.wx .tp{font-size:34px;font-weight:300;line-height:1}.wx .tp small{font-size:16px;opacity:.8}
.wx .cd{font-size:13px;font-weight:650;margin-top:3px}
.wx .mm{text-align:right;font-size:12.5px;line-height:1.55;opacity:.92}
.wx .mm span{display:inline-flex;align-items:center;gap:3px}
.dr{display:flex;align-items:center;gap:10px}.dr .row{display:flex;align-items:center;gap:10px;flex:1;min-width:0;cursor:pointer}
.dr .lk{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none}
.dr .st{font-size:15px;font-weight:700;line-height:1.2}.dr .sub{font-size:12px;color:var(--p-fg2);margin-top:2px}
.dr .bt{display:flex;gap:6px;flex:none}.dr .btn{padding:10px 14px}
.btn{flex:1;border:none;border-radius:12px;padding:9px 6px;font:inherit;font-size:13px;font-weight:650;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;background:rgba(255,255,255,.08);color:var(--p-fg)}
.btn.pri{background:#2f6fd0;color:#fff}.btn.sm{flex:0 0 auto;padding:9px 10px}
.en{padding:10px 8px 6px;background:radial-gradient(120% 90% at 50% 0%,#232a3b 0%,#151922 70%)}
.en .hd{display:flex;justify-content:space-between;align-items:center;padding:0 4px}
.en .hd .h{margin:0}.en .day{font-size:12px;color:var(--p-fg2)}.en .day b{color:#ffc23d;font-weight:650}
.en svg{width:100%;height:auto;display:block}
.en text{fill:#f2f4f8;font-size:15px;font-weight:650}.en text.lb{fill:#9aa3b2;font-size:11.5px;font-weight:500}
.en .nd{cursor:pointer}
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
    const k = this.keys(); if (k === this._k) return; this._k = k; this.render();
  }
  getCardSize() { return 8; }
  s(e) { return e && this._hass ? this._hass.states[e] : null; }
  n(e) { const s = this.s(e); const v = s ? parseFloat(s.state) : NaN; return isNaN(v) ? null : v; }
  keys() {
    const c = this.c, W = c.weather || {}, D = c.door || {}, E = c.energy || {};
    const ents = [W.entity, W.temperature, W.max, W.min, W.wind, W.rain_day, W.humidity, D.lock, D.battery, D.contact, ...Object.values(E), ...c.persons.map(p => p.entity), ...c.waste.map(w => w.entity)];
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
    this.root.getElementById('w').innerHTML = out.join('');
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
  weather() {
    const W = this.c.weather, w = this.s(W.entity), cond = w ? w.state : 'cloudy', h = new Date().getHours();
    const key = cond === 'sunny' && (h < 7 || h > 18) ? 'clear-night' : cond, [txt, ic, bg] = P_WX[key] || [cond, 'mdi:weather-cloudy', ['#3d4a5e', '#66758c']];
    const t = this.n(W.temperature) ?? (w && w.attributes.temperature), mx = this.n(W.max), mn = this.n(W.min), wi = this.n(W.wind) ?? (w && w.attributes.wind_speed), rn = this.n(W.rain_day), hu = this.n(W.humidity) ?? (w && w.attributes.humidity);
    return `<div class="t full wx ${W.path ? 'lnk' : ''}" style="background:linear-gradient(135deg,${bg[0]},${bg[1]})" ${W.path ? `data-act="nav" data-p="${P_esc(W.path)}"` : ''}>
      <div class="ic">${P_icon(ic, 30)}</div>
      <div><div class="tp">${P_fmt(t)}<small>°C</small></div><div class="cd">${P_esc(txt)}</div></div>
      <div class="mm"><span>${P_icon('mdi:arrow-up', 13)}${P_fmt(mx)}° ${P_icon('mdi:arrow-down', 13)}${P_fmt(mn)}°</span><br><span>${P_icon('mdi:weather-windy', 13)}${P_fmt(wi, 0)} km/h</span><br><span>${P_icon('mdi:water', 13)}${P_fmt(rn)} mm · ${P_fmt(hu, 0)} %</span></div></div>`;
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
    // Energiefluss im Hochformat: Solar oben, Netz links, Haus rechts, Akku unten; Punkte laufen je nach Leistung schneller
    const E = this.c.energy, pv = Math.max(0, this.n(E.pv) || 0), home = Math.max(0, this.n(E.home) || 0), imp = Math.max(0, this.n(E.grid_import) || 0), exp = Math.max(0, this.n(E.grid_export) || 0);
    const soc = this.n(E.battery_soc), bp = this.n(E.battery_power) || 0, chg = Math.max(0, -bp), dis = Math.max(0, bp), day = this.n(E.pv_today);
    const pvBat = Math.min(chg, pv), pvGrid = Math.min(exp, Math.max(0, pv - pvBat)), pvHome = Math.max(0, pv - pvBat - pvGrid);
    const kw = (w) => w >= 1000 ? `${P_fmt(w / 1000, 1)} kW` : `${P_fmt(w, 0)} W`;
    const self = home > 0 ? Math.min(100, Math.round(Math.max(0, home - imp) / home * 100)) : 0;
    const C = { pv: '#ffc23d', grid: '#a9b4c6', bat: '#3ddc97', home: '#5aa9ff' };
    const L = [['M162,62 Q170,128 280,128', pvHome, C.pv], ['M138,62 Q130,128 40,128', pvGrid, C.pv], ['M150,70 L150,184', pvBat, C.pv], ['M40,128 L280,128', imp, C.grid], ['M162,194 Q170,128 280,128', dis, C.bat]];
    const flows = L.filter(l => l[1] > 15).map(([d, w, col], i) => {
      const dur = Math.max(.8, Math.min(4, 4 - Math.log10(w) * 1.05)).toFixed(2), sw = Math.min(5, 1.5 + w / 1500);
      return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw + 7}" stroke-linecap="round" opacity=".14"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" opacity=".75"/>`
        + [0, 1, 2].map(k => `<circle r="4" fill="#fff"><animateMotion dur="${dur}s" begin="-${(k * dur / 3).toFixed(2)}s" repeatCount="indefinite" path="${d}"/></circle>`).join('');
    }).join('');
    const idle = L.map(([d]) => `<path d="${d}" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="2" stroke-dasharray="3 5"/>`).join('');
    const node = (x, y, col, icon, val, lb, ent, act, pos) => {
      const tx = pos === 'r' ? [x + 34, 'start'] : pos === 'l' ? [x - 34, 'end'] : [x, 'middle'], ty = pos === 'b' ? y + 44 : pos === 't' ? y - 32 : y - 2;
      return `<g class="nd" data-act="more" data-e="${ent}">${act ? `<circle cx="${x}" cy="${y}" r="30" fill="${col}" opacity=".18"><animate attributeName="r" values="26;32;26" dur="2.6s" repeatCount="indefinite"/></circle>` : ''}
        <circle cx="${x}" cy="${y}" r="24" fill="${act ? col + '30' : 'rgba(255,255,255,.05)'}" stroke="${act ? col : 'rgba(255,255,255,.2)'}" stroke-width="1.5"/>
        <path transform="translate(${x - 12} ${y - 12})" d="${P_FI[icon]}" fill="${act ? col : 'rgba(255,255,255,.5)'}"/>
        <text x="${tx[0]}" y="${ty}" text-anchor="${tx[1]}">${val}</text><text class="lb" x="${tx[0]}" y="${ty + 15}" text-anchor="${tx[1]}">${lb}</text></g>`;
    };
    const R = 15, cf = 2 * Math.PI * R;
    const ring = `<g transform="translate(270 34)"><circle r="${R}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="4"/><circle r="${R}" fill="none" stroke="#3ddc97" stroke-width="4" stroke-linecap="round" stroke-dasharray="${(cf * self / 100).toFixed(1)} ${cf.toFixed(1)}" transform="rotate(-90)"/><text y="4" text-anchor="middle" style="font-size:10px">${self}%</text><text class="lb" y="31" text-anchor="middle" style="font-size:10px">autark</text></g>`;
    const gridTxt = exp > imp ? kw(exp) : kw(imp), gridLb = exp > imp ? 'Einspeisung' : imp > 15 ? 'Netzbezug' : 'Netz';
    const batLb = `Akku ${soc != null ? P_fmt(soc, 0) + ' %' : ''}${chg > 15 ? ' · lädt' : dis > 15 ? ' · entlädt' : ''}`;
    return `<div class="t full en"><div class="hd"><div class="h">${P_icon('mdi:lightning-bolt', 14)}Energie</div>${day != null ? `<div class="day">Solar heute <b>${P_fmt(day, 1)} kWh</b></div>` : ''}</div>
      <svg viewBox="0 0 320 236">${idle}${flows}${ring}
        ${node(150, 40, C.pv, 'solar-power-variant', kw(pv), 'Solar', E.pv, pv > 15, 'r')}
        ${node(40, 128, C.grid, 'transmission-tower', gridTxt, gridLb, exp > imp ? E.grid_export : E.grid_import, imp > 15 || exp > 15, 'b')}
        ${node(280, 128, C.home, 'home', kw(home), 'Haus', E.home, home > 15, 'b')}
        ${node(150, 206, C.bat, 'home-battery', chg > 15 ? kw(chg) : dis > 15 ? kw(dis) : '0 W', batLb, E.battery_soc, chg > 15 || dis > 15, 'r')}
      </svg></div>`;
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
