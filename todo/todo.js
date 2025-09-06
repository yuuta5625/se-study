(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const input = $('#todo-input');
  const addBtn = $('#todo-add');
  const listEl = $('#todo-list');
  const emptyEl = $('#todo-empty');
  const filterBtns = $$('.filter-btn');

  const STORAGE_KEY = 'todo-items-v1';
  let items = load();
  let filter = 'all'; // 'all' | 'active' | 'done'

// ---- init ----
render();

// IME用の明示フラグ
let composing = false;
input?.addEventListener('compositionstart', () => { composing = true; });
input?.addEventListener('compositionend',   () => { composing = false; });

// Enterで追加：IME変換中は無視（堅牢版）
input?.addEventListener('keydown', (e) => {
  // IME中 or keyCode229（古い実装）なら何もしない
  if (composing || e.isComposing || e.keyCode === 229) return;

  if (e.key === 'Enter') {
    e.preventDefault();
    add();
  }
});

// 念のためのフォールバック（いらなければ削ってOK）
input?.addEventListener('keyup', (e) => {
  if (composing || e.isComposing || e.keyCode === 229) return;
  // keyupでEnterを拾いたいケースがあるならここでadd()しても良いが、
  // 二重発火を避けるため通常は何もしない。
});

addBtn?.addEventListener('click', add);

  addBtn?.addEventListener('click', add);
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      filter = btn.dataset.filter;
      render();
    });
  });

  function add() {
    const text = (input?.value || '').trim();
    if (!text) return;
    items.push({ id: String(Date.now()), text, done: false });
    input.value = '';
    save(); render();
  }

  function toggle(id) {
    const it = items.find(i => i.id === id);
    if (!it) return;
    it.done = !it.done;
    save(); render();
  }

  function remove(id) {
    items = items.filter(i => i.id !== id);
    save(); render();
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function render() {
    const visible = items.filter(i =>
      filter === 'all' ? true :
      filter === 'active' ? !i.done : i.done
    );

    listEl.innerHTML = visible.map(i => `
      <li class="todo-item ${i.done ? 'done' : ''}" data-id="${i.id}">
        <input id="chk-${i.id}" type="checkbox" ${i.done ? 'checked' : ''} aria-label="完了" />
        <label class="todo-label" for="chk-${i.id}">${escapeHtml(i.text)}</label>
        <div class="todo-actions">
          <button class="todo-del" aria-label="削除">削除</button>
        </div>
      </li>
    `).join('');

    // 事件
    $$('#todo-list input[type="checkbox"]').forEach(chk => {
      chk.addEventListener('change', () => {
        const id = chk.closest('.todo-item').dataset.id;
        toggle(id);
      });
    });
    $$('#todo-list .todo-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('.todo-item').dataset.id;
        remove(id);
      });
    });

    emptyEl.hidden = items.length !== 0;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
})();
