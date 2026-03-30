let currentView = 'products';
let editingId = null;

// Switch between Dashboard, Products, Repairs, etc.
function switchView(view) {
    currentView = view;
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
    // Update UI Header
    document.getElementById('view-title').innerText = view.charAt(0).toUpperCase() + view.slice(1);
    fetchData();
}

async function fetchData() {
    try {
        const res = await fetch('/api/data');
        const data = await res.json();
        
        // Handle Summary Stats if on 'Dashboard' view
        if (currentView === 'dashboard') {
            renderDashboardSummary(data);
        } else {
            const list = (data[currentView] || []).filter(item => item !== null);
            renderTable(list);
        }
    } catch (err) { console.error("Load Error:", err); }
}

function renderTable(items) {
    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('table-body');
    
    // Dynamic Headers based on view
    if (currentView === 'products') {
        tableHeader.innerHTML = `<tr><th>Product</th><th>Price</th><th>Stock</th><th>Action</th></tr>`;
    } else if (currentView === 'repairs') {
        tableHeader.innerHTML = `<tr><th>Device</th><th>Customer</th><th>Status</th><th>Action</th></tr>`;
    }

    tableBody.innerHTML = items.map(item => `
        <tr>
            <td>
                <div class="product-cell">
                    <img src="${item.image}" class="product-img" onerror="this.src='https://via.placeholder.com/50'">
                    <div>
                        <div class="bold">${item.name || item.device}</div>
                        <div class="tiny">ID: ${String(item.id).slice(-5)}</div>
                    </div>
                </div>
            </td>
            <td>${currentView === 'products' ? '$' + item.price : item.customer}</td>
            <td>${currentView === 'products' ? item.stock : `<span class="badge">${item.status || 'Pending'}</span>`}</td>
            <td style="text-align: right;">
                <button class="action-btn" onclick="prepareEdit('${item.id}')">✏️</button>
                <button class="action-btn" onclick="deleteItem('${item.id}')">🗑️</button>
            </td>
        </tr>
    `).reverse().join('');
}

// Handle Form Submission (Add/Edit)
async function handleForm(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = editingId ? `/api/${currentView}/${editingId}` : `/api/${currentView}`;
    const method = editingId ? 'PUT' : 'POST';

    // If PUT, we convert FormData to JSON because Multer is usually for POST
    let body = formData;
    let headers = {};
    
    if (editingId) {
        method = 'PUT';
        const json = Object.fromEntries(formData.entries());
        body = JSON.stringify(json);
        headers = { 'Content-Type': 'application/json' };
    }

    await fetch(url, { method, body, headers });
    editingId = null;
    toggleSlide(false);
    fetchData();
}

async function deleteItem(id) {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/${currentView}/${id}`, { method: 'DELETE' });
    fetchData();
}