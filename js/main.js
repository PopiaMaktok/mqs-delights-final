/**
 * MQS Delights - Main JavaScript File
 * Handles UI interactions, navbar effects, and Supabase integration
 */

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================

const navbar = document.getElementById('navbar');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ============================================
// MOBILE MENU TOGGLE
// ============================================

mobileMenuBtn?.addEventListener('click', () => {
    console.log('Mobile menu toggled');
    // TODO: Implement mobile menu toggle functionality
});

// ============================================
// SMOOTH SCROLL BEHAVIOR (Fallback for older browsers)
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// BUTTON CLICK HANDLERS
// ============================================

document.querySelectorAll('.btn-glow').forEach(button => {
    button.addEventListener('click', () => {
        console.log('CTA Button clicked');
        // TODO: Implement Supabase modal or redirect to reservation
    });
});

// ============================================
// SUPABASE INITIALIZATION
// ============================================

/**
 * Initialize Supabase client
 * Configuration should be loaded from js/config.js
 */
function initSupabase() {
    console.log('Supabase initialization placeholder');
    
    // TODO: Uncomment and implement when Supabase config is ready
    /*
    const { createClient } = supabase;
    
    const supabaseUrl = CONFIG.SUPABASE_URL;
    const supabaseKey = CONFIG.SUPABASE_ANON_KEY;
    
    const client = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized');
    */
}

// ============================================
// PAGE LOAD INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('MQS Delights - Page loaded');
    
    // Initialize Supabase
    initSupabase();
    
    // Additional initialization code can be added here
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function for performance optimization
 */
function debounce(func, delay) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, delay);
    };
}

/**
 * Fetch and display menu items from Supabase
 */
async function loadMenuItems() {
    console.log('Loading menu items...');
    // TODO: Implement Supabase query to fetch menu items
}

/**
 * Handle form submission for reservations
 */
function handleReservationSubmit(formData) {
    console.log('Processing reservation...', formData);
    // TODO: Implement Supabase insert for reservations
}

/**
 * Get user authentication status
 */
function checkAuthStatus() {
    console.log('Checking authentication status...');
    // TODO: Implement Supabase auth check
}

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // TODO: Implement error logging to Supabase
});

// ============================================
// SERVICE WORKER REGISTRATION (Optional)
// ============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // TODO: Register service worker for PWA support
        console.log('Service worker registration disabled');
    });
}

// ============================================
// PERFORMANCE MONITORING
// ============================================

if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log('Page load time:', pageLoadTime, 'ms');
            
            // TODO: Send performance metrics to Supabase for monitoring
        }, 0);
    });
}

console.log('✓ MQS Delights - JavaScript initialized successfully');


// js/main.js

// Gantikan bahagian fetchMenu kau dengan ini:

async function fetchMenu() {
    const menuContainer = document.getElementById('menu-container');
    
    // Pagar: Kalau tak jumpa container (cth: kat page cart), berhenti kat sini
    if (!menuContainer) return;

    // 1. Tarik data dari table 'menu_items'
    const { data: menuItems, error } = await _supabase
        .from('menu_items')
        .select('*');

    // 2. Kalau ada error
    if (error) {
        console.error('Alamak, error tarik menu:', error);
        menuContainer.innerHTML = '<p class="text-red-500 text-center">Gagal memuatkan menu.</p>';
        return;
    }

    // 3. Bersihkan container
    menuContainer.innerHTML = '';

    // 4. Loop dan lukis card
    menuItems.forEach((item) => {
        const card = `
            <div class="bg-[#1A1A1A] border border-gray-800 rounded-2xl overflow-hidden hover:border-[#FF8C00] transition-all duration-300 group">
                <div class="h-56 overflow-hidden">
                    <img src="${item.image_url}" 
                         onerror="this.onerror=null;this.src='https://via.placeholder.com/500x500/1A1A1A/FF8C00?text=MQS+Delights';" 
                         alt="${item.name}" 
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-xl font-bold text-white group-hover:text-[#FF8C00]">${item.name}</h3>
                        <span class="text-[#FF8C00] font-bold">RM ${item.price.toFixed(2)}</span>
                    </div>
                    <p class="text-gray-400 text-sm mb-6">${item.description}</p>
                    <button onclick="addToCart(${item.id})" class="w-full py-3 bg-[#B89C6D] hover:bg-[#FF8C00] text-black font-bold rounded-lg transition-colors duration-300">
                        ADD TO CART
                    </button>
                </div>
            </div>
        `;
        menuContainer.innerHTML += card;
    });
}
// ==========================================
// 🛒 CART SYSTEM (MQS DELIGHTS)
// ==========================================

// 1. Inisialisasi beg (Global Scope)
let cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];

// FUNGSI: Tambah barang ke bakul (Dipanggil dari menu.html)
function addToCart(itemId) {
    console.log("Adding item ID:", itemId);

    // Masukkan ke dalam array
    cart.push(itemId);

    // Simpan ke LocalStorage (Tukar array jadi string)
    localStorage.setItem('mqs_cart', JSON.stringify(cart));

    // Alert Premium (Kita pastikan muncul!)
    alert("🔥 NICE! Item #" + itemId + " added to cart.\nTotal items in cart: " + cart.length);
    
    // Kalau kita ada fungsi update badge navbar, panggil kat sini nanti
}

// FUNGSI: Paparkan barang dalam bakul (Dipanggil di cart.html)
async function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');

    // Exit kalau bukan kat page Cart
    if (!cartContainer) return; 

    // Ambil data terbaru dari storage
    let cartIds = JSON.parse(localStorage.getItem('mqs_cart')) || [];

    if (cartIds.length === 0) {
        cartContainer.innerHTML = `
            <div class="text-center py-20 border-2 border-dashed border-gray-800 rounded-2xl">
                <p class="text-gray-500 mb-4 text-lg">Hey.. Your cart is a bit empty don't you think?</p>
                <a href="menu.html" class="text-[#FF8C00] font-bold hover:underline">Let's Get Some Food!</a>
            </div>
        `;
        totalPriceElement.innerText = "RM 0.00";
        return;
    }

    // Tarik data dari Supabase (Hanya item yang ada dalam bakul)
    const { data: items, error } = await _supabase
        .from('menu_items')
        .select('*')
        .in('id', cartIds);

    if (error) {
        console.error("Database Error:", error);
        return;
    }

    cartContainer.innerHTML = '';
    let total = 0;

    // Kita loop cartIds (beg) supaya kalau beli 2 steak, dia keluar 2 kali
    cartIds.forEach((id, index) => {
        const item = items.find(i => i.id === id);
        if (item) {
            total += parseFloat(item.price);
            cartContainer.innerHTML += `
                <div class="flex items-center justify-between p-4 bg-[#1A1A1A] border border-gray-800 rounded-xl animate-fadeIn">
                    <div class="flex items-center gap-4">
                        <img src="${item.image_url}" class="w-20 h-20 object-cover rounded-lg">
                        <div>
                            <h4 class="text-white font-bold">${item.name}</h4>
                            <p class="text-[#FF8C00] font-bold">RM ${item.price.toFixed(2)}</p>
                        </div>
                    </div>
                    <button onclick="removeFromCart(${index})" class="p-2 text-gray-500 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            `;
        }
    });

    totalPriceElement.innerText = "RM " + total.toFixed(2);
}

// FUNGSI: Buang barang dari bakul
function removeFromCart(index) {
    cart.splice(index, 1); // Buang 1 barang berdasarkan index
    localStorage.setItem('mqs_cart', JSON.stringify(cart));
    renderCart(); // Lukis balik UI
}

// FUNGSI: Checkout 
// FUNGSI: Checkout (Versi Fix)
async function checkout() {
    // 1. Cek kalau bakul kosong
    let cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];
    if (cart.length === 0) return alert("Hey.. Don't you think the cart is a bit empty?");

    console.log("Processing order for MQS Delights...");

    // 2. Kira Total & Points (Guna data dari cart terus)
    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const points = Math.floor(total * 10);

    try {
        // 3. HANTAR KE SUPABASE 
        // Pastikan guna 'supabase' (bukan _supabase kalau dalam config kau 'supabase')
        const { error } = await _supabase
            .from('orders')
            .insert([
                { 
                    customer_name: 'Guest User', // Nama default
                    items: cart,                // Nama column dalam DB: items
                    total_price: total,         // Nama column dalam DB: total_price
                    points_earned: points,      // Nama column dalam DB: points_earned
                    status: 'Pending'
                }
            ]);

        if (error) throw error;

        // 4. SUCCESS! Clear cart & tunjuk tahniah
        localStorage.removeItem('mqs_cart');
        
        // Simpan point dalam localStorage (Optional)
        let userPoints = parseInt(localStorage.getItem('mqs_points')) || 0;
        localStorage.setItem('mqs_points', userPoints + points);

        alert(`🔥 ORDER SUCCESS!\n\nTotal: RM ${total.toFixed(2)}\nPoints Earned: ${points} pts\n\nThe chef is preparing your meal!`);
        
        window.location.href = '../index.html'; // Balik ke Home

    } catch (error) {
        alert("Uh oh!: " + error.message);
        console.error("Detail Error:", error);
    }
}

// 5. PENTING: Sambungkan fungsi ni dengan butang kat HTML
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('checkout-btn');
    if (btn) {
        btn.onclick = checkout; // Guna cara ni paling senang nak link
    }
});
// ==========================================
// 🚀 INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Kalau ada menu container, jalankan fetchMenu (fungsi lama kau)
    if (document.getElementById('menu-container')) {
        fetchMenu();
    }
    
    // Kalau ada cart container, jalankan renderCart
    if (document.getElementById('cart-items')) {
        renderCart();
    }
});

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const currentCart = JSON.parse(localStorage.getItem('mqs_cart')) || [];
        badge.innerText = currentCart.length;
        
        // Sembunyikan badge kalau bakul kosong
        badge.style.display = currentCart.length > 0 ? 'block' : 'none';
    }
}

// Panggil fungsi ni setiap kali user tekan "ADD TO CART"
// Tambah baris ni kat dalam fungsi addToCart() kau:
// updateCartBadge();

async function loadDashboardData() {
    const historyContainer = document.getElementById('order-history-list');
    const displayPoints = document.getElementById('display-points');

    if (!historyContainer) return; // Exit kalau bukan kat page dashboard

    // 1. Tarik semua order dari table 'orders'
    // Nota: Nanti bila dah ada sistem Login, kita filter ikut user_id
    const { data: orders, error } = await _supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error dashboard:", error);
        return;
    }

    // 2. Kira Total Points dari database
    let totalPoints = 0;
    historyContainer.innerHTML = '';

    if (orders.length === 0) {
        historyContainer.innerHTML = `<p class="text-gray-500">Kau belum pernah beli apa-apa lagi. Jom la order!</p>`;
    } else {
        orders.forEach(order => {
            totalPoints += order.points_gained;
            
            // Format tarikh bagi cantik sikit
            const date = new Date(order.created_at).toLocaleDateString('en-GB');

            historyContainer.innerHTML += `
                <div class="p-5 bg-[#1A1A1A] border-l-4 border-[#FF8C00] rounded-r-xl flex justify-between items-center transition-transform hover:scale-[1.02]">
                    <div>
                        <p class="text-xs text-gray-500 mb-1">Order #${order.id} • ${date}</p>
                        <h4 class="text-white font-bold">Total: RM ${order.total_amount.toFixed(2)}</h4>
                    </div>
                    <div class="text-right">
                        <span class="text-[#FF8C00] font-bold">+${order.points_gained} pts</span>
                        <p class="text-[10px] text-gray-600 uppercase tracking-widest mt-1">${order.status}</p>
                    </div>
                </div>
            `;
        });
    }

    // 3. Update display point kat skrin
    displayPoints.innerText = totalPoints;
}

// Tambah loadDashboardData() dalam DOMContentLoaded yang sedia ada
document.addEventListener('DOMContentLoaded', () => {
    // ... kod sedia ada kau (fetchMenu, renderCart) ...
    
    if (document.getElementById('order-history-list')) {
        loadDashboardData();
    }
});

// ==========================================
// 👨‍🍳 ADMIN KITCHEN LOGIC
// ==========================================

async function loadAdminOrders() {
    const adminContainer = document.getElementById('admin-order-list');
    if (!adminContainer) return;

    // 1. Tarik semua order & tarik info menu sekali
    const { data: orders, error: orderError } = await _supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    const { data: menuItems } = await _supabase.from('menu_items').select('id, name');

    if (orderError) return console.error(orderError);

    adminContainer.innerHTML = '';

    orders.forEach(order => {
        // Tukar ID kepada Nama Makanan (Contoh: [1, 1] -> "Signature Ribeye Steak x2")
        const itemsSummary = order.order_items.map(id => {
            const item = menuItems.find(m => m.id === id);
            return item ? item.name : 'Unknown Item';
        }).join(', ');

        const card = `
            <div class="bg-[#1A1A1A] border border-gray-800 p-6 rounded-2xl shadow-xl">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <span class="text-[10px] text-gray-500 uppercase tracking-widest">Order #${order.id}</span>
                        <h4 class="text-white font-bold text-sm">${itemsSummary}</h4>
                    </div>
                    <span class="px-2 py-1 rounded text-[10px] font-bold ${getStatusColor(order.status)}">
                        ${order.status}
                    </span>
                </div>
                
                <div class="flex gap-2 mt-6">
                    <button onclick="updateStatus(${order.id}, 'Cooking')" class="flex-1 py-2 text-[10px] bg-blue-600/10 text-blue-500 border border-blue-600/20 rounded-lg hover:bg-blue-600 hover:text-white transition-all">COOK</button>
                    <button onclick="updateStatus(${order.id}, 'Done')" class="flex-1 py-2 text-[10px] bg-green-600/10 text-green-500 border border-green-600/20 rounded-lg hover:bg-green-600 hover:text-white transition-all">DONE</button>
                </div>
            </div>
        `;
        adminContainer.innerHTML += card;
    });
}

// Fungsi bantu untuk warna status
function getStatusColor(status) {
    if (status === 'Preparing') return 'bg-orange-600/20 text-orange-500';
    if (status === 'Cooking') return 'bg-blue-600/20 text-blue-500';
    if (status === 'Done') return 'bg-green-600/20 text-green-500';
    return 'bg-gray-600/20 text-gray-500';
}

// FUNGSI: Tukar Status kat Database
async function updateStatus(orderId, newStatus) {
    const { error } = await _supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

    if (error) {
        alert("Gagal tukar status!");
    } else {
        loadAdminOrders(); // Refresh list admin
        alert(`Order #${orderId} sekarang status: ${newStatus}`);
    }
}

// Tambah dalam DOMContentLoaded sedia ada
document.addEventListener('DOMContentLoaded', () => {
    // ... kod lain kau ...
    if (document.getElementById('admin-order-list')) {
        loadAdminOrders();
    }
});
