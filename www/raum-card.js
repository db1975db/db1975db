// Raum-Karte – eigene Lovelace-Karte im Stil der Wetterstation (v1.6.0)
const R_fmt = (v, d = 1) => (v == null || isNaN(v)) ? '–' : Number(v).toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
const R_icon = (i, s = 18) => `<ha-icon icon="${i}" style="--mdc-icon-size:${s}px;width:${s}px;height:${s}px"></ha-icon>`;
const R_esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const R_hue = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };

const R_CSS = `
:host{display:block;--r-surface:var(--ha-card-background,var(--card-background-color,#fff));--r-fg:var(--primary-text-color,#14191f);--r-fg2:var(--secondary-text-color,#5b6672);--r-line:var(--divider-color,rgba(0,0,0,.12));--r-acc:#3987e5;--r-warm:#ef8a3c;--r-ok:#1baf7a;--r-bad:#e34948}
*{box-sizing:border-box}
.wrap{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:16px;padding:4px 0 24px}
.wrap.pad{padding:max(16px,env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) max(14px,env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left))}
.full{grid-column:1/-1}.half{grid-column:span 6}
.hero{position:relative;border-radius:28px;overflow:hidden;color:#fff;min-height:300px;background:#0d1328;box-shadow:0 18px 40px rgba(0,0,0,.22)}
.glow{position:absolute;inset:-20%;filter:blur(60px);opacity:.95;transition:opacity 1.5s}
.glow i{position:absolute;width:45%;height:60%;border-radius:50%;animation:drift 22s ease-in-out infinite alternate;transition:background 1.5s}
.glow i:nth-child(2){animation-duration:28s;animation-delay:-6s}.glow i:nth-child(3){animation-duration:34s;animation-delay:-12s}.glow i:nth-child(4){animation-duration:26s;animation-delay:-3s}.glow i:nth-child(5){animation-duration:31s;animation-delay:-9s}
@keyframes drift{0%{transform:translate(0,0) scale(1)}50%{transform:translate(8%,-6%) scale(1.15)}100%{transform:translate(-6%,8%) scale(.95)}}
@media (prefers-reduced-motion:reduce){.glow i{animation:none}}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,10,24,.15),rgba(6,10,24,.55))}
.hin{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;padding:24px 26px 22px}
.loc{font-size:14px;opacity:.9;font-weight:500;display:flex;align-items:center;gap:6px}
.back{font:inherit;display:inline-flex;align-items:center;gap:2px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.28);color:#fff;border-radius:999px;padding:5px 13px 5px 6px;font-size:13.5px;font-weight:600;cursor:pointer;backdrop-filter:blur(6px);margin-bottom:10px}
.title{font-size:clamp(30px,5vw,44px);font-weight:650;letter-spacing:-.02em;margin:4px 0 2px}
.big{font-size:clamp(56px,9vw,92px);font-weight:200;line-height:1;letter-spacing:-.04em;font-variant-numeric:tabular-nums}
.big small{font-size:.34em;font-weight:400;letter-spacing:0;opacity:.85;margin-left:6px;vertical-align:.9em}
.sub{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:15px;opacity:.95;margin-top:6px}
.sub span{display:inline-flex;align-items:center;gap:4px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}
.chip{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.24);border-radius:999px;padding:4px 11px;font-size:12px;font-weight:600;backdrop-filter:blur(6px)}
.chip.warn{background:rgba(227,73,72,.55)}.chip.heat{background:rgba(239,138,60,.6)}
.dial{display:flex;flex-direction:column;align-items:center;gap:8px}
.dial svg{width:200px;height:200px}
.dial .row{display:flex;gap:8px;align-items:center}
.rb{font:inherit;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.16);color:#fff;border-radius:999px;min-width:40px;height:40px;padding:0 14px;font-size:15px;font-weight:650;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;backdrop-filter:blur(6px)}
.rb:hover{background:rgba(255,255,255,.26)}.rb.on{background:rgba(239,138,60,.75);border-color:transparent}
.rb:focus-visible,.btn:focus-visible,.lt:focus-visible,.sc:focus-visible{outline:2px solid var(--r-acc);outline-offset:2px}
.blk{background:var(--r-surface);color:var(--r-fg);border-radius:24px;padding:18px 20px;border:1px solid var(--r-line);min-width:0}
.bh{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.bh h2{margin:0;font-size:18px;font-weight:650;letter-spacing:-.01em;display:flex;align-items:center;gap:8px}
.bh p{margin:0;color:var(--r-fg2);font-size:13px}
.btn{font:inherit;font-size:13px;font-weight:600;border:1px solid var(--r-line);background:transparent;color:var(--r-fg);border-radius:999px;padding:6px 14px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.btn:hover{background:var(--r-line)}
.lights{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px}
.lt{position:relative;border-radius:20px;padding:14px;min-height:128px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;border:1px solid var(--r-line);background:var(--r-surface);cursor:pointer;overflow:hidden;transition:background .6s,box-shadow .6s,color .3s;text-align:left;font:inherit;color:var(--r-fg)}
.lt.on{color:#1d1206;border-color:transparent}
.lt .ic{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--r-line)}
.lt.on .ic{background:rgba(255,255,255,.55)}
.lt .n{font-weight:650;font-size:14.5px}.lt .s{font-size:12.5px;opacity:.75}
.lt input[type=range]{width:100%;margin:0;accent-color:#fff;cursor:pointer}
.lt:not(.on) input[type=range]{accent-color:var(--r-fg2)}
.scenes{display:flex;flex-wrap:wrap;gap:8px}
.sc{font:inherit;font-size:13px;font-weight:600;border:1px solid var(--r-line);background:var(--r-surface);color:var(--r-fg);border-radius:999px;padding:6px 14px 6px 6px;display:inline-flex;align-items:center;gap:8px;cursor:pointer}
.sc i{width:22px;height:22px;border-radius:50%;flex:none}
.sc.on{background:var(--r-fg);color:var(--r-surface);border-color:transparent}
.covers{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
.cv{display:grid;grid-template-columns:92px minmax(0,1fr);gap:14px;align-items:center}
.win{position:relative;height:118px;border-radius:12px;border:3px solid var(--r-fg2);overflow:hidden;background:linear-gradient(180deg,#9ad0ff,#e8f4ff)}
.win:after{content:"";position:absolute;left:50%;top:0;bottom:0;border-left:3px solid var(--r-fg2);opacity:.6}
.slats{position:absolute;left:0;right:0;top:0;background:repeating-linear-gradient(180deg,#8a95a3 0 7px,#6f7a88 7px 9px);transition:height 1s;z-index:1;box-shadow:0 2px 4px rgba(0,0,0,.3)}
.cv .n{font-weight:650}.cv .s{font-size:12.5px;color:var(--r-fg2);margin-bottom:8px}
.cv .row{display:flex;gap:6px;margin-top:8px}
.cv input[type=range]{width:100%;accent-color:var(--r-acc)}
.locks{display:flex;flex-direction:column;gap:12px}
.lk{display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px 16px;align-items:center}
.lk .lki{width:72px;height:72px;border-radius:22px;display:flex;align-items:center;justify-content:center;color:#fff;background:var(--lk);box-shadow:0 8px 22px color-mix(in srgb,var(--lk) 45%,transparent);cursor:pointer}
.lk .n{font-weight:650}.lk .v{font-size:22px;font-weight:650;color:var(--lk)}.lk .s{font-size:12.5px;color:var(--r-fg2);display:flex;align-items:center;gap:3px}
.lk .lkb{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px}
.media{display:flex;flex-direction:column;gap:10px}
.md{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid var(--r-line);border-radius:18px;padding:10px 12px}
.md .ic{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:var(--r-line)}
.md.on .ic{background:var(--r-acc);color:#fff}
.md .n{font-weight:650}.md .s{font-size:12.5px;color:var(--r-fg2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.md .ctl{display:flex;gap:6px;align-items:center}
.md .x{grid-column:2/-1;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.md .x input[type=range]{flex:1;min-width:120px;accent-color:var(--r-acc)}
.md select{font:inherit;font-size:13px;border:1px solid var(--r-line);border-radius:10px;padding:5px 8px;background:var(--r-surface);color:var(--r-fg);max-width:180px}
.ib{font:inherit;border:1px solid var(--r-line);background:transparent;color:var(--r-fg);border-radius:12px;width:38px;height:38px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
.ib:hover{background:var(--r-line)}.ib.on{background:var(--r-acc);color:#fff;border-color:transparent}
.pw{display:flex;flex-direction:column;gap:10px}
.pw .tot{display:flex;align-items:baseline;gap:6px}.pw .tot b{font-size:34px;font-weight:650;font-variant-numeric:tabular-nums}.pw .tot span{color:var(--r-fg2)}
.bar{display:flex;height:14px;border-radius:7px;overflow:hidden;background:var(--r-line);gap:2px}
.bar i{display:block;height:100%}
.pl{display:grid;grid-template-columns:12px minmax(0,1fr) auto;gap:8px;align-items:center;font-size:13.5px}
.pl i{width:12px;height:12px;border-radius:4px}.pl span:last-child{font-variant-numeric:tabular-nums;color:var(--r-fg2)}
.spark svg{display:block;width:100%;height:auto}
.ax{fill:var(--r-fg2);font-size:11px}.lb{fill:var(--r-fg);font-size:12px;font-weight:650}
.st{display:flex;flex-wrap:wrap;gap:8px}
.pill{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--r-line);border-radius:999px;padding:6px 12px;font-size:13px}
.pill.bad{border-color:var(--r-bad);color:var(--r-bad)}.pill.ok ha-icon{color:var(--r-ok)}
.msg{color:var(--r-fg2);font-size:13px}
@media (max-width:900px){.half{grid-column:1/-1}}
@media (max-width:640px){.hin{grid-template-columns:1fr;padding:20px 18px}.dial svg{width:170px;height:170px}.blk{padding:16px 14px}.lights{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;

class RaumCard extends HTMLElement {
  setConfig(c) {
    if (!c) throw new Error('Konfiguration fehlt');
    this.c = { lights: [], switches: [], sockets: [], covers: [], media: [], power: [], windows: [], batteries: [], locks: [], ...c };
  }
  getCardSize() { return 16; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  s(e) { return e && this._hass ? this._hass.states[e] : undefined; }
  n(e) { const s = this.s(e); const v = s ? parseFloat(s.state) : NaN; return isNaN(v) ? null : v; }
  call(d, sv, data) { return this._hass.callService(d, sv, data); }
  set hass(h) {
    this._hass = h;
    if (!this.root) this.build();
    const parts = { hero: this.kHero(), locks: this.kLocks(), lights: this.kLights(), sockets: this.kSockets(), scenes: this.kScenes(), covers: this.kCovers(), media: this.kMedia(), power: this.kPower(), status: this.kStatus() };
    for (const [k, v] of Object.entries(parts)) {
      if (this._k[k] === v) continue;
      if (this._busy === k) { this._dirty = true; continue; }
      this._k[k] = v; this['r_' + k]();
    }
    if (!this._histAt || Date.now() - this._histAt > 10 * 60e3) this.loadHist();
  }
  ks(list) { return list.map(e => { const s = this.s(e); return s ? s.state + JSON.stringify(s.attributes) : '-'; }).join('|'); }
  build() {
    this._k = {};
    this.root = this.attachShadow({ mode: 'open' });
    const c = this.c;
    this.root.innerHTML = `<style>${R_CSS}</style><div class="wrap ${c.inset === 'ipad' && /iPad/.test(navigator.userAgent) ? 'pad' : ''}">
      <div class="hero full" id="hero"><div class="glow" id="glow"><i></i><i></i><i></i><i></i><i></i></div><div class="shade"></div><div class="hin" id="hin"></div></div>
      ${c.lights.length || c.switches.length ? `<div class="blk full"><div class="bh"><h2>${R_icon('mdi:lightbulb-group', 20)}Licht</h2><div id="lact"></div></div><div class="lights" id="lights"></div></div>` : ''}
      ${c.sockets.length ? `<div class="blk full"><div class="bh"><h2>${R_icon(c.sockets_icon || 'mdi:power-socket-de', 20)}${R_esc(c.sockets_title || 'Steckdosen')}</h2></div><div class="lights" id="sockets"></div></div>` : ''}
      ${c.scene_select ? `<div class="blk full"><div class="bh"><h2>${R_icon('mdi:palette', 20)}Lichtszenen</h2><button class="btn" data-act="scmore" id="scmore"></button></div><div class="scenes" id="scenes"></div></div>` : ''}
      ${c.locks.length ? `<div class="blk half"><div class="bh"><h2>${R_icon('mdi:lock-smart', 20)}Türschloss</h2></div><div class="locks" id="locks"></div></div>` : ''}
      ${c.covers.length ? `<div class="blk half"><div class="bh"><h2>${R_icon('mdi:window-shutter', 20)}Rollläden</h2><div style="display:flex;gap:6px"><button class="btn" data-act="covall" data-sv="open_cover">${R_icon('mdi:arrow-up', 16)}Alle auf</button><button class="btn" data-act="covall" data-sv="close_cover">${R_icon('mdi:arrow-down', 16)}Alle zu</button></div></div><div class="covers" id="covers"></div></div>` : ''}
      ${c.media.length ? `<div class="blk half"><div class="bh"><h2>${R_icon('mdi:television-play', 20)}Medien</h2></div><div class="media" id="media"></div></div>` : ''}
      ${c.power.length ? `<div class="blk half"><div class="bh"><h2>${R_icon('mdi:lightning-bolt', 20)}Strom jetzt</h2><p>Leistung der Messsteckdosen</p></div><div class="pw" id="power"></div></div>` : ''}
      ${c.temperature ? `<div class="blk half"><div class="bh"><h2>${R_icon('mdi:chart-bell-curve', 20)}Raumklima · 24 h</h2><p id="histsub"></p></div><div class="spark" id="spark"><div class="msg">Lade Verlauf …</div></div></div>` : ''}
      ${c.windows.length || c.batteries.length ? `<div class="blk full"><div class="bh"><h2>${R_icon('mdi:shield-check-outline', 20)}Status</h2></div><div class="st" id="status"></div></div>` : ''}
    </div>`;
    this.$ = (id) => this.root.getElementById(id);
    const R = this.root;
    R.addEventListener('click', (ev) => this.onClick(ev));
    R.addEventListener('pointerdown', (ev) => { const t = ev.target.closest('[data-busy]'); if (t) this._busy = t.dataset.busy; });
    R.addEventListener('input', (ev) => { const t = ev.target; if (t.dataset.live) { const o = R.getElementById(t.dataset.live); if (o) o.textContent = t.value + (t.dataset.unit || ''); } });
    R.addEventListener('change', (ev) => this.onChange(ev));
    const ro = new ResizeObserver(() => { const el = this.$('spark'); if (el && this._hist && Math.abs(el.clientWidth - (this._sw || 0)) > 8) this.r_hist(); });
    if (this.$('spark')) ro.observe(this.$('spark'));
  }
  release() { const was = this._busy; this._busy = null; if (this._dirty && was) { this._dirty = false; this._k[was] = null; this.hass = this._hass; } }
  onClick(ev) {
    const t = ev.target.closest('[data-act]'); if (!t || t.tagName === 'INPUT' || t.tagName === 'SELECT') return;
    if (ev.target.closest('input,select')) return;
    const a = t.dataset.act, e = t.dataset.e;
    if (a === 'back') { const p = this.c.back.startsWith('/') ? this.c.back : `${this.c.base_path || ''}/${this.c.back}`; history.pushState(null, '', p); window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } })); return; }
    if (a === 'toggle') this.call(e.split('.')[0], 'toggle', { entity_id: e });
    else if (a === 'alloff') this.call('homeassistant', 'turn_off', { entity_id: [...this.c.lights.map(x => x.entity), ...this.c.switches.filter(x => !x.keep).map(x => x.entity)] });
    else if (a === 'scene') this.call('select', 'select_option', { entity_id: this.c.scene_select, option: t.dataset.o });
    else if (a === 'scmore') { this._scAll = !this._scAll; this.r_scenes(); }
    else if (a === 'lock') { const sv = t.dataset.sv; if (sv !== 'lock' && !window.confirm(sv === 'open' ? 'Tür wirklich öffnen?' : 'Tür wirklich aufschließen?')) return; this.call('lock', sv, { entity_id: e }); }
    else if (a === 'cov') this.call('cover', t.dataset.sv, { entity_id: e });
    else if (a === 'covall') this.call('cover', t.dataset.sv, { entity_id: this.c.covers.map(x => x.entity) });
    else if (a === 'temp') { const s = this.s(this.c.climate), st = s.attributes.target_temp_step || 0.5; const v = Math.round(((this._tgt ?? s.attributes.temperature) + st * +t.dataset.d) * 2) / 2; this._tgt = Math.min(s.attributes.max_temp, Math.max(s.attributes.min_temp, v)); this.r_hero(); clearTimeout(this._tt); this._tt = setTimeout(() => { this.call('climate', 'set_temperature', { entity_id: this.c.climate, temperature: this._tgt }); setTimeout(() => { this._tgt = null; }, 4000); }, 900); }
    else if (a === 'hvac') { const s = this.s(this.c.climate); this.call('climate', 'set_hvac_mode', { entity_id: this.c.climate, hvac_mode: s.state === 'off' ? (s.attributes.hvac_modes.find(m => m !== 'off') || 'heat') : 'off' }); }
    else if (a === 'mp') this.call('media_player', t.dataset.sv, { entity_id: e });
    else if (a === 'more') this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: e } }));
  }
  onChange(ev) {
    const t = ev.target, a = t.dataset.act, e = t.dataset.e;
    if (a === 'bri') this.call('light', 'turn_on', { entity_id: e, brightness_pct: +t.value });
    else if (a === 'pos') this.call('cover', 'set_cover_position', { entity_id: e, position: +t.value });
    else if (a === 'vol') this.call('media_player', 'volume_set', { entity_id: e, volume_level: +t.value / 100 });
    else if (a === 'src') this.call('media_player', 'select_source', { entity_id: e, source: t.value });
    setTimeout(() => this.release(), 600);
  }
  lightColor(s) {
    if (!s || s.state !== 'on') return null;
    const a = s.attributes;
    if (a.rgb_color) return a.rgb_color;
    if (a.color_temp_kelvin) { const k = a.color_temp_kelvin; return k < 3000 ? [255, 180, 107] : k < 4500 ? [255, 214, 170] : [235, 240, 255]; }
    return [255, 196, 122];
  }
  // ---------- Hero ----------
  kHero() { const c = this.c; return this.ks([c.temperature, c.humidity, c.climate, c.scene_select, ...c.windows, ...c.lights.map(x => x.entity), ...c.media.map(x => x.entity), ...c.power.map(x => x.entity)]) + (this._tgt ?? ''); }
  r_hero() {
    const c = this.c, cl0 = this.s(c.climate), cl = cl0 && !['unavailable', 'unknown'].includes(cl0.state) ? cl0 : null, t = this.n(c.temperature) ?? (cl && cl.attributes.current_temperature), hum = this.n(c.humidity) ?? (cl && cl.attributes.current_humidity);
    const cols = c.lights.map(x => ({ rgb: this.lightColor(this.s(x.entity)), b: (this.s(x.entity) || { attributes: {} }).attributes.brightness || 200 })).filter(x => x.rgb);
    const blobs = this.$('glow').children, pos = [[5, 0], [50, -5], [20, 45], [60, 40], [35, 15]];
    for (let i = 0; i < blobs.length; i++) {
      const L = cols[i % (cols.length || 1)];
      blobs[i].style.left = pos[i][0] + '%'; blobs[i].style.top = pos[i][1] + '%';
      blobs[i].style.background = L ? `radial-gradient(circle,rgba(${L.rgb.join(',')},${0.55 + 0.45 * L.b / 255}) 0%,rgba(${L.rgb.join(',')},0) 70%)` : (i < 2 ? 'radial-gradient(circle,rgba(70,90,170,.55) 0%,rgba(70,90,170,0) 70%)' : 'none');
    }
    const chips = [], ch = (i, s, k = '') => chips.push(`<span class="chip ${k}">${R_icon(i, 15)}${s}</span>`);
    const onL = c.lights.filter(x => (this.s(x.entity) || {}).state === 'on').length;
    if (c.lights.length) ch(onL ? 'mdi:lightbulb-on' : 'mdi:lightbulb-off-outline', onL ? `${onL} von ${c.lights.length} Lichtern an` : 'Licht aus');
    const sc = this.s(c.scene_select); if (sc && onL) ch('mdi:palette', R_esc(sc.state));
    c.locks.forEach(l => { const s = this.s(l.entity); if (s && ['unlocked', 'open', 'jammed'].includes(s.state)) ch(s.state === 'jammed' ? 'mdi:lock-alert' : 'mdi:lock-open-variant', `${l.name || 'Tür'} ${s.state === 'jammed' ? 'klemmt' : s.state === 'open' ? 'offen' : 'aufgeschlossen'}`, 'warn'); });
    const open = c.windows.filter(w => (this.s(w.entity) || {}).state === 'on'); if (open.length) ch('mdi:window-open-variant', open.map(w => w.name).join(', ') + ' offen', 'warn');
    if (cl && cl.attributes.hvac_action === 'heating') ch('mdi:fire', 'heizt', 'heat');
    c.media.forEach(m => { const s = this.s(m.entity); if (s && ['on', 'playing'].includes(s.state) && m.chip !== false) ch(m.icon || 'mdi:play', `${m.name} ${s.state === 'playing' ? 'spielt' : 'an'}`); });
    const pw = c.power.reduce((a, p) => a + (this.n(p.entity) || 0), 0); if (c.power.length) ch('mdi:flash', `${R_fmt(pw, 0)} W`);
    if (hum != null && hum >= 65) ch('mdi:water-alert', 'Lüften empfohlen', 'warn');
    let dial = '';
    if (cl) {
      const A = cl.attributes, tgt = this._tgt ?? A.temperature, lo = Math.max(A.min_temp, 12), hi = Math.min(A.max_temp, 28);
      const ang = (v) => -135 + 270 * (Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo), P = (a, r) => [100 + r * Math.sin(a * Math.PI / 180), 100 - r * Math.cos(a * Math.PI / 180)];
      const arc = (a0, a1, r) => { const [x0, y0] = P(a0, r), [x1, y1] = P(a1, r); return `M${x0.toFixed(1)},${y0.toFixed(1)}A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)},${y1.toFixed(1)}`; };
      const off = cl.state === 'off', at = ang(tgt), [kx, ky] = P(at, 80), [cx, cy] = P(ang(A.current_temperature), 80);
      dial = `<div class="dial"><svg viewBox="0 0 200 200" role="img" aria-label="Thermostat"><defs><linearGradient id="tg" x1="0" x2="1"><stop offset="0" stop-color="#5fb3ff"/><stop offset=".5" stop-color="#ffc25e"/><stop offset="1" stop-color="#ff5a3c"/></linearGradient></defs>
        <path d="${arc(-135, 135, 80)}" stroke="rgba(255,255,255,.18)" stroke-width="14" fill="none" stroke-linecap="round"/>
        ${off ? '' : `<path d="${arc(-135, Math.max(at, -134), 80)}" stroke="url(#tg)" stroke-width="14" fill="none" stroke-linecap="round"/>`}
        <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4" fill="#fff" opacity=".7"/>
        <circle cx="${kx.toFixed(1)}" cy="${ky.toFixed(1)}" r="11" fill="#fff" stroke="rgba(0,0,0,.2)"/>
        <text x="100" y="92" text-anchor="middle" fill="#fff" font-size="11" opacity=".8">${off ? 'Heizung aus' : A.hvac_action === 'heating' ? 'heizt auf' : 'Soll'}</text>
        <text x="100" y="124" text-anchor="middle" fill="#fff" font-size="36" font-weight="300">${off ? '–' : R_fmt(tgt)}<tspan font-size="14" dy="-14">°</tspan></text>
        <text x="100" y="146" text-anchor="middle" fill="#fff" font-size="11" opacity=".8">Ist ${R_fmt(A.current_temperature)} °C</text></svg>
        <div class="row"><button class="rb" data-act="temp" data-d="-1" aria-label="Kälter">${R_icon('mdi:minus', 18)}</button><button class="rb ${off ? '' : 'on'}" data-act="hvac">${R_icon('mdi:power', 16)}${off ? 'Aus' : 'Heizen'}</button><button class="rb" data-act="temp" data-d="1" aria-label="Wärmer">${R_icon('mdi:plus', 18)}</button></div></div>`;
    }
    this.$('hin').innerHTML = `<div>
      ${c.back ? `<button class="back" data-act="back">${R_icon('mdi:chevron-left', 20)}${R_esc(c.back_label || 'Zurück')}</button>` : ''}
      <div class="loc">${R_icon(c.icon || 'mdi:sofa', 16)}${R_esc(c.floor || 'Raum')}</div>
      <div class="title">${R_esc(c.name || 'Raum')}</div>
      <div class="big">${R_fmt(t)}<small>°C</small></div>
      <div class="sub">${hum != null ? `<span>${R_icon('mdi:water-percent', 16)}${R_fmt(hum, 0)} % Feuchte</span>` : ''}${cl ? `<span>${R_icon('mdi:thermostat', 16)}Soll ${R_fmt(cl.attributes.temperature)} °C</span>` : ''}</div>
      <div class="chips">${chips.join('')}</div></div>${dial}`;
  }
  // ---------- Licht ----------
  kLights() { return this.ks([...this.c.lights.map(x => x.entity), ...this.c.lights.map(x => x.socket), ...this.c.switches.map(x => x.entity), ...this.c.switches.map(x => x.power)]); }
  kSockets() { return this.ks([...this.c.sockets.map(x => x.entity), ...this.c.sockets.map(x => x.power)]); }
  r_sockets() { const el = this.$('sockets'); if (!el) return; el.innerHTML = this.c.sockets.map(x => this.swTile(x)).join(''); this.keyNav(el); }
  r_lights() {
    const el = this.$('lights'); if (!el) return;
    const any = [...this.c.lights, ...this.c.switches.filter(x => !x.keep)].some(x => (this.s(x.entity) || {}).state === 'on');
    this.$('lact').innerHTML = any ? `<button class="btn" data-act="alloff">${R_icon('mdi:power', 16)}Alles aus</button>` : '';
    const tiles = this.c.lights.map(x => {
      const s = this.s(x.entity); if (!s) return '';
      const so = x.socket && this.s(x.socket);
      if (so && so.state !== 'on') return `<div class="lt" data-act="toggle" data-e="${x.socket}" role="button" tabindex="0" aria-pressed="false">
        <div class="ic">${R_icon(x.icon || 'mdi:lightbulb-outline', 22)}</div>
        <div><div class="n">${R_esc(x.name || s.attributes.friendly_name)}</div><div class="s">Steckdose aus · tippen zum Einschalten</div></div></div>`;
      const on = s.state === 'on', rgb = this.lightColor(s), pct = on && s.attributes.brightness ? Math.round(s.attributes.brightness / 2.55) : 0;
      const dim = (s.attributes.supported_color_modes || []).some(m => m !== 'onoff');
      const bg = on ? `background:linear-gradient(150deg,rgba(${rgb.join(',')},1) 0%,rgba(${rgb.join(',')},${0.45 + 0.4 * pct / 100}) 100%);box-shadow:0 10px 28px rgba(${rgb.join(',')},.45)` : '';
      return `<div class="lt ${on ? 'on' : ''}" style="${bg}" data-act="toggle" data-e="${x.entity}" role="button" tabindex="0" aria-pressed="${on}">
        <div class="ic">${R_icon(x.icon || (on ? 'mdi:lightbulb-on' : 'mdi:lightbulb-outline'), 22)}</div>
        <div><div class="n">${R_esc(x.name || s.attributes.friendly_name)}</div><div class="s" id="lv-${x.entity.replace(/\W/g, '')}">${on ? (dim ? pct + ' %' : 'an') : s.state === 'unavailable' ? 'nicht erreichbar' : 'aus'}</div></div>
        ${dim ? `<input type="range" min="1" max="100" value="${pct || 1}" data-act="bri" data-e="${x.entity}" data-busy="lights" data-live="lv-${x.entity.replace(/\W/g, '')}" data-unit=" %" aria-label="Helligkeit ${R_esc(x.name)}">` : ''}</div>`;
    });
    el.innerHTML = tiles.join('') + this.c.switches.map(x => this.swTile(x)).join('');
    this.keyNav(el);
  }
  keyNav(el) { el.querySelectorAll('.lt[role=button]').forEach(n => n.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); n.click(); } })); }
  swTile(x) {
      const s = this.s(x.entity); if (!s) return '';
      const on = s.state === 'on', w = this.n(x.power);
      return `<div class="lt ${on ? 'on' : ''}" style="${on ? 'background:linear-gradient(150deg,#ffd27a,#f6a94a);box-shadow:0 10px 28px rgba(246,169,74,.4)' : ''}" data-act="toggle" data-e="${x.entity}" role="button" tabindex="0" aria-pressed="${on}">
        <div class="ic">${R_icon(x.icon || 'mdi:power-socket-de', 22)}</div>
        <div><div class="n">${R_esc(x.name)}</div><div class="s">${on ? 'an' : s.state === 'unavailable' ? 'nicht erreichbar' : 'aus'}${w != null ? ` · ${R_fmt(w, w < 10 ? 1 : 0)} W` : ''}</div></div></div>`;
  }
  // ---------- Szenen ----------
  kScenes() { return this.ks([this.c.scene_select]) + this._scAll; }
  r_scenes() {
    const el = this.$('scenes'), s = this.s(this.c.scene_select); if (!el || !s) return;
    const fav = this.c.scene_favorites || [], opts = s.attributes.options || [];
    let list = [...fav.filter(f => opts.includes(f)), ...opts.filter(o => !fav.includes(o))];
    const N = 12, more = list.length > N;
    if (!this._scAll && more) { list = list.slice(0, N); if (!list.includes(s.state) && opts.includes(s.state)) list[N - 1] = s.state; }
    this.$('scmore').hidden = !more; this.$('scmore').textContent = this._scAll ? 'Weniger' : `Alle ${opts.length} anzeigen`;
    el.innerHTML = list.map(o => { const h = R_hue(o); return `<button class="sc ${o === s.state ? 'on' : ''}" data-act="scene" data-o="${R_esc(o)}"><i style="background:conic-gradient(from 40deg,hsl(${h} 75% 62%),hsl(${(h + 70) % 360} 80% 60%),hsl(${(h + 150) % 360} 70% 55%),hsl(${h} 75% 62%))"></i>${R_esc(o)}</button>`; }).join('');
  }
  // ---------- Rollläden ----------
  kLocks() { return this.ks([...this.c.locks.map(x => x.entity), ...this.c.locks.map(x => x.battery)]); }
  r_locks() {
    const el = this.$('locks'); if (!el) return;
    const ST = { locked: ['verriegelt', 'mdi:lock', '#1baf7a'], unlocked: ['entriegelt', 'mdi:lock-open-variant', '#ef8a3c'], open: ['offen', 'mdi:door-open', '#ef8a3c'], opening: ['öffnet …', 'mdi:door-open', '#ef8a3c'], locking: ['verriegelt …', 'mdi:lock-clock', '#3987e5'], unlocking: ['entriegelt …', 'mdi:lock-clock', '#3987e5'], jammed: ['klemmt!', 'mdi:lock-alert', '#e34948'], unavailable: ['nicht erreichbar', 'mdi:lock-off-outline', '#8a94a3'] };
    el.innerHTML = this.c.locks.map(x => {
      const s = this.s(x.entity); if (!s) return '';
      const [txt, ic, col] = ST[s.state] || [s.state, 'mdi:lock-question', '#8a94a3'], b = this.n(x.battery), canOpen = (s.attributes.supported_features || 0) & 1;
      return `<div class="lk" style="--lk:${col}"><div class="lki" data-act="more" data-e="${x.entity}">${R_icon(ic, 34)}</div>
        <div class="lkt"><div class="n">${R_esc(x.name || s.attributes.friendly_name)}</div><div class="v">${txt}</div>${b != null ? `<div class="s">${R_icon(b > 20 ? 'mdi:battery' : 'mdi:battery-alert', 14)} ${R_fmt(b, 0)} %</div>` : ''}</div>
        <div class="lkb"><button class="btn" data-act="lock" data-sv="lock" data-e="${x.entity}">${R_icon('mdi:lock', 16)}Abschließen</button><button class="btn" data-act="lock" data-sv="unlock" data-e="${x.entity}">${R_icon('mdi:lock-open-variant', 16)}Aufschließen</button>${canOpen ? `<button class="btn" data-act="lock" data-sv="open" data-e="${x.entity}">${R_icon('mdi:door-open', 16)}Öffnen</button>` : ''}</div></div>`;
    }).join('');
  }
  kCovers() { return this.ks(this.c.covers.map(x => x.entity)); }
  r_covers() {
    const el = this.$('covers'); if (!el) return;
    el.innerHTML = this.c.covers.map(x => {
      const s = this.s(x.entity); if (!s) return '';
      const p = s.attributes.current_position ?? (s.state === 'open' ? 100 : 0), mv = s.state === 'opening' ? 'fährt hoch' : s.state === 'closing' ? 'fährt runter' : p >= 99 ? 'offen' : p <= 1 ? 'geschlossen' : `${p} % offen`;
      return `<div class="cv"><div class="win"><div class="slats" style="height:${100 - p}%"></div></div><div>
        <div class="n">${R_esc(x.name)}</div><div class="s" id="cp-${x.entity.replace(/\W/g, '')}">${mv}</div>
        <input type="range" min="0" max="100" step="5" value="${p}" data-act="pos" data-e="${x.entity}" data-busy="covers" data-live="cp-${x.entity.replace(/\W/g, '')}" data-unit=" % offen" aria-label="Position ${R_esc(x.name)}">
        <div class="row"><button class="ib" data-act="cov" data-sv="open_cover" data-e="${x.entity}" aria-label="Öffnen">${R_icon('mdi:arrow-up')}</button><button class="ib" data-act="cov" data-sv="stop_cover" data-e="${x.entity}" aria-label="Stopp">${R_icon('mdi:stop')}</button><button class="ib" data-act="cov" data-sv="close_cover" data-e="${x.entity}" aria-label="Schließen">${R_icon('mdi:arrow-down')}</button></div></div></div>`;
    }).join('');
  }
  // ---------- Medien ----------
  kMedia() { return this.ks(this.c.media.map(x => x.entity)); }
  r_media() {
    const el = this.$('media'); if (!el) return;
    el.innerHTML = this.c.media.map(x => {
      const s = this.s(x.entity); if (!s) return '';
      const A = s.attributes, on = !['off', 'standby', 'unavailable', 'unknown'].includes(s.state), pl = s.state === 'playing';
      const st = { on: 'an', off: 'aus', playing: 'spielt', paused: 'pausiert', idle: 'bereit', standby: 'Standby', unavailable: 'nicht erreichbar' }[s.state] || s.state;
      const info = [st, A.media_title, A.source].filter(Boolean).map(R_esc).join(' · ');
      const vol = A.volume_level != null ? Math.round(A.volume_level * 100) : null, id = 'mv-' + x.entity.replace(/\W/g, '');
      return `<div class="md ${on ? 'on' : ''}"><div class="ic">${R_icon(x.icon || 'mdi:speaker', 22)}</div>
        <div style="min-width:0"><div class="n">${R_esc(x.name)}</div><div class="s">${info}</div></div>
        <div class="ctl">${x.play !== false && on ? `<button class="ib" data-act="mp" data-sv="media_play_pause" data-e="${x.entity}" aria-label="Play/Pause">${R_icon(pl ? 'mdi:pause' : 'mdi:play')}</button>` : ''}${x.power !== false ? `<button class="ib ${on ? 'on' : ''}" data-act="mp" data-sv="toggle" data-e="${x.entity}" aria-label="Ein/Aus">${R_icon('mdi:power')}</button>` : ''}</div>
        ${on && (vol != null || (x.sources && A.source_list)) ? `<div class="x">${vol != null ? `${R_icon('mdi:volume-medium', 18)}<input type="range" min="0" max="100" value="${vol}" data-act="vol" data-e="${x.entity}" data-busy="media" data-live="${id}" data-unit=" %" aria-label="Lautstärke ${R_esc(x.name)}"><span id="${id}" class="s" style="min-width:42px">${vol} %</span>` : ''}
          ${x.sources && A.source_list ? `<select data-act="src" data-e="${x.entity}" data-busy="media" aria-label="Quelle">${['', ...(x.sources === true ? A.source_list : x.sources)].map(o => `<option ${o === A.source ? 'selected' : ''} value="${R_esc(o)}">${o ? R_esc(o) : 'Quelle …'}</option>`).join('')}</select>` : ''}</div>` : ''}</div>`;
    }).join('');
  }
  // ---------- Strom ----------
  kPower() { return this.ks(this.c.power.map(x => x.entity)); }
  r_power() {
    const el = this.$('power'); if (!el) return;
    const COL = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#6250d6'];
    const rows = this.c.power.map((x, i) => ({ ...x, w: Math.max(0, this.n(x.entity) || 0), col: COL[i % COL.length] })), tot = rows.reduce((a, r) => a + r.w, 0);
    el.innerHTML = `<div class="tot"><b>${R_fmt(tot, 0)}</b><span>W gesamt</span></div>
      <div class="bar">${tot > 0 ? rows.filter(r => r.w > 0).map(r => `<i style="width:${r.w / tot * 100}%;background:${r.col}" title="${R_esc(r.name)}"></i>`).join('') : ''}</div>
      ${rows.map(r => `<div class="pl"><i style="background:${r.col}"></i><span>${R_esc(r.name)}</span><span>${R_fmt(r.w, r.w < 10 ? 1 : 0)} W</span></div>`).join('')}`;
  }
  // ---------- Status ----------
  kStatus() { return this.ks([...this.c.windows.map(x => x.entity), ...this.c.batteries.map(x => x.entity)]); }
  r_status() {
    const el = this.$('status'); if (!el) return;
    const w = this.c.windows.map(x => { const s = this.s(x.entity), o = s && s.state === 'on'; return `<span class="pill ${o ? 'bad' : 'ok'}">${R_icon(o ? 'mdi:window-open-variant' : 'mdi:window-closed-variant', 16)}${R_esc(x.name)} ${o ? 'offen' : 'zu'}</span>`; });
    const b = this.c.batteries.map(x => { const v = this.n(x.entity), low = v != null && v <= 20; return `<span class="pill ${low ? 'bad' : 'ok'}">${R_icon(v == null ? 'mdi:battery-unknown' : low ? 'mdi:battery-alert' : v > 80 ? 'mdi:battery' : 'mdi:battery-50', 16)}${R_esc(x.name)} ${R_fmt(v, 0)} %</span>`; });
    el.innerHTML = [...w, ...b].join('');
  }
  // ---------- Klimaverlauf ----------
  async loadHist() {
    this._histAt = Date.now(); const c = this.c; if (!c.temperature || !this.$('spark')) return;
    try {
      const now = new Date(), st = new Date(now - 24 * 36e5), ids = [c.temperature, c.humidity].filter(Boolean);
      const r = await this._hass.callWS({ type: 'history/history_during_period', start_time: st.toISOString(), end_time: now.toISOString(), entity_ids: ids, minimal_response: true, no_attributes: true });
      const conv = (a) => (a || []).map(x => [x.lu != null ? x.lu * 1000 : Date.parse(x.last_updated), parseFloat(x.s != null ? x.s : x.state)]).filter(x => !isNaN(x[1]));
      this._hist = { t: conv(r[c.temperature]), h: conv(r[c.humidity]), from: st.getTime(), to: now.getTime() };
      this.r_hist();
    } catch (err) { this.$('spark').innerHTML = `<div class="msg">Verlauf nicht verfügbar: ${R_esc(err && err.message || err)}</div>`; }
  }
  r_hist() {
    const el = this.$('spark'), H = this._hist; if (!el || !H) return;
    const W = Math.max(el.clientWidth || 500, 260); this._sw = W;
    const top = 16, ph = 110, gap = 30, ph2 = 60, B = 22, HT = top + ph + gap + ph2 + B, L = 34, Rr = 8;
    const x = (t) => L + (W - L - Rr) * (t - H.from) / (H.to - H.from);
    const line = (pts, y) => pts.length ? 'M' + pts.map(p => `${x(Math.max(p[0], H.from)).toFixed(1)},${y(p[1]).toFixed(1)}`).join('L') + `L${x(H.to).toFixed(1)},${y(pts[pts.length - 1][1]).toFixed(1)}` : '';
    let s = '';
    if (H.t.length) {
      const v = H.t.map(p => p[1]), lo = Math.floor(Math.min(...v) - 0.5), hi = Math.ceil(Math.max(...v) + 0.5), y = (q) => top + ph * (1 - (q - lo) / (hi - lo));
      for (let q = lo; q <= hi; q++) if ((hi - lo) <= 6 || q % 2 === 0) s += `<line x1="${L}" x2="${W - Rr}" y1="${y(q)}" y2="${y(q)}" stroke="var(--r-line)"/><text x="${L - 6}" y="${y(q) + 4}" text-anchor="end" class="ax">${q}°</text>`;
      const d = line(H.t, y);
      s += `<defs><linearGradient id="tf" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ef8a3c" stop-opacity=".35"/><stop offset="1" stop-color="#ef8a3c" stop-opacity="0"/></linearGradient></defs>`;
      s += `<path d="${d}L${x(H.to)},${top + ph}L${x(Math.max(H.t[0][0], H.from))},${top + ph}Z" fill="url(#tf)"/><path d="${d}" fill="none" stroke="#ef8a3c" stroke-width="2.2"/>`;
      const mx = H.t.reduce((a, p) => p[1] > a[1] ? p : a), mn = H.t.reduce((a, p) => p[1] < a[1] ? p : a);
      s += `<text x="${Math.min(x(mx[0]), W - 60)}" y="${y(mx[1]) - 6}" class="lb">↑ ${R_fmt(mx[1])}°</text><text x="${Math.min(x(mn[0]), W - 60)}" y="${y(mn[1]) + 16}" class="lb">↓ ${R_fmt(mn[1])}°</text>`;
    }
    if (H.h.length) {
      const y2 = (q) => top + ph + gap + ph2 * (1 - (Math.min(80, Math.max(20, q)) - 20) / 60), d = line(H.h, y2);
      [40, 60].forEach(q => s += `<line x1="${L}" x2="${W - Rr}" y1="${y2(q)}" y2="${y2(q)}" stroke="var(--r-line)" stroke-dasharray="3 4"/><text x="${L - 6}" y="${y2(q) + 4}" text-anchor="end" class="ax">${q}%</text>`);
      s += `<rect x="${L}" y="${y2(60)}" width="${W - L - Rr}" height="${y2(40) - y2(60)}" fill="#1baf7a" opacity=".08"/><path d="${d}" fill="none" stroke="#3987e5" stroke-width="2"/>`;
      s += `<text x="${L}" y="${top + ph + gap - 6}" class="ax">Luftfeuchte · grün = Wohlfühlbereich 40–60 %</text>`;
    }
    for (let k = 0; k <= 4; k++) { const t = H.from + k * (H.to - H.from) / 4; s += `<text x="${x(t)}" y="${HT - 6}" text-anchor="${k === 0 ? 'start' : k === 4 ? 'end' : 'middle'}" class="ax">${new Date(t).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</text>`; }
    el.innerHTML = `<svg width="${W}" height="${HT}" viewBox="0 0 ${W} ${HT}">${s}</svg>`;
    const sub = this.$('histsub'); if (sub && H.t.length) { const v = H.t.map(p => p[1]); sub.textContent = `${R_fmt(Math.min(...v))} bis ${R_fmt(Math.max(...v))} °C`; }
  }
}
if (!customElements.get('raum-card')) customElements.define('raum-card', RaumCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'raum-card', name: 'Raum-Karte', description: 'Raumansicht mit Lichtstimmung, Thermostat, Szenen, Rollläden, Medien und Strom' });
