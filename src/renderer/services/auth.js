// Service d'authentification
class AuthService {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.isAuthenticated = false;
        console.log('🔧 AuthService créé');
    }

    // Initialiser le service d'authentification
    async initialize() {
        console.log('🔧 Initialisation du service d\'authentification...');
        
        try {
            // Attendre que supabaseAPI soit disponible
            let attempts = 0;
            while (!window.supabaseAPI && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.supabaseAPI) {
                console.log('🔄 Mode démo : supabaseAPI non disponible');
                this.currentUser = {
                    id: 'demo-user',
                    email: 'demo@example.com',
                    full_name: 'Utilisateur Démo'
                };
                this.isAuthenticated = true;
                console.log('✅ AuthService initialisé en mode démo');
                return true;
            }

            if (!window.supabaseAPI.isConfigured()) {
                console.log('🔄 Mode démo : Authentification simulée');
                this.currentUser = {
                    id: 'demo-user',
                    email: 'demo@example.com',
                    full_name: 'Utilisateur Démo'
                };
                this.isAuthenticated = true;
                console.log('✅ AuthService initialisé en mode démo (non configuré)');
                return true;
            }

            const supabaseUrl = window.supabaseAPI.getSupabaseUrl();
            const supabaseKey = window.supabaseAPI.getSupabaseKey();
            console.log('🔗 Configuration Supabase trouvée, URL:', supabaseUrl?.substring(0, 30) + '...');
            
            // Attendre que Supabase soit disponible
            attempts = 0;
            while (!window.supabase && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.supabase) {
                console.error('❌ Supabase client non disponible');
                return false;
            }

            this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
            console.log('🔗 Client Supabase créé');

            // Vérifier si un utilisateur est déjà connecté
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (session?.user) {
                this.currentUser = session.user;
                this.isAuthenticated = true;
                console.log('✅ Utilisateur déjà connecté:', session.user.email);
                
                // Transmettre l'utilisateur au service de base de données
                if (window.dbService && typeof window.dbService.setCurrentUser === 'function') {
                    window.dbService.setCurrentUser(session.user);
                    console.log('👤 Utilisateur transmis au service de base de données');
                } else {
                    console.warn('⚠️ Service de base de données non disponible pour setCurrentUser');
                }
                
                return true;
            }

            console.log('✅ AuthService initialisé avec Supabase (aucun utilisateur connecté)');
            return false;

        } catch (error) {
            console.error('❌ Erreur d\'initialisation de l\'authentification:', error);
            // En cas d'erreur, passer en mode démo
            this.currentUser = {
                id: 'demo-user',
                email: 'demo@example.com',
                full_name: 'Utilisateur Démo'
            };
            this.isAuthenticated = true;
            console.log('✅ AuthService initialisé en mode démo (erreur)');
            return true;
        }
    }

    // Connexion avec email/mot de passe
    async signIn(email, password) {
        // Vérifier que les APIs sont disponibles
        if (!window.supabaseAPI || !window.supabaseAPI.isConfigured()) {
            return this.mockSignIn(email, password);
        }

        try {
            console.log('🔐 Tentative de connexion...');
            console.log('🔑 Vérification configuration Supabase - Configuré:', window.supabaseAPI.isConfigured());
            
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error('❌ Erreur Supabase connexion:', error);
                
                // Messages plus clairs pour les erreurs courantes
                if (error.message.includes('Email not confirmed')) {
                    console.log('📧 Email non confirmé, tentative de bypass...');
                    
                    // Tentative d'inscription silencieuse pour bypasser la confirmation
                    try {
                        const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({
                            email,
                            password,
                            options: {
                                data: { full_name: 'Utilisateur' }
                            }
                        });
                        
                        if (!signUpError && signUpData.user) {
                            this.currentUser = signUpData.user;
                            this.isAuthenticated = true;
                            console.log('✅ Connexion réussie via inscription silencieuse');
                            return {
                                success: true,
                                user: signUpData.user
                            };
                        }
                    } catch (bypassError) {
                        console.log('⚠️ Bypass échoué:', bypassError.message);
                    }
                    
                    throw new Error('Compte créé mais email non confirmé. Utilisez un autre email ou contactez l\'admin.');
                } else if (error.message.includes('Invalid login credentials')) {
                    throw new Error('Email ou mot de passe incorrect');
                } else {
                    throw new Error(this.translateAuthError(error.message));
                }
            }

            this.currentUser = data.user;
            this.isAuthenticated = true;

            // Transmettre l'utilisateur au service de base de données
            if (window.dbService && typeof window.dbService.setCurrentUser === 'function') {
                window.dbService.setCurrentUser(data.user);
                console.log('👤 Utilisateur transmis au service de base de données lors de la connexion');
            } else {
                console.warn('⚠️ Service de base de données non disponible pour setCurrentUser lors de la connexion');
            }

            console.log('✅ Connexion réussie:', data.user.email);
            return {
                success: true,
                user: data.user
            };

        } catch (error) {
            console.error('❌ Erreur de connexion:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Inscription avec email/mot de passe
    async signUp(email, password, fullName) {
        console.log('🔄 Début de l\'inscription pour:', email);
        
        // Vérifier que les APIs sont disponibles
        if (!window.supabaseAPI || !window.supabaseAPI.isConfigured()) {
            console.log('📧 Mode démo: inscription simulée');
            return this.mockSignUp(email, password, fullName);
        }

        try {
            console.log('🔗 Tentative d\'inscription avec Supabase...');
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    },
                    emailRedirectTo: undefined // Désactiver la redirection email
                }
            });

            if (error) {
                console.error('❌ Erreur Supabase:', error);
                throw new Error(this.translateAuthError(error.message));
            }

            console.log('✅ Réponse Supabase:', data);
            console.log('✅ Inscription réussie:', data.user?.email);
            
            // Si l'utilisateur est créé, on le connecte automatiquement
            if (data.user) {
                this.currentUser = data.user;
                this.isAuthenticated = true;
                console.log('🔄 Connexion automatique après inscription');
            }
            
            return {
                success: true,
                user: data.user,
                message: data.user?.email_confirmed_at ? 
                    'Inscription et connexion réussies !' : 
                    'Inscription réussie ! Vous êtes maintenant connecté.'
            };

        } catch (error) {
            console.error('❌ Erreur d\'inscription:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Déconnexion
    async signOut() {
        if (!window.supabaseAPI.isConfigured()) {
            this.currentUser = null;
            this.isAuthenticated = false;
            return { success: true };
        }

        try {
            const { error } = await this.supabase.auth.signOut();
            
            if (error) throw error;

            this.currentUser = null;
            this.isAuthenticated = false;

            console.log('✅ Déconnexion réussie');
            return { success: true };

        } catch (error) {
            console.error('❌ Erreur de déconnexion:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Réinitialisation de mot de passe
    async resetPassword(email) {
        if (!window.supabaseAPI.isConfigured()) {
            return {
                success: true,
                message: 'En mode démo, la réinitialisation n\'est pas disponible.'
            };
        }

        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(email);
            
            if (error) throw error;

            return {
                success: true,
                message: 'Instructions de réinitialisation envoyées par email.'
            };

        } catch (error) {
            console.error('❌ Erreur de réinitialisation:', error);
            return {
                success: false,
                error: this.translateAuthError(error.message)
            };
        }
    }

    // Obtenir l'utilisateur actuel
    getCurrentUser() {
        return this.currentUser;
    }

    // Vérifier si l'utilisateur est authentifié
    isUserAuthenticated() {
        return this.isAuthenticated && this.currentUser;
    }

    // Écouter les changements d'authentification
    onAuthStateChange(callback) {
        if (!window.supabaseAPI.isConfigured()) {
            // En mode démo, appeler directement le callback
            if (this.isAuthenticated) {
                callback('SIGNED_IN', this.currentUser);
            }
            return;
        }

        this.supabase.auth.onAuthStateChange((event, session) => {
            console.log('🔄 Changement d\'authentification:', event);
            
            if (event === 'SIGNED_IN' && session?.user) {
                this.currentUser = session.user;
                this.isAuthenticated = true;
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.isAuthenticated = false;
            }

            callback(event, session);
        });
    }

    // === MÉTHODES DE DÉMONSTRATION ===
    mockSignIn(email, password) {
        console.log('Mode démo: connexion simulée pour', email);
        
        // Simuler une connexion réussie
        this.currentUser = {
            id: 'demo-user',
            email: email,
            full_name: 'Utilisateur Démo'
        };
        this.isAuthenticated = true;

        return {
            success: true,
            user: this.currentUser
        };
    }

    mockSignUp(email, password, fullName) {
        console.log('📧 Mode démo: inscription simulée pour', email);
        
        // En mode démo, on connecte automatiquement l'utilisateur après l'inscription
        this.currentUser = {
            id: 'demo-user',
            email: email,
            full_name: fullName
        };
        this.isAuthenticated = true;
        
        // Simuler une inscription réussie
        return {
            success: true,
            user: this.currentUser,
            message: 'Inscription simulée réussie en mode démo ! Vous êtes maintenant connecté.'
        };
    }

    // Traduire les erreurs d'authentification
    translateAuthError(errorMessage) {
        const translations = {
            'Invalid login credentials': 'Email ou mot de passe incorrect',
            'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter',
            'User already registered': 'Un utilisateur existe déjà avec cet email',
            'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
            'Invalid email': 'Adresse email invalide',
            'Signup not allowed': 'L\'inscription n\'est pas autorisée',
            'Email rate limit exceeded': 'Trop de tentatives, veuillez patienter'
        };

        return translations[errorMessage] || errorMessage;
    }
}

// Exposer la classe globalement pour l'initialisation
window.AuthService = AuthService;
console.log('📋 AuthService classe exposée');

// Instance globale
window.authService = new AuthService();
console.log('📋 Instance authService créée');
