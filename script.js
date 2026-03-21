/* ══════════════════════════════════════════════════
   YEAR TRACKER — script.js
   ══════════════════════════════════════════════════ */

// ── SERVICE WORKER (PWA) ──────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('✅ SW registered'))
      .catch(err => console.error('SW Error:', err));
  });
}

// ══════════════════════════════════════════════════
// CANVAS PARTICLES
// ══════════════════════════════════════════════════
(function () {
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.r  = Math.random() * 1.1 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.12;
    this.vy = (Math.random() - 0.5) * 0.12;
    this.a  = Math.random() * 0.35 + 0.05;
  }

  function init() {
    particles = [];
    for (let i = 0; i < 100; i++) particles.push(new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,77,0,${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize(); init(); draw();
  window.addEventListener('resize', () => { resize(); init(); });
})();

// ══════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════
function getDayOfYear(d) {
  return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
}
function isLeap(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}
function dayToDate(year, n) {
  return new Date(year, 0, n).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short'
  });
}

// ══════════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════════
const QUOTES = [
  '"The days are long, but the years are short."',
  '"Time is the coin of your life. Spend it wisely."',
  '"Lost time is never found again." — Benjamin Franklin',
  '"How you spend your days is how you spend your life."',
  '"Every morning you have two choices: sleep or chase your dreams."',
  '"This time, like all times, is a very good one." — Emerson',
  '"Make each day your masterpiece." — John Wooden',
];

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function getMonthStartDays(year) {
  return MONTHS.map((_, i) => getDayOfYear(new Date(year, i, 1)));
}

// ══════════════════════════════════════════════════
// MAIN BUILD
// ══════════════════════════════════════════════════
function build() {
  const now   = new Date();
  const year  = now.getFullYear();
  const total = isLeap(year) ? 366 : 365;
  const today = getDayOfYear(now);
  const left  = total - today;
  const pct   = (today / total * 100).toFixed(1);

  // Header
  document.getElementById('brandYear').innerHTML =
    `${String(year).slice(0,2)}<span>${String(year).slice(2)}</span>`;
  document.getElementById('headerDate').textContent =
    now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' });
  document.getElementById('headerDayNum').textContent = `DAY ${today}`;

  // Stats
  document.getElementById('statDone').textContent  = today;
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statLeft').textContent  = left;

  // Quote
  document.getElementById('quoteEl').textContent = QUOTES[today % QUOTES.length];

  // Footer
  document.getElementById('footerPct').textContent      = pct + '%';
  document.getElementById('footerSub').textContent      = `of ${year} is gone forever`;
  document.getElementById('footerDaysLeft').textContent = left + ' days';

  setTimeout(() => {
    document.getElementById('progressFill').style.width = pct + '%';
  }, 800);

  // Month ticks
  const markers = document.getElementById('progressMarkers');
  markers.innerHTML = '';
  getMonthStartDays(year).forEach((dayNum, i) => {
    if (i === 0) return;
    const pos = (dayNum / total * 100).toFixed(2) + '%';
    const tick = document.createElement('div');
    tick.className = 'month-tick';
    tick.style.left = pos;
    markers.appendChild(tick);
    const name = document.createElement('div');
    name.className = 'month-name';
    name.style.left = pos;
    name.textContent = MONTHS[i];
    markers.appendChild(name);
  });

  // Dot Grid
  const grid    = document.getElementById('grid');
  const tooltip = document.getElementById('tooltip');
  grid.innerHTML = '';

  for (let i = 1; i <= total; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot ' + (i < today ? 'done' : i === today ? 'today' : 'left');
    dot.style.animationDelay = (i * 1) + 'ms';

    const label = dayToDate(year, i);
    dot.addEventListener('mouseenter', () => {
      tooltip.innerHTML = `<span class="t-day">Day ${i}</span> &nbsp;·&nbsp; ${label}` +
        (i === today ? ' &nbsp;<span style="color:var(--accent)">← TODAY</span>' : '');
      tooltip.style.opacity = '1';
    });
    dot.addEventListener('mousemove', e => {
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top  = (e.clientY - 30) + 'px';
    });
    dot.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });

    grid.appendChild(dot);
  }
}

// ══════════════════════════════════════════════════
// MIDNIGHT REFRESH
// ══════════════════════════════════════════════════
function scheduleMidnight() {
  const now = new Date();
  const ms  = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
  setTimeout(() => { build(); setInterval(build, 86400000); }, ms);
}

build();
scheduleMidnight();