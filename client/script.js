const API_URL = 'https://agri-waste-app-1.onrender.com'; 
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user'));

document.addEventListener('DOMContentLoaded', () => { if (token) showDashboard(); });

function showLogin() { hideAll(); document.getElementById('login-section').classList.remove('hidden'); }
function showRegister() { hideAll(); document.getElementById('register-section').classList.remove('hidden'); }
function showDashboard() {
    hideAll();
    document.getElementById('dashboard-section').classList.remove('hidden');
    document.getElementById('welcome-msg').innerText = `Welcome, ${currentUser.username}`;
    document.getElementById('user-role-display').innerText = currentUser.role.toUpperCase();
    if (currentUser.role === 'farmer') document.getElementById('farmer-controls').classList.remove('hidden');
    else document.getElementById('farmer-controls').classList.add('hidden');
    loadProducts();
}
function hideAll() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('register-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.add('hidden');
}
function logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); token = null; currentUser = null; showLogin(); }

async function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;
    const res = await fetch(`${API_URL}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password, role }) });
    if (res.ok) { alert('Registration Successful!'); showLogin(); } else { alert('Error registering'); }
}
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const res = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    const data = await res.json();
    if (res.ok) { token = data.token; currentUser = data.user; localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(currentUser)); showDashboard(); } else { alert(data.msg); }
}
async function addProduct() {
    const title = document.getElementById('prod-title').value;
    const imageUrl = document.getElementById('prod-img').value;
    const price = document.getElementById('prod-price').value;
    const description = document.getElementById('prod-desc').value;
    const res = await fetch(`${API_URL}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify({ title, imageUrl, price, description }) });
    if (res.ok) { alert("Product Uploaded!"); loadProducts(); } else { alert("Failed to upload"); }
}
async function loadProducts() {
    const list = document.getElementById('product-list');
    list.innerHTML = 'Loading...';
    const res = await fetch(`${API_URL}/products`, { headers: { 'x-auth-token': token } });
    const products = await res.json();
    list.innerHTML = '';
    products.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product-card';
        let actionBtn = currentUser.role === 'company' ? `<button onclick="buyProduct('${p._id}')">Buy Now</button>` : `<button style="background:#ccc;" disabled>Farmer View</button>`;
        div.innerHTML = `<img src="${p.imageUrl || 'https://via.placeholder.com/300'}" class="product-img"><div class="product-details"><h3>${p.title}</h3><p style="font-size:0.9em; color:#666;">By: ${p.farmerName}</p><p>${p.description}</p><div class="product-price">$${p.price}</div>${actionBtn}</div>`;
        list.appendChild(div);
    });
}
async function buyProduct(id) {
    if(!confirm("Confirm purchase?")) return;
    const res = await fetch(`${API_URL}/buy/${id}`, { method: 'POST', headers: { 'x-auth-token': token } });
    if (res.ok) { alert("Purchase Successful!"); loadProducts(); }
}
