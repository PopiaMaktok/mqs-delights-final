// 1. Inisialisasi & Cek Supabase
console.log("MQS Delights - System Initializing...");

// 2. Fungsi Ambil Data Menu dari Supabase
async function fetchMenu() {
    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) return; // Kalau bukan kat page menu, abaikan

    try {
        const { data: menuItems, error } = await supabase
            .from('menu_items')
            .select('*');

        if (error) throw error;

        // Kosongkan loading placeholder
        menuContainer.innerHTML = '';

        // Render setiap item
        menuItems.forEach(item => {
            menuContainer.innerHTML += `
                <div class="bg-[#151515] border border-gray-800 rounded-3xl overflow-hidden orange-glow transition-all duration-300 group">
                    <div class="h-52 overflow-hidden">
                        <img src="${item.image_url}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                    </div>
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-xl font-bold">${item.name}</h3>
                            <span class="text-[#FF8C00] font-black">RM ${item.price.toFixed(2)}</span>
                        </div>
                        <p class="text-gray-500 text-sm mb-6 line-clamp-2">${item.description}</p>
                        <button onclick="addToCart(${item.id}, '${item.name}', ${item.price})" 
                            class="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-[#FF8C00] hover:text-white transition duration-300">
                            ADD TO CART
                        </button>
                    </div>
                </div>
            `;
        });
        console.log("Menu successfully loaded!");
    } catch (error) {
        console.error('Error loading menu:', error);
        menuContainer.innerHTML = `<p class="text-red-500">Gagal memuatkan menu: ${error.message}</p>`;
    }
}

// 3. Fungsi Add to Cart
window.addToCart = (id, name, price) => {
    let cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }

    localStorage.setItem('mqs_cart', JSON.stringify(cart));
    updateCartCount();
    alert(`${name} ditambahkan ke cart!`);
};

// 4. Update Icon Cart
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.innerText = totalItems;
    }
}

// 5. Render Page Cart
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    if (!cartItemsContainer) return;

    const cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="border border-dashed border-gray-800 rounded-3xl p-12 text-center">
                <p class="text-gray-600 mb-4 italic">"Hey.. Your cart is a bit empty don't you think?"</p>
                <a href="menu.html" class="text-[#FF8C00] font-bold hover:underline">Let's Get Some Food!</a>
            </div>`;
        totalPriceElement.innerText = "RM 0.00";
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        cartItemsContainer.innerHTML += `
            <div class="flex justify-between items-center bg-[#151515] p-6 rounded-2xl border border-gray-800 mb-4">
                <div>
                    <h4 class="font-bold text-lg">${item.name}</h4>
                    <p class="text-gray-500 text-sm">RM ${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <button onclick="removeFromCart(${index})" class="text-red-500 hover:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        `;
    });

    totalPriceElement.innerText = `RM ${total.toFixed(2)}`;
}

window.removeFromCart = (index) => {
    let cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('mqs_cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
};

// 6. Fungsi Checkout (Detektif Version)
const handleCheckout = async () => {
    console.log("Checkout process started...");
    const cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];
    
    if (cart.length === 0) {
        alert("Pilih makanan dulu bro!");
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const points = Math.floor(total * 10);

    try {
        const { data, error } = await supabase
            .from('orders')
            .insert([{ 
                customer_name: 'Guest User',
                items: cart, 
                total_price: total,
                points_earned: points,
                status: 'Pending'
            }]);

        if (error) throw error;

        alert(`Order Berjaya! 🎉\n\nTotal: RM${total.toFixed(2)}\nPoints: ${points}\n\nTerima kasih!`);
        localStorage.removeItem('mqs_cart');
        window.location.href = '../index.html';

    } catch (error) {
        console.error('Checkout Error:', error);
        alert('Masalah teknikal: ' + error.message);
    }
};

// 7. Jalankan bila Page Load
document.addEventListener('DOMContentLoaded', () => {
    fetchMenu();
    renderCart();
    updateCartCount();

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
});
