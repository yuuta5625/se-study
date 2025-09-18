// weather.js（昼アイコン固定。背景は常にbackground.jpg。バッジや背景切替は無し）
document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "84a212e7221718ce1d2a784483127e2c";

  const cityEl = document.getElementById("city");
  const btnEl  = document.getElementById("getWeather");
  const outEl  = document.getElementById("result");
  const btnGeo = document.getElementById("useGeoloc");

  let reqSeq = 0;
  let composing = false;

  const show = (html) => {
    if (!outEl) return;
    outEl.style.display = "block";
    outEl.innerHTML = html;
    outEl.firstElementChild?.classList.add("fade-in");
  };
  const renderError = (msg) => show(`<p class="error" role="alert" style="color:#c00;">${msg}</p>`);
  const normalizeInput = (s) => s.replace(/\u3000/g, " ").replace(/\s+/g, " ").trim();

  // カード描画（昼アイコン固定）
  const render = (d) => {
    const w = d.weather?.[0];
    const desc = w?.description || "";
    const iconCode = w?.icon ? String(w.icon).replace(/n$/, "d") : "01d"; // 昼固定
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    const html = `
      <div class="weather-card">
        <div class="weather-top">
          <div class="weather-headings">
            <div class="city">${d.name}</div>
            <div class="desc">${desc}</div>
          </div>
          <div class="temp">${Math.round(d.main.temp)}<span class="unit">℃</span></div>
        </div>
        <div class="media" id="wx-media">
          <img class="weather-icon" src="${iconUrl}" alt="${desc}">
        </div>
        <div class="weather-stats" aria-label="詳細データ">
          <span class="stat"><span class="k">体感</span><span class="v">${Math.round(d.main.feels_like)}℃</span></span>
          <span class="stat"><span class="k">最高</span><span class="v">${Math.round(d.main.temp_max)}℃</span></span>
          <span class="stat"><span class="k">最低</span><span class="v">${Math.round(d.main.temp_min)}℃</span></span>
          <span class="stat"><span class="k">湿度</span><span class="v">${d.main.humidity}%</span></span>
          <span class="stat"><span class="k">風</span><span class="v">${Math.round(d.wind.speed)} m/s</span></span>
          ${d.clouds?.all != null ? `<span class="stat"><span class="k">雲量</span><span class="v">${d.clouds.all}%</span></span>` : ""}
          ${d.main?.pressure ? `<span class="stat"><span class="k">気圧</span><span class="v">${d.main.pressure} hPa</span></span>` : ""}
        </div>
      </div>
    `;
    show(html);
  };

  // ===== 取得 =====
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
      if (!geoRes.ok) return renderError(`位置情報エラー：${geo?.message ?? geoRes.status}`);
      if (!Array.isArray(geo) || geo.length === 0) return renderError(`都市が見つかりませんでした：「${q}」`);

      const { lat, lon, name, country, state } = geo[0];

      // 2) 天気
      const wxUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ja`;
      const wxRes = await fetch(wxUrl);
      const data = await wxRes.json();
      if (mySeq !== reqSeq) return;
      if (!wxRes.ok) return renderError(`天気APIエラー：${data?.message ?? wxRes.status}`);

      data.name = [name, state, country].filter(Boolean).join(", ");
      render(data);
    } catch (e) {
      if (mySeq !== reqSeq) return;
      console.error(e);
      renderError("エラーが発生しました");
    }
  }

  async function fetchWeatherByCoords(lat, lon) {
    const mySeq = ++reqSeq;
    show("現在地から取得中…");
    try {
      const wxUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ja`;
      const wxRes = await fetch(wxUrl);
      const data = await wxRes.json();
      if (mySeq !== reqSeq) return;
      if (!wxRes.ok) return renderError(`天気APIエラー：${data?.message ?? wxRes.status}`);
      render(data);
    } catch (e) {
      if (mySeq !== reqSeq) return;
      console.error(e);
      renderError("現在地の取得でエラーが発生しました");
    }
  }

  // ===== IME（日本語変換）Enter対策 =====
  cityEl?.addEventListener("compositionstart", () => { composing = true; });
  cityEl?.addEventListener("compositionend",   () => { composing = false; });
  cityEl?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (composing || e.isComposing || e.keyCode === 229) return;
      e.preventDefault();
      fetchWeather();
    }
  });

  // ===== イベント =====
  btnEl?.addEventListener("click", (e) => {
    e.preventDefault();
    if (composing) return;
    fetchWeather();
  });

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

  const form = document.getElementById("weather-form") || cityEl?.closest("form");
  form?.addEventListener("submit", (e) => {
    if (composing) { e.preventDefault(); return; }
    e.preventDefault();
    fetchWeather();
  });
});
