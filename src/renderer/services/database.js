// Service de base de données
class DatabaseService {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.isConnected = false;
    }

    // Initialiser la connexion Supabase
    async initialize() {
        try {
            // Attendre que supabaseAPI soit disponible
            let attempts = 0;
            while (!window.supabaseAPI && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.supabaseAPI) {
                console.log('🔄 Mode démo : supabaseAPI non disponible');
                this.isConnected = false;
                return false;
            }
            
            if (!window.supabaseAPI.isConfigured()) {
                console.log('🔄 Mode démo : Supabase non configuré');
                this.isConnected = false;
                return false;
            }

            const supabaseUrl = window.supabaseAPI.getSupabaseUrl();
            const supabaseKey = window.supabaseAPI.getSupabaseKey();
            
            // Attendre que Supabase soit disponible
            attempts = 0;
            while (!window.supabase && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.supabase) {
                console.error('❌ Supabase client non disponible');
                this.isConnected = false;
                return false;
            }

            this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
            
            // Vérifier la connexion
            const { data, error } = await this.supabase.from('clients').select('count', { count: 'exact' });
            
            if (error) {
                console.error('❌ Erreur de connexion Supabase:', error);
                this.isConnected = false;
                return false;
            }

            console.log('✅ Connexion Supabase établie');
            this.isConnected = true;
            return true;

        } catch (error) {
            console.error('❌ Erreur d\'initialisation Supabase:', error);
            this.isConnected = false;
            return false;
        }
    }

    // Définir l'utilisateur current
    setCurrentUser(user) {
        this.currentUser = user;
    }

    // Vérifier si connecté à la vraie DB
    isRealDatabase() {
        return this.isConnected && this.supabase;
    }

    // === GESTION DES CLIENTS ===
    async getClients() {
        if (!this.isRealDatabase()) {
            return this.getMockClients();
        }

        try {
            const { data, error } = await this.supabase
                .from('clients')
                .select('*')
                .order('name');

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Erreur lors du chargement des clients:', error);
            throw error;
        }
    }

    async createClient(clientData) {
        if (!this.isRealDatabase()) {
            return this.createMockClient(clientData);
        }

        try {
            const { data, error } = await this.supabase
                .from('clients')
                .insert([{
                    ...clientData,
                    user_id: this.currentUser.id
                }])
                .select()
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Erreur lors de la création du client:', error);
            throw error;
        }
    }

    async updateClient(clientId, clientData) {
        if (!this.isRealDatabase()) {
            return this.updateMockClient(clientId, clientData);
        }

        try {
            const { data, error } = await this.supabase
                .from('clients')
                .update(clientData)
                .eq('id', clientId)
                .select()
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Erreur lors de la mise à jour du client:', error);
            throw error;
        }
    }

    async deleteClient(clientId) {
        if (!this.isRealDatabase()) {
            return this.deleteMockClient(clientId);
        }

        try {
            const { error } = await this.supabase
                .from('clients')
                .delete()
                .eq('id', clientId);

            if (error) throw error;
            return true;

        } catch (error) {
            console.error('Erreur lors de la suppression du client:', error);
            throw error;
        }
    }

    // === GESTION DES PRODUITS ===
    async getProducts() {
        if (!this.isRealDatabase()) {
            return this.getMockProducts();
        }

        try {
            const { data, error } = await this.supabase
                .from('products')
                .select('*')
                .eq('active', true)
                .order('name');

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Erreur lors du chargement des produits:', error);
            throw error;
        }
    }

    async createProduct(productData) {
        if (!this.isRealDatabase()) {
            return this.createMockProduct(productData);
        }

        try {
            const { data, error } = await this.supabase
                .from('products')
                .insert([{
                    ...productData,
                    user_id: this.currentUser.id
                }])
                .select()
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Erreur lors de la création du produit:', error);
            throw error;
        }
    }

    // === GESTION DES DEVIS ===
    async getQuotes() {
        if (!this.isRealDatabase()) {
            return this.getMockQuotes();
        }

        try {
            const { data, error } = await this.supabase
                .from('quotes')
                .select(`
                    *,
                    clients (
                        name
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Erreur lors du chargement des devis:', error);
            throw error;
        }
    }

    async createQuote(quoteData) {
        if (!this.isRealDatabase()) {
            return this.createMockQuote(quoteData);
        }

        try {
            // Générer le numéro de devis
            const { data: quoteNumber, error: numberError } = await this.supabase
                .rpc('generate_quote_number', { p_user_id: this.currentUser.id });

            if (numberError) throw numberError;

            const { data, error } = await this.supabase
                .from('quotes')
                .insert([{
                    ...quoteData,
                    quote_number: quoteNumber,
                    user_id: this.currentUser.id
                }])
                .select()
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Erreur lors de la création du devis:', error);
            throw error;
        }
    }

    // === STATISTIQUES ===
    async getStats() {
        if (!this.isRealDatabase()) {
            return this.getMockStats();
        }

        try {
            const [clientsResult, productsResult, quotesResult, revenueResult] = await Promise.all([
                this.supabase.from('clients').select('count', { count: 'exact' }),
                this.supabase.from('products').select('count', { count: 'exact' }).eq('active', true),
                this.supabase.from('quotes').select('count', { count: 'exact' }),
                this.supabase.from('quotes').select('total_ttc').eq('status', 'accepted')
            ]);

            const revenue = revenueResult.data?.reduce((sum, quote) => sum + (parseFloat(quote.total_ttc) || 0), 0) || 0;

            return {
                clients: clientsResult.count || 0,
                products: productsResult.count || 0,
                quotes: quotesResult.count || 0,
                revenue: revenue
            };

        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
            return this.getMockStats();
        }
    }

    // === DONNÉES DE DÉMONSTRATION ===
    getMockClients() {
        return [
            {
                id: '1',
                name: 'Entreprise ABC',
                email: 'contact@abc.com',
                phone: '01 23 45 67 89',
                city: 'Paris'
            },
            {
                id: '2',
                name: 'Société XYZ',
                email: 'info@xyz.fr',
                phone: '02 34 56 78 90',
                city: 'Lyon'
            }
        ];
    }

    getMockProducts() {
        return [
            {
                id: '1',
                name: 'Consultation',
                description: 'Consultation technique',
                unit_price: 80.00,
                unit: 'heure'
            },
            {
                id: '2',
                name: 'Développement',
                description: 'Développement logiciel',
                unit_price: 95.00,
                unit: 'heure'
            }
        ];
    }

    getMockQuotes() {
        return [
            {
                id: '1',
                quote_number: 'DEV-0001',
                clients: { name: 'Entreprise ABC' },
                quote_date: '2025-08-15',
                status: 'sent',
                total_ttc: 1200.00
            },
            {
                id: '2',
                quote_number: 'DEV-0002',
                clients: { name: 'Société XYZ' },
                quote_date: '2025-08-18',
                status: 'draft',
                total_ttc: 850.00
            }
        ];
    }

    getMockStats() {
        return {
            clients: 8,
            products: 12,
            quotes: 24,
            revenue: 15650
        };
    }

    createMockClient(clientData) {
        console.log('Mode démo: création client', clientData);
        return { id: Date.now().toString(), ...clientData };
    }

    createMockProduct(productData) {
        console.log('Mode démo: création produit', productData);
        return { id: Date.now().toString(), ...productData };
    }

    createMockQuote(quoteData) {
        console.log('Mode démo: création devis', quoteData);
        return { 
            id: Date.now().toString(), 
            quote_number: `DEV-${String(Date.now()).slice(-4)}`,
            ...quoteData 
        };
    }
}

// Exposer la classe globalement pour l'initialisation
window.DatabaseService = DatabaseService;
console.log('📋 DatabaseService classe exposée');

// Instance globale
window.dbService = new DatabaseService();
console.log('📋 Instance dbService créée');
