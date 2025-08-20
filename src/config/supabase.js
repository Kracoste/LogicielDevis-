// Configuration Supabase
// IMPORTANT: Remplacez ces valeurs par vos vraies clés Supabase

const SUPABASE_CONFIG = {
  // URL de votre projet Supabase (format: https://xxxxxxxxxxx.supabase.co)
  url: 'https://wfwyijywxfupcpuvixpn.supabase.co',
  
  // Clé API anonyme (commence par eyJ...)
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmd3lpanl3eGZ1cGNwdXZpeHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjUxODgsImV4cCI6MjA3MDg0MTE4OH0.Hg1JQmOUgvW09EzB_HFelLa8sgDL2DGmKb00aLaFSo8'
};

// Vérifier la configuration
function validateSupabaseConfig() {
  if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL' || 
      SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn('⚠️ Configuration Supabase non configurée. Mode démo activé.');
    return false;
  }
  return true;
}

module.exports = { SUPABASE_CONFIG, validateSupabaseConfig };
