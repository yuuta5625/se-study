(() => {
  // ===== 設定 =====
  const API_KEY = "84a212e7221718ce1d2a784483127e2c";

  // weather.html から見て 1つ上の階層に assets/
  const BG_BASE = "../assets/";

  // テーマ → 背景画像（まずは clear だけでもOK）
  const BG_MAP = {
    "wx-clear":   "clear.jpg",
    "wx-clouds":  "clouds.jpg",
    "wx-rain":    "rain.jpg",
    "wx-snow":    "snow.jpg",
    "wx-thunder": "thunder.jpg",
    "wx-mist":    "mist.jpg",
  };

  // ===== 対象要素 =====
  const cityEl = document.getElementById("city");
  const btnEl  = document.getElementById("getWeather");
  const outEl  = document.getElementById("result");
  const btnGeo = document.getElementById("useGeoloc");
  const bgEl   = document.getElementById("bg");
  if (!outEl) return;

  let reqSeq = 0;
  let composing = false;

  // ===== ヘルパー =====
  const show = (html) => {
    outEl.style.display = "block";
    outEl.innerHTML = html;
    outEl.firstElementChild?.classList.add("fade-in");
  };
  const renderError = (msg) => show(`<p class="error" role="alert" style="color:#c00;">${msg}</p>`);
  const normalizeInput = (s) => s.replace(/\u3000/g, " ").replace(/\s+/g, " ").trim();

  // 天気ID → テーマ判定
  function pickTheme(d) {
    const id = Number(d.weather?.[0]?.id ?? 800);
    const icon = d.weather?.[0]?.icon ?? "01d";
    const isNight = icon.endsWith("n");

    let theme = "wx-clear";
    if (id >= 200 && id < 300) theme = "wx-thunder";
    else if (id >= 300 && id < 600) theme = "wx-rain";
    else if (id >= 600 && id < 700) theme = "wx-snow";
    else if (id >= 700 && id < 800) theme = "wx-mist";
    else if (id === 800) theme = "wx-clear";
    else if (id > 800) theme = "wx-clouds";

    return { theme, isNight };
  }

  // 背景を適用（#bg レイヤーに画像、bodyはクラスのみ）
  function applyWeatherBg(d) {
  const { theme, isNight } = pickTheme(d);

  // 色・フィルタ用のクラスだけ更新（背景画像はここで即変更しない）
  document.body.classList.remove(
    "wx-clear","wx-clouds","wx-rain","wx-snow","wx-thunder","wx-mist","wx-night"
  );
  document.body.classList.add(theme);
  if (isNight) document.body.classList.add("wx-night");

  // 背景画像は「プリロード成功したら」#bg に適用
  const file = BG_MAP[theme];
  if (!file) return; // マップが無いテーマは初期背景のまま（上書きしない）

  const url = `${BG_BASE}${file}`;
  const img = new Image();
  img.onload = () => {
    const bgEl = document.getElementById("bg");
    if (bgEl) bgEl.style.backgroundImage = `url("${url}")`;
  };
  img.onerror = () => {
    // 失敗したら何もしない → 初期背景を維持
    console.warn("背景画像の読み込みに失敗:", url);
  };
  img.src = url;
}


  // ===== 描画 =====
  const render = (d) => {
    const icon = d.weather?.[0]?.icon
      ? `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`
      : "";
    const desc = d.weather?.[0]?.description || "";

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
          ${icon ? `<img class="weather-icon" src="${icon}" alt="${desc}">` : ""}
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
    applyWeatherBg(d);
  };

  // ===== データ取得 =====
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

      if (!geoRes.ok) {
        console.error("Geocode error:", geo);
        return renderError(`位置情報エラー：${geo?.message ?? geoRes.status}`);
      }
      if (!Array.isArray(geo) || geo.length === 0) {
        return renderError(`都市が見つかりませんでした：「${q}」`);
      }
      const { lat, lon, name, country, state } = geo[0];

      // 2) 天気
      const wxUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ja`;
      const wxRes = await fetch(wxUrl);
      const data = await wxRes.json();
      if (mySeq !== reqSeq) return;

      if (!wxRes.ok) {
        console.error("Weather error:", data);
        return renderError(`天気APIエラー：${data?.message ?? wxRes.status}`);
      }
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

      if (!wxRes.ok) {
        console.error("Weather error:", data);
        return renderError(`天気APIエラー：${data?.message ?? wxRes.status}`);
      }
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
})();
