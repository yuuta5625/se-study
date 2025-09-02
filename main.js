document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("greetBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    alert("こんにちは！見に来てくれてありがとう！");
  });
});
