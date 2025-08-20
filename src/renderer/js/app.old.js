// Application principale
class QuoteApp {
    constructor() {
        this.currentUser = null;
        this.currentTab = 'dashboard';
        this.supabase = null;
        
        this.initializeApp();
    }

    async initializeApp() {
        // Initialiser Supabase
        this.initSupabase();
        
        // Récupérer les données utilisateur
        this.loadUserData();
        
        // Configurer les événements
        this.setupEventListeners();
        
        // Charger l'onglet par défaut
        await this.loadTab('dashboard');
        
        // Charger les statistiques
        this.loadStats();
    }

    initSupabase() {
        const supabaseUrl = window.supabaseAPI.getSupabaseUrl();
        const supabaseKey = window.supabaseAPI.getSupabaseKey();
        
        if (supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseKey !== 'YOUR_SUPABASE_ANON_KEY') {
            this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        }
    }

    loadUserData() {
        const userData = localStorage.getItem('userData');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUserInterface();
        }
    }

    updateUserInterface() {
        if (this.currentUser) {
            const userInitials = document.getElementById('userInitials');
            const userName = document.getElementById('userName');
            const userCompany = document.getElementById('userCompany');
            
            const firstName = this.currentUser.user_metadata?.firstName || 'U';
            const lastName = this.currentUser.user_metadata?.lastName || 'ser';
            const company = this.currentUser.user_metadata?.company || 'Mon Entreprise';
            
            userInitials.textContent = `${firstName[0]}${lastName[0]}`.toUpperCase();
            userName.textContent = `${firstName} ${lastName}`;
            userCompany.textContent = company;
        }
    }

    setupEventListeners() {
        // Boutons de contrôle de fenêtre
        document.getElementById('minimizeBtn').addEventListener('click', () => {
            window.electronAPI.minimizeWindow();
        });

        document.getElementById('maximizeBtn').addEventListener('click', () => {
            window.electronAPI.toggleMaximizeWindow();
        });

        document.getElementById('closeBtn').addEventListener('click', () => {
            window.electronAPI.quitApp();
        });

        // Navigation dans la sidebar
        const sidebarItems = document.querySelectorAll('.sidebar-item[data-tab]');
        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                this.switchTab(item.dataset.tab);
            });
        });

        // Actions du menu
        window.electronAPI.onMenuAction((event, action) => {
            this.handleMenuAction(action);
        });

        // Gestion de la modale
        const modal = document.getElementById('modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    async switchTab(tabName) {
        // Mettre à jour la navigation
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        this.currentTab = tabName;
        await this.loadTab(tabName);
    }

    async loadTab(tabName) {
        this.showLoading(true);
        
        try {
            const tabContent = document.getElementById('tabContent');
            
            switch (tabName) {
                case 'dashboard':
                    tabContent.innerHTML = await this.loadDashboard();
                    break;
                case 'quotes':
                    tabContent.innerHTML = await this.loadQuotes();
                    this.setupQuotesEvents();
                    break;
                case 'clients':
                    tabContent.innerHTML = await this.loadClients();
                    this.setupClientsEvents();
                    break;
                case 'products':
                    tabContent.innerHTML = await this.loadProducts();
                    this.setupProductsEvents();
                    break;
                case 'suppliers':
                    tabContent.innerHTML = await this.loadSuppliers();
                    this.setupSuppliersEvents();
                    break;
                case 'settings':
                    tabContent.innerHTML = await this.loadSettings();
                    this.setupSettingsEvents();
                    break;
                default:
                    tabContent.innerHTML = '<div class="p-8 text-center">Section en construction</div>';
            }
        } finally {
            this.showLoading(false);
        }
    }

    // Chargement des différentes sections
    async loadDashboard() {
        return `
            <div class="p-8 space-y-8">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">Tableau de bord</h1>
                        <p class="text-gray-600 mt-1">Vue d'ensemble de votre activité</p>
                    </div>
                    <button id="newQuoteBtn" class="btn-primary">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Nouveau devis
                    </button>
                </div>

                <!-- Statistiques -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="card p-6">
                        <div class="flex items-center">
                            <div class="p-2 bg-primary-100 rounded-lg">
                                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                            <div class="ml-4">
                                <p class="text-2xl font-bold text-gray-900" id="totalQuotes">0</p>
                                <p class="text-gray-600">Devis</p>
                            </div>
                        </div>
                    </div>

                    <div class="card p-6">
                        <div class="flex items-center">
                            <div class="p-2 bg-green-100 rounded-lg">
                                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                            <div class="ml-4">
                                <p class="text-2xl font-bold text-gray-900" id="totalClients">0</p>
                                <p class="text-gray-600">Clients</p>
                            </div>
                        </div>
                    </div>

                    <div class="card p-6">
                        <div class="flex items-center">
                            <div class="p-2 bg-blue-100 rounded-lg">
                                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                </svg>
                            </div>
                            <div class="ml-4">
                                <p class="text-2xl font-bold text-gray-900" id="totalProducts">0</p>
                                <p class="text-gray-600">Produits</p>
                            </div>
                        </div>
                    </div>

                    <div class="card p-6">
                        <div class="flex items-center">
                            <div class="p-2 bg-yellow-100 rounded-lg">
                                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                </svg>
                            </div>
                            <div class="ml-4">
                                <p class="text-2xl font-bold text-gray-900" id="totalRevenue">0 €</p>
                                <p class="text-gray-600">Chiffre d'affaires</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Devis récents -->
                <div class="card">
                    <div class="p-6 border-b border-gray-200">
                        <h2 class="text-lg font-semibold text-gray-900">Devis récents</h2>
                    </div>
                    <div class="p-6">
                        <div id="recentQuotes" class="space-y-4">
                            <div class="text-gray-500 text-center py-8">Aucun devis récent</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadQuotes() {
        return `
            <div class="p-8 space-y-6">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Gestion des Devis</h1>
                        <p class="text-gray-600 mt-1">Créer et gérer vos devis</p>
                    </div>
                    <button id="newQuoteBtn" class="btn-primary">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Nouveau devis
                    </button>
                </div>

                <!-- Filtres et recherche -->
                <div class="card p-6">
                    <div class="flex flex-wrap gap-4 items-center">
                        <div class="flex-1 min-w-64">
                            <input type="text" id="quotesSearch" class="input-field" 
                                   placeholder="Rechercher un devis...">
                        </div>
                        <select id="quotesStatus" class="input-field w-48">
                            <option value="">Tous les statuts</option>
                            <option value="draft">Brouillon</option>
                            <option value="sent">Envoyé</option>
                            <option value="accepted">Accepté</option>
                            <option value="rejected">Rejeté</option>
                        </select>
                        <button id="exportQuotesBtn" class="btn-secondary">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            Exporter
                        </button>
                    </div>
                </div>

                <!-- Liste des devis -->
                <div class="card">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        N° Devis
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Client
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Montant
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="quotesTableBody" class="bg-white divide-y divide-gray-200">
                                <!-- Les devis seront chargés ici -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // Autres méthodes de chargement (clients, produits, etc.)
    async loadClients() {
        return `
            <div class="p-8 space-y-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Gestion des Clients</h1>
                        <p class="text-gray-600 mt-1">Gérer votre base client</p>
                    </div>
                    <button id="newClientBtn" class="btn-primary">Nouveau client</button>
                </div>
                
                <div class="card p-6">
                    <input type="text" id="clientsSearch" class="input-field" 
                           placeholder="Rechercher un client...">
                </div>
                
                <div class="card">
                    <div id="clientsList" class="p-6">
                        <div class="text-gray-500 text-center py-8">Chargement...</div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadProducts() {
        return `<div class="p-8"><h1 class="text-2xl font-bold">Produits</h1><p class="text-gray-600">Section en développement</p></div>`;
    }

    async loadSuppliers() {
        return `<div class="p-8"><h1 class="text-2xl font-bold">Fournisseurs</h1><p class="text-gray-600">Section en développement</p></div>`;
    }

    async loadSettings() {
        return `<div class="p-8"><h1 class="text-2xl font-bold">Paramètres</h1><p class="text-gray-600">Section en développement</p></div>`;
    }

    // Event handlers pour les différentes sections
    setupQuotesEvents() {
        // Sera implémenté
    }

    setupClientsEvents() {
        // Sera implémenté
    }

    setupProductsEvents() {
        // Sera implémenté
    }

    setupSuppliersEvents() {
        // Sera implémenté
    }

    setupSettingsEvents() {
        // Sera implémenté
    }

    // Statistiques et données
    async loadStats() {
        // En mode démo, utiliser des données factices
        if (!this.supabase) {
            this.updateStatsDisplay({
                quotes: 12,
                clients: 8,
                products: 24,
                revenue: 15650
            });
            return;
        }
        
        // Implémenter le chargement des vraies statistiques depuis Supabase
    }

    updateStatsDisplay(stats) {
        const elements = {
            totalQuotes: document.getElementById('totalQuotes'),
            totalClients: document.getElementById('totalClients'),
            totalProducts: document.getElementById('totalProducts'),
            totalRevenue: document.getElementById('totalRevenue'),
            quotesCount: document.getElementById('quotesCount'),
            clientsCount: document.getElementById('clientsCount'),
            productsCount: document.getElementById('productsCount')
        };

        if (elements.totalQuotes) elements.totalQuotes.textContent = stats.quotes;
        if (elements.totalClients) elements.totalClients.textContent = stats.clients;
        if (elements.totalProducts) elements.totalProducts.textContent = stats.products;
        if (elements.totalRevenue) elements.totalRevenue.textContent = `${stats.revenue.toLocaleString()} €`;
        if (elements.quotesCount) elements.quotesCount.textContent = stats.quotes;
        if (elements.clientsCount) elements.clientsCount.textContent = stats.clients;
        if (elements.productsCount) elements.productsCount.textContent = stats.products;
    }

    // Actions du menu
    handleMenuAction(action) {
        switch (action) {
            case 'new-quote':
                this.openQuoteModal();
                break;
            case 'export-pdf':
                this.exportToPDF();
                break;
            case 'export-csv':
                this.exportToCSV();
                break;
            case 'about':
                this.showAboutModal();
                break;
        }
    }

    // Utilitaires
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    openModal(content) {
        const modal = document.getElementById('modal');
        const modalContent = document.getElementById('modalContent');
        modalContent.innerHTML = content;
        modal.classList.remove('hidden');
    }

    closeModal() {
        const modal = document.getElementById('modal');
        modal.classList.add('hidden');
    }

    openQuoteModal() {
        // Sera implémenté
        console.log('Ouverture du modal de devis');
    }

    exportToPDF() {
        console.log('Export PDF');
    }

    exportToCSV() {
        console.log('Export CSV');
    }

    showAboutModal() {
        this.openModal(`
            <div class="p-6">
                <h2 class="text-xl font-bold mb-4">À propos</h2>
                <p>Logiciel de Devis v2.0.0</p>
                <p>Application moderne de gestion de devis</p>
                <button onclick="app.closeModal()" class="btn-primary mt-4">Fermer</button>
            </div>
        `);
    }
}

// Initialiser l'application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new QuoteApp();
});
