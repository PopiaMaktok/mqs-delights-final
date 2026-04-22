// 1. Pastikan Supabase dah sedia
console.log("Checking Supabase...");
if (typeof supabase === 'undefined') {
    console.error("Aduhh! Supabase tak dijumpai. Cek config.js kau.");
} else {
    console.log("Supabase Ready!");
}

// 2. Fungsi Checkout (Detektif Version)
const handleCheckout = async () => {
    console.log("Butang Checkout ditekan!"); // Ni untuk test kalau butang 'hidup'

    const cart = JSON.parse(localStorage.getItem('mqs_cart')) || [];
    
    if (cart.length === 0) {
        alert("Cart kosonglah bro! Jom pilih steak dulu.");
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const points = Math.floor(total * 10);

    try {
        console.log("Sedang menghantar ke Supabase...");
        
        const { data, error } = await supabase
            .from('orders')
            .insert([
                { 
                    customer_name: 'Guest User',
                    items: cart, 
                    total_price: total,
                    points_earned: points,
                    status: 'Pending'
                }
            ]);

        if (error) {
            console.error("Supabase Error:", error);
            throw error;
        }

        console.log("Order Berjaya Disimpan:", data);
        alert(`Order Berjaya! 🎉\n\nTotal: RM${total}\nPoints Earned: ${points}\n\nTerima kasih support MQS!`);
        
        localStorage.removeItem('mqs_cart');
        window.location.href = '../index.html';

    } catch (error) {
        console.error('Error masa checkout:', error);
        alert('Aduh, ada masalah teknikal: ' + error.message);
    }
};

// 3. Sambungkan Butang dengan Fungsi
// Kita guna cara paling selamat untuk cari butang
document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (checkoutBtn) {
        console.log("Butang Checkout dijumpai dalam DOM!");
        checkoutBtn.addEventListener('click', handleCheckout);
    } else {
        console.warn("Butang 'checkout-btn' tak jumpa. Pastikan ID kat HTML betul.");
    }
});

// 4. (Tambahan) Fungsi Render Menu & Cart kau yang sedia ada boleh letak kat bawah ni...
// Pastikan fungsi untuk 'Add to Cart' guna key 'mqs_cart' yang sama.
