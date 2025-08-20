// Script de test pour vérifier la connexion Supabase
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wfwyijywxfupcpuvixpn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmd3lpanl3eGZ1cGNwdXZpeHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjUxODgsImV4cCI6MjA3MDg0MTE4OH0.Hg1JQmOUgvW09EzB_HFelLa8sgDL2DGmKb00aLaFSo8';

async function testSupabase() {
  console.log('🔧 Test de connexion Supabase...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Client Supabase créé');
    
    // Test 1: Vérifier la connexion
    console.log('🔄 Test de connexion...');
    const { data, error } = await supabase
      .from('clients')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Erreur de connexion:', error.message);
    } else {
      console.log('✅ Connexion OK - Nombre de clients:', data);
    }
    
    // Test 2: Test d'inscription
    console.log('🔄 Test d\'inscription...');
    const testEmail = `test.user.${Date.now()}@gmail.com`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'test123456',
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });
    
    if (authError) {
      console.log('❌ Erreur d\'inscription:', authError.message);
      console.log('📋 Détails:', authError);
    } else {
      console.log('✅ Test d\'inscription OK:', authData.user?.email);
    }
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

testSupabase();
