const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';

// Configuration pour le développement (optionnel)
if (isDev) {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    });
    console.log('✅ Electron-reload activé');
  } catch (e) {
    console.log('ℹ️ Electron-reload non disponible (normal)');
  }
}

class Application {
  constructor() {
    this.mainWindow = null;
    this.loginWindow = null;
    
    // Configuration de l'application
    this.setupApp();
  }

  setupApp() {
    // Event listeners pour l'application
    app.whenReady().then(() => {
      this.createLoginWindow();
      this.setupMenu();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createLoginWindow();
      }
    });

    // IPC handlers
    this.setupIPCHandlers();
  }

  createLoginWindow() {
    this.loginWindow = new BrowserWindow({
      width: 400,
      height: 500,
      center: true,
      resizable: false,
      maximizable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../renderer/preload.js')
      },
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: '#ffffff',
        symbolColor: '#1f2937'
      }
    });

    this.loginWindow.loadFile(path.join(__dirname, '../renderer/login.html'));

    // FORCER L'OUVERTURE DE LA CONSOLE DE DÉVELOPPEMENT pour la fenêtre de connexion
    console.log('🔧 FORCE - Ouverture des DevTools pour fenêtre de connexion');
    this.loginWindow.webContents.openDevTools();

    // Capturer les erreurs de console
    this.loginWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`[LOGIN CONSOLE ${level}]:`, message);
    });

    // Capturer les erreurs non gérées
    this.loginWindow.webContents.on('unresponsive', () => {
      console.error('❌ Fenêtre de connexion ne répond plus');
    });

    this.loginWindow.on('closed', () => {
      this.loginWindow = null;
    });
  }

  createMainWindow() {
    console.log('🏗️  Création de la fenêtre principale...');
    
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 700,
      center: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../renderer/preload.js')
      },
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: '#ffffff',
        symbolColor: '#1f2937'
      },
      show: false
    });

    console.log('📄 Chargement du fichier index.new.html...');
    this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.new.html'));

    // FORCER L'OUVERTURE DE LA CONSOLE DE DÉVELOPPEMENT
    console.log('🔧 FORCE - Ouverture des DevTools pour diagnostic');
    this.mainWindow.webContents.openDevTools();

    this.mainWindow.once('ready-to-show', () => {
      console.log('✅ Fenêtre principale prête, affichage...');
      this.mainWindow.show();
      this.mainWindow.focus();
    });
    
    // Diagnostic : écouter les messages de console de la fenêtre principale
    this.mainWindow.webContents.on('console-message', (event, level, message) => {
      console.log(`[MAIN WINDOW CONSOLE]: ${message}`);
    });
    
    // Diagnostic : confirmer le chargement du DOM
    this.mainWindow.webContents.on('dom-ready', () => {
      console.log('🎯 [MAIN WINDOW] DOM chargé - scripts devraient s\'exécuter maintenant');
    });
    
    this.mainWindow.webContents.on('did-finish-load', () => {
      console.log('🎯 [MAIN WINDOW] Page complètement chargée');
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  setupMenu() {
    const template = [
      {
        label: 'Fichier',
        submenu: [
          {
            label: 'Nouveau devis',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              if (this.mainWindow) {
                this.mainWindow.webContents.send('menu-action', 'new-quote');
              }
            }
          },
          { type: 'separator' },
          {
            label: 'Exporter',
            submenu: [
              {
                label: 'Exporter en PDF',
                click: () => {
                  if (this.mainWindow) {
                    this.mainWindow.webContents.send('menu-action', 'export-pdf');
                  }
                }
              },
              {
                label: 'Exporter en CSV',
                click: () => {
                  if (this.mainWindow) {
                    this.mainWindow.webContents.send('menu-action', 'export-csv');
                  }
                }
              }
            ]
          },
          { type: 'separator' },
          {
            label: 'Quitter',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Édition',
        submenu: [
          { role: 'undo', label: 'Annuler' },
          { role: 'redo', label: 'Rétablir' },
          { type: 'separator' },
          { role: 'cut', label: 'Couper' },
          { role: 'copy', label: 'Copier' },
          { role: 'paste', label: 'Coller' },
          { role: 'selectall', label: 'Tout sélectionner' }
        ]
      },
      {
        label: 'Affichage',
        submenu: [
          { role: 'reload', label: 'Actualiser' },
          { role: 'forceReload', label: 'Forcer l\'actualisation' },
          { role: 'toggleDevTools', label: 'Outils de développement' },
          { type: 'separator' },
          { role: 'resetZoom', label: 'Zoom normal' },
          { role: 'zoomIn', label: 'Zoomer' },
          { role: 'zoomOut', label: 'Dézoomer' },
          { type: 'separator' },
          { role: 'togglefullscreen', label: 'Plein écran' }
        ]
      },
      {
        label: 'Aide',
        submenu: [
          {
            label: 'À propos',
            click: () => {
              if (this.mainWindow) {
                this.mainWindow.webContents.send('menu-action', 'about');
              }
            }
          }
        ]
      }
    ];

    // macOS spécifique
    if (process.platform === 'darwin') {
      template.unshift({
        label: app.getName(),
        submenu: [
          { role: 'about', label: 'À propos de ' + app.getName() },
          { type: 'separator' },
          { role: 'services', label: 'Services' },
          { type: 'separator' },
          { role: 'hide', label: 'Masquer ' + app.getName() },
          { role: 'hideothers', label: 'Masquer les autres' },
          { role: 'unhide', label: 'Tout afficher' },
          { type: 'separator' },
          { role: 'quit', label: 'Quitter ' + app.getName() }
        ]
      });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  setupIPCHandlers() {
    // Authentification réussie
    ipcMain.handle('login-success', async (event, userData) => {
      if (this.loginWindow) {
        this.loginWindow.close();
      }
      this.createMainWindow();
      return { success: true };
    });

    // Navigation entre les fenêtres
    ipcMain.handle('switch-to-main', async () => {
      console.log('🚀 [IPC] Demande de basculement vers la fenêtre principale');
      
      if (this.loginWindow) {
        console.log('🔒 Fermeture de la fenêtre de connexion');
        this.loginWindow.close();
      }
      
      if (!this.mainWindow) {
        console.log('📱 Création de la fenêtre principale');
        this.createMainWindow();
      } else {
        console.log('📱 Affichage de la fenêtre principale existante');
        this.mainWindow.show();
        this.mainWindow.focus();
      }
      
      console.log('✅ [IPC] Basculement terminé');
      return { success: true };
    });

    ipcMain.handle('switch-to-login', async () => {
      if (this.mainWindow) {
        this.mainWindow.close();
      }
      if (!this.loginWindow) {
        this.createLoginWindow();
      } else {
        this.loginWindow.show();
        this.loginWindow.focus();
      }
      return { success: true };
    });

    // Fermeture de l'application
    ipcMain.handle('quit-app', async () => {
      app.quit();
    });

    // Minimiser la fenêtre
    ipcMain.handle('minimize-window', async () => {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow) {
        focusedWindow.minimize();
      }
    });

    // Maximiser/Restaurer la fenêtre
    ipcMain.handle('toggle-maximize-window', async () => {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow) {
        if (focusedWindow.isMaximized()) {
          focusedWindow.unmaximize();
        } else {
          focusedWindow.maximize();
        }
      }
    });
  }
}

// Créer l'application
new Application();
