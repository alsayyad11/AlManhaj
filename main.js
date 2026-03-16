'use strict';

/* ══════════════════════════════════════
   HERO — BACKGROUND SLIDESHOW
══════════════════════════════════════ */
(function initHeroSlideshow() {
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  if (!slides.length) return;

  const DISPLAY  = 7000;  // how long each slide is fully visible
  const FADE_IN  = 2500;  // ms — must match CSS transition
  const KB_DIRS  = ['kb-0','kb-1','kb-2','kb-3'];

  let current = 0;

  function applyKB(slide) {
    KB_DIRS.forEach(c => slide.classList.remove(c));
    slide.classList.add(KB_DIRS[Math.floor(Math.random() * KB_DIRS.length)]);
  }

  // Prime first slide
  applyKB(slides[0]);
  slides[0].classList.add('active');

  function next() {
    const prev = current;
    current = (current + 1) % slides.length;

    // Bring new slide to front, start Ken Burns, fade it in
    slides[current].style.zIndex = 2;
    applyKB(slides[current]);
    // Force reflow so transition triggers
    slides[current].getBoundingClientRect();
    slides[current].classList.add('active');

    // After fade-in completes, retire old slide quietly
    setTimeout(() => {
      slides[prev].classList.remove('active');
      KB_DIRS.forEach(c => slides[prev].classList.remove(c));
      slides[prev].style.zIndex = 1;
      slides[current].style.zIndex = 1;
    }, FADE_IN + 100);
  }

  setInterval(next, DISPLAY + FADE_IN);
})();

/* ══════════════════════════════════════
   HERO — DARK MODE: RISING GOLDEN PARTICLES
══════════════════════════════════════ */
(function initDarkParticles() {
  const wrap = document.getElementById('hero-dark-particles');
  if (!wrap) return;
  const COUNT = 35;
  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'dark-particle';
    const size  = 4 + Math.random() * 18;
    const left  = Math.random() * 100;
    const dur   = 14 + Math.random() * 20;
    const delay = -Math.random() * dur;
    const hue   = 36 + Math.floor(Math.random() * 20);
    const alpha = .12 + Math.random() * .25;
    el.style.cssText = `
      width:${size}px; height:${size}px;
      left:${left}%;
      bottom: 0;
      background: radial-gradient(circle at 40% 35%,
        hsla(${hue},90%,85%,${alpha + .2}) 0%,
        hsla(${hue},80%,60%,${alpha}) 50%,
        transparent 80%);
      filter: blur(${1 + Math.random() * 4}px);
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
    `;
    wrap.appendChild(el);
  }
})();


(function initStarField() {
  const canvas = document.getElementById('hero-stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const TIERS = [
    {weight:55,minR:.4, maxR:.9, minO:.20,maxO:.55,glowChance:0,   glow:0 },
    {weight:30,minR:.9, maxR:1.6,minO:.40,maxO:.80,glowChance:.08, glow:5 },
    {weight:12,minR:1.6,maxR:2.6,minO:.65,maxO:.92,glowChance:.45, glow:10},
    {weight:3, minR:2.6,maxR:4.0,minO:.80,maxO:1.0,glowChance:1,   glow:18},
  ];
  const pool=[];
  TIERS.forEach((t,i)=>{ for(let w=0;w<t.weight;w++) pool.push(i); });
  let sv=Date.now()%999983;
  const rnd=()=>{ sv=(sv*16807+0)%2147483647; return(sv-1)/2147483646; };
  const stars=Array.from({length:220},()=>{
    const T=TIERS[pool[Math.floor(rnd()*pool.length)]];
    return{xN:rnd(),yN:Math.pow(rnd(),1.6),r:T.minR+rnd()*(T.maxR-T.minR),
      o:T.minO+rnd()*(T.maxO-T.minO),hasGlow:rnd()<T.glowChance,gR:T.glow,
      tw:rnd()<.12,to:rnd()*Math.PI*2,ts:.5+rnd()*1.5};
  });
  let W=0,H=0,af=null,t0=performance.now();
  function resize(){
    const r=canvas.parentElement.getBoundingClientRect();
    W=canvas.width=r.width||window.innerWidth;
    H=canvas.height=r.height||window.innerHeight;
  }
  function draw(now){
    ctx.clearRect(0,0,W,H);
    const e=(now-t0)/1000;
    stars.forEach(s=>{
      let o=s.o;
      if(s.tw) o=Math.max(.08,o+Math.sin(e*s.ts+s.to)*.22);
      const x=s.xN*W,y=s.yN*H;
      ctx.save(); ctx.globalAlpha=o;
      if(s.hasGlow){
        const g=ctx.createRadialGradient(x,y,0,x,y,s.gR*s.r);
        g.addColorStop(0,`rgba(220,210,180,${o*.6})`);
        g.addColorStop(.4,`rgba(201,168,76,${o*.2})`);
        g.addColorStop(1,'rgba(201,168,76,0)');
        ctx.beginPath();ctx.arc(x,y,s.gR*s.r,0,Math.PI*2);
        ctx.fillStyle=g;ctx.fill();
      }
      ctx.beginPath();ctx.arc(x,y,s.r,0,Math.PI*2);
      ctx.fillStyle='rgba(240,235,215,1)';ctx.fill();
      ctx.restore();
    });
    af=requestAnimationFrame(draw);
  }
  resize();
  let rt;
  window.addEventListener('resize',()=>{ clearTimeout(rt);rt=setTimeout(resize,120); });
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ if(!af){t0=performance.now();af=requestAnimationFrame(draw);} }
      else{ if(af){cancelAnimationFrame(af);af=null;} }
    });
  },{threshold:.01});
  obs.observe(canvas.parentElement);
})();

/* ══════════════════════════════════════
   HERO — LIGHT MODE: FALLING LANTERNS
══════════════════════════════════════ */
(function initLanterns() {
  const wrap = document.getElementById('hero-lights');
  if (!wrap) return;
  const LANTERNS = 28;
  for (let i = 0; i < LANTERNS; i++) {
    const el = document.createElement('div');
    el.className = 'hero-lantern';
    const size  = 20 + Math.random() * 80;        // 20–100px
    const left  = Math.random() * 100;             // % from right (RTL)
    const dur   = 12 + Math.random() * 22;         // 12–34s
    const delay = -Math.random() * dur;            // start mid-animation
    // warm gold to amber palette
    const hue   = 38 + Math.floor(Math.random() * 18);
    const sat   = 80 + Math.floor(Math.random() * 20);
    const alpha = .18 + Math.random() * .32;
    el.style.cssText = `
      width:${size}px; height:${size}px;
      right:${left}%;
      background: radial-gradient(circle at 40% 35%,
        hsla(${hue},${sat}%,82%,${alpha+.15}) 0%,
        hsla(${hue},${sat}%,62%,${alpha}) 45%,
        transparent 75%);
      filter: blur(${2 + Math.random()*5}px);
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
    `;
    wrap.appendChild(el);
  }
})();

/* ══════════════════════════════════════
   THEME (DARK / LIGHT)
══════════════════════════════════════ */
const darkToggle = document.getElementById('dark-mode');
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  if (darkToggle) darkToggle.checked = true;
}
darkToggle?.addEventListener('change', () => {
  document.body.classList.toggle('dark', darkToggle.checked);
  localStorage.setItem('theme', darkToggle.checked ? 'dark' : 'light');
});

/* ══════════════════════════════════════
   REVEAL ON SCROLL
══════════════════════════════════════ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }});
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ══════════════════════════════════════
   HEADER — SMART HIDE/SHOW
══════════════════════════════════════ */
const header   = document.getElementById('header');
const navMenu  = document.getElementById('nav-menu');
const menuBars = document.getElementById('menu-bars');

let lastScrollY   = 0;
let idleTimer     = null;
let headerVisible = true;
const IDLE_DELAY  = 2800; // ms until header hides when idle

function showHeader() {
  if (!headerVisible) { header.classList.remove('hide'); headerVisible = true; }
  clearTimeout(idleTimer);
  // Only auto-hide when scrolled past hero
  if (window.scrollY > 100) {
    idleTimer = setTimeout(() => {
      // Don't hide if nav menu is open
      if (!navMenu.classList.contains('active')) {
        header.classList.add('hide'); headerVisible = false;
      }
    }, IDLE_DELAY);
  }
}

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
  document.getElementById('scroll-top-btn')?.classList.toggle('active', window.scrollY > 300);
  showHeader();
  lastScrollY = window.scrollY;
}, { passive: true });

// Show on any mouse/touch movement
document.addEventListener('mousemove', showHeader, { passive: true });
document.addEventListener('touchstart', showHeader, { passive: true });
document.addEventListener('keydown', showHeader);

menuBars?.addEventListener('click', () => {
  const open = navMenu.classList.toggle('active');
  menuBars.innerHTML = open ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  if (open) showHeader(); // keep header visible while menu is open
});

// Close nav on outside click
document.addEventListener('click', e => {
  if (!navMenu.contains(e.target) && !menuBars.contains(e.target)) {
    navMenu.classList.remove('active');
    menuBars.innerHTML = '<i class="fas fa-bars"></i>';
  }
});

// "تواصل" opens contact page same tab
document.getElementById('nav-contact')?.addEventListener('click', e => {
  e.stopPropagation();
  window.location.href = 'contact.html';
});

/* ══════════════════════════════════════
   NAV SMOOTH SCROLL
══════════════════════════════════════ */
const sectionMap = {
  main:'#main-section', pray:'.pray', tasbeeh:'.tasbeeh',
  quran:'.quran', azkar:'.azkar-section', huson:'.huson-section',
  books:'.books-section', hadith:'.hadith', lectures:'.lectures',
  podcast:'.podcast-section', muhasaba:'.muhasaba-section', footer:'#footer-section',
};

/* ── Section in-view observer (depth effect) ── */
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    e.target.classList.toggle('in-view', e.isIntersecting);
  });
}, { threshold: 0.08 });
document.querySelectorAll('.page-section').forEach(s => sectionObserver.observe(s));

navMenu?.querySelectorAll('li[data-filter]').forEach(li => {
  li.addEventListener('click', () => {
    const sel = sectionMap[li.dataset.filter];
    if (sel) { const el = document.querySelector(sel); if (el) el.scrollIntoView({behavior:'smooth'}); }
    navMenu.classList.remove('active');
    menuBars.innerHTML = '<i class="fas fa-bars"></i>';
  });
});
document.getElementById('explore-btn')?.addEventListener('click', () => document.querySelector('.pray')?.scrollIntoView({behavior:'smooth'}));
document.getElementById('quran-btn')?.addEventListener('click',   () => document.querySelector('.quran')?.scrollIntoView({behavior:'smooth'}));
document.getElementById('scroll-top-btn')?.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

/* ══════════════════════════════════════
   PRAYER TIMES
══════════════════════════════════════ */
const selCountry  = document.getElementById('selected_country');
const selState    = document.getElementById('selected_state');
const prayGrid    = document.getElementById('pray-cards-grid');
const prayOrder   = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
const prayArabic  = {Fajr:'الفجر',Sunrise:'الشروق',Dhuhr:'الظهر',Asr:'العصر',Maghrib:'المغرب',Isha:'العشاء'};
const prayIcons   = {Fajr:'🌙',Sunrise:'🌄',Dhuhr:'☀️',Asr:'🌤️',Maghrib:'🌅',Isha:'⭐'};
let countryNames  = {}, stateNames = {}, autoState = '';

function loadCountries() {
  fetch('https://api.countrystatecity.in/v1/countries', {headers:{[`X-CSCAPI-KEY`]:'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='}})
    .then(r=>r.json()).then(data=>{
      data.sort((a,b)=>a.name.localeCompare(b.name,'ar'));
      data.forEach(c=>{
        countryNames[c.iso2]=c.name;
        const o=document.createElement('option');
        o.value=c.iso2; o.id=c.name; o.textContent=c.name;
        selCountry.appendChild(o);
      });
      if (autoState) {
        const try1=()=>{ const o=[...selCountry.options].find(x=>x.textContent.includes(autoState));
          if(o){o.selected=true;loadStates(o.value);} };
        try1();
      }
    }).catch(()=>{selCountry.innerHTML='<option value="#">⚠️ تعذّر التحميل</option>';});
}
function loadStates(iso2) {
  selState.innerHTML='<option value="#">جارٍ التحميل...</option>';
  fetch(`https://api.countrystatecity.in/v1/countries/${iso2}/states`,{headers:{[`X-CSCAPI-KEY`]:'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='}})
    .then(r=>r.json()).then(data=>{
      selState.innerHTML='<option value="#">اختر المنطقة</option>';
      data.sort((a,b)=>a.name.localeCompare(b.name));
      data.forEach(s=>{
        stateNames[s.iso2]=s.name;
        const o=document.createElement('option');
        o.value=s.iso2; o.textContent=s.name;
        if (autoState && (s.name.includes(autoState)||autoState.includes(s.name))) {
          o.selected=true; autoState='';
          getPrayTimes(countryNames[iso2],s.name);
        }
        selState.appendChild(o);
      });
    }).catch(()=>{selState.innerHTML='<option value="#">⚠️ تعذّر التحميل</option>';});
}
/* ── Prayer location toggle button ── */
const prayChangeBtn = document.getElementById('pray-change-btn');
const praySelectors = document.getElementById('pray-selectors');
let selectorsVisible = false;
prayChangeBtn?.addEventListener('click', () => {
  selectorsVisible = !selectorsVisible;
  praySelectors.style.display = selectorsVisible ? 'flex' : 'none';
  prayChangeBtn.innerHTML = selectorsVisible
    ? '<i class="fas fa-times"></i> إغلاق'
    : '<i class="fas fa-sliders-h"></i> تغيير الموقع';
});

/* ── Default: load Mansura on page load ── */
window.addEventListener('DOMContentLoaded', () => {
  getPrayTimes('Egypt', 'Dakahlia');
});


selState.addEventListener('change',()=>{
  const iso=selState.value; if(iso==='#') return;
  getPrayTimes(countryNames[selCountry.value]||'',stateNames[iso]||selState.options[selState.selectedIndex].textContent);
  // Update location label
  const locLabel = document.getElementById('pray-location-label');
  if(locLabel) locLabel.textContent = `${stateNames[iso] || ''}, ${countryNames[selCountry.value] || ''}`;
});
function setCurrentPrayTime(countryName,region,countryCode) {
  autoState=region; getPrayTimes(countryName,region);
  const try1=(n=0)=>{
    const o=[...selCountry.options].find(x=>x.id===countryName||x.textContent.includes(countryName));
    if(o){o.selected=true;loadStates(countryCode);}
    else if(n<25) setTimeout(()=>try1(n+1),300);
  };
  try1();
}
function getPrayTimes(country,city) {
  if(!city||city==='#') return;
  prayGrid.innerHTML='<div class="loading-dots" style="grid-column:1/-1"><span></span><span></span><span></span></div>';
  const tryF=(c,ci)=>fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(ci)}&country=${encodeURIComponent(c)}&method=5`).then(r=>r.json());
  tryF(country,city).then(d=>{ if(d.code!==200||!d.data?.timings) return tryF(country,country); return d; })
    .then(d=>{ if(d.code!==200||!d.data?.timings) throw new Error(); renderPrayCards(d.data.timings); })
    .catch(()=>{ prayGrid.innerHTML='<p class="pray-empty">⚠️ تعذّر تحميل أوقات الصلاة، حاول مرة أخرى</p>'; });
}
function getNextPrayer(timings) {
  const now=new Date(); const nm=now.getHours()*60+now.getMinutes();
  for(const k of prayOrder){ if(!timings[k]) continue; const[h,m]=timings[k].split(':').map(Number); if(h*60+m>nm) return k; }
  return prayOrder[0];
}
function renderPrayCards(timings) {
  prayGrid.innerHTML=`<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="prayGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1565a8"/><stop offset="100%" stop-color="#d4ac4e"/></linearGradient></defs></svg>`;
  const next=getNextPrayer(timings);
  const C=2*Math.PI*46;
  prayOrder.forEach((key,i)=>{
    if(!timings[key]) return;
    const[hS,mS]=timings[key].split(':'); const h=+hS,m=+mS;
    const ampm=h>=12?'م':'ص'; const h12=h%12||12;
    const timeStr=`${h12}:${mS.padStart(2,'0')}`;
    const pct=(h*60+m)/(24*60); const offset=C-pct*C;
    const isNext=key===next;
    const card=document.createElement('div');
    card.className='pray-card reveal'+(isNext?' is-next':'');
    card.style.transitionDelay=`${i*80}ms`;
    card.innerHTML=`${isNext?'<div class="pray-next-badge">التالية</div>':''}<div class="pray-card-icon">${prayIcons[key]}</div><div class="pray-ring"><svg viewBox="0 0 100 100"><circle class="pray-ring-track" cx="50" cy="50" r="46"/><circle class="pray-ring-fill" cx="50" cy="50" r="46" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg><div class="pray-time-display">${timeStr}<sub>${ampm}</sub></div></div><div class="pray-name">${prayArabic[key]}</div>`;
    prayGrid.appendChild(card); revealObserver.observe(card);
    requestAnimationFrame(()=>{ setTimeout(()=>{ const f=card.querySelector('.pray-ring-fill'); if(f) f.style.strokeDashoffset=offset; },100+i*80); });
  });
}
loadCountries();
selCountry.addEventListener('change',()=>{ const iso=selCountry.value; if(iso!=='#'){autoState='';loadStates(iso);} });

/* ══════════════════════════════════════
   TASBEEH
══════════════════════════════════════ */
const adhkar = [
  {text:'سُبْحَانَ اللَّهِ',                         reward:'يُكتب له ألف حسنة أو يُحط عنه ألف خطيئة',               target:33},
  {text:'الْحَمْدُ لِلَّهِ',                          reward:'تملأ ميزان العبد بالحسنات',                              target:33},
  {text:'اللَّهُ أَكْبَرُ',                           reward:'كُتبت له عشرون حسنة وحُطت عنه عشرون سيئة',              target:34},
  {text:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',             reward:'حُطَّت خطاياه وإن كانت مثل زبد البحر',                  target:100},
  {text:'سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ', reward:'غُرست له نخلة في الجنة',                                target:100},
  {text:'لَا إِلَهَ إِلَّا اللَّهُ',                  reward:'أفضل الذكر وخير الكلام بعد القرآن',                     target:100},
  {text:'أَسْتَغْفِرُ اللَّهَ',                       reward:'جعل الله له من كل هم فرجاً ومن كل ضيق مخرجاً',         target:100},
  {text:'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', reward:'كنز من كنوز الجنة',                                     target:100},
  {text:'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',           reward:'من صلى عليه مرة صلى الله عليه عشراً',                  target:100},
  {text:'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ',      reward:'أحب الكلام إلى الله وأفضل الكلام',                     target:100},
  {text:'اللَّهُ أَكْبَرُ كَبِيرًا',                  reward:'ملأت ما بين السماء والأرض',                             target:100},
];
let count=0, activeIdx=0;
const pillsContainer = document.getElementById('dhikr-pills');
const dhikrText      = document.getElementById('dhikr-text');
const dhikrReward    = document.getElementById('dhikr-reward');
const tasbeehBtn     = document.getElementById('tasbeeh-btn');
const countEl        = document.getElementById('tasbeeh-count');
const progressFill   = document.getElementById('tasbeeh-progress');
const targetLabel    = document.getElementById('tasbeeh-target-label');
const doneEl         = document.getElementById('tasbeeh-done');
const resetBtn       = document.getElementById('tasbeeh-reset');
const beadsGroup     = document.getElementById('beads-group');

adhkar.forEach((z,i)=>{
  const p=document.createElement('button');
  p.className='dhikr-pill'+(i===0?' active':'');
  p.textContent=z.text.length>20?z.text.slice(0,20)+'…':z.text;
  p.addEventListener('click',()=>selectDhikr(i));
  pillsContainer.appendChild(p);
});
function selectDhikr(idx) {
  activeIdx=idx; count=0;
  document.querySelectorAll('.dhikr-pill').forEach((p,i)=>p.classList.toggle('active',i===idx));
  dhikrText.textContent=adhkar[idx].text;
  dhikrReward.textContent=adhkar[idx].reward;
  countEl.textContent='0';
  updateProgress(0,adhkar[idx].target);
  doneEl.classList.remove('show');
  buildBeads(adhkar[idx].target);
}
function updateProgress(c,t){
  progressFill.style.width=Math.min(100,(c/t)*100)+'%';
  targetLabel.textContent=`${c} / ${t}`;
}
function buildBeads(total){
  beadsGroup.innerHTML='';
  const r=130,cx=160,cy=160,bc=Math.min(total,33);
  for(let i=0;i<bc;i++){
    const a=(i/bc)*2*Math.PI-Math.PI/2;
    const x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);
    const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx',x.toFixed(2));c.setAttribute('cy',y.toFixed(2));c.setAttribute('r','8.5');
    c.setAttribute('fill','rgba(184,146,42,.2)');c.setAttribute('stroke','rgba(184,146,42,.35)');c.setAttribute('stroke-width','1.5');
    c.dataset.idx=i; beadsGroup.appendChild(c);
  }
  const k=document.createElementNS('http://www.w3.org/2000/svg','circle');
  k.setAttribute('cx',cx);k.setAttribute('cy',cy-r);k.setAttribute('r','12');
  k.setAttribute('fill','rgba(184,146,42,.5)');k.setAttribute('stroke','rgba(184,146,42,.8)');k.setAttribute('stroke-width','2');
  beadsGroup.appendChild(k);
}
function renderBeads(c,total){
  const bc=Math.min(total,33),pb=total/bc,lit=Math.floor(c/pb);
  beadsGroup.querySelectorAll('circle[data-idx]').forEach((el,i)=>{
    if(i<lit){el.setAttribute('fill','rgba(184,146,42,.85)');el.setAttribute('stroke','#d4ac4e');}
    else{el.setAttribute('fill','rgba(184,146,42,.18)');el.setAttribute('stroke','rgba(184,146,42,.35)');}
  });
}
let audioCtx=null;
function playClick(){
  try{
    if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
    osc.connect(gain);gain.connect(audioCtx.destination);
    osc.frequency.value=880;osc.type='sine';
    gain.gain.setValueAtTime(.25,audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.12);
    osc.start();osc.stop(audioCtx.currentTime+.12);
  }catch(_){}
}
tasbeehBtn?.addEventListener('click',()=>{
  const target=adhkar[activeIdx].target;
  if(count>=target) return;
  count++;
  countEl.textContent=count;
  updateProgress(count,target);
  renderBeads(count,target);
  playClick();
  if(navigator.vibrate) navigator.vibrate(20);
  countEl.style.transform='scale(1.25)';
  setTimeout(()=>{countEl.style.transform='';},150);
  if(count>=target){
    doneEl.classList.add('show');
    setTimeout(()=>{
      const nx=(activeIdx+1)%adhkar.length;
      doneEl.classList.remove('show');
      document.querySelectorAll('.dhikr-pill')[nx]?.scrollIntoView({behavior:'smooth',block:'nearest'});
      selectDhikr(nx);
    },2000);
  }
});
resetBtn?.addEventListener('click',()=>{
  count=0;countEl.textContent='0';
  updateProgress(0,adhkar[activeIdx].target);
  renderBeads(0,adhkar[activeIdx].target);
  doneEl.classList.remove('show');
});
selectDhikr(0);

/* ══════════════════════════════════════
   QURAN — MUSHAF STYLE
══════════════════════════════════════ */
const surahContainer = document.getElementById('surahContainer');
const popup          = document.getElementById('surah-popup');
const ayatContainer  = document.getElementById('ayat-container');
const popupName      = document.getElementById('popup-surah-name');
const closePopup     = document.getElementById('close-popup');
const toggleBtn      = document.getElementById('autoscroll-toggle');
const speedSlider    = document.getElementById('autoscroll-speed');
const speedVal       = document.getElementById('autoscroll-speed-val');
let scrollInterval=null, isScrolling=false;

speedSlider?.addEventListener('input',()=>{
  speedVal.textContent=speedSlider.value+' ث';
  if(isScrolling){stopAutoScroll();startAutoScroll();}
});
function startAutoScroll(){
  isScrolling=true;
  if(toggleBtn){toggleBtn.classList.add('playing');toggleBtn.querySelector('.as-icon').innerHTML='<i class="fas fa-pause"></i>';toggleBtn.querySelector('.as-label').textContent='إيقاف';}
  const ms=Math.round((parseInt(speedSlider?.value||4)*1000)/60);
  scrollInterval=setInterval(()=>{
    popup.scrollBy(0,1);
    if(popup.scrollTop+popup.clientHeight>=popup.scrollHeight-10) stopAutoScroll();
  },ms);
}
function stopAutoScroll(){
  isScrolling=false;clearInterval(scrollInterval);scrollInterval=null;
  if(toggleBtn){toggleBtn.classList.remove('playing');toggleBtn.querySelector('.as-icon').innerHTML='<i class="fas fa-play"></i>';toggleBtn.querySelector('.as-label').textContent='تمرير تلقائي';}
}
toggleBtn?.addEventListener('click',()=>{ if(isScrolling) stopAutoScroll(); else startAutoScroll(); });

fetch('https://api.alquran.cloud/v1/meta')
  .then(r=>r.json()).then(data=>{
    const surahs=data.data.surahs.references;
    surahContainer.innerHTML='';
    surahs.forEach((s,idx)=>{
      const div=document.createElement('div');
      div.className='surah reveal';div.style.transitionDelay=`${(idx%20)*30}ms`;
      div.innerHTML=`<span class="surah-num">${s.number}</span><p>${s.name}</p><p>${s.englishName}</p>`;
      div.addEventListener('click',()=>openSurah(s.number,s.name,s.numberOfAyahs,s.revelationType));
      surahContainer.appendChild(div);revealObserver.observe(div);
    });
  }).catch(()=>{surahContainer.innerHTML='<p style="text-align:center;color:var(--txt-mid);padding:40px">تعذّر تحميل السور</p>';});

function openSurah(num,name,ayahCount,revelationType){
  popup.classList.add('active');document.body.style.overflow='hidden';
  popupName.textContent=name;stopAutoScroll();popup.scrollTo(0,0);
  ayatContainer.innerHTML='<div class="loading-dots" style="justify-content:center;padding:80px"><span></span><span></span><span></span></div>';
  fetch(`https://api.alquran.cloud/v1/surah/${num}`).then(r=>r.json()).then(data=>{
    const revType=revelationType==='Meccan'?'مكية':'مدنية';
    // name from API already contains "سُورَةُ", so use it directly
    let html=`<div class="mushaf-frame"><div class="mushaf-header"><div class="mushaf-surah-label">${name}</div><div class="mushaf-meta">${revType} · ${ayahCount} آية</div></div>`;
    if(num!==9) html+=`<div class="mushaf-basmala">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>`;
    html+=`<div class="mushaf-text">`;
    data.data.ayahs.forEach(a=>{
      html+=`${a.text} <span class="aya-num">${a.numberInSurah}</span> `;
      if(a.numberInSurah%10===0&&a.numberInSurah<ayahCount) html+=`</div><div class="mushaf-hizb">— ۞ —</div><div class="mushaf-text">`;
    });
    html+=`</div></div>`;
    ayatContainer.innerHTML=html;
  }).catch(()=>{ayatContainer.innerHTML='<p style="text-align:center;color:var(--txt-mid);padding:60px">تعذّر تحميل السورة</p>';});
}
closePopup?.addEventListener('click',closePopupFn);
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closePopupFn(); });
function closePopupFn(){stopAutoScroll();popup.classList.remove('active');document.body.style.overflow='';}

/* ══════════════════════════════════════
   AZKAR — MORNING & EVENING
══════════════════════════════════════ */
const AZKAR = {
  sabah:[
    {text:'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',count:1,source:'رواه مسلم'},
    {text:'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',count:1,source:'رواه أبو داود والترمذي'},
    {text:'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',count:1,source:'سيد الاستغفار — رواه البخاري'},
    {text:'اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ',count:4,source:'رواه أبو داود'},
    {text:'رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ ﷺ نَبِيًّا',count:3,source:'رواه أبو داود والترمذي'},
    {text:'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي',count:1,source:'رواه أبو داود وابن ماجه'},
    {text:'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',count:3,source:'رواه أبو داود'},
    {text:'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ',count:3,source:'رواه أبو داود والنسائي'},
    {text:'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',count:7,source:'رواه أبو داود — كفاه الله ما أهمه'},
    {text:'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',count:3,source:'رواه أبو داود والترمذي'},
    {text:'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',count:3,source:'رواه مسلم'},
    {text:'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',count:10,source:'من صلى عليه مرة صلى الله عليه عشراً'},
    {text:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',count:100,source:'رواه مسلم — تُحَطُّ خطاياه وإن كانت مثل زبد البحر'},
    {text:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',count:10,source:'رواه البخاري ومسلم'},
    {text:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ',count:3,source:'رواه مسلم — أفضل الذكر'},
    {text:'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا',count:1,source:'رواه ابن ماجه — يقال في صباح كل يوم'},
    {text:'أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ وَعَلَى كَلِمَةِ الْإِخْلَاصِ وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ',count:1,source:'رواه أحمد والنسائي'},
    {text:'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',count:1,source:'رواه أبو داود — أدّى شكر يومه'},
    {text:'آيَةُ الْكُرْسِيِّ',count:1,source:'من قرأها حين يصبح حُفظ حتى يمسي — رواه الطبراني'},
    {text:'قُلْ هُوَ اللَّهُ أَحَدٌ ۞ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۞ قُلْ أَعُوذُ بِرَبِّ النَّاسِ',count:3,source:'رواه أبو داود والترمذي — كافيتك من كل شيء'},
  ],
  masa:[
    {text:'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',count:1,source:'رواه مسلم'},
    {text:'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',count:1,source:'رواه أبو داود والترمذي'},
    {text:'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',count:1,source:'سيد الاستغفار — رواه البخاري'},
    {text:'اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ',count:4,source:'رواه أبو داود'},
    {text:'رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ ﷺ نَبِيًّا',count:3,source:'رواه أبو داود والترمذي'},
    {text:'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي',count:1,source:'رواه أبو داود وابن ماجه'},
    {text:'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',count:3,source:'رواه أبو داود'},
    {text:'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ',count:3,source:'رواه أبو داود والنسائي'},
    {text:'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',count:7,source:'رواه أبو داود'},
    {text:'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',count:3,source:'رواه أبو داود والترمذي'},
    {text:'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',count:3,source:'رواه مسلم'},
    {text:'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',count:10,source:'من صلى عليه مرة صلى الله عليه عشراً'},
    {text:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',count:100,source:'رواه مسلم — تُحَطُّ خطاياه وإن كانت مثل زبد البحر'},
    {text:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',count:10,source:'رواه البخاري ومسلم'},
    {text:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ',count:3,source:'رواه مسلم'},
    {text:'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ',count:7,source:'رواه البخاري'},
    {text:'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',count:3,source:'رواه الترمذي وابن ماجه'},
    {text:'أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ وَعَلَى كَلِمَةِ الْإِخْلَاصِ وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا',count:1,source:'رواه أحمد والنسائي'},
    {text:'اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',count:1,source:'رواه أبو داود — أدّى شكر ليلته'},
    {text:'آيَةُ الْكُرْسِيِّ',count:1,source:'من قرأها حين يمسي حُفظ حتى يصبح — رواه الطبراني'},
    {text:'قُلْ هُوَ اللَّهُ أَحَدٌ ۞ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۞ قُلْ أَعُوذُ بِرَبِّ النَّاسِ',count:3,source:'رواه أبو داود والترمذي'},
    {text:'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',count:3,source:'رواه أبو داود والترمذي'},
  ]
};
let currentAzkar='sabah';
const azkarCounters={};
function switchAzkar(type){
  currentAzkar=type;
  document.getElementById('azkar-title').textContent=type==='sabah'?'أذكار الصباح':'أذكار المساء';
  document.getElementById('btn-sabah').classList.toggle('active',type==='sabah');
  document.getElementById('btn-masa').classList.toggle('active',type==='masa');
  renderAzkar();
}
function buildAzkarCard(z,key,i){
  if(!azkarCounters[key]) azkarCounters[key]=0;
  const done=azkarCounters[key]>=z.count;
  const pct=Math.min(100,(azkarCounters[key]/z.count)*100);
  const card=document.createElement('div');
  card.className='azkar-card reveal';
  card.style.transitionDelay=`${(i%10)*50}ms`;
  card.innerHTML=`<div class="azkar-progress-bar"><div class="azkar-progress-fill" style="width:${pct}%"></div></div>
    <div class="azkar-card-inner">
      <div class="azkar-card-action">
        <div class="azkar-count-display" id="azkar-cnt-${key}">${azkarCounters[key]}</div>
        <div class="azkar-count-of">/ ${z.count}</div>
        ${done?`<button class="azkar-btn done"><i class="fas fa-check"></i></button>`:`<button class="azkar-btn" onclick="tapAzkar('${key}',${z.count})">+</button>`}
      </div>
      <div class="azkar-card-text">
        <div class="azkar-text">${z.text}</div>
        <div class="azkar-source">${z.source}</div>
      </div>
    </div>`;
  return card;
}
function renderAzkar(){
  const grid=document.getElementById('azkar-grid');
  if(!grid) return;
  grid.innerHTML='';
  AZKAR[currentAzkar].forEach((z,i)=>{
    const key=`${currentAzkar}-${i}`;
    const card=buildAzkarCard(z,key,i);
    grid.appendChild(card);
    revealObserver.observe(card);
  });
}
function tapAzkar(key,total){
  if(!azkarCounters[key]) azkarCounters[key]=0;
  if(azkarCounters[key]>=total) return;
  azkarCounters[key]++;
  const cntEl=document.getElementById(`azkar-cnt-${key}`);
  if(cntEl){ cntEl.textContent=azkarCounters[key];cntEl.classList.add('pop');setTimeout(()=>cntEl.classList.remove('pop'),200); }
  const card=cntEl?.closest('.azkar-card');
  if(card){ const f=card.querySelector('.azkar-progress-fill');if(f) f.style.width=Math.min(100,(azkarCounters[key]/total)*100)+'%'; }
  if(azkarCounters[key]>=total) setTimeout(()=>{ renderAzkar();renderHusonContent(); },300);
  if(navigator.vibrate) navigator.vibrate(15);
}
renderAzkar();

/* ══════════════════════════════════════
   HUSON AL-MUSLIM
══════════════════════════════════════ */
const HUSON_CATS = [
  {id:'nawm',     icon:'fa-bed',              label:'أذكار النوم'},
  {id:'istiqaz',  icon:'fa-sun',              label:'أذكار الاستيقاظ'},
  {id:'bayt_d',   icon:'fa-door-open',        label:'دخول البيت'},
  {id:'bayt_k',   icon:'fa-walking',          label:'الخروج من البيت'},
  {id:'masjid',   icon:'fa-mosque',           label:'دخول المسجد'},
  {id:'ta3am',    icon:'fa-utensils',         label:'أذكار الطعام'},
  {id:'libas',    icon:'fa-tshirt',           label:'أذكار اللباس'},
  {id:'salah',    icon:'fa-pray',             label:'أذكار بعد الصلاة'},
  {id:'wudu',     icon:'fa-hands-wash',       label:'أذكار الوضوء'},
  {id:'safar',    icon:'fa-car',              label:'أذكار السفر'},
  {id:'matar',    icon:'fa-cloud-rain',       label:'أذكار المطر'},
  {id:'karb',     icon:'fa-heart-broken',     label:'أذكار الكرب'},
  {id:'marad',    icon:'fa-heartbeat',        label:'أذكار المرض'},
  {id:'istikh',   icon:'fa-star-and-crescent',label:'دعاء الاستخارة'},
  {id:'khalaa',   icon:'fa-restroom',         label:'دخول الخلاء'},
];

const HUSON = {
  nawm:[
    {text:'بِسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',count:1,source:'رواه البخاري'},
    {text:'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',count:3,source:'رواه أبو داود والترمذي'},
    {text:'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَكَفَانَا وَآوَانَا، فَكَمْ مِمَّنْ لَا كَافِيَ لَهُ وَلَا مُؤوِيَ',count:1,source:'رواه مسلم'},
    {text:'سُبْحَانَ اللَّهِ',count:33,source:''},
    {text:'الْحَمْدُ لِلَّهِ',count:33,source:''},
    {text:'اللَّهُ أَكْبَرُ',count:34,source:'ثلاثة وثلاثون وثلاثة وثلاثون وأربعة وثلاثون — رواه البخاري ومسلم'},
    {text:'آيَةُ الْكُرْسِيِّ عند النوم — حفظه الله ولم يقربه شيطان حتى يصبح',count:1,source:'رواه البخاري'},
    {text:'قُلْ هُوَ اللَّهُ أَحَدٌ ۞ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۞ قُلْ أَعُوذُ بِرَبِّ النَّاسِ — ثم انفث عن يمينك ثلاث مرات',count:3,source:'رواه البخاري'},
    {text:'اللَّهُمَّ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا',count:1,source:'رواه مسلم'},
    {text:'اللَّهُمَّ إِنِّي أَسْلَمْتُ نَفْسِي إِلَيْكَ وَوَجَّهْتُ وَجْهِي إِلَيْكَ وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ وَفَوَّضْتُ أَمْرِي إِلَيْكَ رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ وَنَبِيِّكَ الَّذِي أَرْسَلْتَ',count:1,source:'رواه البخاري ومسلم'},
  ],
  istiqaz:[
    {text:'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',count:1,source:'رواه البخاري'},
    {text:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',count:1,source:'رواه البخاري'},
    {text:'اللَّهُمَّ اغْفِرْ لِي',count:1,source:'من استيقظ في الليل — رواه البخاري'},
    {text:'اللَّهُ أَكْبَرُ (عشر مرات) — الْحَمْدُ لِلَّهِ (عشر مرات) — سُبْحَانَ اللَّهِ (عشر مرات)',count:10,source:'رواه أبو داود والترمذي'},
  ],
  bayt_d:[
    {text:'بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',count:1,source:'رواه أبو داود'},
    {text:'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ، بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',count:1,source:'رواه أبو داود'},
  ],
  bayt_k:[
    {text:'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',count:1,source:'رواه أبو داود والترمذي — كُفيت ووُقيت وهُديت'},
    {text:'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ أَوْ أُضَلَّ، أَوْ أَزِلَّ أَوْ أُزَلَّ، أَوْ أَظْلِمَ أَوْ أُظْلَمَ، أَوْ أَجْهَلَ أَوْ يُجْهَلَ عَلَيَّ',count:1,source:'رواه أبو داود والترمذي'},
  ],
  masjid:[
    {text:'أَعُوذُ بِاللَّهِ الْعَظِيمِ وَبِوَجْهِهِ الْكَرِيمِ وَسُلْطَانِهِ الْقَدِيمِ مِنَ الشَّيْطَانِ الرَّجِيمِ — عند الدخول',count:1,source:'رواه أبو داود'},
    {text:'بِسْمِ اللَّهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ — عند الدخول',count:1,source:'رواه مسلم'},
    {text:'بِسْمِ اللَّهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ — عند الخروج',count:1,source:'رواه مسلم'},
  ],
  ta3am:[
    {text:'بِسْمِ اللَّهِ — قبل الأكل',count:1,source:'رواه أبو داود'},
    {text:'بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ — إذا نسي في أوله',count:1,source:'رواه أبو داود والترمذي'},
    {text:'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ — بعد الأكل',count:1,source:'رواه أبو داود والترمذي — غُفر له ما تقدم من ذنبه'},
    {text:'اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَأَطْعِمْنَا خَيْرًا مِنْهُ — عند شرب اللبن',count:1,source:'رواه أبو داود والترمذي'},
  ],
  libas:[
    {text:'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',count:1,source:'رواه أبو داود والترمذي — غُفر له ما تقدم'},
    {text:'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ — عند لبس الثوب الجديد',count:1,source:'رواه أبو داود والترمذي'},
  ],
  salah:[
    {text:'أَسْتَغْفِرُ اللَّهَ — عقب كل صلاة',count:3,source:'رواه مسلم'},
    {text:'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',count:1,source:'رواه مسلم'},
    {text:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ وَلَا مُعْطِيَ لِمَا مَنَعْتَ وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ',count:1,source:'رواه البخاري ومسلم'},
    {text:'سُبْحَانَ اللَّهِ',count:33,source:''},
    {text:'الْحَمْدُ لِلَّهِ',count:33,source:''},
    {text:'اللَّهُ أَكْبَرُ',count:33,source:'ثم يقول: لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ — رواه البخاري ومسلم'},
    {text:'آيَةُ الْكُرْسِيِّ دُبُرَ كُلِّ صَلَاةٍ مَكْتُوبَةٍ',count:1,source:'لَمْ يَمْنَعْهُ مِنْ دُخُولِ الْجَنَّةِ إِلَّا أَنْ يَمُوتَ — رواه النسائي'},
    {text:'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',count:1,source:'رواه أبو داود — يقال دبر كل صلاة'},
  ],
  wudu:[
    {text:'بِسْمِ اللَّهِ — عند بدء الوضوء',count:1,source:'رواه أبو داود'},
    {text:'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ — بعد الوضوء',count:1,source:'رواه مسلم — فُتحت له أبواب الجنة الثمانية'},
    {text:'اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ — بعد الوضوء',count:1,source:'رواه الترمذي'},
    {text:'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ — بعد الوضوء',count:1,source:'رواه النسائي والبيهقي'},
  ],
  safar:[
    {text:'اللَّهُ أَكْبَرُ (ثلاثاً) — سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ — عند ركوب الدابة',count:3,source:'رواه مسلم'},
    {text:'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ',count:1,source:'رواه مسلم'},
    {text:'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ وَكَآبَةِ الْمُنْقَلَبِ وَالْحَوْرِ بَعْدَ الْكَوْرِ وَدَعْوَةِ الْمَظْلُومِ وَسُوءِ الْمَنْظَرِ فِي الْأَهْلِ وَالْمَالِ',count:1,source:'رواه مسلم'},
    {text:'اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ وَالْخَلِيفَةُ فِي الْأَهْلِ',count:1,source:'رواه مسلم'},
    {text:'آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ — عند العودة',count:1,source:'رواه البخاري ومسلم'},
  ],
  matar:[
    {text:'اللَّهُمَّ صَيِّبًا نَافِعًا — عند نزول المطر',count:1,source:'رواه البخاري'},
    {text:'مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ — بعد المطر',count:1,source:'رواه البخاري ومسلم'},
    {text:'اللَّهُمَّ حَوَالَيْنَا وَلَا عَلَيْنَا — عند الاستسقاء والمطر الشديد',count:1,source:'رواه البخاري'},
    {text:'سُبْحَانَ مَنْ يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ — عند سماع الرعد',count:1,source:'رواه الموطأ'},
  ],
  karb:[
    {text:'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',count:1,source:'رواه البخاري ومسلم'},
    {text:'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ — دعاء ذي النون',count:1,source:'رواه الترمذي — لم يدعُ بها مسلم في أمر قط إلا استجاب الله له'},
    {text:'اللَّهُ اللَّهُ رَبِّي لَا أُشْرِكُ بِهِ شَيْئًا',count:1,source:'رواه أبو داود والنسائي'},
    {text:'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',count:1,source:'رواه البخاري'},
    {text:'اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ وَأَصْلِحْ لِي شَأْنِي كُلَّهُ لَا إِلَهَ إِلَّا أَنْتَ',count:1,source:'رواه أبو داود'},
    {text:'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ وَالْبُخْلِ وَالْجُبْنِ وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',count:1,source:'رواه البخاري'},
  ],
  marad:[
    {text:'بِسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِسْمِ اللَّهِ أَرْقِيكَ',count:3,source:'رواه مسلم — الرقية الشرعية'},
    {text:'أَذْهِبِ الْبَأْسَ رَبَّ النَّاسِ، اشْفِ وَأَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا',count:1,source:'رواه البخاري ومسلم'},
    {text:'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ — عند عيادة المريض',count:7,source:'رواه أبو داود والترمذي — عوفي'},
    {text:'بِسْمِ اللَّهِ — يضع يده على الألم ويقولها ثلاثاً ثم: أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ',count:7,source:'رواه مسلم'},
    {text:'لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ — لمن أصابه مرض أو حمى',count:1,source:'رواه البخاري'},
  ],
  istikh:[
    {text:'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الْغُيُوبِ. اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ [يذكر أمره] خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ وَاقْدُرْ لِي الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ',count:1,source:'رواه البخاري — يصلي ركعتين ثم يدعو بهذا الدعاء'},
  ],
  khalaa:[
    {text:'بِسْمِ اللَّهِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ — عند الدخول',count:1,source:'رواه البخاري ومسلم'},
    {text:'غُفْرَانَكَ — عند الخروج',count:1,source:'رواه أبو داود والترمذي'},
    {text:'الْحَمْدُ لِلَّهِ الَّذِي أَذْهَبَ عَنِّي الْأَذَى وَعَافَانِي — عند الخروج',count:1,source:'رواه ابن ماجه'},
  ],
};

let currentHusonCat = null;
const husonCounters = {};

function renderHusonCats() {
  const cats = document.getElementById('huson-cats');
  if (!cats) return;
  HUSON_CATS.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'huson-cat-btn';
    btn.id = `hcat-${cat.id}`;
    btn.innerHTML = `<i class="fas ${cat.icon}"></i> ${cat.label}`;
    btn.addEventListener('click', () => selectHusonCat(cat));
    cats.appendChild(btn);
  });
}

function selectHusonCat(cat) {
  currentHusonCat = cat.id;
  document.querySelectorAll('.huson-cat-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`hcat-${cat.id}`)?.classList.add('active');
  renderHusonContent();
  document.getElementById('huson-content')?.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function renderHusonContent() {
  const content = document.getElementById('huson-content');
  if (!content || !currentHusonCat) return;
  const list = HUSON[currentHusonCat];
  const cat  = HUSON_CATS.find(c => c.id === currentHusonCat);
  if (!list) return;

  content.innerHTML = `
    <div class="huson-header">
      <div class="huson-cat-title"><i class="fas ${cat.icon}" style="color:var(--gold);margin-left:10px"></i>${cat.label}</div>
      <button class="huson-reset-btn" onclick="resetHusonCat('${currentHusonCat}')"><i class="fas fa-redo-alt"></i> إعادة الكل</button>
    </div>
    <div class="huson-grid" id="huson-grid"></div>`;

  const grid = document.getElementById('huson-grid');
  list.forEach((z, i) => {
    const key = `huson-${currentHusonCat}-${i}`;
    if (!husonCounters[key]) husonCounters[key] = 0;
    const card = buildAzkarCard(z, key, i);
    grid.appendChild(card);
    revealObserver.observe(card);
  });
}

function resetHusonCat(catId) {
  const list = HUSON[catId];
  if (!list) return;
  list.forEach((_, i) => { husonCounters[`huson-${catId}-${i}`] = 0; });
  renderHusonContent();
}

renderHusonCats();

/* ══════════════════════════════════════
   BOOKS SECTION
══════════════════════════════════════ */
const BOOKS = [
  {
    icon:'📖', tag:'hadith', tagLabel:'حديث',
    title:'الأربعون النووية',
    author:'الإمام النووي',
    desc:'أربعون حديثاً نبوياً جامعة لأصول الإسلام، شرح وتعليق، من أكثر الكتب قراءة في تاريخ الإسلام.',
    cover:'linear-gradient(135deg,#1565a8 0%,#0b1623 100%)',
  },
  {
    icon:'💊', tag:'fiqh', tagLabel:'طب القلوب',
    title:'الداء والدواء',
    author:'ابن قيم الجوزية',
    desc:'من عيون التراث الإسلامي في أمراض القلوب ودوائها، الذنوب وآثارها، والتوبة والأنابة.',
    cover:'linear-gradient(135deg,#7c3aed 0%,#1565a8 100%)',
  },
  {
    icon:'🌟', tag:'tafsir', tagLabel:'تفسير',
    title:'التفسير الميسر',
    author:'نخبة من العلماء',
    desc:'تفسير سهل وميسر للقرآن الكريم، صادر عن مجمع الملك فهد لطباعة المصحف الشريف.',
    cover:'linear-gradient(135deg,#b8922a 0%,#0b1623 100%)',
  },
  {
    icon:'🌿', tag:'tazkiya', tagLabel:'تزكية',
    title:'علّمتني سورة البقرة',
    author:'د. رقية محمود المحارب',
    desc:'رحلة روحية عميقة مع أعظم سور القرآن وكيف تغيّر حياة المؤمن وتربط قلبه بالله.',
    cover:'linear-gradient(135deg,#047857 0%,#1565a8 100%)',
  },
  {
    icon:'📚', tag:'fiqh', tagLabel:'فقه',
    title:'ما لا يسع المسلم جهله',
    author:'د. محمد الزحيلي',
    desc:'دليل شامل وميسر للمسلم في أحكام الطهارة والصلاة والصوم والزكاة والحج وسائر العبادات.',
    cover:'linear-gradient(135deg,#0e7490 0%,#0b1623 100%)',
  },
  {
    icon:'📜', tag:'tafsir', tagLabel:'تفسير',
    title:'تفسير القرآن العظيم',
    author:'ابن كثير',
    desc:'أشهر كتب التفسير بالمأثور، يجمع بين الآيات والأحاديث وأقوال الصحابة والتابعين.',
    cover:'linear-gradient(135deg,#92400e 0%,#1565a8 100%)',
  },
  {
    icon:'🏛️', tag:'tafsir', tagLabel:'تفسير',
    title:'جامع البيان (تفسير الطبري)',
    author:'الإمام الطبري',
    desc:'أم كتب التفسير وأصلها، يعتمد الرواية والإسناد في استيعاب المعاني القرآنية بأسلوب علمي دقيق.',
    cover:'linear-gradient(135deg,#7f1d1d 0%,#b8922a 100%)',
  },
  {
    icon:'🕌', tag:'tafsir', tagLabel:'تفسير',
    title:'الجامع لأحكام القرآن',
    author:'الإمام القرطبي',
    desc:'تفسير فقهي استنباطي شامل، يُعنى باستخراج الأحكام الشرعية من آيات القرآن الكريم.',
    cover:'linear-gradient(135deg,#065f46 0%,#b8922a 100%)',
  },
  {
    icon:'🦅', tag:'tazkiya', tagLabel:'تزكية',
    title:'علو الهمة',
    author:'د. محمد بن إسماعيل',
    desc:'كتاب في تزكية النفس ورفع الهمة نحو الله، يُحرّك القارئ للعزيمة الصادقة والإرادة القوية.',
    cover:'linear-gradient(135deg,#1e40af 0%,#7c3aed 100%)',
  },
  {
    icon:'⚔️', tag:'seera', tagLabel:'سيرة',
    title:'رجال حول الرسول',
    author:'خالد محمد خالد',
    desc:'سيرة عطرة لأبرز صحابة رسول الله ﷺ، يُحيي فيهم صور الإيمان والبطولة والتضحية.',
    cover:'linear-gradient(135deg,#7f1d1d 0%,#0b1623 100%)',
  },
  {
    icon:'🌸', tag:'tazkiya', tagLabel:'تزكية',
    title:'لا تحزن',
    author:'د. عايض القرني',
    desc:'من أكثر الكتب مبيعاً في العالم العربي، يمنح القارئ طمأنينة القلب وقوة الإيمان لمواجهة الهموم.',
    cover:'linear-gradient(135deg,#065f46 0%,#b8922a 100%)',
  },
];

function renderBooks() {
  const grid = document.getElementById('books-grid');
  if (!grid) return;
  grid.innerHTML = '';
  BOOKS.forEach((b, i) => {
    const card = document.createElement('div');
    card.className = 'book-card reveal';
    card.style.transitionDelay = `${(i % 8) * 60}ms`;
    card.innerHTML = `
      <div class="book-cover" style="background:${b.cover}">
        <div class="book-cover-inner">
          <div class="book-icon">${b.icon}</div>
          <div class="book-cover-title">${b.title}</div>
        </div>
        <span class="book-tag ${b.tag}">${b.tagLabel}</span>
      </div>
      <div class="book-body">
        <div class="book-title">${b.title}</div>
        <div class="book-author">${b.author}</div>
        <div class="book-desc">${b.desc}</div>
      </div>`;
    grid.appendChild(card);
    revealObserver.observe(card);
  });
}
renderBooks();

/* ══════════════════════════════════════
   HADITH
══════════════════════════════════════ */
const hadithContainer = document.querySelector('.hadithContainer');
const hadithNumber    = document.querySelector('.hadith-number');
const prevBtn         = document.querySelector('.hadith-btn.prev');
const nextBtn         = document.querySelector('.hadith-btn.next');
let hadithData=[], hadithIndex=0;

fetch('https://api.hadith.gading.dev/books/muslim?range=1-300')
  .then(r=>r.json()).then(data=>{
    hadithData=data.data.hadiths;
    hadithIndex=Math.floor(Math.random()*hadithData.length);
    showHadith();
  }).catch(()=>{ hadithContainer.innerHTML='<p style="color:var(--txt-mid)">تعذّر تحميل الأحاديث</p>'; });

function showHadith(){
  hadithContainer.style.opacity='0';hadithContainer.style.transform='translateY(12px)';
  setTimeout(()=>{
    const h=hadithData[hadithIndex];
    hadithContainer.innerHTML=h?.arab||'';
    hadithNumber.textContent=`${hadithIndex+1} / ${hadithData.length}`;
    hadithContainer.style.opacity='1';hadithContainer.style.transform='translateY(0)';
    hadithContainer.style.transition='opacity .45s ease,transform .45s ease';
  },230);
}
nextBtn?.addEventListener('click',()=>{ hadithIndex=(hadithIndex+1)%hadithData.length; showHadith(); });
prevBtn?.addEventListener('click',()=>{ hadithIndex=(hadithIndex-1+hadithData.length)%hadithData.length; showHadith(); });

/* ══════════════════════════════════════
   MUHASABA — DAILY SELF-REFLECTION FLASHCARDS
══════════════════════════════════════ */
const MUHASABA_CARDS = [
  /* ══ دين ══ */
  {
    q: 'هل أديت صلواتك الخمس في أوقاتها اليوم؟',
    cta: '💡 اقلب لتأمّل ما قاله النبي ﷺ عن الصلاة',
    ref: '«الصلاة عمود الدين» — رواه البيهقي',
    r: 'الصلاة في وقتها هي أول ما يُسأل عنه العبد يوم القيامة. إن صلُحت صلُح سائر عمله. تأمل الآن: هل فاتتك صلاة بلا عذر؟ إن كان نعم، فقضِها الآن قبل أن تنام.'
  },
  {
    q: 'هل قرأت شيئاً من القرآن الكريم اليوم — ولو آية واحدة؟',
    cta: '📖 اقلب لتسمع وعد الله لمن يداوم على القرآن',
    ref: '﴿إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ﴾ — الإسراء: ٩',
    r: 'من قرأ حرفاً من القرآن فله به حسنة والحسنة بعشر أمثالها. يوم بلا قرآن يوم مفتوح للشيطان. قرّر الآن: سورة قصيرة قبل نومك الليلة.'
  },
  {
    q: 'هل ذكرت الله بأذكار الصباح والمساء اليوم؟',
    cta: '🌅 اقلب لتعرف ما تفعله هذه الأذكار بيومك',
    ref: '«من قال حين يصبح وحين يمسي: سبحان الله وبحمده مائة مرة، لم يأتِ أحد يوم القيامة بأفضل مما جاء به»',
    r: 'الأذكار درع يومك — تحصّن قلبك ورزقك وصحتك. إن فاتك أذكار الصباح، لا تنتظر الغد: اقرأها الآن وابدأ بحصن جديد من اليوم.'
  },
  {
    q: 'هل دخل قلبك كبر أو ازدراء لأحد من خلق الله اليوم؟',
    cta: '⚖️ اقلب لتعرف ما يفعله الكبر بصاحبه',
    ref: '«لا يدخل الجنة من كان في قلبه مثقال ذرة من كِبر» — رواه مسلم',
    r: 'الكبر حجاب رقيق لا يراه صاحبه إلا بعد فوات الأوان. تذكّر: كل إنسان يحمل سراً يجعله أحوج منك. راجع قلبك الآن وتُب إن وجدت أثراً.'
  },
  {
    q: 'هل استغفرت الله اليوم من ذنب أو غفلة؟',
    cta: '🌊 اقلب لترى قوة الاستغفار الخفية',
    ref: '﴿فَقُلْتُ اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا ۝ يُرْسِلِ السَّمَاءَ عَلَيْكُم مِّدْرَارًا﴾ — نوح: ١٠–١١',
    r: 'الاستغفار لا يمحو الذنب فحسب — بل يفتح أبواب الرزق والصحة والفرج. قل الآن: "أستغفر الله العظيم وأتوب إليه" سبعين مرة، وابدأ يوماً جديداً نظيفاً.'
  },
  {
    q: 'هل شكرت الله بقلبك ولسانك على نعمة تراها اليوم؟',
    cta: '✨ اقلب لتعرف لماذا الشكر يزيد النعمة فعلاً',
    ref: '﴿لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ﴾ — إبراهيم: ٧',
    r: 'الشكر ليس كلاماً — هو أن تستخدم النعمة في طاعة مانحها. الشكر يجذب المزيد كما المغناطيس. مارسه كل يوم: اذكر ثلاث نعم قبل نومك ولاحظ كيف تتغير نظرتك للحياة.'
  },

  /* ══ دنيا وتطوير ذات ══ */
  {
    q: 'هل أضعت اليوم ساعات في ما لا يبني مستقبلك؟',
    cta: '⏳ اقلب لترى ما قاله النبي ﷺ عن الوقت',
    ref: '«نعمتان مغبون فيهما كثير من الناس: الصحة والفراغ» — رواه البخاري',
    r: 'وقتك هو عمرك — ما أنفقته لن يعود. الشخص الذي تريد أن تكونه بعد عشر سنوات يبنى من قرارات اليوم الصغيرة. اكتب الآن: ماذا ستفعل بالساعة القادمة؟'
  },
  {
    q: 'هل تقدمت خطوة واحدة نحو هدف تسعى إليه اليوم؟',
    cta: '🎯 اقلب لتعرف سر الاستمرارية',
    ref: '«أحب الأعمال إلى الله أدومها وإن قلّ» — رواه البخاري ومسلم',
    r: 'لا يُشترط أن تقفز — يُشترط أن تتقدم. خطوة صغيرة كل يوم = 365 خطوة في السنة. سؤال صادق: ما الشيء الواحد الذي لو فعلته يومياً سيغير حياتك؟ ابدأه الليلة.'
  },
  {
    q: 'هل تحدّثت مع أحد اليوم بصدق وإنصات حقيقي؟',
    cta: '👂 اقلب لتعرف قيمة الحضور مع الناس',
    ref: '«من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت» — رواه البخاري',
    r: 'أكثر الناس يتكلمون لكن لا أحد يستمع. الإنصات الحقيقي هدية نادرة تجعلك محبوباً ومؤثراً. فكّر: من في حياتك يحتاج أن تسمعه اليوم؟ تواصل معه.'
  },
  {
    q: 'هل أكلت وشربت اليوم بما يعطي جسدك طاقة حقيقية؟',
    cta: '🌿 اقلب لتعرف ما قاله الإسلام عن الجسد',
    ref: '«إن لجسدك عليك حقاً» — رواه البخاري',
    r: 'جسدك أمانة أودعها الله عندك. ما تأكله يؤثر على تفكيرك وإيمانك وإنتاجيتك. قرّر شيئاً واحداً ستغيّره في غذائك هذا الأسبوع — لله ثم لنفسك.'
  },
  {
    q: 'هل فكرت اليوم في هدف حياتي واضح تسعى إليه؟',
    cta: '🧭 اقلب لترى كيف يربط الإسلام الهدف بالعبادة',
    ref: '﴿وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ﴾ — الذاريات: ٥٦',
    r: 'العبادة ليست فقط صلاة وصوم — هي أن تعيش حياتك كلها بنية لله. أعظم هدف هو أن تصبح نسخة أفضل خادمة لربها. ما هدفك الكبير؟ اكتبه الآن.'
  },
  {
    q: 'هل واجهت اليوم موقفاً صعباً وكيف تصرّفت؟',
    cta: '💪 اقلب لترى دواء النبي ﷺ للضيق',
    ref: '«عجباً لأمر المؤمن إن أمره كله خير — إن أصابته سراء شكر، وإن أصابته ضراء صبر» — رواه مسلم',
    r: 'المواقف الصعبة هي الامتحانات التي تصنع الشخصية. كل ضيقة تمر بها إما تكسرك أو تصقلك — والفارق هو كيف تنظر إليها. ما الدرس الذي تعلّمته اليوم؟'
  },

  /* ══ علاقات وأثر ══ */
  {
    q: 'هل تصدّقت أو أعنت شخصاً محتاجاً اليوم؟',
    cta: '❤️ اقلب لتعرف ما تفعله الصدقة في خفاء',
    ref: '«الصدقة تطفئ الخطيئة كما يطفئ الماء النار» — رواه الترمذي',
    r: 'الصدقة لا تنقص المال — بل تبارك فيه وتردّ البلاء. حتى ابتسامة في وجه أخيك صدقة. من يمكنك أن تساعده اليوم؟ لا تنتظر غداً.'
  },
  {
    q: 'هل بررت والديك أو صلت رحمك اليوم؟',
    cta: '🌸 اقلب لترى كيف يُسرع البر في الرزق',
    ref: '«من أحب أن يُبسط له في رزقه، ويُنسأ له في أثره، فليصل رحمه» — رواه البخاري',
    r: 'صلة الرحم تزيد العمر والرزق — هذا وعد الله لا مجرد قول. اتصل بأحد من أهلك الليلة. جملة واحدة كافية: "كيف حالك؟ أحبك في الله."'
  },
  {
    q: 'هل آذيت أحداً بكلمة أو صمت أو نظرة اليوم؟',
    cta: '🗝️ اقلب لترى ثقل الكلمة في الميزان',
    ref: '«إن الرجل ليتكلم بالكلمة لا يُلقي لها بالاً يهوي بها في النار أبعد مما بين المشرق والمغرب» — متفق عليه',
    r: 'كلمة واحدة قالت أو كُتبت قد تترك جرحاً يدوم سنوات. راجع يومك — هل جرحت أحداً؟ الاعتذار اليوم أسهل بألف مرة من الندم بعد سنوات.'
  },
  {
    q: 'هل سعيت في إصلاح علاقة مكسورة أو خصومة قائمة؟',
    cta: '🤝 اقلب لتعرف خطورة الهجر بين المسلمين',
    ref: '«لا يحل لمسلم أن يهجر أخاه فوق ثلاث» — متفق عليه',
    r: 'القلوب المكسورة تحتاج من يبادر. المبادر بالصلح هو الأعلى درجة عند الله. فكّر: من هجرته أو هجرك؟ رسالة واحدة يمكن أن تغير الكثير الليلة.'
  },

  /* ══ نفس وعقل ══ */
  {
    q: 'هل شعرت اليوم بامتنان حقيقي أم قضيته في التذمّر؟',
    cta: '🌤️ اقلب لترى العلاقة بين الامتنان والسعادة',
    ref: '«انظر إلى من هو أسفل منك، ولا تنظر إلى من هو فوقك، فهو أجدر ألا تزدري نعمة الله عليك» — متفق عليه',
    r: 'التذمّر يعمي العين عن النعم الموجودة. الامتنان ليس إنكار الألم — هو رؤية الخير بجانبه. اكتب الآن ثلاث نعم موجودة في حياتك الآن.'
  },
  {
    q: 'هل كانت نيّتك خالصة لله فيما فعلته اليوم؟',
    cta: '🔍 اقلب لتعرف كيف تحوّل النية العادي لعبادة',
    ref: '«إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى» — متفق عليه',
    r: 'نية صادقة تحوّل الأكل والعمل والنوم إلى عبادة. وعمل عظيم بلا نية — كورق في الريح. ابدأ الآن: نوِّ لله في أي فعل ستفعله قريباً.'
  },
  {
    q: 'هل تعاملت مع إخفاقك اليوم بتقبّل أم بجلد نفس مستمر؟',
    cta: '🌱 اقلب لترى كيف يتعامل الإسلام مع الخطأ',
    ref: '«كل ابن آدم خطّاء، وخير الخطّائين التوّابون» — رواه الترمذي',
    r: 'الإسلام لا يطلب المعصومين — يطلب التائبين. جلد النفس لا يصلح الماضي بل يُضعف المستقبل. تُب واعزم وامضِ. الله يحب التوابين.'
  },
  {
    q: 'ماذا فعلت اليوم تتمنى أن يُكتب في صحيفتك يوم القيامة؟',
    cta: '⭐ اقلب للسؤال الأهم في محاسبة النفس',
    ref: '﴿يَوْمَئِذٍ يَصْدُرُ النَّاسُ أَشْتَاتًا لِّيُرَوْا أَعْمَالَهُمْ﴾ — الزلزلة: ٦',
    r: 'يوم القيامة لن تُسأل: "كم كنت مشغولاً؟" — ستُسأل: "ماذا قدّمت؟". فكّر في الشيء الوحيد الذي فعلته اليوم لله. إن لم تجد شيئاً — فهذه اللحظة هي فرصتك.'
  },
];


(function initMuhasaba() {
  const scene  = document.getElementById('flashcard-scene');
  const card   = document.getElementById('flashcard');
  const qEl    = document.getElementById('fc-question');
  const rEl    = document.getElementById('fc-reflection');
  const numEl  = document.getElementById('fc-num');
  const dotsWrap = document.getElementById('fc-dots');
  const prevBtn  = document.getElementById('fc-prev');
  const nextBtn  = document.getElementById('fc-next');
  const progFill = document.getElementById('fc-progress');
  if (!card) return;

  let current = 0;
  let flipped  = false;

  // build dots
  MUHASABA_CARDS.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'fc-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });

  function renderCard(idx) {
    const c = MUHASABA_CARDS[idx];
    qEl.textContent  = c.q;
    // CTA on front card
    const ctaSpan = document.getElementById('fc-cta');
    if (ctaSpan) ctaSpan.textContent = c.cta || 'اقلب لتعرف أكثر';
    // Back: ref (ayah/hadith) + reflection
    rEl.innerHTML = `<div class="fc-ref">${c.ref}</div><div class="fc-body">${c.r}</div>`;
    const arabicNum  = (idx + 1).toLocaleString('ar-EG');
    const arabicTotal = MUHASABA_CARDS.length.toLocaleString('ar-EG');
    numEl.textContent = `${arabicNum} / ${arabicTotal}`;
    // dots
    dotsWrap.querySelectorAll('.fc-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
    // progress bar
    progFill.style.width = ((idx + 1) / MUHASABA_CARDS.length * 100) + '%';
  }

  function goTo(idx, animate) {
    // If flipped, flip back first
    if (flipped) {
      card.classList.remove('flipped');
      flipped = false;
      setTimeout(() => {
        current = idx;
        renderCard(current);
      }, 360);
    } else {
      current = idx;
      renderCard(current);
    }
  }

  // Flip on click
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
    flipped = !flipped;
  });

  prevBtn?.addEventListener('click', () => {
    goTo((current - 1 + MUHASABA_CARDS.length) % MUHASABA_CARDS.length);
  });
  nextBtn?.addEventListener('click', () => {
    goTo((current + 1) % MUHASABA_CARDS.length);
  });

  // Keyboard support
  document.addEventListener('keydown', e => {
    const inView = document.getElementById('muhasaba-section')?.getBoundingClientRect();
    if (!inView || inView.top > window.innerHeight || inView.bottom < 0) return;
    if (e.key === 'ArrowRight') prevBtn?.click();
    if (e.key === 'ArrowLeft')  nextBtn?.click();
    if (e.key === ' ') { e.preventDefault(); card.click(); }
  });

  // Touch swipe
  let touchStartX = 0;
  card.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, {passive:true});
  card.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextBtn?.click() : prevBtn?.click();
    } else {
      card.click(); // short tap = flip
    }
  });

  renderCard(0);
})();

/* ── Footer nav links ── */
document.querySelectorAll('.footer-links-group a[data-filter]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const sel = sectionMap[a.dataset.filter];
    if (sel) document.querySelector(sel)?.scrollIntoView({behavior:'smooth'});
  });
});
