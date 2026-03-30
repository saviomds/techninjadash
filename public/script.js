let currentView = 'products';
let allItems = [];
let settingsData = { shopName: 'TechNinja', currency: 'Rs', logo: './image/logo.jpg' };

// AUTO LOGIN & INIT
window.onload = () => {
    if (localStorage.getItem('ninja_auth')) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        fetchData();
    }
};

// FETCH DATA ROUTER
async function fetchData() {
    try {
        const res = await fetch('/api/data');
        const data = await res.json();
        
        // Update Global Settings UI
        settingsData = data.settings;
        document.getElementById('shop-logo').src = settingsData.logo;
        document.getElementById('logo-text').innerText = settingsData.shopName;

        const area = document.getElementById('content-area');
        area.innerHTML = ""; // Clear area to prevent data leaking between views

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

// TABLE RENDERER
function renderTable(items) {
    const area = document.getElementById('content-area');
    document.getElementById('view-title').innerText = currentView.toUpperCase();
    
    let html = `<table><thead><tr><th>Name/Item</th><th>Info/Details</th><th>Date</th><th>Action</th></tr></thead><tbody>`;
    
    html += items.map(i => {
        const displayName = i.name || i.device || "Unknown Item";
        let displayInfo = "-";

        if (currentView === 'products') {
            displayInfo = i.price ? `${settingsData.currency} ${i.price}` : 'No Price';
        } 
        else if (currentView === 'repairs') {
            displayInfo = `Cust: ${i.customer || 'N/A'} | ${i.issue || 'No Issue'}`;
        }
        else if (currentView === 'orders') {
            const price = i.price ? `${settingsData.currency} ${i.price}` : 'Free';
            displayInfo = `Bought by: ${i.customer || 'Guest'} (${price})`;
        }
        else if (currentView === 'staff') {
            displayInfo = i.role || 'No Role Assigned';
        }

        return `
        <tr>
            <td>
                <div class="flex-cell">
                    <img src="${i.image}" class="img-thumb" onerror="this.src='https://via.placeholder.com/50'">
                    <strong>${displayName}</strong>
                </div>
            </td>
            <td>${displayInfo}</td>
            <td>${i.date}</td>
            <td><button class="action-btn" onclick="deleteItem('${i.id}')">🗑️</button></td>
        </tr>`;
    }).reverse().join('');
    
    area.innerHTML = html + "</tbody></table>";
}

// SETTINGS PAGE RENDERER
function renderSettingsPage() {
    const area = document.getElementById('content-area');
    document.getElementById('view-title').innerText = "SYSTEM SETTINGS";

    area.innerHTML = `
        <div class="settings-card">
            <h3>Shop Configuration</h3>
            <form onsubmit="handleSettingsUpdate(event)">
                <label>Shop Name</label>
                <input type="text" name="shopName" value="${settingsData.shopName}" required>
                
                <label>Currency Symbol</label>
                <input type="text" name="currency" value="${settingsData.currency}" required>
                
                <label>Update Admin Password</label>
                <input type="password" name="password" placeholder="Leave blank to keep current">
                
                <label>Shop Logo</label>
                <input type="file" name="logo" accept="image/*">
                
                <button type="submit" class="btn-add" style="width:100%; margin-top:10px;">Save All Settings</button>
            </form>
        </div>
    `;
}

// FORM FIELD GENERATOR (FOR PANEL)
function renderFormFields() {
    const container = document.getElementById('f-fields');
    const schemas = {
        products: [
            { label: 'Product Name', key: 'name' },
            { label: 'Price', key: 'price' }
        ],
        repairs: [
            { label: 'Device Model', key: 'device' },
            { label: 'Customer Name', key: 'customer' },
            { label: 'Issue', key: 'issue' }
        ],
        orders: [
            { label: 'Item/Product Sold', key: 'name' }, 
            { label: 'Customer Name', key: 'customer' },
            { label: 'Total Amount', key: 'price' }
        ],
        staff: [
            { label: 'Staff Name', key: 'name' },
            { label: 'Role', key: 'role' }
        ]
    };

    const currentSchema = schemas[currentView] || [];
    
    container.innerHTML = currentSchema.map(field => `
        <div class="form-group">
            <label>${field.label}</label>
            <input name="${field.key}" type="text" required placeholder="Enter ${field.label}...">
        </div>
    `).join('') + `<label>Upload Photo</label><input name="image" type="file">`;
}

// ACTIONS & HANDLERS
async function handleSettingsUpdate(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = "Saving...";
    btn.disabled = true;
    
    await fetch('/api/settings', {
        method: 'POST',
        body: new FormData(e.target)
    });

    alert("Settings saved successfully!");
    location.reload(); 
}

async function handleForm(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true; 

    await fetch(`/api/${currentView}`, { method: 'POST', body: new FormData(e.target) });
    
    btn.disabled = false;
    togglePanel(false);
    fetchData();
}

function switchView(v, el) {
    currentView = v;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');

    const addBtn = document.getElementById('add-btn');
    addBtn.style.display = (v === 'settings') ? 'none' : 'block';

    fetchData();
}

function togglePanel(show) {
    if (show) renderFormFields();
    document.getElementById('panel').classList.toggle('open', show);
    document.getElementById('overlay').classList.toggle('active', show);
}

async function deleteItem(id) {
    if (confirm("Are you sure you want to delete this?")) {
        await fetch(`/api/${currentView}/${id}`, { method: 'DELETE' });
        fetchData();
    }
}

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
    if ((await res.json()).success) {
        localStorage.setItem('ninja_auth', 'true');
        location.reload();
    } else alert("Invalid Login Credentials");
}

function logout() {
    localStorage.removeItem('ninja_auth');
    location.reload();
}