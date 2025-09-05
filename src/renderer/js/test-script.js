// Test simple de chargement de script
console.log('🧪 TEST: Script test-script.js chargé avec succès !');

// Créer un indicateur visuel immédiat
window.addEventListener('load', function() {
    const testDiv = document.createElement('div');
    testDiv.textContent = '🧪 TEST SCRIPT CHARGÉ !';
    testDiv.style.cssText = 'position:fixed;top:50px;right:10px;background:red;color:white;padding:10px;z-index:9999;border-radius:5px;';
    document.body.appendChild(testDiv);
    console.log('🧪 TEST: Indicateur visuel ajouté');
});
