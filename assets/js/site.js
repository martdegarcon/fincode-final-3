(function () {
  function enhanceButtons() {
    document.querySelectorAll('.btn').forEach(function (btn) {
      if (btn.dataset.roll === '1') return;
      btn.dataset.roll = '1';
      btn.classList.add('btn-roll');

      var icon = btn.querySelector('.btn-icon');
      var label = document.createElement('span');
      label.className = 'btn-roll-text';
      var track = document.createElement('span');
      track.className = 'btn-roll-track';
      var line1 = document.createElement('span');
      line1.className = 'btn-roll-line';

      var nodes = Array.prototype.slice.call(btn.childNodes);
      nodes.forEach(function (node) {
        if (node === icon) return;
        line1.appendChild(node);
      });

      if (!line1.textContent.trim()) {
        line1.textContent = btn.getAttribute('aria-label') || 'Подробнее';
      }

      var line2 = line1.cloneNode(true);
      line2.setAttribute('aria-hidden', 'true');
      track.appendChild(line1);
      track.appendChild(line2);
      label.appendChild(track);

      if (icon) btn.insertBefore(label, icon);
      else btn.appendChild(label);
    });
  }

  function initHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;
    header.classList.remove('theme-dark');
    header.classList.add('theme-light');

    var more = header.querySelector('.header-more');
    if (more) {
      document.addEventListener('click', function (e) {
        if (!more.open) return;
        if (!more.contains(e.target)) more.open = false;
      });
      more.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function () { more.open = false; });
      });
    }
  }

  function resolveAsset(path) {
    var scripts = document.querySelectorAll('script[src*="site.js"]');
    var src = scripts.length ? scripts[scripts.length - 1].getAttribute('src') : 'assets/js/site.js';
    return src.replace(/js\/site\.js.*$/, path);
  }

  function isLeadTrigger(el) {
    if (!el || el.closest('.lead-modal') || el.closest('.js-page-lead')) return false;
    if (el.classList.contains('js-lead') || el.hasAttribute('data-lead')) return true;
    if (el.classList.contains('header-link')) {
      if (el.hasAttribute('data-lead') || el.classList.contains('js-lead')) return true;
      var href = el.getAttribute('href') || '';
      return href === '#' || href === '' || href === '#lead';
    }
    if (!el.classList.contains('btn')) return false;
    var href = el.getAttribute('href') || '';
    if (!href || href === '#' || href === '#lead') return true;
    if (href.charAt(0) === '#' && href.length > 1) return false;
    return false;
  }

  function initLeadPopup() {
    if (document.getElementById('lead-overlay')) return;

    var maxUrl = 'https://max.ru/u/f9LHodD0cOKukeNHSXdxLxM9Wrr4xsGZY-c5UIShMtePbgb7JvgmuJ8rCWo';
    var overlay = document.createElement('div');
    overlay.id = 'lead-overlay';
    overlay.className = 'lead-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<div class="lead-modal" role="dialog" aria-modal="true" aria-labelledby="lead-title">' +
        '<button type="button" class="lead-close" aria-label="Закрыть">&times;</button>' +
        '<h2 id="lead-title">Оставить заявку</h2>' +
        '<p class="lead-sub">Оставьте контакты — перезвоним и разберём ваш запрос.</p>' +
        '<form class="lead-form" novalidate>' +
          '<label>Имя<input type="text" name="name" placeholder="Как к вам обращаться" required></label>' +
          '<label>Телефон<input type="tel" name="phone" placeholder="+7 (___) ___-__-__" required></label>' +
          '<label>Комментарий<textarea name="comment" placeholder="Что вас интересует"></textarea></label>' +
          '<label class="lead-check">' +
            '<input type="checkbox" name="consent" required>' +
            '<span>Согласен(на) на <a href="#" target="_blank" rel="noopener">обработку персональных данных</a> и с <a href="#" target="_blank" rel="noopener">политикой конфиденциальности</a></span>' +
          '</label>' +
          '<button type="submit" class="btn btn-primary btn-wide font-inter"><span class="fw5">Отправить</span><span class="btn-icon"><img src="' + resolveAsset('ui/arrow-up-right.svg') + '" alt=""></span></button>' +
        '</form>' +
        '<div class="lead-success">' +
          '<h3>Заявка отправлена</h3>' +
          '<p>Скоро свяжемся с вами.</p>' +
        '</div>' +
        '<div class="lead-max">' +
          '<div class="lead-max-text">Или напишите напрямую в Max — ответим быстрее</div>' +
          '<a class="lead-max-link" href="' + maxUrl + '" target="_blank" rel="noopener">' +
            '<img src="' + resolveAsset('ui/social-max.svg') + '" alt="">' +
            '<span>Написать в Max</span>' +
          '</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    var form = overlay.querySelector('.lead-form');
    var success = overlay.querySelector('.lead-success');
    var maxBlock = overlay.querySelector('.lead-max');
    var title = overlay.querySelector('#lead-title');
    var closeBtn = overlay.querySelector('.lead-close');
    var consentLabel = overlay.querySelector('.lead-check');

    function openLead(topic) {
      title.textContent = topic || 'Оставить заявку';
      form.classList.remove('is-done');
      success.classList.remove('is-show');
      if (maxBlock) maxBlock.classList.remove('is-done');
      if (consentLabel) consentLabel.classList.remove('is-error');
      form.reset();
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lead-open');
      var first = form.querySelector('input');
      if (first) setTimeout(function () { first.focus(); }, 50);
    }

    function closeLead() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lead-open');
    }

    closeBtn.addEventListener('click', closeLead);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLead();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeLead();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var consent = form.consent && form.consent.checked;
      if (consentLabel) consentLabel.classList.toggle('is-error', !consent);
      if (!name || !phone || !consent) return;
      form.classList.add('is-done');
      if (maxBlock) maxBlock.classList.add('is-done');
      success.classList.add('is-show');
    });

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('a, button');
      if (!trigger || !isLeadTrigger(trigger)) return;
      e.preventDefault();
      var topic = trigger.getAttribute('data-lead') || '';
      if (!topic) {
        var txt = (trigger.textContent || '').replace(/\s+/g, ' ').trim();
        if (/консультац/i.test(txt)) topic = 'Консультация';
        else if (/книг/i.test(txt)) topic = 'Купить книгу';
        else if (/глав/i.test(txt)) topic = 'Купить главу';
        else if (/сет|заказ/i.test(txt)) topic = 'Заказать сет';
        else if (/услуг/i.test(txt)) topic = 'Заявка на услугу';
        else topic = 'Оставить заявку';
      }
      openLead(topic);
    });

    enhanceButtons();
    window.openLeadPopup = openLead;
    window.closeLeadPopup = closeLead;
  }

  function initPageLeadForm() {
    var form = document.querySelector('.js-page-lead');
    if (!form) return;
    var done = form.querySelector('.lead-form-done');
    var consentLabel = form.querySelector('.lead-check');
    var cats = form.querySelector('.lead-cats');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name && form.name.value.trim();
      var phone = form.phone && form.phone.value.trim();
      var city = form.city && form.city.value.trim();
      var consent = form.consent && form.consent.checked;
      var checkedCats = form.querySelectorAll('input[name="category"]:checked');
      if (consentLabel) consentLabel.classList.toggle('is-error', !consent);
      if (cats) cats.classList.toggle('is-error', !checkedCats.length);
      if (!name || !phone || !city || !consent || !checkedCats.length) return;
      form.querySelectorAll('input, select, button, textarea').forEach(function (el) {
        if (el.type !== 'hidden') el.disabled = true;
      });
      if (done) done.hidden = false;
    });
  }

  function initPurchaseTabs() {
    /* Tabs removed: header quick links scroll to deal cards directly. */
    document.querySelectorAll('[data-tab-open]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('data-tab-open');
        var map = { buy: 'purchase-buy', rent: 'purchase-rent', sale: 'purchase-sale' };
        var target = document.getElementById(map[id] || '') || document.getElementById('purchase');
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function initTechFilters() {
    var filters = document.querySelectorAll('.tech-filter');
    var cards = document.querySelectorAll('.tech-card');
    if (!filters.length || !cards.length) return;
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.getAttribute('data-filter') || 'all';
        filters.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
        cards.forEach(function (card) {
          var type = card.getAttribute('data-type') || '';
          var types = type.split(/\s+/);
          var show = f === 'all' || types.indexOf(f) !== -1;
          card.classList.toggle('is-filtered-out', !show);
        });
      });
    });
  }

  function initGsap() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (!document.body.classList.contains('page-home')) return;

    gsap.registerPlugin(ScrollTrigger);

    var heroCards = document.querySelectorAll('.hero-card');
    if (heroCards.length) {
      gsap.from(heroCards, {
        y: 36,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out'
      });
    }

    gsap.utils.toArray('.hero-kicker, .hero-title, .hero-lead, .hero-trust, .hero-actions').forEach(function (el, i) {
      gsap.from(el, {
        y: 28,
        opacity: 0,
        duration: 0.85,
        delay: 0.12 + i * 0.05,
        ease: 'power3.out'
      });
    });

    gsap.utils.toArray('.section').forEach(function (section) {
      gsap.from(section, {
        y: 56,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    });

    [
      ['.chapter-tile', 0.03],
      ['.service-card', 0.04],
      ['.pack-card', 0.06],
      ['.zone-card', 0.04],
      ['.apt-set', 0.06]
    ].forEach(function (pair) {
      var items = document.querySelectorAll(pair[0]);
      if (!items.length) return;
      gsap.from(items, {
        y: 20,
        opacity: 0,
        duration: 0.55,
        stagger: pair[1],
        ease: 'power2.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: items[0].closest('.section') || items[0].parentElement || items[0],
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });
  }

  function initInnerGsap() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (!document.body.classList.contains('page-inner')) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.page-hero-copy, .page-hero-media', {
      y: 36,
      opacity: 0,
      duration: 0.95,
      stagger: 0.1,
      ease: 'power3.out'
    });

    gsap.utils.toArray('.section').forEach(function (section) {
      gsap.from(section, {
        y: 48,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 88%' }
      });
    });
  }

  function initChapterNavScroll() {
    var active = document.querySelector('.chapter-rail-item.is-active');
    var rail = document.querySelector('.chapter-rail-nav');
    if (!active || !rail) return;
    if (window.matchMedia('(max-width:980px)').matches) {
      var left = active.offsetLeft - (rail.clientWidth - active.clientWidth) / 2;
      rail.scrollLeft = Math.max(0, left);
    } else {
      active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  enhanceButtons();
  initHeader();
  initLeadPopup();
  initPageLeadForm();
  initPurchaseTabs();
  initTechFilters();
  initChapterNavScroll();
  initGsap();
  initInnerGsap();
})();
