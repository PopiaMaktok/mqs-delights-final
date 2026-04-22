/**
 * MQS Delights - Configuration File
 * Supabase Configuration & Environment Variables
 * 
 * SECURITY WARNING: This file should NOT be committed to version control
 * Create a .env file and use environment variables in production
 */

// ============================================
// SUPABASE CONFIGURATION
// ============================================

const CONFIG = {
    // Supabase Project Configuration
    SUPABASE_URL: 'https://ekhxgioklizuajkrjbmn.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_4K9LBJYZO5qYoTNUf309Hg_JpVHX8QN',
    
    // API Endpoints
    API_BASE_URL: 'https://ekhxgioklizuajkrjbmn.supabase.co',
    
    // Database Tables
    TABLES: {
        USERS: 'users',
        MENU_ITEMS: 'menu_items',
        RESERVATIONS: 'reservations',
        ORDERS: 'orders',
        CART_ITEMS: 'cart_items',
    },
    
    // Application Settings
    APP_NAME: 'MQS Delights',
    APP_VERSION: '1.0.0',
    ENVIRONMENT: 'development', // 'development' | 'production'
    
    // Feature Flags
    FEATURES: {
        ENABLE_RESERVATIONS: true,
        ENABLE_ONLINE_ORDERING: true,
        ENABLE_ANALYTICS: true,
        ENABLE_NOTIFICATIONS: true,
    },
    
    // Pagination
    PAGINATION: {
        ITEMS_PER_PAGE: 12,
        MENU_ITEMS_PER_PAGE: 15,
    },
    
    // Timeouts
    TIMEOUTS: {
        API_CALL: 30000, // 30 seconds
        SESSION: 3600000, // 1 hour
    },
    
    // Storage Keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'mqs_auth_token',
        USER_PREFERENCES: 'mqs_user_preferences',
        CART: 'mqs_cart',
    },
};

// ============================================
// ENVIRONMENT-SPECIFIC CONFIGURATION
// ============================================

if (CONFIG.ENVIRONMENT === 'production') {
    // Override with production settings if needed
    console.log('Running in PRODUCTION mode');
} else {
    console.log('Running in DEVELOPMENT mode');
}

// ============================================
// EXPORT CONFIGURATION
// ============================================

// For ES6 modules (if using module bundler)
// export default CONFIG;

// js/config.js

if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    
    // TAMBAH LINE NI: Ini yang akan "hidupkan" wayar database kau
    // Pastikan nama property (SUPABASE_URL & SUPABASE_KEY) sama macam dalam objek CONFIG kau
    window._supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    
    console.log("✓ Supabase Client initialized globally");
}

