/* ============================================
   ALL ELEMENT REFS & STATE — declared first so
   no function call hits a temporal dead zone
   ============================================ */
const nav               = document.getElementById('nav');
const scrollProgressEl  = document.getElementById('scroll-progress');
const navLinkEls        = document.querySelectorAll('.nav-links a');
const sections          = Array.from(document.querySelectorAll('section[id]'));
const hamburger         = document.getElementById('hamburger');
const navLinksContainer = document.getElementById('nav-links');
const navIndicator      = document.getElementById('nav-indicator');
const navInnerEl        = document.querySelector('.nav-inner');
const projectsGrid      = document.getElementById('projects-grid');
const palette           = document.getElementById('cmd-palette');
const cmdInput          = document.getElementById('cmd-input');
const cmdList           = document.getElementById('cmd-list');
const cmdTrigger        = document.getElementById('cmd-trigger');
const cmdBackdrop       = document.getElementById('cmd-backdrop');
const form              = document.getElementById('contact-form');
const themeToggle       = document.getElementById('theme-toggle');
const heroSection       = document.getElementById('home');
const canvas            = document.getElementById('hero-canvas');
const ctx               = canvas ? canvas.getContext('2d') : null;

// Mutable state
let navHovered  = false;
let selectedIdx = 0;
let filteredItems = [];

// Constants
const PILL_PAD = 10;

const LANG_COLORS = {
  'Python':           '#3572A5',
  'JavaScript':       '#F7DF1E',
  'TypeScript':       '#2B7489',
  'C++':              '#F34B7D',
  'HTML':             '#E34C26',
  'Jupyter Notebook': '#DA5B0B',
};

const CMD_ITEMS = [
  { type: 'nav',  id: 'home',       label: 'Home',        desc: 'Back to top',                    icon: 'H'  },
  { type: 'nav',  id: 'resume',     label: 'Resume',      desc: 'Education & experience',         icon: 'R'  },
  { type: 'nav',  id: 'activities', label: 'Activities',  desc: 'Clubs, programs & achievements', icon: 'A'  },
  { type: 'nav',  id: 'projects',   label: 'Projects',    desc: 'GitHub repositories',            icon: 'P'  },
  { type: 'nav',  id: 'skills',     label: 'Skills',      desc: 'Languages, tools & interests',   icon: 'S'  },
  { type: 'nav',  id: 'contact',    label: 'Contact',     desc: 'Get in touch',                   icon: 'C'  },
  { type: 'link', href: 'mailto:lawad@uchicago.edu',              label: 'Send Email', desc: 'lawad@uchicago.edu',        icon: '✉'  },
  { type: 'link', href: 'https://www.linkedin.com/in/lucasawad/', label: 'LinkedIn',   desc: 'linkedin.com/in/lucasawad', icon: 'in' },
  { type: 'link', href: 'https://github.com/lawad05',             label: 'GitHub',     desc: 'github.com/lawad05',        icon: 'GH' },
];

/* ============================================
   SCROLL PROGRESS
   ============================================ */
function updateProgress() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgressEl.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : '0%';
}

/* ============================================
   NAV INDICATOR
   ============================================ */
function moveIndicatorTo(link) {
  if (!link || window.innerWidth <= 640) {
    navIndicator.style.opacity = '0';
    return;
  }
  const navRect  = navInnerEl.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  navIndicator.style.left    = `${linkRect.left - navRect.left - PILL_PAD}px`;
  navIndicator.style.width   = `${linkRect.width + PILL_PAD * 2}px`;
  navIndicator.style.opacity = '1';
}

function syncIndicator() {
  const active = document.querySelector('.nav-links a.active');
  if (active) moveIndicatorTo(active);
  else navIndicator.style.opacity = '0';
}

/* ============================================
   SCROLL HANDLER (nav class + active links)
   ============================================ */
function onScroll() {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  updateProgress();

  let current = sections[0].id;
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 110) current = sec.id;
  });
  navLinkEls.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });

  if (!navHovered) syncIndicator();
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('load',   onScroll);
onScroll();

/* ============================================
   NAV INDICATOR — hover behaviour
   ============================================ */
navLinkEls.forEach(link => {
  link.addEventListener('mouseenter', () => {
    navHovered = true;
    moveIndicatorTo(link);
  });
});

navLinksContainer.addEventListener('mouseleave', () => {
  navHovered = false;
  syncIndicator();
});

window.addEventListener('resize', () => {
  if (!navHovered) syncIndicator();
}, { passive: true });

/* ============================================
   HAMBURGER
   ============================================ */
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinksContainer.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

navLinksContainer.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksContainer.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* ============================================
   EXPANDABLE RESUME ROWS
   ============================================ */
document.querySelectorAll('.resume-row').forEach(row => {
  const btn     = row.querySelector('.toggle-btn');
  const details = row.querySelector('.resume-details');
  if (!btn || !details) return;

  row.querySelector('.resume-row-header').addEventListener('click', () => {
    const isOpen = details.style.maxHeight && details.style.maxHeight !== '0px';
    details.style.maxHeight = isOpen ? '0px' : `${details.scrollHeight}px`;
    btn.classList.toggle('open', !isOpen);
    btn.setAttribute('aria-expanded', String(!isOpen));
  });
});

/* ============================================
   EXPANDABLE INTEREST ITEMS
   ============================================ */
document.querySelectorAll('.interest-expandable').forEach(item => {
  const btn     = item.querySelector('.toggle-btn');
  const details = item.querySelector('.interest-details');
  if (!btn || !details) return;

  item.querySelector('.interest-header').addEventListener('click', () => {
    const isOpen = details.style.maxHeight && details.style.maxHeight !== '0px';
    details.style.maxHeight = isOpen ? '0px' : `${details.scrollHeight}px`;
    btn.classList.toggle('open', !isOpen);
  });
});

/* ============================================
   INTERSECTION OBSERVER — fade-up
   ============================================ */
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

/* ============================================
   GITHUB PROJECTS
   ============================================ */
function toTitleCase(str) {
  return str.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function buildCard(repo) {
  const name      = toTitleCase(repo.name);
  const desc      = repo.description
    ? `<p class="repo-desc">${repo.description}</p>`
    : `<p class="repo-desc repo-no-desc">No description provided</p>`;
  const langColor = LANG_COLORS[repo.language] || '#999';
  const lang      = repo.language
    ? `<span class="lang-pill"><span class="lang-dot" style="background:${langColor}"></span>${repo.language}</span>`
    : '<span></span>';

  return `
    <a class="project-card fade-up" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
      <div class="repo-name">${name}</div>
      ${desc}
      <div class="repo-footer">
        ${lang}
        <span class="repo-stats">&#9733; ${repo.stargazers_count}&ensp;&#9903; ${repo.forks_count}</span>
      </div>
      <span class="repo-link">View on GitHub &rarr;</span>
    </a>`;
}

async function loadProjects() {
  projectsGrid.innerHTML = Array(6).fill('<div class="project-skeleton"></div>').join('');
  try {
    const res   = await fetch('https://api.github.com/users/lawad05/repos?sort=updated&per_page=12');
    if (!res.ok) throw new Error(`${res.status}`);
    const repos = await res.json();
    const orig  = repos.filter(r => !r.fork);
    const show  = orig.length >= 3 ? orig : repos;
    if (!show.length) throw new Error('empty');
    projectsGrid.innerHTML = show.map(buildCard).join('');
    projectsGrid.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));
  } catch {
    projectsGrid.innerHTML = `
      <div class="projects-error">
        Couldn&rsquo;t load repositories &mdash;
        <a href="https://github.com/lawad05" target="_blank" rel="noopener noreferrer">view them on GitHub</a>
      </div>`;
  }
}

loadProjects();

/* ============================================
   CONTACT FORM
   ============================================ */
form.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = form.querySelector('.submit-btn');
  btn.textContent = 'Sending…';
  btn.disabled    = true;

  try {
    const res  = await fetch('https://api.web3forms.com/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body:    JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const data = await res.json();
    if (data.success) {
      btn.textContent = 'Sent \u2713';
      setTimeout(() => {
        form.reset();
        btn.textContent = 'Send Message';
        btn.disabled    = false;
      }, 3000);
    } else {
      throw new Error(data.message || 'failed');
    }
  } catch {
    btn.textContent = 'Error — try again';
    btn.disabled    = false;
  }
});

/* ============================================
   COMMAND PALETTE
   ============================================ */
function openPalette() {
  filteredItems  = [...CMD_ITEMS];
  selectedIdx    = 0;
  cmdInput.value = '';
  renderList();
  palette.classList.add('open');
  palette.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => cmdInput.focus());
}

function closePalette() {
  palette.classList.remove('open');
  palette.setAttribute('aria-hidden', 'true');
}

function execute(item) {
  closePalette();
  if (item.type === 'nav') {
    const target = document.getElementById(item.id);
    if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 60);
  } else {
    if (item.href.startsWith('mailto:') || item.href.startsWith('tel:')) {
      window.location.href = item.href;
    } else {
      window.open(item.href, '_blank', 'noopener,noreferrer');
    }
  }
}

function itemHTML(item, idx) {
  const sel = idx === selectedIdx;
  return `
    <li class="cmd-item${sel ? ' selected' : ''}" data-idx="${idx}" role="option" aria-selected="${sel}">
      <div class="cmd-item-icon">${item.icon}</div>
      <div class="cmd-item-text">
        <div class="cmd-item-label">${item.label}</div>
        <div class="cmd-item-desc">${item.desc}</div>
      </div>
      <span class="cmd-item-enter" aria-hidden="true">&#8629;</span>
    </li>`;
}

function renderList() {
  if (!filteredItems.length) {
    cmdList.innerHTML = '<li class="cmd-empty">No results</li>';
    return;
  }
  const navItems  = filteredItems.filter(i => i.type === 'nav');
  const linkItems = filteredItems.filter(i => i.type === 'link');
  let html = '';
  let idx  = 0;
  if (navItems.length) {
    html += '<li class="cmd-section-label" aria-hidden="true">Navigate</li>';
    navItems.forEach(item => { html += itemHTML(item, idx++); });
  }
  if (linkItems.length) {
    html += '<li class="cmd-section-label" aria-hidden="true">Quick Actions</li>';
    linkItems.forEach(item => { html += itemHTML(item, idx++); });
  }
  cmdList.innerHTML = html;
}

function setSelected(idx) {
  selectedIdx = Math.max(0, Math.min(filteredItems.length - 1, idx));
  renderList();
  cmdList.querySelector('.selected')?.scrollIntoView({ block: 'nearest' });
}

cmdInput.addEventListener('input', () => {
  const q = cmdInput.value.toLowerCase().trim();
  filteredItems = q
    ? CMD_ITEMS.filter(i =>
        i.label.toLowerCase().includes(q) ||
        i.desc.toLowerCase().includes(q))
    : [...CMD_ITEMS];
  selectedIdx = 0;
  renderList();
});

cmdInput.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(selectedIdx + 1); }
  if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(selectedIdx - 1); }
  if (e.key === 'Enter' && filteredItems.length) execute(filteredItems[selectedIdx]);
  if (e.key === 'Escape') closePalette();
});

cmdList.addEventListener('click', e => {
  const li = e.target.closest('.cmd-item[data-idx]');
  if (li) execute(filteredItems[parseInt(li.dataset.idx, 10)]);
});

cmdList.addEventListener('mousemove', e => {
  const li = e.target.closest('.cmd-item[data-idx]');
  if (li) {
    const i = parseInt(li.dataset.idx, 10);
    if (i !== selectedIdx) { selectedIdx = i; renderList(); }
  }
});

cmdTrigger.addEventListener('click', openPalette);
cmdBackdrop.addEventListener('click', closePalette);

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    palette.classList.contains('open') ? closePalette() : openPalette();
  }
  if (e.key === 'Escape' && palette.classList.contains('open')) closePalette();
});

/* ============================================
   THEME TOGGLE
   ============================================ */
themeToggle.addEventListener('click', () => {
  const dark = document.documentElement.classList.toggle('dark-mode');
  localStorage.setItem('theme', dark ? 'dark' : 'light');

  const cord = themeToggle.querySelector('.lamp-cord');
  if (cord) {
    cord.classList.remove('pulling');
    void cord.offsetWidth; // force reflow so animation restarts
    cord.classList.add('pulling');
    cord.addEventListener('animationend', () => cord.classList.remove('pulling'), { once: true });
  }
});

/* ============================================
   PARTICLE NETWORK
   ============================================ */
if (canvas && ctx) {
  let particles = [];
  const mouse   = { x: null, y: null };
  const MAX_DIST    = 140;
  const REVEAL_RADIUS = 200;

  function particleIsDark() {
    return document.documentElement.classList.contains('dark-mode');
  }

  function initParticles() {
    const count = window.innerWidth <= 640 ? 40 : 80;
    const w = cssW || heroSection.offsetWidth;
    const h = cssH || heroSection.offsetHeight;
    particles = Array.from({ length: count }, () => {
      const x0 = Math.random() * w;
      const y0 = Math.random() * h;
      return {
        x0, y0, x: x0, y: y0,
        phase:  Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        freq:   0.00018 + Math.random() * 0.00018,
        amp:    10 + Math.random() * 18,
        ampY:   8  + Math.random() * 16,
      };
    });
  }

  let cssW = 0, cssH = 0;

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    cssW = heroSection.offsetWidth;
    cssH = heroSection.offsetHeight;
    canvas.width  = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width  = cssW + 'px';
    canvas.style.height = cssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function drawFrame() {
    ctx.clearRect(0, 0, cssW, cssH);
    if (mouse.x === null) {
      requestAnimationFrame(drawFrame);
      return;
    }

    const dark    = particleIsDark();
    const dotRgb  = dark ? '255,255,255' : '10,10,10';
    const lineRgb = dotRgb;
    const t = Date.now();

    particles.forEach(p => {
      p.x = p.x0 + Math.sin(t * p.freq + p.phase)  * p.amp;
      p.y = p.y0 + Math.cos(t * p.freq + p.phaseY) * p.ampY;
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      p.prox   = d < REVEAL_RADIUS ? 1 - d / REVEAL_RADIUS : 0;
    });

    // Particle-to-particle connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const proxAlpha = Math.min(a.prox, b.prox);
        if (proxAlpha <= 0) continue;
        const dx   = a.x - b.x;
        const dy   = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${lineRgb},${proxAlpha * (1 - dist / MAX_DIST) * 0.35})`;
          ctx.lineWidth   = 1;
          ctx.stroke();
        }
      }
    }

    // Cursor-to-particle connections
    particles.forEach(p => {
      if (p.prox <= 0) return;
      const dx   = p.x - mouse.x;
      const dy   = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MAX_DIST) {
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `rgba(${lineRgb},${p.prox * (1 - dist / MAX_DIST) * 0.4})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
      }
    });

    // Particles
    particles.forEach(p => {
      if (p.prox <= 0) return;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${dotRgb},${p.prox * 0.65})`;
      ctx.fill();
    });

    // Cursor node
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${dotRgb},0.7)`;
    ctx.fill();

    requestAnimationFrame(drawFrame);
  }

  heroSection.addEventListener('mousemove', e => {
    const rect = heroSection.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  heroSection.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();
  drawFrame();
}
