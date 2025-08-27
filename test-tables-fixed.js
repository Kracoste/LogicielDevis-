const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfwyijywxfupcpuvixpn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmd3lpanl3eGZ1cGNwdXZpeHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjUxODgsImV4cCI6MjA3MDg0MTE4OH0.Hg1JQmOUgvW09EzB_HFelLa8sgDL2DGmKb00aLaFSo8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTables() {
    console.log('🔍 Test de connexion et vérification des tables...');
    
    try {
        // Test de connexion simple
        console.log('📡 Test de connexion Supabase...');
        const { data: testData, error: testError } = await supabase
            .from('quotes')
            .select('count', { count: 'exact' })
            .limit(1);
        
        if (testError) {
            console.error('❌ Erreur de connexion ou table quotes inexistante:', testError.message);
            
            if (testError.message.includes('relation "quotes" does not exist')) {
                console.log('\n🛠️ Il semble que les tables n\'existent pas dans Supabase.');
                console.log('📋 Vous devez copier-coller le contenu de database/schema.sql dans l\'éditeur SQL de Supabase.\n');
                
                console.log('🔗 Instructions:');
                console.log('1. Connectez-vous à https://supabase.com/dashboard');
                console.log('2. Ouvrez votre projet');
                console.log('3. Allez dans "SQL Editor"');
                console.log('4. Créez une nouvelle requête');
                console.log('5. Copiez-collez tout le contenu du fichier database/schema.sql');
                console.log('6. Exécutez la requête');
                return;
            }
        } else {
            console.log('✅ Connexion Supabase réussie !');
            console.log('📊 Nombre de devis dans la base:', testData?.[0]?.count || 0);
        }
        
        // Tester l'utilisateur authentifié
        console.log('\n👤 Test de l\'authentification...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
            console.error('❌ Erreur d\'authentification:', userError.message);
        } else if (user) {
            console.log('✅ Utilisateur connecté:', user.email);
            console.log('🆔 User ID:', user.id);
            
            // Tester la création d'un devis test
            console.log('\n🧪 Test de création d\'un devis...');
            const quoteData = {
                user_id: user.id,
                quote_number: 'TEST-' + Date.now(),
                client_id: null,
                quote_date: new Date().toISOString().split('T')[0],
                status: 'draft',
                notes: 'Devis de test',
                subtotal_ht: 100.00,
                tax_amount: 20.00,
                total_ttc: 120.00
            };
            
            const { data: quoteResult, error: quoteError } = await supabase
                .from('quotes')
                .insert(quoteData)
                .select();
                
            if (quoteError) {
                console.error('❌ Erreur création devis test:', quoteError.message);
                console.error('📋 Détails:', quoteError);
            } else {
                console.log('✅ Devis test créé avec succès !');
                console.log('🆔 ID du devis:', quoteResult[0]?.id);
                
                // Supprimer le devis test
                await supabase
                    .from('quotes')
                    .delete()
                    .eq('id', quoteResult[0]?.id);
                console.log('🗑️ Devis test supprimé');
            }
        } else {
            console.log('⚠️ Aucun utilisateur connecté');
        }
        
    } catch (error) {
        console.error('💥 Erreur générale:', error.message);
    }
}

testTables();
