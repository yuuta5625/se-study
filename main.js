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
// ハンバーガーメニュー
// =========================
const navToggle = document.querySelector('.nav-toggle');
const globalNav = document.getElementById('global-nav');

if (navToggle && globalNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = globalNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  globalNav.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      globalNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  const mq = window.matchMedia('(min-width: 769px)');
  mq.addEventListener?.('change', (e) => {
    if (e.matches) {
      globalNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// =========================
// スムーススクロール
// =========================
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

// =========================
// 天気アプリ
// =========================
const apiKey = "84a212e7221718ce1d2a784483127e2c";
const cityEl = document.getElementById("city");
const btnEl  = document.getElementById("getWeather");
const outEl  = document.getElementById("result");

const showError = (msg) => {
  outEl.style.display = "block";
  outEl.innerHTML = `<p style="color:#c00;">${msg}</p>`;
};

const render = (d) => {
  const icon = d.weather?.[0]?.icon
    ? `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`
    : "";
  const desc = d.weather?.[0]?.description || "";

  outEl.style.display = "block";
  outEl.innerHTML = `
    <div class="weather-card">
      <div class="weather-top">
        <div class="weather-info">
          <span class="city">${d.name}</span>
          <span class="desc">（${desc}）</span>
        </div>
        <div class="temp">
          ${Math.round(d.main.temp)}<span class="unit">℃</span>
        </div>
      </div>

      <div class="weather-stats">
        <span class="stat">体感 ${Math.round(d.main.feels_like)}℃</span>
        <span class="stat">最高 ${Math.round(d.main.temp_max)}℃</span>
        <span class="stat">最低 ${Math.round(d.main.temp_min)}℃</span>
        <span class="stat">湿度 ${d.main.humidity}%</span>
        <span class="stat">風 ${d.wind.speed} m/s</span>
        ${d.clouds?.all != null ? `<span class="stat">雲量 ${d.clouds.all}%</span>` : ""}
        ${d.main?.pressure ? `<span class="stat">気圧 ${d.main.pressure} hPa</span>` : ""}
      </div>
    </div>`;
};

if (btnEl) {
  btnEl.addEventListener("click", async () => {
    const city = cityEl.value.trim();
    if (!city) {
      showError("都市名を入力してください（例: Tokyo）");
      return;
    }
    outEl.innerHTML = "<p>読み込み中...</p>";

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ja`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        showError(`エラー: ${data.message || "取得に失敗しました"}`);
        return;
      }
      render(data);
    } catch (e) {
      showError("通信に失敗しました。ネットワーク状況をご確認ください。");
    }
  });
}

// =========================
// デモボタン到着演出
// =========================
const demoBtn   = document.getElementById('demoWeatherBtn');
const weatherEl = document.getElementById('weather');
const inputEl   = document.getElementById('city');

if (demoBtn && weatherEl) {
  demoBtn.addEventListener('click', () => {
    setTimeout(() => {
      weatherEl.classList.add('demo-pulse');
      inputEl?.focus();
      setTimeout(() => weatherEl.classList.remove('demo-pulse'), 1300);
    }, 300);
  });
}
