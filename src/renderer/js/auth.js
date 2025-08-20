// Authentification et gestion de la connexion
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 Initialisation de la page de connexion...');
    
    try {
        // Attendre que l'application soit prête
        console.log('⏳ Attente de l\'initialisation de l\'application...');
        await window.initializeApp();
        
        const { authService } = await window.waitForApp();
        
        // Vérifier si un utilisateur est déjà connecté
        if (authService.isUserAuthenticated()) {
            console.log('✅ Utilisateur déjà connecté, redirection...');
            
            // Forcer un délai pour voir les logs et déboguer
            setTimeout(() => {
                console.log('🚀 Tentative de redirection forcée vers la fenêtre principale...');
                window.electronAPI.switchToMainWindow();
            }, 1000);
            
            return;
        }

        // Références aux éléments
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const errorMessage = document.getElementById('errorMessage');
        const signupModal = document.getElementById('signupModal');
        const signupLink = document.getElementById('signupLink');
        const closeSignup = document.getElementById('closeSignup');
        const loginText = document.getElementById('loginText');
        const loginSpinner = document.getElementById('loginSpinner');

        // Ouvrir le modal d'inscription
        signupLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📝 Ouverture du modal d\'inscription');
            signupModal.classList.remove('hidden');
        });

        // Fermer le modal d'inscription
        closeSignup.addEventListener('click', function() {
            console.log('❌ Fermeture du modal d\'inscription');
            signupModal.classList.add('hidden');
            signupForm.reset();
        });

        // Fermer le modal en cliquant à l'extérieur
        signupModal.addEventListener('click', function(e) {
            if (e.target === signupModal) {
                console.log('❌ Fermeture du modal (clic extérieur)');
                signupModal.classList.add('hidden');
                signupForm.reset();
            }
        });

        // Gestion de la connexion
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('🔐 Tentative de connexion...');
            hideError();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if (!email || !password) {
                showError('Veuillez remplir tous les champs');
                return;
            }

            showLoading(true);

            try {
                const result = await authService.signIn(email, password);
                
                if (result.success) {
                    console.log('✅ Connexion réussie');
                    console.log('🔄 Attente de la propagation de session...');
                    
                    // Attendre un peu pour que la session se propage
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    console.log('🚀 Redirection vers l\'application principale...');
                    window.electronAPI.switchToMainWindow();
                } else {
                    console.error('❌ Erreur de connexion:', result.error);
                    showError(result.error || 'Erreur de connexion');
                }
            } catch (error) {
                console.error('❌ Erreur lors de la connexion:', error);
                showError('Une erreur est survenue lors de la connexion');
            } finally {
                showLoading(false);
            }
        });

        // Gestion de l'inscription
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📝 Tentative d\'inscription...');
            
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validation
            if (!firstName || !lastName || !email || !password) {
                alert('Veuillez remplir tous les champs obligatoires');
                return;
            }

            if (password !== confirmPassword) {
                alert('Les mots de passe ne correspondent pas');
                return;
            }

            if (password.length < 6) {
                alert('Le mot de passe doit contenir au moins 6 caractères');
                return;
            }

            const acceptTerms = document.getElementById('acceptTerms').checked;
            if (!acceptTerms) {
                alert('Vous devez accepter les conditions d\'utilisation');
                return;
            }

            try {
                const fullName = `${firstName} ${lastName}`;
                console.log('📧 Inscription avec:', { email, fullName });
                
                const result = await authService.signUp(email, password, fullName);
                
                if (result.success) {
                    console.log('✅ Inscription réussie');
                    alert(result.message || 'Inscription réussie !');
                    signupModal.classList.add('hidden');
                    signupForm.reset();
                    
                    // Si la connexion automatique a fonctionné
                    if (authService.isUserAuthenticated()) {
                        console.log('🔄 Connexion automatique détectée, redirection...');
                        console.log('🔄 Attente de la propagation de session...');
                        
                        // Attendre un peu pour que la session se propage
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        console.log('🚀 Redirection vers l\'application principale...');
                        window.electronAPI.switchToMainWindow();
                    }
                } else {
                    console.error('❌ Erreur d\'inscription:', result.error);
                    alert(result.error || 'Erreur lors de l\'inscription');
                }
            } catch (error) {
                console.error('❌ Erreur lors de l\'inscription:', error);
                alert('Une erreur est survenue lors de l\'inscription: ' + error.message);
            }
        });

        // Fonctions utilitaires
        function showError(message) {
            if (errorMessage) {
                errorMessage.textContent = message;
                errorMessage.classList.remove('hidden');
            } else {
                alert('Erreur: ' + message);
            }
        }

        function hideError() {
            if (errorMessage) {
                errorMessage.classList.add('hidden');
            }
        }

        function showLoading(isLoading) {
            if (loginText && loginSpinner) {
                if (isLoading) {
                    loginText.classList.add('hidden');
                    loginSpinner.classList.remove('hidden');
                } else {
                    loginText.classList.remove('hidden');
                    loginSpinner.classList.add('hidden');
                }
            }
        }

        // Gestion des raccourcis clavier
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !signupModal.classList.contains('hidden')) {
                signupModal.classList.add('hidden');
                signupForm.reset();
            }
        });

        console.log('✅ Interface d\'authentification initialisée');

    } catch (error) {
        console.error('❌ Erreur critique lors de l\'initialisation:', error);
        alert('Erreur lors du chargement de l\'application. Veuillez recharger la page.');
    }
});
