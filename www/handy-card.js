// Handy-Karte – kompakte Startseite fürs iPhone im Stil der Haus- und Raum-Karte (v0.1)
// Bereiche: Begrüßung, Personen, Wetter, Haustür, Energie, Müllkalender. Alle Bereiche sind optional.
const P_fmt = (v, d = 1) => (v == null || isNaN(v)) ? '–' : Number(v).toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
const P_icon = (i, s = 18) => `<ha-icon icon="${i}" style="--mdc-icon-size:${s}px;width:${s}px;height:${s}px"></ha-icon>`;
const P_esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
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
.pp{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px;padding:8px 4px;border-radius:14px;background:rgba(255,255,255,.04);cursor:pointer}
.av{width:40px;height:40px;border-radius:50%;flex:none;background:#2b3242 center/cover;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;position:relative}
.av i{position:absolute;right:-1px;bottom:-1px;width:11px;height:11px;border-radius:50%;border:2px solid var(--p-card);background:#6b7385}
.pp.home .av i{background:var(--p-ok)}
.pp .n{font-size:13px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pp .s{font-size:11.5px;color:var(--p-fg2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wx{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;color:#fff;border:none}
.wx .ic{width:46px;height:46px;border-radius:14px;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center}
.wx .tp{font-size:34px;font-weight:300;line-height:1}.wx .tp small{font-size:16px;opacity:.8}
.wx .cd{font-size:13px;font-weight:650;margin-top:3px}
.wx .mm{text-align:right;font-size:12.5px;line-height:1.55;opacity:.92}
.wx .mm span{display:inline-flex;align-items:center;gap:3px}
.dr .row{display:flex;align-items:center;gap:10px}
.dr .lk{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none}
.dr .st{font-size:15px;font-weight:700;line-height:1.2}.dr .sub{font-size:12px;color:var(--p-fg2);margin-top:2px}
.dr .bt{display:flex;gap:6px;margin-top:10px}
.btn{flex:1;border:none;border-radius:12px;padding:9px 6px;font:inherit;font-size:13px;font-weight:650;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;background:rgba(255,255,255,.08);color:var(--p-fg)}
.btn.pri{background:#2f6fd0;color:#fff}.btn.sm{flex:0 0 auto;padding:9px 10px}
.en .big b{display:block;font-size:24px;font-weight:650;color:#f5b82e;white-space:nowrap;line-height:1.1}.en .big span{display:block;font-size:12px;color:var(--p-fg2);margin:2px 0 2px}
.en .rw{display:grid;grid-template-columns:18px 1fr auto;align-items:center;gap:6px;font-size:12.5px;margin-top:6px}
.en .rw b{font-weight:650}.en .bar{grid-column:2/4;height:4px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;margin-top:-2px}.en .bar i{display:block;height:100%;border-radius:2px}
.ws{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.wi{display:flex;align-items:center;gap:8px;padding:8px;border-radius:14px;background:rgba(255,255,255,.04);min-width:0}
.wi .ic{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex:none}
.wi .n{font-size:13px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wi .s{font-size:12px;color:var(--p-fg2)}.wi .s2{font-size:11px;color:var(--p-fg2);opacity:.75}
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
    if (c.door) out.push(this.door());
    if (c.energy) out.push(this.energy());
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
      return `<div class="pp ${home ? 'home' : ''}" data-act="more" data-e="${p.entity}"><div class="av" ${u ? `style="background-image:url('${u}')"` : ''}>${u ? '' : P_esc(name[0] || '?')}<i></i></div><div style="min-width:0;max-width:100%"><div class="n">${P_esc(name)}</div><div class="s">${P_esc(where)}</div></div></div>`;
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
    return `<div class="t dr"><div class="h">${P_icon('mdi:door', 14)}${P_esc(D.name || 'Haustür')}</div>
      <div class="row" data-act="more" data-e="${D.lock}"><div class="lk" style="background:${col}26;color:${col}">${P_icon(ic, 24)}</div><div style="min-width:0"><div class="st" style="color:${col}">${txt}</div><div class="sub">${P_esc(sub)}</div></div></div>
      <div class="bt">${st === 'locked' ? `<button class="btn" data-act="lock" data-sv="unlock" data-e="${D.lock}">${P_icon('mdi:lock-open-variant', 15)}Auf</button>` : `<button class="btn pri" data-act="lock" data-sv="lock" data-e="${D.lock}">${P_icon('mdi:lock', 15)}Zu</button>`}${canOpen ? `<button class="btn sm" data-act="lock" data-sv="open" data-e="${D.lock}" aria-label="Öffnen">${P_icon('mdi:door-open', 16)}</button>` : ''}</div></div>`;
  }
  energy() {
    const E = this.c.energy, pv = this.n(E.pv) || 0, home = this.n(E.home) || 0, imp = this.n(E.grid_import) || 0, exp = this.n(E.grid_export) || 0, soc = this.n(E.battery_soc), bp = this.n(E.battery_power), day = this.n(E.pv_today);
    const kw = (w) => Math.abs(w) >= 1000 ? `${P_fmt(w / 1000, 1)} kW` : `${P_fmt(w, 0)} W`, mx = Math.max(pv, home, imp, exp, 1);
    const grid = exp > imp ? ['Einspeisung', exp, '#1baf7a'] : ['Netz', imp, '#e34948'];
    const row = (ic, n, v, col, pct) => `<div class="rw"><span style="color:${col}">${P_icon(ic, 15)}</span><span>${n}</span><b>${v}</b><div class="bar"><i style="width:${Math.min(100, Math.max(0, pct))}%;background:${col}"></i></div></div>`;
    const bst = bp == null ? '' : bp < -5 ? ' · lädt' : bp > 5 ? ' · entlädt' : '';
    return `<div class="t en ${E.path ? 'lnk' : ''}" ${E.path ? `data-act="nav" data-p="${P_esc(E.path)}"` : ''}><div class="h">${P_icon('mdi:lightning-bolt', 14)}Energie</div>
      <div class="big"><b>${kw(pv)}</b><span>Solar${day != null ? ` · ${P_fmt(day, 1)} kWh heute` : ''}</span></div>
      ${row('mdi:home-lightning-bolt', 'Haus', kw(home), '#3987e5', home / mx * 100)}
      ${row('mdi:transmission-tower', grid[0], kw(grid[1]), grid[2], grid[1] / mx * 100)}
      ${soc != null ? row('mdi:home-battery', 'Akku' + bst, `${P_fmt(soc, 0)} %`, '#1baf7a', soc) : ''}</div>`;
  }
  waste() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const parse = (v) => { if (!v) return null; const m = String(v).match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/); const d = m ? new Date(+m[3], +m[2] - 1, +m[1]) : new Date(v); return isNaN(d) ? null : d; };
    const COL = { 'mdi:trash-can': '#8a94a3', 'mdi:recycle': '#e2b400', 'mdi:leaf': '#4f9a5c', 'mdi:package-variant': '#3987e5' };
    const items = this.c.waste.map(w => { const s = this.s(w.entity), d = parse(s && s.state); return { ...w, d, days: d ? Math.round((d - today) / 864e5) : null }; })
      .sort((a, b) => (a.days ?? 999) - (b.days ?? 999));
    return `<div class="t full"><div class="h">${P_icon('mdi:calendar-month', 14)}Müllabfuhr</div><div class="ws">${items.map(w => {
      const when = w.days == null ? 'kein Termin' : w.days === 0 ? 'heute' : w.days === 1 ? 'morgen' : `in ${w.days} Tagen`;
      const dt = w.d ? w.d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' }) : '';
      const col = w.color || COL[w.icon] || '#8a94a3', soon = w.days != null && w.days <= this.c.waste_days;
      return `<div class="wi ${soon ? 'soon' : ''}" data-act="more" data-e="${w.entity}"><div class="ic" style="background:${col}2e;color:${col}">${P_icon(w.icon || 'mdi:trash-can', 18)}</div><div style="min-width:0"><div class="n">${P_esc(w.name)}</div><div class="s">${when}</div>${dt ? `<div class="s2">${dt}</div>` : ''}</div></div>`;
    }).join('')}</div></div>`;
  }
}
if (!customElements.get('handy-card')) customElements.define('handy-card', HandyCard);
window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === 'handy-card')) window.customCards.push({ type: 'handy-card', name: 'Handy-Karte', description: 'Kompakte Startseite fürs iPhone: Wetter, Haustür, Energie, Personen, Müll' });
