(() => {
  const API_KEY = "84a212e7221718ce1d2a784483127e2c"; 

  const cityEl  = document.getElementById("city");     // 入力欄
  const btnEl   = document.getElementById("getWeather"); // 検索ボタン
  const outEl   = document.getElementById("result");   // 結果表示
  const bgEl    = document.getElementById("bg");       // 背景用

  if (!btnEl || !cityEl || !outEl || !bgEl) return;

  // ----------------------------
  // 天気IDからテーマ名を決定
  // ----------------------------
  function pickThemeByWeather(id, icon) {
    const isNight = String(icon || "").endsWith("n");

    if (id >= 200 && id < 300) return "thunder"; // 雷
    if (id >= 300 && id < 600) return "rain";    // 雨
    if (id >= 600 && id < 700) return "snow";    // 雪
    if (id >= 700 && id < 800) return "fog";     // 霧
    if (id === 800)            return "clear";   // 快晴
    if (id > 800 && id < 900)  return "cloudy";  // 曇り
    return "clear"; // fallback
  }

  // ----------------------------
  // 背景を切り替え
  // ----------------------------
  function applyWeatherBackground(theme) {
  const bg = document.getElementById("bg");
  if (!bg) return;

  const url = `./assets/weather/${theme}.jpg`;
  bg.style.opacity = 0.6;
  bg.style.backgroundImage = `url("${url}")`;
  setTimeout(() => { bg.style.opacity = 1; }, 200);
}

  // ----------------------------
  // APIから天気取得 → UI更新
  // ----------------------------
  async function getWeather(city) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=ja`
      );
      if (!res.ok) throw new Error("データ取得失敗");

      const data = await res.json();

      // 背景切り替え
      const id   = Number(data.weather?.[0]?.id ?? 800);
      const icon = data.weather?.[0]?.icon ?? "01d";
      const theme = pickThemeByWeather(id, icon);
      applyWeatherBackground(theme);

      // 結果表示
      outEl.innerHTML = `
        <h2>${data.name}</h2>
        <p>天気: ${data.weather[0].description}</p>
        <p>気温: ${data.main.temp} ℃</p>
        <p>体感: ${data.main.feels_like} ℃</p>
      `;
    } catch (err) {
      outEl.textContent = "天気情報を取得できませんでした。";
      console.error(err);
    }
  }

  // ----------------------------
  // ボタン押下イベント
  // ----------------------------
  btnEl.addEventListener("click", () => {
    const city = cityEl.value.trim();
    if (city) getWeather(city);
  });
})();
