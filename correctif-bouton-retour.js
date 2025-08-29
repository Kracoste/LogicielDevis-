// CORRECTIF AUTOMATIQUE POUR LE BOUTON RETOUR
// Ce script corrige définitivement le problème de disparition des devis

console.log('🔧 CORRECTIF BOUTON RETOUR - Démarrage...');

// Fonction de correctif qui sera injectée
function applyReturnButtonFix() {
    console.log('🛠️ Application du correctif pour closeNewQuoteViewCompletely...');
    
    // Redéfinir complètement la fonction problématique
    window.closeNewQuoteViewCompletely = function() {
        console.log('🔙 CORRECTIF - Retour vers onglet devis sans perdre les données');
        
        // 1. Masquer la vue nouveau devis
        const newQuoteView = document.getElementById('newQuoteView');
        if (newQuoteView) {
            newQuoteView.classList.add('hidden');
            newQuoteView.style.display = 'none !important';
            newQuoteView.style.visibility = 'hidden !important';
            newQuoteView.style.opacity = '0 !important';
            newQuoteView.style.zIndex = '-9999 !important';
            console.log('✅ Vue nouveau devis masquée');
        }
        
        // 2. Nettoyer les timers si ils existent
        if (window.formFieldWatcherInterval) {
            clearInterval(window.formFieldWatcherInterval);
            window.formFieldWatcherInterval = null;
        }
        if (window.fieldWatcherTimeout) {
            clearTimeout(window.fieldWatcherTimeout);
            window.fieldWatcherTimeout = null;
        }
        
        // 3. Navigation sécurisée vers l'onglet devis
        if (typeof switchTab === 'function') {
            console.log('🔄 Navigation via switchTab (méthode sûre)');
            switchTab('quotes');
        } else {
            console.log('🔄 Navigation manuelle vers quotes');
            
            // Masquer tous les onglets
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Activer SEULEMENT l'onglet quotes
            const quotesTab = document.getElementById('quotesTab');
            if (quotesTab) {
                quotesTab.classList.add('active');
                quotesTab.style.display = 'block !important';
                console.log('✅ Onglet quotes activé');
            }
            
            // Mettre à jour la sidebar
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('bg-blue-600', 'text-white');
                item.classList.add('text-gray-300');
            });
            
            const sidebarQuotes = document.querySelector('[data-tab="quotes"]');
            if (sidebarQuotes) {
                sidebarQuotes.classList.remove('text-gray-300');
                sidebarQuotes.classList.add('bg-blue-600', 'text-white');
                console.log('✅ Sidebar quotes activé');
            }
            
            // Recharger la liste des devis après un délai
            setTimeout(() => {
                console.log('🔄 Rechargement des devis');
                
                // S'assurer que le container est visible
                const quotesContainer = document.getElementById('quotesList');
                if (quotesContainer) {
                    quotesContainer.style.display = 'block !important';
                    quotesContainer.style.visibility = 'visible !important';
                    quotesContainer.classList.remove('hidden');
                    console.log('✅ Container quotes rendu visible');
                }
                
                // Recharger la liste
                if (typeof loadQuotesList === 'function') {
                    loadQuotesList();
                    console.log('✅ Liste des devis rechargée');
                } else if (typeof window.loadQuotesList === 'function') {
                    window.loadQuotesList();
                    console.log('✅ Liste des devis rechargée (window)');
                } else {
                    console.log('⚠️ Fonction loadQuotesList non disponible');
                }
            }, 200);
        }
        
        console.log('✅ CORRECTIF TERMINÉ - Les devis devraient être visibles !');
    };
    
    console.log('✅ Fonction closeNewQuoteViewCompletely corrigée !');
}

// Appliquer le correctif immédiatement
applyReturnButtonFix();

// Réappliquer le correctif après 2 secondes pour être sûr
setTimeout(() => {
    console.log('🔄 Réapplication du correctif (sécurité)');
    applyReturnButtonFix();
}, 2000);

console.log('🎉 CORRECTIF BOUTON RETOUR APPLIQUÉ AVEC SUCCÈS !');
console.log('📋 Vous pouvez maintenant tester : Nouveau Devis → ← Retour');
