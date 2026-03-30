let currentView = 'products';
let curr = '$';

// --- AUTH ---
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
    if(res.ok) { localStorage.setItem('ninja', 't'); init(); } else alert('Invalid Credentials');
}

function logout() { localStorage.removeItem('ninja'); location.reload(); }

function init() {
    if(localStorage.getItem('ninja') === 't') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        fetchData();
    }
}

// --- NAVIGATION ---
function switchView(view, el) {
    currentView = view;
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if(el) el.classList.add('active');
    document.getElementById('view-title').innerText = view.charAt(0).toUpperCase() + view.slice(1);
    document.getElementById('add-btn').style.display = view === 'settings' ? 'none' : 'block';
    fetchData();
}

// --- DATA ---
async function fetchData() {
    const res = await fetch('/api/data');
    const data = await res.json();
    document.getElementById('logo-text').innerText = data.settings.shopName;
    curr = data.settings.currency;

    if (currentView === 'settings') {
        renderSettings(data.settings);
    } else {
        renderTable(data[currentView] || []);
    }
}

function renderTable(items) {
    const header = document.getElementById('table-header');
    const body = document.getElementById('table-body');
    
    header.innerHTML = currentView === 'products' 
        ? `<tr><th>Product</th><th>Price</th><th>Stock</th><th>Action</th></tr>`
        : `<tr><th>Device</th><th>Customer</th><th>Status</th><th>Action</th></tr>`;

    body.innerHTML = items.map(i => `
        <tr>
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    ${i.image ? `<img src="${i.image}" style="width:40px;height:40px;border-radius:5px;object-fit:cover;">` : ''}
                    <b>${i.name || i.device}</b>
                </div>
            </td>
            <td>${currentView === 'products' ? curr + i.price : i.customer}</td>
            <td>${currentView === 'products' ? i.stock : i.status}</td>
            <td><button onclick="deleteItem('${i.id}')" style="background:none; border:none; cursor:pointer;">🗑️</button></td>
        </tr>
    `).reverse().join('');
}

function renderSettings(s) {
    document.getElementById('content-area').innerHTML = `
        <div class="card">
            <form onsubmit="saveSettings(event)" style="max-width:400px">
                <label>Shop Name</label><input name="shopName" value="${s.shopName}" required>
                <label>Currency</label><input name="currency" value="${s.currency}" required>
                <label>New Password</label><input name="newPassword" type="password" placeholder="Keep blank to stay same">
                <button type="submit" class="btn-add">Update Settings</button>
            </form>
        </div>`;
}

// --- ACTIONS ---
async function handleForm(e) {
    e.preventDefault();
    const btn = document.getElementById('save-btn');
    if(btn.disabled) return; // Prevent double click

    btn.disabled = true;
    btn.innerText = "Saving...";

    const formData = new FormData(e.target);
    const res = await fetch(`/api/${currentView}`, { method: 'POST', body: formData });

    if(res.ok) {
        e.target.reset();
        togglePanel(false);
        fetchData();
    } else if(res.status === 409) {
        alert("Item already exists!");
    }

    btn.disabled = false;
    btn.innerText = "Save Data";
}

async function saveSettings(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    await fetch('/api/settings', { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(d) 
    });
    alert('Settings Updated');
    switchView('products');
}

async function deleteItem(id) {
    if(confirm('Delete this item?')) {
        await fetch(`/api/${currentView}/${id}`, { method: 'DELETE' });
        fetchData();
    }
}

function togglePanel(show) {
    document.getElementById('panel').classList.toggle('open', show);
    document.getElementById('overlay').classList.toggle('active', show);
    if(show) {
        const f = document.getElementById('f-fields');
        f.innerHTML = currentView === 'products' 
            ? `<label>Name</label><input name="name" required><label>Price</label><input name="price" type="number" required><label>Stock</label><input name="stock" type="number" required><label>Img</label><input type="file" name="image">` 
            : `<label>Device</label><input name="device" required><label>Customer</label><input name="customer" required><label>Status</label><select name="status"><option>Pending</option><option>Fixed</option></select>`;
    }
}

window.onload = init;