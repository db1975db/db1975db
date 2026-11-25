// Haus-Karte – Startseite im Stil der Wetterstation (v0.2.0, Entwurf)
const H_fmt = (v, d = 1) => (v == null || isNaN(v)) ? '–' : Number(v).toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
const H_icon = (i, s = 18) => `<ha-icon icon="${i}" style="--mdc-icon-size:${s}px;width:${s}px;height:${s}px"></ha-icon>`;
const H_esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const H_COND = { 'clear-night': ['Klare Nacht', 'mdi:weather-night'], cloudy: ['Bewölkt', 'mdi:weather-cloudy'], exceptional: ['Unwetter', 'mdi:alert'], fog: ['Nebel', 'mdi:weather-fog'], hail: ['Hagel', 'mdi:weather-hail'], lightning: ['Gewitter', 'mdi:weather-lightning'], 'lightning-rainy': ['Gewitter mit Regen', 'mdi:weather-lightning-rainy'], partlycloudy: ['Teilweise bewölkt', 'mdi:weather-partly-cloudy'], pouring: ['Starkregen', 'mdi:weather-pouring'], rainy: ['Regen', 'mdi:weather-rainy'], snowy: ['Schnee', 'mdi:weather-snowy'], 'snowy-rainy': ['Schneeregen', 'mdi:weather-snowy-rainy'], sunny: ['Sonnig', 'mdi:weather-sunny'], windy: ['Windig', 'mdi:weather-windy'], 'windy-variant': ['Windig', 'mdi:weather-windy-variant'] };
const H_MOWER = { mowing: 'mäht', docked: 'in der Station', paused: 'pausiert', returning: 'fährt zurück', error: 'Fehler', idle: 'bereit' };

const H_CSS = `
:host{display:block;--h-surface:var(--ha-card-background,var(--card-background-color,#fff));--h-fg:var(--primary-text-color,#14191f);--h-fg2:var(--secondary-text-color,#5b6672);--h-line:var(--divider-color,rgba(0,0,0,.12));--h-acc:#3987e5;--h-warm:#ef8a3c;--h-ok:#1baf7a;--h-bad:#e34948;--h-sun:#f4b400}
*{box-sizing:border-box}
.wrap{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:16px;padding:4px 0 24px}
.full{grid-column:1/-1}.half{grid-column:span 6}
.hero{position:relative;border-radius:28px;overflow:hidden;color:#fff;min-height:280px;box-shadow:0 18px 40px rgba(0,0,0,.22);cursor:pointer;transition:background 2s}
.sky{position:absolute;inset:0;overflow:hidden}
.cl{position:absolute;border-radius:50%;background:rgba(255,255,255,.55);filter:blur(28px);animation:float 60s linear infinite}
@keyframes float{from{transform:translateX(-30%)}to{transform:translateX(130%)}}
.star{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;animation:tw 4s ease-in-out infinite}
@keyframes tw{0%,100%{opacity:.2}50%{opacity:1}}
.drop{position:absolute;top:-10%;width:1.5px;height:14px;background:linear-gradient(transparent,rgba(255,255,255,.7));animation:fall 1s linear infinite}
@keyframes fall{to{transform:translateY(340px)}}
.orb{position:absolute;border-radius:50%}
@media (prefers-reduced-motion:reduce){.cl,.star,.drop{animation:none}}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,10,24,.05),rgba(6,10,24,.5))}
.hin{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;padding:24px 26px 22px;align-items:end}
.greet{font-size:15px;opacity:.92;font-weight:500}
.title{font-size:clamp(30px,5vw,44px);font-weight:650;letter-spacing:-.02em;margin:2px 0 10px}
.wx{display:flex;align-items:center;gap:14px}
.big{font-size:clamp(54px,9vw,86px);font-weight:200;line-height:1;letter-spacing:-.03em;white-space:nowrap}
.big small{font-size:.34em;font-weight:400;letter-spacing:0;opacity:.85;margin-left:4px;vertical-align:.9em}
.cond{font-size:17px;font-weight:600}.cond div{font-size:13.5px;font-weight:400;opacity:.9;margin-top:3px}
.sub{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:14px;opacity:.95;margin-top:10px}
.sub span{display:inline-flex;align-items:center;gap:4px}
.more{display:inline-flex;align-items:center;gap:4px;font-size:13px;font-weight:600;margin-top:14px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.26);border-radius:999px;padding:5px 12px;backdrop-filter:blur(6px)}
.ppl{display:flex;flex-direction:column;gap:8px;align-items:flex-end}
.pp{display:flex;align-items:center;gap:9px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.24);border-radius:999px;padding:4px 14px 4px 4px;backdrop-filter:blur(6px);font-size:13.5px;font-weight:600;cursor:pointer}
.pp .av{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;background-size:cover;background-position:center;position:relative}
.pp .av:after{content:"";position:absolute;right:-1px;bottom:-1px;width:11px;height:11px;border-radius:50%;border:2px solid rgba(20,25,40,.9);background:#8a94a3}
.pp.home .av:after{background:#3ddc84}
.pp small{display:block;font-weight:400;font-size:11.5px;opacity:.85}
.pp.away{opacity:.8}
.hints{display:flex;flex-wrap:wrap;gap:8px}
.hint{display:inline-flex;align-items:center;gap:8px;border-radius:16px;padding:10px 14px;font-size:13.5px;font-weight:600;border:1px solid var(--h-line);background:var(--h-surface);color:var(--h-fg);cursor:default}
.hint[data-nav],.hint[data-more]{cursor:pointer}
.hint .hi{width:30px;height:30px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex:none}
.hint small{display:block;font-weight:400;color:var(--h-fg2);font-size:12px}
.hint.bad{border-color:rgba(227,73,72,.45)}.hint.bad .hi{background:rgba(227,73,72,.14);color:var(--h-bad)}
.hint.warn .hi{background:rgba(239,138,60,.16);color:var(--h-warm)}
.hint.info .hi{background:rgba(57,135,229,.14);color:var(--h-acc)}
.hint.ok .hi{background:rgba(27,175,122,.14);color:var(--h-ok)}
.hint.alarm{background:var(--h-bad);color:#fff;border-color:transparent;animation:pulse 1.2s ease-in-out infinite}.hint.alarm .hi{background:rgba(255,255,255,.25);color:#fff}
@keyframes pulse{50%{box-shadow:0 0 0 8px rgba(227,73,72,.25)}}
.blk{background:var(--h-surface);color:var(--h-fg);border-radius:24px;padding:18px 20px;border:1px solid var(--h-line);min-width:0}
.bh{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.bh h2{margin:0;font-size:18px;font-weight:650;letter-spacing:-.01em;display:flex;align-items:center;gap:8px}
.bh p{margin:0;color:var(--h-fg2);font-size:13px}
.floor{margin-top:4px}.floor+.floor{margin-top:18px}
.floor h3{margin:0 0 10px;font-size:13px;font-weight:650;text-transform:uppercase;letter-spacing:.06em;color:var(--h-fg2)}
.rooms{display:grid;grid-template-columns:repeat(auto-fill,minmax(178px,1fr));gap:10px}
.rm{position:relative;border-radius:20px;padding:14px;min-height:132px;display:flex;flex-direction:column;justify-content:space-between;gap:6px;border:1px solid var(--h-line);background:var(--h-surface);overflow:hidden;text-align:left;font:inherit;color:var(--h-fg);cursor:pointer;transition:transform .15s,box-shadow .3s}
.rm:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,0,0,.08)}
.rm.nolink{cursor:default}.rm.nolink:hover{transform:none;box-shadow:none}
.rm .gl{position:absolute;inset:-30%;pointer-events:none;opacity:.9;filter:blur(26px)}
.rm>*:not(.gl){position:relative}
.rm .top{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
.rm .ic{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--h-line)}
.rm.lit .ic{background:rgba(255,255,255,.6);color:#3b2a10}
.rm .t{font-size:26px;font-weight:300;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1}
.rm .t small{font-size:13px;opacity:.7;margin-left:1px}
.rm .n{font-weight:650;font-size:14.5px;display:flex;align-items:center;gap:6px}
.rm .s{font-size:12.5px;color:var(--h-fg2);display:flex;flex-wrap:wrap;gap:2px 10px}
.rm .s span{display:inline-flex;align-items:center;gap:3px}
.rm .tag{position:absolute;top:10px;right:10px}
.badge{display:inline-flex;align-items:center;gap:3px;border-radius:999px;padding:2px 8px;font-size:11.5px;font-weight:650}
.badge.bad{background:rgba(227,73,72,.14);color:var(--h-bad)}.badge.heat{background:rgba(239,138,60,.16);color:var(--h-warm)}
.go{color:var(--h-fg2);opacity:.6}
.en{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.ev{border-radius:18px;padding:12px 14px;border:1px solid var(--h-line)}
.ev .l{font-size:12.5px;color:var(--h-fg2);display:flex;align-items:center;gap:5px}
.ev .v{font-size:26px;font-weight:600;font-variant-numeric:tabular-nums;margin-top:4px}.ev .v small{font-size:13px;font-weight:500;color:var(--h-fg2);margin-left:3px}
.ev .x{font-size:12px;color:var(--h-fg2);margin-top:2px}
.flow{margin-top:14px;display:flex;flex-direction:column;gap:6px}
.fbar{display:flex;height:12px;border-radius:6px;overflow:hidden;background:var(--h-line);gap:2px}
.fbar i{display:block;height:100%;transition:width 1s}
.fl{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12.5px;color:var(--h-fg2)}.fl span{display:inline-flex;align-items:center;gap:5px}.fl i{width:10px;height:10px;border-radius:3px;display:inline-block}
.soc{display:flex;align-items:center;gap:8px;margin-top:8px}.soc .b{flex:1;height:8px;border-radius:4px;background:var(--h-line);overflow:hidden}.soc .b i{display:block;height:100%;background:var(--h-ok)}
.gd{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}
.gt{border-radius:20px;padding:14px;border:1px solid var(--h-line);display:flex;flex-direction:column;gap:8px;cursor:pointer;text-align:left;font:inherit;color:var(--h-fg);background:var(--h-surface);transition:transform .15s,box-shadow .3s;min-height:120px;position:relative;overflow:hidden}
.gt:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,0,0,.08)}
.gt .top{display:flex;align-items:center;gap:10px}
.gt .ic{width:40px;height:40px;border-radius:14px;display:flex;align-items:center;justify-content:center;color:#fff;flex:none}
.gt .n{font-weight:650;font-size:14.5px}.gt .s{font-size:12.5px;color:var(--h-fg2)}
.gt .big2{font-size:22px;font-weight:600;font-variant-numeric:tabular-nums}
.gt .pb{height:6px;border-radius:3px;background:var(--h-line);overflow:hidden}.gt .pb i{display:block;height:100%}
.gt .go{position:absolute;top:14px;right:12px}
.rm:focus-visible,.gt:focus-visible,.hero:focus-visible,.pp:focus-visible{outline:2px solid var(--h-acc);outline-offset:2px}
.tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.tl{position:relative;border-radius:26px;padding:20px;min-height:230px;display:flex;flex-direction:column;gap:10px;overflow:hidden;cursor:pointer;color:#fff;box-shadow:0 14px 32px rgba(0,0,0,.16);transition:transform .15s,box-shadow .3s}
.tl:hover{transform:translateY(-3px);box-shadow:0 18px 38px rgba(0,0,0,.22)}
.tl .bgx{position:absolute;inset:0;pointer-events:none}
.tl .gl{position:absolute;inset:-25%;filter:blur(40px);opacity:.85;pointer-events:none}
.tl>*:not(.bgx):not(.gl){position:relative}
.tl .hd{display:flex;align-items:center;gap:12px}
.tl .ic{width:46px;height:46px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.22);backdrop-filter:blur(6px)}
.tl .n{font-size:21px;font-weight:650;letter-spacing:-.01em;flex:1}
.tl .t{font-size:44px;font-weight:250;letter-spacing:-.03em;line-height:1;margin-top:4px}.tl .t small{font-size:16px;font-weight:400;opacity:.85;margin-left:3px}
.tl .t span{font-size:13px;font-weight:500;opacity:.85;letter-spacing:0;margin-left:8px}
.tl .ln{display:flex;flex-wrap:wrap;gap:6px}
.tl .ch{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:4px 10px;font-size:12.5px;font-weight:600;backdrop-filter:blur(6px)}
.tl .ch.bad{background:rgba(227,73,72,.75);border-color:transparent}.tl .ch.heat{background:rgba(239,138,60,.7);border-color:transparent}
.tl .rms{display:flex;flex-wrap:wrap;gap:5px;margin-top:auto}
.tl .rd{display:inline-flex;align-items:center;gap:5px;font-size:12px;opacity:.92;padding:2px 8px 2px 4px;border-radius:999px;background:rgba(0,0,0,.14)}
.tl .rd i{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.35)}
.ebar{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;background:var(--h-surface);border:1px solid var(--h-line);border-radius:22px;overflow:hidden}
.eb{padding:12px 16px;cursor:pointer;display:flex;flex-direction:column;gap:2px;color:var(--h-fg)}
.eb+.eb{border-left:1px solid var(--h-line)}
.eb .l{font-size:12px;color:var(--h-fg2);display:flex;align-items:center;gap:5px}
.eb .v{font-size:21px;font-weight:600;font-variant-numeric:tabular-nums}.eb .v small{font-size:12px;font-weight:500;color:var(--h-fg2);margin-left:2px}
.eb .x{font-size:11.5px;color:var(--h-fg2)}
.eb .mb{height:5px;border-radius:3px;background:var(--h-line);overflow:hidden;margin-top:3px}.eb .mb i{display:block;height:100%;background:var(--h-ok)}
@media (max-width:900px){.half{grid-column:1/-1}}
@media (max-width:640px){.tiles{grid-template-columns:1fr}.tl{min-height:190px}.ebar{grid-template-columns:repeat(2,minmax(0,1fr))}.eb:nth-child(3){border-left:none}.eb:nth-child(n+3){border-top:1px solid var(--h-line)}.orb{right:5% !important;top:4% !important;transform:scale(.5);transform-origin:top right;opacity:.85}.hin{grid-template-columns:1fr;padding:20px 18px}.ppl{flex-direction:row;flex-wrap:wrap;align-items:flex-start}.blk{padding:16px 14px}.rooms{grid-template-columns:repeat(2,minmax(0,1fr))}.en{grid-template-columns:repeat(2,minmax(0,1fr))}.en .ev:last-child{grid-column:1/-1}.rm{min-height:118px}}
`;

class HausCard extends HTMLElement {
  setConfig(c) {
    if (!c) throw new Error('Konfiguration fehlt');
    this.c = { persons: [], floors: [], garden: [], waste: [], battery_exclude: [], battery_names: {}, tiles: [], ...c };
    this.sec = new Set(this.c.sections || ['hero', 'hints', 'rooms', 'energy', 'garden']);
  }
  getCardSize() { return 20; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  s(e) { return e && this._hass ? this._hass.states[e] : undefined; }
  n(e) { const s = this.s(e); const v = s ? parseFloat(s.state) : NaN; return isNaN(v) ? null : v; }
  set hass(h) {
    this._hass = h;
    if (!this.root) this.build();
    const parts = { hero: this.kHero(), hints: this.kHints(), rooms: this.kRooms(), energy: this.kEnergy(), garden: this.kGarden(), tiles: this.kTiles(), ebar: this.kEnergy() };
    for (const [k, v] of Object.entries(parts)) { if (!this.sec.has(k) || this._k[k] === v) continue; this._k[k] = v; this['r_' + k](); }
  }
  ks(list) { return list.filter(Boolean).map(e => { const s = this.s(e); return s ? s.state + JSON.stringify(s.attributes) : '-'; }).join('|'); }
  build() {
    this._k = {};
    this.root = this.attachShadow({ mode: 'open' });
    const c = this.c, S = this.sec;
    this.root.innerHTML = `<style>${H_CSS}</style><div class="wrap">
      ${S.has('hero') ? `<div class="hero full" id="hero" role="link" tabindex="0" ${c.weather && c.weather.path ? `data-nav="${H_esc(c.weather.path)}"` : ''}><div class="sky" id="sky"></div><div class="shade"></div><div class="hin" id="hin"></div></div>` : ''}
      ${S.has('hints') ? `<div class="full hints" id="hints"></div>` : ''}
      ${S.has('tiles') ? `<div class="full tiles" id="tiles"></div>` : ''}
      ${S.has('ebar') && c.energy ? `<div class="full ebar" id="ebar"></div>` : ''}
      ${S.has('rooms') && c.floors.length ? `<div class="blk full"><div class="bh"><h2>${H_icon('mdi:home-floor-g', 20)}Räume</h2><p id="rsum"></p></div><div id="rooms"></div></div>` : ''}
      ${S.has('energy') && c.energy ? `<div class="blk half"><div class="bh"><h2>${H_icon('mdi:solar-power-variant', 20)}Energie jetzt</h2><p id="esum"></p></div><div id="energy"></div></div>` : ''}
      ${S.has('garden') && c.garden.length ? `<div class="blk half"><div class="bh"><h2>${H_icon('mdi:flower', 20)}Garten</h2></div><div class="gd" id="garden"></div></div>` : ''}
    </div>`;
    this.$ = (id) => this.root.getElementById(id);
    this.root.addEventListener('click', (ev) => {
      const m = ev.target.closest('[data-more]'); if (m) { ev.stopPropagation(); return this.more(m.dataset.more); }
      const t = ev.target.closest('[data-nav]'); if (t) this.nav(t.dataset.nav);
    });
    this.root.addEventListener('keydown', (ev) => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('[data-nav],[data-more]')) { ev.preventDefault(); ev.target.click(); } });
    if (S.has('hero')) this.buildSky();
  }
  nav(p) {
    if (!p) return;
    const base = this.c.base_path || '';
    const path = p.startsWith('/') ? p : `${base}/${p}`;
    history.pushState(null, '', path);
    window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
  }
  more(e) { this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: e } })); }
  // ---------- Hero / Himmel ----------
  buildSky() {
    const sky = this.$('sky'); let h = '';
    for (let i = 0; i < 40; i++) h += `<i class="star" style="left:${(i * 37) % 100}%;top:${(i * 53) % 70}%;animation-delay:${(i % 7) * .6}s"></i>`;
    for (let i = 0; i < 5; i++) h += `<i class="cl" style="width:${180 + i * 40}px;height:${70 + i * 12}px;top:${8 + i * 14}%;left:0;animation-duration:${55 + i * 17}s;animation-delay:-${i * 13}s"></i>`;
    for (let i = 0; i < 60; i++) h += `<i class="drop" style="left:${(i * 17) % 100}%;animation-delay:${(i % 10) / 10}s;animation-duration:${.7 + (i % 5) / 10}s"></i>`;
    h += `<i class="orb" id="orb"></i>`;
    sky.innerHTML = h;
  }
  kHero() { const w = this.c.weather || {}; return this.ks([w.entity, w.temperature, w.max, w.min, w.wind, w.rain_day, w.humidity, 'sun.sun', ...this.c.persons.map(p => p.entity || p)]); }
  r_hero() {
    const c = this.c, w = c.weather || {}, ws = this.s(w.entity), sun = this.s('sun.sun');
    const cond = ws ? ws.state : '', [ct, ci] = H_COND[cond] || ['', 'mdi:weather-partly-cloudy'];
    const elev = sun ? sun.attributes.elevation : 20, night = sun ? sun.state === 'below_horizon' : false;
    const cloudy = ['cloudy', 'fog', 'rainy', 'pouring', 'snowy', 'snowy-rainy', 'lightning', 'lightning-rainy', 'hail'].includes(cond), part = cond === 'partlycloudy';
    const rain = ['rainy', 'pouring', 'lightning-rainy', 'snowy-rainy', 'hail'].includes(cond), snow = cond === 'snowy';
    let bg;
    if (night) bg = cloudy ? 'linear-gradient(180deg,#1b2233,#2c3445)' : 'linear-gradient(180deg,#0b1230,#1d2a5a 70%,#33407a)';
    else if (elev < 6) bg = cloudy ? 'linear-gradient(180deg,#5a5f74,#a08d84)' : 'linear-gradient(180deg,#3d5aa8,#d98a6a 75%,#f2b26b)';
    else bg = cloudy ? 'linear-gradient(180deg,#6f7f95,#a9b5c4)' : 'linear-gradient(180deg,#2f7fd6,#7fb8ec 70%,#bfe0fa)';
    this.$('hero').style.background = bg;
    const sky = this.$('sky');
    sky.querySelectorAll('.star').forEach(e => e.style.display = night && !cloudy ? '' : 'none');
    sky.querySelectorAll('.cl').forEach((e, i) => { e.style.display = cloudy || part || i < 1 ? '' : 'none'; e.style.background = night ? 'rgba(150,160,190,.35)' : cloudy ? 'rgba(235,240,248,.6)' : 'rgba(255,255,255,.55)'; });
    sky.querySelectorAll('.drop').forEach(e => { e.style.display = rain || snow ? '' : 'none'; e.style.width = snow ? '4px' : '1.5px'; e.style.height = snow ? '4px' : '14px'; e.style.borderRadius = snow ? '50%' : '0'; e.style.background = snow ? '#fff' : ''; });
    const orb = this.$('orb');
    orb.style.cssText = night ? 'width:70px;height:70px;right:16%;top:14%;background:radial-gradient(circle at 35% 35%,#fffbe8,#d9d6c3);box-shadow:0 0 40px rgba(255,250,220,.5)' : 'width:110px;height:110px;right:14%;top:' + Math.max(6, 40 - (elev || 0)) + '%;background:radial-gradient(circle,#fff6c4,#ffd04d 55%,rgba(255,208,77,0));box-shadow:0 0 90px rgba(255,214,90,.8)';
    orb.style.display = cloudy ? 'none' : '';
    const now = new Date(), hr = now.getHours();
    const greet = hr < 5 ? 'Gute Nacht' : hr < 11 ? 'Guten Morgen' : hr < 17 ? 'Guten Tag' : hr < 22 ? 'Guten Abend' : 'Gute Nacht';
    const date = now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
    const t = this.n(w.temperature) ?? (ws && ws.attributes.temperature);
    const mx = this.n(w.max), mn = this.n(w.min), wind = this.n(w.wind), rd = this.n(w.rain_day), hum = this.n(w.humidity);
    const ppl = c.persons.map(p => {
      const e = p.entity || p, s = this.s(e); if (!s) return '';
      const home = s.state === 'home', nm = p.name || s.attributes.friendly_name || e, pic = s.attributes.entity_picture;
      const where = home ? 'zu Hause' : s.state === 'not_home' ? 'unterwegs' : s.state;
      return `<div class="pp ${home ? 'home' : 'away'}" data-more="${e}" role="button" tabindex="0"><div class="av" style="${pic ? `background-image:url('${H_esc(pic)}')` : `background:hsl(${(nm.charCodeAt(0) * 47) % 360} 55% 55%)`}">${pic ? '' : H_esc(nm[0])}</div><div>${H_esc(nm)}<small>${H_esc(where)}</small></div></div>`;
    }).join('');
    this.$('hin').innerHTML = `<div>
      <div class="greet">${greet} · ${date}</div>
      <div class="title">${H_esc(c.title || 'Zuhause')}</div>
      <div class="wx"><div class="big">${H_fmt(t)}<small>°C</small></div><div class="cond">${H_icon(ci, 22)} ${ct}<div>${w.name ? H_esc(w.name) : 'Garten'}${mx != null ? ` · ↑ ${H_fmt(mx)}° ↓ ${H_fmt(mn)}°` : ''}</div></div></div>
      <div class="sub">${wind != null ? `<span>${H_icon('mdi:weather-windy', 16)}${H_fmt(wind, 0)} km/h</span>` : ''}${rd != null ? `<span>${H_icon('mdi:water', 16)}${H_fmt(rd)} mm heute</span>` : ''}${hum != null ? `<span>${H_icon('mdi:water-percent', 16)}${H_fmt(hum, 0)} %</span>` : ''}</div>
      ${w.path ? `<div class="more">${H_icon('mdi:chart-line', 15)}Zur Wetterstation ${H_icon('mdi:chevron-right', 15)}</div>` : ''}</div>
      <div class="ppl">${ppl}</div>`;
  }
  // ---------- Hinweise ----------
  allWindows() { return this.c.floors.flatMap(f => f.rooms.flatMap(r => (r.windows || []).map(w => ({ ...(typeof w === 'string' ? { entity: w } : w), room: r })))); }
  batteries() {
    const ex = this.c.battery_exclude, lim = this.c.battery_limit || 20, out = [];
    for (const [id, s] of Object.entries(this._hass.states)) {
      if (!id.startsWith('sensor.') || s.attributes.device_class !== 'battery' || s.attributes.unit_of_measurement !== '%') continue;
      if (ex.some(x => id.includes(x))) continue;
      const v = parseFloat(s.state); if (!isNaN(v) && v <= lim) out.push({ id, v, name: (this.c.battery_names || {})[id] || (s.attributes.friendly_name || id).replace(/\s*(Batterie|Battery|Battery Level|Akku)\s*$/i, '') });
    }
    return out.sort((a, b) => a.v - b.v);
  }
  kHints() {
    const c = this.c;
    const bat = this._hass ? this.batteries().map(b => b.id + b.v).join() : '';
    return this.ks([c.smoke, ...this.allWindows().map(w => w.entity), ...c.waste.map(w => w.entity), ...(c.garden || []).map(g => g.entity)]) + bat + new Date().toDateString();
  }
  r_hints() {
    const c = this.c, out = [];
    const H = (k, icon, title, sub = '', attr = '') => out.push(`<div class="hint ${k}" ${attr}><div class="hi">${H_icon(icon, 18)}</div><div>${title}${sub ? `<small>${sub}</small>` : ''}</div></div>`);
    const sm = this.s(c.smoke); if (sm && sm.state === 'on') H('alarm', 'mdi:fire-alert', 'Rauchalarm!', 'Rauchmelder hat ausgelöst', `data-more="${c.smoke}" role="button" tabindex="0"`);
    const open = this.allWindows().filter(w => (this.s(w.entity) || {}).state === 'on');
    open.forEach(w => H('warn', 'mdi:window-open-variant', `${H_esc(w.room.name)}: ${H_esc(w.name || 'Fenster')} offen`, '', w.room.path ? `data-nav="${H_esc(w.room.path)}" role="button" tabindex="0"` : ''));
    const today = new Date(); today.setHours(0, 0, 0, 0);
    c.waste.forEach(w => {
      const s = this.s(w.entity); if (!s) return; const m = /(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(s.state); if (!m) return;
      const d = Math.round((new Date(+m[3], +m[2] - 1, +m[1]) - today) / 864e5);
      if (d >= 0 && d <= (c.waste_days ?? 1)) H(d === 0 ? 'warn' : 'info', w.icon || 'mdi:trash-can-outline', `${H_esc(w.name)} ${d === 0 ? 'heute' : d === 1 ? 'morgen' : `in ${d} Tagen`}`, d === 1 ? 'Tonne heute Abend rausstellen' : 'wird heute abgeholt');
    });
    const bat = this.batteries();
    if (bat.length) H('warn', 'mdi:battery-alert-variant-outline', `${bat.length} ${bat.length === 1 ? 'Batterie' : 'Batterien'} schwach`, bat.slice(0, 3).map(b => `${H_esc(b.name)} ${H_fmt(b.v, 0)} %`).join(' · ') + (bat.length > 3 ? ' …' : ''));
    (c.garden || []).forEach(g => {
      const s = this.s(g.entity); if (!s) return;
      if (g.type === 'mower' && s.state === 'error') H('bad', 'mdi:robot-mower-outline', 'Mähroboter meldet Fehler', '', g.path ? `data-nav="${H_esc(g.path)}" role="button" tabindex="0"` : '');
    });
    if (!out.length) H('ok', 'mdi:check-circle-outline', 'Alles in Ordnung', 'Keine offenen Fenster, Alarme oder schwachen Batterien');
    this.$('hints').innerHTML = out.join('');
  }
  // ---------- Räume ----------
  kRooms() { return this.ks(this.c.floors.flatMap(f => f.rooms.flatMap(r => [r.temperature, r.humidity, r.climate, ...(r.lights || []), ...(r.windows || []).map(w => w.entity || w)]))); }
  lightRgb(s) {
    const a = s.attributes; if (a.rgb_color) return a.rgb_color;
    if (a.color_temp_kelvin) { const k = a.color_temp_kelvin; return k < 3000 ? [255, 180, 107] : k < 4500 ? [255, 214, 170] : [235, 240, 255]; }
    return [255, 196, 122];
  }
  r_rooms() {
    const el = this.$('rooms'); if (!el) return;
    let totOn = 0;
    el.innerHTML = this.c.floors.map(f => `<div class="floor"><h3>${H_esc(f.name)}</h3><div class="rooms">${f.rooms.map(r => {
      const lights = (r.lights || []).map(e => this.s(e)).filter(Boolean), on = lights.filter(s => s.state === 'on');
      totOn += on.length;
      const t = this.n(r.temperature), hum = this.n(r.humidity), cl = this.s(r.climate);
      const open = (r.windows || []).filter(w => (this.s(w.entity || w) || {}).state === 'on');
      const heat = cl && cl.attributes.hvac_action === 'heating';
      let gl = '';
      if (on.length) {
        const cols = on.slice(0, 3).map(s => this.lightRgb(s)), pos = ['20% 20%', '80% 30%', '50% 90%'];
        gl = `<div class="gl" style="background:${cols.map((c, i) => `radial-gradient(circle at ${pos[i]},rgba(${c.join(',')},.75),rgba(${c.join(',')},0) 55%)`).join(',')}"></div>`;
      }
      const link = !!r.path;
      return `<div class="rm ${on.length ? 'lit' : ''} ${link ? '' : 'nolink'}" ${link ? `data-nav="${H_esc(r.path)}" role="link" tabindex="0"` : ''} aria-label="${H_esc(r.name)}">${gl}
        <div class="top"><div class="ic">${H_icon(r.icon || 'mdi:door', 20)}</div>${t != null ? `<div class="t">${H_fmt(t)}<small>°</small></div>` : ''}</div>
        <div><div class="n">${H_esc(r.name)}${link ? `<span class="go">${H_icon('mdi:chevron-right', 16)}</span>` : ''}</div>
        <div class="s">${lights.length ? `<span>${H_icon(on.length ? 'mdi:lightbulb-on' : 'mdi:lightbulb-outline', 14)}${on.length ? `${on.length} an` : 'aus'}</span>` : ''}${hum != null ? `<span>${H_icon('mdi:water-percent', 14)}${H_fmt(hum, 0)} %</span>` : ''}</div>
        ${open.length || heat ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${open.length ? `<span class="badge bad">${H_icon('mdi:window-open-variant', 13)}offen</span>` : ''}${heat ? `<span class="badge heat">${H_icon('mdi:fire', 13)}heizt</span>` : ''}</div>` : ''}</div></div>`;
    }).join('')}</div></div>`).join('');
    this.$('rsum').textContent = totOn ? `${totOn} ${totOn === 1 ? 'Licht' : 'Lichter'} an` : 'Alle Lichter aus';
  }
  // ---------- Energie ----------
  kEnergy() { const e = this.c.energy || {}; return this.ks([e.pv, e.home, e.grid_import, e.grid_export, e.battery_soc, e.battery_power, e.pv_today]); }
  r_energy() {
    const el = this.$('energy'), e = this.c.energy; if (!el || !e) return;
    const pv = Math.max(0, this.n(e.pv) || 0), home = Math.max(0, this.n(e.home) || 0), imp = Math.max(0, this.n(e.grid_import) || 0), exp = Math.max(0, this.n(e.grid_export) || 0);
    const soc = this.n(e.battery_soc), bp = this.n(e.battery_power), today = this.n(e.pv_today);
    const kw = (w) => w >= 1000 ? [H_fmt(w / 1000, 2), 'kW'] : [H_fmt(w, 0), 'W'];
    const [pv1, pu] = kw(pv), [h1, hu] = kw(home), grid = exp > imp ? exp : imp, [g1, gu] = kw(grid);
    const self = home > 0 ? Math.min(100, Math.round(Math.max(0, home - imp) / home * 100)) : 0;
    const fromPv = Math.max(0, home - imp - Math.max(0, bp || 0)), fromBat = Math.max(0, bp || 0);
    const tot = Math.max(1, fromPv + fromBat + imp);
    el.innerHTML = `<div class="en">
      <div class="ev" data-more="${e.pv}" role="button" tabindex="0" style="cursor:pointer"><div class="l">${H_icon('mdi:solar-power-variant', 15)}Solar</div><div class="v" style="color:${pv > 0 ? 'var(--h-sun)' : 'inherit'}">${pv1}<small>${pu}</small></div><div class="x">${today != null ? `heute ${H_fmt(today)} kWh` : ''}</div></div>
      <div class="ev" data-more="${e.home}" role="button" tabindex="0" style="cursor:pointer"><div class="l">${H_icon('mdi:home-lightning-bolt-outline', 15)}Haus</div><div class="v">${h1}<small>${hu}</small></div><div class="x">${self} % selbst versorgt</div></div>
      <div class="ev" data-more="${exp > imp ? e.grid_export : e.grid_import}" role="button" tabindex="0" style="cursor:pointer"><div class="l">${H_icon('mdi:transmission-tower', 15)}Netz</div><div class="v" style="color:${exp > imp ? 'var(--h-ok)' : imp > 0 ? 'var(--h-bad)' : 'inherit'}">${g1}<small>${gu}</small></div><div class="x">${exp > imp ? 'Einspeisung' : imp > 0 ? 'Bezug' : 'ausgeglichen'}</div></div></div>
      <div class="flow"><div class="fl" style="justify-content:space-between"><span>Woher kommt der Strom?</span></div>
      <div class="fbar"><i style="width:${fromPv / tot * 100}%;background:var(--h-sun)"></i><i style="width:${fromBat / tot * 100}%;background:var(--h-ok)"></i><i style="width:${imp / tot * 100}%;background:#8a94a3"></i></div>
      <div class="fl"><span><i style="background:var(--h-sun)"></i>Solar</span><span><i style="background:var(--h-ok)"></i>Batterie</span><span><i style="background:#8a94a3"></i>Netz</span></div></div>
      ${soc != null ? `<div class="soc">${H_icon(soc > 80 ? 'mdi:battery-high' : soc > 30 ? 'mdi:battery-medium' : 'mdi:battery-low', 18)}<span style="font-size:13px;color:var(--h-fg2)">Hausbatterie</span><div class="b"><i style="width:${Math.min(100, soc)}%"></i></div><b style="font-size:13px">${H_fmt(soc, 0)} %</b></div>` : ''}`;
    this.$('esum').textContent = pv > 0 ? 'Die Sonne liefert' : 'Keine Solarleistung';
  }
  // ---------- Startkacheln ----------
  kTiles() { return this.ks(this.c.tiles.flatMap(t => { const f = this.floorOf(t); return [t.temperature, t.climate, ...(f ? f.rooms.flatMap(r => [r.temperature, r.climate, ...(r.lights || []), ...(r.windows || []).map(w => w.entity || w)]) : []), ...(t.items || []).flatMap(i => [i.entity, i.battery, i.recommendation, ...(i.zones || [])])]; })); }
  floorOf(t) { return t.floor ? this.c.floors.find(f => f.name === t.floor) : null; }
  r_tiles() {
    const el = this.$('tiles'); if (!el) return;
    el.innerHTML = this.c.tiles.map(t => {
      const f = this.floorOf(t), rooms = f ? f.rooms : [];
      const temps = rooms.map(r => this.n(r.temperature)).filter(v => v != null);
      const tt = t.temperature ? this.n(t.temperature) : temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : null;
      const lit = [], chips = [], H = (k, i, x) => chips.push(`<span class="ch ${k}">${H_icon(i, 14)}${x}</span>`);
      let onN = 0;
      const dots = rooms.map(r => {
        const on = (r.lights || []).map(e => this.s(e)).filter(s => s && s.state === 'on'); onN += on.length;
        on.slice(0, 1).forEach(s => lit.push(this.lightRgb(s)));
        const c = on.length ? this.lightRgb(on[0]) : null;
        return `<span class="rd"><i style="${c ? `background:rgb(${c.join(',')});box-shadow:0 0 8px rgb(${c.join(',')})` : ''}"></i>${H_esc(r.name)}</span>`;
      });
      const open = rooms.flatMap(r => (r.windows || []).filter(w => (this.s(w.entity || w) || {}).state === 'on').map(() => r.name));
      const heat = rooms.filter(r => { const c = this.s(r.climate); return c && c.attributes.hvac_action === 'heating'; }).length;
      if (f) H('', onN ? 'mdi:lightbulb-on' : 'mdi:lightbulb-off-outline', onN ? `${onN} ${onN === 1 ? 'Licht' : 'Lichter'} an` : 'Licht aus');
      if (heat) H('heat', 'mdi:fire', `${heat} ${heat === 1 ? 'Raum heizt' : 'Räume heizen'}`);
      if (open.length) H('bad', 'mdi:window-open-variant', `offen: ${[...new Set(open)].map(H_esc).join(', ')}`);
      const cl = this.s(t.climate);
      if (t.climate) H(cl && cl.attributes.hvac_action === 'heating' ? 'heat' : '', 'mdi:heat-pump-outline', !cl || cl.state === 'unavailable' ? 'Wärmepumpe nicht erreichbar' : cl.state === 'off' ? 'Wärmepumpe aus' : `Wärmepumpe ${cl.attributes.hvac_action === 'heating' ? 'heizt' : 'an'} · Soll ${H_fmt(cl.attributes.temperature)} °`);
      (t.items || []).forEach(i => {
        const s = this.s(i.entity);
        if (i.type === 'mower') { const off = !s || s.state === 'unavailable'; H(s && s.state === 'error' ? 'bad' : '', 'mdi:robot-mower', off ? 'Mähroboter nicht verbunden' : `Mähroboter ${H_MOWER[s.state] || s.state}${this.n(i.battery) != null ? ` · ${H_fmt(this.n(i.battery), 0)} %` : ''}`); }
        if (i.type === 'irrigation') { const run = (i.zones || []).filter(z => (this.s(z) || {}).state === 'on').length; H('', 'mdi:sprinkler-variant', run ? `Bewässerung: ${run} ${run === 1 ? 'Zone läuft' : 'Zonen laufen'}` : 'Bewässerung ruht'); }
      });
      const pos = ['15% 20%', '85% 25%', '30% 90%', '80% 85%'];
      const gl = lit.length ? `<div class="gl" style="background:${lit.slice(0, 4).map((c, i) => `radial-gradient(circle at ${pos[i]},rgba(${c.join(',')},.7),rgba(${c.join(',')},0) 50%)`).join(',')}"></div>` : '';
      return `<div class="tl" ${t.path ? `data-nav="${H_esc(t.path)}" role="link" tabindex="0"` : ''} aria-label="${H_esc(t.name)}"><div class="bgx" style="background:${t.background || 'linear-gradient(150deg,#2b3a67,#4a5d8f)'}"></div>${gl}
        <div class="hd"><div class="ic">${H_icon(t.icon || 'mdi:home', 26)}</div><div class="n">${H_esc(t.name)}</div>${t.path ? H_icon('mdi:chevron-right', 24) : ''}</div>
        <div class="t">${H_fmt(tt)}<small>°C</small>${f && !t.temperature ? '<span>Ø Räume</span>' : ''}</div>
        <div class="ln">${chips.join('')}</div>
        ${dots.length ? `<div class="rms">${dots.join('')}</div>` : ''}</div>`;
    }).join('');
  }
  // ---------- Energie-Leiste ----------
  r_ebar() {
    const el = this.$('ebar'), e = this.c.energy; if (!el || !e) return;
    const pv = Math.max(0, this.n(e.pv) || 0), home = Math.max(0, this.n(e.home) || 0), imp = Math.max(0, this.n(e.grid_import) || 0), exp = Math.max(0, this.n(e.grid_export) || 0);
    const soc = this.n(e.battery_soc), bp = this.n(e.battery_power), today = this.n(e.pv_today);
    const kw = (w) => w >= 1000 ? `${H_fmt(w / 1000, 2)}<small>kW</small>` : `${H_fmt(w, 0)}<small>W</small>`;
    const self = home > 0 ? Math.min(100, Math.round(Math.max(0, home - imp) / home * 100)) : 0;
    const bst = bp == null || Math.abs(bp) < 20 ? 'Ruhe' : bp > 0 ? `entlädt ${H_fmt(Math.abs(bp), 0)} W` : `lädt ${H_fmt(Math.abs(bp), 0)} W`;
    el.innerHTML = `<div class="eb" data-more="${e.pv}" role="button" tabindex="0"><div class="l">${H_icon('mdi:solar-power-variant', 14)}Solar</div><div class="v" style="color:${pv > 0 ? 'var(--h-sun)' : 'inherit'}">${kw(pv)}</div><div class="x">${today != null ? `heute ${H_fmt(today)} kWh` : ''}</div></div>
      <div class="eb" data-more="${e.home}" role="button" tabindex="0"><div class="l">${H_icon('mdi:home-lightning-bolt-outline', 14)}Haus</div><div class="v">${kw(home)}</div><div class="x">${self} % selbst versorgt</div></div>
      <div class="eb" data-more="${exp > imp ? e.grid_export : e.grid_import}" role="button" tabindex="0"><div class="l">${H_icon('mdi:transmission-tower', 14)}Netz</div><div class="v" style="color:${exp > imp ? 'var(--h-ok)' : imp > 0 ? 'var(--h-bad)' : 'inherit'}">${kw(exp > imp ? exp : imp)}</div><div class="x">${exp > imp ? 'Einspeisung' : imp > 0 ? 'Bezug' : 'ausgeglichen'}</div></div>
      <div class="eb" data-more="${e.battery_soc}" role="button" tabindex="0"><div class="l">${H_icon(soc > 80 ? 'mdi:battery-high' : soc > 30 ? 'mdi:battery-medium' : 'mdi:battery-low', 14)}Hausbatterie</div><div class="v">${H_fmt(soc, 0)}<small>%</small></div><div class="mb"><i style="width:${Math.min(100, soc || 0)}%"></i></div><div class="x">${bst}</div></div>`;
  }
  // ---------- Garten ----------
  kGarden() { return this.ks(this.c.garden.flatMap(g => [g.entity, g.battery, g.progress, g.recommendation, g.temperature, g.climate, ...(g.zones || [])])); }
  r_garden() {
    const el = this.$('garden'); if (!el) return;
    el.innerHTML = this.c.garden.map(g => {
      const s = this.s(g.entity), attr = g.path ? `data-nav="${H_esc(g.path)}" role="link" tabindex="0"` : '';
      let body = '', col = g.color || '#1baf7a';
      if (g.type === 'mower') {
        const off = !s || s.state === 'unavailable', st = off ? 'nicht verbunden' : (H_MOWER[s.state] || s.state), b = off ? null : this.n(g.battery), p = this.n(g.progress);
        col = off ? '#8a94a3' : s.state === 'error' ? '#e34948' : s.state === 'mowing' ? '#1baf7a' : '#5b8c3a';
        body = `<div class="big2">${H_esc(st)}</div><div class="s">${b != null ? `Akku ${H_fmt(b, 0)} %` : ''}${p != null && s && s.state === 'mowing' ? ` · ${H_fmt(p, 0)} % gemäht` : ''}</div>${b != null ? `<div class="pb"><i style="width:${b}%;background:${b > 30 ? 'var(--h-ok)' : 'var(--h-bad)'}"></i></div>` : ''}`;
      } else if (g.type === 'irrigation') {
        const run = (g.zones || []).filter(z => (this.s(z) || {}).state === 'on');
        const rec = this.s(g.recommendation);
        col = run.length ? '#3987e5' : '#2d8fb8';
        body = `<div class="big2">${run.length ? `${run.length} ${run.length === 1 ? 'Zone läuft' : 'Zonen laufen'}` : 'Ruht'}</div><div class="s">${run.length ? run.map(z => H_esc((this.s(z).attributes.friendly_name || z).replace(/ Bewässerung$/, ''))).join(', ') : rec ? `Empfehlung: ${H_esc(rec.state)}` : ''}</div>`;
      } else if (g.type === 'pool') {
        const t = this.n(g.temperature), cl = this.s(g.climate), clOk = cl && cl.state !== 'unavailable';
        col = '#1f9bd1';
        body = `<div class="big2">${H_fmt(t)} °C</div><div class="s">${!cl ? '' : !clOk ? 'Wärmepumpe nicht erreichbar' : (cl.state === 'off' ? 'Wärmepumpe aus' : `Wärmepumpe ${cl.attributes.hvac_action === 'heating' ? 'heizt' : 'an'} · Soll ${H_fmt(cl.attributes.temperature)} °C`)}</div>`;
      } else {
        body = `<div class="big2">${s ? H_esc(s.state) : ''}</div>`;
      }
      return `<div class="gt" ${attr}><div class="top"><div class="ic" style="background:${col}">${H_icon(g.icon || 'mdi:flower', 22)}</div><div><div class="n">${H_esc(g.name)}</div></div></div>${body}${g.path ? `<span class="go">${H_icon('mdi:chevron-right', 18)}</span>` : ''}</div>`;
    }).join('');
  }
}
if (!customElements.get('haus-card')) customElements.define('haus-card', HausCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'haus-card', name: 'Haus-Karte', description: 'Startseite mit Wetter, Personen, Hinweisen, Räumen, Energie und Garten' });
