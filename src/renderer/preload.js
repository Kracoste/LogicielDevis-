const { contextBridge, ipcRenderer } = require('electron');

console.log('🔧 [PRELOAD] === SCRIPT PRELOAD CHARGÉ ===');

// Configuration Supabase directe (éviter les problèmes de modules Node.js dans preload)
const SUPABASE_CONFIG = {
  url: 'https://wfwyijywxfupcpuvixpn.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmd3lpanl3eGZ1cGNwdXZpeHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjUxODgsImV4cCI6MjA3MDg0MTE4OH0.Hg1JQmOUgvW09EzB_HFelLa8sgDL2DGmKb00aLaFSo8'
};

console.log('✅ Configuration Supabase prête:', {
  url: SUPABASE_CONFIG.url,
  anonKeyExists: !!SUPABASE_CONFIG.anonKey
});

// Exposer les APIs sécurisées au renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Authentification
  loginSuccess: (userData) => ipcRenderer.invoke('login-success', userData),
  
  // Gestion des fenêtres
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('toggle-maximize-window'),
  close: () => ipcRenderer.invoke('quit-app'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  toggleMaximizeWindow: () => ipcRenderer.invoke('toggle-maximize-window'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  
  // Navigation entre les fenêtres
  switchToMainWindow: () => ipcRenderer.invoke('switch-to-main'),
  switchToLoginWindow: () => ipcRenderer.invoke('switch-to-login'),
  
  // Menu actions
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', callback);
  },
  
  removeMenuActionListener: () => {
    ipcRenderer.removeAllListeners('menu-action');
  }
});

// Exposer Supabase API (sécurisé)
contextBridge.exposeInMainWorld('supabaseAPI', {
  // Configuration Supabase
  getSupabaseUrl: () => {
    console.log('🔗 Récupération URL Supabase:', SUPABASE_CONFIG.url);
    return SUPABASE_CONFIG.url;
  },
  getSupabaseKey: () => {
    console.log('🔑 Récupération clé Supabase');
    return SUPABASE_CONFIG.anonKey;
  },
  
  // Helper pour vérifier la configuration
  isConfigured: () => {
    const isConfigured = SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' && 
           SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
           !!SUPABASE_CONFIG.url &&
           !!SUPABASE_CONFIG.anonKey;
    console.log('🔍 Vérification configuration Supabase - Configuré:', isConfigured);
    return isConfigured;
  }
});
