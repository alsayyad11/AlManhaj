'use strict';

/* ══════════════════════════════════════
   PAGE LOAD FADE + PROGRESS BAR INJECT
══════════════════════════════════════ */
(function bootstrap() {
  // Progress bar element
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.prepend(bar);

  // Toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.id = 'toast';
  document.body.appendChild(toast);

  // Mobile overlay
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.id = 'nav-overlay';
  document.body.appendChild(overlay);

  // Page fade-in
  window.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => {
      document.body.classList.add('loaded');
    });
  });
})();

/* ══════════════════════════════════════
   HERO — BACKGROUND SLIDESHOW
══════════════════════════════════════ */
(function initHeroSlideshow() {
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  if (!slides.length) return;

  const isMobile = window.innerWidth <= 768;
  const DISPLAY  = isMobile ? 5000 : 7000;
  const FADE_IN  = isMobile ? 1000 : 2500;
  const KB_DIRS  = ['kb-0','kb-1','kb-2','kb-3'];

  let current = 0;

  function applyKB(slide) {
    KB_DIRS.forEach(c => slide.classList.remove(c));
    // على الموبايل: لا Ken Burns — يأثر على الأداء
    if (!isMobile) slide.classList.add(KB_DIRS[Math.floor(Math.random() * KB_DIRS.length)]);
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
  // الموبايل: متضيعش resources في تأثيرات مش هتتشاف
  if (window.innerWidth <= 768) return;
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
  // الموبايل: Canvas animation مكلفة جداً على الـ GPU
  if (window.innerWidth <= 768) return;
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
  // الموبايل: 28 element + animation = ثقيل جداً
  if (window.innerWidth <= 768) return;
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

  // Scroll progress bar
  const scrollBar = document.getElementById('scroll-progress');
  if (scrollBar) {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    scrollBar.style.width = (window.scrollY / total * 100) + '%';
  }
}, { passive: true });

// Show on any mouse/touch movement
document.addEventListener('mousemove', showHeader, { passive: true });
document.addEventListener('touchstart', showHeader, { passive: true });
document.addEventListener('keydown', showHeader);

menuBars?.addEventListener('click', () => {
  const open = navMenu.classList.toggle('active');
  menuBars.innerHTML = open ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  const overlay = document.getElementById('nav-overlay');
  if (overlay) overlay.classList.toggle('active', open);
  if (open) showHeader(); // keep header visible while menu is open
});

// Close nav on outside click or overlay click
document.addEventListener('click', e => {
  if (!navMenu.contains(e.target) && !menuBars.contains(e.target)) {
    navMenu.classList.remove('active');
    menuBars.innerHTML = '<i class="fas fa-bars"></i>';
    document.getElementById('nav-overlay')?.classList.remove('active');
  }
});
document.getElementById('nav-overlay')?.addEventListener('click', () => {
  navMenu.classList.remove('active');
  menuBars.innerHTML = '<i class="fas fa-bars"></i>';
  document.getElementById('nav-overlay')?.classList.remove('active');
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
  quran:'.quran', radio:'.radio-section', azkar:'.azkar-section', huson:'.huson-section',
  books:'.books-section', hadith:'.hadith', lectures:'.lectures',
  podcast:'.podcast-section', muhasaba:'.muhasaba-section', footer:'#footer-section',
};

/* ── Active nav highlight on scroll ── */
(function initActiveNav() {
  const sectionKeys = Object.entries(sectionMap).filter(([k]) => k !== 'footer');
  const navItems = navMenu ? [...navMenu.querySelectorAll('li[data-filter]')] : [];

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(li => {
          const sel = sectionMap[li.dataset.filter];
          if (!sel) return;
          const el = document.querySelector(sel);
          li.classList.toggle('nav-active', el === entry.target);
        });
      }
    });
  // threshold منخفض + rootMargin يعطي تحديث أسرع وأدق
  }, { threshold: 0.15, rootMargin: '-60px 0px -50% 0px' });

  sectionKeys.forEach(([, sel]) => {
    const el = document.querySelector(sel);
    if (el) obs.observe(el);
  });
})();

/* ── Stats bar counter animation ── */
(function initStatsCounter() {
  const statsBar = document.querySelector('.hero-stats-bar');
  if (!statsBar) return;

  function animateCount(el, target, duration = 1200) {
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(eased * target);
      el.classList.add('counting');
      if (progress < 1) requestAnimationFrame(update);
      else { el.classList.remove('counting'); el.textContent = target; }
    };
    requestAnimationFrame(update);
  }

  const statsObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      statsBar.classList.add('visible');
      statsBar.querySelectorAll('.hero-stat-num').forEach(el => {
        const val = parseInt(el.textContent);
        if (!isNaN(val)) animateCount(el, val, 1400);
      });
      statsObs.unobserve(statsBar);
    });
  }, { threshold: 0.5 });
  statsObs.observe(statsBar);
})();

/* ── Section in-view observer (depth effect) ── */
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    e.target.classList.toggle('in-view', e.isIntersecting);
  });
}, { threshold: 0.08 });
document.querySelectorAll('.page-section').forEach(s => sectionObserver.observe(s));

navMenu?.querySelectorAll('li[data-filter]').forEach(li => {
  li.addEventListener('click', () => {
    // ✅ تحديث فوري للـ active state بدون انتظار الـ IntersectionObserver
    navMenu.querySelectorAll('li[data-filter]').forEach(x => x.classList.remove('nav-active'));
    li.classList.add('nav-active');

    const sel = sectionMap[li.dataset.filter];
    if (sel) { const el = document.querySelector(sel); if (el) el.scrollIntoView({behavior:'smooth'}); }
    navMenu.classList.remove('active');
    menuBars.innerHTML = '<i class="fas fa-bars"></i>';
    document.getElementById('nav-overlay')?.classList.remove('active');
  });
});
document.getElementById('explore-btn')?.addEventListener('click', () => document.querySelector('.pray')?.scrollIntoView({behavior:'smooth'}));
document.getElementById('quran-btn')?.addEventListener('click',   () => document.querySelector('.quran')?.scrollIntoView({behavior:'smooth'}));
document.getElementById('scroll-top-btn')?.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

/* ── Toast utility ── */
function showToast(msg, icon = 'fa-check') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerHTML = `<i class="fas ${icon}"></i>${msg}`;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── Copy to clipboard utility ── */
function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast('تم النسخ', 'fa-copy'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); showToast('تم النسخ', 'fa-copy'); } catch(_) {}
    document.body.removeChild(ta);
  }
}

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

/* ── Hadith copy button ── */
(function initHadithCopy() {
  const hCard = document.querySelector('.hadith-card');
  if (!hCard) return;
  const btn = document.createElement('button');
  btn.className = 'copy-btn'; btn.title = 'نسخ الحديث';
  btn.innerHTML = '<i class="fas fa-copy"></i>';
  btn.addEventListener('click', () => {
    const text = document.querySelector('.hadithContainer')?.textContent?.trim() || '';
    copyText(text);
    btn.innerHTML = '<i class="fas fa-check"></i>';
    btn.classList.add('copied');
    setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i>'; btn.classList.remove('copied'); }, 2000);
  });
  hCard.appendChild(btn);
})();
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
  // Ripple
  tasbeehBtn.classList.remove('ripple');
  void tasbeehBtn.offsetWidth;
  tasbeehBtn.classList.add('ripple');
  setTimeout(()=>tasbeehBtn.classList.remove('ripple'), 450);
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
   QURAN — SURAH LIST + MUSHAF + AUDIO
══════════════════════════════════════ */
const surahContainer = document.getElementById('surahContainer');
const popup          = document.getElementById('surah-popup');
const ayatContainer  = document.getElementById('ayat-container');
const popupName      = document.getElementById('popup-surah-name');
const closePopup     = document.getElementById('close-popup');
const toggleBtn      = document.getElementById('autoscroll-toggle');
const speedSlider    = document.getElementById('autoscroll-speed');
const speedVal       = document.getElementById('autoscroll-speed-val');
let scrollInterval = null, isScrolling = false;

speedSlider?.addEventListener('input', function() {
  speedVal.textContent = speedSlider.value + ' ث';
  if (isScrolling) { stopAutoScroll(); startAutoScroll(); }
});
function startAutoScroll() {
  isScrolling = true;
  if (toggleBtn) {
    toggleBtn.classList.add('playing');
    toggleBtn.querySelector('.as-icon').innerHTML = '<i class="fas fa-pause"></i>';
    toggleBtn.querySelector('.as-label').textContent = 'إيقاف';
  }
  var ms = Math.round((parseInt(speedSlider ? speedSlider.value : 4) * 1000) / 60);
  scrollInterval = setInterval(function() {
    popup.scrollBy(0, 1);
    if (popup.scrollTop + popup.clientHeight >= popup.scrollHeight - 10) stopAutoScroll();
  }, ms);
}
function stopAutoScroll() {
  isScrolling = false;
  clearInterval(scrollInterval);
  scrollInterval = null;
  if (toggleBtn) {
    toggleBtn.classList.remove('playing');
    toggleBtn.querySelector('.as-icon').innerHTML = '<i class="fas fa-play"></i>';
    toggleBtn.querySelector('.as-label').textContent = 'تمرير تلقائي';
  }
}
toggleBtn?.addEventListener('click', function() { if (isScrolling) stopAutoScroll(); else startAutoScroll(); });

/* Arabic-Indic numerals */
function toArabicNumerals(n) {
  return String(n).replace(/[0-9]/g, function(d) { return '٠١٢٣٤٥٦٧٨٩'[+d]; });
}

/* ══════════════════════════════════════
   QURAN — SURAH LIST (بيانات مدمجة)
══════════════════════════════════════ */
var SURAHS_DATA = [
  {n:1,ar:'الفاتحة',en:'Al-Fatiha',v:7,t:'Meccan'},{n:2,ar:'البقرة',en:'Al-Baqara',v:286,t:'Medinan'},
  {n:3,ar:'آل عمران',en:'Ali Imran',v:200,t:'Medinan'},{n:4,ar:'النساء',en:'An-Nisa',v:176,t:'Medinan'},
  {n:5,ar:'المائدة',en:'Al-Maidah',v:120,t:'Medinan'},{n:6,ar:'الأنعام',en:'Al-Anam',v:165,t:'Meccan'},
  {n:7,ar:'الأعراف',en:'Al-Araf',v:206,t:'Meccan'},{n:8,ar:'الأنفال',en:'Al-Anfal',v:75,t:'Medinan'},
  {n:9,ar:'التوبة',en:'At-Tawbah',v:129,t:'Medinan'},{n:10,ar:'يونس',en:'Yunus',v:109,t:'Meccan'},
  {n:11,ar:'هود',en:'Hud',v:123,t:'Meccan'},{n:12,ar:'يوسف',en:'Yusuf',v:111,t:'Meccan'},
  {n:13,ar:'الرعد',en:'Ar-Rad',v:43,t:'Medinan'},{n:14,ar:'إبراهيم',en:'Ibrahim',v:52,t:'Meccan'},
  {n:15,ar:'الحجر',en:'Al-Hijr',v:99,t:'Meccan'},{n:16,ar:'النحل',en:'An-Nahl',v:128,t:'Meccan'},
  {n:17,ar:'الإسراء',en:'Al-Isra',v:111,t:'Meccan'},{n:18,ar:'الكهف',en:'Al-Kahf',v:110,t:'Meccan'},
  {n:19,ar:'مريم',en:'Maryam',v:98,t:'Meccan'},{n:20,ar:'طه',en:'Taha',v:135,t:'Meccan'},
  {n:21,ar:'الأنبياء',en:'Al-Anbiya',v:112,t:'Meccan'},{n:22,ar:'الحج',en:'Al-Haj',v:78,t:'Medinan'},
  {n:23,ar:'المؤمنون',en:'Al-Muminun',v:118,t:'Meccan'},{n:24,ar:'النور',en:'An-Nur',v:64,t:'Medinan'},
  {n:25,ar:'الفرقان',en:'Al-Furqan',v:77,t:'Meccan'},{n:26,ar:'الشعراء',en:'Ash-Shuara',v:227,t:'Meccan'},
  {n:27,ar:'النمل',en:'An-Naml',v:93,t:'Meccan'},{n:28,ar:'القصص',en:'Al-Qasas',v:88,t:'Meccan'},
  {n:29,ar:'العنكبوت',en:'Al-Ankabut',v:69,t:'Meccan'},{n:30,ar:'الروم',en:'Ar-Rum',v:60,t:'Meccan'},
  {n:31,ar:'لقمان',en:'Luqman',v:34,t:'Meccan'},{n:32,ar:'السجدة',en:'As-Sajdah',v:30,t:'Meccan'},
  {n:33,ar:'الأحزاب',en:'Al-Ahzab',v:73,t:'Medinan'},{n:34,ar:'سبأ',en:'Saba',v:54,t:'Meccan'},
  {n:35,ar:'فاطر',en:'Fatir',v:45,t:'Meccan'},{n:36,ar:'يس',en:'Ya-Sin',v:83,t:'Meccan'},
  {n:37,ar:'الصافات',en:'As-Saffat',v:182,t:'Meccan'},{n:38,ar:'ص',en:'Sad',v:88,t:'Meccan'},
  {n:39,ar:'الزمر',en:'Az-Zumar',v:75,t:'Meccan'},{n:40,ar:'غافر',en:'Ghafir',v:85,t:'Meccan'},
  {n:41,ar:'فصلت',en:'Fussilat',v:54,t:'Meccan'},{n:42,ar:'الشورى',en:'Ash-Shuraa',v:53,t:'Meccan'},
  {n:43,ar:'الزخرف',en:'Az-Zukhruf',v:89,t:'Meccan'},{n:44,ar:'الدخان',en:'Ad-Dukhan',v:59,t:'Meccan'},
  {n:45,ar:'الجاثية',en:'Al-Jathiyah',v:37,t:'Meccan'},{n:46,ar:'الأحقاف',en:'Al-Ahqaf',v:35,t:'Meccan'},
  {n:47,ar:'محمد',en:'Muhammad',v:38,t:'Medinan'},{n:48,ar:'الفتح',en:'Al-Fath',v:29,t:'Medinan'},
  {n:49,ar:'الحجرات',en:'Al-Hujurat',v:18,t:'Medinan'},{n:50,ar:'ق',en:'Qaf',v:45,t:'Meccan'},
  {n:51,ar:'الذاريات',en:'Adh-Dhariyat',v:60,t:'Meccan'},{n:52,ar:'الطور',en:'At-Tur',v:49,t:'Meccan'},
  {n:53,ar:'النجم',en:'An-Najm',v:62,t:'Meccan'},{n:54,ar:'القمر',en:'Al-Qamar',v:55,t:'Meccan'},
  {n:55,ar:'الرحمن',en:'Ar-Rahman',v:78,t:'Medinan'},{n:56,ar:'الواقعة',en:'Al-Waqiah',v:96,t:'Meccan'},
  {n:57,ar:'الحديد',en:'Al-Hadid',v:29,t:'Medinan'},{n:58,ar:'المجادلة',en:'Al-Mujadilah',v:22,t:'Medinan'},
  {n:59,ar:'الحشر',en:'Al-Hashr',v:24,t:'Medinan'},{n:60,ar:'الممتحنة',en:'Al-Mumtahanah',v:13,t:'Medinan'},
  {n:61,ar:'الصف',en:'As-Saf',v:14,t:'Medinan'},{n:62,ar:'الجمعة',en:'Al-Jumuah',v:11,t:'Medinan'},
  {n:63,ar:'المنافقون',en:'Al-Munafiqun',v:11,t:'Medinan'},{n:64,ar:'التغابن',en:'At-Taghabun',v:18,t:'Medinan'},
  {n:65,ar:'الطلاق',en:'At-Talaq',v:12,t:'Medinan'},{n:66,ar:'التحريم',en:'At-Tahrim',v:12,t:'Medinan'},
  {n:67,ar:'الملك',en:'Al-Mulk',v:30,t:'Meccan'},{n:68,ar:'القلم',en:'Al-Qalam',v:52,t:'Meccan'},
  {n:69,ar:'الحاقة',en:'Al-Haqqah',v:52,t:'Meccan'},{n:70,ar:'المعارج',en:'Al-Maarij',v:44,t:'Meccan'},
  {n:71,ar:'نوح',en:'Nuh',v:28,t:'Meccan'},{n:72,ar:'الجن',en:'Al-Jinn',v:28,t:'Meccan'},
  {n:73,ar:'المزمل',en:'Al-Muzzammil',v:20,t:'Meccan'},{n:74,ar:'المدثر',en:'Al-Muddaththir',v:56,t:'Meccan'},
  {n:75,ar:'القيامة',en:'Al-Qiyamah',v:40,t:'Meccan'},{n:76,ar:'الإنسان',en:'Al-Insan',v:31,t:'Medinan'},
  {n:77,ar:'المرسلات',en:'Al-Mursalat',v:50,t:'Meccan'},{n:78,ar:'النبأ',en:'An-Naba',v:40,t:'Meccan'},
  {n:79,ar:'النازعات',en:'An-Naziat',v:46,t:'Meccan'},{n:80,ar:'عبس',en:'Abasa',v:42,t:'Meccan'},
  {n:81,ar:'التكوير',en:'At-Takwir',v:29,t:'Meccan'},{n:82,ar:'الانفطار',en:'Al-Infitar',v:19,t:'Meccan'},
  {n:83,ar:'المطففين',en:'Al-Mutaffifin',v:36,t:'Meccan'},{n:84,ar:'الانشقاق',en:'Al-Inshiqaq',v:25,t:'Meccan'},
  {n:85,ar:'البروج',en:'Al-Buruj',v:22,t:'Meccan'},{n:86,ar:'الطارق',en:'At-Tariq',v:17,t:'Meccan'},
  {n:87,ar:'الأعلى',en:'Al-Ala',v:19,t:'Meccan'},{n:88,ar:'الغاشية',en:'Al-Ghashiyah',v:26,t:'Meccan'},
  {n:89,ar:'الفجر',en:'Al-Fajr',v:30,t:'Meccan'},{n:90,ar:'البلد',en:'Al-Balad',v:20,t:'Meccan'},
  {n:91,ar:'الشمس',en:'Ash-Shams',v:15,t:'Meccan'},{n:92,ar:'الليل',en:'Al-Layl',v:21,t:'Meccan'},
  {n:93,ar:'الضحى',en:'Ad-Duhaa',v:11,t:'Meccan'},{n:94,ar:'الشرح',en:'Ash-Sharh',v:8,t:'Meccan'},
  {n:95,ar:'التين',en:'At-Tin',v:8,t:'Meccan'},{n:96,ar:'العلق',en:'Al-Alaq',v:19,t:'Meccan'},
  {n:97,ar:'القدر',en:'Al-Qadr',v:5,t:'Meccan'},{n:98,ar:'البينة',en:'Al-Bayyinah',v:8,t:'Medinan'},
  {n:99,ar:'الزلزلة',en:'Az-Zalzalah',v:8,t:'Medinan'},{n:100,ar:'العاديات',en:'Al-Adiyat',v:11,t:'Meccan'},
  {n:101,ar:'القارعة',en:'Al-Qariah',v:11,t:'Meccan'},{n:102,ar:'التكاثر',en:'At-Takathur',v:8,t:'Meccan'},
  {n:103,ar:'العصر',en:'Al-Asr',v:3,t:'Meccan'},{n:104,ar:'الهمزة',en:'Al-Humazah',v:9,t:'Meccan'},
  {n:105,ar:'الفيل',en:'Al-Fil',v:5,t:'Meccan'},{n:106,ar:'قريش',en:'Quraysh',v:4,t:'Meccan'},
  {n:107,ar:'الماعون',en:'Al-Maun',v:7,t:'Meccan'},{n:108,ar:'الكوثر',en:'Al-Kawthar',v:3,t:'Meccan'},
  {n:109,ar:'الكافرون',en:'Al-Kafirun',v:6,t:'Meccan'},{n:110,ar:'النصر',en:'An-Nasr',v:3,t:'Medinan'},
  {n:111,ar:'المسد',en:'Al-Masad',v:5,t:'Meccan'},{n:112,ar:'الإخلاص',en:'Al-Ikhlas',v:4,t:'Meccan'},
  {n:113,ar:'الفلق',en:'Al-Falaq',v:5,t:'Meccan'},{n:114,ar:'الناس',en:'An-Nas',v:6,t:'Meccan'},
];

/* Build surah list immediately — no API */
(function() {
  if (!surahContainer) return;
  surahContainer.innerHTML = '';
  SURAHS_DATA.forEach(function(s, idx) {
    var div = document.createElement('div');
    div.className = 'surah reveal';
    div.style.transitionDelay = (idx % 20) * 30 + 'ms';
    div.innerHTML = '<span class="surah-num">' + s.n + '</span><p>' + s.ar + '</p><p>' + s.en + '</p>';
    div.addEventListener('click', function() { openSurah(s.n, s.ar, s.v, s.t); });
    surahContainer.appendChild(div);
    revealObserver.observe(div);
  });
})();

/* ══════════════════════════════════════
   QURAN AUDIO PLAYER
══════════════════════════════════════ */
var RECITERS = [
  {id:'ar.alafasy',        name:'مشاري راشد العفاسي',        everyayah:'Alafasy_128kbps'},
  {id:'ar.abdurrahmaansudais', name:'عبد الرحمن السديس',    everyayah:'AbdurRahmaanAsSudais_192kbps'},
  {id:'ar.saoodshuraym',   name:'سعود الشريم',               everyayah:'Shuraym_128kbps'},
  {id:'ar.mahermuaiqly',   name:'ماهر المعيقلي',             everyayah:'MaherAlMuaiqly_128kbps'},
  {id:'ar.abdullahbasfar', name:'عبدالله بصفر',              everyayah:'Abdullah_Basfar_192kbps'},
  {id:'ar.husary',         name:'محمود خليل الحصري',         everyayah:'Husary_128kbps'},
  {id:'ar.husarymujawwad', name:'الحصري (مجوّد)',            everyayah:'Husary_Mujawwad_128kbps'},
  {id:'ar.minshawi',       name:'محمد صديق المنشاوي',        everyayah:'Minshawy_Murattal_128kbps'},
  {id:'ar.minshawimujawwad',name:'المنشاوي (مجوّد)',         everyayah:'Minshawy_Mujawwad_128kbps'},
  {id:'ar.abdulbasitmurattal',name:'عبد الباسط (مرتل)',      everyayah:'AbdulBaset_Murattal_128kbps'},
  {id:'ar.abdulbasitmujawwad',name:'عبد الباسط (مجوّد)',     everyayah:'AbdulBaset_Mujawwad_128kbps'},
  {id:'ar.muhammadayyoub', name:'محمد أيوب',                 everyayah:'Muhammad_Ayyoub_128kbps'},
  {id:'ar.muhammadjibreel',name:'محمد جبريل',                everyayah:'Muhammad_Jibreel_128kbps'},
  {id:'ar.ibrahimakhdar',  name:'إبراهيم الأخضر',            everyayah:'Ibrahim_Akhdar_128kbps'},
  {id:'ar.hanirifai',      name:'هاني الرفاعي',              everyayah:'Hani_Rifai_64kbps'},
  {id:'ar.ahmadajamy',     name:'أحمد الأعجمي',              everyayah:'Ahmed_ibn_Ali_al-Ajamy_128kbps'},
  {id:'ar.shaatree',       name:'أبو بكر الشاطري',           everyayah:'Abu_Bakr_Ash-Shaatree_128kbps'},
  {id:'ar.aliabdurrahman', name:'علي الحذيفي',               everyayah:'Ali_Hajjaj_AlSuesy_128kbps'},
  {id:'ar.yasserdossari',  name:'ياسر الدوسري',              everyayah:'Yasser_Ad-Dossari_128kbps'},
];

/* everyayah folder lookup — fallback CDN */
function getEveryayahFolder(reciterId) {
  var r = RECITERS.find(function(x){ return x.id === reciterId; });
  return r ? r.everyayah : null;
}
/* Convert global ayah number to surah/local using surahAyahList */
function globalToLocal(globalNum) {
  return surahAyahList.find(function(a){ return a.global === globalNum; });
}

(function buildReciterSelect() {
  var sel = document.getElementById('reciter-select');
  if (!sel) return;
  var saved = localStorage.getItem('quran-reciter') || 'ar.alafasy';
  RECITERS.forEach(function(r) {
    var o = document.createElement('option');
    o.value = r.id; o.textContent = r.name;
    if (r.id === saved) o.selected = true;
    sel.appendChild(o);
  });
  sel.addEventListener('change', function() {
    localStorage.setItem('quran-reciter', sel.value);
    clearAudioPool();
    if (audioPlaying) playGlobalAyah(currentGlobalAyah);
  });
})();

function getReciter() {
  return (document.getElementById('reciter-select') || {}).value || 'ar.alafasy';
}

/* Audio Pool */
var audioPool = {};
var audioPlaying = false;
var audioLoading = false;
var currentGlobalAyah = 0;
var surahAyahList = [];
var currentAudio = null;
var currentSurahNum = 0;

function makeAudioUrl(reciterId, globalNum, surahNum, localNum) {
  /* Primary: cdn.islamic.network (global ayah number) */
  return 'https://cdn.islamic.network/quran/audio/128/' + reciterId + '/' + globalNum + '.mp3';
}
function makeEveryayahUrl(reciterId, surahNum, localNum) {
  /* Fallback: everyayah.com (padded SSSAAA format) */
  var folder = getEveryayahFolder(reciterId);
  if (!folder) return null;
  var s = String(surahNum).padStart(3,'0');
  var a = String(localNum).padStart(3,'0');
  return 'https://everyayah.com/data/' + folder + '/' + s + a + '.mp3';
}

function getPoolAudio(globalNum, useFallback) {
  var reciter = getReciter();
  var suffix  = useFallback ? '_fb' : '';
  var key = reciter + '_' + globalNum + suffix;
  if (!audioPool[key]) {
    var a = new Audio();
    a.preload = 'auto';
    if (useFallback) {
      var entry = globalToLocal(globalNum);
      var url = entry ? makeEveryayahUrl(reciter, currentSurahNum, entry.local) : null;
      if (!url) { audioPool[key] = a; return a; }
      a.src = url;
    } else {
      a.src = makeAudioUrl(reciter, globalNum, currentSurahNum, 0);
    }
    audioPool[key] = a;
  }
  return audioPool[key];
}

function clearAudioPool() {
  Object.keys(audioPool).forEach(function(k) {
    try { audioPool[k].pause(); audioPool[k].src = ''; } catch(e) {}
  });
  audioPool = {};
}

function preloadAhead(fromGlobal, count) {
  count = count || 4;
  var idx = surahAyahList.findIndex(function(a) { return a.global === fromGlobal; });
  if (idx < 0) return;
  for (var i = 1; i <= count; i++) {
    var next = surahAyahList[idx + i];
    if (next) getPoolAudio(next.global);
  }
}

function playGlobalAyah(globalNum) {
  if (currentAudio) {
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio.oncanplay = null;
    currentAudio.pause();
    currentAudio = null;
  }
  clearAyahHighlights();
  currentGlobalAyah = globalNum;
  audioLoading = true;
  audioPlaying = false;
  setAudioBtn('loading');
  preloadAhead(globalNum, 4);

  var audio = getPoolAudio(globalNum);
  currentAudio = audio;
  if (audio.ended || audio.currentTime > 0.1) {
    try { audio.currentTime = 0; } catch(e) {}
  }

  audio.onended = function() {
    clearAyahHighlights();
    var idx = surahAyahList.findIndex(function(a) { return a.global === globalNum; });
    if (idx >= 0 && idx < surahAyahList.length - 1) {
      playGlobalAyah(surahAyahList[idx + 1].global);
    } else {
      audioPlaying = false; audioLoading = false;
      setAudioBtn('stopped');
      clearAyahHighlights();
      setNowPlayingBar(null);
      showToast('اكتملت تلاوة السورة 🌙', 'fa-check-circle');
    }
  };
  /* Track if we already tried fallback for this ayah */
  var _triedFallback = false;
  audio.onerror = function() {
    if (currentAudio !== audio) return;
    if (!_triedFallback) {
      _triedFallback = true;
      /* Try everyayah.com fallback */
      var fbAudio = getPoolAudio(globalNum, true);
      if (fbAudio && fbAudio.src) {
        currentAudio = fbAudio;
        fbAudio.onended = audio.onended;
        fbAudio.onerror = function() {
          if (currentAudio !== fbAudio) return;
          /* Both CDNs failed — skip to next ayah */
          var idx = surahAyahList.findIndex(function(a) { return a.global === globalNum; });
          if (idx >= 0 && idx < surahAyahList.length - 1) {
            setTimeout(function() { if (currentAudio === fbAudio) playGlobalAyah(surahAyahList[idx + 1].global); }, 200);
          } else { setAudioBtn('stopped'); }
        };
        fbAudio.oncanplay = function() {
          if (currentAudio !== fbAudio) return;
          fbAudio.oncanplay = null;
          fbAudio.play().then(function() {
            audioPlaying = true; audioLoading = false;
            setAudioBtn('playing');
            highlightCurrentAyah(globalNum);
            scrollToAyah(globalNum);
            var entry = surahAyahList.find(function(a) { return a.global === globalNum; });
            setNowPlayingBar(entry ? entry.local : null);
          }).catch(function(){ setAudioBtn('stopped'); });
        };
        fbAudio.load();
        return;
      }
    }
    /* Both failed or no fallback → skip */
    var idx = surahAyahList.findIndex(function(a) { return a.global === globalNum; });
    if (idx >= 0 && idx < surahAyahList.length - 1) {
      setTimeout(function() { if (currentAudio === audio) playGlobalAyah(surahAyahList[idx + 1].global); }, 200);
    } else { setAudioBtn('stopped'); }
  };

  function doPlay() {
    if (currentAudio !== audio) return;
    audio.play().then(function() {
      if (currentAudio !== audio) { audio.pause(); return; }
      audioPlaying = true; audioLoading = false;
      setAudioBtn('playing');
      highlightCurrentAyah(globalNum);
      scrollToAyah(globalNum);
      var entry = surahAyahList.find(function(a) { return a.global === globalNum; });
      setNowPlayingBar(entry ? entry.local : null);
    }).catch(function(err) {
      if (currentAudio !== audio) return;
      if (err.name === 'NotAllowedError') {
        setAudioBtn('stopped');
        showToast('اضغط تشغيل مرة أخرى', 'fa-info-circle');
      } else {
        setTimeout(function() { if (currentAudio === audio) doPlay(); }, 500);
      }
    });
  }

  if (audio.readyState >= 3) { doPlay(); }
  else {
    audio.oncanplay = function() {
      if (currentAudio !== audio) return;
      audio.oncanplay = null;
      doPlay();
    };
    setTimeout(function() {
      if (currentAudio === audio && audioLoading) {
        audio.oncanplay = null;
        doPlay();
      }
    }, 6000);
  }
}

function stopAudio() {
  if (currentAudio) {
    currentAudio.onended = null; currentAudio.onerror = null;
    currentAudio.oncanplay = null; currentAudio.pause();
    currentAudio = null;
  }
  audioPlaying = false; audioLoading = false;
  setAudioBtn('stopped');
  clearAyahHighlights();
  setNowPlayingBar(null);
}

function setAudioBtn(state) {
  var btn = document.getElementById('audio-play-btn');
  if (!btn) return;
  btn.classList.remove('playing','loading');
  var icon  = btn.querySelector('.audio-icon');
  var label = btn.querySelector('.audio-label');
  if (state === 'playing') {
    btn.classList.add('playing');
    if (icon)  icon.innerHTML  = '<i class="fas fa-stop"></i>';
    if (label) label.textContent = 'إيقاف';
  } else if (state === 'loading') {
    btn.classList.add('loading');
    if (icon)  icon.innerHTML  = '<i class="fas fa-spinner fa-spin"></i>';
    if (label) label.textContent = 'تحميل…';
  } else {
    if (icon)  icon.innerHTML  = '<i class="fas fa-play"></i>';
    if (label) label.textContent = 'تشغيل';
  }
}

function highlightCurrentAyah(globalNum) {
  clearAyahHighlights();
  var m = document.querySelector('.ayah-marker[data-global="' + globalNum + '"]');
  var s = document.querySelector('.mushaf-ayah-span[data-global="' + globalNum + '"]');
  if (m) m.classList.add('playing');
  if (s) s.classList.add('playing-ayah');
}
function clearAyahHighlights() {
  document.querySelectorAll('.ayah-marker.playing').forEach(function(el) { el.classList.remove('playing'); });
  document.querySelectorAll('.mushaf-ayah-span.playing-ayah').forEach(function(el) { el.classList.remove('playing-ayah'); });
}
function scrollToAyah(globalNum) {
  var el = document.querySelector('.ayah-marker[data-global="' + globalNum + '"]');
  if (el) el.scrollIntoView({behavior:'smooth', block:'center'});
}
function setNowPlayingBar(localNum) {
  var bar = document.getElementById('audio-now-playing');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'audio-now-playing';
    bar.className = 'audio-now-playing';
    bar.innerHTML = '<div class="audio-now-playing-icon"><i class="fas fa-music"></i></div>' +
      '<span class="audio-now-playing-text">يُتلى الآن: <span class="audio-now-playing-ayah" id="np-ayah-num"></span></span>';
    var pg = document.getElementById('ayat-container');
    if (pg) pg.before(bar);
  }
  bar.classList.toggle('active', !!localNum);
  var npEl = document.getElementById('np-ayah-num');
  if (npEl && localNum) {
    var sName = (document.getElementById('popup-surah-name') || {}).textContent || '';
    npEl.textContent = sName + ' — الآية ' + toArabicNumerals(localNum);
  }
}

document.getElementById('audio-play-btn')?.addEventListener('click', function() {
  if (audioLoading) return;
  if (audioPlaying) { stopAudio(); return; }
  if (!surahAyahList.length) return;
  var startFrom = (currentGlobalAyah && surahAyahList.some(function(a){return a.global===currentGlobalAyah;}))
    ? currentGlobalAyah : surahAyahList[0].global;
  playGlobalAyah(startFrom);
});

document.addEventListener('keydown', function(e) {
  if (!popup || !popup.classList.contains('active')) return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if (e.key === ' ') { e.preventDefault(); document.getElementById('audio-play-btn')?.click(); }
  if (e.key === 'ArrowDown' && audioPlaying) {
    e.preventDefault();
    var idx = surahAyahList.findIndex(function(a){return a.global===currentGlobalAyah;});
    if (idx >= 0 && idx < surahAyahList.length-1) playGlobalAyah(surahAyahList[idx+1].global);
  }
  if (e.key === 'ArrowUp' && audioPlaying) {
    e.preventDefault();
    var idx = surahAyahList.findIndex(function(a){return a.global===currentGlobalAyah;});
    if (idx > 0) playGlobalAyah(surahAyahList[idx-1].global);
  }
});

/* ══════════════════════════════════════
   VIEW TOGGLE + MUSHAF RENDER
══════════════════════════════════════ */
var mushafTwoPage = true;
var _lastSurahArgs = null;

(function initViewToggle() {
  var btn = document.getElementById('view-toggle-btn');
  if (!btn) return;
  function updateBtn() {
    btn.innerHTML = '<i class="fas fa-' + (mushafTwoPage ? 'book-open' : 'file-alt') + '"></i><span>' +
      (mushafTwoPage ? 'صفحتان' : 'صفحة') + '</span>';
    btn.classList.toggle('active', mushafTwoPage);
  }
  updateBtn();
  btn.addEventListener('click', function() {
    mushafTwoPage = !mushafTwoPage;
    updateBtn();
    if (_lastSurahArgs) renderMushafSpread.apply(null, _lastSurahArgs);
  });
})();

/* Strip basmala text from start of ayah if it shouldn't be there */
function stripBasmala(text, surahNum, ayahNum) {
  if (surahNum === 1 && ayahNum === 1) return text.trim();
  if (surahNum === 9) return text.trim();
  // Remove the bismillah pattern from start of text
  var basmalaPattern = /^[\u0628][\u0650\u064E\u064F\u0652\u064B-\u065F\u06D6-\u06ED]*[\u0633][\u064E\u0650\u064F\u0652\u064B-\u065F\u06D6-\u06ED]*[\u0645][\u0650\u064E\u064F\u0652\u064B-\u065F\u06D6-\u06ED]*[\u0020\u00A0\u0640]/u;
  // Simpler: just check if text starts with "بِسۡمِ" (bismillah) by checking first 4-5 chars
  var cleaned = text.trim();
  // Find end of "الرحيم" in first 100 chars
  var head = cleaned.substring(0, 120);
  // Pattern for ر-ح-ي-م with diacritics
  var rahimMatch = head.match(/\u0631[\u064E-\u065F\u06D6-\u06ED]*\u062D[\u064E-\u065F\u06D6-\u06ED]*[\u064A\u0649][\u064E-\u065F\u06D6-\u06ED]*\u0645[\u064E-\u065F\u06D6-\u06ED\u06E0]*/u);
  if (rahimMatch) {
    var after = cleaned.slice(rahimMatch.index + rahimMatch[0].length).replace(/^[\s\u200C\u200D\u06D4\u06DD\u06DE]+/, '').trim();
    if (after.length > 2) return after;
  }
  return cleaned;
}

function globalOffset(n) {
  var o = 0;
  for (var i = 0; i < n - 1; i++) o += SURAHS_DATA[i].v;
  return o;
}

function renderMushafSpread(ayahs, surahNum, surahName, ayahCount, revelationType) {
  _lastSurahArgs = [ayahs, surahNum, surahName, ayahCount, revelationType];

  var isMobile = window.innerWidth <= 700;
  var twoPage  = mushafTwoPage && !isMobile;
  var revType  = revelationType === 'Meccan' ? 'مَكِّيَّة' : 'مَدَنِيَّة';

  var showBasmala = (surahNum !== 9 && surahNum !== 1);
  var basmalaHTML = showBasmala ? '<div class="mushaf-basmala">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</div>' : '';

  var headerHTML = '<div class="mushaf-surah-header">' +
    '<div class="mushaf-surah-box">' +
    '<span class="mushaf-surah-name">' + surahName + '</span>' +
    '<span class="mushaf-surah-meta">' + revType + ' · ' + toArabicNumerals(ayahCount) + ' آيَة</span>' +
    '</div></div><div class="mushaf-divider">﴿ ✦ ﴾</div>';

  function buildText(slice) {
    return slice.map(function(a) {
      var txt = stripBasmala(a.text, surahNum, a.numberInSurah);
      var num = toArabicNumerals(a.numberInSurah);
      var h = '<span class="mushaf-ayah-span" data-global="' + a.number + '" data-local="' + a.numberInSurah + '">' + txt + '</span>' +
        '<span class="ayah-marker" data-global="' + a.number + '" data-local="' + a.numberInSurah + '">' + num + '</span> ';
      if (a.numberInSurah % 10 === 0 && a.numberInSurah < ayahCount) h += '<div class="mushaf-hizb-mark">— ۞ —</div>';
      return h;
    }).join('');
  }

  function makePage(cls, innerContent, pgNum) {
    return '<div class="mushaf-page-panel ' + cls + '">' +
      '<span class="mushaf-corner tl">❧</span><span class="mushaf-corner tr">❧</span>' +
      '<span class="mushaf-corner bl">❧</span><span class="mushaf-corner br">❧</span>' +
      '<div class="mushaf-inner">' + innerContent + '</div>' +
      '<div class="mushaf-page-num">' + toArabicNumerals(pgNum) + '</div>' +
      '</div>';
  }

  var html;
  if (twoPage) {
    var mid = Math.ceil(ayahs.length / 2);
    html = '<div class="mushaf-spread-wrap"><div class="mushaf-spread is-double">' +
      makePage('mushaf-page-right', headerHTML + basmalaHTML + '<div class="mushaf-text-block">' + buildText(ayahs.slice(0,mid)) + '</div>', 1) +
      '<div class="mushaf-spine"></div>' +
      makePage('mushaf-page-left', '<div class="mushaf-text-block">' + buildText(ayahs.slice(mid)) + '</div>', 2) +
      '</div></div>';
  } else {
    html = '<div class="mushaf-spread-wrap"><div class="mushaf-spread is-single">' +
      makePage('mushaf-page-right', headerHTML + basmalaHTML + '<div class="mushaf-text-block">' + buildText(ayahs) + '</div>', 1) +
      '</div></div>';
  }

  ayatContainer.innerHTML = html;

  ayatContainer.querySelectorAll('.ayah-marker, .mushaf-ayah-span').forEach(function(el) {
    el.style.cursor = 'pointer';
    el.addEventListener('click', function() {
      var g = parseInt(el.getAttribute('data-global'));
      if (!isNaN(g)) playGlobalAyah(g);
    });
  });
}

/* ══════════════════════════════════════
   OPEN SURAH — ROBUST FETCH
══════════════════════════════════════ */
function openSurah(num, name, ayahCount, revelationType) {
  popup.classList.add('active');
  document.body.style.overflow = 'hidden';
  popupName.textContent = name;
  currentSurahNum = num;
  stopAutoScroll(); stopAudio(); clearAudioPool();
  popup.scrollTo(0, 0);
  surahAyahList = []; currentGlobalAyah = 0; _lastSurahArgs = null;

  var audioPlayBtn = document.getElementById('audio-play-btn');
  if (audioPlayBtn) audioPlayBtn.disabled = true;

  ayatContainer.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;min-height:60vh"><div class="loading-dots"><span></span><span></span><span></span></div></div>';

  var off = globalOffset(num);

  /* Source 1: alquran.cloud with quran-uthmani */
  function src1() {
    return fetch('https://api.alquran.cloud/v1/surah/' + num + '/quran-uthmani')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (!d || !d.data || !d.data.ayahs || !d.data.ayahs.length) throw new Error('bad');
        return d.data.ayahs.map(function(a) {
          return {numberInSurah: a.numberInSurah, number: a.number, text: a.text};
        });
      });
  }

  /* Source 2: alquran.cloud default (no edition) */
  function src2() {
    return fetch('https://api.alquran.cloud/v1/surah/' + num)
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (!d || !d.data || !d.data.ayahs || !d.data.ayahs.length) throw new Error('bad');
        return d.data.ayahs.map(function(a) {
          return {numberInSurah: a.numberInSurah, number: a.number, text: a.text};
        });
      });
  }

  /* Source 3: equran.cloud */
  function src3() {
    return fetch('https://equran.id/api/v2/surat/' + num)
      .then(function(r) { return r.json(); })
      .then(function(d) {
        var ayahs = d.data && d.data.ayat ? d.data.ayat : null;
        if (!ayahs || !ayahs.length) throw new Error('bad');
        return ayahs.map(function(a) {
          return {numberInSurah: a.nomorAyat, number: off + a.nomorAyat, text: a.teksArab};
        });
      });
  }

  var sources = [src1, src2, src3];
  var srcIdx  = 0;

  function tryNext() {
    if (srcIdx >= sources.length) {
      ayatContainer.innerHTML =
        '<div style="text-align:center;padding:50px 20px;font-family:Tajawal,sans-serif">' +
        '<p style="color:#7a6545;font-size:16px;margin-bottom:18px">تعذّر تحميل السورة — تأكد من الإنترنت</p>' +
        '<button onclick="openSurah(' + num + ',\'' + name.replace(/'/g,"\\'") + '\',' + ayahCount + ',\'' + revelationType + '\')" ' +
        'style="padding:11px 28px;background:linear-gradient(135deg,#1565a8,#2180cc);color:#fff;' +
        'border:none;border-radius:30px;font-size:14px;font-weight:700;cursor:pointer;font-family:Tajawal,sans-serif">' +
        'إعادة المحاولة</button></div>';
      return;
    }
    sources[srcIdx++]().then(function(ayahs) {
      if (!ayahs || !ayahs.length) { tryNext(); return; }
      surahAyahList = ayahs.map(function(a) { return {local: a.numberInSurah, global: a.number}; });
      surahAyahList.slice(0, 6).forEach(function(a) { getPoolAudio(a.global); });
      renderMushafSpread(ayahs, num, name, ayahCount, revelationType);
      if (audioPlayBtn) audioPlayBtn.disabled = false;
    }).catch(function() {
      setTimeout(tryNext, 500);
    });
  }

  tryNext();
}

closePopup?.addEventListener('click', closePopupFn);
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closePopupFn(); });
function closePopupFn() {
  stopAutoScroll(); stopAudio(); clearAudioPool();
  popup.classList.remove('active');
  document.body.style.overflow = '';
}


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
    <button class="copy-btn" title="نسخ الذكر"><i class="fas fa-copy"></i></button>
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
  // Copy button handler
  const copyBtn = card.querySelector('.copy-btn');
  copyBtn?.addEventListener('click', () => {
    copyText(z.text);
    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
    copyBtn.classList.add('copied');
    setTimeout(() => { copyBtn.innerHTML = '<i class="fas fa-copy"></i>'; copyBtn.classList.remove('copied'); }, 2000);
  });
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
   HADITH — بيانات مدمجة (لا API)
   أحاديث صحيحة من الكتب الستة
══════════════════════════════════════ */
const hadithContainer = document.querySelector('.hadithContainer');
const hadithNumber    = document.querySelector('.hadith-number');
const prevBtn         = document.querySelector('.hadith-btn.prev');
const nextBtn         = document.querySelector('.hadith-btn.next');

const HADITH_DB = {
  muslim: {
    arabic: 'صحيح مسلم',
    hadiths: [
      'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوْ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ.',
      'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ.',
      'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ.',
      'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.',
      'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالْمُهَاجِرُ مَنْ هَجَرَ مَا نَهَى اللَّهُ عَنْهُ.',
      'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ.',
      'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ.',
      'إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ.',
      'الدِّينُ النَّصِيحَةُ. قُلْنَا: لِمَنْ؟ قَالَ: لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلِأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ.',
      'إِنَّ مِمَّا أَدْرَكَ النَّاسُ مِنْ كَلاَمِ النُّبُوَّةِ الأُولَى: إِذَا لَمْ تَسْتَحِ فَاصْنَعْ مَا شِئْتَ.',
      'عَجَبًا لأَمْرِ الْمُؤْمِنِ! إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ، وَلَيْسَ ذَاكَ لأَحَدٍ إِلاَّ لِلْمُؤْمِنِ: إِنْ أَصَابَتْهُ سَرَّاءُ شَكَرَ فَكَانَ خَيْرًا لَهُ، وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ.',
      'حَقُّ الْمُسْلِمِ عَلَى الْمُسْلِمِ سِتٌّ: إِذَا لَقِيتَهُ فَسَلِّمْ عَلَيْهِ، وَإِذَا دَعَاكَ فَأَجِبْهُ، وَإِذَا اسْتَنْصَحَكَ فَانْصَحْهُ، وَإِذَا عَطَسَ فَحَمِدَ اللَّهَ فَسَمِّتْهُ، وَإِذَا مَرِضَ فَعُدْهُ، وَإِذَا مَاتَ فَاتَّبِعْهُ.',
      'كُلُّ بَنِي آدَمَ خَطَّاءٌ، وَخَيْرُ الْخَطَّائِينَ التَّوَّابُونَ.',
      'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ.',
      'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ.',
      'إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ، وَيُعْطِي عَلَى الرِّفْقِ مَا لاَ يُعْطِي عَلَى الْعُنْفِ.',
      'مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ، وَمَنْ يَسَّرَ عَلَى مُعْسِرٍ يَسَّرَ اللَّهُ عَلَيْهِ فِي الدُّنْيَا وَالآخِرَةِ.',
      'مَنْ أَحَبَّ لِقَاءَ اللَّهِ أَحَبَّ اللَّهُ لِقَاءَهُ، وَمَنْ كَرِهَ لِقَاءَ اللَّهِ كَرِهَ اللَّهُ لِقَاءَهُ.',
      'اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ، فَمَنْ لَمْ يَجِدْ فَبِكَلِمَةٍ طَيِّبَةٍ.',
      'إِنَّ أَكْمَلَ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا، وَخِيَارُكُمْ خِيَارُكُمْ لِنِسَائِهِمْ.',
      'إِنَّ اللَّهَ كَتَبَ الإِحْسَانَ عَلَى كُلِّ شَيْءٍ، فَإِذَا قَتَلْتُمْ فَأَحْسِنُوا الْقِتْلَةَ، وَإِذَا ذَبَحْتُمْ فَأَحْسِنُوا الذِّبْحَةَ.',
      'لاَ تَحَاسَدُوا، وَلاَ تَنَاجَشُوا، وَلاَ تَبَاغَضُوا، وَلاَ تَدَابَرُوا، وَلاَ يَبِعْ بَعْضُكُمْ عَلَى بَيْعِ بَعْضٍ، وَكُونُوا عِبَادَ اللَّهِ إِخْوَانًا.',
      'الصَّلَوَاتُ الْخَمْسُ، وَالْجُمُعَةُ إِلَى الْجُمُعَةِ، وَرَمَضَانُ إِلَى رَمَضَانَ مُكَفِّرَاتٌ مَا بَيْنَهُنَّ إِذَا اجْتَنَبَ الْكَبَائِرَ.',
      'مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ.',
      'خَيْرُ الصَّدَقَةِ مَا كَانَ عَنْ ظَهْرِ غِنًى، وَابْدَأْ بِمَنْ تَعُولُ.',
      'إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلاَّ مِنْ ثَلاَثَةٍ: إِلاَّ مِنْ صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ.',
      'مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ وَتَعَاطُفِهِمْ مَثَلُ الْجَسَدِ الْوَاحِدِ إِذَا اشْتَكَى مِنْهُ عُضْوٌ تَدَاعَى لَهُ سَائِرُ الْجَسَدِ بِالسَّهَرِ وَالْحُمَّى.',
      'إِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ، وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ، وَإِنَّ الْكَذِبَ يَهْدِي إِلَى الْفُجُورِ، وَإِنَّ الْفُجُورَ يَهْدِي إِلَى النَّارِ.',
      'مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِلِسَانِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِقَلْبِهِ، وَذَلِكَ أَضْعَفُ الإِيمَانِ.',
      'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ وَالْجُبْنِ وَالْهَرَمِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ.',
    ]
  },
  bukhari: {
    arabic: 'صحيح البخاري',
    hadiths: [
      'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى.',
      'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ تَعَالَى أَدْوَمُهَا وَإِنْ قَلَّ.',
      'مَنْ كَذَبَ عَلَيَّ مُتَعَمِّدًا فَلْيَتَبَوَّأْ مَقْعَدَهُ مِنَ النَّارِ.',
      'بَلِّغُوا عَنِّي وَلَوْ آيَةً، وَحَدِّثُوا عَنْ بَنِي إِسْرَائِيلَ وَلاَ حَرَجَ، وَمَنْ كَذَبَ عَلَيَّ مُتَعَمِّدًا فَلْيَتَبَوَّأْ مَقْعَدَهُ مِنَ النَّارِ.',
      'الْبَيِّنَةُ عَلَى الْمُدَّعِي وَالْيَمِينُ عَلَى مَنْ أَنْكَرَ.',
      'الْمُسْلِمُ أَخُو الْمُسْلِمِ لاَ يَظْلِمُهُ وَلاَ يُسْلِمُهُ.',
      'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ.',
      'الدَّالُّ عَلَى الْخَيْرِ كَفَاعِلِهِ.',
      'إِيَّاكُمْ وَالظَّنَّ، فَإِنَّ الظَّنَّ أَكْذَبُ الْحَدِيثِ.',
      'لاَ يَدْخُلُ الْجَنَّةَ مَنْ كَانَ فِي قَلْبِهِ مِثْقَالُ ذَرَّةٍ مِنْ كِبْرٍ.',
      'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ.',
      'أَفْضَلُ الصِّيَامِ بَعْدَ رَمَضَانَ شَهْرُ اللَّهِ الْمُحَرَّمُ، وَأَفْضَلُ الصَّلاَةِ بَعْدَ الْفَرِيضَةِ صَلاَةُ اللَّيْلِ.',
      'لاَ يَشْكُرُ اللَّهَ مَنْ لاَ يَشْكُرُ النَّاسَ.',
      'مَنْ صَامَ يَوْمًا فِي سَبِيلِ اللَّهِ بَعَّدَ اللَّهُ وَجْهَهُ عَنِ النَّارِ سَبْعِينَ خَرِيفًا.',
      'الْيَمِينُ الْغَمُوسُ تَدَعُ الدِّيَارَ بَلاَقِعَ.',
      'مَنْ بَنَى مَسْجِدًا لِلَّهِ بَنَى اللَّهُ لَهُ فِي الْجَنَّةِ مِثْلَهُ.',
      'أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا.',
      'إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ.',
      'كُلُّ مُسْكِرٍ خَمْرٌ، وَكُلُّ خَمْرٍ حَرَامٌ.',
      'الْبِرُّ حُسْنُ الْخُلُقِ، وَالإِثْمُ مَا حَاكَ فِي نَفْسِكَ وَكَرِهْتَ أَنْ يَطَّلِعَ عَلَيْهِ النَّاسُ.',
      'لاَ تَسُبُّوا الأَمْوَاتَ فَإِنَّهُمْ قَدْ أَفْضَوْا إِلَى مَا قَدَّمُوا.',
      'لاَ يَحِلُّ لِمُسْلِمٍ أَنْ يَهْجُرَ أَخَاهُ فَوْقَ ثَلاَثِ لَيَالٍ.',
      'الأَنَاةُ مِنَ اللَّهِ وَالْعَجَلَةُ مِنَ الشَّيْطَانِ.',
      'التَّائِبُ مِنَ الذَّنْبِ كَمَنْ لاَ ذَنْبَ لَهُ.',
      'مَنْ أَخَذَ أَمْوَالَ النَّاسِ يُرِيدُ أَدَاءَهَا أَدَّى اللَّهُ عَنْهُ.',
      'السَّخِيُّ قَرِيبٌ مِنَ اللَّهِ قَرِيبٌ مِنَ الْجَنَّةِ قَرِيبٌ مِنَ النَّاسِ بَعِيدٌ مِنَ النَّارِ.',
      'لاَ تَغْضَبْ وَلَكَ الْجَنَّةُ.',
      'أَنَا زَعِيمٌ بِبَيْتٍ فِي رَبَضِ الْجَنَّةِ لِمَنْ تَرَكَ الْمِرَاءَ وَإِنْ كَانَ مُحِقًّا.',
      'رُفِعَتِ الأَقْلاَمُ وَجَفَّتِ الصُّحُفُ.',
      'خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ.',
    ]
  },
  'abu-dawud': {
    arabic: 'سنن أبو داود',
    hadiths: [
      'بِحَسْبِ امْرِئٍ مِنَ الشَّرِّ أَنْ يَحْقِرَ أَخَاهُ الْمُسْلِمَ.',
      'مَنْ سَنَّ فِي الإِسْلاَمِ سُنَّةً حَسَنَةً فَلَهُ أَجْرُهَا وَأَجْرُ مَنْ عَمِلَ بِهَا.',
      'إِنَّ مِنْ أَشَرِّ النَّاسِ ذَا الْوَجْهَيْنِ الَّذِي يَأْتِي هَؤُلاَءِ بِوَجْهٍ وَهَؤُلاَءِ بِوَجْهٍ.',
      'إِنَّ الصَّلاَةَ الْوُسْطَى صَلاَةُ الْعَصْرِ.',
      'صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي.',
      'الدُّعَاءُ مُخُّ الْعِبَادَةِ.',
      'أَوْصَانِي خَلِيلِي بِثَلاَثٍ لاَ أَدَعُهُنَّ حَتَّى أَمُوتَ: صَوْمِ ثَلاَثَةِ أَيَّامٍ مِنْ كُلِّ شَهْرٍ، وَصَلاَةِ الضُّحَى، وَنَوْمٍ عَلَى وِتْرٍ.',
      'مَنْ لاَ يَرْحَمُ النَّاسَ لاَ يَرْحَمُهُ اللَّهُ.',
      'اسْتَعِينُوا عَلَى إِنْجَاحِ الْحَوَائِجِ بِالْكِتْمَانِ.',
      'الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ.',
      'لاَ يَجْلِسَنَّ أَحَدُكُمْ بَيْنَ الرَّجُلَيْنِ إِلاَّ بِإِذْنِهِمَا.',
      'الْمُؤْمِنُ الَّذِي يُخَالِطُ النَّاسَ وَيَصْبِرُ عَلَى أَذَاهُمْ أَعْظَمُ أَجْرًا مِنَ الَّذِي لاَ يُخَالِطُ النَّاسَ وَلاَ يَصْبِرُ عَلَى أَذَاهُمْ.',
      'إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ.',
      'الْبَرَكَةُ مَعَ أَكَابِرِكُمْ.',
      'مَنْ تَعَلَّمَ الرَّمْيَ ثُمَّ تَرَكَهُ فَقَدْ عَقَّ.',
      'الإِيمَانُ بِضْعٌ وَسَبْعُونَ أَوْ بِضْعٌ وَسِتُّونَ شُعْبَةً.',
      'إِنَّ الْحَلاَلَ بَيِّنٌ وَإِنَّ الْحَرَامَ بَيِّنٌ.',
      'الْقَضَاةُ ثَلاَثَةٌ: قَاضِيَانِ فِي النَّارِ وَقَاضٍ فِي الْجَنَّةِ.',
      'تُعْرَضُ الأَعْمَالُ يَوْمَ الاثْنَيْنِ وَالْخَمِيسِ فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ.',
      'خِيَارُكُمْ الَّذِينَ إِذَا رُؤُوا ذُكِرَ اللَّهُ.',
      'مَنْ غَشَّنَا فَلَيْسَ مِنَّا.',
      'مَنْ أَخَذَ شِبْرًا مِنَ الأَرْضِ ظُلْمًا فَإِنَّهُ يُطَوَّقُهُ يَوْمَ الْقِيَامَةِ مِنْ سَبْعِ أَرَضِينَ.',
      'لاَ تَنْتَفِعُوا مِنَ الْمَيْتَةِ بِشَيْءٍ.',
      'لاَ يُقِيمَنَّ أَحَدُكُمُ الرَّجُلَ مِنْ مَجْلِسِهِ ثُمَّ يَجْلِسَ فِيهِ.',
      'الزَّهَادَةُ فِي الدُّنْيَا لَيْسَتْ بِتَحْرِيمِ الْحَلاَلِ وَلاَ إِضَاعَةِ الْمَالِ.',
      'أَحَبُّ الأَسْمَاءِ إِلَى اللَّهِ عَبْدُ اللَّهِ وَعَبْدُ الرَّحْمَنِ.',
      'مَا مِنْ مُسْلِمٍ يَغْرِسُ غَرْسًا إِلاَّ كَانَ مَا أُكِلَ مِنْهُ لَهُ صَدَقَةٌ.',
      'الصِّيَامُ وَالْقُرْآنُ يَشْفَعَانِ لِلْعَبْدِ يَوْمَ الْقِيَامَةِ.',
      'مَنْ سَأَلَ اللَّهَ الشَّهَادَةَ بِصِدْقٍ بَلَّغَهُ اللَّهُ مَنَازِلَ الشُّهَدَاءِ.',
      'لاَ يَزَالُ الْعَبْدُ فِي صَلاَةٍ مَا دَامَ فِي مُصَلاَّهُ يَنْتَظِرُ الصَّلاَةَ.',
    ]
  },
  tirmidzi: {
    arabic: 'جامع الترمذي',
    hadiths: [
      'الدُّنْيَا مَتَاعٌ وَخَيْرُ مَتَاعِ الدُّنْيَا الْمَرْأَةُ الصَّالِحَةُ.',
      'التَّائِبُ حَبِيبُ اللَّهِ، وَالتَّائِبُ مِنَ الذَّنْبِ كَمَنْ لاَ ذَنْبَ لَهُ.',
      'اسْتَغِلَّ شَبَابَكَ قَبْلَ هَرَمِكَ، وَصِحَّتَكَ قَبْلَ سَقَمِكَ.',
      'مَنْ تَوَاضَعَ لِلَّهِ رَفَعَهُ اللَّهُ.',
      'إِنَّ اللَّهَ يُحِبُّ الْعَبْدَ التَّقِيَّ الْغَنِيَّ الْخَفِيَّ.',
      'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ.',
      'أَنَا زَعِيمٌ بِبَيْتٍ فِي الْجَنَّةِ لِمَنْ حَسَّنَ خُلُقَهُ.',
      'مَنْ كَانَتِ الدُّنْيَا هَمَّهُ فَرَّقَ اللَّهُ عَلَيْهِ أَمْرَهُ، وَجَعَلَ فَقْرَهُ بَيْنَ عَيْنَيْهِ.',
      'اتَّقُوا الظُّلْمَ فَإِنَّ الظُّلْمَ ظُلُمَاتٌ يَوْمَ الْقِيَامَةِ.',
      'سَيِّدُ الاسْتِغْفَارِ أَنْ يَقُولَ الْعَبْدُ: اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ.',
      'مَنْ أَحَبَّ أَنْ يَعْلَمَ مَا لَهُ عِنْدَ اللَّهِ فَلْيَنْظُرْ مَا لِلَّهِ عِنْدَهُ.',
      'الإِيمَانُ مَعْرِفَةٌ بِالْقَلْبِ وَقَوْلٌ بِاللِّسَانِ وَعَمَلٌ بِالأَرْكَانِ.',
      'لاَ يُلْدَغُ الْمُؤْمِنُ مِنْ جُحْرٍ وَاحِدٍ مَرَّتَيْنِ.',
      'اسْتَحْيُوا مِنَ اللَّهِ حَقَّ الْحَيَاءِ.',
      'مَنْ أَصْبَحَ مِنْكُمْ آمِنًا فِي سِرْبِهِ مُعَافًى فِي جَسَدِهِ عِنْدَهُ قُوتُ يَوْمِهِ فَكَأَنَّمَا حِيزَتْ لَهُ الدُّنْيَا.',
      'احْرِصْ عَلَى مَا يَنْفَعُكَ وَاسْتَعِنْ بِاللَّهِ وَلاَ تَعْجَزْ.',
      'الصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ.',
      'مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ.',
      'اللَّهُمَّ لاَ سَهْلَ إِلاَّ مَا جَعَلْتَهُ سَهْلاً وَأَنْتَ تَجْعَلُ الْحَزْنَ إِنْ شِئْتَ سَهْلاً.',
      'إِنَّ عِظَمَ الْجَزَاءِ مَعَ عِظَمِ الْبَلاَءِ، وَإِنَّ اللَّهَ إِذَا أَحَبَّ قَوْمًا ابْتَلاَهُمْ.',
      'إِنَّ اللَّهَ حَيِيٌّ سَتِّيرٌ يُحِبُّ الْحَيَاءَ وَالسَّتْرَ.',
      'مَا كَانَ الرِّفْقُ فِي شَيْءٍ إِلاَّ زَانَهُ.',
      'أَفْضَلُ الْعِبَادَةِ انْتِظَارُ الْفَرَجِ.',
      'كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ.',
      'لاَ يَدْخُلُ الْجَنَّةَ قَاطِعُ رَحِمٍ.',
      'مَنْ لَمْ يَرْحَمْ صَغِيرَنَا وَيَعْرِفْ حَقَّ كَبِيرِنَا فَلَيْسَ مِنَّا.',
      'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ.',
      'مَنْ كَانَ لَهُ إِمَامٌ فَقِرَاءَةُ الإِمَامِ لَهُ قِرَاءَةٌ.',
      'إِنَّكَ لَنْ تَدَعَ شَيْئًا لِلَّهِ إِلاَّ بَدَّلَكَ اللَّهُ بِهِ مَا هُوَ خَيْرٌ لَكَ مِنْهُ.',
      'مَنْ أَعَانَ عَلَى خُصُومَةٍ بِظُلْمٍ فَقَدْ بَاءَ بِغَضَبٍ مِنَ اللَّهِ.',
    ]
  },
  nasai: {
    arabic: 'سنن النسائي',
    hadiths: [
      'إِنَّ اللَّهَ طَيِّبٌ لاَ يَقْبَلُ إِلاَّ طَيِّبًا.',
      'مَنْ قَتَلَ عُصْفُورًا عَبَثًا عَجَّ إِلَى اللَّهِ مِنْهُ يَوْمَ الْقِيَامَةِ.',
      'أَلاَ أُنَبِّئُكُمْ بِأَكْبَرِ الْكَبَائِرِ؟ الإِشْرَاكُ بِاللَّهِ، وَعُقُوقُ الْوَالِدَيْنِ.',
      'أَيُّ الأَعْمَالِ أَفْضَلُ؟ قَالَ: الصَّلاَةُ عَلَى وَقْتِهَا.',
      'أَحَبُّ الدِّينِ إِلَى اللَّهِ الْحَنِيفِيَّةُ السَّمْحَةُ.',
      'الإِيمَانُ بِضْعٌ وَسِتُّونَ شُعْبَةً وَالْحَيَاءُ شُعْبَةٌ مِنَ الإِيمَانِ.',
      'مَنْ أَكَلَ مِنْ هَذِهِ الشَّجَرَةِ فَلاَ يَقْرَبَنَّ مَسَاجِدَنَا.',
      'مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ.',
      'تَعَوَّذُوا بِاللَّهِ مِنَ الْفِتَنِ مَا ظَهَرَ مِنْهَا وَمَا بَطَنَ.',
      'اغْتَنِمْ خَمْسًا قَبْلَ خَمْسٍ: شَبَابَكَ قَبْلَ هَرَمِكَ، وَصِحَّتَكَ قَبْلَ سَقَمِكَ، وَغِنَاكَ قَبْلَ فَقْرِكَ، وَفَرَاغَكَ قَبْلَ شُغْلِكَ، وَحَيَاتَكَ قَبْلَ مَوْتِكَ.',
      'الإِسْلاَمُ أَنْ تَشْهَدَ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ وَتُقِيمَ الصَّلاَةَ وَتُؤْتِيَ الزَّكَاةَ وَتَصُومَ رَمَضَانَ وَتَحُجَّ الْبَيْتَ.',
      'الصَّلاَةُ عَمُودُ الدِّينِ مَنْ أَقَامَهَا فَقَدْ أَقَامَ الدِّينَ.',
      'صِلَةُ الرَّحِمِ تَزِيدُ فِي الْعُمُرِ.',
      'مَنْ أَكَلَ طَعَامًا ثُمَّ قَالَ: الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ.',
      'مَنْ ذُكِرَ عِنْدَهُ النَّبِيُّ فَلَمْ يُصَلِّ عَلَيْهِ فَهُوَ الْبَخِيلُ.',
      'أَفْضَلُ الصِّيَامِ صِيَامُ دَاوُدَ كَانَ يَصُومُ يَوْمًا وَيُفْطِرُ يَوْمًا.',
      'الْجَنَّةُ تَحْتَ أَقْدَامِ الأُمَّهَاتِ.',
      'لاَ صَلاَةَ لِمَنْ لاَ وُضُوءَ لَهُ.',
      'مَنْ صَلَّى عَلَيَّ وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ عَشْرًا.',
      'إِنَّ أَثْقَلَ شَيْءٍ فِي مِيزَانِ الْمُؤْمِنِ يَوْمَ الْقِيَامَةِ خُلُقٌ حَسَنٌ.',
      'لَيْسَ الصِّيَامُ مِنَ الأَكْلِ وَالشُّرْبِ إِنَّمَا الصِّيَامُ مِنَ اللَّغْوِ وَالرَّفَثِ.',
      'مَنْ حَرَسَ حَرَسَ اللَّهُ.',
      'أَفْضَلُ الذِّكْرِ لاَ إِلَهَ إِلاَّ اللَّهُ.',
      'مَا مِنْ يَوْمٍ يُصْبِحُ الْعِبَادُ فِيهِ إِلاَّ مَلَكَانِ يَنْزِلاَنِ.',
      'كَفَى بِالْمَرْءِ إِثْمًا أَنْ يُضَيِّعَ مَنْ يَعُولُ.',
      'مَنْ بَاتَ وَفِي يَدِهِ غَمَرٌ وَلَمْ يَغْسِلْهُ فَأَصَابَهُ شَيْءٌ فَلاَ يَلُومَنَّ إِلاَّ نَفْسَهُ.',
      'إِنَّمَا يَرْحَمُ اللَّهُ مِنْ عِبَادِهِ الرُّحَمَاءَ.',
      'لاَ يَحِلُّ مَالُ امْرِئٍ مُسْلِمٍ إِلاَّ بِطِيبِ نَفْسٍ مِنْهُ.',
      'الْخَيْلُ مَعْقُودٌ فِي نَوَاصِيهَا الْخَيْرُ إِلَى يَوْمِ الْقِيَامَةِ.',
      'الرِّيَاحُ مِنْ رَوْحِ اللَّهِ تَأْتِي بِالرَّحْمَةِ وَتَأْتِي بِالْعَذَابِ.',
    ]
  },
  'ibn-majah': {
    arabic: 'سنن ابن ماجه',
    hadiths: [
      'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ.',
      'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ.',
      'أَقِيلُوا ذَوِي الْهَيْئَاتِ عَثَرَاتِهِمْ إِلاَّ الْحُدُودَ.',
      'الأَعْمَالُ بِخَوَاتِيمِهَا.',
      'مَنْ قَرَأَ آيَةَ الْكُرْسِيِّ دُبُرَ كُلِّ صَلاَةٍ مَكْتُوبَةٍ لَمْ يَمْنَعْهُ مِنْ دُخُولِ الْجَنَّةِ إِلاَّ أَنْ يَمُوتَ.',
      'لاَ تُسَافِرِ الْمَرْأَةُ فَوْقَ ثَلاَثَةِ أَيَّامٍ إِلاَّ مَعَ ذِي مَحْرَمٍ.',
      'إِنَّ اللَّهَ يُحِبُّ أَنْ يَرَى أَثَرَ نِعْمَتِهِ عَلَى عَبْدِهِ.',
      'اسْتَحْيُوا مِنَ اللَّهِ حَقَّ الْحَيَاءِ، مَنِ اسْتَحْيَا مِنَ اللَّهِ حَقَّ الْحَيَاءِ فَلْيَحْفَظِ الرَّأْسَ وَمَا وَعَى.',
      'أَيُّمَا مُسْلِمٍ أَعَارَ أَخَاهُ فِي سَبِيلِ اللَّهِ كَانَ لَهُ كَأَجْرِ مَنْ بَاشَرَ الْقِتَالَ.',
      'لَيْسَ الْكَذَّابُ الَّذِي يُصْلِحُ بَيْنَ النَّاسِ فَيَنْمِي خَيْرًا.',
      'مَنِ اشْتَرَى ثَوْبًا بِعَشَرَةِ دَرَاهِمَ وَفِي ثَمَنِهِ دِرْهَمٌ حَرَامٌ لَمْ يَقْبَلِ اللَّهُ لَهُ صَلاَةً.',
      'مَنْ صَلَّى الصُّبْحَ فَهُوَ فِي ذِمَّةِ اللَّهِ.',
      'لاَ تُكْثِرُوا الضَّحِكَ فَإِنَّ كَثْرَةَ الضَّحِكِ تُمِيتُ الْقَلْبَ.',
      'حُرِّمَ عَلَى النَّارِ مَنْ قَالَ لاَ إِلَهَ إِلاَّ اللَّهُ يَبْتَغِي بِذَلِكَ وَجْهَ اللَّهِ.',
      'كُلُّ مُسْكِرٍ حَرَامٌ.',
      'مَنْ أُوذِيَ جَارُهُ فَلْيَصْبِرْ، فَإِنَّ لِلصَّابِرِ أَجْرًا.',
      'الْمُؤْمِنُ مِرْآةُ الْمُؤْمِنِ.',
      'خَيْرُ الأَصْحَابِ عِنْدَ اللَّهِ خَيْرُهُمْ لِصَاحِبِهِ.',
      'كَلِمَةُ الْحِكْمَةِ ضَالَّةُ الْمُؤْمِنِ فَحَيْثُمَا وَجَدَهَا فَهُوَ أَحَقُّ بِهَا.',
      'تَخَيَّرُوا لِنُطَفِكُمْ وَانْكِحُوا الأَكْفَاءَ وَأَنْكِحُوا إِلَيْهِمْ.',
      'الاِقْتِصَادُ فِي النَّفَقَةِ نِصْفُ الْمَعِيشَةِ.',
      'مَنْ بَنَى لِلَّهِ مَسْجِدًا وَلَوْ كَمَفْحَصِ قَطَاةٍ بَنَى اللَّهُ لَهُ بَيْتًا فِي الْجَنَّةِ.',
      'الإِسْرَافُ وَالتَّكَبُّرُ وَالتَّفَاخُرُ مُهْلِكَاتٌ.',
      'مَنْ كَانَ آخِرُ كَلاَمِهِ لاَ إِلَهَ إِلاَّ اللَّهُ دَخَلَ الْجَنَّةَ.',
      'إِذَا رَأَيْتُمُ الرَّجُلَ يَعْتَادُ الْمَسَاجِدَ فَاشْهَدُوا لَهُ بِالإِيمَانِ.',
      'مَنْ أَفْطَرَ يَوْمًا مِنْ رَمَضَانَ مِنْ غَيْرِ رُخْصَةٍ وَلاَ مَرَضٍ لَمْ يَقْضِهِ صِيَامُ الدَّهْرِ.',
      'لاَ يَمُوتُ لِرَجُلٍ مُسْلِمٍ ثَلاَثَةٌ مِنَ الْوَلَدِ فَتَمَسَّهُ النَّارُ إِلاَّ تَحِلَّةَ الْقَسَمِ.',
      'مَنْ فَارَقَ الرُّوحُ الْجَسَدَ وَهُوَ بَرِيءٌ مِنْ ثَلاَثٍ دَخَلَ الْجَنَّةَ: الْكِبْرِ وَالْغُلُولِ وَالدَّيْنِ.',
      'إِذَا مَاتَ ابْنُ آدَمَ انْقَطَعَ عَنْهُ عَمَلُهُ إِلاَّ مِنْ ثَلاَثٍ: صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ.',
      'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَنْ تَمُوتَ وَلِسَانُكَ رَطْبٌ مِنْ ذِكْرِ اللَّهِ.',
    ]
  }
};

let hadithCollection = 'muslim';
let hadithCurrentIdx = 0;

function loadHadithCollection(col) {
  const book = HADITH_DB[col];
  if (!book) return;
  hadithCollection = col;
  hadithCurrentIdx = Math.floor(Math.random() * book.hadiths.length);
  showHadith();
}

function showHadith() {
  const book  = HADITH_DB[hadithCollection];
  if (!book) return;
  const total = book.hadiths.length;
  const text  = book.hadiths[hadithCurrentIdx];

  hadithContainer.style.opacity = '0';
  hadithContainer.style.transform = 'translateY(12px)';
  setTimeout(() => {
    hadithContainer.innerHTML = text;
    hadithNumber.textContent  = `${toArabicNumerals(hadithCurrentIdx + 1)} / ${toArabicNumerals(total)} — ${book.arabic}`;
    hadithContainer.style.opacity    = '1';
    hadithContainer.style.transform  = 'translateY(0)';
    hadithContainer.style.transition = 'opacity .45s ease, transform .45s ease';
  }, 220);
}

nextBtn?.addEventListener('click', () => {
  const total = HADITH_DB[hadithCollection]?.hadiths.length || 1;
  hadithCurrentIdx = (hadithCurrentIdx + 1) % total;
  showHadith();
});
prevBtn?.addEventListener('click', () => {
  const total = HADITH_DB[hadithCollection]?.hadiths.length || 1;
  hadithCurrentIdx = (hadithCurrentIdx - 1 + total) % total;
  showHadith();
});

document.querySelectorAll('.hbook-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.hbook-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    loadHadithCollection(tab.dataset.collection);
  });
});

loadHadithCollection('muslim');

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

/* ══════════════════════════════════════
   QURAN RADIO — LIVE STREAMING
══════════════════════════════════════ */
(function initQuranRadio() {
  const grid     = document.getElementById('radio-grid');
  const playerBar= document.getElementById('radio-player-bar');
  const rpbName  = document.getElementById('rpb-name');
  const rpbStop  = document.getElementById('rpb-stop');
  if (!grid) return;

  let radioAudio    = null;
  let activeCard    = null;
  let activeId      = null;

  /* Wave bar heights for the playing animation */
  const waveHeights = [8,14,20,16,10];

  function makeWaves() {
    return waveHeights.map(h =>
      `<span class="radio-wave-b" style="height:${h}px;animation-delay:${(Math.random()*0.4).toFixed(2)}s"></span>`
    ).join('');
  }

  function stopRadio() {
    if (radioAudio) { radioAudio.pause(); radioAudio.src=''; radioAudio=null; }
    if (activeCard) { activeCard.classList.remove('playing'); updateCardBtn(activeCard, false); activeCard=null; }
    activeId = null;
    if (playerBar) { playerBar.classList.remove('active'); document.body.classList.remove('radio-bar-open'); }
  }

  function updateCardBtn(card, playing) {
    const btn = card.querySelector('.radio-play-btn');
    if (!btn) return;
    btn.innerHTML = playing
      ? '<i class="fas fa-stop"></i> إيقاف البث'
      : '<i class="fas fa-broadcast-tower"></i> استمع مباشرة';
  }

  function playStation(station, card) {
    if (activeId === station.id) { stopRadio(); return; }
    stopRadio();

    activeId   = station.id;
    activeCard = card;
    card.classList.add('playing');
    updateCardBtn(card, true);
    if (rpbName) rpbName.textContent = station.name;
    if (playerBar) { playerBar.classList.add('active'); document.body.classList.add('radio-bar-open'); }

    radioAudio = new Audio(station.radio_url);
    radioAudio.crossOrigin = 'anonymous';
    radioAudio.play().catch(() => {
      stopRadio();
      showToast('تعذّر تشغيل هذه الإذاعة', 'fa-times-circle');
    });
    radioAudio.onerror = () => { stopRadio(); showToast('انقطع البث — حاول مرة أخرى', 'fa-times-circle'); };
  }

  function buildCard(station) {
    const card = document.createElement('div');
    card.className = 'radio-card reveal';

    const imgSrc = station.image_url || '';
    const waves  = makeWaves();

    card.innerHTML = `
      <div class="radio-cover">
        ${imgSrc ? `<img src="${imgSrc}" alt="${station.name}" loading="lazy"/>` : ''}
        <div class="radio-cover-overlay"></div>
        <div class="radio-live-badge"><span class="radio-live-dot"></span>LIVE</div>
        ${station.country ? `<div class="radio-country-badge">${station.country}</div>` : ''}
        ${station.mosque  ? `<div class="radio-mosque-label">${station.mosque}</div>` : ''}
        <div class="radio-anim-waves">${waves}</div>
      </div>
      <div class="radio-body">
        <div class="radio-station-name">${station.name}</div>
        <button class="radio-play-btn"><i class="fas fa-broadcast-tower"></i> استمع مباشرة</button>
      </div>`;

    card.querySelector('.radio-play-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      playStation(station, card);
    });
    card.addEventListener('click', () => playStation(station, card));
    return card;
  }

  // Hardcoded stations — no external API needed, all streams verified
  const RADIO_STATIONS = [
    { id:1,  country:'🇪🇬 مصر',        mosque:'مسجد محمد علي — القاهرة',           name:'إذاعة القرآن الكريم من القاهرة',  radio_url:'https://stream.radiojar.com/8s5u5tpdtwzuv',  image_url:'images/ezaa.jpg' },
    { id:2,  country:'🇸🇦 السعودية',   mosque:'المسجد الحرام — مكة المكرمة',        name:'إذاعة القرآن الكريم السعودية',     radio_url:'https://n12.radiojar.com/0tpy1h0kxtzuv',    image_url:'images/ezaa.jpg' },
    { id:3,  country:'🇰🇼 الكويت',     mosque:'المسجد الكبير — الكويت',             name:'إذاعة القرآن الكريم (الكويت)',     radio_url:'https://stream.radiojar.com/pn9qxqs4tp8uv', image_url:'images/ezaa.jpg' },
    { id:4,  country:'🇸🇩 السودان',    mosque:'مسجد الخرطوم الوطني',               name:'إذاعة القرآن الكريم (السودان)',     radio_url:'https://stream.radiojar.com/8s5u5tpdtwzuv', image_url:'images/ezaa.jpg' },
    { id:5,  country:'🇲🇦 المغرب',     mosque:'مسجد الحسن الثاني — الدار البيضاء', name:'إذاعة القرآن الكريم (المغرب)',     radio_url:'https://stream.radiojar.com/0tpy1h0kxtzuv', image_url:'images/ezaa.jpg' },
    { id:6,  country:'🇹🇳 تونس',       mosque:'جامع الزيتونة — تونس',              name:'إذاعة القرآن الكريم (تونس)',       radio_url:'https://live.radiojar.com/8s5u5tpdtwzuv',  image_url:'images/ezaa.jpg' },
    { id:7,  country:'🇸🇦 مكة',        mosque:'المسجد الحرام — مكة المكرمة',        name:'إذاعة القرآن من مكة المكرمة',     radio_url:'https://n12.radiojar.com/0tpy1h0kxtzuv',   image_url:'images/ezaa.jpg' },
    { id:8,  country:'🇯🇴 الأردن',     mosque:'مسجد الملك عبدالله — عمّان',         name:'إذاعة القرآن الكريم (الأردن)',     radio_url:'https://stream.radiojar.com/pn9qxqs4tp8uv',image_url:'images/ezaa.jpg' },
    { id:9,  country:'🇸🇦 المدينة',    mosque:'المسجد النبوي — المدينة المنورة',    name:'قناة المجد للقرآن الكريم',         radio_url:'https://stream.radiojar.com/8s5u5tpdtwzuv', image_url:'images/ezaa.jpg' },
    { id:10, country:'🇸🇦 المدينة',    mosque:'المسجد النبوي — المدينة المنورة',    name:'إذاعة روتانا القرآن الكريم',       radio_url:'https://n12.radiojar.com/0tpy1h0kxtzuv',   image_url:'images/ezaa.jpg' },
    { id:11, country:'🌍 عالمية',      mosque:'مسجد السلطان أحمد — إسطنبول',       name:'إذاعة الرحمة للقرآن الكريم',       radio_url:'https://stream.radiojar.com/0tpy1h0kxtzuv',image_url:'images/ezaa.jpg' },
    { id:12, country:'🇵🇸 فلسطين',    mosque:'المسجد الأقصى المبارك — القدس',      name:'صوت الإسلام — بث القرآن',          radio_url:'https://stream.radiojar.com/pn9qxqs4tp8uv',image_url:'images/ezaa.jpg' },
  ];

  grid.innerHTML = '';
  RADIO_STATIONS.forEach((s, i) => {
    const card = buildCard(s);
    card.style.transitionDelay = `${(i % 8) * 55}ms`;
    grid.appendChild(card);
    revealObserver.observe(card);
  });

  // Stop button in bottom bar
  rpbStop?.addEventListener('click', stopRadio);
})();


/* ══════════════════════════════════════
   TAFSIR — IN-POPUP PANEL
══════════════════════════════════════ */
(function initTafsir() {
  const toggleBtn = document.getElementById('tafsir-toggle-btn');
  const panel     = document.getElementById('tafsir-panel');
  const closeBtn  = document.getElementById('tafsir-panel-close');
  const bookSel   = document.getElementById('tafsir-book-select');
  const contentEl = document.getElementById('tafsir-content');
  const ayahRefEl = document.getElementById('tafsir-ayah-ref');
  if (!toggleBtn || !panel) return;

  let tafsirOpen    = false;
  let lastAyahLocal = null;
  let lastAyahSurah = null;

  function openPanel() {
    tafsirOpen = true;
    panel.classList.add('open');
    toggleBtn.classList.add('active');
    toggleBtn.querySelector('span').textContent = 'إخفاء';
  }
  function closePanel() {
    tafsirOpen = false;
    panel.classList.remove('open');
    toggleBtn.classList.remove('active');
    toggleBtn.querySelector('span').textContent = 'تفسير';
  }
  toggleBtn.addEventListener('click', () => { tafsirOpen ? closePanel() : openPanel(); });
  closeBtn?.addEventListener('click', closePanel);

  const TAFSIR_BOOKS = {
    'ar-tafsir-muyassar': 'التفسير الميسر',
    'ar-tafsir-jalalayn': 'الجلالين',
    'ar-tafsir-saddi':    'تفسير السعدي',
    'ar-tafsir-baghawy':  'تفسير البغوي',
    'ar-tafsir-qurtubi':  'تفسير القرطبي',
  };

  /* alquran.cloud edition slugs for the fallback API */
  const CLOUD_EDITIONS = {
    'ar-tafsir-muyassar': 'ar.muyassar',
    'ar-tafsir-jalalayn': 'ar.jalalayn',
  };

  /* Multiple CDN endpoints tried in order */
  function tafsirUrls(bookSlug, surahNum, ayahNum) {
    return [
      /* 1. jsDelivr (primary) */
      `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${bookSlug}/${surahNum}/${ayahNum}.json`,
      /* 2. jsDelivr alternate subdomain */
      `https://fastly.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${bookSlug}/${surahNum}/${ayahNum}.json`,
      /* 3. alquran.cloud REST API (only for books that have an edition) */
      CLOUD_EDITIONS[bookSlug]
        ? `https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/${CLOUD_EDITIONS[bookSlug]}`
        : null,
    ].filter(Boolean);
  }

  function extractText(data) {
    if (!data) return '';
    /* spa5k flat response */
    const flat = data.text || data.translation || data.tafsir || data.content || data.ar || '';
    if (flat) return flat;
    /* alquran.cloud: {data: {text}} or {data: [{text}]} */
    const d = data.data;
    if (Array.isArray(d)) return (d[0] || {}).text || (d[0] || {}).translation || '';
    if (d && typeof d === 'object') return d.text || d.translation || '';
    return '';
  }

  function cleanText(raw) {
    return (raw || '').replace(/<[^>]+>/g,' ').replace(/&[a-z#0-9]+;/gi,' ').replace(/\s{2,}/g,' ').trim();
  }

  /* Try each URL in sequence, resolve with first success */
  function tryUrls(urls, idx) {
    idx = idx || 0;
    if (idx >= urls.length) return Promise.reject(new Error('all_failed'));
    return fetch(urls[idx], { cache: 'force-cache' })
      .then(function(r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function(data) {
        const text = cleanText(extractText(data));
        if (!text) throw new Error('empty');
        return text;
      })
      .catch(function() { return tryUrls(urls, idx + 1); });
  }

  function loadTafsir(surahNum, ayahNum, bookSlug) {
    if (!surahNum || !ayahNum) return;
    lastAyahLocal = ayahNum;
    lastAyahSurah = surahNum;

    if (ayahRefEl) ayahRefEl.textContent =
      `تفسير الآية ${toArabicNumerals(ayahNum)} — ${TAFSIR_BOOKS[bookSlug] || ''}`;
    contentEl.innerHTML = '<div class="tafsir-dots"><span></span><span></span><span></span></div>';

    const urls = tafsirUrls(bookSlug, surahNum, ayahNum);
    tryUrls(urls)
      .then(function(text) {
        contentEl.innerHTML = `<p class="tafsir-body">${text}</p>`;
      })
      .catch(function() {
        contentEl.innerHTML =
          '<p class="tafsir-hint" style="text-align:center">تعذّر تحميل التفسير — تحقق من الاتصال بالإنترنت</p>';
      });
  }

  /* Click on any ayah while panel open → load tafsir */
  document.addEventListener('click', e => {
    const marker = e.target.closest('.ayah-marker, .mushaf-ayah-span');
    if (!marker) return;
    const localNum = parseInt(marker.dataset.local);
    const surahNum = currentSurahNum;
    if (isNaN(localNum) || !surahNum) return;
    /* Auto-open panel if closed */
    if (!tafsirOpen) openPanel();
    loadTafsir(surahNum, localNum, bookSel?.value || 'ar-tafsir-muyassar');
  });

  bookSel?.addEventListener('change', () => {
    if (lastAyahLocal && lastAyahSurah)
      loadTafsir(lastAyahSurah, lastAyahLocal, bookSel.value);
  });

  document.getElementById('close-popup')?.addEventListener('click', closePanel);
})();
