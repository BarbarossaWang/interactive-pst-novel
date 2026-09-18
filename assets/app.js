/* ============================================================
   Planescape: Torment 精读站点 — 交互逻辑（无依赖，支持 file:// 打开）
   ============================================================ */
(function () {
  'use strict';

  var REG = window.PST_CHAPTERS = window.PST_CHAPTERS || {};

  /* ---------------- 工具 ---------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function store(key, val) {
    try {
      if (val === undefined) { return localStorage.getItem(key); }
      localStorage.setItem(key, val);
    } catch (e) { /* file:// 下的隐私模式等 */ }
    return null;
  }
  function readJSON(key, dflt) {
    try { return JSON.parse(store(key) || JSON.stringify(dflt)); } catch (e) { return dflt; }
  }

  /* ---------------- 主题 / 显示偏好 ---------------- */
  var THEME_BG = { light: '#f4f6f8', dark: '#12161c' };
  function syncThemeColor(t) {
    var m = document.getElementById('theme-color');
    if (m) { m.setAttribute('content', THEME_BG[t] || THEME_BG.light); }
  }
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    syncThemeColor(t);
    store('pst:theme', t);
  }
  function initTheme() {
    var t = store('pst:theme');
    if (!t) { t = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
    setTheme(t);
    if (window.matchMedia) {
      var mq = matchMedia('(prefers-color-scheme: dark)');
      var onChange = function (e) {
        if (!store('pst:theme')) { setTheme(e.matches ? 'dark' : 'light'); }
      };
      if (mq.addEventListener) { mq.addEventListener('change', onChange); }
      else if (mq.addListener) { mq.addListener(onChange); }
    }
  }
  function toggleTheme() {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  }
  function initPrefs() {
    ['hide-zh', 'hide-notes', 'hide-hl'].forEach(function (cls) {
      if (store('pst:pref:' + cls) === '1') { document.body.classList.add(cls); }
    });
    var fs = parseInt(store('pst:fs') || '17', 10);
    document.documentElement.style.setProperty('--fs', fs + 'px');
  }
  function setPref(cls, on) {
    document.body.classList.toggle(cls, on);
    store('pst:pref:' + cls, on ? '1' : '0');
  }

  /* ---------------- 高亮 ---------------- */
  function buildMatcher(words) {
    var keys = words.filter(Boolean).sort(function (a, b) { return b.length - a.length; });
    if (!keys.length) { return null; }
    var parts = keys.map(function (k) {
      var body = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var pre = /^[\w]/.test(k) ? '\\b' : '';
      var post = /[\w]$/.test(k) ? '\\b' : '';
      return pre + body + post;
    });
    return new RegExp('(' + parts.join('|') + ')', 'gi');
  }

  function markup(text, re, lookup) {
    if (!re) { return esc(text); }
    var out = '', last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      out += esc(text.slice(last, m.index));
      var entry = lookup[m[0].toLowerCase()];
      if (entry) {
        var cls = /\s/.test(entry.w) ? 'ph' : 'k';
        out += '<span class="' + cls + '" data-k="' + esc(m[0].toLowerCase()) + '">' + esc(m[0]) + '</span>';
      } else {
        out += esc(m[0]);
      }
      last = m.index + m[0].length;
      if (m.index === re.lastIndex) { re.lastIndex++; }
    }
    out += esc(text.slice(last));
    return out;
  }

  /* ---------------- 点词查义 ---------------- */
  var openGloss = null, openWord = null;
  function closeGloss() {
    if (openGloss && openGloss.parentNode) { openGloss.parentNode.removeChild(openGloss); }
    if (openWord) { openWord.classList.remove('active'); }
    openGloss = openWord = null;
  }
  function wireGloss(lookup) {
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('.k, .ph') : null;
      if (!t || document.body.classList.contains('hide-hl')) { return; }
      if (!lookup[t.dataset.k]) { return; }
      if (openWord === t) { closeGloss(); return; }
      closeGloss();
      var v = lookup[t.dataset.k];
      var g = document.createElement('span');
      g.className = 'gloss';
      g.innerHTML = '<b>' + esc(v.w) + '</b> ' +
        (v.p ? '<span class="meta">' + esc(v.p) + '</span> ' : '') +
        '<span class="meta">' + esc(v.t || '') + '</span> ' + esc(v.z);
      t.parentNode.insertBefore(g, t.nextSibling);
      t.classList.add('active');
      openGloss = g; openWord = t;
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeGloss(); } });
  }

  /* ---------------- 朗读 ---------------- */
  function speak(text, btn) {
    if (!('speechSynthesis' in window)) { return; }
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.92;
    var old = btn.textContent;
    btn.textContent = '⏹';
    u.onend = u.onerror = function () { btn.textContent = old; };
    speechSynthesis.speak(u);
  }

  /* ---------------- 进度 ---------------- */
  function Progress(slug, total) {
    var key = 'pst:progress:' + slug;
    var done = readJSON(key, []);
    return {
      has: function (i) { return done.indexOf(i) >= 0; },
      list: function () { return done.slice(); },
      toggle: function (i) {
        var k = done.indexOf(i);
        if (k >= 0) { done.splice(k, 1); } else { done.push(i); }
        store(key, JSON.stringify(done));
        return done.indexOf(i) >= 0;
      },
      count: function () { return done.length; },
      total: total,
      reset: function () { done = []; store(key, JSON.stringify(done)); }
    };
  }

  /* ---------------- 章节页渲染 ---------------- */
  function renderChapter(slug) {
    var ch = REG[slug];
    if (!ch) { return; }
    document.title = ch.title + ' · ' + (ch.titleZh || '') + ' · 精读';

    /* 词汇查找表 */
    var lookup = {};
    (ch.vocab || []).forEach(function (v) { lookup[String(v.w).toLowerCase()] = v; });

    var prog = Progress(slug, ch.paras.length);

    /* --- 段落 --- */
    var host = $('#reader');
    var tocHost = $('#toc-list');
    var frag = document.createDocumentFragment();
    var tocFrag = document.createDocumentFragment();

    ch.paras.forEach(function (p, idx) {
      var isDivider = /^(\*\s*){3,}$/.test(String(p.en).trim());
      var art = document.createElement('article');
      art.className = 'para' + (isDivider ? ' divider' : '');
      art.id = 'p' + p.n;
      art.dataset.i = idx;
      if (isDivider) {
        art.innerHTML = '<div class="para-head"><span class="num">段 ' +
          String(p.n).padStart(3, '0') + '</span></div><p class="en" style="text-align:center">* * *</p>';
        frag.appendChild(art);
        var ad = document.createElement('a');
        ad.href = '#p' + p.n;
        ad.dataset.target = 'p' + p.n;
        ad.innerHTML = '<span class="n">' + p.n + '</span><span>场景分隔</span>';
        tocFrag.appendChild(ad);
        return;
      }
      var re = buildMatcher((p.vocab || []).map(function (v) { return v.w; }));
      art.innerHTML =
        '<div class="para-head">' +
          '<span class="num">段 ' + String(p.n).padStart(3, '0') + '</span>' +
          '<button class="icon spk" title="朗读本段英文">🔊</button>' +
          '<button class="icon done" title="标记为已掌握">✓ 已掌握</button>' +
        '</div>' +
        '<p class="en">' + markup(p.en, re, lookup) + '</p>' +
        '<p class="zh">' + esc(p.zh || '（待翻译）') + '</p>' +
        ((p.notes && p.notes.length)
          ? '<div class="notes">' + p.notes.map(function (n) { return '<div class="note">' + n + '</div>'; }).join('') + '</div>'
          : '');
      frag.appendChild(art);

      var a = document.createElement('a');
      a.href = '#p' + p.n;
      a.dataset.target = 'p' + p.n;
      a.innerHTML = '<span class="n">' + p.n + '</span><span>' +
        esc(String(p.zh || p.en).slice(0, 16)) + '</span>';
      tocFrag.appendChild(a);
    });
    host.appendChild(frag);
    if (tocHost) { tocHost.appendChild(tocFrag); }

    wireGloss(lookup);

    /* --- 逐段朗读 --- */
    host.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.spk') : null;
      if (!b) { return; }
      var art = b.closest('.para');
      speak(ch.paras[+art.dataset.i].en, b);
    });

    /* --- 已掌握 --- */
    function paintProgress() {
      var n = 0;
      $$('.para', host).forEach(function (el, i) {
        var on = prog.has(i);
        if (on) { n++; }
        el.classList.toggle('done', on);
        var b = $('.done', el);
        if (b) { b.classList.toggle('on', on); }
      });
      $$('#toc-list a').forEach(function (a, i) { a.classList.toggle('done', prog.has(i)); });
      var txt = $('#p-text'), bar = $('#p-bar');
      if (txt) { txt.textContent = '已掌握 ' + n + ' / ' + ch.paras.length; }
      if (bar) { bar.style.width = (n / ch.paras.length * 100) + '%'; }
      ['#p-text2', '#p-bar2'].forEach(function (s, k) {
        var el = $(s);
        if (!el) { return; }
        if (k === 0) { el.textContent = n + ' / ' + ch.paras.length; }
        else { el.style.width = (n / ch.paras.length * 100) + '%'; }
      });
    }
    host.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.done') : null;
      if (!b) { return; }
      prog.toggle(+b.closest('.para').dataset.i);
      paintProgress();
    });
    var resetBtn = $('#p-reset');
    if (resetBtn) { resetBtn.addEventListener('click', function () { prog.reset(); paintProgress(); }); }
    paintProgress();

    /* --- 目录滚动高亮 --- */
    if (tocHost && 'IntersectionObserver' in window) {
      var links = {};
      $$('#toc-list a').forEach(function (a) { links[a.dataset.target] = a; });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var a = links[en.target.id];
          if (!a) { return; }
          if (en.isIntersecting) {
            $$('#toc-list a.active').forEach(function (x) { x.classList.remove('active'); });
            a.classList.add('active');
            if (a.offsetTop < tocHost.scrollTop || a.offsetTop > tocHost.scrollTop + tocHost.clientHeight - 40) {
              tocHost.scrollTop = a.offsetTop - tocHost.clientHeight / 2;
            }
          }
        });
      }, { rootMargin: '-70px 0px -70% 0px' });
      $$('.para', host).forEach(function (el) { io.observe(el); });
    }

    /* --- 词汇表 --- */
    var vbody = $('#vtable tbody');
    if (vbody) {
      (ch.vocab || []).forEach(function (v) {
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td class="w" data-label="词条">' + (/\s/.test(v.w) ? '<span class="tag">短语</span>' : '') + esc(v.w) + '</td>' +
          '<td class="p" data-label="音标">' + esc(v.p || '') + '</td>' +
          '<td class="t" data-label="词性">' + esc(v.t || '') + '</td>' +
          '<td data-label="释义">' + esc(v.z) + '</td>' +
          '<td class="src" data-label="出处">' + (v.n ? '<a href="#p' + v.n + '">段 ' + v.n + '</a>' : '') + '</td>';
        vbody.appendChild(tr);
      });
    }

    /* --- 语法点索引 --- */
    var ghost = $('#grammar');
    if (ghost) {
      ch.paras.forEach(function (p) {
        (p.notes || []).forEach(function (n) {
          var d = document.createElement('div');
          d.className = 'note-card';
          d.innerHTML = '<a class="from" href="#p' + p.n + '">段 ' + p.n + '</a>' + n;
          ghost.appendChild(d);
        });
      });
    }

    /* --- 生词表导出（CSV，可导入 Anki/Excel） --- */
    var exp = $('#vexport');
    if (exp) {
      exp.addEventListener('click', function () {
        var rows = [['word', 'phonetic', 'pos', 'meaning', 'paragraph']];
        (ch.vocab || []).forEach(function (v) {
          rows.push([v.w, v.p || '', v.t || '', v.z, v.n || '']);
        });
        var csv = rows.map(function (r) {
          return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
        }).join('\r\n');
        var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = slug + '-vocab.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      });
    }

    /* --- 搜索框 --- */
    function wireSearch(inputSel, rowSel) {
      var inp = $(inputSel);
      if (!inp) { return; }
      inp.addEventListener('input', function () {
        var q = inp.value.trim().toLowerCase();
        $$(rowSel).forEach(function (row) {
          row.classList.toggle('hide', !!q && row.textContent.toLowerCase().indexOf(q) < 0);
        });
      });
    }
    wireSearch('#vsearch', '#vtable tbody tr');
    wireSearch('#gsearch', '#grammar .note-card');
    wireSearch('#toc-search', '#toc-list a');
  }

  /* ---------------- 目录页 ---------------- */
  function renderIndex() {
    var host = $('#chapter-cards');
    if (!host) { return; }
    var totP = 0, totV = 0, totN = 0, totDone = 0;
    Object.keys(REG).forEach(function (slug) {
      var ch = REG[slug];
      var done = readJSON('pst:progress:' + slug, []).length;
      var pct = ch.paras.length ? Math.round(done / ch.paras.length * 100) : 0;
      totP += ch.paras.length; totV += (ch.vocab || []).length; totDone += done;
      (ch.paras || []).forEach(function (p) { totN += (p.notes || []).length; });
      var el = document.createElement('div');
      el.className = 'card';
      el.innerHTML =
        '<div class="zh">' + esc(ch.titleZh || '') + '</div>' +
        '<h3>' + esc(ch.title) + '</h3>' +
        '<p>' + esc(ch.blurb || '') + '</p>' +
        '<div class="meta"><span>' + esc(ch.num || '') + '</span>' +
        '<span>' + ch.paras.length + ' 段</span>' +
        '<span>' + (ch.vocab || []).length + ' 词条</span>' +
        '<span>已掌握 ' + done + ' / ' + ch.paras.length + '</span></div>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="go"><a class="btn" href="' + slug + '.html">开始精读 →</a></div>';
      host.appendChild(el);
    });
    var stats = $('#site-stats');
    if (stats) {
      stats.textContent = '共 ' + Object.keys(REG).length + ' 章 · ' + totP + ' 段对照精读 · ' +
        totV + ' 条重点词汇 · ' + totN + ' 条语法讲解 · 已掌握 ' + totDone + ' / ' + totP + ' 段';
    }
  }

  /* ---------------- 全局按钮 ---------------- */
  function wireToolbar() {
    var map = { '#t-zh': 'hide-zh', '#t-notes': 'hide-notes', '#t-hl': 'hide-hl' };
    Object.keys(map).forEach(function (sel) {
      var b = $(sel);
      if (!b) { return; }
      b.setAttribute('aria-pressed', document.body.classList.contains(map[sel]) ? 'false' : 'true');
      b.addEventListener('click', function () {
        var on = !document.body.classList.contains(map[sel]);
        setPref(map[sel], on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    });
    var up = $('#fs-up'), down = $('#fs-down'), th = $('#t-theme');
    function bump(d) {
      var cur = parseInt(store('pst:fs') || '17', 10) + d;
      cur = Math.max(14, Math.min(22, cur));
      store('pst:fs', String(cur));
      document.documentElement.style.setProperty('--fs', cur + 'px');
    }
    if (up) { up.addEventListener('click', function () { bump(1); }); }
    if (down) { down.addEventListener('click', function () { bump(-1); }); }
    if (th) { th.addEventListener('click', toggleTheme); }

    var tt = $('#toc-toggle');
    function setDrawer(open) {
      document.body.classList.toggle('toc-open', open);
      if (tt) { tt.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    }
    if (tt) { tt.addEventListener('click', function () { setDrawer(!document.body.classList.contains('toc-open')); }); }
    var close = $('#toc-close'), scrim = $('#scrim');
    if (close) { close.addEventListener('click', function () { setDrawer(false); }); }
    if (scrim) { scrim.addEventListener('click', function () { setDrawer(false); }); }
    /* 移动端：点目录项后自动收起抽屉 */
    var tocList = $('#toc-list');
    if (tocList) {
      tocList.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('a') && window.matchMedia('(max-width:900px)').matches) {
          setDrawer(false);
        }
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('toc-open')) { setDrawer(false); }
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) { return; }
      var k = e.key.toLowerCase();
      if (k === 't') { var a = $('#t-zh'); if (a) { a.click(); } }
      if (k === 'n') { var b = $('#t-notes'); if (b) { b.click(); } }
      if (k === 'h') { var c = $('#t-hl'); if (c) { c.click(); } }
      if (k === 'd') { toggleTheme(); }
    });
  }

  /* ---------------- 手机端辅助：工具条高度、短标签、回到顶部 ---------------- */
  var SHORT_LABELS = { 'toc-toggle': '☰ 目录', 't-zh': '译文', 't-notes': '注释', 't-hl': '高亮' };
  function applyShortLabels() {
    var small = window.matchMedia && window.matchMedia('(max-width:640px)').matches;
    Object.keys(SHORT_LABELS).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) { return; }
      if (el.dataset.long === undefined) { el.dataset.long = el.textContent; }
      var want = small ? SHORT_LABELS[id] : el.dataset.long;
      if (el.textContent !== want) { el.textContent = want; }
    });
  }

  function wireMobile() {
    var bar = $('.toolbar'), root = document.documentElement;
    function measure() {
      if (bar) { root.style.setProperty('--toolbar-h', Math.round(bar.getBoundingClientRect().height) + 'px'); }
      applyShortLabels();
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    if (window.ResizeObserver && bar) { new ResizeObserver(measure).observe(bar); }

    if (!document.body.dataset.chapter || document.body.dataset.chapter === 'index') { return; }
    var btn = document.createElement('button');
    btn.className = 'to-top';
    btn.type = 'button';
    btn.title = '回到顶部';
    btn.setAttribute('aria-label', '回到顶部');
    btn.textContent = '↑';
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(btn);
    var onScroll = function () { btn.classList.toggle('show', window.scrollY > 600); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    initTheme();
    initPrefs();
    wireToolbar();
    wireMobile();
    var page = document.body.dataset.chapter;
    if (page && page !== 'index') { renderChapter(page); } else { renderIndex(); }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
