// Raum-Karte – eigene Lovelace-Karte im Stil der Wetterstation (v1.20.1)
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
.fx{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:12px;margin-bottom:12px}.fx:empty{display:none}
.fxi{border-radius:22px;overflow:hidden;background:radial-gradient(130% 100% at 50% 0%,#1d2438 0%,#0d111c 70%);color:#fff;display:flex;flex-direction:column;box-shadow:0 10px 26px rgba(0,0,0,.18)}
.fxs{height:190px;padding:0 10px}.fxs svg{width:100%;height:100%;display:block}
.fxb{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:14px;align-items:center;padding:10px 14px 14px}
.fxt{cursor:pointer}.fxt .n{font-weight:650;font-size:15px}.fxt .s{font-size:12.5px;opacity:.7;white-space:nowrap}
.fxb input[type=range]{width:100%;margin:0;accent-color:#ffd27a;cursor:pointer}.fxi:not(.on) .fxb input[type=range]{accent-color:#6b7385}
.sw{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:0 14px 14px}
.swb{width:25px;height:25px;border-radius:50%;border:2px solid rgba(255,255,255,.25);cursor:pointer;padding:0;flex:none;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15)}
.swb.on{border-color:#fff;box-shadow:0 0 0 2px rgba(255,255,255,.35)}
.swd{width:1px;height:20px;background:rgba(255,255,255,.18);margin:0 2px}
.fxs{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;touch-action:manipulation}
.fxp{width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}.fxi.on .fxp{background:#ffd27a;color:#2a1a05;border-color:transparent}
.lt input[type=range]{width:100%;margin:0;accent-color:#fff;cursor:pointer}
.lt:not(.on) input[type=range]{accent-color:var(--r-fg2)}
.scenes{display:flex;flex-wrap:wrap;gap:8px}
.sc{font:inherit;font-size:13px;font-weight:600;border:1px solid var(--r-line);background:var(--r-surface);color:var(--r-fg);border-radius:999px;padding:6px 14px 6px 6px;display:inline-flex;align-items:center;gap:8px;cursor:pointer}
.sc i{width:22px;height:22px;border-radius:50%;flex:none}
.sc.on{background:var(--r-fg);color:var(--r-surface);border-color:transparent}
.covers{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
.covers.scene{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.cvs{display:grid;grid-template-columns:112px minmax(0,1fr) auto;gap:14px;align-items:center;border-radius:22px;padding:14px;background:radial-gradient(130% 100% at 50% 0%,#1d2438 0%,#0d111c 70%);color:#fff;box-shadow:0 10px 26px rgba(0,0,0,.18)}
.cvw{position:relative;cursor:ns-resize;touch-action:none;-webkit-user-select:none;user-select:none}.cvw.np{cursor:default;touch-action:auto}.cvw svg{width:100%;height:auto;max-height:170px;display:block}
.cvp{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);background:rgba(10,14,24,.75);backdrop-filter:blur(6px);border-radius:999px;padding:2px 9px;font-size:12px;font-weight:700;white-space:nowrap;pointer-events:none}
.cvi .n{font-weight:650;font-size:15px}.cvi .s{font-size:12.5px;opacity:.7;margin-bottom:10px}
.cvq{display:flex;flex-wrap:wrap;gap:6px}.chq{font:inherit;font-size:12px;font-weight:600;border-radius:999px;padding:5px 10px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;cursor:pointer}
.cvb{display:flex;flex-direction:column;gap:8px}.ib2{width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}.ib2.mv{background:#ffd27a;color:#2a1a05;border-color:transparent;animation:cvpl 1s infinite}
@keyframes cvpl{50%{opacity:.55}}
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
.ply{position:relative;border-radius:22px;overflow:hidden;color:#fff;background:#141826;box-shadow:0 12px 30px rgba(0,0,0,.22)}
.pbg{position:absolute;inset:-30px;background-size:cover;background-position:center;filter:blur(28px) saturate(1.4);opacity:.75;transform:scale(1.1)}
.psh{position:absolute;inset:0;background:linear-gradient(160deg,rgba(14,18,30,.35),rgba(14,18,30,.85))}
.ply>*:not(.pbg):not(.psh){position:relative}
.pin{display:grid;grid-template-columns:128px minmax(0,1fr);gap:18px;padding:18px 18px 10px;align-items:center}
.pcv{position:relative;width:128px;height:128px;border-radius:18px;overflow:hidden;background:linear-gradient(135deg,#3a4a8a,#8a3a7a);display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(0,0,0,.4)}
.pcv img{width:100%;height:100%;object-fit:cover}
.pst{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:10px;text-align:center}.pst b{font-size:19px;font-weight:800;line-height:1.1;letter-spacing:-.01em;overflow-wrap:anywhere}
.plb{font-size:12px;opacity:.75;display:flex;align-items:center;gap:5px;text-transform:none}
.pti{font-size:22px;font-weight:700;line-height:1.15;margin-top:4px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.par{font-size:14px;opacity:.8;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ppg{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:11.5px;opacity:.85;font-variant-numeric:tabular-nums}.pgb{flex:1;height:5px;border-radius:3px;background:rgba(255,255,255,.2);overflow:hidden}.pgb i{display:block;height:100%;background:#fff;border-radius:3px}
.plive{display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:rgba(255,255,255,.14);border-radius:999px;padding:3px 10px}.plive i{width:7px;height:7px;border-radius:50%;background:#ff5a5a}.ply.plyon .plive i{animation:cvpl 1.2s infinite}
.pct{display:flex;align-items:center;gap:10px;margin-top:12px}
.pb ha-icon,.rk ha-icon,.ib2 ha-icon,.fxp ha-icon{display:flex;align-items:center;justify-content:center;margin:auto}.pb,.rk,.ib2,.fxp{padding:0;line-height:1}
.pb{width:40px;height:40px;border-radius:50%;border:none;background:rgba(255,255,255,.1);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}.pb.big{width:58px;height:58px;background:#fff;color:#141826}.pb.act{background:#ffd27a;color:#2a1a05}.pb.sm{width:34px;height:34px;background:transparent}
.pvo{display:flex;align-items:center;gap:8px;padding:4px 18px 8px}.pvo input{flex:1;accent-color:#fff}.pvo span{font-size:12px;opacity:.8;min-width:38px;text-align:right;font-variant-numeric:tabular-nums}
.pfv{display:flex;gap:8px;overflow-x:auto;padding:4px 18px 16px;scrollbar-width:none}.pfv::-webkit-scrollbar{display:none}
.pfc{flex:none;font:inherit;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:7px 13px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);color:#fff;cursor:pointer}.pfc.on{background:#fff;color:#141826;border-color:transparent}
.eq{position:absolute;right:8px;bottom:8px;display:flex;gap:2px;align-items:flex-end;height:16px;padding:3px 4px;border-radius:6px;background:rgba(0,0,0,.45)}.eq b{width:3px;background:#fff;border-radius:1px;animation:eqb 1s infinite ease-in-out}.eq b:nth-child(2){animation-delay:-.4s}.eq b:nth-child(3){animation-delay:-.7s}.eq b:nth-child(4){animation-delay:-.2s}
.eq.sm{position:static;background:none;padding:0;height:12px}.eq.sm b{background:#141826}
@keyframes eqb{0%,100%{height:25%}50%{height:100%}}
.tvc{position:relative;border-radius:22px;overflow:hidden;color:#fff;background:#11151f;box-shadow:0 12px 30px rgba(0,0,0,.22)}
.tvi{position:relative;aspect-ratio:16/9;max-height:260px;width:100%;background:radial-gradient(120% 120% at 30% 20%,#25304f,#0d111c);overflow:hidden}
.tvi img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.tvn{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:.35}
.tvg{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,12,20,.45) 0%,rgba(10,12,20,0) 35%,rgba(10,12,20,.15) 55%,rgba(10,12,20,.92) 100%)}
.tvt{position:absolute;left:14px;right:14px;top:12px;display:flex;gap:8px;align-items:center}.tvt .plive{margin-top:0}
.tvch{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;background:rgba(10,14,24,.6);backdrop-filter:blur(6px);border-radius:999px;padding:3px 10px}
.tvb{position:absolute;left:16px;right:16px;bottom:12px}.tvb .pti{font-size:24px;text-shadow:0 2px 8px rgba(0,0,0,.5)}
.tvl{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:clamp(30px,8vw,54px);font-weight:800;letter-spacing:-.02em;opacity:.22;text-align:center;padding:0 20px}
.tvp{font-weight:800;opacity:.6;font-size:15px}
.rmt{display:flex;flex-wrap:wrap;justify-content:space-around;gap:12px;align-items:center;padding:6px 12px 4px}
.rpad{display:grid;grid-template-columns:repeat(3,40px);grid-template-rows:repeat(3,40px);gap:4px;background:rgba(255,255,255,.06);border-radius:50%;padding:8px}
.rpad .u{grid-column:2;grid-row:1}.rpad .l{grid-column:1;grid-row:2}.rpad .ok{grid-column:2;grid-row:2;background:#fff;color:#141826;font-weight:800;font-size:13px}.rpad .r{grid-column:3;grid-row:2}.rpad .d{grid-column:2;grid-row:3}
.rk{width:40px;height:40px;border-radius:50%;border:none;background:rgba(255,255,255,.1);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font:inherit}.rpad .rk:not(.ok){background:transparent}
.rcol{display:grid;grid-template-columns:repeat(2,40px);gap:8px;justify-content:center}
.tvc2 .pct{padding:12px 16px 4px;margin-top:0;justify-content:center}
.aq{display:grid;grid-template-columns:120px minmax(0,1fr);gap:6px 16px;border-radius:22px;padding:16px;color:#fff;background:radial-gradient(120% 100% at 0% 0%,color-mix(in srgb,var(--aq) 22%,#1b2234) 0%,#0e121c 70%);box-shadow:0 12px 30px rgba(0,0,0,.2)}
.aqv{grid-row:span 1}.aqs{width:126px;height:auto;display:block}
.aqs .fl{opacity:0;animation:aqfl 2.4s infinite ease-out}.aqs .f1{animation-delay:.8s}.aqs .f2{animation-delay:1.6s}
@keyframes aqfl{0%{opacity:0;transform:translateY(8px)}30%{opacity:.9}100%{opacity:0;transform:translateY(-14px)}}
.aqi{align-self:center;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 10px;align-items:center}.aqi>div{grid-column:1}.aqi .aqp{grid-column:2;grid-row:1/span 3}.aql{font-size:12px;opacity:.7;text-transform:uppercase;letter-spacing:.06em}.aqq{font-size:clamp(20px,5.2vw,28px);overflow-wrap:anywhere;font-weight:700;color:var(--aq);line-height:1.1;margin:2px 0 4px}.aqs2{font-size:13px;opacity:.8}
.aqp.on{background:var(--aq);color:#0c1a10;border-color:transparent}
.aqm,.aqx{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px}
.aqb{font:inherit;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:7px 12px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.07);color:#fff;cursor:pointer}.aqb.on{background:var(--aq);color:#0c1a10;border-color:transparent}
.aqt{font:inherit;font-size:12.5px;display:inline-flex;align-items:center;gap:6px;border-radius:14px;padding:7px 10px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#fff;cursor:pointer}.aqt b{font-weight:700;opacity:.8}.aqt.on{border-color:rgba(255,255,255,.4);background:rgba(255,255,255,.14)}
.aqf{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 12px;align-items:center;margin-top:4px}.aqf>div:first-child{display:flex;justify-content:space-between;gap:8px;font-size:12.5px;opacity:.85}.aqf>div:first-child span{display:inline-flex;align-items:center;gap:5px}
.aqf .mb{grid-column:1;height:6px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden}.aqf .mb i{display:block;height:100%;background:var(--aq)}.aqr{grid-column:2;grid-row:1/span 2;color:#fff;border-color:rgba(255,255,255,.25)}
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
    this.c = { lights: [], switches: [], sockets: [], covers: [], media: [], power: [], windows: [], batteries: [], locks: [], fixtures: [], ...c };
  }
  getCardSize() { return 16; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  s(e) { return e && this._hass ? this._hass.states[e] : undefined; }
  n(e) { const s = this.s(e); const v = s ? parseFloat(s.state) : NaN; return isNaN(v) ? null : v; }
  call(d, sv, data) { return this._hass.callService(d, sv, data); }
  set hass(h) {
    this._hass = h;
    if (!this.root) this.build();
    const parts = { hero: this.kHero(), locks: this.kLocks(), lights: this.kLights(), sockets: this.kSockets(), scenes: this.kScenes(), covers: this.kCovers(), purifier: this.kPurifier(), media: this.kMedia(), power: this.kPower(), status: this.kStatus() };
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
      ${c.lights.length || c.switches.length ? `<div class="blk full"><div class="bh"><h2>${R_icon('mdi:lightbulb-group', 20)}Licht</h2><div id="lact"></div></div><div class="fx" id="fixtures"></div><div class="lights" id="lights"></div></div>` : ''}
      ${c.sockets.length ? `<div class="blk full"><div class="bh"><h2>${R_icon(c.sockets_icon || 'mdi:power-socket-de', 20)}${R_esc(c.sockets_title || 'Steckdosen')}</h2></div><div class="lights" id="sockets"></div></div>` : ''}
      ${c.scene_select ? `<div class="blk full"><div class="bh"><h2>${R_icon('mdi:palette', 20)}Lichtszenen</h2><button class="btn" data-act="scmore" id="scmore"></button></div><div class="scenes" id="scenes"></div></div>` : ''}
      ${c.locks.length ? `<div class="blk half"><div class="bh"><h2>${R_icon('mdi:lock-smart', 20)}Türschloss</h2></div><div class="locks" id="locks"></div></div>` : ''}
      ${c.covers.length ? `<div class="blk half"><div class="bh"><h2>${R_icon('mdi:window-shutter', 20)}Rollläden</h2><div style="display:flex;gap:6px"><button class="btn" data-act="covall" data-sv="open_cover">${R_icon('mdi:arrow-up', 16)}Alle auf</button><button class="btn" data-act="covall" data-sv="close_cover">${R_icon('mdi:arrow-down', 16)}Alle zu</button></div></div><div class="covers" id="covers"></div></div>` : ''}
      ${c.purifier ? `<div class="blk half"><div class="bh"><h2>${R_icon('mdi:air-purifier', 20)}${R_esc(c.purifier.name || 'Luftreiniger')}</h2></div><div id="purifier"></div></div>` : ''}
      ${c.media.length ? `<div class="blk half"><div class="bh"><h2>${R_icon('mdi:television-play', 20)}Medien</h2></div><div class="media" id="media"></div></div>` : ''}
      ${c.power.length ? `<div class="blk half"><div class="bh"><h2>${R_icon('mdi:lightning-bolt', 20)}Strom jetzt</h2><p>Leistung der Messsteckdosen</p></div><div class="pw" id="power"></div></div>` : ''}
      ${c.temperature ? `<div class="blk half"><div class="bh"><h2>${R_icon('mdi:chart-bell-curve', 20)}Raumklima · 24 h</h2><p id="histsub"></p></div><div class="spark" id="spark"><div class="msg">Lade Verlauf …</div></div></div>` : ''}
      ${c.windows.length || c.batteries.length ? `<div class="blk full"><div class="bh"><h2>${R_icon('mdi:shield-check-outline', 20)}Status</h2></div><div class="st" id="status"></div></div>` : ''}
    </div>`;
    this.$ = (id) => this.root.getElementById(id);
    const R = this.root;
    R.addEventListener('click', (ev) => this.onClick(ev));
    R.addEventListener('pointerdown', (ev) => { const t = ev.target.closest('[data-busy]'); if (t) this._busy = t.dataset.busy; });
    // Langes Drücken auf eine Kugel, einen Spot oder eine Pendelleuchte öffnet den Farbdialog genau dieser Lampe
    const lpEnd = () => { clearTimeout(this._lpT); this._lpT = null; };
    R.addEventListener('pointerdown', (ev) => {
      const g = ev.target.closest('.fxs [data-act=toggle]'); if (!g) return;
      const x0 = ev.clientX, y0 = ev.clientY; this._lpXY = [x0, y0]; lpEnd();
      this._lpT = setTimeout(() => { this._lpT = null; this._lp = Date.now(); if (navigator.vibrate) navigator.vibrate(15); this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: g.dataset.e } })); }, 550);
    });
    R.addEventListener('pointermove', (ev) => { if (this._lpT && this._lpXY && Math.hypot(ev.clientX - this._lpXY[0], ev.clientY - this._lpXY[1]) > 10) lpEnd(); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => R.addEventListener(n, lpEnd));
    R.addEventListener('contextmenu', (ev) => { if (ev.target.closest('.fxs')) ev.preventDefault(); });
    // Rollladen-Bild: senkrecht ziehen setzt die Position, beim Loslassen wird sie gesendet
    R.addEventListener('pointerdown', (ev) => {
      const sv = ev.target.closest('.cvsvg'); if (!sv) return;
      ev.preventDefault(); this._busy = 'covers'; const r = sv.getBoundingClientRect(), vb = sv.viewBox.baseVal, k = r.height / vb.height, gy = +sv.dataset.gy, gh = +sv.dataset.gh;
      const lab = sv.parentElement.querySelector('.cvp'), shg = sv.querySelector('.cvsh');
      const pos = (y) => Math.max(0, Math.min(100, Math.round((100 - ((y - r.top) / k - gy) / gh * 100) / 5) * 5));
      const draw = (p) => { lab.textContent = p >= 99 ? 'offen' : p <= 1 ? 'zu' : p + ' %'; shg.style.transition = 'none'; shg.setAttribute('transform', `translate(0 ${Math.round(gh * (100 - p) / 100) - gh})`); };
      let p = pos(ev.clientY); draw(p);
      const mvh = (e2) => { p = pos(e2.clientY); draw(p); };
      const up = () => { window.removeEventListener('pointermove', mvh); window.removeEventListener('pointerup', up); this.call('cover', 'set_cover_position', { entity_id: sv.dataset.e, position: p }); setTimeout(() => this.release(), 600); };
      window.addEventListener('pointermove', mvh); window.addEventListener('pointerup', up);
    });
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
    if (this._lp && Date.now() - this._lp < 800) { this._lp = 0; return; }
    const ids = e && e.includes(',') ? e.split(',') : e;
    if (a === 'toggle') this.call(e.split('.')[0], 'toggle', { entity_id: e });
    else if (a === 'gtog') this.call('light', t.dataset.on === '1' ? 'turn_off' : 'turn_on', { entity_id: ids });
    else if (a === 'color') this.call('light', 'turn_on', t.dataset.k ? { entity_id: ids, color_temp_kelvin: +t.dataset.k } : { entity_id: ids, rgb_color: t.dataset.rgb.split(',').map(Number) });
    else if (a === 'alloff') this.call('homeassistant', 'turn_off', { entity_id: [...this.c.lights.map(x => x.entity), ...this.c.switches.filter(x => !x.keep).map(x => x.entity)] });
    else if (a === 'scene') this.call('select', 'select_option', { entity_id: this.c.scene_select, option: t.dataset.o });
    else if (a === 'scmore') { this._scAll = !this._scAll; this.r_scenes(); }
    else if (a === 'lock') { const sv = t.dataset.sv; if (sv !== 'lock' && !window.confirm(sv === 'open' ? 'Tür wirklich öffnen?' : 'Tür wirklich aufschließen?')) return; this.call('lock', sv, { entity_id: e }); }
    else if (a === 'cov') this.call('cover', t.dataset.sv, { entity_id: e });
    else if (a === 'covp') this.call('cover', 'set_cover_position', { entity_id: e, position: +t.dataset.p });
    else if (a === 'covall') this.call('cover', t.dataset.sv, { entity_id: this.c.covers.map(x => x.entity) });
    else if (a === 'temp') { const s = this.s(this.c.climate), st = s.attributes.target_temp_step || 0.5; const v = Math.round(((this._tgt ?? s.attributes.temperature) + st * +t.dataset.d) * 2) / 2; this._tgt = Math.min(s.attributes.max_temp, Math.max(s.attributes.min_temp, v)); this.r_hero(); clearTimeout(this._tt); this._tt = setTimeout(() => { this.call('climate', 'set_temperature', { entity_id: this.c.climate, temperature: this._tgt }); setTimeout(() => { this._tgt = null; }, 4000); }, 900); }
    else if (a === 'hvac') { const s = this.s(this.c.climate); this.call('climate', 'set_hvac_mode', { entity_id: this.c.climate, hvac_mode: s.state === 'off' ? (s.attributes.hvac_modes.find(m => m !== 'off') || 'heat') : 'off' }); }
    else if (a === 'mp') { const sv = t.dataset.sv, A = (this.s(e) || { attributes: {} }).attributes; this.call('media_player', sv, sv === 'shuffle_set' ? { entity_id: e, shuffle: !A.shuffle } : sv === 'repeat_set' ? { entity_id: e, repeat: A.repeat === 'off' ? 'all' : A.repeat === 'all' ? 'one' : 'off' } : sv === 'volume_mute' ? { entity_id: e, is_volume_muted: !A.is_volume_muted } : { entity_id: e }); }
    else if (a === 'pmode') this.call('fan', 'set_preset_mode', { entity_id: e, preset_mode: t.dataset.m });
    else if (a === 'freset') { if (window.confirm('Filter wirklich als neu gewechselt zurücksetzen?')) this.call('button', 'press', { entity_id: e }); }
    else if (a === 'rc') this.call('remote', 'send_command', { entity_id: e, command: t.dataset.c });
    else if (a === 'stn') this.call('music_assistant', 'play_media', { entity_id: e, media_id: t.dataset.u, media_type: 'radio' });
    else if (a === 'app') this.call('media_player', 'play_media', { entity_id: e, media_content_type: 'app', media_content_id: t.dataset.id });
    else if (a === 'srcb') this.call('media_player', 'select_source', { entity_id: e, source: t.dataset.o });
    else if (a === 'more') this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: e } }));
  }
  onChange(ev) {
    const t = ev.target, a = t.dataset.act, e = t.dataset.e;
    if (a === 'bri') this.call('light', 'turn_on', { entity_id: e.includes(',') ? e.split(',') : e, brightness_pct: +t.value });
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
  kHero() { const c = this.c; return this.ks([c.temperature, c.humidity, c.climate, c.scene_select, ...c.windows, ...c.lights.map(x => x.entity), ...c.switches.map(x => x.entity), ...c.media.map(x => x.entity), ...c.power.map(x => x.entity)]) + (this._tgt ?? ''); }
  r_hero() {
    const c = this.c, cl0 = this.s(c.climate), cl = cl0 && !['unavailable', 'unknown'].includes(cl0.state) ? cl0 : null, t = this.n(c.temperature) ?? (cl && cl.attributes.current_temperature), hum = this.n(c.humidity) ?? (cl && cl.attributes.current_humidity);
    // Lichtschalter (switches ohne `keep`) zählen im Kopf wie Lichter
    const LL = [...c.lights, ...c.switches.filter(x => !x.keep)];
    const cols = LL.map(x => ({ rgb: this.lightColor(this.s(x.entity)), b: (this.s(x.entity) || { attributes: {} }).attributes.brightness || 200 })).filter(x => x.rgb);
    const blobs = this.$('glow').children, pos = [[5, 0], [50, -5], [20, 45], [60, 40], [35, 15]];
    for (let i = 0; i < blobs.length; i++) {
      const L = cols[i % (cols.length || 1)];
      blobs[i].style.left = pos[i][0] + '%'; blobs[i].style.top = pos[i][1] + '%';
      blobs[i].style.background = L ? `radial-gradient(circle,rgba(${L.rgb.join(',')},${0.55 + 0.45 * L.b / 255}) 0%,rgba(${L.rgb.join(',')},0) 70%)` : (i < 2 ? 'radial-gradient(circle,rgba(70,90,170,.55) 0%,rgba(70,90,170,0) 70%)' : 'none');
    }
    const chips = [], ch = (i, s, k = '') => chips.push(`<span class="chip ${k}">${R_icon(i, 15)}${s}</span>`);
    const onL = LL.filter(x => (this.s(x.entity) || {}).state === 'on').length;
    if (LL.length) ch(onL ? 'mdi:lightbulb-on' : 'mdi:lightbulb-off-outline', onL ? `${onL} von ${LL.length} Lichtern an` : 'Licht aus');
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
  kLights() { return this.ks([...this.c.fixtures.flatMap(f => [f.entity, f.up, f.down, f.socket, f.power, ...(f.bulbs || [])]), ...this.c.lights.map(x => x.entity), ...this.c.lights.map(x => x.socket), ...this.c.switches.map(x => x.entity), ...this.c.switches.map(x => x.power)]); }
  kSockets() { return this.ks([...this.c.sockets.map(x => x.entity), ...this.c.sockets.map(x => x.power)]); }
  r_sockets() { const el = this.$('sockets'); if (!el) return; el.innerHTML = this.c.sockets.map(x => this.swTile(x)).join(''); this.keyNav(el); }
  r_lights() {
    const el = this.$('lights'); if (!el) return;
    const any = [...this.c.lights, ...this.c.switches.filter(x => !x.keep)].some(x => (this.s(x.entity) || {}).state === 'on');
    this.$('lact').innerHTML = any ? `<button class="btn" data-act="alloff">${R_icon('mdi:power', 16)}Alles aus</button>` : '';
    const fxE = new Set(this.c.fixtures.flatMap(f => [f.entity, f.up, f.down, ...(f.bulbs || [])]).filter(Boolean));
    const fxEl = this.$('fixtures'); if (fxEl) fxEl.innerHTML = this.c.fixtures.map(f => this.fixture(f)).join('');
    const tiles = this.c.lights.map(x => {
      const s = this.s(x.entity); if (!s || fxE.has(x.entity)) return '';
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
    el.innerHTML = tiles.join('') + this.c.switches.filter(x => !fxE.has(x.entity)).map(x => this.swTile(x)).join('');
    this.keyNav(el);
  }
  // Leuchten als Bild: 'globes' (Pendel mit Glaskugeln), 'bar' (Balken mit Up- und Downlight), 'spots' (Einbaustrahler in der Decke), 'pendants' (Pendelleuchten an einer Deckenschiene), 'lantern' (Laterne mit Glühbirnen, optional `socket`), 'nightstands' (zwei Rattan-Nachttischlampen am Bett), 'go' (Hue Go hinter dem Fernseher, `side: left|right`, sonst mittig), 'ceiling' (flache Rattan-Deckenleuchte, auch für switch.*, optional `power`), 'panel' (LED-Deckenpanel, `shape: square` für quadratisch), 'mirror' (Spiegelschrank mit LED-Leiste); ohne `entity` wirken Schalter, Helligkeit und Farbe auf alle `bulbs`
  fixture(f) {
    const st = (e) => this.s(e), on = (e) => (st(e) || {}).state === 'on', col = (e) => this.lightColor(st(e)), al = (e) => on(e) ? 0.35 + 0.65 * ((st(e).attributes.brightness || 255) / 255) : 0;
    const rgba = (c, a) => `rgba(${c.join(',')},${a.toFixed(2)})`;
    const id = (f.entity || f.up || (f.bulbs || [])[0] || 'fx').replace(/\W/g, '');
    let svg = '', ents = [];
    if (f.type === 'globes') {
      ents = f.bulbs || [];
      const P = [[72, 128], [122, 84], [172, 150], [222, 110], [22, 100]];
      const gl = ents.map((e, i) => {
        const [x, y] = P[i % P.length], c = col(e), a = al(e), g = `${id}g${i}`;
        return `<g data-act="toggle" data-e="${e}" style="cursor:pointer">
          <line x1="${x}" y1="0" x2="${x}" y2="${y - 30}" stroke="#05070c" stroke-width="2.5"/><rect x="${x - 6}" y="${y - 34}" width="12" height="7" rx="2" fill="#2a1d16"/>
          ${c ? `<circle cx="${x}" cy="${y}" r="62" fill="url(#${g}h)" opacity="${a.toFixed(2)}"/>` : ''}
          <defs><radialGradient id="${g}h"><stop offset="0" stop-color="${c ? rgba(c, .75) : '#000'}"/><stop offset="1" stop-color="${c ? rgba(c, 0) : '#000'}"/></radialGradient>
          <radialGradient id="${g}f" cx=".5" cy=".62" r=".6"><stop offset="0" stop-color="${c ? '#fff' : '#3a4152'}"/><stop offset=".28" stop-color="${c ? rgba(c, 1) : '#262c3a'}"/><stop offset="1" stop-color="${c ? rgba(c.map(v => v * .55), .85) : '#161b26'}"/></radialGradient></defs>
          <circle cx="${x}" cy="${y}" r="28" fill="url(#${g}f)" stroke="${c ? rgba(c, .9) : 'rgba(255,255,255,.18)'}" stroke-width="1.5"/>
          <ellipse cx="${x - 9}" cy="${y - 11}" rx="8" ry="5" fill="#fff" opacity=".22" transform="rotate(-30 ${x - 9} ${y - 11})"/></g>`;
      }).join('');
      svg = `<svg viewBox="0 0 244 200" preserveAspectRatio="xMidYMid meet">${gl}</svg>`;
    } else if (f.type === 'bar') {
      ents = [f.up, f.down].filter(Boolean);
      const cu = col(f.up), cd = col(f.down), au = al(f.up), ad = al(f.down);
      svg = `<svg viewBox="0 0 244 200" preserveAspectRatio="xMidYMid meet"><defs>
        <linearGradient id="${id}u" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${cu ? rgba(cu, .85) : '#000'}"/><stop offset="1" stop-color="${cu ? rgba(cu, 0) : '#000'}"/></linearGradient>
        <linearGradient id="${id}d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cd ? rgba(cd, .9) : '#000'}"/><stop offset="1" stop-color="${cd ? rgba(cd, 0) : '#000'}"/></linearGradient></defs>
        <g data-act="toggle" data-e="${f.up}" style="cursor:pointer"><rect x="0" y="0" width="244" height="104" fill="transparent"/>${cu ? `<path d="M14,104 L230,104 L244,0 L0,0 Z" fill="url(#${id}u)" opacity="${au.toFixed(2)}"/>` : ''}</g>
        <g data-act="toggle" data-e="${f.down}" style="cursor:pointer"><rect x="0" y="126" width="244" height="74" fill="transparent"/>${cd ? `<path d="M26,126 L218,126 L244,200 L0,200 Z" fill="url(#${id}d)" opacity="${ad.toFixed(2)}"/>` : ''}</g>
        <line x1="70" y1="0" x2="70" y2="104" stroke="${cu ? rgba(cu, .9) : '#0a0d14'}" stroke-width="1.5"/><line x1="174" y1="0" x2="174" y2="104" stroke="${cu ? rgba(cu, .9) : '#0a0d14'}" stroke-width="1.5"/>
        <rect x="16" y="104" width="212" height="22" rx="11" fill="#0b0e16" stroke="rgba(255,255,255,.12)"/>
        <rect x="24" y="103" width="196" height="3" rx="1.5" fill="${cu ? rgba(cu, 1) : '#2a3040'}"/>
        <rect x="24" y="124" width="196" height="3" rx="1.5" fill="${cd ? rgba(cd, 1) : '#2a3040'}"/></svg>`;
    } else if (f.type === 'spots') {
      ents = f.bulbs || [];
      const n = ents.length || 1, xs = ents.map((e, i) => 244 * (i + .5) / n);
      const sp = ents.map((e, i) => {
        const x = xs[i], c = col(e), a = al(e), g = `${id}s${i}`;
        return `<g data-act="toggle" data-e="${e}" style="cursor:pointer"><rect x="${x - 122 / n}" y="0" width="${244 / n}" height="200" fill="transparent"/>
          ${c ? `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${rgba(c, .75)}"/><stop offset="1" stop-color="${rgba(c, 0)}"/></linearGradient><radialGradient id="${g}r"><stop offset="0" stop-color="${rgba(c, .55)}"/><stop offset="1" stop-color="${rgba(c, 0)}"/></radialGradient></defs>
          <path d="M${x - 15},40 L${x + 15},40 L${x + 62},196 L${x - 62},196 Z" fill="url(#${g})" opacity="${a.toFixed(2)}"/><ellipse cx="${x}" cy="190" rx="70" ry="12" fill="url(#${g}r)" opacity="${a.toFixed(2)}"/><ellipse cx="${x}" cy="36" rx="44" ry="14" fill="url(#${g}r)" opacity="${a.toFixed(2)}"/>` : ''}
          <ellipse cx="${x}" cy="36" rx="19" ry="6" fill="${c ? '#fff' : '#141824'}" stroke="${c ? rgba(c, 1) : 'rgba(255,255,255,.25)'}" stroke-width="2.5"/></g>`;
      }).join('');
      svg = `<svg viewBox="0 0 244 200" preserveAspectRatio="xMidYMid meet">${sp}</svg>`;
    } else if (f.type === 'pendants') {
      ents = f.bulbs || [];
      const n = ents.length || 1, xs = ents.map((e, i) => 50 + 144 * (n > 1 ? i / (n - 1) : .5));
      const pd = ents.map((e, i) => {
        const x = xs[i], c = col(e), a = al(e), g = `${id}p${i}`;
        return `<g data-act="toggle" data-e="${e}" style="cursor:pointer"><rect x="${x - 72 / n}" y="0" width="${144 / n}" height="200" fill="transparent"/>
          ${c ? `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${rgba(c, .8)}"/><stop offset="1" stop-color="${rgba(c, 0)}"/></linearGradient><radialGradient id="${g}r"><stop offset="0" stop-color="${rgba(c, .6)}"/><stop offset="1" stop-color="${rgba(c, 0)}"/></radialGradient></defs>
          <path d="M${x - 9},132 L${x + 9},132 L${x + 34},198 L${x - 34},198 Z" fill="url(#${g})" opacity="${a.toFixed(2)}"/><ellipse cx="${x}" cy="193" rx="40" ry="8" fill="url(#${g}r)" opacity="${a.toFixed(2)}"/>` : ''}
          <line x1="${x}" y1="14" x2="${x}" y2="92" stroke="#05070c" stroke-width="2"/>
          <path d="M${x - 9},92 L${x + 9},92 L${x + 10},96 L${x + 10},128 L${x + 9},132 L${x - 9},132 L${x - 10},128 L${x - 10},96 Z" fill="#0a0c12" stroke="rgba(255,255,255,.16)"/>
          <line x1="${x - 3}" y1="96" x2="${x - 3}" y2="128" stroke="rgba(255,255,255,.07)" stroke-width="3"/>
          <ellipse cx="${x}" cy="132" rx="8" ry="2.2" fill="${c ? rgba(c, 1) : '#232838'}"/></g>`;
      }).join('');
      svg = `<svg viewBox="0 0 244 200" preserveAspectRatio="xMidYMid meet"><rect x="${xs[0] - 22}" y="6" width="${xs[n - 1] - xs[0] + 44}" height="8" rx="2" fill="#0a0c12" stroke="rgba(255,255,255,.14)"/>${pd}</svg>`;
    } else if (f.type === 'lantern') {
      ents = f.bulbs || [];
      const P = [[102, 112], [142, 86], [124, 138], [110, 74]], so = f.socket && st(f.socket), sOff = so && so.state !== 'on';
      const bl = ents.map((e, i) => {
        const [x, y] = P[i % P.length], c = sOff ? null : col(e), a = al(e), g = `${id}l${i}`;
        return `<g data-act="toggle" data-e="${sOff ? f.socket : e}" style="cursor:pointer"><rect x="${x - 18}" y="${y - 20}" width="36" height="${196 - y + 20}" fill="transparent"/>
          ${c ? `<defs><radialGradient id="${g}"><stop offset="0" stop-color="${rgba(c, .8)}"/><stop offset="1" stop-color="${rgba(c, 0)}"/></radialGradient></defs><circle cx="${x}" cy="${y - 2}" r="46" fill="url(#${g})" opacity="${a.toFixed(2)}"/>` : ''}
          <line x1="${x}" y1="${y + 24}" x2="${x}" y2="186" stroke="#0a0c12" stroke-width="3"/><rect x="${x - 6}" y="${y + 9}" width="12" height="16" rx="2" fill="#11141c" stroke="rgba(255,255,255,.12)"/><rect x="${x - 4.5}" y="${y + 5}" width="9" height="5" fill="#8b8f98"/>
          <path d="M${x - 4.5},${y + 5} C${x - 5},${y + 1} ${x - 11},${y - 3} ${x - 11},${y - 10} A11,11 0 1 1 ${x + 11},${y - 10} C${x + 11},${y - 3} ${x + 5},${y + 1} ${x + 4.5},${y + 5} Z" fill="${c ? rgba(c, .35) : 'rgba(255,255,255,.05)'}" stroke="${c ? rgba(c, .9) : 'rgba(255,255,255,.28)'}" stroke-width="1.2"/>
          <path d="M${x - 3},${y + 4} L${x - 3},${y - 14} M${x + 3},${y + 4} L${x + 3},${y - 14}" stroke="${c ? '#fff3c4' : 'rgba(255,255,255,.22)'}" stroke-width="${c ? 1.8 : 1}" stroke-linecap="round"/></g>`;
      }).join('');
      svg = `<svg viewBox="0 0 244 200" preserveAspectRatio="xMidYMid meet">
        <rect x="70" y="22" width="104" height="168" fill="rgba(255,255,255,.035)"/>
        <line x1="86" y1="28" x2="86" y2="184" stroke="#151924" stroke-width="3"/><line x1="158" y1="28" x2="158" y2="184" stroke="#151924" stroke-width="3"/>
        ${bl}
        <rect x="104" y="4" width="36" height="5" rx="1" fill="#0a0c12" stroke="rgba(255,255,255,.14)"/><rect x="118" y="8" width="8" height="10" fill="#0a0c12"/>
        <rect x="64" y="16" width="116" height="10" rx="1.5" fill="#0a0c12" stroke="rgba(255,255,255,.16)"/>
        <rect x="70" y="26" width="6" height="162" fill="#0a0c12" stroke="rgba(255,255,255,.1)"/><rect x="168" y="26" width="6" height="162" fill="#0a0c12" stroke="rgba(255,255,255,.1)"/>
        <rect x="66" y="186" width="112" height="9" rx="1.5" fill="#0a0c12" stroke="rgba(255,255,255,.16)"/></svg>`;
      if (sOff) f = { ...f, _sOff: true };
    } else if (f.type === 'nightstands') {
      // Zwei Nachttischlampen (Rattan-Korb auf Holzfuß) links und rechts vom Bett
      ents = f.bulbs || [];
      const X = [37, 207];
      const lamp = (e, i) => {
        const x = X[i % 2], c = col(e), a = al(e), g = `${id}n${i}`;
        const body = `M${x - 12},92 C${x - 25},96 ${x - 23},128 ${x - 13},135 L${x + 13},135 C${x + 23},128 ${x + 25},96 ${x + 12},92 Z`;
        let lat = ''; for (let k = -54; k <= 54; k += 6) lat += `M${x + k - 26},138 L${x + k + 26},88 M${x + k + 26},138 L${x + k - 26},88 `;
        return `<g data-act="toggle" data-e="${e}" style="cursor:pointer"><rect x="${x - 34}" y="52" width="68" height="120" fill="transparent"/>
          <defs><clipPath id="${g}c"><path d="${body}"/></clipPath>
          ${c ? `<radialGradient id="${g}h"><stop offset="0" stop-color="${rgba(c, .7)}"/><stop offset="1" stop-color="${rgba(c, 0)}"/></radialGradient>
          <radialGradient id="${g}f" cx=".5" cy=".55" r=".65"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${rgba(c, 1)}"/><stop offset="1" stop-color="${rgba(c.map(v => v * .6), 1)}"/></radialGradient>` : ''}</defs>
          ${c ? `<circle cx="${x}" cy="112" r="66" fill="url(#${g}h)" opacity="${a.toFixed(2)}"/><ellipse cx="${x}" cy="142" rx="34" ry="5" fill="${rgba(c, .5)}" opacity="${a.toFixed(2)}"/>` : ''}
          <path d="${body}" fill="${c ? `url(#${g}f)` : '#1d1a17'}"/>
          <path d="${lat}" clip-path="url(#${g}c)" stroke="${c ? '#b98a4f' : '#5c4a36'}" stroke-width="2.4" fill="none"/>
          <path d="${body}" fill="none" stroke="${c ? '#c99d62' : '#4a3c2d'}" stroke-width="1.2"/>
          <ellipse cx="${x}" cy="92" rx="12" ry="3" fill="${c ? rgba(c, .9) : '#100e0c'}" stroke="${c ? '#c99d62' : '#4a3c2d'}"/>
          <rect x="${x - 14}" y="134" width="28" height="7" rx="3" fill="${c ? '#c08d58' : '#4b3a29'}"/></g>`;
      };
      const stand = (x) => `<rect x="${x - 29}" y="142" width="58" height="28" rx="3" fill="#1b1f29" stroke="rgba(255,255,255,.16)"/><line x1="${x - 29}" y1="156" x2="${x + 29}" y2="156" stroke="rgba(255,255,255,.1)"/><circle cx="${x}" cy="163" r="2" fill="rgba(255,255,255,.35)"/>`;
      const tufts = [0, 1, 2, 3, 4, 5].map(k => `<circle cx="${94 + k * 11.2}" cy="112" r="1.2" fill="rgba(0,0,0,.35)"/>`).join('');
      svg = `<svg viewBox="0 0 244 200" preserveAspectRatio="xMidYMid meet">
        <rect x="74" y="96" width="96" height="58" rx="4" fill="#2b2420" stroke="rgba(255,255,255,.08)"/>${tufts}
        <path d="M86,140 C86,128 90,126 104,127 C116,127 118,130 118,140 Z M126,140 C126,130 128,127 140,127 C154,126 158,128 158,140 Z" fill="#3a3a40"/>
        <rect x="66" y="140" width="112" height="14" rx="3" fill="#3a302b"/><path d="M60,152 L184,152 L192,200 L52,200 Z" fill="#4a4540"/><path d="M60,158 L184,158 L190,200 L54,200 Z" fill="#6b665f" opacity=".55"/>
        ${stand(X[0])}${stand(X[1])}${ents.slice(0, 2).map(lamp).join('')}</svg>`;
    } else if (f.type === 'ceiling') {
      // Flache Rattan-Deckenleuchte von unten gesehen: Geflecht leuchtet, Strahlenmuster an der Decke, Glühbirne in der Öffnung; geht auch mit einem Schalter (switch.*)
      ents = [f.entity];
      const e = f.entity, c = col(e), a = al(e), g = `${id}cl`, cx = 122, cy = 92;
      let lat = ''; for (let k = -160; k <= 160; k += 6.5) lat += `M${cx + k - 50},${cy + 50} L${cx + k + 50},${cy - 50} M${cx + k + 50},${cy + 50} L${cx + k - 50},${cy - 50} `;
      let rays = ''; if (c) for (let n = 0; n < 120; n++) { const w = n * Math.PI / 60 + (n % 3) * .012, r0 = 46, r1 = 150 + (n % 5) * 14; rays += `<line x1="${(cx + Math.cos(w) * r0 * 1.5).toFixed(1)}" y1="${(cy + Math.sin(w) * r0).toFixed(1)}" x2="${(cx + Math.cos(w) * r1 * 1.5).toFixed(1)}" y2="${(cy + Math.sin(w) * r1).toFixed(1)}" stroke="${rgba(c, n % 2 ? .4 : .2)}" stroke-width="${n % 4 ? .9 : 2}"/>`; }
      svg = `<svg viewBox="0 0 244 200" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="${g}c"><ellipse cx="${cx}" cy="${cy}" rx="66" ry="40"/></clipPath>
        ${c ? `<radialGradient id="${g}h"><stop offset="0" stop-color="${rgba(c, .85)}"/><stop offset=".35" stop-color="${rgba(c, .35)}"/><stop offset="1" stop-color="${rgba(c, 0)}"/></radialGradient>
        <radialGradient id="${g}m"><stop offset=".25" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient><mask id="${g}k"><ellipse cx="${cx}" cy="${cy}" rx="200" ry="130" fill="url(#${g}m)"/></mask>
        <radialGradient id="${g}f" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#fff3d6"/><stop offset=".45" stop-color="${rgba(c, 1)}"/><stop offset="1" stop-color="${rgba(c.map(v => v * .6), 1)}"/></radialGradient>` : ''}</defs>
        <g data-act="toggle" data-e="${e}" style="cursor:pointer"><rect x="0" y="0" width="244" height="200" fill="transparent"/>
        ${c ? `<g opacity="${a.toFixed(2)}"><ellipse cx="${cx}" cy="${cy}" rx="200" ry="130" fill="url(#${g}h)"/><g mask="url(#${g}k)">${rays}</g></g>` : ''}
        <ellipse cx="${cx}" cy="${cy + 3}" rx="68" ry="42" fill="rgba(0,0,0,.35)"/>
        <ellipse cx="${cx}" cy="${cy}" rx="66" ry="40" fill="${c ? `url(#${g}f)` : '#1d1a17'}"/>
        <path d="${lat}" clip-path="url(#${g}c)" stroke="${c ? '#b27a3c' : '#5c4a36'}" stroke-width="2" fill="none" opacity="${c ? .85 : 1}"/>
        <ellipse cx="${cx}" cy="${cy}" rx="66" ry="40" fill="none" stroke="${c ? '#d9a865' : '#4a3c2d'}" stroke-width="2"/>
        <ellipse cx="${cx}" cy="${cy + 8}" rx="30" ry="19" fill="${c ? '#7a4f26' : '#2a2119'}" stroke="${c ? '#c99555' : '#4a3c2d'}" stroke-width="2.5" stroke-dasharray="4 2"/>
        <ellipse cx="${cx}" cy="${cy + 9}" rx="21" ry="13" fill="${c ? '#ffe3a8' : '#0e0c0a'}" stroke="${c ? '#e8b878' : '#5c4a36'}" stroke-width="1.5"/>
        ${c ? `<ellipse cx="${cx}" cy="${cy + 8}" rx="9" ry="7" fill="#fff" opacity=".9"/><path d="M${cx - 2.5},${cy + 3} L${cx - 2.5},${cy + 13} M${cx + 2.5},${cy + 3} L${cx + 2.5},${cy + 13}" stroke="#ffb347" stroke-width="1.4" stroke-linecap="round"/>` : `<ellipse cx="${cx}" cy="${cy + 8}" rx="7" ry="5.5" fill="none" stroke="rgba(255,255,255,.2)"/>`}</g></svg>`;
    } else if (f.type === 'panel') {
      // Rechteckiges LED-Deckenpanel (z. B. Hue Surimu), schräg von unten gesehen
      ents = [f.entity];
      const e = f.entity, c = col(e), a = al(e), g = `${id}pn`, sq = f.shape === 'square';
      const O = sq ? 'M34,46 L210,46 L190,168 L54,168 Z' : 'M44,14 L200,14 L162,188 L82,188 Z', I = sq ? 'M44,53 L200,53 L182,161 L62,161 Z' : 'M54,22 L190,22 L156,180 L88,180 Z';
      svg = `<svg viewBox="0 0 244 200" preserveAspectRatio="xMidYMid meet"><defs>
        ${c ? `<radialGradient id="${g}h"><stop offset="0" stop-color="${rgba(c, .55)}"/><stop offset="1" stop-color="${rgba(c, 0)}"/></radialGradient>
        <linearGradient id="${g}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="${rgba(c.map(v => Math.min(255, v + 40)), 1)}"/><stop offset="1" stop-color="${rgba(c, 1)}"/></linearGradient>` : ''}</defs>
        <g data-act="toggle" data-e="${e}" style="cursor:pointer"><rect x="0" y="0" width="244" height="200" fill="transparent"/>
        ${c ? `<ellipse cx="122" cy="100" rx="150" ry="118" fill="url(#${g}h)" opacity="${a.toFixed(2)}"/>` : ''}
        <path d="${O}" fill="${c ? '#e9ecef' : '#2a2f3b'}" stroke="rgba(255,255,255,.18)"/>
        <path d="${I}" fill="${c ? `url(#${g}f)` : '#151a24'}" opacity="${c ? (0.55 + 0.45 * a).toFixed(2) : 1}"/>
        ${c ? '' : `<path d="${sq ? 'M50,59 L110,59 L98,120 L60,120 Z' : 'M60,28 L120,28 L100,120 L74,120 Z'}" fill="rgba(255,255,255,.04)"/>`}</g></svg>`;
    } else if (f.type === 'mirror') {
      // Spiegelschrank mit drei Türen und LED-Leiste oben (Licht nach oben an die Wand und nach unten auf den Spiegel)
      ents = [f.entity];
      const e = f.entity, c = col(e), a = al(e), g = `${id}mr`;
      const door = (x, w) => `<rect x="${x}" y="64" width="${w}" height="104" fill="url(#${g}m)" stroke="rgba(255,255,255,.22)"/><path d="M${x + 8},70 L${x + w * .45},70 L${x + 8},${70 + w * .9} Z" fill="rgba(255,255,255,.06)"/>`;
      svg = `<svg viewBox="0 0 244 200" preserveAspectRatio="xMidYMid meet"><defs>
        <linearGradient id="${g}m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c ? '#5d7f86' : '#2a3a40'}"/><stop offset=".55" stop-color="${c ? '#3f5c63' : '#1b252b'}"/><stop offset="1" stop-color="${c ? '#6d8d93' : '#26333a'}"/></linearGradient>
        ${c ? `<linearGradient id="${g}u" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${rgba(c, .75)}"/><stop offset="1" stop-color="${rgba(c, 0)}"/></linearGradient>
        <linearGradient id="${g}d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${rgba(c, .55)}"/><stop offset="1" stop-color="${rgba(c, 0)}"/></linearGradient>` : ''}</defs>
        <g data-act="toggle" data-e="${e}" style="cursor:pointer"><rect x="0" y="0" width="244" height="200" fill="transparent"/>
        ${c ? `<g opacity="${a.toFixed(2)}"><path d="M30,52 L214,52 L244,0 L0,0 Z" fill="url(#${g}u)"/><path d="M42,62 L202,62 L206,120 L38,120 Z" fill="url(#${g}d)"/><ellipse cx="122" cy="176" rx="96" ry="9" fill="${rgba(c, .35)}"/></g>` : ''}
        ${door(38, 54)}${door(92, 60)}${door(152, 54)}
        <path d="M30,52 L214,52 L210,64 L34,64 Z" fill="#2a2a30" stroke="rgba(255,255,255,.16)"/>
        <rect x="58" y="49" width="128" height="4" rx="2" fill="${c ? '#fff' : '#3a4050'}"/>
        <rect x="40" y="62.5" width="164" height="2" fill="${c ? rgba(c, 1) : '#2f3542'}"/>
        <rect x="56" y="168" width="6" height="2" fill="${c ? '#fff' : '#3a4050'}"/><rect x="152" y="168" width="6" height="2" fill="${c ? '#fff' : '#3a4050'}"/><rect x="198" y="168" width="6" height="2" fill="${c ? '#fff' : '#3a4050'}"/></g></svg>`;
    } else if (f.type === 'go') {
      // Hue Go (Halbkugel) hinter dem Fernseher – leuchtet die Wand an
      ents = f.bulbs || (f.entity ? [f.entity] : []);
      const e = ents[0], c = col(e), a = al(e), g = `${id}go`, gx = f.side === 'right' ? 206 : f.side === 'left' ? 38 : 127, mid = gx === 127;
      svg = `<svg viewBox="0 0 244 200" preserveAspectRatio="xMidYMid meet"><defs>
        ${c ? `<radialGradient id="${g}w"><stop offset="0" stop-color="${rgba(c, .85)}"/><stop offset=".55" stop-color="${rgba(c, .25)}"/><stop offset="1" stop-color="${rgba(c, 0)}"/></radialGradient>
        <radialGradient id="${g}f" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="${rgba(c, 1)}"/><stop offset="1" stop-color="${rgba(c.map(v => v * .7), 1)}"/></radialGradient>` : ''}</defs>
        <g data-act="toggle" data-e="${e}" style="cursor:pointer"><rect x="0" y="0" width="244" height="200" fill="transparent"/>
        ${c ? `<ellipse cx="${(gx + 127) / 2}" cy="${mid ? 86 : 100}" rx="${mid ? 128 : 150}" ry="${mid ? 92 : 104}" fill="url(#${g}w)" opacity="${a.toFixed(2)}"/>` : ''}
        ${mid ? `<g transform="rotate(-12 127 120)"><path d="M101,120 A26,26 0 0 0 153,120 Z" fill="${c ? rgba(c, .8) : '#2b303c'}"/><ellipse cx="127" cy="120" rx="26" ry="6" fill="${c ? `url(#${g}f)` : '#3a4152'}"/></g>` : ''}
        <rect x="52" y="34" width="150" height="104" rx="3" fill="#06080d" stroke="${c ? rgba(c, .7) : 'rgba(255,255,255,.14)'}" stroke-width="1.5"/>
        <path d="M60,42 L120,42 L84,130 L60,130 Z" fill="rgba(255,255,255,.025)"/>
        <rect x="112" y="138" width="30" height="8" fill="#0b0e15"/><rect x="92" y="146" width="70" height="20" rx="2" fill="#11141c" stroke="rgba(255,255,255,.1)"/>
        <rect x="8" y="166" width="228" height="10" rx="2" fill="#1b1f29" stroke="rgba(255,255,255,.16)"/><rect x="14" y="176" width="216" height="20" fill="#141822"/>
        ${mid ? '' : `<g transform="rotate(-28 ${gx} 150)">
          <path d="M${gx - 22},150 A22,22 0 0 0 ${gx + 22},150 Z" fill="${c ? rgba(c, .75) : '#2b303c'}" stroke="${c ? '#fff' : 'rgba(255,255,255,.2)'}" stroke-width="1"/>
          <ellipse cx="${gx}" cy="150" rx="22" ry="5.5" fill="${c ? `url(#${g}f)` : '#3a4152'}" stroke="${c ? '#fff' : 'rgba(255,255,255,.25)'}" stroke-width="1"/></g>`}</g></svg>`;
    } else return '';
    // Ohne Gruppen-Entität, aber mit mehreren Lampen: virtuelle Gruppe (Schalten, Helligkeit und Farbe wirken auf alle)
    const virt = !f.entity && ents.length > 1, vOn = virt ? ents.filter(on) : [];
    const g = f.entity ? st(f.entity) : virt && st(ents[0]) ? { state: vOn.length ? 'on' : 'off', attributes: { ...st(ents[0]).attributes, brightness: vOn.length ? Math.max(...vOn.map(x => st(x).attributes.brightness || 0)) : null } } : null;
    const gE = f.entity || ents.join(','), nOn = ents.filter(on).length, gOn = f._sOff ? false : g ? g.state === 'on' : nOn > 0;
    const pct = g && gOn && g.attributes.brightness ? Math.round(g.attributes.brightness / 2.55) : 0;
    const sub = f._sOff ? 'Steckdose aus · tippen zum Einschalten' : f.type === 'bar' ? [on(f.up) && 'oben', on(f.down) && 'unten'].filter(Boolean).join(' + ') || 'aus' : ents.length === 1 ? (nOn ? 'an' : (st(ents[0]) || {}).state === 'unavailable' ? 'nicht erreichbar' : 'aus') : nOn ? `${nOn} von ${ents.length} an` : 'aus';
    const tgl = f._sOff ? f.socket : (f.entity || ents[0]);
    const tA = virt ? `data-act="gtog" data-on="${gOn ? 1 : 0}" data-e="${gE}"` : `data-act="toggle" data-e="${tgl}"`;
    return `<div class="fxi ${gOn ? 'on' : ''}"><div class="fxs">${svg}</div>
      <div class="fxb"><div class="fxt" ${tA} role="button" tabindex="0"><div class="n">${R_esc(f.name || '')}</div><div class="s" id="lv-${id}">${sub}${pct ? ` · ${pct} %` : ''}${f.power && this.n(f.power) != null ? ` · ${R_fmt(this.n(f.power), this.n(f.power) < 10 ? 1 : 0)} W` : ''}</div></div>
      ${g && !f._sOff && gE.startsWith('light.') && (g.attributes.supported_color_modes || []).some(m => m !== 'onoff') ? `<input type="range" min="1" max="100" value="${pct || 1}" data-act="bri" data-e="${gE}" data-busy="lights" aria-label="Helligkeit ${R_esc(f.name || '')}">` : '<span></span>'}
      <button class="fxp" ${tA} aria-label="${R_esc(f.name || '')} schalten">${R_icon('mdi:power', 20)}</button></div>${f._sOff ? '' : this.swatches(gE, g)}</div>`;
  }
  // Farbtupfer für eine Lampengruppe: Weißtöne (Farbtemperatur) und Farben, je nachdem was die Lampe kann
  swatches(e, s) {
    if (!e || !s) return '';
    const m = s.attributes.supported_color_modes || [], ct = m.includes('color_temp'), col = m.some(x => ['hs', 'xy', 'rgb', 'rgbw', 'rgbww'].includes(x));
    if (!ct && !col) return '';
    const cur = s.state === 'on' ? (s.attributes.color_mode === 'color_temp' ? 'k' + Math.round((s.attributes.color_temp_kelvin || 0) / 100) : (s.attributes.rgb_color || []).join(',')) : '';
    const W = ct ? [[2700, '#ffc98a', 'Warmweiß'], [4000, '#fff1dc', 'Neutralweiß'], [6000, '#e6efff', 'Tageslicht']] : [];
    const C = col ? [[[255, 120, 40], 'Orange'], [[255, 40, 40], 'Rot'], [[255, 60, 160], 'Pink'], [[150, 70, 255], 'Lila'], [[40, 90, 255], 'Blau'], [[40, 220, 90], 'Grün']] : [];
    const near = (k) => cur === 'k' + Math.round(k / 100);
    return `<div class="sw">${W.map(([k, c, n]) => `<button class="swb ${near(k) ? 'on' : ''}" style="background:${c}" data-act="color" data-e="${e}" data-k="${k}" title="${n}" aria-label="${n}"></button>`).join('')}${W.length && C.length ? '<i class="swd"></i>' : ''}${C.map(([c, n]) => `<button class="swb" style="background:rgb(${c.join(',')})" data-act="color" data-e="${e}" data-rgb="${c.join(',')}" title="${n}" aria-label="${n}"></button>`).join('')}</div>`;
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
  kCovers() { return this.ks([...this.c.covers.map(x => x.entity), this.c.cover_style === 'scene' ? 'sun.sun' : null]); }
  // Rollladen als Bild: Fenster/Tür mit Blick nach draußen (Tag/Nacht), Panzer mit Lamellen; auf dem Fenster ziehen setzt die Position
  coverScene(x, s, p) {
    const door = x.kind ? x.kind === 'door' : /tür/i.test(x.name || ''), day = (this.s('sun.sun') || {}).state !== 'below_horizon';
    const canPos = ((s.attributes.supported_features || 0) & 4) > 0;
    const W = 120, H = door ? 176 : 128, gy = 16, gh = H - gy - 6, id = x.entity.replace(/\W/g, ''), sh = Math.round(gh * (100 - p) / 100);
    const mv = s.state === 'opening' ? 'fährt hoch' : s.state === 'closing' ? 'fährt runter' : s.state === 'unavailable' ? 'nicht erreichbar' : p >= 99 ? 'offen' : p <= 1 ? 'geschlossen' : 'teilweise offen';
    const stars = day ? '' : [[20, 30], [44, 22], [88, 34], [70, 48], [100, 24], [30, 56]].map(([a, b]) => `<circle cx="${a}" cy="${b + gy}" r="1" fill="#fff" opacity=".8"/>`).join('');
    const sl = Array.from({ length: Math.ceil(gh / 6) }, (_, i) => `<rect x="6" y="${gy + i * 6}" width="${W - 12}" height="5" fill="${day ? '#9aa4b2' : '#4a5263'}"/>`).join('');
    const svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" class="${canPos ? 'cvsvg' : 'cvsvg0'}" data-e="${x.entity}" data-gy="${gy}" data-gh="${gh}">
      <defs><linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${day ? '#6fb8ff' : '#0a1230'}"/><stop offset="1" stop-color="${day ? '#dff0ff' : '#2a3a6a'}"/></linearGradient><clipPath id="${id}cl"><rect x="6" y="${gy}" width="${W - 12}" height="${gh}"/></clipPath></defs>
      <rect x="0" y="0" width="${W}" height="${H}" rx="6" fill="#2a2f3b"/>
      <g clip-path="url(#${id}cl)"><rect x="6" y="${gy}" width="${W - 12}" height="${gh}" fill="url(#${id}sky)"/>${stars}
        ${day ? `<circle cx="${W - 30}" cy="${gy + 26}" r="11" fill="#ffe38a"/><circle cx="${W - 30}" cy="${gy + 26}" r="18" fill="#ffe38a" opacity=".25"/>` : `<circle cx="${W - 32}" cy="${gy + 24}" r="9" fill="#f3f0dc"/><circle cx="${W - 28}" cy="${gy + 21}" r="8" fill="#0d1636"/>`}
        <path d="M6,${H - 6 - gh * .28} C30,${H - 6 - gh * .36} 50,${H - 6 - gh * .22} 74,${H - 6 - gh * .32} S110,${H - 6 - gh * .26} ${W - 6},${H - 6 - gh * .3} L${W - 6},${H - 6} L6,${H - 6} Z" fill="${day ? '#3f8a52' : '#13281c'}"/>
        <rect x="${W / 2 - 1.5}" y="${gy}" width="3" height="${gh}" fill="#e9edf2" opacity="${door ? 0 : .9}"/>
        ${door ? `<rect x="${W - 22}" y="${gy + gh * .5}" width="4" height="16" rx="2" fill="#e9edf2"/>` : ''}
        <g class="cvsh" style="transition:transform .9s" transform="translate(0 ${sh - gh})"><rect x="6" y="${gy}" width="${W - 12}" height="${gh}" fill="${day ? '#6c7686' : '#2b313d'}"/>${sl}<rect x="6" y="${gy + gh - 4}" width="${W - 12}" height="4" fill="#3a4150"/></g></g>
      <rect x="0" y="0" width="${W}" height="${gy}" rx="6" fill="#1b1f29"/><rect x="0" y="${gy - 3}" width="${W}" height="3" fill="#11141b"/>
      <rect x="6" y="${gy}" width="${W - 12}" height="${gh}" fill="none" stroke="#e9edf2" stroke-width="2.5"/></svg>`;
    return `<div class="cvs"><div class="cvw ${canPos ? '' : 'np'}" title="${canPos ? 'Ziehen zum Verstellen' : ''}">${svg}<div class="cvp" id="cvp-${id}">${p >= 99 ? 'offen' : p <= 1 ? 'zu' : p + ' %'}</div></div>
      <div class="cvi"><div class="n">${R_esc(x.name)}</div><div class="s">${mv}</div>
        ${canPos ? `<div class="cvq"><button class="chq" data-act="covp" data-e="${x.entity}" data-p="100">Auf</button><button class="chq" data-act="covp" data-e="${x.entity}" data-p="50">Halb</button><button class="chq" data-act="covp" data-e="${x.entity}" data-p="20">Schlitze</button><button class="chq" data-act="covp" data-e="${x.entity}" data-p="0">Zu</button></div>` : '<div class="s">ohne Positionsangabe – nur hoch, runter, stopp</div>'}</div>
      <div class="cvb"><button class="ib2 ${s.state === 'opening' ? 'mv' : ''}" data-act="cov" data-sv="open_cover" data-e="${x.entity}" aria-label="Öffnen">${R_icon('mdi:arrow-up', 20)}</button><button class="ib2" data-act="cov" data-sv="stop_cover" data-e="${x.entity}" aria-label="Stopp">${R_icon('mdi:stop', 20)}</button><button class="ib2 ${s.state === 'closing' ? 'mv' : ''}" data-act="cov" data-sv="close_cover" data-e="${x.entity}" aria-label="Schließen">${R_icon('mdi:arrow-down', 20)}</button></div></div>`;
  }
  r_covers() {
    const el = this.$('covers'); if (!el) return;
    if (this.c.cover_style === 'scene') { el.classList.add('scene'); el.innerHTML = this.c.covers.map(x => { const s = this.s(x.entity); if (!s) return ''; return this.coverScene(x, s, s.attributes.current_position ?? (s.state === 'open' ? 100 : 0)); }).join(''); return; }
    el.innerHTML = this.c.covers.map(x => {
      const s = this.s(x.entity); if (!s) return '';
      const p = s.attributes.current_position ?? (s.state === 'open' ? 100 : 0), mv = s.state === 'opening' ? 'fährt hoch' : s.state === 'closing' ? 'fährt runter' : p >= 99 ? 'offen' : p <= 1 ? 'geschlossen' : `${p} % offen`;
      return `<div class="cv"><div class="win"><div class="slats" style="height:${100 - p}%"></div></div><div>
        <div class="n">${R_esc(x.name)}</div><div class="s" id="cp-${x.entity.replace(/\W/g, '')}">${mv}</div>
        <input type="range" min="0" max="100" step="5" value="${p}" data-act="pos" data-e="${x.entity}" data-busy="covers" data-live="cp-${x.entity.replace(/\W/g, '')}" data-unit=" % offen" aria-label="Position ${R_esc(x.name)}">
        <div class="row"><button class="ib" data-act="cov" data-sv="open_cover" data-e="${x.entity}" aria-label="Öffnen">${R_icon('mdi:arrow-up')}</button><button class="ib" data-act="cov" data-sv="stop_cover" data-e="${x.entity}" aria-label="Stopp">${R_icon('mdi:stop')}</button><button class="ib" data-act="cov" data-sv="close_cover" data-e="${x.entity}" aria-label="Schließen">${R_icon('mdi:arrow-down')}</button></div></div></div>`;
    }).join('');
  }
  // ---------- Luftreiniger ----------
  kPurifier() { const p = this.c.purifier; return p ? this.ks([p.entity, p.air_quality, p.pm25, p.filter, p.light, p.child_lock, p.charging]) : ''; }
  r_purifier() {
    const el = this.$('purifier'), P = this.c.purifier; if (!el || !P) return;
    const f = this.s(P.entity); if (!f) { el.innerHTML = ''; return; }
    const on = f.state === 'on', pm = f.attributes.preset_mode, aq = (this.s(P.air_quality) || {}).state, pm25 = this.n(P.pm25), fh = this.n(P.filter), fmax = P.filter_max_h || 4380;
    const AQ = { excellent: ['Ausgezeichnet', '#2fd27a'], good: ['Gut', '#9bd23a'], moderate: ['Mäßig', '#f2a93b'], fair: ['Mäßig', '#f2a93b'], unhealthy: ['Schlecht', '#ef5a4c'], poor: ['Schlecht', '#ef5a4c'], very_poor: ['Sehr schlecht', '#d63a5a'] };
    const [aqt, aqc] = AQ[aq] || ['unbekannt', '#8a94a3'];
    const PM = { auto: ['Auto', 'mdi:fan-auto'], level_1: ['Stufe 1', 'mdi:fan-speed-1'], level_2: ['Stufe 2', 'mdi:fan-speed-2'], level_3: ['Stufe 3', 'mdi:fan-speed-3'], low: ['Niedrig', 'mdi:fan-speed-1'], medium: ['Mittel', 'mdi:fan-speed-2'], high: ['Hoch', 'mdi:fan-speed-3'], sleep: ['Schlaf', 'mdi:power-sleep'], pet: ['Haustier', 'mdi:paw'] };
    const modes = f.attributes.preset_modes || [], pmL = (m) => (PM[m] || [m])[0];
    const lt = this.s(P.light), cl = this.s(P.child_lock), ch = this.s(P.charging);
    const tog = (e, s2, ic, lb) => s2 && s2.state !== 'unavailable' ? `<button class="aqt ${s2.state === 'on' ? 'on' : ''}" data-act="toggle" data-e="${e}">${R_icon(ic, 18)}<span>${lb}</span><b>${s2.state === 'on' ? 'an' : s2.state === 'off' ? 'aus' : '–'}</b></button>` : '';
    const lon = lt && lt.state === 'on', chg = ch && ch.state === 'on';
    const svg = `<svg viewBox="0 0 140 170" class="aqs ${on ? 'on' : ''}" style="--aq:${aqc}"><defs>
      <linearGradient id="aqw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2c08a"/><stop offset=".55" stop-color="#cfa66b"/><stop offset="1" stop-color="#b88d55"/></linearGradient>
      <linearGradient id="aqb" x1="0" x2="1"><stop offset="0" stop-color="#d9dde3"/><stop offset=".35" stop-color="#fbfcfd"/><stop offset=".7" stop-color="#eef0f3"/><stop offset="1" stop-color="#c9ced6"/></linearGradient>
      <radialGradient id="aqg"><stop offset="0" stop-color="${lon ? '#ffb48a' : aqc}" stop-opacity=".85"/><stop offset="1" stop-color="${lon ? '#ffb48a' : aqc}" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="70" cy="164" rx="48" ry="4" fill="#000" opacity=".35"/>
      <path d="M24,56 L24,152 Q70,166 116,152 L116,56 Z" fill="url(#aqb)"/>
      ${Array.from({ length: 15 }, (_, i) => `<line x1="${27 + i * 6.2}" y1="92" x2="${27 + i * 6.2}" y2="${152 + (i < 3 || i > 11 ? 0 : 4)}" stroke="#c7ccd4" stroke-width="1.2"/>`).join('')}
      <rect x="40" y="102" width="60" height="44" rx="3" fill="#2a2f3a"/>${Array.from({ length: 12 }, (_, i) => `<line x1="${43 + i * 4.9}" y1="104" x2="${43 + i * 4.9}" y2="144" stroke="#e9ecf0" stroke-width="2"/>`).join('')}
      <line x1="40" y1="117" x2="100" y2="117" stroke="#e9ecf0" stroke-width="1.5"/><line x1="40" y1="131" x2="100" y2="131" stroke="#e9ecf0" stroke-width="1.5"/>
      <ellipse cx="70" cy="56" rx="46" ry="8" fill="${on || lon ? (lon ? '#ffcfb3' : aqc) : '#dfe3e8'}" opacity="${on || lon ? .9 : 1}"/>
      ${on || lon ? `<ellipse cx="70" cy="52" rx="60" ry="16" fill="url(#aqg)"/>` : ''}
      ${on ? [0, 1, 2].map(i => `<path class="fl f${i}" d="M${20 + i * 3},${48 - i} C${14},${36} ${18},${26} ${12 + i * 2},${16}" fill="none" stroke="${aqc}" stroke-width="2" stroke-linecap="round"/><path class="fl f${i}" d="M${120 - i * 3},${48 - i} C${126},${36} ${122},${26} ${128 - i * 2},${16}" fill="none" stroke="${aqc}" stroke-width="2" stroke-linecap="round"/>`).join('') : ''}
      <path d="M6,40 C6,30 34,24 70,24 C106,24 134,30 134,40 L134,44 C134,54 106,60 70,60 C34,60 6,54 6,44 Z" fill="#a87d49"/>
      <ellipse cx="70" cy="40" rx="64" ry="16" fill="url(#aqw)"/>
      <path d="M18,40 C40,34 70,46 118,36 M28,46 C55,40 85,50 112,44 M24,34 C50,30 80,36 110,31" stroke="#b58a52" stroke-width=".8" fill="none" opacity=".7"/>
      ${chg ? `<g transform="rotate(-12 92 36)"><rect x="80" y="26" width="26" height="14" rx="3" fill="#20242e"/><rect x="82" y="28" width="22" height="10" rx="2" fill="#3a3f55"/><circle cx="93" cy="33" r="3" fill="none" stroke="#3ddc84" stroke-width="1.2"/></g>` : ''}
      <circle cx="108" cy="66" r="1.8" fill="${aqc}"/></svg>`;
    el.innerHTML = `<div class="aq ${on ? 'on' : ''}" style="--aq:${aqc}"><div class="aqv">${svg}</div>
      <div class="aqi"><div class="aql">Luftqualität</div><div class="aqq">${aqt}</div>
        <div class="aqs2">${pm25 != null ? `PM2,5 ${R_fmt(pm25, 0)} µg/m³ · ` : ''}${on ? `läuft · ${pmL(pm)}` : f.state === 'unavailable' ? 'nicht erreichbar' : 'aus'}</div>
        <button class="fxp aqp ${on ? 'on' : ''}" data-act="toggle" data-e="${P.entity}" aria-label="Ein/Aus">${R_icon('mdi:power', 20)}</button></div>
      <div class="aqm">${modes.map(m => `<button class="aqb ${on && m === pm ? 'on' : ''}" data-act="pmode" data-e="${P.entity}" data-m="${R_esc(m)}">${R_icon((PM[m] || [, 'mdi:fan'])[1], 18)}${R_esc(pmL(m))}</button>`).join('')}</div>
      <div class="aqx">${tog(P.light, lt, 'mdi:led-strip-variant', 'Licht')}${tog(P.child_lock, cl, 'mdi:lock', 'Kindersicherung')}${tog(P.charging, ch, 'mdi:battery-charging-wireless', 'Laden')}</div>
      ${fh != null ? `<div class="aqf"><div><span>${R_icon('mdi:air-filter', 16)}Filter</span><span>${R_fmt(fh, 0)} h · noch etwa ${Math.max(0, Math.round(100 - fh / fmax * 100))} %</span></div><div class="mb"><i style="width:${Math.max(0, Math.min(100, 100 - fh / fmax * 100))}%"></i></div>${P.filter_reset ? `<button class="btn aqr" data-act="freset" data-e="${P.filter_reset}">Filter gewechselt</button>` : ''}</div>` : ''}</div>`;
  }
  // ---------- Medien ----------
  kMedia() { return this.ks(this.c.media.map(x => x.entity)); }
  r_media() {
    const el = this.$('media'); if (!el) return;
    el.innerHTML = this.c.media.map(x => {
      const s = this.s(x.entity); if (!s) return '';
      if (x.style === 'player') return this.player(x, s);
      if (x.style === 'tv') return this.tv(x, s);
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
  // Musik-Player im Stil "Jetzt läuft": Cover, Titel, Fortschritt, Steuerung, Lautstärke, Favoriten
  player(x, s) {
    const A = s.attributes, F = A.supported_features || 0, on = !['off', 'standby', 'unavailable', 'unknown'].includes(s.state), pl = s.state === 'playing';
    const st = { playing: 'spielt', paused: 'pausiert', idle: 'bereit', off: 'aus', standby: 'Standby', unavailable: 'nicht erreichbar' }[s.state] || s.state;
    const curSt = (x.stations || []).find(st => (A.media_content_id || '').includes(st.url) || (A.media_album_name === st.name && /radio/.test(A.media_content_id || '')));
    const junk = (t) => !t || /^(no name|livestream|unknown|untitled)$/i.test(String(t).trim());
    const pic = A.entity_picture || (curSt && curSt.image), title = (!junk(A.media_title) && A.media_title) || (curSt && curSt.name) || A.source || (on ? 'Bereit' : 'Aus'), sub = [A.media_artist, A.media_album_name].filter(v => !junk(v) && v !== title).join(' · ') || (A.media_channel && A.media_channel !== title ? A.media_channel : '');
    const vol = A.volume_level != null ? Math.round(A.volume_level * 100) : null, id = 'mv-' + x.entity.replace(/\W/g, ''), e = x.entity;
    const dur = A.media_duration, pos = A.media_position != null ? A.media_position + (pl && A.media_position_updated_at ? (Date.now() - new Date(A.media_position_updated_at)) / 1000 : 0) : null;
    const t = (v) => `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, '0')}`;
    const radio = /radio|stream|x-rincon-mp3radio|tunein/i.test(A.media_content_id || '') || (!dur && A.media_channel);
    const favs = x.sources === false ? [] : (Array.isArray(x.sources) ? x.sources : A.source_list || []);
    const b = (sv, ic, lb, cls = '') => `<button class="pb ${cls}" data-act="mp" data-sv="${sv}" data-e="${e}" aria-label="${lb}">${R_icon(ic, cls.includes('big') ? 30 : 22)}</button>`;
    return `<div class="ply ${pl ? 'plyon' : ''}">${pic ? `<div class="pbg" style="background-image:url('${pic}')"></div>` : ''}<div class="psh"></div>
      <div class="pin"><div class="pcv" ${!pic && curSt ? `style="background:linear-gradient(135deg,hsl(${[...curSt.name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7)} 65% 48%),hsl(${([...curSt.name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7) + 50) % 360} 55% 26%))"` : ''}>${pic ? `<img src="${pic}" alt="">` : curSt ? `<div class="pst">${R_icon('mdi:radio-tower', 22)}<b>${R_esc(curSt.name)}</b></div>` : R_icon(x.icon || 'mdi:speaker', 44)}${pl ? '<i class="eq"><b></b><b></b><b></b><b></b></i>' : ''}</div>
        <div class="pmt"><div class="plb">${R_icon(x.icon || 'mdi:speaker', 14)}${R_esc(x.name)} · ${radio ? 'Radio' : st}${radio && on ? ` · ${st}` : ''}</div>
          <div class="pti">${R_esc(title)}</div>${sub ? `<div class="par">${R_esc(sub)}</div>` : ''}
          ${dur ? `<div class="ppg"><span>${t(Math.min(pos || 0, dur))}</span><div class="pgb" data-pos="${pos || 0}" data-dur="${dur}" data-at="${pl ? Date.now() : 0}"><i style="width:${Math.min(100, (pos || 0) / dur * 100)}%"></i></div><span>${t(dur)}</span></div>` : radio && on ? '<div class="plive"><i></i>Live</div>' : ''}
          <div class="pct">${F & 32768 && !radio ? b('shuffle_set', 'mdi:shuffle-variant', 'Zufall', A.shuffle ? 'act' : '') : ''}${F & 16 && !radio ? b('media_previous_track', 'mdi:skip-previous', 'Zurück') : ''}${b('media_play_pause', pl ? 'mdi:pause' : 'mdi:play', 'Play/Pause', 'big')}${F & 32 && !radio ? b('media_next_track', 'mdi:skip-next', 'Weiter') : ''}${F & 262144 && !radio ? b('repeat_set', A.repeat === 'one' ? 'mdi:repeat-once' : 'mdi:repeat', 'Wiederholen', A.repeat && A.repeat !== 'off' ? 'act' : '') : ''}</div></div></div>
      ${vol != null ? `<div class="pvo"><button class="pb sm" data-act="mp" data-sv="volume_mute" data-e="${e}" aria-label="Stumm">${R_icon(A.is_volume_muted ? 'mdi:volume-off' : vol < 30 ? 'mdi:volume-low' : vol < 70 ? 'mdi:volume-medium' : 'mdi:volume-high', 18)}</button><input type="range" min="0" max="100" value="${vol}" data-act="vol" data-e="${e}" data-busy="media" data-live="${id}" data-unit=" %" aria-label="Lautstärke ${R_esc(x.name)}"><span id="${id}">${vol} %</span></div>` : ''}
      ${x.stations && x.stations.length ? `<div class="pfv">${x.stations.map(st => { const act = (A.media_content_id || '').includes(st.url) || (A.media_album_name === st.name && /radio/.test(A.media_content_id || '')); return `<button class="pfc ${act ? 'on' : ''}" data-act="stn" data-e="${e}" data-u="${R_esc(st.url)}">${act && pl ? '<i class="eq sm"><b></b><b></b><b></b></i>' : R_icon('mdi:radio', 14)}${R_esc(st.name)}</button>`; }).join('')}</div>` : ''}
      ${favs.length && !x.stations ? `<div class="pfv">${favs.map(o => `<button class="pfc ${o === A.source ? 'on' : ''}" data-act="srcb" data-e="${e}" data-o="${R_esc(o)}">${o === A.source && pl ? '<i class="eq sm"><b></b><b></b><b></b></i>' : R_icon('mdi:radio', 14)}${R_esc(o)}</button>`).join('')}</div>` : ''}</div>`;
  }
  // Fernseher mit Receiver: großes Sendungsbild (16:9) vom Receiver, Sender, Titel, Steuerung, Lautstärke, Apps
  tv(x, s) {
    const A = s.attributes, on = !['off', 'standby', 'unavailable', 'unknown'].includes(s.state), e = x.entity;
    const k = x.sky && this.s(x.sky), K = k ? k.attributes : {}, kon = k && !['off', 'standby', 'unavailable', 'unknown'].includes(k.state), kpl = k && k.state === 'playing';
    const pic = kon ? (K.entity_picture_local || K.entity_picture) : null, live = K.skyq_media_type === 'live';
    const own = !k && on && (A.media_channel || A.media_title), chNo = own && A.media_content_type === 'channel' && A.media_content_id ? String(+A.media_content_id || A.media_content_id) : '';
    const title = kon ? (K.media_series_title || K.media_title || K.media_channel) : own ? (A.media_title || A.media_channel) : on ? (A.source || 'Fernseher an') : 'Fernseher aus';
    const sub = kon && K.media_series_title && K.media_title && K.media_title !== K.media_channel && K.media_title !== K.media_series_title ? K.media_title : '';
    const ch = kon ? [K.skyq_channelno, K.media_channel].filter(Boolean).join(' · ') : own ? [chNo, A.media_channel].filter(Boolean).join(' · ') : '';
    const dur = own && A.media_duration, pos = dur && A.media_position != null ? Math.min(dur, A.media_position + (A.media_position_updated_at ? (Date.now() - new Date(A.media_position_updated_at)) / 1000 : 0)) : null;
    const hue = [...(A.media_channel || x.name || 'TV')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
    const F = A.supported_features || 0, srm = !x.remote && kon ? x.sky_remote : null, rm = x.remote || srm;
    // Sky-Q-Fernbedienung (remote über sky_remote) nutzt eigene Befehlsnamen
    const SKY = { Up: 'up', Down: 'down', Left: 'left', Right: 'right', Confirm: 'select', Return: 'backup', Home: 'home', EPG: 'tvguide', Options: 'i', ChannelUp: 'channelup', ChannelDown: 'channeldown' };
    // Samsung-Fernbedienung (remote_type: samsung) nutzt KEY_-Codes
    const SAM = { Up: 'KEY_UP', Down: 'KEY_DOWN', Left: 'KEY_LEFT', Right: 'KEY_RIGHT', Confirm: 'KEY_ENTER', Return: 'KEY_RETURN', Home: 'KEY_HOME', EPG: 'KEY_GUIDE', Options: 'KEY_TOOLS', VolumeUp: 'KEY_VOLUP', VolumeDown: 'KEY_VOLDOWN', ChannelUp: 'KEY_CHUP', ChannelDown: 'KEY_CHDOWN', Tv: 'KEY_TV' };
    const kc = (cmd) => srm ? SKY[cmd] || cmd : x.remote_type === 'samsung' ? SAM[cmd] || cmd : cmd;
    const rb = (cmd, ic, lb, cls = '') => srm && /^Volume/.test(cmd) ? `<button class="rk ${cls}" data-act="mp" data-sv="${cmd === 'VolumeUp' ? 'volume_up' : 'volume_down'}" data-e="${e}" aria-label="${lb}">${R_icon(ic, 20)}</button>` : `<button class="rk ${cls}" data-act="rc" data-e="${rm}" data-c="${kc(cmd)}" aria-label="${lb}">${ic.startsWith('mdi:') ? R_icon(ic, 20) : ic}</button>`;
    const vol = A.volume_level != null ? Math.round(A.volume_level * 100) : null, id = 'mv-' + e.replace(/\W/g, '');
    const KF = K.supported_features || 0, apps = x.sources === true ? (A.source_list || []) : (x.sources || []);
    const b = (ent, sv, ic, lb, cls = '') => `<button class="pb ${cls}" data-act="mp" data-sv="${sv}" data-e="${ent}" aria-label="${lb}">${R_icon(ic, cls.includes('big') ? 30 : 22)}</button>`;
    return `<div class="tvc ${on ? 'on' : ''}"><div class="tvi" ${own ? `style="background:radial-gradient(120% 130% at 20% 10%,hsl(${hue} 55% 38%),hsl(${(hue + 40) % 360} 45% 14%) 70%)"` : ''}>${pic ? `<img src="${pic}" alt="">` : own ? `<div class="tvl">${R_esc(A.media_channel || '')}</div>` : `<div class="tvn">${R_icon(x.icon || 'mdi:television', 54)}</div>`}<div class="tvg"></div>
        <div class="tvt">${ch ? `<span class="tvch">${R_icon(kon ? 'mdi:satellite-variant' : 'mdi:television-classic', 14)}${R_esc(ch)}</span>` : ''}${kon && live ? '<span class="plive"><i></i>Live</span>' : kon ? `<span class="tvch">${kpl ? 'läuft' : 'pausiert'}</span>` : ''}</div>
        <div class="tvb"><div class="pti">${R_esc(title)}</div>${sub ? `<div class="par">${R_esc(sub)}</div>` : ''}${dur ? `<div class="ppg"><span>${new Date(Date.now() - pos * 1000).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span><div class="pgb"><i style="width:${Math.round(pos / dur * 100)}%"></i></div><span>${new Date(Date.now() + (dur - pos) * 1000).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span></div>` : ''}</div></div>
      <div class="tvc2"><div class="pct">${b(e, on ? 'turn_off' : 'turn_on', 'mdi:power', 'Fernseher ein/aus', on ? 'act' : '')}${k ? `${KF & 16 ? b(x.sky, 'media_previous_track', 'mdi:rewind', 'Zurück') : ''}${b(x.sky, 'media_play_pause', kpl ? 'mdi:pause' : 'mdi:play', 'Play/Pause', 'big')}${KF & 32 ? b(x.sky, 'media_next_track', 'mdi:fast-forward', 'Vor') : ''}${b(x.sky, kon ? 'turn_off' : 'turn_on', 'mdi:satellite-variant', 'Receiver ein/aus', kon ? 'act' : '')}` : on && !rm ? `${F & 16 ? b(e, 'media_previous_track', 'mdi:chevron-down', 'Programm zurück') : ''}<span class="tvp">P</span>${F & 32 ? b(e, 'media_next_track', 'mdi:chevron-up', 'Programm vor') : ''}` : ''}</div>
      ${on && rm ? `<div class="rmt"><div class="rpad">${rb('Up', 'mdi:chevron-up', 'Hoch', 'u')}${rb('Left', 'mdi:chevron-left', 'Links', 'l')}${rb('Confirm', 'OK', 'OK', 'ok')}${rb('Right', 'mdi:chevron-right', 'Rechts', 'r')}${rb('Down', 'mdi:chevron-down', 'Runter', 'd')}</div>
        <div class="rcol">${rb('Return', 'mdi:keyboard-return', 'Zurück')}${rb('Home', 'mdi:home', 'Home')}${rb('EPG', 'mdi:television-guide', 'Programmführer')}${rb('Options', 'mdi:dots-horizontal', 'Optionen')}</div>
        <div class="rcol">${rb('VolumeUp', 'mdi:volume-plus', 'Lauter')}${rb('VolumeDown', 'mdi:volume-minus', 'Leiser')}${rb('ChannelUp', '<b>P+</b>', 'Programm +')}${rb('ChannelDown', '<b>P−</b>', 'Programm −')}</div></div>` : ''}
      ${on && vol != null ? `<div class="pvo"><button class="pb sm" data-act="mp" data-sv="volume_mute" data-e="${e}" aria-label="Stumm">${R_icon(A.is_volume_muted ? 'mdi:volume-off' : vol < 30 ? 'mdi:volume-low' : vol < 70 ? 'mdi:volume-medium' : 'mdi:volume-high', 18)}</button><input type="range" min="0" max="100" value="${vol}" data-act="vol" data-e="${e}" data-busy="media" data-live="${id}" data-unit=" %" aria-label="Lautstärke ${R_esc(x.name)}"><span id="${id}">${vol} %</span></div>` : ''}
      ${on && (apps.length || rm || (x.apps || []).length) ? `<div class="pfv">${x.remote && !apps.includes('TV') ? `<button class="pfc" data-act="rc" data-e="${x.remote}" data-c="${kc('Tv')}">${R_icon('mdi:television-classic', 14)}TV</button>` : ''}${apps.map(o => `<button class="pfc ${o === A.source ? 'on' : ''}" data-act="srcb" data-e="${e}" data-o="${R_esc(o)}">${R_esc(String(o).split(' – ')[0])}</button>`).join('')}${(x.apps || []).map(ap => `<button class="pfc" data-act="app" data-e="${e}" data-id="${R_esc(ap.id)}">${R_icon(ap.icon || 'mdi:apps', 14)}${R_esc(ap.name)}</button>`).join('')}</div>` : ''}</div></div>`;
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
