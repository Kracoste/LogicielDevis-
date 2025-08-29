const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://wfwyijywxfupcpuvixpn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmd3lpanl3eGZ1cGNwdXZpeHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ4NjQ3NTIsImV4cCI6MjA0MDQ0MDc1Mn0.lHKJZMT-nJdCOGF7f8d4LkJSZCB9uNYGqxqP4GJc3SI';

async function debugQuoteLines() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
        console.log('🔍 === DIAGNOSTIC DES QUOTE_LINES ===');
        
        // 1. Vérifier la structure de la table quote_lines
        console.log('\n1. Vérification structure quote_lines...');
        const { data: quoteLines, error: quoteLinesError } = await supabase
            .from('quote_lines')
            .select('*')
            .limit(10);
            
        if (quoteLinesError) {
            console.error('❌ Erreur quote_lines:', quoteLinesError);
        } else {
            console.log('✅ quote_lines trouvées:', quoteLines?.length || 0);
            if (quoteLines && quoteLines.length > 0) {
                console.log('📊 Exemple de quote_line:', JSON.stringify(quoteLines[0], null, 2));
            }
        }
        
        // 2. Vérifier pour les devis spécifiques mentionnés dans les logs
        console.log('\n2. Vérification quote_lines pour devis e57daa0b-39e8-4c3e-9f72-0065b672a78e...');
        const { data: linesForQuote1, error: error1 } = await supabase
            .from('quote_lines')
            .select('*')
            .eq('quote_id', 'e57daa0b-39e8-4c3e-9f72-0065b672a78e');
            
        if (error1) {
            console.error('❌ Erreur requête devis 1:', error1);
        } else {
            console.log('✅ Lignes pour devis 1:', linesForQuote1?.length || 0);
            if (linesForQuote1 && linesForQuote1.length > 0) {
                console.log('📊 Lignes:', JSON.stringify(linesForQuote1, null, 2));
            }
        }
        
        // 3. Vérifier pour l'autre devis
        console.log('\n3. Vérification quote_lines pour devis 97b082ed-821b-4553-96ff-c8c9e034c262...');
        const { data: linesForQuote2, error: error2 } = await supabase
            .from('quote_lines')
            .select('*')
            .eq('quote_id', '97b082ed-821b-4553-96ff-c8c9e034c262');
            
        if (error2) {
            console.error('❌ Erreur requête devis 2:', error2);
        } else {
            console.log('✅ Lignes pour devis 2:', linesForQuote2?.length || 0);
            if (linesForQuote2 && linesForQuote2.length > 0) {
                console.log('📊 Lignes:', JSON.stringify(linesForQuote2, null, 2));
            }
        }
        
        // 4. Vérifier les devis eux-mêmes
        console.log('\n4. Vérification quotes table...');
        const { data: quotes, error: quotesError } = await supabase
            .from('quotes')
            .select('*')
            .in('id', ['e57daa0b-39e8-4c3e-9f72-0065b672a78e', '97b082ed-821b-4553-96ff-c8c9e034c262']);
            
        if (quotesError) {
            console.error('❌ Erreur quotes:', quotesError);
        } else {
            console.log('✅ Devis trouvés:', quotes?.length || 0);
            quotes?.forEach(quote => {
                console.log(`📋 Devis ${quote.id}:`, {
                    numero: quote.quote_number,
                    client: quote.client_name,
                    total: quote.total_ttc,
                    date: quote.created_at
                });
            });
        }
        
        // 5. Vérifier s'il existe des tables alternatives
        console.log('\n5. Vérification tables alternatives...');
        
        // Essayer quote_services
        try {
            const { data: services, error: servicesError } = await supabase
                .from('quote_services')
                .select('*')
                .limit(10);
            console.log('✅ quote_services existe:', services?.length || 0, 'lignes');
        } catch (e) {
            console.log('❌ quote_services n\'existe pas ou erreur:', e.message);
        }
        
        // Essayer services
        try {
            const { data: servicesOnly, error: servicesOnlyError } = await supabase
                .from('services')
                .select('*')
                .limit(10);
            console.log('✅ services existe:', servicesOnly?.length || 0, 'lignes');
        } catch (e) {
            console.log('❌ services n\'existe pas ou erreur:', e.message);
        }
        
    } catch (error) {
        console.error('❌ Erreur générale:', error);
    }
}

debugQuoteLines().then(() => {
    console.log('\n✅ Diagnostic terminé');
    process.exit(0);
}).catch(console.error);
