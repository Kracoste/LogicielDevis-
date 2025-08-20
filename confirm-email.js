// Script pour confirmer l'email directement via l'API Supabase
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wfwyijywxfupcpuvixpn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmd3lpanl3eGZ1cGNwdXZpeHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjUxODgsImV4cCI6MjA3MDg0MTE4OH0.Hg1JQmOUgvW09EzB_HFelLa8sgDL2DGmKb00aLaFSo8';

async function confirmUserEmail() {
  console.log('📧 === CONFIRMATION EMAIL UTILISATEUR ===');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Méthode 1: Essayer de se connecter pour voir l'état actuel
    console.log('\n🔍 1. Test de l\'état actuel du compte...');
    
    const testEmail = 'full.g4m3@gmail.com';
    const testPassword = 'VOTRE_MOT_DE_PASSE_ICI'; // 👈 REMPLACEZ par votre vrai mot de passe
    
    console.log('🔄 Test de connexion avec:', testEmail);
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.log('❌ Erreur de connexion:', signInError.message);
      
      if (signInError.message.includes('Email not confirmed')) {
        console.log('📧 Le compte existe mais l\'email n\'est pas confirmé');
        
        // Méthode 2: Renvoyer l'email de confirmation
        console.log('\n🔄 2. Tentative de renvoi de l\'email de confirmation...');
        
        const { data: resendData, error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: testEmail
        });
        
        if (resendError) {
          console.log('❌ Erreur renvoi email:', resendError.message);
        } else {
          console.log('✅ Email de confirmation renvoyé avec succès');
          console.log('📧 Vérifiez votre boîte email:', testEmail);
          console.log('🔗 Cliquez sur le lien de confirmation dans l\'email');
        }
        
        // Méthode 3: Alternative - créer une nouvelle inscription avec auto-confirmation
        console.log('\n🔄 3. Alternative: Créer un nouveau compte avec un autre email...');
        console.log('💡 Suggestions:');
        console.log('   - Utilisez un autre email temporaire');
        console.log('   - Ou vérifiez votre boîte spam pour l\'email de confirmation');
        
      } else if (signInError.message.includes('Invalid login credentials')) {
        console.log('❌ Email ou mot de passe incorrect');
        console.log('💡 Vérifiez vos identifiants ou créez un nouveau compte');
      } else {
        console.log('❌ Autre erreur:', signInError.message);
      }
    } else {
      console.log('✅ Connexion réussie ! Votre compte est déjà confirmé');
      console.log('👤 Utilisateur:', signInData.user?.email);
      console.log('📅 Email confirmé le:', signInData.user?.email_confirmed_at);
    }
    
    // Méthode 4: Test avec un nouvel email pour inscription directe
    console.log('\n🔄 4. Test d\'inscription avec auto-connexion...');
    const newTestEmail = `test-${Date.now()}@example.com`;
    
    console.log('📝 Création compte test:', newTestEmail);
    
    const { data: newSignUpData, error: newSignUpError } = await supabase.auth.signUp({
      email: newTestEmail,
      password: 'test123456',
      options: {
        data: {
          full_name: 'Utilisateur Test'
        }
      }
    });
    
    if (newSignUpError) {
      console.log('❌ Erreur création compte test:', newSignUpError.message);
    } else {
      console.log('✅ Compte test créé avec succès');
      console.log('📧 Email confirmé automatiquement:', newSignUpData.user?.email_confirmed_at ? 'OUI' : 'NON');
      
      if (newSignUpData.user && !newSignUpData.user.email_confirmed_at) {
        console.log('⚠️  Le compte nécessite une confirmation email');
        console.log('💡 Solution: Configurez Supabase pour ne pas requérir la confirmation');
      } else {
        console.log('🎉 Le compte fonctionne parfaitement !');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
  }
}

// Demander le mot de passe à l'utilisateur
console.log('🔐 Pour tester votre compte existant, nous avons besoin de votre mot de passe.');
console.log('📝 Modifiez la ligne "const testPassword" dans ce fichier avec votre mot de passe.');
console.log('🔄 Puis relancez: node confirm-email.js');
console.log('');

confirmUserEmail();
