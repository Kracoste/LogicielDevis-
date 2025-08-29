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
        // FORCER LA VRAIE BASE DE DONNÉES - DEBUG
        const hasSupabase = !!this.supabase;
        const hasAPI = !!window.supabaseAPI;
        const isConfigured = hasAPI && window.supabaseAPI.isConfigured();
        const isConnected = this.isConnected;
        
        console.log('🔍 [DEBUG] isRealDatabase vérifications:');
        console.log('  - this.supabase:', hasSupabase);
        console.log('  - window.supabaseAPI:', hasAPI);
        console.log('  - isConfigured():', isConfigured);
        console.log('  - isConnected:', isConnected);
        
        // FORCER LE MODE RÉEL si Supabase est disponible
        return hasSupabase && isConnected;
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
        console.log('📋 [getQuotes] Début...');
        
        // FORCER L'UTILISATION DE SUPABASE COMME POUR createQuote
        if (!this.supabase) {
            console.log('❌ [getQuotes] Supabase non disponible, initialisation...');
            
            // Essayer d'initialiser
            if (window.supabaseAPI && window.supabaseAPI.isConfigured()) {
                const supabaseUrl = window.supabaseAPI.getSupabaseUrl();
                const supabaseKey = window.supabaseAPI.getSupabaseKey();
                
                console.log('🔑 [getQuotes] Configuration trouvée, URL:', supabaseUrl);
                
                if (window.supabase) {
                    this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
                    console.log('✅ [getQuotes] Supabase initialisé en mode forcé');
                } else {
                    console.error('❌ [getQuotes] window.supabase non disponible');
                    return this.getMockQuotes();
                }
            } else {
                console.error('❌ [getQuotes] Configuration Supabase non disponible');
                return this.getMockQuotes();
            }
        }

        try {
            console.log('🚀 [getQuotes] === TENTATIVE RÉCUPÉRATION SUPABASE ===');
            
            const { data, error } = await this.supabase
                .from('quotes')
                .select(`
                    *,
                    clients (
                        name
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ [getQuotes] Erreur Supabase:', error);
                throw error;
            }
            
            console.log('✅ [getQuotes] Données récupérées de Supabase:', data);
            
            // 🔧 CORRECTION: Récupérer les prestations (quote_lines) pour chaque devis
            console.log('🔍 [getQuotes] Récupération des prestations pour chaque devis...');
            
            for (let i = 0; i < data.length; i++) {
                const quote = data[i];
                console.log(`📋 [getQuotes] Recherche prestations pour devis ${quote.id}...`);
                
                try {
                    const { data: quoteLines, error: linesError } = await this.supabase
                        .from('quote_lines')
                        .select('*')
                        .eq('quote_id', quote.id)
                        .order('line_order');
                    
                    if (linesError) {
                        console.log(`⚠️ [getQuotes] Erreur récupération prestations devis ${quote.id}:`, linesError);
                        quote.services = [];
                    } else if (!quoteLines || quoteLines.length === 0) {
                        console.log(`ℹ️ [getQuotes] Aucune prestation trouvée pour devis ${quote.id}`);
                        quote.services = [];
                    } else {
                        // Transformer les quote_lines en format services
                        quote.services = quoteLines.map(line => ({
                            description: line.description,
                            quantity: line.quantity,
                            price: line.unit_price_ht,
                            unit: ''
                        }));
                        console.log(`✅ [getQuotes] ${quote.services.length} prestations récupérées pour devis ${quote.id}`);
                    }
                } catch (lineError) {
                    console.error(`❌ [getQuotes] Exception lors récupération prestations devis ${quote.id}:`, lineError);
                    quote.services = [];
                }
            }
            
            console.log('✅ [getQuotes] Tous les devis avec prestations chargés');
            return data;

        } catch (error) {
            console.error('❌ [getQuotes] Erreur lors du chargement des devis:', error);
            console.log('⚠️ [getQuotes] Fallback vers données mock');
            return this.getMockQuotes();
        }
    }

    async createQuote(quoteData) {
        console.log('🚀 [createQuote] === DÉBUT CRÉATION DEVIS ===');
        console.log('📊 Données reçues:', JSON.stringify(quoteData, null, 2));
        
        // FORCER LA VRAIE BASE DE DONNÉES - DEBUG
        console.log('🔧 FORCE: Utilisation obligatoire de Supabase');
        console.log('🔍 État actuel:');
        console.log('  - this.supabase:', !!this.supabase);
        console.log('  - this.currentUser:', !!this.currentUser);
        console.log('  - window.supabaseAPI:', !!window.supabaseAPI);
        console.log('  - supabaseAPI.isConfigured:', window.supabaseAPI ? window.supabaseAPI.isConfigured() : 'N/A');
        
        // Vérifier si Supabase est disponible
        if (!this.supabase) {
            console.error('❌ Supabase non disponible, initialisation...');
            
            // Essayer d'initialiser
            if (window.supabaseAPI && window.supabaseAPI.isConfigured()) {
                const supabaseUrl = window.supabaseAPI.getSupabaseUrl();
                const supabaseKey = window.supabaseAPI.getSupabaseKey();
                
                console.log('🔑 Configuration trouvée, URL:', supabaseUrl);
                
                if (window.supabase) {
                    this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
                    console.log('✅ Supabase initialisé en mode forcé');
                } else {
                    console.error('❌ window.supabase non disponible');
                    return this.createMockQuote(quoteData);
                }
            } else {
                console.error('❌ Configuration Supabase non disponible');
                return this.createMockQuote(quoteData);
            }
        }
        
        // Vérifier l'utilisateur
        if (!this.currentUser) {
            console.error('❌ Pas d\'utilisateur connecté - tentative de récupération...');
            
            // Essayer de récupérer l'utilisateur depuis AuthService
            if (window.authService) {
                console.log('🔍 Tentative de récupération utilisateur via AuthService...');
                try {
                    const user = await window.authService.getCurrentUser();
                    if (user) {
                        console.log('✅ Utilisateur récupéré:', user.email);
                        this.setCurrentUser(user);
                    } else {
                        console.error('❌ Aucun utilisateur dans AuthService');
                        return this.createMockQuote(quoteData);
                    }
                } catch (error) {
                    console.error('❌ Erreur récupération utilisateur:', error);
                    return this.createMockQuote(quoteData);
                }
            } else {
                console.error('❌ AuthService non disponible');
                return this.createMockQuote(quoteData);
            }
        }

        try {
            console.log('🚀 === TENTATIVE CRÉATION SUPABASE ===');
            console.log('👤 Utilisateur final:', this.currentUser.email);
            console.log('🆔 ID utilisateur:', this.currentUser.id);
            console.log('📋 Données à insérer:', quoteData);
            
            // Créer directement sans générer de numéro (simplification)
            const quoteNumberSimple = 'DEV-' + Date.now();
            
            const insertData = {
                user_id: this.currentUser.id,
                quote_number: quoteNumberSimple,
                status: 'draft',
                notes: quoteData.notes || '',
                subtotal_ht: quoteData.totalHT || 0,
                tax_amount: quoteData.totalTVA || 0,
                total_ttc: quoteData.totalTTC || 0,
                quote_date: new Date().toISOString().split('T')[0],
                // Ajouter les informations client
                client_name: quoteData.clientName || '',
                client_email: quoteData.clientEmail || '',
                client_phone: quoteData.clientPhone || '',
                client_address: quoteData.clientAddress || ''
            };
            
            console.log('📊 Données à insérer:', insertData);
            
            const { data, error } = await this.supabase
                .from('quotes')
                .insert([insertData])
                .select()
                .single();

            if (error) {
                console.error('❌ Erreur Supabase:', error);
                console.error('❌ Erreur détaillée:', JSON.stringify(error, null, 2));
                console.error('❌ Message erreur:', error.message);
                console.error('❌ Code erreur:', error.code);
                console.error('❌ Détails erreur:', error.details);
                throw error;
            }
            
            console.log('✅ Devis créé dans Supabase:', data);
            
            // Créer les lignes de devis (quote_lines) si il y a des services
            if (quoteData.services && Array.isArray(quoteData.services) && quoteData.services.length > 0) {
                console.log('📋 Création des lignes de devis...', quoteData.services);
                
                const quoteLines = quoteData.services.map((service, index) => ({
                    quote_id: data.id,
                    line_order: index + 1,
                    description: service.description || '',
                    quantity: service.quantity || 1,
                    unit_price_ht: service.price || 0,
                    tax_rate: 20.00 // TVA par défaut de 20%
                    // Ne pas inclure total_ht car c'est calculé automatiquement par la DB
                }));
                
                console.log('📊 [createQuote] Données à insérer dans quote_lines:', quoteLines);
                
                const { data: linesData, error: linesError } = await this.supabase
                    .from('quote_lines')
                    .insert(quoteLines);
                
                // DIAGNOSTIC ULTRA-DÉTAILLÉ
                console.log('🔍 [DEBUG] Résultat insertion quote_lines:');
                console.log('  - linesData:', linesData);
                console.log('  - linesError:', linesError);
                console.log('  - Type linesData:', typeof linesData);
                console.log('  - linesData est null?', linesData === null);
                console.log('  - linesData est undefined?', linesData === undefined);
                console.log('  - JSON linesData:', JSON.stringify(linesData));
                console.log('  - JSON linesError:', JSON.stringify(linesError, null, 2));
                
                if (linesError) {
                    console.error('⚠️ Erreur lors de la création des lignes:', linesError);
                    console.error('⚠️ Détails erreur lignes:', JSON.stringify(linesError, null, 2));
                    // Ne pas faire échouer tout le devis pour ça
                } else {
                    console.log('✅ Lignes de devis créées avec succès:', linesData);
                    
                    // VÉRIFICATION IMMÉDIATE: tenter de récupérer les lignes qu'on vient de créer
                    console.log('🔍 [VERIFICATION] Tentative récupération immédiate des lignes...');
                    try {
                        const { data: verifyLines, error: verifyError } = await this.supabase
                            .from('quote_lines')
                            .select('*')
                            .eq('quote_id', data.id);
                        
                        console.log('🔍 [VERIFICATION] Résultat vérification:');
                        console.log('  - verifyLines:', verifyLines);
                        console.log('  - verifyError:', verifyError);
                        console.log('  - Nombre de lignes trouvées:', verifyLines ? verifyLines.length : 0);
                        
                        if (verifyError) {
                            console.error('❌ [VERIFICATION] Erreur récupération:', verifyError);
                        } else if (!verifyLines || verifyLines.length === 0) {
                            console.error('❌ [VERIFICATION] AUCUNE LIGNE TROUVÉE après insertion !');
                        } else {
                            console.log('✅ [VERIFICATION] Lignes retrouvées:', verifyLines);
                        }
                    } catch (verifyErr) {
                        console.error('❌ [VERIFICATION] Exception:', verifyErr);
                    }
                }
            } else {
                console.log('⚠️ Aucun service à sauvegarder:', {
                    hasServices: !!quoteData.services,
                    isArray: Array.isArray(quoteData.services),
                    length: quoteData.services ? quoteData.services.length : 0,
                    services: quoteData.services
                });
            }
            
            return data;

        } catch (error) {
            console.error('❌ Erreur lors de la création du devis:', error);
            console.error('❌ Stack:', error.stack);
            
            // En cas d'erreur, utiliser le mode mock comme fallback
            console.log('🔄 Fallback vers mode mock');
            return this.createMockQuote(quoteData);
        }
    }

    // Alias pour compatibilité
    async getAllQuotes() {
        return await this.getQuotes();
    }

    async getQuoteById(quoteId) {
        console.log('🔍 [getQuoteById] Récupération du devis:', quoteId);
        
        // FORCER L'UTILISATION DE SUPABASE
        if (!this.supabase) {
            console.log('❌ [getQuoteById] Supabase non disponible, initialisation...');
            
            // Essayer d'initialiser
            if (window.supabaseAPI && window.supabaseAPI.isConfigured()) {
                const supabaseUrl = window.supabaseAPI.getSupabaseUrl();
                const supabaseKey = window.supabaseAPI.getSupabaseKey();
                
                if (window.supabase) {
                    this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
                    console.log('✅ [getQuoteById] Supabase initialisé');
                } else {
                    console.error('❌ [getQuoteById] window.supabase non disponible');
                    return null;
                }
            } else {
                console.error('❌ [getQuoteById] Configuration Supabase non disponible');
                return null;
            }
        }

        try {
            console.log('🚀 [getQuoteById] === TENTATIVE RÉCUPÉRATION SUPABASE ===');
            
            // D'abord récupérer le devis de base
            const { data: quote, error: quoteError } = await this.supabase
                .from('quotes')
                .select(`
                    *,
                    clients (
                        name
                    )
                `)
                .eq('id', quoteId)
                .single();

            if (quoteError) {
                console.error('❌ [getQuoteById] Erreur récupération devis:', quoteError);
                console.error('❌ [getQuoteById] Détail erreur:', JSON.stringify(quoteError, null, 2));
                throw quoteError;
            }
            
            console.log('✅ [getQuoteById] Devis récupéré:', quote);
            console.log('🔍 [getQuoteById] Détails du devis récupéré:', JSON.stringify(quote, null, 2));
            
            // Ensuite récupérer les lignes de devis (quote_lines)
            console.log('🔍 [getQuoteById] Recherche des lignes pour quote_id:', quoteId);
            const { data: quoteLines, error: linesError } = await this.supabase
                .from('quote_lines')
                .select('*')
                .eq('quote_id', quoteId)
                .order('line_order');
            
            console.log('📊 [getQuoteById] Résultat requête quote_lines:', {
                data: quoteLines,
                error: linesError,
                count: quoteLines ? quoteLines.length : 0
            });
            
            if (linesError) {
                console.log('⚠️ [getQuoteById] Erreur récupération lignes:', linesError);
                // Continuer même s'il n'y a pas de lignes
                quote.services = [];
            } else if (!quoteLines || quoteLines.length === 0) {
                console.log('⚠️ [getQuoteById] Aucune ligne de devis trouvée pour ce devis');
                quote.services = [];
            } else {
                // Transformer les quote_lines en format services pour compatibilité
                quote.services = quoteLines.map(line => ({
                    description: line.description,
                    quantity: line.quantity,
                    price: line.unit_price_ht,
                    unit: '' // Ajouter un champ unit vide par défaut
                }));
                console.log('✅ [getQuoteById] Lignes de devis récupérées et transformées:', quote.services);
            }
            
            return quote;

        } catch (error) {
            console.error('❌ [getQuoteById] Erreur lors de la récupération du devis:', error);
            return null;
        }
    }

    async updateQuote(quoteId, quoteData) {
        console.log('📝 [updateQuote] === DÉBUT MISE À JOUR DEVIS ===');
        console.log('📊 Données reçues:', JSON.stringify({
            id: quoteId,
            clientName: quoteData.clientName,
            servicesCount: quoteData.services ? quoteData.services.length : 0,
            totalTTC: quoteData.totalTTC
        }, null, 2));
        
        try {
            // Vérifier que Supabase est disponible
            if (!this.supabase) {
                console.log('❌ [updateQuote] Supabase non disponible, initialisation...');
                
                if (window.supabaseAPI && window.supabaseAPI.isConfigured()) {
                    const supabaseUrl = window.supabaseAPI.getSupabaseUrl();
                    const supabaseKey = window.supabaseAPI.getSupabaseKey();
                    this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
                    console.log('✅ [updateQuote] Supabase initialisé');
                } else {
                    console.error('❌ [updateQuote] Configuration Supabase non disponible');
                    throw new Error('Configuration Supabase non disponible');
                }
            }
            
            console.log('🚀 [updateQuote] === TENTATIVE MISE À JOUR SUPABASE ===');
            
            // Préparer les données du devis principal
            const quoteUpdateData = {
                client_name: quoteData.clientName || '',
                client_email: quoteData.clientEmail || '',
                client_phone: quoteData.clientPhone || '',
                client_address: quoteData.clientAddress || '',
                quote_date: quoteData.quoteDate || new Date().toISOString().split('T')[0],
                notes: quoteData.notes || '',
                subtotal_ht: quoteData.totalHT || 0,
                tax_amount: quoteData.totalTVA || 0,
                total_ttc: quoteData.totalTTC || 0,
                updated_at: new Date().toISOString()
            };
            
            console.log('📊 [updateQuote] Données du devis à mettre à jour:', quoteUpdateData);
            
            // Mettre à jour le devis principal
            const { data, error } = await this.supabase
                .from('quotes')
                .update(quoteUpdateData)
                .eq('id', quoteId)
                .select()
                .single();
            
            if (error) {
                console.error('❌ [updateQuote] Erreur mise à jour devis:', error);
                throw error;
            }
            
            console.log('✅ [updateQuote] Devis principal mis à jour:', data);
            
            // Gérer les prestations (quote_lines)
            if (quoteData.services && Array.isArray(quoteData.services) && quoteData.services.length > 0) {
                console.log('📊 [updateQuote] Mise à jour de', quoteData.services.length, 'prestations');
                
                // 1. Supprimer toutes les anciennes prestations
                const { error: deleteError } = await this.supabase
                    .from('quote_lines')
                    .delete()
                    .eq('quote_id', quoteId);
                
                if (deleteError) {
                    console.error('⚠️ [updateQuote] Erreur suppression anciennes prestations:', deleteError);
                } else {
                    console.log('✅ [updateQuote] Anciennes prestations supprimées');
                }
                
                // 2. Créer les nouvelles prestations
                const quoteLines = quoteData.services.map((service, index) => ({
                    quote_id: quoteId,
                    line_order: index + 1,
                    description: service.description || '',
                    quantity: service.quantity || 1,
                    unit_price_ht: service.price || 0,
                    tax_rate: 20.00 // TVA par défaut de 20%
                    // Ne pas inclure total_ht car c'est calculé automatiquement par la DB
                }));
                
                console.log('📊 [updateQuote] Nouvelles prestations à insérer:', quoteLines);
                
                const { data: linesData, error: linesError } = await this.supabase
                    .from('quote_lines')
                    .insert(quoteLines);
                
                if (linesError) {
                    console.error('⚠️ [updateQuote] Erreur création nouvelles prestations:', linesError);
                    // Ne pas faire échouer tout le devis pour ça
                } else {
                    console.log('✅ [updateQuote] Nouvelles prestations créées:', linesData);
                }
            } else {
                console.log('⚠️ [updateQuote] Pas de prestations à sauvegarder, suppression des anciennes');
                
                // Supprimer toutes les prestations s'il n'y en a plus
                const { error: deleteError } = await this.supabase
                    .from('quote_lines')
                    .delete()
                    .eq('quote_id', quoteId);
                
                if (deleteError) {
                    console.error('⚠️ [updateQuote] Erreur suppression prestations:', deleteError);
                } else {
                    console.log('✅ [updateQuote] Prestations supprimées (devis sans prestations)');
                }
            }
            
            console.log('✅ [updateQuote] Devis mis à jour avec succès');
            return { ...data, id: quoteId };
            
        } catch (error) {
            console.error('❌ [updateQuote] Erreur lors de la mise à jour du devis:', error);
            throw error;
        }
    }

    async deleteQuote(quoteId) {
        console.log('🗑️ [deleteQuote] Suppression du devis:', quoteId);
        
        // FORCER L'UTILISATION DE SUPABASE
        if (!this.supabase) {
            console.log('❌ [deleteQuote] Supabase non disponible, initialisation...');
            
            // Essayer d'initialiser
            if (window.supabaseAPI && window.supabaseAPI.isConfigured()) {
                const supabaseUrl = window.supabaseAPI.getSupabaseUrl();
                const supabaseKey = window.supabaseAPI.getSupabaseKey();
                
                if (window.supabase) {
                    this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
                    console.log('✅ [deleteQuote] Supabase initialisé');
                } else {
                    console.error('❌ [deleteQuote] window.supabase non disponible');
                    return false;
                }
            } else {
                console.error('❌ [deleteQuote] Configuration Supabase non disponible');
                return false;
            }
        }

        try {
            console.log('🚀 [deleteQuote] === TENTATIVE SUPPRESSION SUPABASE ===');
            
            // D'abord supprimer les services liés (si des relations existent)
            const { error: servicesError } = await this.supabase
                .from('quote_services')
                .delete()
                .eq('quote_id', quoteId);

            if (servicesError) {
                console.log('⚠️ [deleteQuote] Pas de services à supprimer ou erreur:', servicesError);
                // Continuer même s'il n'y a pas de services
            }
            
            // Ensuite supprimer le devis
            const { error } = await this.supabase
                .from('quotes')
                .delete()
                .eq('id', quoteId);

            if (error) {
                console.error('❌ [deleteQuote] Erreur Supabase:', error);
                throw error;
            }
            
            console.log('✅ [deleteQuote] Devis supprimé de Supabase');
            return true;

        } catch (error) {
            console.error('❌ [deleteQuote] Erreur lors de la suppression du devis:', error);
            return false;
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
