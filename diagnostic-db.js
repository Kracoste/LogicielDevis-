// Script pour diagnostiquer et corriger le problème de base de données
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wfwyijywxfupcpuvixpn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmd3lpanl3eGZ1cGNwdXZpeHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjUxODgsImV4cCI6MjA3MDg0MTE4OH0.Hg1JQmOUgvW09EzB_HFelLa8sgDL2DGmKb00aLaFSo8';

async function diagnoseDatabaseIssue() {
  console.log('🔧 === DIAGNOSTIC DE LA BASE DE DONNÉES ===');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Test 1: Vérifier les tables existantes
    console.log('\n📋 1. Vérification des tables...');
    const tables = ['clients', 'products', 'quotes', 'quote_lines', 'suppliers', 'user_settings'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: OK (${data || 0} enregistrements)`);
        }
      } catch (e) {
        console.log(`❌ ${table}: ${e.message}`);
      }
    }
    
    // Test 2: Vérifier la table user_settings qui est probablement le problème
    console.log('\n📋 2. Test spécifique de user_settings...');
    try {
      // Essayer d'insérer directement dans user_settings
      const { data, error } = await supabase
        .from('user_settings')
        .insert([{
          user_id: 'test-user-id',
          company_name: 'Test Company',
          email: 'test@example.com'
        }])
        .select();
        
      if (error) {
        console.log('❌ Erreur insertion user_settings:', error.message);
        console.log('📋 Détails:', error);
      } else {
        console.log('✅ Insertion user_settings OK');
        
        // Nettoyer le test
        await supabase
          .from('user_settings')
          .delete()
          .eq('user_id', 'test-user-id');
      }
    } catch (e) {
      console.log('❌ Erreur test user_settings:', e.message);
    }
    
    // Test 3: Test d'inscription avec gestion d'erreur détaillée
    console.log('\n📋 3. Test d\'inscription détaillé...');
    
    const testEmail = `diagnostic-${Date.now()}@gmail.com`;
    console.log('🔄 Test avec email:', testEmail);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'diagnostic123456',
      options: {
        data: {
          full_name: 'Test Diagnostic'
        }
      }
    });
    
    if (error) {
      console.log('❌ Erreur complète:', error);
      console.log('❌ Code d\'erreur:', error.status);
      console.log('❌ Message:', error.message);
      
      // Si c'est une erreur de base de données, c'est probablement le trigger
      if (error.message.includes('Database error saving new user')) {
        console.log('\n🔧 SOLUTION SUGGÉRÉE:');
        console.log('Le problème vient du trigger handle_new_user() qui essaie d\'insérer dans user_settings.');
        console.log('Il faut soit:');
        console.log('1. Corriger les politiques RLS de user_settings');
        console.log('2. Ou désactiver temporairement le trigger');
        console.log('3. Ou corriger la fonction handle_new_user()');
      }
    } else {
      console.log('✅ Inscription réussie:', data.user?.email);
    }
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

diagnoseDatabaseIssue();
