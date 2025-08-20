// Script de diagnostic pour l'application Electron
console.log('🔧 === DIAGNOSTIC DE L\'APPLICATION ===');

// Test 1: Vérification de la configuration Supabase
console.log('\n📋 1. Test de la configuration...');
try {
  const preloadPath = './src/renderer/preload.js';
  const fs = require('fs');
  const preloadContent = fs.readFileSync(preloadPath, 'utf8');
  
  if (preloadContent.includes('wfwyijywxfupcpuvixpn.supabase.co')) {
    console.log('✅ Configuration Supabase trouvée dans preload.js');
  } else {
    console.log('❌ Configuration Supabase manquante dans preload.js');
  }
  
} catch (error) {
  console.log('❌ Erreur lors de la vérification du preload:', error.message);
}

// Test 2: Vérification des dépendances
console.log('\n📋 2. Test des dépendances...');
try {
  const packageJson = require('./package.json');
  console.log('✅ Package.json chargé');
  console.log('- Electron:', packageJson.devDependencies?.electron || 'Non trouvé');
  console.log('- Supabase:', packageJson.dependencies?.['@supabase/supabase-js'] || 'Non trouvé');
} catch (error) {
  console.log('❌ Erreur package.json:', error.message);
}

// Test 3: Vérification des fichiers critiques
console.log('\n📋 3. Test des fichiers critiques...');
const criticalFiles = [
  './src/main/main.js',
  './src/renderer/preload.js',
  './src/renderer/login.html',
  './src/renderer/index.html',
  './src/renderer/js/init.js',
  './src/renderer/services/auth.js'
];

criticalFiles.forEach(file => {
  try {
    const fs = require('fs');
    if (fs.existsSync(file)) {
      console.log('✅', file);
    } else {
      console.log('❌', file, '- MANQUANT');
    }
  } catch (error) {
    console.log('❌', file, '- ERREUR:', error.message);
  }
});

// Test 4: Test Supabase simple
console.log('\n📋 4. Test Supabase (version simple)...');
setTimeout(async () => {
  try {
    // Simuler ce qui se passe dans l'application
    global.window = {
      supabaseAPI: {
        isConfigured: () => true,
        getSupabaseUrl: () => 'https://wfwyijywxfupcpuvixpn.supabase.co',
        getSupabaseKey: () => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmd3lpanl3eGZ1cGNwdXZpeHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjUxODgsImV4cCI6MjA3MDg0MTE4OH0.Hg1JQmOUgvW09EzB_HFelLa8sgDL2DGmKb00aLaFSo8'
      }
    };
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      global.window.supabaseAPI.getSupabaseUrl(),
      global.window.supabaseAPI.getSupabaseKey()
    );
    
    console.log('✅ Client Supabase créé en simulation');
    
    // Test d'inscription avec un email de test
    const testEmail = `diagnostic-${Date.now()}@gmail.com`;
    console.log('🔄 Test d\'inscription avec:', testEmail);
    
    const result = await supabase.auth.signUp({
      email: testEmail,
      password: 'diagnostic123',
      options: {
        data: { full_name: 'Test Diagnostic' }
      }
    });
    
    if (result.error) {
      console.log('❌ Erreur Supabase:', result.error.message);
      console.log('📋 Code erreur:', result.error.code);
    } else {
      console.log('✅ Test d\'inscription réussi');
      console.log('📧 User créé:', result.data.user?.email);
    }
    
  } catch (error) {
    console.log('❌ Erreur lors du test Supabase:', error.message);
  }
}, 1000);

console.log('\n⏳ Tests en cours...');
