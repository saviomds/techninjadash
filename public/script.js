let currentView = 'products';
let currency = 'Rs';

async function handleLogin(e) {
    e.preventDefault();
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username: document.getElementById('l-user').value, 
            password: document.getElementById('l-pass').value 
        })
    });
    if (res.ok) { localStorage.setItem('ninja_auth', 't'); init(); } else alert("Fail");
}

function init() {
    if (localStorage.getItem('ninja_auth') === 't') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        fetchData();
    }
}

async function fetchData() {
    const res = await fetch('/api/data');
    const data = await res.json();
    currency = data.settings.currency;
    document.getElementById('logo-text').innerText = data.settings.shopName;
    document.getElementById('shop-logo').src = data.settings.logo || './image/logo.jpg';
    
    if (currentView === 'settings') renderSettings(data.settings);
    else renderTable(data[currentView] || []);
}

function switchView(v, el) {
    currentView = v;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(el) el.classList.add('active');
    document.getElementById('view-title').innerText = v.charAt(0).toUpperCase() + v.slice(1);
    document.getElementById('add-btn').style.display = v === 'settings' ? 'none' : 'block';
    fetchData();
}

function renderTable(items) {
    document.getElementById('content-area').innerHTML = `<div class="card"><table><thead id="table-header"></thead><tbody id="table-body"></tbody></table></div>`;
    const head = document.getElementById('table-header');
    const body = document.getElementById('table-body');
    
    head.innerHTML = currentView === 'products' 
        ? `<tr><th>Item</th><th>Price</th><th>Stock</th><th>Action</th></tr>`
        : `<tr><th>Device</th><th>Customer</th><th>Status</th><th>Action</th></tr>`;

    body.innerHTML = items.map(i => `
        <tr>
            <td><img src="${i.image}" class="img-thumb" onerror="this.src='https://via.placeholder.com/50'"><b>${i.name || i.device}</b></td>
            <td>${currentView === 'products' ? currency + i.price : i.customer}</td>
            <td>${currentView === 'products' ? i.stock : `<span class="badge ${i.status.toLowerCase()}">${i.status}</span>`}</td>
            <td><button class="action-btn" onclick="deleteItem('${i.id}')">🗑️</button></td>
        </tr>
    `).reverse().join('');
}

function renderSettings(s) {
    document.getElementById('content-area').innerHTML = `
        <div class="card"><form onsubmit="saveSettings(event)" style="max-width:400px">
            <label>Shop Name</label><input name="shopName" value="${s.shopName}">
            <label>Currency Symbol</label><input name="currency" value="${s.currency}">
            <label>Logo Image</label><input type="file" name="logo">
            <label>New Password</label><input name="newPassword" type="password">
            <button type="submit" class="btn-add">Update Settings</button>
        </form></div>`;
}

async function saveSettings(e) {
    e.preventDefault();
    await fetch('/api/settings', { method: 'POST', body: new FormData(e.target) });
    alert("Saved"); fetchData();
}

async function handleForm(e) {
    e.preventDefault();
    const btn = document.getElementById('save-btn');
    btn.disabled = true;
    const res = await fetch(`/api/${currentView}`, { method: 'POST', body: new FormData(e.target) });
    if (res.ok) { togglePanel(false); fetchData(); } else alert("Error or Duplicate");
    btn.disabled = false;
}

function togglePanel(show) {
    document.getElementById('panel').classList.toggle('open', show);
    document.getElementById('overlay').classList.toggle('active', show);
    if (show) {
        const f = document.getElementById('f-fields');
        f.innerHTML = currentView === 'products' 
            ? `<label>Name</label><input name="name" required><label>Price</label><input name="price" type="number"><label>Stock</label><input name="stock" type="number"><label>Img</label><input type="file" name="image">`
            : `<label>Device</label><input name="device" required><label>Customer</label><input name="customer" required><label>Status</label><select name="status"><option>Pending</option><option>Repairing</option><option>Fixed</option></select><label>Photo</label><input type="file" name="image">`;
    }
}

async function deleteItem(id) { if(confirm("Del?")) { await fetch(`/api/${currentView}/${id}`, { method: 'DELETE' }); fetchData(); } }
function logout() { localStorage.removeItem('ninja_auth'); location.reload(); }
window.onload = init;