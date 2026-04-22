/**
 * MQS DELIGHTS - BULLETPROOF MAIN SCRIPT
 * Version: 2.0 (Fix Variable & Logic)
 */

// 1. INITIALIZATION (Tunggu page siap load)
document.addEventListener('DOMContentLoaded', () => {
    console.log('MQS System: Online');
    
    // Cek page mana user tengah buka dan jalankan fungsi yang betul
    if (document.getElementById('menu-container')) {
        fetchMenu();
    }
    
    if (document.getElementById('cart-items')) {
        renderCart();
    }

    // Sambungkan butang checkout kalau ada
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.onclick = checkout;
    }
    
    updateCartCount();
});

// 2. FETCH MENU (Tarik data dari Supabase)
async function fetchMenu() {
    const container = document.getElementById('menu-container');
    if (!container) return;

    try {
        // Guna _supabase ikut config.js kau
        const { data: items, error } = await _supabase.from('menu_items').select('*');
        
        if (error) throw error;

        container.innerHTML = ''; // Buang loading placeholder

        items.forEach(item => {
            container.innerHTML += `
                <div class="bg-[#151515] border border-gray-800 rounded-3xl overflow-hidden hover:border-[#FF8C00] transition-all duration-500 group">
                    <div class="h-52 overflow-hidden">
                        <img src="${item.image_url}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                    </div>
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-2">
                            <h3 class="text-xl font-bold">${item.name}</h3>
                            <span class="text-[#FF8C00] font-black">RM ${parseFloat(item.price).toFixed(2)}</span>
                        </div>
                        <p class="text-gray-500 text-sm mb-6 line-clamp-2">${item.description}</p>
                        <button onclick="addToCart(${item.id}, '${item.name}', ${item.price})" 
                            class="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-[#FF8C00] hover:text-white transition duration-300">
                            ADD TO CART
                        </button>
                    </div>
                </div>`;
        });
    } catch (err) {
        console.error('Menu Hilang Sebab:', err.message);
        container.innerHTML = `<p class="text-red-500 text-center col-span-3 font-bold">Error: ${err.message}</p>`;
    }
}

// 3. CART SYSTEM (Add/Remove/Render)
window.addToCart = function(id, name, price) {
    let cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];
    const exists = cart.find(i => i.id === id);

    if (exists) {
        exists.quantity += 1;
    } else {
        cart.push({ id, name, price: parseFloat(price), quantity: 1 });
    }

    localStorage.setItem('mqs_cart', JSON.stringify(cart));
    updateCartCount();
    alert(`🔥 ${name} masuk bakul!`);
};

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('total-price');
    if (!container) return;

    const cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];
    if (cart.length === 0) {
        container.innerHTML = `<div class="text-center py-20 opacity-50 italic">Cart kau kosong bro...</div>`;
        totalEl.innerText = "RM 0.00";
        return;
    }

    container.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        total += (item.price * item.quantity);
        container.innerHTML += `
            <div class="flex justify-between items-center bg-[#111] p-6 rounded-2xl border border-gray-800 mb-4">
                <div>
                    <h4 class="font-bold text-white text-lg">${item.name}</h4>
                    <p class="text-[#FF8C00] font-bold text-sm">RM ${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <button onclick="removeFromCart(${index})" class="text-gray-600 hover:text-red-500 font-bold">BUANG</button>
            </div>`;
    });
    totalEl.innerText = `RM ${total.toFixed(2)}`;
}

window.removeFromCart = function(index) {
    let cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('mqs_cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
};

function updateCartCount() {
    const counts = document.querySelectorAll('#cart-count, #cart-badge');
    const cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];
    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
    counts.forEach(el => {
        el.innerText = totalQty;
        el.style.display = totalQty > 0 ? 'block' : 'none';
    });
}

// 4. CHECKOUT
async function checkout() {
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
        alert(`🎉 ORDER SUCCESS!\nTotal: RM ${total.toFixed(2)}\nPoints: ${points} pts`);
        window.location.href = '../index.html';
    } catch (err) {
        alert("Gagal hantar order: " + err.message);
    }
}
