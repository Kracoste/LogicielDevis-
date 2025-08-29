const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (même configuration que l'app)
const supabaseUrl = 'https://wfwyijywxfupcpuvixpn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmd3lpanl3eGZ1cGNwdXZpeHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MjQwMzAsImV4cCI6MjA3MjAwMDAzMH0.KlTq4CkCqpUBKTNyNFHb2gqTdSRBq7VEr3Q8XT7kDgQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugQuoteLines() {
  console.log('🔍 DIAGNOSTIC APPROFONDI DES QUOTE_LINES');
  console.log('=========================================\n');
  
  try {
    // 1. Vérifier l'authentification
    console.log('1. Vérification auth...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Erreur auth:', authError);
      // Essayons de nous connecter
      console.log('🔐 Tentative de connexion...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'full.g4m3@gmail.com',
        password: 'password123' // Remplacez par le bon mot de passe
      });
      
      if (loginError) {
        console.log('❌ Erreur de connexion:', loginError.message);
        return;
      }
      console.log('✅ Connexion réussie');
    } else {
      console.log('✅ Utilisateur connecté:', user?.email || 'Non connecté');
    }
    
    // 2. Lister tous les quotes existants
    console.log('\n2. Liste des quotes existants...');
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select('id, quote_number, client_name, created_at')
      .order('created_at', { ascending: false });
      
    if (quotesError) {
      console.log('❌ Erreur récupération quotes:', quotesError);
    } else {
      console.log('✅ Quotes trouvés:', quotes?.length || 0);
      quotes?.forEach(q => {
        console.log(`  - ${q.quote_number} (${q.id}) - Client: ${q.client_name}`);
      });
    }
    
    // 3. Vérifier s'il y a des quote_lines du tout
    console.log('\n3. Vérification table quote_lines...');
    const { data: allLines, error: allLinesError } = await supabase
      .from('quote_lines')
      .select('*')
      .limit(10);
      
    if (allLinesError) {
      console.log('❌ Erreur récupération quote_lines:', allLinesError);
    } else {
      console.log('✅ Quote_lines trouvées:', allLines?.length || 0);
      if (allLines && allLines.length > 0) {
        console.log('Exemple de ligne:');
        console.log(JSON.stringify(allLines[0], null, 2));
      } else {
        console.log('⚠️  Aucune ligne de devis dans la base !');
      }
    }
    
    // 4. Tester avec un quote_id spécifique 
    const testQuoteId = 'e57daa0b-39e8-4c3e-9f72-0065b672a78e';
    console.log(`\n4. Test avec quote_id spécifique: ${testQuoteId}`);
    
    const { data: specificLines, error: specificError } = await supabase
      .from('quote_lines')
      .select(`
        id,
        quote_id,
        description,
        quantity,
        unit_price_ht,
        tax_rate,
        line_total_ht,
        line_tax,
        line_total_ttc
      `)
      .eq('quote_id', testQuoteId);
      
    if (specificError) {
      console.log('❌ Erreur récupération lignes spécifiques:', specificError);
    } else {
      console.log('✅ Lignes pour ce devis:', specificLines?.length || 0);
      if (specificLines && specificLines.length > 0) {
        specificLines.forEach(line => {
          console.log(`  - ${line.description}: ${line.quantity} x ${line.unit_price_ht}€`);
        });
      }
    }
    
    // 5. Tester la requête exacte utilisée dans l'app
    console.log('\n5. Test requête exacte de l\'app...');
    const { data: appQuery, error: appError } = await supabase
      .from('quote_lines')
      .select('*')
      .eq('quote_id', testQuoteId);
      
    console.log('Résultat requête app:', appQuery);
    console.log('Erreur requête app:', appError);
    
    // 6. Vérifier les politiques RLS
    console.log('\n6. Info pour debug RLS...');
    const { data: currentUser } = await supabase.auth.getUser();
    console.log('User ID actuel:', currentUser?.user?.id);
    
    // Vérifier que le quote appartient bien à l'utilisateur
    const { data: quoteOwner, error: ownerError } = await supabase
      .from('quotes')
      .select('user_id, quote_number')
      .eq('id', testQuoteId)
      .single();
      
    if (!ownerError && quoteOwner) {
      console.log('Quote appartient à user_id:', quoteOwner.user_id);
      console.log('Quote number:', quoteOwner.quote_number);
      console.log('Match avec user actuel:', quoteOwner.user_id === currentUser?.user?.id);
    }
    
  } catch (error) {
    console.log('💥 Erreur générale:', error);
  }
}

debugQuoteLines().catch(console.error);
