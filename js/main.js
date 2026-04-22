/**
 * MQS Delights - Official Main Script
 * Integrated System: Menu + Cart + Checkout + Dashboard
 */

// ============================================
// 1. INITIALIZATION (Bila Page Load)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('MQS Delights System: Active');
    
    // Jalankan fungsi ikut page mana yang tengah buka
    if (document.getElementById('menu-container')) fetchMenu();
    if (document.getElementById('cart-items')) renderCart();
    if (document.getElementById('order-history-list')) loadDashboardData();
    if (document.getElementById('admin-order-list')) loadAdminOrders();
    
    updateCartBadge();
});

// ============================================
// 2. MENU SYSTEM (Tarik dari Supabase)
// ============================================
async function fetchMenu() {
    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) return;

    try {
        const { data: menuItems, error } = await _supabase.from('menu_items').select('*');
        if (error) throw error;

        menuContainer.innerHTML = ''; // Clear loading
        menuItems.forEach((item) => {
            menuContainer.innerHTML += `
                <div class="bg-[#1A1A1A] border border-gray-800 rounded-2xl overflow-hidden hover:border-[#FF8C00] transition-all duration-300 group">
                    <div class="h-56 overflow-hidden">
                        <img src="${item.image_url}" onerror="this.src='https://via.placeholder.com/500x300?text=MQS+Delights'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                    </div>
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-2">
                            <h3 class="text-xl font-bold text-white group-hover:text-[#FF8C00]">${item.name}</h3>
                            <span class="text-[#FF8C00] font-bold">RM ${parseFloat(item.price).toFixed(2)}</span>
                        </div>
                        <p class="text-gray-400 text-sm mb-6">${item.description}</p>
                        <button onclick="addToCart(${item.id}, '${item.name}', ${item.price})" 
                                class="w-full py-3 bg-[#B89C6D] hover:bg-[#FF8C00] text-black font-bold rounded-lg transition-all">
                            ADD TO CART
                        </button>
                    </div>
                </div>`;
        });
    } catch (err) {
        console.error('Menu Error:', err);
        menuContainer.innerHTML = `<p class="text-red-500 text-center col-span-3">Gagal memuatkan menu.</p>`;
    }
}

// ============================================
// 3. CART SYSTEM (LocalStorage)
// ============================================
window.addToCart = function(itemId, itemName, itemPrice) {
    let cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];
    const existing = cart.find(i => i.id === itemId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id: itemId, name: itemName, price: parseFloat(itemPrice), quantity: 1 });
    }

    localStorage.setItem('mqs_cart', JSON.stringify(cart));
    updateCartBadge();
    alert(`🔥 NICE! ${itemName} masuk bakul.`);
};

// FUNGSI: Paparkan barang dalam bakul (Versi Paling Solid)
function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('total-price');

    if (!container) return; // Exit kalau bukan kat page Cart

    // 1. Ambil data bakul (Objek Penuh)
    let cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="border border-dashed border-gray-800 rounded-3xl p-12 text-center">
                <p class="text-gray-600 mb-4 italic">"Hey.. Your cart is a bit empty don't you think?"</p>
                <a href="menu.html" class="text-[#FF8C00] font-bold hover:underline">Let's Get Some Food!</a>
            </div>`;
        totalEl.innerText = "RM 0.00";
        return;
    }

    // 2. Lukis UI terus dari data bakul
    container.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += (item.price * item.quantity);
        
        container.innerHTML += `
            <div class="flex items-center justify-between p-6 bg-[#151515] border border-gray-800 rounded-2xl mb-4 orange-glow">
                <div class="flex flex-col">
                    <h4 class="text-white font-bold text-lg">${item.name}</h4>
                    <p class="text-[#FF8C00] font-black text-sm uppercase tracking-widest">
                        RM ${item.price.toFixed(2)} x ${item.quantity}
                    </p>
                </div>
                <button onclick="removeFromCart(${index})" class="text-gray-600 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>`;
    });

    // 3. Update Total Price
    totalEl.innerText = `RM ${total.toFixed(2)}`;
}

    container.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        total += (item.price * item.quantity);
        container.innerHTML += `
            <div class="flex items-center justify-between p-4 bg-[#1A1A1A] border border-gray-800 rounded-xl mb-3">
                <div class="flex flex-col">
                    <h4 class="text-white font-bold">${item.name}</h4>
                    <p class="text-[#FF8C00] text-sm">RM ${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <button onclick="removeFromCart(${index})" class="text-gray-500 hover:text-red-500">BUANG</button>
            </div>`;
    });
    totalEl.innerText = `RM ${total.toFixed(2)}`;
}

window.removeFromCart = function(index) {
    let cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('mqs_cart', JSON.stringify(cart));
    renderCart();
    updateCartBadge();
};

function updateCartBadge() {
    const badge = document.getElementById('cart-badge') || document.getElementById('cart-count');
    if (badge) {
        const cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];
        const count = cart.reduce((sum, i) => sum + i.quantity, 0);
        badge.innerText = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }
}

// ============================================
// 4. CHECKOUT SYSTEM (Hantar ke Supabase)
// ============================================
window.checkout = async function() {
    let cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];
    if (cart.length === 0) return alert("Bakul kosong!");

    let total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const points = Math.floor(total * 10);

    try {
        const { error } = await _supabase.from('orders').insert([{
            customer_name: 'Guest User',
            items: cart,
            total_price: total,
            points_earned: points,
            status: 'Preparing'
        }]);

        if (error) throw error;

        localStorage.removeItem('mqs_cart');
        alert(`🔥 ORDER SUCCESS!\nTotal: RM ${total.toFixed(2)}\nPoints: ${points} pts`);
        window.location.href = '../index.html';
    } catch (err) {
        alert("Gagal: " + err.message);
    }
};

// ============================================
// 5. DASHBOARD & ADMIN (Tarik Data Order)
// ============================================
async function loadDashboardData() {
    const historyEl = document.getElementById('order-history-list');
    const pointsEl = document.getElementById('display-points');
    if (!historyEl) return;

    const { data: orders, error } = await _supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) return console.error(error);

    historyEl.innerHTML = '';
    let totalPts = 0;
    orders.forEach(order => {
        totalPts += order.points_earned || 0;
        const date = new Date(order.created_at).toLocaleDateString('en-GB');
        historyEl.innerHTML += `
            <div class="p-4 bg-[#1A1A1A] border-l-4 border-[#FF8C00] rounded-r-xl mb-3 flex justify-between items-center">
                <div>
                    <p class="text-[10px] text-gray-500">Order #${order.id.slice(0,8)} • ${date}</p>
                    <h4 class="text-white font-bold text-sm">RM ${order.total_price.toFixed(2)}</h4>
                </div>
                <div class="text-right">
                    <span class="text-[#FF8C00] font-bold">+${order.points_earned} pts</span>
                    <p class="text-[9px] text-gray-400 uppercase">${order.status}</p>
                </div>
            </div>`;
    });
    if (pointsEl) pointsEl.innerText = totalPts;
}

// Admin Kitchen Logic
async function loadAdminOrders() {
    const container = document.getElementById('admin-order-list');
    if (!container) return;

    const { data: orders, error } = await _supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) return;

    container.innerHTML = '';
    orders.forEach(order => {
        const itemNames = order.items.map(i => `${i.name} (x${i.quantity})`).join(', ');
        container.innerHTML += `
            <div class="bg-[#1A1A1A] border border-gray-800 p-5 rounded-2xl mb-4">
                <div class="flex justify-between items-start mb-3">
                    <h4 class="text-white font-bold text-sm">${itemNames}</h4>
                    <span class="text-[10px] font-bold px-2 py-1 rounded bg-orange-600/20 text-orange-500">${order.status}</span>
                </div>
                <div class="flex gap-2">
                    <button onclick="updateStatus('${order.id}', 'Cooking')" class="flex-1 py-2 text-[10px] bg-blue-600/20 text-blue-400 rounded-lg">COOK</button>
                    <button onclick="updateStatus('${order.id}', 'Done')" class="flex-1 py-2 text-[10px] bg-green-600/20 text-green-400 rounded-lg">DONE</button>
                </div>
            </div>`;
    });
}

window.updateStatus = async function(id, s) {
    await _supabase.from('orders').update({ status: s }).eq('id', id);
    loadAdminOrders();
};
