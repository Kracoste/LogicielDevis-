// Diagnostic Supabase pour les devis et leurs lignes
console.log('🔍 DIAGNOSTIC SUPABASE - DEVIS ET LIGNES');

// Cette fonction sera appelée depuis la console du navigateur
window.debugSupabaseQuotes = async function() {
    console.log('🔍 === DIAGNOSTIC SUPABASE QUOTES ===');
    
    if (!window.dbService || !window.dbService.supabase) {
        console.error('❌ Service de base de données non disponible');
        return;
    }
    
    const supabase = window.dbService.supabase;
    
    try {
        // 1. Lister tous les devis
        console.log('📋 1. Récupération de tous les devis...');
        const { data: allQuotes, error: quotesError } = await supabase
            .from('quotes')
            .select('id, quote_number, client_name, created_at, subtotal_ht')
            .order('created_at', { ascending: false });
        
        if (quotesError) {
            console.error('❌ Erreur récupération devis:', quotesError);
            return;
        }
        
        console.log(`📋 ${allQuotes.length} devis trouvés:`, allQuotes);
        
        // 2. Pour chaque devis, vérifier s'il a des lignes
        console.log('📊 2. Vérification des lignes pour chaque devis...');
        
        for (const quote of allQuotes) {
            console.log(`\n🔍 Devis ${quote.quote_number} (ID: ${quote.id})`);
            console.log(`   Client: ${quote.client_name}`);
            console.log(`   Montant HT: ${quote.subtotal_ht}€`);
            
            const { data: lines, error: linesError } = await supabase
                .from('quote_lines')
                .select('*')
                .eq('quote_id', quote.id);
            
            if (linesError) {
                console.error(`❌ Erreur récupération lignes pour ${quote.id}:`, linesError);
            } else if (!lines || lines.length === 0) {
                console.warn(`⚠️  AUCUNE LIGNE trouvée pour le devis ${quote.quote_number}`);
            } else {
                console.log(`✅ ${lines.length} lignes trouvées:`, lines);
            }
        }
        
        // 3. Vérifier si la table quote_lines existe et a des données
        console.log('\n📊 3. Statistiques globales quote_lines...');
        const { data: allLines, error: allLinesError, count } = await supabase
            .from('quote_lines')
            .select('*', { count: 'exact' });
        
        if (allLinesError) {
            console.error('❌ Erreur accès table quote_lines:', allLinesError);
        } else {
            console.log(`📊 Total lignes dans quote_lines: ${count}`);
            if (allLines && allLines.length > 0) {
                console.log('📋 Exemples de lignes:', allLines.slice(0, 5));
            }
        }
        
    } catch (error) {
        console.error('❌ Erreur générale diagnostic:', error);
    }
}

// Ajouter à l'objet window pour l'accessibilité depuis la console
console.log('✅ Fonction debugSupabaseQuotes() ajoutée à window');
console.log('💡 Tapez: debugSupabaseQuotes() dans la console pour lancer le diagnostic');
