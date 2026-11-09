const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/TG7THXXVF6';
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const safe = fn => { try { fn(); } catch (e) { console.error(e); } };

  // hero entrance
  safe(() => {
    $$('.band i').forEach((b, i) => b.style.setProperty('--i', i));
    $$('.hero__title .w > span').forEach((s, i) => s.style.setProperty('--i', i));
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));
  });
  setTimeout(() => root.classList.add('ready'), 1500);

  // sticky bar
  safe(() => {
    const bar = $('#bar'), hero = $('#top');
    const f = () => bar.classList.toggle('show', hero.getBoundingClientRect().bottom < 80);
    addEventListener('scroll', f, { passive: true }); f();
  });

  // slow crossfade
  safe(() => {
    const s = $$('.slide'); if (reduce || s.length < 2) return;
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      s[i].classList.remove('on'); i = (i + 1) % s.length; s[i].classList.add('on');
    }, 6000);
  });

  // reveal (rAF on scroll, with stagger inside a group)
  safe(() => {
    const els = $$('[data-r]');
    els.forEach(el => {
      const sibs = $$('[data-r]', el.parentElement).filter(x => x.parentElement === el.parentElement);
      el.style.setProperty('--d', (Math.max(0, sibs.indexOf(el)) * 0.08) + 's');
    });
    let tick = false;
    const check = () => {
      tick = false;
      const vh = innerHeight;
      els.forEach(el => { if (!el.classList.contains('in') && el.getBoundingClientRect().top < vh * 0.94) el.classList.add('in'); });
    };
    const onS = () => { if (!tick) { tick = true; requestAnimationFrame(check); } };
    addEventListener('scroll', onS, { passive: true }); addEventListener('resize', onS);
    check(); setTimeout(check, 300);
  });

  // calc
  safe(() => {
    const M = $('#cM'), Y = $('#cY'), R = $('#cR'), N = $('#cName');
    const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽';
    const yw = n => n + (n % 10 === 1 && n !== 11 ? ' год' : (n % 10 >= 2 && n % 10 <= 4 && (n < 10 || n > 20)) ? ' года' : ' лет');
    const rows = $('#rows'), sum = $('#sum'), txt = $('#sumTxt'), st = $('#stamp');
    let shown = 387000, raf;
    const tween = to => {
      cancelAnimationFrame(raf);
      const from = shown, t0 = performance.now();
      const step = t => {
        const p = Math.min(1, (t - t0) / (reduce ? 1 : 500));
        shown = from + (to - from) * (1 - Math.pow(1 - p, 3));
        sum.textContent = fmt(shown);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const render = () => {
      const m = +M.value, y = +Y.value, rate = +R.value / 100 / 12;
      $('#oM').textContent = fmt(m); $('#oY').textContent = yw(y); $('#oR').textContent = R.value + ' %';
      let bal = 0, html = '';
      for (let yr = 1; yr <= y; yr++) {
        for (let k = 0; k < 12; k++) bal = (bal + m) * (1 + rate);
        html += `<tr class="new" style="--i:${yr - 1}"><td>${yr}</td><td>${fmt(m * 12)}</td><td>${fmt(m * 12 * yr)}</td><td>${fmt(bal)}</td></tr>`;
      }
      rows.innerHTML = html;
      const paid = m * 12 * y, name = N.value.trim();
      $('#cap').textContent = name ? 'Записи по счёту: ' + name : 'Записи по счёту';
      txt.textContent = `${name ? name + ', при' : 'При'} взносе ${fmt(m)} в месяц за ${yw(y)} ваших денег будет ${fmt(paid)}. Расчётный остаток при допущении ${R.value} % годовых; рост за счёт процента — ${fmt(Math.max(0, bal - paid))}.`;
      tween(bal);
    };
    [M, Y, R, N].forEach(e => e.addEventListener('input', render));
    [M, Y, R].forEach(e => e.addEventListener('change', () => {
      st.classList.remove('hit'); void st.getBoundingClientRect(); st.classList.add('hit');
    }));
    render();
  });

  // carousel
  safe(() => {
    const tr = $('#track'), bar = $('#progBar');
    const prog = () => {
      const max = tr.scrollWidth - tr.clientWidth, p = max > 0 ? tr.scrollLeft / max : 0;
      const w = bar.parentElement.clientWidth * 0.8;
      bar.style.marginLeft = (p * w) + 'px';
    };
    tr.addEventListener('scroll', prog, { passive: true }); prog();
    const step = () => tr.firstElementChild.getBoundingClientRect().width + 32;
    $('#prev').addEventListener('click', () => tr.scrollBy({ left: -step(), behavior: 'smooth' }));
    $('#next').addEventListener('click', () => tr.scrollBy({ left: step(), behavior: 'smooth' }));
    let down = false, sx = 0, sl = 0;
    tr.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = tr.scrollLeft; tr.style.scrollSnapType = 'none'; tr.style.cursor = 'grabbing'; });
    addEventListener('pointermove', e => { if (down) tr.scrollLeft = sl - (e.clientX - sx); });
    addEventListener('pointerup', () => { if (!down) return; down = false; tr.style.scrollSnapType = ''; tr.style.cursor = ''; });
  });

  // tier buttons set the form select
  $$('[data-tier]').forEach(a => a.addEventListener('click', () => { const s = $('#tierSel'); if (s) s.value = a.dataset.tier; }));

  // phone mask (only when input looks like a phone)
  $$('input[type="tel"]').forEach(input => {
    input.addEventListener('input', e => {
      const raw = e.target.value;
      if (/[a-zA-Zа-яА-Я@_]/.test(raw)) return;
      let v = raw.replace(/\D/g, '');
      if (!v) { e.target.value = ''; return; }
      if (v[0] === '8') v = '7' + v.slice(1);
      if (v[0] !== '7') v = '7' + v;
      v = v.slice(0, 11);
      let out = '+7';
      if (v.length > 1) out += ' (' + v.slice(1, 4);
      if (v.length >= 4) out += ') ' + v.slice(4, 7);
      if (v.length >= 7) out += '-' + v.slice(7, 9);
      if (v.length >= 9) out += '-' + v.slice(9, 11);
      e.target.value = out;
    });
  });

  // form
  const form = $('#leadForm');
  form && form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]'), orig = btn.textContent;
    const payload = {}; new FormData(form).forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    if (!payload.name || !payload.phone) { btn.textContent = 'Заполните имя и контакт'; setTimeout(() => btn.textContent = orig, 2500); return; }
    payload.comment = 'Тариф: ' + payload.tier;
    btn.disabled = true; btn.textContent = 'Отправляем...';
    try {
      const r = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      btn.textContent = 'Заявка отправлена'; form.reset();
    } catch (err) { console.error(err); btn.textContent = 'Ошибка, попробуйте ещё раз'; }
    finally { setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3000); }
  });
})();
