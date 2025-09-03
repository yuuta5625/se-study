document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("greetBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    alert("こんにちは！見に来てくれてありがとう！");
  });
});
// ハンバーガー開閉
const navToggle = document.querySelector('.nav-toggle');
const globalNav = document.getElementById('global-nav');

if (navToggle && globalNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = globalNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // メニュー内のリンクを押したら自動で閉じる
  globalNav.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      globalNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // 画面を広げたら（PC幅に戻ったら）強制的に閉じる
  const mq = window.matchMedia('(min-width: 769px)');
  mq.addEventListener?.('change', (e) => {
    if (e.matches) {
      globalNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}
// ナビのアンカーをスムーススクロール
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', `#${id}`);
  });
});
