const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfwyijywxfupcpuvixpn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmd3lpanl3eGZ1cGNwdXZpeHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjUxODgsImV4cCI6MjA3MDg0MTE4OH0.Hg1JQmOUgvW09EzB_HFelLa8sgDL2DGmKb00aLaFSo8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithAuth() {
    console.log('🔍 Test avec authentification...');
    
    try {
        // D'abord se connecter avec l'utilisateur
        console.log('🔐 Tentative de connexion avec full.g4m3@gmail.com...');
        
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'full.g4m3@gmail.com',
            password: 'motdepasse' // Remplacez par le vrai mot de passe
        });
        
        if (authError) {
            console.error('❌ Erreur d\'authentification:', authError.message);
            console.log('⚠️ Essayez de remplacer "motdepasse" par votre vrai mot de passe');
            return;
        }
        
        console.log('✅ Utilisateur connecté:', authData.user.email);
        console.log('🆔 User ID:', authData.user.id);
        
        // Maintenant tester l'accès aux tables
        console.log('\n📊 Test d\'accès à la table clients...');
        const { data: clientsData, error: clientsError } = await supabase
            .from('clients')
            .select('count', { count: 'exact' });
            
        if (clientsError) {
            console.error('❌ Erreur accès clients:', clientsError.message);
        } else {
            console.log('✅ Accès clients réussi:', clientsData);
        }
        
        console.log('\n📋 Test d\'accès à la table quotes...');
        const { data: quotesData, error: quotesError } = await supabase
            .from('quotes')
            .select('*');
            
        if (quotesError) {
            console.error('❌ Erreur accès quotes:', quotesError.message);
        } else {
            console.log('✅ Accès quotes réussi, nombre de devis:', quotesData.length);
            if (quotesData.length > 0) {
                console.log('📄 Premier devis:', quotesData[0]);
            }
        }
        
        // Test de création d'un devis
        console.log('\n🧪 Test de création d\'un devis...');
        const quoteData = {
            user_id: authData.user.id,
            quote_number: 'TEST-' + Date.now(),
            status: 'draft',
            notes: 'Devis de test depuis Node.js',
            subtotal_ht: 100.00,
            tax_amount: 20.00,
            total_ttc: 120.00
        };
        
        const { data: newQuote, error: quoteError } = await supabase
            .from('quotes')
            .insert(quoteData)
            .select();
            
        if (quoteError) {
            console.error('❌ Erreur création devis:', quoteError.message);
        } else {
            console.log('✅ Devis créé avec succès !');
            console.log('🆔 ID du nouveau devis:', newQuote[0].id);
            console.log('📋 Numéro de devis:', newQuote[0].quote_number);
        }
        
    } catch (error) {
        console.error('💥 Erreur générale:', error.message);
    }
}

testWithAuth();
