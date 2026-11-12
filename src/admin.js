const BASE = 'https://znyaypduzphcbnvfjcah.supabase.co';
const KEY = 'sb_publishable_IkXxyjZy_ryvzPaByjkm1Q_NJNku05q';
const TOKEN_KEY = 'nomi_admin_token';

let token = localStorage.getItem(TOKEN_KEY);
let messages = [];

const loginView = document.querySelector('#login');
const dashView = document.querySelector('#dashboard');
const loginStatus = document.querySelector('#login-status');

const headers = () => ({
  apikey: KEY,
  Authorization: 'Bearer ' + (token || KEY),
  'Content-Type': 'application/json'
});

async function api(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: { ...headers(), ...(options.headers || {}) }
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) {
    const detail = data && (data.msg || data.message || data.error_description);
    throw new Error(detail || 'HTTP ' + res.status);
  }
  return data;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function renderMessages() {
  const q = (document.querySelector('#search')?.value || '').trim().toLowerCase();
  const sf = document.querySelector('#status-filter')?.value || 'all';
  const day = document.querySelector('#date-filter')?.value || '';
  const list = messages.filter(m =>
    (!q || [m.name, m.wechat, m.content].some(v => String(v).toLowerCase().includes(q))) &&
    (sf === 'all' || (sf === 'unread' && !m.is_read) || (sf === 'read' && m.is_read)) &&
    (!day || String(m.created_at).slice(0, 10) === day)
  );
  const box = document.querySelector('#messages');
  if (!list.length) {
    box.innerHTML = '<p>没有符合条件的留言</p>';
    return;
  }
  box.innerHTML = list.map(m =>
    '<article class="message">' +
    '<button data-id="' + m.id + '" class="del">删除</button>' +
    '<button data-id="' + m.id + '" class="read">' + (m.is_read ? '已读' : '标记已读') + '</button>' +
    '<b>' + escapeHtml(m.name) + ' · ' + escapeHtml(m.wechat) + '</b>' +
    '<small> ' + new Date(m.created_at).toLocaleString() + '</small>' +
    '<p>' + escapeHtml(m.content) + '</p>' +
    '</article>'
  ).join('');
  box.querySelectorAll('.read').forEach(btn => {
    btn.onclick = async () => {
      try {
        await api('/rest/v1/messages?id=eq.' + btn.dataset.id, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ is_read: true, read_at: new Date().toISOString() })
        });
        load();
      } catch (e) {
        alert(e.message);
      }
    };
  });
  box.querySelectorAll('.del').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('确定删除这条留言？')) return;
      try {
        await api('/rest/v1/messages?id=eq.' + btn.dataset.id, { method: 'DELETE' });
        load();
      } catch (e) {
        alert(e.message);
      }
    };
  });
}

function renderTrend(views) {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const dt = new Date();
    dt.setHours(0, 0, 0, 0);
    dt.setDate(dt.getDate() - i);
    days.push(dt);
  }
  const counts = days.map(d => views.filter(v => {
    const x = new Date(v.created_at);
    return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth() && x.getDate() === d.getDate();
  }).length);
  const max = Math.max(1, ...counts);
  const box = document.querySelector('#trend');
  if (!views.length) {
    box.innerHTML = '<p>暂无访问数据</p>';
    return;
  }
  box.innerHTML = counts.map((n, i) =>
    '<div class="bar" title="' + days[i].toLocaleDateString() + '：' + n + ' PV">' +
    '<i style="height:' + Math.max(4, Math.round(n / max * 130)) + 'px"></i>' +
    '<span>' + n + '</span>' +
    '<small>' + String(days[i].getMonth() + 1).padStart(2, '0') + '/' + String(days[i].getDate()).padStart(2, '0') + '</small>' +
    '</div>'
  ).join('');
}

async function load() {
  if (!token) {
    loginView.hidden = false;
    dashView.hidden = true;
    return;
  }
  try {
    const [msgs, views] = await Promise.all([
      api('/rest/v1/messages?select=*&deleted_at=is.null&order=created_at.desc'),
      api('/rest/v1/page_views?select=visitor_id,created_at')
    ]);
    messages = msgs;
    loginView.hidden = true;
    dashView.hidden = false;
    document.querySelector('#total').textContent = msgs.length;
    document.querySelector('#unread').textContent = msgs.filter(m => !m.is_read).length;
    document.querySelector('#pv').textContent = views.length;
    document.querySelector('#uv').textContent = new Set(views.map(v => v.visitor_id)).size;
    renderTrend(views);
    renderMessages();
  } catch (e) {
    loginStatus.textContent = '后台加载失败：' + e.message;
    token = null;
    localStorage.removeItem(TOKEN_KEY);
    loginView.hidden = false;
    dashView.hidden = true;
  }
}

document.querySelector('#login-form').onsubmit = async e => {
  e.preventDefault();
  const inputs = e.target.querySelectorAll('input');
  const email = inputs[0].value.trim();
  const password = inputs[1].value;
  if (!email || !password) {
    loginStatus.textContent = '请填写邮箱和密码';
    return;
  }
  loginStatus.textContent = '正在登录…';
  try {
    const res = await fetch(BASE + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { apikey: KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error_description || data.msg || data.message || ('HTTP ' + res.status));
    }
    token = data.access_token;
    localStorage.setItem(TOKEN_KEY, token);
    loginStatus.textContent = '';
    await load();
  } catch (e) {
    loginStatus.textContent = '登录失败：' + e.message;
  }
};

document.querySelector('#logout').onclick = () => {
  token = null;
  localStorage.removeItem(TOKEN_KEY);
  loginStatus.textContent = '';
  load();
};

document.querySelector('#search')?.addEventListener('input', renderMessages);
document.querySelector('#status-filter')?.addEventListener('change', renderMessages);
document.querySelector('#date-filter')?.addEventListener('change', renderMessages);

load();
