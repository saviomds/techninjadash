/* ================= SIDEBAR ================= */

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('overlay');

    // Mobile behavior (slide)
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    } 
    // Desktop behavior (collapse)
    else {
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
let settingsData = { shopName: 'TechNinja', currency: 'Rs', logo: './image/logo.jpg' };

/* ================= INIT ================= */

window.onload = () => {
    if (localStorage.getItem('ninja_auth')) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        fetchData();
    }
};

/* ================= FETCH ================= */

async function fetchData() {
    try {
        const res = await fetch('/api/data');
        const data = await res.json();

        // Settings sync
        settingsData = data.settings;
        document.getElementById('shop-logo').src = settingsData.logo;
        document.getElementById('logo-text').innerText = settingsData.shopName;

        const area = document.getElementById('content-area');
        area.innerHTML = "";

        if (currentView === 'settings') {
            renderSettingsPage();
        } else {
            allItems = data[currentView] || [];
            renderTable(allItems);
        }

    } catch (err) {
        console.error("Fetch Error:", err);
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
                <th>Name/Item</th>
                <th>Info</th>
                <th>Date</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>`;

    html += items.map(i => {
        const name = i.name || i.device || "Unknown";
        let info = "-";

        if (currentView === 'products') {
            info = i.price ? `${settingsData.currency} ${i.price}` : 'No Price';
        } 
        else if (currentView === 'repairs') {
            info = `Cust: ${i.customer || '-'} | ${i.issue || '-'}`;
        }
        else if (currentView === 'orders') {
            info = `${i.customer || 'Guest'} (${settingsData.currency} ${i.price || 0})`;
        }
        else if (currentView === 'staff') {
            info = i.role || 'No Role';
        }

        return `
        <tr>
            <td>
                <div class="flex-cell">
                    <img src="${i.image}" class="img-thumb" onerror="this.src='https://via.placeholder.com/50'">
                    <strong>${name}</strong>
                </div>
            </td>
            <td>${info}</td>
            <td>${i.date}</td>
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

                <label>Logo</label>
                <input type="file" name="logo">

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

    // Close sidebar on mobile after click
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
            { label: 'Price', key: 'price' }
        ],
        repairs: [
            { label: 'Device', key: 'device' },
            { label: 'Customer', key: 'customer' },
            { label: 'Issue', key: 'issue' }
        ],
        orders: [
            { label: 'Product', key: 'name' },
            { label: 'Customer', key: 'customer' },
            { label: 'Amount', key: 'price' }
        ],
        staff: [
            { label: 'Name', key: 'name' },
            { label: 'Role', key: 'role' }
        ]
    };

    const fields = schemas[currentView] || [];

    f.innerHTML = fields.map(x => `
        <label>${x.label}</label>
        <input name="${x.key}" required>
    `).join('') + `
        <label>Image</label>
        <input type="file" name="image">
    `;
}

/* ================= API ================= */

async function handleForm(e) {
    e.preventDefault();

    await fetch(`/api/${currentView}`, {
        method: 'POST',
        body: new FormData(e.target)
    });

    togglePanel(false);
    fetchData();
}

async function handleSettingsUpdate(e) {
    e.preventDefault();

    await fetch('/api/settings', {
        method: 'POST',
        body: new FormData(e.target)
    });

    alert("Saved!");
    location.reload();
}

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

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: l-user.value,
            password: l-pass.value
        })
    });

    const data = await res.json();

    if (data.success) {
        localStorage.setItem('ninja_auth', 'true');
        location.reload();
    } else {
        alert("Invalid credentials");
    }
}

function logout() {
    localStorage.removeItem('ninja_auth');
    location.reload();
}