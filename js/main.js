/**
 * MQS DELIGHTS - FINAL STABLE VERSION
 */

// 1. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    console.log('MQS System: Online & Ready');
    
    if (document.getElementById('menu-container')) fetchMenu();
    if (document.getElementById('cart-items')) renderCart();

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.onclick = checkout;
    }
    
    updateCartCount();
});

// 2. FETCH MENU
async function fetchMenu() {
    const container = document.getElementById('menu-container');
    if (!container) return;

    try {
        const { data: items, error } = await _supabase.from('menu_items').select('*');
        if (error) throw error;

        container.innerHTML = ''; 
        items.forEach(item => {
            container.innerHTML += `
                <div class="bg-[#151515] border border-gray-800 rounded-3xl overflow-hidden hover:border-[#FF8C00] transition-all duration-500 group">
                    <div class="h-52 overflow-hidden">
                        <img src="${item.image_url}" onerror="this.src='https://via.placeholder.com/500x300?text=MQS+Delights'" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                    </div>
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-2">
                            <h3 class="text-xl font-bold text-white">${item.name}</h3>
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
        console.error('Menu Error:', err.message);
    }
}

// 3. CART SYSTEM
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
    alert(`🔥 ${name} entered cart!`);
};

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('total-price');
    if (!container) return;

    const cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];
    
    // DEBUG: Tengok kat Console (F12) data apa yang ada
    console.log("Isi bakul sekarang:", cart);

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-20 opacity-50 italic">
                <p>Hey.. the cart looks a bit empty don't you think?</p>
                <a href="menu.html" class="text-[#FF8C00] font-bold hover:underline">Let's Order Now!</a>
            </div>`;
        if (totalEl) totalEl.innerText = "RM 0.00";
        return;
    }

    container.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        // Pelindung: Kalau data lama tak ada harga, kita letak 0 supaya tak crash
        const price = parseFloat(item.price) || 0;
        const name = item.name || "Menu MQS";
        const qty = item.quantity || 1;
        
        total += (price * qty);

        container.innerHTML += `
            <div class="flex justify-between items-center bg-[#111] p-6 rounded-2xl border border-gray-800 mb-4 orange-glow">
                <div>
                    <h4 class="font-bold text-white text-lg">${name}</h4>
                    <p class="text-[#FF8C00] font-bold text-sm">RM ${price.toFixed(2)} x ${qty}</p>
                </div>
                <button onclick="removeFromCart(${index})" class="text-gray-600 hover:text-red-500 font-bold transition">
                    REMOVE
                </button>
            </div>`;
    });

    if (totalEl) totalEl.innerText = `RM ${total.toFixed(2)}`;
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
async function processCheckout() {
    console.log("Starting checkout process...");

    const { data: { user }, error: userError } = await _supabase.auth.getUser();

    if (userError || !user) {
        alert("Please login again.");
        window.location.href = 'login.html';
        return;
    }

    const cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];
    if (cart.length === 0) return alert("Cart is empty!");

    const totalSpent = cart.reduce((acc, item) => acc + parseFloat(item.price), 0);
    const pointsGained = Math.floor(totalSpent * 10);

    try {
        // 1. Tarik data profile untuk dapatkan Nama & Points lama
        const { data: profile } = await _supabase
            .from('profiles')
            .select('full_name, points')
            .eq('id', user.id)
            .single();

        // 2. SIMPAN KE TABEL ORDERS (Bahagian Baru!)
        const { error: orderError } = await _supabase
            .from('orders')
            .insert([
                {
                    customer_name: profile.full_name || 'Guest User',
                    items: cart, // Simpan array cart terus ke jsonb
                    total_price: totalSpent,
                    points_earned: pointsGained,
                    status: 'COMPLETED'
                }
            ]);

        if (orderError) throw orderError;

        // 3. UPDATE POINTS DI TABEL PROFILES
        const newTotalPoints = (profile.points || 0) + pointsGained;
        const { error: updateError } = await _supabase
            .from('profiles')
            .update({ points: newTotalPoints })
            .eq('id', user.id);

        if (updateError) throw updateError;

        // 4. SETEL! Kosongkan cart & hantar ke dashboard
        localStorage.removeItem('mqs_cart');
        alert(`🔥Success! Order saved ${pointsGained} points added.`);
        window.location.href = 'dashboard.html';

    } catch (err) {
        console.error("Error:", err.message);
        alert("Failed to process order: " + err.message);
    }
}

// ============================================
// LOGIK PENDAFTARAN (SIGN UP)
// ============================================

async function handleSignUp(e) {
    e.preventDefault(); // Elak page refresh

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const fullName = document.getElementById('full-name').value;

    console.log("Starting sign-up for:", email);

    try {
        // 1. DAFTAR KE SUPABASE AUTH
        const { data: authData, error: authError } = await _supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (authError) throw authError;

        const user = authData.user;

        if (user) {
            // 2. SIMPAN INFO KE TABLE PROFILES
            const { error: profileError } = await _supabase
                .from('profiles')
                .insert([
                    { 
                        id: user.id, // Gunakan ID yang sama dari Auth
                        full_name: fullName, 
                        points: 0, 
                        membership_tier: 'Bronze' 
                    }
                ]);

            if (profileError) throw profileError;

            alert("🔥 SIGN UP SUCCESSFUL!\nPlease check your email for account verification.");
            
            // Redirect ke login page lepas setel
            window.location.href = 'login.html';
        }

    } catch (err) {
        console.error("Failed to sign up:", err.message);
        alert("Oops! Sign up failed: " + err.message);
    }
}

// Sambungkan fungsi dengan borang kat HTML
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignUp);
    }
});

// ============================================
// LOGIK LOGIN
// ============================================
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const { data, error } = await _supabase.auth.signInWithPassword({
            email: email, password: password,
        });

        if (error) throw error;

        // --- LOGIK REDIRECT BERDASARKAN ROLE ---
        const { data: profile } = await _supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        if (profile && profile.role === 'admin') {
            alert("Welcome back, Admin Aqeel!");
            window.location.href = 'admin-dashboard.html'; // Terus masuk bilik gerakan
        } else {
            alert("Welcome back to MQS Delights!");
            window.location.href = 'dashboard.html'; // Masuk bilik pelanggan
        }

    } catch (err) {
        alert("Login Failed: " + err.message);
    }
}

// Update DOMContentLoaded untuk detect form login
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// ============================================
// LOGIK DASHBOARD (Tarik Data Profile)
// ============================================
async function loadDashboardData() {
    console.log("Fetching user profile...");

    // 1. Dapatkan user yang tengah login
    const { data: { user } } = await _supabase.auth.getUser();

    if (!user) {
        // Kalau tak login, tendang balik ke login page
        window.location.href = 'login.html';
        return;
    }

    // 2. Tarik data dari table profiles guna ID user
    const { data: profile, error } = await _supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error("Profile fetch error:", error);
        return;
    }

    // Letak ni selepas data profile berjaya ditarik
if (profile && profile.role === 'admin') {
    const nav = document.querySelector('nav div.space-x-8'); // Cari container menu kat navbar
    
    // Bina butang Admin Panel
    const adminLink = document.createElement('a');
    adminLink.href = 'admin-dashboard.html';
    adminLink.className = 'text-[#FF8C00] border border-[#FF8C00] px-4 py-1 rounded-full text-xs font-black animate-pulse';
    adminLink.innerText = 'ADMIN PANEL';
    
    nav.prepend(adminLink); // Letak kat depan sekali dalam menu
}

    // 3. Update UI Dashboard
    if (profile) {
        document.getElementById('user-name').innerText = profile.full_name;
        document.getElementById('user-points').innerText = profile.points;
        document.getElementById('user-tier').innerText = `${profile.membership_tier} MEMBER`;
        
        // Update Progress Bar (Contoh Silver Tier = 500 points)
        const progress = (profile.points / 500) * 100;
        document.getElementById('points-bar').style.width = `${progress}%`;
        
        const needed = 500 - profile.points;
        document.getElementById('points-needed').innerText = needed > 0 ? `${needed} PTS REMAINING` : 'GOLD TIER ACHIEVED!';
    }
}

// ============================================
// LOGIK LOGOUT
// ============================================
async function handleLogout() {
    const { error } = await _supabase.auth.signOut();
    if (error) alert(error.message);
    else {
        alert("Thank you for visiting MQS Delights.");
        window.location.href = '../index.html';
    }
}

// ============================================
// LOGIK RESERVATION (TEMPAHAN MEJA)
// ============================================
async function handleReservation(e) {
    e.preventDefault();

    // 1. Cek sesi user (mesti login baru boleh tempah)
    const { data: { user } } = await _supabase.auth.getUser();

    if (!user) {
        alert("Please log in to make a reservation.");
        window.location.href = 'login.html';
        return;
    }

    // 2. Ambil data dari form
    const resData = {
        user_id: user.id,
        reservation_date: document.getElementById('res-date').value,
        reservation_time: document.getElementById('res-time').value,
        guests: parseInt(document.getElementById('res-guests').value),
        notes: document.getElementById('res-notes').value
    };
// Tambah bahagian ni DALAM handleReservation lepas pendaftaran reservation berjaya
try {
    // ... (kod insert reservation kau tadi) ...

    // AMBIL DATA PROFILE SEMASA
    const { data: profile } = await _supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single();

    // UPDATE POINTS (+50 Points Bonus Reservation)
    const newPoints = (profile.points || 0) + 50;

    const { error: updateError } = await _supabase
        .from('profiles')
        .update({ points: newPoints })
        .eq('id', user.id);

    if (updateError) throw updateError;

    alert("🔥 RESERVATION CONFIRMED!\nBonus 50 points has been added to your account!");
    window.location.href = 'dashboard.html';

} catch (err) {
    // ... handling error ...
}
    try {
        // 3. Masukkan ke table reservations
        const { error } = await _supabase
            .from('reservations')
            .insert([resData]);

        if (error) throw error;

        // 4. Berjaya!
        alert("🔥 RESERVATION SUCCESSFUL!\nSee you at MQS Delights soon.");
        window.location.href = 'dashboard.html';

    } catch (err) {
        console.error("Error reservation:", err.message);
        alert("Failed to create reservation: " + err.message);
    }
}



// Tambah event listener dalam DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const resForm = document.getElementById('reservation-form');
    if (resForm) {
        resForm.addEventListener('submit', handleReservation);
    }
});

async function loadDashboardData() {
    const { data: { user } } = await _supabase.auth.getUser();
    if (!user) { window.location.href = 'login.html'; return; }

    // 1. Tarik Data Profile (Points/Tier)
    const { data: profile } = await _supabase.from('profiles').select('*').eq('id', user.id).single();
    
    // 2. Tarik Tempahan Terkini (Ambil 1 yang paling baru)
    const { data: reservations, error: resError } = await _supabase
        .from('reservations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

    // --- UPDATE UI PROFILE & METER ---
if (profile) {
    document.getElementById('user-name').innerText = profile.full_name;
    document.getElementById('user-points').innerText = profile.points;
    
    const tierBadge = document.getElementById('user-tier');
    const pointsBar = document.getElementById('points-bar');
    const progressLabel = document.getElementById('progress-label');
    const pointsNeeded = document.getElementById('points-needed');
    
    const pts = profile.points;
    const tier = profile.membership_tier;

    tierBadge.innerText = `${tier} MEMBER`;

    if (tier === 'Gold') {
        // Rupa untuk Gold (Max Level)
        pointsBar.style.width = '100%';
        pointsBar.style.background = 'linear-gradient(90deg, #FFD700, #FFA500)'; // Warna emas
        progressLabel.innerText = "MAX LEVEL ACHIEVED";
        pointsNeeded.innerText = "GOLD BENEFITS ACTIVE 🏆";
        
        // Warna badge emas
        tierBadge.style.background = 'linear-gradient(90deg, #FFD700, #FFA500)';
        tierBadge.style.color = 'black';

    } else if (tier === 'Silver') {
        // Progress dari Silver ke Gold (Target: 1500)
        const progress = (pts / 1500) * 100;
        pointsBar.style.width = `${Math.min(progress, 100)}%`;
        pointsBar.style.backgroundColor = '#C0C0C0'; // Warna perak
        progressLabel.innerText = "PROGRESS TO GOLD";
        pointsNeeded.innerText = `${1500 - pts} PTS REMAINING`;
        
        tierBadge.style.background = '#C0C0C0';
        tierBadge.style.color = 'black';

    } else {
        // Progress dari Bronze ke Silver (Target: 500)
        const progress = (pts / 500) * 100;
        pointsBar.style.width = `${Math.min(progress, 100)}%`;
        pointsBar.style.backgroundColor = '#FF8C00'; // Warna oren
        progressLabel.innerText = "PROGRESS TO SILVER";
        pointsNeeded.innerText = `${500 - pts} PTS REMAINING`;
        
        tierBadge.style.background = '#FF8C00';
        tierBadge.style.color = 'black';
    }
}

    // --- UPDATE UI RESERVATION ---
    const resDisplay = document.getElementById('reservation-display');
    if (reservations && reservations.length > 0) {
        const res = reservations[0];
        resDisplay.innerHTML = `
            <div class="bg-[#1A1A1A] border border-gray-800 p-6 rounded-3xl flex justify-between items-center group hover:border-[#FF8C00] transition-all">
                <div class="flex items-center space-x-6">
                    <div class="bg-[#FF8C00] text-black w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black">
                        <span class="text-xs uppercase leading-none">pax</span>
                        <span class="text-xl">${res.guests}</span>
                    </div>
                    <div>
                        <h5 class="font-bold text-white uppercase italic tracking-wider">Premium Table Reserved</h5>
                        <p class="text-gray-500 text-sm">${res.reservation_date} | ${res.reservation_time}</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-[10px] border border-[#FF8C00] text-[#FF8C00] px-3 py-1 rounded-full font-black uppercase tracking-widest">${res.status}</span>
                </div>
            </div>
        `;
    } else {
        resDisplay.innerHTML = `<p class="text-center text-gray-600 py-10 italic">No upcoming reservations. Time to book a table!</p>`;
    }
}

// Dalam loadDashboardData, selepas tarik profile:
const tierBadge = document.getElementById('user-tier');
const tier = profile.membership_tier;

tierBadge.innerText = `${tier} MEMBER`;

// Tukar warna badge ikut tahap
if (tier === 'Gold') {
    tierBadge.style.background = 'linear-gradient(90deg, #FFD700, #FFA500)';
    tierBadge.style.color = 'black';
} else if (tier === 'Silver') {
    tierBadge.style.background = '#C0C0C0';
    tierBadge.style.color = 'black';
} else {
    tierBadge.style.background = '#FF8C00'; // Bronze / Default Orange
    tierBadge.style.color = 'black';
}

// Tambah logik ni kat bahagian paling bawah loadDashboardData()
const vipSection = document.getElementById('vip-section');

if (profile.membership_tier === 'Gold') {
    vipSection.classList.remove('hidden'); // Tunjukkan kotak VIP
    console.log("VIP Content Unlocked! 🏆");
} else {
    vipSection.classList.add('hidden'); // Sembunyikan untuk Bronze/Silver
}

async function loadAdminData() {
    console.log("Loading Admin Intelligence...");

    // 1. Tarik Semua Profile
    const { data: profiles, error: pError } = await _supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false });

    // 2. Tarik Semua Reservation
    const { data: reservations, error: rError } = await _supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

    if (pError || rError) return console.error("Admin Load Error");

    // UPDATE STATS
    document.getElementById('stat-users').innerText = profiles.length;
    document.getElementById('stat-bookings').innerText = reservations.length;
    const totalPoints = profiles.reduce((acc, p) => acc + (p.points || 0), 0);
    document.getElementById('stat-points').innerText = totalPoints;

    // RENDER USERS
    const userList = document.getElementById('admin-user-list');
    userList.innerHTML = profiles.map(p => `
        <tr class="hover:bg-white/5 transition-colors">
            <td class="p-6 font-bold uppercase tracking-tighter">${p.full_name}</td>
            <td class="p-6 text-center text-[#FF8C00] font-black">${p.points}</td>
            <td class="p-6 text-center">
                <span class="px-3 py-1 rounded-full text-[10px] font-black border border-gray-700 uppercase">${p.membership_tier}</span>
            </td>
            <td class="p-6 text-right">
                <button onclick="addPointsManual('${p.id}', 50)" class="text-[10px] bg-[#FF8C00]/10 text-[#FF8C00] px-3 py-1 rounded font-bold hover:bg-[#FF8C00] hover:text-black transition">+50 PTS</button>
            </td>
        </tr>
    `).join('');

    // RENDER RESERVATIONS
    const resList = document.getElementById('admin-res-list');
    resList.innerHTML = reservations.map(r => `
        <tr class="hover:bg-white/5 transition-colors text-gray-400">
            <td class="p-6 font-bold text-white">${r.reservation_date} <span class="text-gray-600">|</span> ${r.reservation_time}</td>
            <td class="p-6 text-center font-bold">${r.guests} PAX</td>
            <td class="p-6 text-xs italic">${r.notes || '-'}</td>
            <td class="p-6 text-right">
                <span class="text-[10px] font-black text-green-500 uppercase tracking-widest">${r.status}</span>
            </td>
        </tr>
    `).join('');
}

// FUNGSI UNTUK TAMBAH POINT SECARA MANUAL (ADMIN ONLY)
async function addPointsManual(userId, amount) {
    // Tarik points lama dulu
    const { data: profile } = await _supabase.from('profiles').select('points').eq('id', userId).single();
    const newPoints = (profile.points || 0) + amount;

    // Update
    const { error } = await _supabase.from('profiles').update({ points: newPoints }).eq('id', userId);
    
    if (!error) {
        alert("Success! Points added to user.");
        loadAdminData(); // Refresh table
    }
}

// ============================================
// BOUNCER ADMIN (PAGAR KEBAL)
// ============================================
async function checkAdminGate() {
    console.log("Bouncer is checking your credentials...");

    // 1. Cek ada user login tak?
    const { data: { user } } = await _supabase.auth.getUser();

    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Tarik profile dia untuk tengok role
    const { data: profile } = await _supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // 3. Kalau role ialah 'admin', bagi masuk
    if (profile && profile.role === 'admin') {
    document.body.classList.add('access-granted'); // Untuk fade-in CSS
    
    // Panggil kedua-dua "pekerja" admin kau kat sini
    loadAdminData();   // Tarik statistik & senarai customer
    loadAdminOrders(); // Tarik senarai pesanan makanan terbaru (Live Orders)
    
    console.log("Welcome, Admin Aqeel. Access Granted. 🕶️");
} else {
    // 4. Kalau bukan admin, tendang keluar!
    alert("HEY! You don't have access to this page. Redirecting to dashboard...");
    window.location.href = 'dashboard.html';
}

async function loadAdminOrders() {
    const container = document.getElementById('admin-orders-list');
    if (!container) return;

    try {
        // Ambil 10 order terbaru dari Supabase
        const { data: orders, error } = await _supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        if (orders.length === 0) {
            container.innerHTML = `<tr><td colspan="4" class="p-10 text-center text-gray-600 italic">No orders found.</td></tr>`;
            return;
        }

        container.innerHTML = orders.map(order => {
            // Format senarai makanan dari JSONB (items)
            const itemNames = order.items.map(i => `<span class="text-white">${i.name}</span>`).join(', ');

            return `
                <tr class="border-b border-gray-800/50 hover:bg-white/5 transition-colors group">
                    <td class="p-6">
                        <p class="font-bold text-white uppercase text-xs">${order.customer_name}</p>
                        <p class="text-[9px] text-gray-600">${new Date(order.created_at).toLocaleString()}</p>
                    </td>
                    <td class="p-6 text-[10px] text-gray-400">
                        ${itemNames}
                    </td>
                    <td class="p-6 font-black italic text-[#FF8C00]">
                        RM ${parseFloat(order.total_price).toFixed(2)}
                    </td>
                    <td class="p-6 text-right">
                        <span class="bg-orange-500/10 text-[#FF8C00] px-3 py-1 rounded-full text-[10px] font-bold">
                            +${order.points_earned} PTS
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error("Failed to load orders:", err.message);
        container.innerHTML = `<tr><td colspan="4" class="p-10 text-center text-red-500">Error loading orders.</td></tr>`;
    }
}}