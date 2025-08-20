// Script pour corriger automatiquement le schéma Supabase
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wfwyijywxfupcpuvixpn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmd3lpanl3eGZ1cGNwdXZpeHBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI2NTE4OCwiZXhwIjoyMDcwODQxMTg4fQ.rBYSQAjhR8yK9aPmCqCYVKnQXUPxJySDdP_mxgU8FAg'; // Clé service role pour les opérations admin

async function fixSchema() {
  console.log('🔧 === CORRECTION DU SCHÉMA DE BASE DE DONNÉES ===');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    console.log('\n📋 1. Ajout de la colonne email à user_settings...');
    
    const { data: result1, error: error1 } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS email TEXT;'
    });
    
    if (error1) {
      console.log('❌ Erreur ajout colonne:', error1.message);
    } else {
      console.log('✅ Colonne email ajoutée');
    }
    
    console.log('\n📋 2. Correction de la fonction handle_new_user...');
    
    const functionSQL = `
    CREATE OR REPLACE FUNCTION handle_new_user()
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO public.user_settings (
        user_id, 
        company_name, 
        email,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Ma Société'), 
        NEW.email,
        NOW(),
        NOW()
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    `;
    
    const { data: result2, error: error2 } = await supabase.rpc('exec_sql', {
      query: functionSQL
    });
    
    if (error2) {
      console.log('❌ Erreur fonction:', error2.message);
    } else {
      console.log('✅ Fonction handle_new_user corrigée');
    }
    
    console.log('\n📋 3. Récréation du trigger...');
    
    const triggerSQL = `
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    `;
    
    const { data: result3, error: error3 } = await supabase.rpc('exec_sql', {
      query: triggerSQL
    });
    
    if (error3) {
      console.log('❌ Erreur trigger:', error3.message);
    } else {
      console.log('✅ Trigger recréé');
    }
    
    console.log('\n📋 4. Test final d\'inscription...');
    
    const testEmail = `fixed-test-${Date.now()}@gmail.com`;
    console.log('🔄 Test avec email:', testEmail);
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test Utilisateur'
      }
    });
    
    if (error) {
      console.log('❌ Erreur test final:', error.message);
    } else {
      console.log('✅ Test final réussi:', data.user?.email);
      
      // Vérifier que l'entrée user_settings a été créée
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
        
      if (settingsError) {
        console.log('❌ Erreur vérification settings:', settingsError.message);
      } else {
        console.log('✅ Settings créés automatiquement:', settings);
      }
    }
    
    console.log('\n🎉 Correction terminée !');
    console.log('Vous pouvez maintenant tester l\'inscription dans votre application.');
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

fixSchema();
