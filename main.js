// =========================
// 挨拶ボタン
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("greetBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      alert("こんにちは！見に来てくれてありがとう！");
    });
  }
});

// =========================
/* ハンバーガーメニュー */
// =========================
(() => {
  const navToggle = document.querySelector(".nav-toggle");
  const globalNav = document.getElementById("global-nav");
  if (!navToggle || !globalNav) return;

  navToggle.addEventListener("click", () => {
    const isOpen = globalNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  globalNav.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      globalNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  const mq = window.matchMedia("(min-width: 769px)");
  mq.addEventListener?.("change", (e) => {
    if (e.matches) {
      globalNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
})();

// =========================
/* スムーススクロール（同一ページ内のみ） */
// =========================
(() => {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", `#${id}`);
    });
  });
})();


document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".contact-form");
  const status = document.getElementById("form-status");

  if (form && status) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);

      try {
        const res = await fetch(form.action, {
          method: form.method,
          body: data,
          headers: { Accept: "application/json" }
        });

        if (res.ok) {
          status.textContent = "✅ 送信ありがとうございました！";
          form.reset();
        } else {
          status.textContent = "⚠️ エラーが発生しました。もう一度お試しください。";
        }
      } catch {
        status.textContent = "⚠️ ネットワークエラーです。時間をおいてお試しください。";
      }
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".contact-form");
  const status = document.getElementById("form-status");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);

      try {
        const res = await fetch(form.action, {
          method: form.method,
          body: data,
          headers: { Accept: "application/json" }
        });

        if (res.ok) {
          // ✅ サンクスページへ
          window.location.href = "./thanks.html";
          return;
        }
        status && (status.textContent = "⚠️ エラーが発生しました。もう一度お試しください。");
      } catch {
        status && (status.textContent = "⚠️ ネットワークエラーです。時間をおいてお試しください。");
      }
    });
  }
});
// ==== ハンバーガー制御（ARIA対応） ====
(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('global-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // ナビ内リンクを踏んだら自動クローズ（SP想定）
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();
