// ── CANVAS PARTICLES ──────────────────────────────────
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
    this.r  = Math.random() * 1.2 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.15;
    this.vy = (Math.random() - 0.5) * 0.15;
    this.a  = Math.random() * 0.4 + 0.05;
  }

  function init() {
    particles = [];
    for (let i = 0; i < 120; i++) particles.push(new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
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

  resize();
  init();
  draw();
  window.addEventListener('resize', () => { resize(); init(); });
})();

// ── HELPERS ───────────────────────────────────────────

// Returns which day of the year (1 = Jan 1st)
function getDayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

// Leap year check
function isLeap(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

// Convert day number to readable date string
function dayToDate(year, n) {
  const d = new Date(year, 0, n);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

// ── QUOTES (rotates daily) ────────────────────────────
const quotes = [
  '"The days are long, but the years are short."',
  '"Time is the coin of your life. Spend it wisely."',
  '"Lost time is never found again." — Benjamin Franklin',
  '"How you spend your days is how you spend your life."',
  '"Every morning you have two choices: sleep or chase your dreams."',
];

// ── MONTH NAMES ───────────────────────────────────────
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

// Returns the day-of-year number when each month starts
function getMonthStartDays(year) {
  return MONTHS.map((_, i) => {
    const d = new Date(year, i, 1);
    return getDayOfYear(d);
  });
}

// ── MAIN BUILD FUNCTION ───────────────────────────────
function build() {
  const now   = new Date();
  const year  = now.getFullYear();
  const total = isLeap(year) ? 366 : 365;
  const today = getDayOfYear(now);
  const left  = total - today;
  const pct   = (today / total * 100).toFixed(1);

  // ── Header
  document.getElementById('brandYear').innerHTML =
    `${String(year).slice(0, 2)}<span>${String(year).slice(2)}</span>`;

  document.getElementById('headerDate').textContent =
    now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  document.getElementById('headerDayNum').textContent =
    String(today).padStart(3, '0');

  // ── Stats
  document.getElementById('statDone').textContent  = today;
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statLeft').textContent  = left;

  // ── Quote (rotates based on day number)
  document.getElementById('quoteEl').textContent =
    quotes[today % quotes.length];

  // ── Footer
  document.getElementById('footerPct').textContent      = pct + '%';
  document.getElementById('footerSub').textContent      = `of ${year} is gone forever`;
  document.getElementById('footerDaysLeft').textContent = left + ' days';

  // Animate progress bar after short delay
  setTimeout(() => {
    document.getElementById('progressFill').style.width = pct + '%';
  }, 900);

  // ── Month ticks on progress bar
  const markers = document.getElementById('progressMarkers');
  markers.innerHTML = '';

  getMonthStartDays(year).forEach((dayNum, i) => {
    if (i === 0) return; // skip Jan (it's at 0%)

    const pctPos = (dayNum / total * 100).toFixed(2);

    const tick = document.createElement('div');
    tick.className   = 'month-tick';
    tick.style.left  = pctPos + '%';
    markers.appendChild(tick);

    const label = document.createElement('div');
    label.className   = 'month-name';
    label.style.left  = pctPos + '%';
    label.textContent = MONTHS[i];
    markers.appendChild(label);
  });

  // ── Dot grid
  const grid    = document.getElementById('grid');
  const tooltip = document.getElementById('tooltip');
  grid.innerHTML = '';

  for (let i = 1; i <= total; i++) {
    const dot = document.createElement('div');

    if (i < today)        dot.className = 'dot done';
    else if (i === today) dot.className = 'dot today';
    else                  dot.className = 'dot left';

    // Stagger animation
    dot.style.animationDelay = (i * 1.2) + 'ms';

    // Tooltip
    const label = dayToDate(year, i);

    dot.addEventListener('mouseenter', () => {
      tooltip.innerHTML =
        `<span class="t-day">Day ${i}</span> &nbsp;·&nbsp; ${label}` +
        (i === today ? ' &nbsp;<span style="color:var(--accent)">← TODAY</span>' : '');
      tooltip.style.opacity = '1';
    });

    dot.addEventListener('mousemove', e => {
      tooltip.style.left = (e.clientX + 16) + 'px';
      tooltip.style.top  = (e.clientY - 32) + 'px';
    });

    dot.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });

    grid.appendChild(dot);
  }
}

// ── AUTO REFRESH AT MIDNIGHT ──────────────────────────
function scheduleMidnight() {
  const now = new Date();
  const msToMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  ) - now;

  setTimeout(() => {
    build();
    setInterval(build, 86400000); // repeat every 24 hours
  }, msToMidnight);
}

// ── INIT ──────────────────────────────────────────────
build();
scheduleMidnight();