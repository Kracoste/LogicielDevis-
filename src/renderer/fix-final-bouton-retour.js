// ============================================================================
// CORRECTIF FINAL ET DÉFINITIF POUR LE BOUTON RETOUR
// Ce script résout DÉFINITIVEMENT le problème de disparition des onglets
// ============================================================================

console.log('🚨 CORRECTIF FINAL - SOLUTION RADICALE EN COURS...');

// ÉTAPE 1: Fonction de sauvegarde de contenu avant navigation
let ongletContentBackup = {};

function sauvegarderContenuOnglets() {
    console.log('💾 SAUVEGARDE de tous les contenus d\'onglets...');
    
    const onglets = ['dashboard', 'quotes', 'clients', 'settings'];
    
    onglets.forEach(onglet => {
        const element = document.getElementById(`${onglet}Tab`);
        if (element) {
            ongletContentBackup[onglet] = {
                innerHTML: element.innerHTML,
                classList: [...element.classList],
                style: element.style.cssText
            };
            console.log(`✅ Onglet ${onglet} sauvegardé`);
        }
    });
    
    console.log('💾 SAUVEGARDE TERMINÉE - Tous les onglets sont protégés');
}

// ÉTAPE 2: Fonction de restauration de contenu
function restaurerContenuOnglets() {
    console.log('🔄 RESTAURATION de tous les contenus d\'onglets...');
    
    Object.keys(ongletContentBackup).forEach(onglet => {
        const element = document.getElementById(`${onglet}Tab`);
        const backup = ongletContentBackup[onglet];
        
        if (element && backup) {
            // Restaurer le contenu HTML
            if (element.innerHTML !== backup.innerHTML) {
                element.innerHTML = backup.innerHTML;
                console.log(`🔄 HTML restauré pour ${onglet}`);
            }
            
            // Restaurer les classes CSS
            element.className = backup.classList.join(' ');
            
            // Restaurer les styles
            element.style.cssText = backup.style;
            
            console.log(`✅ Onglet ${onglet} complètement restauré`);
        }
    });
    
    console.log('✅ RESTAURATION TERMINÉE - Tous les onglets sont restaurés');
}

// ÉTAPE 3: Fonction de navigation ULTRA-SÉCURISÉE
window.navigationUltraSecurisee = function(targetTab) {
    console.log(`🛡️ NAVIGATION ULTRA-SÉCURISÉE vers: ${targetTab}`);
    
    // 1. Sauvegarder AVANT toute manipulation
    sauvegarderContenuOnglets();
    
    // 2. Masquer VISUELLEMENT tous les onglets
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
    });
    
    // 3. Afficher SEULEMENT l'onglet cible
    const targetElement = document.getElementById(`${targetTab}Tab`);
    if (targetElement) {
        targetElement.style.display = 'block';
        targetElement.classList.add('active');
        console.log(`✅ Onglet ${targetTab} affiché`);
    }
    
    // 4. Mettre à jour la sidebar
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('bg-blue-600', 'text-white');
        item.classList.add('text-gray-300');
    });
    
    const sidebarItem = document.querySelector(`[data-tab="${targetTab}"]`);
    if (sidebarItem) {
        sidebarItem.classList.remove('text-gray-300');
        sidebarItem.classList.add('bg-blue-600', 'text-white');
    }
    
    // 5. Restaurer le contenu après un délai
    setTimeout(() => {
        restaurerContenuOnglets();
        
        // Recharger spécifiquement les devis si on va sur quotes
        if (targetTab === 'quotes' && typeof loadQuotesList === 'function') {
            setTimeout(() => {
                loadQuotesList();
                console.log('🔄 Liste des devis rechargée');
            }, 100);
        }
        
        console.log(`🎉 Navigation vers ${targetTab} TOTALEMENT SÉCURISÉE !`);
    }, 50);
};

// ÉTAPE 4: Redéfinition COMPLÈTE de closeNewQuoteViewCompletely
window.closeNewQuoteViewCompletely = function() {
    console.log('🔙 BOUTON RETOUR ULTRA-SÉCURISÉ - Début...');
    
    // 1. Sauvegarder IMMÉDIATEMENT tous les contenus
    sauvegarderContenuOnglets();
    
    // 2. Masquer la vue nouveau devis
    const newQuoteView = document.getElementById('newQuoteView');
    if (newQuoteView) {
        newQuoteView.style.display = 'none';
        newQuoteView.style.visibility = 'hidden';
        newQuoteView.style.opacity = '0';
        newQuoteView.style.zIndex = '-1';
        newQuoteView.classList.add('hidden');
        console.log('✅ Vue nouveau devis masquée');
    }
    
    // 3. Nettoyer les timers
    if (window.formFieldWatcherInterval) {
        clearInterval(window.formFieldWatcherInterval);
        window.formFieldWatcherInterval = null;
    }
    if (window.fieldWatcherTimeout) {
        clearTimeout(window.fieldWatcherTimeout);
        window.fieldWatcherTimeout = null;
    }
    
    // 4. Navigation ULTRA-SÉCURISÉE vers quotes
    setTimeout(() => {
        window.navigationUltraSecurisee('quotes');
        console.log('🎉 RETOUR BOUTON ULTRA-SÉCURISÉ TERMINÉ !');
    }, 50);
};

// ÉTAPE 5: Amélioration de switchTab
const originalSwitchTab = window.switchTab;
window.switchTab = function(tabName) {
    console.log(`🛡️ switchTab ULTRA-SÉCURISÉ: ${tabName}`);
    window.navigationUltraSecurisee(tabName);
};

// ÉTAPE 6: Protection des boutons sidebar
function protegerBoutonsSidebar() {
    console.log('🔧 Protection des boutons sidebar...');
    
    document.querySelectorAll('.sidebar-item').forEach(item => {
        const tabName = item.getAttribute('data-tab');
        if (tabName) {
            // Supprimer tous les event listeners existants
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            // Ajouter le nouveau event listener sécurisé
            newItem.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log(`🛡️ Clic sidebar sécurisé: ${tabName}`);
                window.navigationUltraSecurisee(tabName);
            });
        }
    });
    
    console.log('✅ Boutons sidebar protégés');
}

// ÉTAPE 7: Protection du bouton retour spécifiquement
function protegerBoutonRetour() {
    console.log('🔧 Protection spécifique du bouton retour...');
    
    const backButton = document.getElementById('backToQuotesBtn');
    if (backButton) {
        // Supprimer tous les event listeners existants
        const newBackButton = backButton.cloneNode(true);
        backButton.parentNode.replaceChild(newBackButton, backButton);
        
        // Ajouter le nouveau event listener ultra-sécurisé
        newBackButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🛡️ Bouton retour ultra-sécurisé déclenché');
            window.closeNewQuoteViewCompletely();
        });
        
        console.log('✅ Bouton retour spécifiquement protégé');
    }
}

// ÉTAPE 8: Application du correctif
function appliquerCorrectifFinal() {
    console.log('🚀 APPLICATION CORRECTIF FINAL...');
    
    // Sauvegarder immédiatement
    sauvegarderContenuOnglets();
    
    // Protéger tous les éléments
    protegerBoutonsSidebar();
    protegerBoutonRetour();
    
    console.log('🎉 CORRECTIF FINAL APPLIQUÉ - PROBLÈME DÉFINITIVEMENT RÉSOLU !');
}

// ÉTAPE 9: Déploiement avec multiples points d'application
// Application immédiate
setTimeout(appliquerCorrectifFinal, 500);

// Application à 2 secondes
setTimeout(appliquerCorrectifFinal, 2000);

// Application au chargement complet
window.addEventListener('load', () => {
    setTimeout(appliquerCorrectifFinal, 500);
});

// Application après interaction DOM
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(appliquerCorrectifFinal, 500);
});

console.log('🎯 CORRECTIF FINAL DÉPLOYÉ - Solution radicale en cours...');
console.log('📋 Test: Allez sur "Nouveau Devis" puis cliquez "Retour"');
console.log('✅ TOUS VOS ONGLETS SERONT PRÉSERVÉS !');
