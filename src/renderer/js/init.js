// Script d'initialisation pour s'assurer que tous les composants sont chargés
(function() {
    'use strict';
    
    console.log('🔧 Script init.js chargé');

    // Fonction pour attendre qu'un objet soit disponible
    function waitFor(condition, timeout = 10000) {
        return new Promise((resolve, reject) => {
            console.log('⏳ Attente condition:', condition.toString().substring(0, 50) + '...');
            const interval = 50; // Vérifier toutes les 50ms
            let elapsed = 0;

            const check = () => {
                if (condition()) {
                    console.log('✅ Condition satisfaite');
                    resolve(true);
                } else if (elapsed >= timeout) {
                    console.error('❌ Timeout pour condition:', condition.toString().substring(0, 50) + '...');
                    reject(new Error('Timeout: condition not met within ' + timeout + 'ms'));
                } else {
                    elapsed += interval;
                    setTimeout(check, interval);
                }
            };

            check();
        });
    }

    // Initialisation globale
    window.initializeApp = async function() {
        console.log('🚀 Initialisation de l\'application...');

        try {
            // 1. Attendre que Supabase soit chargé
            console.log('⏳ Attente du client Supabase...');
            await waitFor(() => window.supabase && window.supabase.createClient);
            console.log('✅ Client Supabase chargé');

            // 2. Attendre que l'API Electron soit disponible
            console.log('⏳ Attente de l\'API Electron...');
            await waitFor(() => window.electronAPI);
            console.log('✅ API Electron disponible');

            // 3. Attendre que l'API Supabase soit disponible
            console.log('⏳ Attente de l\'API Supabase configuration...');
            await waitFor(() => window.supabaseAPI && window.supabaseAPI.isConfigured);
            console.log('✅ API Supabase configuration disponible');

            // 4. Attendre que les services soient chargés (instances déjà créées)
            console.log('⏳ Attente des services...');
            await waitFor(() => window.authService && window.dbService);
            console.log('✅ Services disponibles');

            // 5. Initialiser les services
            console.log('🔧 Initialisation des services...');
            console.log('🔍 Vérification configuration Supabase - Configuré:', window.supabaseAPI.isConfigured());
            
            await window.authService.initialize();
            await window.dbService.initialize();

            console.log('✅ Services initialisés avec succès');
            
            // 6. Déclencher l'événement personnalisé pour signaler que tout est prêt
            const event = new CustomEvent('appReady', { 
                detail: { 
                    authService: window.authService,
                    dbService: window.dbService
                }
            });
            window.dispatchEvent(event);
            
            console.log('🎉 Application prête !');
            return true;

        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            
            // Mode dégradé - créer des services en mode démo
            console.log('🔄 Passage en mode dégradé...');
            try {
                if (!window.authService) {
                    // Service d'authentification minimal
                    window.authService = {
                        isUserAuthenticated: () => false,
                        signIn: () => Promise.resolve({ success: false, error: 'Service non disponible' }),
                        signUp: () => Promise.resolve({ success: false, error: 'Service non disponible' })
                    };
                }
                
                if (!window.dbService) {
                    // Service de base de données minimal
                    window.dbService = {
                        isRealDatabase: () => false,
                        getStats: () => Promise.resolve({ clients: 0, products: 0, quotes: 0, revenue: 0 })
                    };
                }

                const event = new CustomEvent('appReady', { 
                    detail: { 
                        authService: window.authService,
                        dbService: window.dbService,
                        degraded: true
                    }
                });
                window.dispatchEvent(event);
                
                console.log('⚠️ Application en mode dégradé');
                return false;
            } catch (fallbackError) {
                console.error('💥 Échec du mode dégradé:', fallbackError);
                alert('Erreur critique lors du chargement de l\'application. Veuillez recharger la page.');
                return false;
            }
        }
    };

    // Fonction utilitaire pour les autres scripts
    window.waitForApp = function() {
        return new Promise((resolve) => {
            if (window.authService && window.dbService) {
                resolve({ authService: window.authService, dbService: window.dbService });
            } else {
                window.addEventListener('appReady', (event) => {
                    resolve(event.detail);
                }, { once: true });
            }
        });
    };

    console.log('📦 Script d\'initialisation chargé');
})();
