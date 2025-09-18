(() => {
  const API_KEY = "84a212e7221718ce1d2a784483127e2c"; // ← あなたのAPIキー

  const form = document.getElementById("cityForm");
  const input = document.getElementById("city");
  const statusEl = document.getElementById("status");
  const iconEl = document.getElementById("icon");

  const normalize = (s) => s.replace(/\u3000/g, " ").replace(/\s+/g, " ").trim();

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    hideIcon();
    const raw = input?.value ?? "";
    const city = normalize(raw);
    if (!city) {
      showStatus("都市名を入力してください。");
      return;
    }

    showStatus("検索中…");

    try {
      const url = new URL("https://api.openweathermap.org/data/2.5/weather");
      url.searchParams.set("q", city);
      url.searchParams.set("appid", API_KEY);
      url.searchParams.set("lang", "ja");

      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) {
        showStatus("都市が見つかりませんでした。国コード付きで入力してください（例: Los Angeles,US）");
        return;
      }
      const data = await res.json();
      const w = data.weather?.[0];
      if (!w?.icon) {
        showStatus("アイコンコードが取得できませんでした。");
        return;
      }

      // ★ 昼アイコンに統一
      let iconCode = String(w.icon).replace(/n$/, "d");
      const desc = String(w.description ?? "weather");
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

      iconEl.onload = () => {
        iconEl.alt = `${city} の天気：${desc}`;
        iconEl.hidden = false;
        showStatus(`${city} の天気アイコン（${desc}）を表示しました。`);
      };
      iconEl.onerror = () => {
        hideIcon();
        showStatus(`${city} の天気は取得できましたが、アイコン画像の読み込みに失敗しました（${iconCode}）。`);
        console.warn("icon load error:", iconUrl);
      };

      iconEl.src = iconUrl;
    } catch (err) {
      console.error(err);
      showStatus("取得に失敗しました。通信環境やAPIキーを確認してください。");
      hideIcon();
    }
  });

  function showStatus(msg) { statusEl.textContent = msg; }
  function hideIcon() {
    iconEl.hidden = true;
    iconEl.removeAttribute("src");
    iconEl.alt = "";
  }
})();
(() => {
  const API_KEY = "84a212e7221718ce1d2a784483127e2c"; // ← あなたのAPIキー

  const form = document.getElementById("cityForm");
  const input = document.getElementById("city");
  const statusEl = document.getElementById("status");
  const iconEl = document.getElementById("icon");

  const normalize = (s) => s.replace(/\u3000/g, " ").replace(/\s+/g, " ").trim();

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    hideIcon();
    const raw = input?.value ?? "";
    const city = normalize(raw);
    if (!city) {
      showStatus("都市名を入力してください。");
      return;
    }

    showStatus("検索中…");

    try {
      const url = new URL("https://api.openweathermap.org/data/2.5/weather");
      url.searchParams.set("q", city);
      url.searchParams.set("appid", API_KEY);
      url.searchParams.set("lang", "ja");

      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) {
        showStatus("都市が見つかりませんでした。国コード付きで入力してください（例: Los Angeles,US）");
        return;
      }
      const data = await res.json();
      const w = data.weather?.[0];
      if (!w?.icon) {
        showStatus("アイコンコードが取得できませんでした。");
        return;
      }

      // ★ 昼アイコンに統一
      let iconCode = String(w.icon).replace(/n$/, "d");
      const desc = String(w.description ?? "weather");
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

      iconEl.onload = () => {
        iconEl.alt = `${city} の天気：${desc}`;
        iconEl.hidden = false;
        showStatus(`${city} の天気アイコン（${desc}）を表示しました。`);
      };
      iconEl.onerror = () => {
        hideIcon();
        showStatus(`${city} の天気は取得できましたが、アイコン画像の読み込みに失敗しました（${iconCode}）。`);
        console.warn("icon load error:", iconUrl);
      };

      iconEl.src = iconUrl;
    } catch (err) {
      console.error(err);
      showStatus("取得に失敗しました。通信環境やAPIキーを確認してください。");
      hideIcon();
    }
  });

  function showStatus(msg) { statusEl.textContent = msg; }
  function hideIcon() {
    iconEl.hidden = true;
    iconEl.removeAttribute("src");
    iconEl.alt = "";
  }
})();
