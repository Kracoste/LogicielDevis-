// Fix IMMÉDIAT pour le bouton Retour - empêcher la disparition des devis
// Ce script peut être copié-collé dans la console pour corriger le problème

console.log('🔧 Application du correctif pour le bouton Retour...');

// Redéfinir la fonction problématique
window.closeNewQuoteViewCompletely = function() {
    console.log('🔙 CORRECTIF - Retour vers onglet devis sans perdre les données');
    
    // 1. Masquer la vue nouveau devis
    const newQuoteView = document.getElementById('newQuoteView');
    if (newQuoteView) {
        newQuoteView.classList.add('hidden');
        newQuoteView.style.display = 'none !important';
        newQuoteView.style.visibility = 'hidden !important';
        console.log('✅ Vue nouveau devis masquée');
    }
    
    // 2. Utiliser directement switchTab pour une navigation sûre
    if (typeof switchTab === 'function') {
        console.log('🔄 Navigation sûre vers quotes via switchTab');
        switchTab('quotes');
    } else {
        // Fallback manuel si switchTab n'est pas disponible
        console.log('⚠️ switchTab non disponible, navigation manuelle');
        
        // Activer l'onglet quotes
        const quotesTab = document.getElementById('quotesTab');
        if (quotesTab) {
            quotesTab.classList.add('active');
            quotesTab.style.display = 'block !important';
        }
        
        // Masquer les autres onglets (visuellement seulement)
        document.querySelectorAll('.tab-content').forEach(tab => {
            if (tab.id !== 'quotesTab') {
                tab.classList.remove('active');
                // Ne pas toucher à display pour préserver le contenu
            }
        });
        
        // Mettre à jour la sidebar
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('bg-blue-600', 'text-white');
            item.classList.add('text-gray-300');
        });
        
        const sidebarQuotes = document.querySelector('[data-tab="quotes"]');
        if (sidebarQuotes) {
            sidebarQuotes.classList.remove('text-gray-300');
            sidebarQuotes.classList.add('bg-blue-600', 'text-white');
        }
        
        // Recharger les devis après un délai
        setTimeout(() => {
            if (typeof loadQuotesList === 'function') {
                loadQuotesList();
            }
        }, 100);
    }
    
    console.log('✅ CORRECTIF APPLIQUÉ - Retour terminé');
};

console.log('✅ Correctif appliqué ! Le bouton Retour ne fera plus disparaître les devis.');

// Instruction pour l'utilisateur
console.log('');
console.log('📋 INSTRUCTIONS :');
console.log('1. Cliquez sur "Nouveau Devis"');
console.log('2. Cliquez sur le bouton "← Retour"');  
console.log('3. Vos devis devraient maintenant rester visibles !');
console.log('');
