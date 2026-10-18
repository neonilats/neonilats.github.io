/* =========================================
   FRISPES – events-data.js
   Динамічний рендеринг сторінки Events з масиву об'єктів.
   Підключається ПЕРЕД pages.js: слайдер, фільтри та кнопки
   реєстрації створюються тут, а pages.js навішує на них логіку.
   ========================================= */

(function () {
  /* ---- ДАНІ ----
     Щоб додати подію, достатньо дописати ще один об'єкт у масив.
     featured: true  → подія потрапляє також у слайдер "Don't miss these events"
     image           → потрібне лише для подій зі featured: true */
  const EVENTS = [
    {
      id: 1,
      title: 'Перегляд Google I/O наживо',
      category: 'Технології',
      date: '2026-11-12',
      description: 'Дивіться основну презентацію на великому екрані разом із місцевими розробниками.',
      image: 'images/news1.webp',
      featured: true,
    },
    {
      id: 2,
      title: 'Мінімалістичний робочий простір для натхнення',
      category: 'Дизайн',
      date: '2026-11-18',
      description: 'Розмова про спокійні, продуктивні робочі місця та сесія запитань-відповідей наживо.',
      image: 'images/news2.webp',
      featured: true,
    },
    {
      id: 3,
      title: 'Продуктивність: віддалена робота проти офісу',
      category: 'Дискусії',
      date: '2026-11-25',
      description: 'Панельна дискусія: чи дійсно зростає продуктивність при роботі з дому?',
      image: 'images/news3.png',
      featured: true,
    },
    {
      id: 4,
      title: 'Воркшоп з ранкової рутини',
      category: 'Здоров’я',
      date: '2026-12-02',
      description: 'Практичні звички, які покращують настрій та фокус уваги.',
      image: 'images/news4.png',
      featured: true,
    },
    {
      id: 5,
      title: 'Як знайти свій коворкінг',
      category: 'Дискусії',
      date: '2026-12-09',
      description: '5+ порад щодо вибору зручного простору для роботи.',
      image: '',
      featured: false,
    },
  ];

  const MONTHS = ['СІЧ', 'ЛЮТ', 'БЕР', 'КВІ', 'ТРА', 'ЧЕР', 'ЛИП', 'СЕР', 'ВЕР', 'ЖОВ', 'ЛИС', 'ГРУ'];

  /* ---- ХЕЛПЕР: створення елемента ----
     textContent замість innerHTML, тому текст з даних не може
     виконати чужий HTML/JS. */
  function el(tag, props, children) {
    const node = document.createElement(tag);
    Object.keys(props || {}).forEach(key => {
      if (key === 'text') node.textContent = props[key];
      else if (key === 'class') node.className = props[key];
      else node.setAttribute(key, props[key]);
    });
    (children || []).forEach(child => node.appendChild(child));
    return node;
  }

  // "2026-11-12" → { day: '12', month: 'ЛИС' } (без new Date, щоб не зсувався часовий пояс)
  function splitDate(iso) {
    const [, m, d] = iso.split('-');
    return { day: d, month: MONTHS[Number(m) - 1] };
  }

  // Кнопка "Зареєструватися" - відкриває модалку m-reg і передає їй назву події
  function registerButton(event, cls) {
    return el('button', {
      class: 'btn ' + cls + ' btn--sm',
      type: 'button',
      'data-open': 'm-reg',
      'data-ev': event.title,
      text: 'Зареєструватися',
    });
  }

  /* ---- 1. СЛАЙДЕР (тільки featured) ---- */
  function renderSlides(events) {
    const track = document.getElementById('swTrack');
    if (!track) return;

    events.filter(e => e.featured).forEach(event => {
      track.appendChild(
        el('div', { class: 'slide' }, [
          el('img', { src: event.image, alt: event.title }),
          el('div', { class: 'slide__txt' }, [
            el('span', { class: 'tag', text: event.category }),
            el('h3', { text: event.title }),
            el('p', { text: event.description }),
            registerButton(event, 'btn--primary'),
          ]),
        ])
      );
    });
  }

  /* ---- 2. КНОПКИ-ФІЛЬТРИ (категорії беруться з даних) ---- */
  function renderFilters(events) {
    const box = document.getElementById('filters');
    if (!box) return;

    const categories = ['all'].concat(
      events.map(e => e.category).filter((c, i, arr) => arr.indexOf(c) === i)
    );

    categories.forEach((cat, i) => {
      box.appendChild(
        el('button', {
          class: 'chip' + (i === 0 ? ' active' : ''),
          type: 'button',
          'data-f': cat,
          text: cat === 'all' ? 'Усі' : cat,
        })
      );
    });
  }

  /* ---- 3. КАЛЕНДАР ПОДІЙ (відсортований за датою) ---- */
  function renderList(events) {
    const list = document.getElementById('eventList');
    if (!list) return;

    if (events.length === 0) {
      list.appendChild(el('p', { class: 'lead2', text: 'Поки що немає запланованих подій — заглядайте пізніше!' }));
      return;
    }

    events
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach(event => {
        const { day, month } = splitDate(event.date);
        list.appendChild(
          el('div', { class: 'ev', 'data-cat': event.category }, [
            el('time', { datetime: event.date }, [el('b', { text: day }), document.createTextNode(month)]),
            el('h3', { text: event.title }),
            el('p', { text: event.description }),
            registerButton(event, 'btn--ghost'),
          ])
        );
      });
  }

  renderSlides(EVENTS);
  renderFilters(EVENTS);
  renderList(EVENTS);
})();
