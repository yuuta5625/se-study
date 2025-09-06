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

// =========================
/* 天気アプリ（日本語地名OK：ジオコーディング→天気＋現在地対応） */
// =========================
(() => {
  const API_KEY = "84a212e7221718ce1d2a784483127e2c"; // ← あなたのキー
  const cityEl = document.getElementById("city");
  const btnEl  = document.getElementById("getWeather");
  const outEl  = document.getElementById("result");
  const btnGeo = document.getElementById("useGeoloc"); // ★ 追加
  if (!outEl) return; // 天気ページ以外では何もしない

  let reqSeq = 0;

  const show = (html) => {
    outEl.style.display = "block";
    outEl.innerHTML = html;
    outEl.firstElementChild?.classList.add("fade-in");
  };
  const renderError = (msg) => show(`<p class="error" role="alert" style="color:#c00;">${msg}</p>`);

  // 表示
  const render = (d) => {
    const icon = d.weather?.[0]?.icon
      ? `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`
      : "";
    const desc = d.weather?.[0]?.description || "";

    show(`
      <div class="weather-card">
        <div class="weather-top">
          <div class="weather-headings">
            <div class="city">${d.name}</div>
            <div class="desc">${desc}</div>
          </div>
          <div class="temp">${Math.round(d.main.temp)}<span class="unit">℃</span></div>
        </div>
        ${icon ? `<img class="weather-icon" src="${icon}" alt="${desc}">` : ""}
        <div class="weather-stats">
          <span class="stat">体感 ${Math.round(d.main.feels_like)}℃</span>
          <span class="stat">最高 ${Math.round(d.main.temp_max)}℃</span>
          <span class="stat">最低 ${Math.round(d.main.temp_min)}℃</span>
          <span class="stat">湿度 ${d.main.humidity}%</span>
          <span class="stat">風 ${Math.round(d.wind.speed)} m/s</span>
          ${d.clouds?.all != null ? `<span class="stat">雲量 ${d.clouds.all}%</span>` : ""}
          ${d.main?.pressure ? `<span class="stat">気圧 ${d.main.pressure} hPa</span>` : ""}
        </div>
      </div>
    `);
  };

  // 全角スペース等を軽く整える（日本語入力のケア）
  const normalizeInput = (s) =>
    s.replace(/\u3000/g, " ").replace(/\s+/g, " ").trim();

  // ★ 都市名から検索（既存）
  async function fetchWeather() {
    const raw = cityEl?.value ?? "";
    const q = normalizeInput(raw);
    if (!q) return renderError("都市名を入力してください（例: 東京 / 大阪 / 札幌）");

    const mySeq = ++reqSeq;
    show("検索中…");

    try {
      // 1) ジオコーディング
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${API_KEY}`;
      const geoRes = await fetch(geoUrl);
      const geo = await geoRes.json();
      if (mySeq !== reqSeq) return;

      if (!Array.isArray(geo) || geo.length === 0) {
        return renderError(`都市が見つかりませんでした：「${q}」`);
      }

      const { lat, lon, name, country, state } = geo[0];

      // 2) 天気
      const wxUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ja`;
      const wxRes = await fetch(wxUrl);
      const data = await wxRes.json();
      if (mySeq !== reqSeq) return;

      if (String(data.cod) === "200") {
        data.name = [name, state, country].filter(Boolean).join(", ");
        render(data);
      } else {
        renderError("天気情報の取得に失敗しました");
      }
    } catch (e) {
      if (mySeq !== reqSeq) return;
      console.error(e);
      renderError("エラーが発生しました");
    }
  }

  // ★ 追加：現在地から検索
  async function fetchWeatherByCoords(lat, lon) {
    const mySeq = ++reqSeq;
    show("現在地から取得中…");
    try {
      const wxUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ja`;
      const wxRes = await fetch(wxUrl);
      const data = await wxRes.json();
      if (mySeq !== reqSeq) return;

      if (String(data.cod) === "200") {
        render(data);
      } else {
        renderError("現在地の天気取得に失敗しました");
      }
    } catch (e) {
      if (mySeq !== reqSeq) return;
      console.error(e);
      renderError("現在地の取得でエラーが発生しました");
    }
  }

  // イベント登録
  btnEl?.addEventListener("click", fetchWeather, { passive: true });
  cityEl?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchWeather();
    }
  });

  // ★ 現在地ボタン（IIFEの中に入れる！）
  btnGeo?.addEventListener("click", () => {
    if (!navigator.geolocation) return renderError("この端末では位置情報が使えません");
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        console.error(err);
        renderError("位置情報の取得が拒否/失敗しました");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  });
})();
