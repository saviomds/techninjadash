/* ================= SIDEBAR ================= */

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('overlay');

    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    } else {
        sidebar.classList.toggle('collapsed');
    }
}

function closeSidebar() {
    document.querySelector('.sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('active');
}

/* ================= GLOBAL STATE ================= */

let currentView = 'products';
let allItems = [];

let settingsData = JSON.parse(localStorage.getItem('settings')) || {
    shopName: 'TechNinja',
    currency: 'Rs',
    logo: 'https://via.placeholder.com/35'
};

/* ================= INIT ================= */

window.onload = () => {
    if (localStorage.getItem('ninja_auth')) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        fetchData();
    }
};

/* ================= LOCAL DATA ================= */

function getStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function setStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/* ================= FETCH ================= */

async function fetchData() {
    try {
        const res = await fetch('/api/data');
        const db = await res.json();
        
        settingsData = db.settings;
        document.getElementById('shop-logo').src = settingsData.logo || "https://via.placeholder.com/35";
        document.getElementById('logo-text').innerText = settingsData.shopName;

        if (currentView === 'settings') {
            renderSettingsPage();
        } else {
            allItems = db[currentView] || [];
            renderTable(allItems);
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

/* ================= TABLE ================= */

function renderTable(items) {
    const area = document.getElementById('content-area');
    document.getElementById('view-title').innerText = currentView.toUpperCase();

    if (!items.length) {
        area.innerHTML = "<p>No data found</p>";
        return;
    }

    let html = `
    <table>
        <thead>
            <tr>
                <th>Main</th>
                <th>Details</th>
                <th>Date</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>`;

    html += items.map(i => {
        let main = i.name || i.device || "Unknown";
        let details = "";

        if (currentView === 'products') {
            details = `
                ${i.category || ''}<br>
                ${settingsData.currency} ${i.price || 0}<br>
                Stock: ${i.stock || 0}<br>
                ${i.description || ''}
            `;
        }

        else if (currentView === 'repairs') {
            details = `
                Cust: ${i.customer || ''}<br>
                Phone: ${i.phone || ''}<br>
                Issue: ${i.issue || ''}<br>
                Status: ${i.status || ''}<br>
                ${settingsData.currency} ${i.price || 0}
            `;
        }

        else if (currentView === 'orders') {
            details = `
                Cust: ${i.customer || ''}<br>
                Qty: ${i.qty || 1}<br>
                ${settingsData.currency} ${i.price || 0}<br>
                Payment: ${i.payment || ''}<br>
                Status: ${i.status || ''}
            `;
        }

        else if (currentView === 'customers') {
            details = `
                Phone: ${i.phone || ''}<br>
                Email: ${i.email || ''}<br>
                ${i.address || ''}
            `;
        }

        else if (currentView === 'staff') {
            details = `
                Role: ${i.role || ''}<br>
                Phone: ${i.phone || ''}<br>
                Salary: ${settingsData.currency} ${i.salary || 0}
            `;
        }

        return `
        <tr>
            <td>
                <div class="flex-cell">
                    <img src="${i.image || 'https://via.placeholder.com/50'}" class="img-thumb">
                    <strong>${main}</strong>
                </div>
            </td>
            <td>${details}</td>
            <td>${i.date || '-'}</td>
            <td>
                <button class="action-btn" onclick="deleteItem('${i.id}')">🗑️</button>
            </td>
        </tr>`;
    }).reverse().join('');

    area.innerHTML = html + "</tbody></table>";
    }

/* ================= SETTINGS ================= */

function renderSettingsPage() {
    const area = document.getElementById('content-area');
    document.getElementById('view-title').innerText = "SETTINGS";

    area.innerHTML = `
        <div class="settings-card">
            <h3>Shop Configuration</h3>
            <form onsubmit="handleSettingsUpdate(event)">

                <label>Shop Name</label>
                <input type="text" name="shopName" value="${settingsData.shopName}" required>

                <label>Currency</label>
                <input type="text" name="currency" value="${settingsData.currency}" required>

                <label>New Password</label>
                <input type="password" name="password" placeholder="Leave blank to keep">

                <label>Logo Image</label>
                <input type="file" name="logo" accept="image/*">

                <button class="btn-add">Save Settings</button>
            </form>
        </div>`;
}

/* ================= NAVIGATION ================= */

function switchView(v, el) {
    currentView = v;

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');

    document.getElementById('add-btn').style.display = (v === 'settings') ? 'none' : 'block';

    closeSidebar();
    fetchData();
}

/* ================= PANEL ================= */

function togglePanel(show) {
    if (show) renderFormFields();

    document.getElementById('panel').classList.toggle('open', show);
    document.getElementById('overlay').classList.toggle('active', show);
}

function renderFormFields() {
    const f = document.getElementById('f-fields');

    const schemas = {
        products: [
            { label: 'Product Name', key: 'name' },
            { label: 'Category', key: 'category' },
            { label: 'Price', key: 'price', type: 'number' },
            { label: 'Stock Quantity', key: 'stock', type: 'number' },
            { label: 'Description', key: 'description' }
        ],

        repairs: [
            { label: 'Device Name', key: 'device' },
            { label: 'Customer Name', key: 'customer' },
            { label: 'Phone', key: 'phone' },
            { label: 'Issue', key: 'issue' },
            { label: 'Status (Pending/Done)', key: 'status' },
            { label: 'Cost', key: 'price', type: 'number' },
            { label: 'Description', key: 'description' }
        ],

        orders: [
            { label: 'Product Name', key: 'name' },
            { label: 'Customer Name', key: 'customer' },
            { label: 'Phone', key: 'phone' },
            { label: 'Quantity', key: 'qty', type: 'number' },
            { label: 'Total Price', key: 'price', type: 'number' },
            { label: 'Payment Status', key: 'payment' },
            { label: 'Order Status', key: 'status' },
            { label: 'Description', key: 'description' }
        ],

        customers: [
            { label: 'Full Name', key: 'name' },
            { label: 'Phone', key: 'phone' },
            { label: 'Email', key: 'email' },
            { label: 'Address', key: 'address' },
            { label: 'Notes', key: 'description' }
        ],

        staff: [
            { label: 'Full Name', key: 'name' },
            { label: 'Role', key: 'role' },
            { label: 'Phone', key: 'phone' },
            { label: 'Email', key: 'email' },
            { label: 'Salary', key: 'salary', type: 'number' },
            { label: 'Notes', key: 'description' }
        ]
    };

    const fields = schemas[currentView] || [];

    f.innerHTML = fields.map(x => `
        <label>${x.label}</label>
        <input name="${x.key}" type="${x.type || 'text'}" required>
    `).join('') + `
        <label>Image (optional)</label>
        <input type="file" name="image" accept="image/*">
    `;
}

/* ================= FORM ================= */

async function handleForm(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    await fetch(`/api/${currentView}`, {
        method: 'POST',
        body: formData // Multer handles this on server
    });

    togglePanel(false);
    fetchData();
}

/* ================= SETTINGS SAVE (FIXED IMAGE) ================= */

async function handleSettingsUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const res = await fetch('/api/settings', {
        method: 'POST',
        body: formData
    });

    if (res.ok) {
        alert("Settings Saved!");
        location.reload();
    }
}

/* ================= DELETE ================= */

async function deleteItem(id) {
    if (confirm("Delete?")) {
        await fetch(`/api/${currentView}/${id}`, { method: 'DELETE' });
        fetchData();
    }
}

/* ================= SEARCH ================= */

function handleSearch() {
    const term = document.getElementById('search-bar').value.toLowerCase();

    const filtered = allItems.filter(i =>
        Object.values(i).some(v =>
            String(v).toLowerCase().includes(term)
        )
    );

    renderTable(filtered);
}

/* ================= AUTH ================= */

async function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('l-user').value;
    const pass = document.getElementById('l-pass').value;

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await res.json();

        if (data.success) {
            localStorage.setItem('ninja_auth', 'true');
            location.reload();
        } else {
            alert("Invalid credentials");
        }
    } catch (err) {
        alert("Server error during login");
    }
    }


function logout() {
    localStorage.removeItem('ninja_auth');
    location.reload();
}