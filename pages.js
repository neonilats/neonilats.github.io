/* =========================================
   FRISPES – pages.js
   Скрипти для сторінок: Workspace, Events, Contact, 404
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- BURGER MENU ---- */
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');

  burger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });


  /* ---- STICKY HEADER SHADOW ---- */
  const header = document.getElementById('header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      header.style.boxShadow = '0 2px 16px rgba(26,46,74,.12)';
    } else {
      header.style.boxShadow = 'none';
    }
  });


  /* ---- TOAST (повідомлення про успіх) ---- */
  const toast = document.getElementById('toast');

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }


  /* ---- MODAL WINDOWS ---- */
  // Кнопка з data-open="id" відкриває вікно з цим id.
  // Атрибут data-fill="name=value" одразу заповнює поле у формі.
  function openModal(id, fill) {
    const modal = document.getElementById(id);
    if (!modal) return;

    if (fill) {
      const parts = fill.split('=');
      const field = modal.querySelector('[name="' + parts[0] + '"]');
      if (field) {
        field.value = parts[1];
        field.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open]').forEach(button => {
    button.addEventListener('click', () => {
      openModal(button.dataset.open, button.dataset.fill);
    });
  });

  // Закриття: хрестик або клік по затемненому фону
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal || e.target.classList.contains('mx')) {
        closeModal(modal);
      }
    });
  });

  // Закриття клавішею Esc
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.open').forEach(closeModal);
    }
  });


  /* ---- FORM VALIDATION ---- */
  // Правила задаються в HTML: data-v="required,email" або data-v="min:3"
  function getError(rule, value) {
    const parts = rule.split(':');
    const name = parts[0];

    if (name === 'required' && value.trim() === '') {
      return 'Це поле обовʼязкове';
    }
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return 'Введіть коректний email';
    }
    if (name === 'min' && value.trim().length < Number(parts[1])) {
      return 'Мінімум ' + parts[1] + ' символів';
    }
    if (name === 'future') {
      const today = new Date(new Date().toDateString());
      if (!value || new Date(value) < today) {
        return 'Оберіть сьогоднішню або майбутню дату';
      }
    }
    return '';
  }

  function validateForm(form) {
    let isValid = true;

    form.querySelectorAll('[data-v]').forEach(input => {
      const wrapper = input.closest('.field');
      let message = '';

      input.dataset.v.split(',').forEach(rule => {
        if (message === '') {
          message = getError(rule, input.value);
        }
      });

      wrapper.classList.toggle('err', message !== '');
      wrapper.querySelector('.msg').textContent = message;

      if (message !== '') isValid = false;
    });

    return isValid;
  }

  document.querySelectorAll('form[data-form]').forEach(form => {
    // Після першої помилки перевіряємо поля одразу під час введення
    form.addEventListener('input', e => {
      if (e.target.closest('.field.err')) validateForm(form);
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateForm(form)) return;

      showToast(form.dataset.ok);
      form.reset();
      closeModal(form.closest('.modal'));
    });
  });

  // Мінімальна дата в усіх полях type="date" — сьогодні
  const todayStr = new Date().toISOString().slice(0, 10);
  document.querySelectorAll('input[type="date"]').forEach(input => {
    input.min = todayStr;
  });


  /* ---- BOOKING PRICE CALCULATOR (Workspace) ---- */
  const bookForm = document.getElementById('fmBook');

  if (bookForm) {
    const totalEl = document.getElementById('total');

    function calcTotal() {
      const price = Number(bookForm.space.selectedOptions[0].dataset.p);
      const hours = Math.max(1, Number(bookForm.hours.value) || 1);
      const seats = Math.max(1, Number(bookForm.seats.value) || 1);

      let total = price * hours * seats;
      let text = '';

      // Знижка 15% при бронюванні від 8 годин
      if (hours >= 8) {
        total = total * 0.85;
        text = ' (−15%)';
      }
      totalEl.textContent = '$' + total.toFixed(2) + text;
    }

    bookForm.addEventListener('input', calcTotal);
    bookForm.addEventListener('reset', () => setTimeout(calcTotal, 0));
    calcTotal();
  }


  /* ---- FILTER CHIPS (Events) ---- */
  document.querySelectorAll('[data-filter]').forEach(box => {
    const items = document.querySelectorAll(box.dataset.filter);
    const chips = box.querySelectorAll('.chip');

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        items.forEach(item => {
          const showAll = chip.dataset.f === 'all';
          item.hidden = !showAll && item.dataset.cat !== chip.dataset.f;
        });
      });
    });
  });


  /* ---- SWIPER (Events) ---- */
  const swiper = document.getElementById('swiper');

  if (swiper) {
    const track = swiper.querySelector('.swiper__track');
    const dotsBox = document.getElementById('swDots');
    const total = track.children.length;
    let current = 0;
    let timer;
    let startX = 0;

    // Створюємо крапки
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.addEventListener('click', () => goTo(i));
      dotsBox.appendChild(dot);
    }

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = 'translateX(-' + current * 100 + '%)';

      dotsBox.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });

      // Автоперемикання кожні 6 секунд
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), 6000);
    }

    document.getElementById('swPrev').addEventListener('click', () => goTo(current - 1));
    document.getElementById('swNext').addEventListener('click', () => goTo(current + 1));

    // Свайп пальцем
    swiper.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    swiper.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) < 40) return;
      goTo(dx < 0 ? current + 1 : current - 1);
    }, { passive: true });

    goTo(0);
  }


  /* ---- EVENT NAME IN REGISTRATION MODAL ---- */
  const eventName = document.getElementById('evName');

  document.querySelectorAll('[data-ev]').forEach(button => {
    button.addEventListener('click', () => {
      eventName.textContent = button.dataset.ev;
    });
  });


  /* ---- CHARACTER COUNTER (Contact) ---- */
  const textarea = document.getElementById('msgText');
  const counter = document.getElementById('cnt');

  if (textarea) {
    textarea.addEventListener('input', () => {
      counter.textContent = textarea.value.length + ' / 500';
    });
  }


  /* ---- FAQ ACCORDION (Contact) ---- */
  const faqItems = document.querySelectorAll('.acc__i');

  faqItems.forEach(item => {
    item.querySelector('.acc__q').addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');

      // Закриваємо всі
      faqItems.forEach(other => {
        other.classList.remove('open');
        other.querySelector('.acc__a').style.maxHeight = 0;
      });

      // Відкриваємо натиснутий (якщо він був закритий)
      if (!wasOpen) {
        const answer = item.querySelector('.acc__a');
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

});
