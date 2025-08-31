// src/services/database.js
// Service minimal Supabase pour la gestion des clients

// Assure que Supabase est initialisé
if (!window.supabase) {
  // Remplacer par votre config si besoin
  window.supabase = window.createSupabaseClient ? window.createSupabaseClient() : null;
}

const dbService = {
  // Initialisation du service (pour compatibilité avec init.js)
  async initialize() {
    if (!window.supabase) {
      // Essayez d'initialiser Supabase si possible
      if (window.createSupabaseClient) {
        window.supabase = window.createSupabaseClient();
      }
    }
    console.log('✅ dbService initialisé');
    return true;
  },
  // Récupère tous les clients
  async getClients() {
    if (!window.supabase) {
      console.error('Supabase non initialisé');
      return [];
    }
    const { data, error } = await window.supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Erreur récupération clients:', error);
      return [];
    }
    return data || [];
  },

  // Crée un client
  async createClient(clientData) {
    if (!window.supabase) {
      console.error('Supabase non initialisé');
      return null;
    }
    const { data, error } = await window.supabase.from('clients').insert([clientData]).select();
    if (error) {
      console.error('Erreur création client:', error);
      return null;
    }
    return data && data[0] ? data[0] : null;
  }
};

window.dbService = dbService;

export default dbService;
