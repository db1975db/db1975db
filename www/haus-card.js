// Haus-Karte – Startseite im Stil der Wetterstation (v0.7.1)
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
.hero.hasm .hin{padding-right:62px}
/* inset: ipad – Rand für die abgerundeten iPad-Ecken, wenn kiosk-mode die Kopfzeile ausblendet */
.wrap.pad{padding:max(16px,env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) max(14px,env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left))}
.wrap.kiosk{padding:max(16px,env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) max(14px,env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left));height:100vh;height:100dvh;grid-template-rows:auto auto auto minmax(0,1fr);align-content:stretch;overflow:hidden}
.wrap.kiosk .tl .t{font-size:44px}
.wrap.kiosk .fl2{height:100%;padding:10px 20px;overflow:hidden}.wrap.kiosk .fl2>div:first-child{height:100%;min-height:0}.wrap.kiosk .fl2 svg{height:100%;max-height:none}.wrap.kiosk .fl2 .st{max-height:100%}
.mnu{font:inherit;position:absolute;top:10px;right:10px;z-index:3;width:36px;height:36px;border-radius:12px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.14);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(6px)}
.title{font-size:clamp(30px,5vw,44px);font-weight:650;letter-spacing:-.02em;margin:2px 0 10px}
.wx{display:flex;align-items:center;gap:14px}
.big{font-size:clamp(54px,9vw,86px);font-weight:200;line-height:1;letter-spacing:-.03em;white-space:nowrap}
.big small{font-size:.34em;font-weight:400;letter-spacing:0;opacity:.85;margin-left:4px;vertical-align:.9em}
.cond{font-size:17px;font-weight:600}.cond div{font-size:13.5px;font-weight:400;opacity:.9;margin-top:3px}
.sub{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:14px;opacity:.95;margin-top:10px}
.sub span{display:inline-flex;align-items:center;gap:4px}
.more{display:inline-flex;align-items:center;gap:4px;font-size:13px;font-weight:600;margin-top:14px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.26);border-radius:999px;padding:5px 12px;backdrop-filter:blur(6px)}
.ppl{align-self:stretch;display:flex;flex-direction:column;justify-content:center;gap:12px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:24px;padding:14px 18px 16px;backdrop-filter:blur(10px);min-width:0}
.ppl .ph{font-size:13px;font-weight:600;opacity:.92;display:flex;align-items:center;gap:6px}
.ppl .row{display:flex;gap:18px;justify-content:center}
.pp{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;width:86px;text-align:center}
.pp .av{position:relative;width:76px;height:76px;border-radius:50%;background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:700;color:#fff;transition:filter .6s,opacity .6s}
.pp.home .av{box-shadow:0 0 0 3px #3ddc84,0 0 22px rgba(61,220,132,.65)}
.pp.away .av{filter:grayscale(1) brightness(.85);opacity:.6;box-shadow:0 0 0 2px rgba(255,255,255,.35)}
.pp .zb{position:absolute;right:-4px;bottom:-4px;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid rgba(25,30,52,.95);color:#fff}
.pp.home .zb{background:#22b864}.pp.away .zb{background:#7b8494}
.pp .nm{font-size:15px;font-weight:650;line-height:1.1}
.pp small{display:block;font-size:11.5px;opacity:.85;line-height:1.25;margin-top:2px}
.pp.away .nm,.pp.away small{opacity:.75}
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
.fh{position:relative;border-radius:28px;overflow:hidden;color:#fff;padding:18px 22px 20px;box-shadow:0 14px 32px rgba(0,0,0,.18)}
.fh .gl{position:absolute;inset:-25%;filter:blur(46px);opacity:.42;pointer-events:none}
.fh>*:not(.bgx):not(.gl){position:relative}
.fh .bgx{position:absolute;inset:0}
.fh .top{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.fh .back{font:inherit;display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.28);color:#fff;border-radius:999px;padding:6px 14px 6px 8px;font-size:14px;font-weight:600;cursor:pointer;backdrop-filter:blur(6px)}
.fh .ttl{font-size:clamp(26px,4.5vw,36px);font-weight:650;letter-spacing:-.02em;flex:1;display:flex;align-items:center;gap:10px}
.fh .t{font-size:clamp(40px,7vw,58px);font-weight:200;letter-spacing:-.03em;line-height:1;margin-top:12px}.fh .t small{font-size:.32em;font-weight:400;opacity:.85;margin-left:4px;vertical-align:1em}
.fh .t span{font-size:14px;font-weight:500;opacity:.85;letter-spacing:0;margin-left:10px}
.fh .ln{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.fh .ch{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:5px 11px;font-size:13px;font-weight:600;backdrop-filter:blur(6px)}
.fh .ch.bad{background:rgba(227,73,72,.75);border-color:transparent}.fh .ch.heat{background:rgba(239,138,60,.7);border-color:transparent}
.fh .off{font:inherit;margin-left:auto;display:inline-flex;align-items:center;gap:6px;background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.25);color:#fff;border-radius:999px;padding:7px 14px;font-size:13.5px;font-weight:600;cursor:pointer}
.rm .lb{font:inherit;position:absolute;right:12px;bottom:12px;width:40px;height:40px;border-radius:14px;border:1px solid var(--h-line);background:var(--h-surface);color:var(--h-fg2);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2}
.rm.lit .lb{background:rgba(255,255,255,.75);color:#7a4a10;border-color:transparent;box-shadow:0 4px 14px rgba(246,169,74,.45)}
.big-rooms .rooms{grid-template-columns:repeat(auto-fill,minmax(205px,1fr));gap:12px}
.big-rooms .rm{min-height:150px;padding:16px}
.big-rooms .rm .t{font-size:30px}
.big-rooms .rm.hasl>div:last-child{padding-right:50px}
.fl2{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:18px;background:var(--h-surface);border:1px solid var(--h-line);border-radius:24px;padding:14px 20px;color:var(--h-fg);min-height:0;align-items:center}
.fl2 svg{width:100%;height:auto;max-height:250px;display:block}
.fl2 .nd circle.bg{fill:var(--h-surface);stroke-width:3}
.fl2 .nd text{fill:var(--h-fg);font-weight:650;font-size:17px;text-anchor:middle;font-variant-numeric:tabular-nums}
.fl2 .nd text.lb{fill:var(--h-fg2);font-weight:500;font-size:12.5px}
.fl2 .ln{fill:none;stroke:var(--h-line);stroke-width:2.5}
.fl2 .st{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px 18px;align-items:center}
.fl2 .ring{grid-row:span 3;position:relative;width:118px;height:118px}
.fl2 .ring svg{width:118px;height:118px;transform:rotate(-90deg)}
.fl2 .ring b{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:22px;font-weight:650;font-variant-numeric:tabular-nums}
.fl2 .ring b small{font-size:11.5px;font-weight:500;color:var(--h-fg2)}
.fl2 .kv{display:flex;flex-direction:column;gap:2px;cursor:pointer}.fl2 .kv span{font-size:12px;color:var(--h-fg2);display:flex;align-items:center;gap:5px}
.fl2 .kv b{font-size:20px;font-weight:650;font-variant-numeric:tabular-nums}.fl2 .kv b small{font-size:12px;font-weight:500;color:var(--h-fg2);margin-left:2px}
.fl2 .kv .mb{height:6px;border-radius:3px;background:var(--h-line);overflow:hidden;margin-top:4px}.fl2 .kv .mb i{display:block;height:100%;background:var(--h-ok)}
@media (max-width:900px){.half{grid-column:1/-1}}
@media (min-width:901px){.orb{right:auto !important;left:48% !important}}
@media (min-width:900px) and (max-height:860px){.wrap{gap:12px;padding:0 0 8px}.hero{min-height:0}.hin{padding:14px 22px 16px;gap:16px;align-items:center}.greet{font-size:13px}.title{font-size:28px;margin:0 0 4px}.big{font-size:54px}.cond{font-size:15px}.cond div{font-size:12.5px}.sub{font-size:13px;margin-top:4px}.more{margin-top:8px;padding:4px 11px;font-size:12px}.ppl{padding:10px 16px 12px;gap:8px}.ppl .row{gap:14px}.pp{width:78px;gap:4px}.pp .av{width:58px;height:58px;font-size:24px}.pp .zb{width:24px;height:24px}.pp .nm{font-size:14px}.pp small{font-size:11px}.hint{padding:7px 12px;font-size:13px}.hint .hi{width:26px;height:26px}.tiles{grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.tl{min-height:0;padding:14px;gap:8px;border-radius:22px}.tl .hd{gap:9px}.tl .ic{width:36px;height:36px;border-radius:12px}.tl .n{font-size:17px}.tl .t{font-size:36px;margin-top:0}.tl .t small{font-size:14px}.tl .t span{display:none}.tl .ln{gap:4px}.tl .ch{font-size:11.5px;padding:3px 8px}.tl .rms{gap:4px}.tl .rd{font-size:11px;padding:1px 7px 1px 3px}.ebar{border-radius:18px}.eb{padding:8px 14px}.eb .v{font-size:18px}.eb .x{font-size:11px}}
@media (max-width:640px){.fl2{grid-template-columns:1fr}.big-rooms .rooms{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.big-rooms .rm{min-height:132px;padding:13px}.big-rooms .rm .t{font-size:24px}.rm .lb{width:36px;height:36px;right:10px;bottom:10px}.big-rooms .rm.hasl>div:last-child{padding-right:40px}.fh{padding:16px}.fh .off{margin-left:0}.ppl{padding:12px}.ppl .row{gap:10px}.pp{width:auto;flex:1}.pp .av{width:60px;height:60px}.tiles{grid-template-columns:1fr}.tl{min-height:190px}.ebar{grid-template-columns:repeat(2,minmax(0,1fr))}.eb:nth-child(3){border-left:none}.eb:nth-child(n+3){border-top:1px solid var(--h-line)}.orb{right:5% !important;top:4% !important;transform:scale(.5);transform-origin:top right;opacity:.85}.hin{grid-template-columns:1fr;padding:20px 18px}.ppl{flex-direction:row;flex-wrap:wrap;align-items:flex-start}.blk{padding:16px 14px}.rooms{grid-template-columns:repeat(2,minmax(0,1fr))}.en{grid-template-columns:repeat(2,minmax(0,1fr))}.en .ev:last-child{grid-column:1/-1}.rm{min-height:118px}}
`;

class HausCard extends HTMLElement {
  setConfig(c) {
    if (!c) throw new Error('Konfiguration fehlt');
    this.c = { persons: [], floors: [], garden: [], waste: [], battery_exclude: [], battery_names: {}, tiles: [], ...c };
    this.sec = new Set(this.c.sections || ['hero', 'hints', 'rooms', 'energy', 'garden']);
    this.flo = this.c.floor ? this.c.floors.filter(f => f.name === this.c.floor) : this.c.floors;
  }
  getCardSize() { return 20; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  s(e) { return e && this._hass ? this._hass.states[e] : undefined; }
  n(e) { const s = this.s(e); const v = s ? parseFloat(s.state) : NaN; return isNaN(v) ? null : v; }
  set hass(h) {
    this._hass = h;
    if (!this.root) this.build();
    const parts = { hero: this.kHero(), hints: this.kHints(), rooms: this.kRooms(), energy: this.kEnergy(), garden: this.kGarden(), tiles: this.kTiles(), ebar: this.kEnergy(), flow: this.kEnergy(), fh: this.kRooms() };
    for (const [k, v] of Object.entries(parts)) { if (!this.sec.has(k === 'fh' ? 'header' : k) || this._k[k] === v) continue; this._k[k] = v; this['r_' + k](); }
  }
  ks(list) { return list.filter(Boolean).map(e => { const s = this.s(e); return s ? s.state + JSON.stringify(s.attributes) : '-'; }).join('|'); }
  build() {
    this._k = {};
    this.root = this.attachShadow({ mode: 'open' });
    const c = this.c, S = this.sec;
    this.root.innerHTML = `<style>${H_CSS}</style><div class="wrap ${this.showMenu() && S.has('tiles') ? 'kiosk' : ''} ${this.c.inset === 'ipad' && /iPad/.test(navigator.userAgent) ? 'pad' : ''}">
      ${S.has('hero') ? `<div class="hero full ${this.showMenu() ? 'hasm' : ''}" id="hero" role="link" tabindex="0" ${c.weather && c.weather.path ? `data-nav="${H_esc(c.weather.path)}"` : ''}><div class="sky" id="sky"></div><div class="shade"></div>${this.showMenu() ? `<button class="mnu" data-act="menu" aria-label="Menü">${H_icon('mdi:menu', 20)}</button>` : ''}<div class="hin" id="hin"></div></div>` : ''}
      ${S.has('header') ? `<div class="full fh" id="fh"></div>` : ''}
      ${S.has('hints') ? `<div class="full hints" id="hints"></div>` : ''}
      ${S.has('tiles') ? `<div class="full tiles" id="tiles"></div>` : ''}
      ${S.has('ebar') && c.energy ? `<div class="full ebar" id="ebar"></div>` : ''}
      ${S.has('flow') && c.energy ? `<div class="full fl2" id="flow"></div>` : ''}
      ${S.has('rooms') && c.floors.length ? `<div class="blk full ${c.floor ? 'big-rooms' : ''}">${c.floor ? '' : `<div class="bh"><h2>${H_icon('mdi:home-floor-g', 20)}Räume</h2><p id="rsum"></p></div>`}<div id="rooms"></div></div>` : ''}
      ${S.has('energy') && c.energy ? `<div class="blk half"><div class="bh"><h2>${H_icon('mdi:solar-power-variant', 20)}Energie jetzt</h2><p id="esum"></p></div><div id="energy"></div></div>` : ''}
      ${S.has('garden') && c.garden.length ? `<div class="blk half"><div class="bh"><h2>${H_icon('mdi:flower', 20)}Garten</h2></div><div class="gd" id="garden"></div></div>` : ''}
    </div>`;
    this.$ = (id) => this.root.getElementById(id);
    this.root.addEventListener('click', (ev) => {
      const a = ev.target.closest('[data-act]'); if (a) { ev.stopPropagation(); return this.act(a); }
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
  showMenu() { const m = this.c.menu_button; return m === true || (m === 'ipad' && /iPad/.test(navigator.userAgent)); }
  act(el) {
    if (el.dataset.act === 'menu') { this.dispatchEvent(new CustomEvent('hass-toggle-menu', { bubbles: true, composed: true, detail: { open: true } })); return; }
    const ids = (el.dataset.e || '').split(',').filter(Boolean); if (!ids.length) return;
    const on = ids.filter(e => (this.s(e) || {}).state === 'on');
    if (el.dataset.act === 'off' || on.length) this._hass.callService('homeassistant', 'turn_off', { entity_id: on.length ? on : ids });
    else this._hass.callService('homeassistant', 'turn_on', { entity_id: ids });
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
    const zi = (st) => st === 'home' ? 'mdi:home' : /arbeit|work|büro/i.test(st) ? 'mdi:briefcase' : /schule|school/i.test(st) ? 'mdi:school' : st === 'not_home' ? 'mdi:map-marker-outline' : 'mdi:map-marker';
    const since = (s) => { const d = new Date(s.last_changed), t = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }); return d.toDateString() === new Date().toDateString() ? `seit ${t}` : `seit ${d.toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' })}`; };
    let nHome = 0;
    const pp = c.persons.map(p => {
      const e = p.entity || p, s = this.s(e); if (!s) return '';
      const home = s.state === 'home', nm = p.name || s.attributes.friendly_name || e, pic = s.attributes.entity_picture;
      if (home) nHome++;
      const where = home ? 'zu Hause' : s.state === 'not_home' ? 'unterwegs' : s.state;
      return `<div class="pp ${home ? 'home' : 'away'}" data-more="${e}" role="button" tabindex="0" aria-label="${H_esc(nm)}: ${H_esc(where)}"><div class="av" style="${pic ? `background-image:url('${H_esc(pic)}')` : `background:hsl(${(nm.charCodeAt(0) * 47) % 360} 55% 50%)`}">${pic ? '' : H_esc(nm[0])}<span class="zb">${H_icon(zi(s.state), 15)}</span></div><div><div class="nm">${H_esc(nm)}</div><small>${H_esc(where)}<br>${since(s)}</small></div></div>`;
    }).join('');
    const ppl = c.persons.length ? `<div class="ph">${H_icon('mdi:home-account', 16)}${nHome === c.persons.length ? 'Alle zu Hause' : nHome ? `${nHome} von ${c.persons.length} zu Hause` : 'Niemand zu Hause'}</div><div class="row">${pp}</div>` : '';
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
  kRooms() { return this.ks(this.flo.flatMap(f => f.rooms.flatMap(r => [r.temperature, r.humidity, r.climate, ...(r.lights || []), ...(r.windows || []).map(w => w.entity || w)]))); }
  lightRgb(s) {
    const a = s.attributes; if (a.rgb_color) return a.rgb_color;
    if (a.color_temp_kelvin) { const k = a.color_temp_kelvin; return k < 3000 ? [255, 180, 107] : k < 4500 ? [255, 214, 170] : [235, 240, 255]; }
    return [255, 196, 122];
  }
  r_rooms() {
    const el = this.$('rooms'); if (!el) return;
    let totOn = 0;
    el.innerHTML = this.flo.map(f => `<div class="floor">${this.c.floor ? '' : `<h3>${H_esc(f.name)}</h3>`}<div class="rooms">${f.rooms.map(r => {
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
      return `<div class="rm ${on.length ? 'lit' : ''} ${link ? '' : 'nolink'} ${lights.length && this.c.floor ? 'hasl' : ''}" ${link ? `data-nav="${H_esc(r.path)}" role="link" tabindex="0"` : ''} aria-label="${H_esc(r.name)}">${gl}
        <div class="top"><div class="ic">${H_icon(r.icon || 'mdi:door', 20)}</div>${t != null ? `<div class="t">${H_fmt(t)}<small>°</small></div>` : ''}</div>
        ${lights.length && this.c.floor ? `<button class="lb" data-act="toggle" data-e="${(r.lights || []).join(',')}" aria-label="Licht ${H_esc(r.name)} ${on.length ? 'aus' : 'an'}">${H_icon(on.length ? 'mdi:lightbulb-on' : 'mdi:lightbulb-outline', 22)}</button>` : ''}
        <div><div class="n">${H_esc(r.name)}${link ? `<span class="go">${H_icon('mdi:chevron-right', 16)}</span>` : ''}</div>
        <div class="s">${lights.length ? `<span>${H_icon(on.length ? 'mdi:lightbulb-on' : 'mdi:lightbulb-outline', 14)}${on.length ? `${on.length} an` : 'aus'}</span>` : ''}${hum != null ? `<span>${H_icon('mdi:water-percent', 14)}${H_fmt(hum, 0)} %</span>` : ''}</div>
        ${open.length || heat ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${open.length ? `<span class="badge bad">${H_icon('mdi:window-open-variant', 13)}offen</span>` : ''}${heat ? `<span class="badge heat">${H_icon('mdi:fire', 13)}heizt</span>` : ''}</div>` : ''}</div></div>`;
    }).join('')}</div></div>`).join('');
    if (this.$('rsum')) this.$('rsum').textContent = totOn ? `${totOn} ${totOn === 1 ? 'Licht' : 'Lichter'} an` : 'Alle Lichter aus';
  }
  // ---------- Etagen-Kopf ----------
  r_fh() {
    const el = this.$('fh'); if (!el) return;
    const c = this.c, rooms = this.flo.flatMap(f => f.rooms);
    const temps = rooms.map(r => this.n(r.temperature)).filter(v => v != null), tt = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : null;
    const hums = rooms.map(r => this.n(r.humidity)).filter(v => v != null), hh = hums.length ? hums.reduce((a, b) => a + b, 0) / hums.length : null;
    const allL = rooms.flatMap(r => r.lights || []), onL = allL.map(e => this.s(e)).filter(s => s && s.state === 'on');
    const heat = rooms.filter(r => { const x = this.s(r.climate); return x && x.attributes.hvac_action === 'heating'; }).length;
    const open = rooms.filter(r => (r.windows || []).some(w => (this.s(w.entity || w) || {}).state === 'on')).map(r => r.name);
    const chips = [], H = (k, i, x) => chips.push(`<span class="ch ${k}">${H_icon(i, 15)}${x}</span>`);
    H('', onL.length ? 'mdi:lightbulb-on' : 'mdi:lightbulb-off-outline', onL.length ? `${onL.length} ${onL.length === 1 ? 'Licht' : 'Lichter'} an` : 'Alle Lichter aus');
    if (heat) H('heat', 'mdi:fire', `${heat} ${heat === 1 ? 'Raum heizt' : 'Räume heizen'}`);
    if (open.length) H('bad', 'mdi:window-open-variant', `offen: ${open.map(H_esc).join(', ')}`);
    else if (rooms.some(r => (r.windows || []).length)) H('', 'mdi:window-closed-variant', 'Alle Fenster zu');
    const lit = onL.slice(0, 4).map(s => this.lightRgb(s)), pos = ['15% 20%', '85% 25%', '30% 90%', '80% 85%'];
    el.innerHTML = `<div class="bgx" style="background:${c.background || 'linear-gradient(150deg,#2b3a67,#4a5d8f)'}"></div>${lit.length ? `<div class="gl" style="background:${lit.map((x, i) => `radial-gradient(circle at ${pos[i]},rgba(${x.join(',')},.65),rgba(${x.join(',')},0) 50%)`).join(',')}"></div>` : ''}
      <div class="top">${c.back ? `<button class="back" data-nav="${H_esc(c.back)}">${H_icon('mdi:chevron-left', 20)}Übersicht</button>` : ''}<div class="ttl">${H_icon(c.icon || 'mdi:home', 30)}${H_esc(c.title || c.floor || '')}</div></div>
      <div class="t">${H_fmt(tt)}<small>°C</small><span>Ø ${rooms.length} Räume${hh != null ? ` · ${H_fmt(hh, 0)} % Feuchte` : ''}</span></div>
      <div class="ln">${chips.join('')}${onL.length ? `<button class="off" data-act="off" data-e="${allL.join(',')}">${H_icon('mdi:power', 16)}Alle Lichter aus</button>` : ''}</div>`;
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
        ${dots.length && this.c.tile_rooms !== false ? `<div class="rms">${dots.join('')}</div>` : ''}</div>`;
    }).join('');
  }
  // ---------- Energiefluss ----------
  r_flow() {
    const el = this.$('flow'), e = this.c.energy; if (!el || !e) return;
    const pv = Math.max(0, this.n(e.pv) || 0), home = Math.max(0, this.n(e.home) || 0), imp = Math.max(0, this.n(e.grid_import) || 0), exp = Math.max(0, this.n(e.grid_export) || 0);
    const soc = this.n(e.battery_soc), bp = this.n(e.battery_power) || 0, today = this.n(e.pv_today);
    const chg = Math.max(0, -bp), dis = Math.max(0, bp);
    const pvBat = Math.min(chg, pv), pvGrid = Math.min(exp, Math.max(0, pv - pvBat)), pvHome = Math.max(0, pv - pvBat - pvGrid);
    const fmtW = (w) => w >= 1000 ? `${H_fmt(w / 1000, 1)} kW` : `${H_fmt(w, 0)} W`;
    const self = home > 0 ? Math.min(100, Math.round(Math.max(0, home - imp) / home * 100)) : 0;
    const C = { pv: '#f4b400', grid: '#8a94a3', bat: '#1baf7a', home: '#3987e5' };
    // Linien: id, Pfad, Leistung, Farbe, Richtung (1 = wie gezeichnet)
    const L = [
      ['pvh', 'M342,52 Q356,105 520,105', pvHome, C.pv],
      ['pvg', 'M298,52 Q284,105 120,105', pvGrid, C.pv],
      ['pvb', 'M320,62 L320,148', pvBat, C.pv],
      ['gh', 'M120,105 L520,105', imp, C.grid],
      ['bh', 'M342,158 Q356,105 520,105', dis, C.bat],
    ];
    const dots = L.filter(l => l[2] > 15).map(([id, d, w, col]) => {
      const dur = Math.max(.9, Math.min(4.5, 4.5 - Math.log10(w) * 1.1)).toFixed(2);
      return [0, 1, 2].map(k => `<circle r="4.5" fill="${col}"><animateMotion dur="${dur}s" begin="${(k * dur / 3).toFixed(2)}s" repeatCount="indefinite" path="${d}"/></circle>`).join('');
    }).join('');
    const lines = L.map(([id, d, w, col]) => `<path class="ln" d="${d}" style="${w > 15 ? `stroke:${col};opacity:.55` : ''}"/>`).join('');
    const node = (x, y, col, icon, val, lb, ent, active, side) => `<g class="nd" data-more="${ent}" style="cursor:pointer"><circle class="bg" cx="${x}" cy="${y}" r="30" style="stroke:${active ? col : 'var(--h-line)'}"/>
      <foreignObject x="${x - 13}" y="${y - 13}" width="26" height="26"><div xmlns="http://www.w3.org/1999/xhtml" style="color:${active ? col : 'var(--h-fg2)'};display:flex">${H_icon(icon, 26)}</div></foreignObject>
      ${side ? `<text x="${x + 42}" y="${y - 2}" style="text-anchor:start">${val}</text><text class="lb" x="${x + 42}" y="${y + 16}" style="text-anchor:start">${lb}</text>` : `<text x="${x}" y="${y + 52}">${val}</text><text class="lb" x="${x}" y="${y + 68}">${lb}</text>`}</g>`;
    const gridTxt = exp > imp ? `↑ ${fmtW(exp)}` : imp > 0 ? `↓ ${fmtW(imp)}` : '0 W';
    const batTxt = soc != null ? `${H_fmt(soc, 0)} %` : '–';
    const svg = `<svg viewBox="0 0 640 212" preserveAspectRatio="xMidYMid meet">${lines}${dots}
      ${node(320, 30, C.pv, 'mdi:solar-power-variant', fmtW(pv), 'Solar', e.pv, pv > 15, 1)}
      ${node(90, 105, C.grid, 'mdi:transmission-tower', gridTxt, exp > imp ? 'Einspeisung' : 'Netz', exp > imp ? e.grid_export : e.grid_import, imp > 15 || exp > 15)}
      ${node(550, 105, C.home, 'mdi:home-lightning-bolt-outline', fmtW(home), 'Haus', e.home, true)}
      ${node(320, 180, C.bat, soc > 80 ? 'mdi:battery-high' : soc > 30 ? 'mdi:battery-medium' : 'mdi:battery-low', batTxt, chg > 15 ? `Batterie lädt ${fmtW(chg)}` : dis > 15 ? `Batterie gibt ${fmtW(dis)}` : 'Batterie', e.battery_soc, chg > 15 || dis > 15, 1)}</svg>`;
    const R = 50, U = 2 * Math.PI * R, sc = self >= 60 ? 'var(--h-ok)' : self >= 25 ? 'var(--h-sun)' : 'var(--h-bad)';
    el.innerHTML = `<div style="min-width:0">${svg}</div>
      <div class="st">
        <div class="ring"><svg viewBox="0 0 118 118"><circle cx="59" cy="59" r="${R}" fill="none" stroke="var(--h-line)" stroke-width="11"/><circle cx="59" cy="59" r="${R}" fill="none" stroke="${sc}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${(U * self / 100).toFixed(1)} ${U.toFixed(1)}" style="display:${self > 0 ? '' : 'none'}"/></svg><b>${self} %<small>Autarkie</small></b></div>
        <div class="kv" data-more="${e.pv_today || e.pv}"><span>${H_icon('mdi:white-balance-sunny', 14)}Solar heute</span><b>${H_fmt(today)}<small>kWh</small></b></div>
        <div class="kv" data-more="${e.home}"><span>${H_icon('mdi:home-lightning-bolt-outline', 14)}Verbrauch jetzt</span><b>${fmtW(home).replace(/ (k?W)/, '<small>$1</small>')}</b></div>
        <div class="kv" data-more="${e.battery_soc}"><span>${H_icon('mdi:home-battery-outline', 14)}Hausbatterie ${H_fmt(soc, 0)} %</span><div class="mb"><i style="width:${Math.min(100, soc || 0)}%"></i></div></div>
      </div>`;
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
