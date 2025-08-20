# Logiciel de Devis Moderne

Application de gestion de devis moderne construite avec **Electron**, **Tailwind CSS** et **Supabase**.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Electron](https://img.shields.io/badge/electron-28.0.0-9feaf9.svg)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-3.4.0-06b6d4.svg)
![Supabase](https://img.shields.io/badge/supabase-2.38.4-3ecf8e.svg)

## 🚀 Fonctionnalités

- **💼 Gestion complète des devis** : Création, modification, suivi des devis
- **👥 Gestion client** : Base de données client complète
- **📦 Catalogue produits** : Gestion des produits et services
- **🏢 Fournisseurs** : Suivi des fournisseurs et partenaires
- **📊 Tableau de bord** : Statistiques et aperçu de l'activité
- **🎨 Interface moderne** : Design contemporain avec Tailwind CSS
- **🔒 Authentification sécurisée** : Système d'auth avec Supabase
- **💾 Base de données cloud** : Stockage sécurisé avec PostgreSQL
- **🖥️ Application desktop** : Cross-platform avec Electron

## 🛠️ Technologies

- **Frontend** : HTML5, CSS3 (Tailwind), JavaScript ES6+
- **Desktop** : Electron 28.0.0
- **Base de données** : Supabase (PostgreSQL)
- **Styling** : Tailwind CSS 3.4.0
- **Build** : Node.js, npm

## 📋 Prérequis

- Node.js 18+ 
- npm 9+
- Compte Supabase (optionnel, mode démo disponible)

## 🚀 Installation

1. **Cloner le projet**
   ```bash
   git clone <url-du-projet>
   cd logiciel-devis-moderne
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Compiler les styles**
   ```bash
   npm run build-css
   ```

4. **Configurer Supabase (optionnel)**
   - Créer un projet sur [supabase.com](https://supabase.com)
   - Remplacer les variables dans `src/renderer/preload.js`
   - Ou utiliser le mode démo avec `demo@demo.com` / `demo`

## 🏃‍♂️ Lancement

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm start
```

### Build application
```bash
npm run build
```

## 📱 Utilisation

### Première connexion
1. Lancer l'application
2. Utiliser les identifiants de démo :
   - **Email** : `demo@demo.com`
   - **Mot de passe** : `demo`

### Interface principale
- **Tableau de bord** : Vue d'ensemble de l'activité
- **Devis** : Créer et gérer les devis
- **Clients** : Gestion de la base client
- **Produits** : Catalogue des produits/services
- **Paramètres** : Configuration de l'application

## 🔧 Scripts npm

| Script | Description |
|--------|-------------|
| `npm start` | Lancer l'application en mode production |
| `npm run dev` | Mode développement avec rechargement auto |
| `npm run build-css` | Compiler Tailwind CSS |
| `npm run watch-css` | Surveiller les changements CSS |
| `npm run build` | Construire l'application pour distribution |

## 📁 Structure du projet

```
src/
├── main/                   # Processus principal Electron
│   └── main.js            # Point d'entrée principal
├── renderer/              # Interface utilisateur
│   ├── index.html         # Application principale  
│   ├── login.html         # Page de connexion
│   ├── preload.js         # Script de préchargement sécurisé
│   ├── js/
│   │   ├── app.js         # Logique principale
│   │   ├── auth.js        # Authentification
│   │   └── supabase.min.js # Client Supabase
│   └── styles/
│       ├── input.css      # Styles Tailwind source
│       └── output.css     # Styles compilés
```

## 🎨 Personnalisation

### Couleurs
Modifier les couleurs dans `tailwind.config.js` :
```javascript
theme: {
  extend: {
    colors: {
      primary: { /* vos couleurs */ }
    }
  }
}
```

### Styles personnalisés
Ajouter vos styles dans `src/renderer/styles/input.css`

## 🔒 Configuration Supabase

### Variables d'environnement
```javascript
// Dans src/renderer/preload.js
getSupabaseUrl: () => 'YOUR_SUPABASE_URL',
getSupabaseKey: () => 'YOUR_SUPABASE_ANON_KEY'
```

### Schéma de base de données
```sql
-- Clients
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Devis
CREATE TABLE quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id),
  status TEXT DEFAULT 'draft',
  total_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚧 Développement

### Mode démo
L'application fonctionne en mode démo sans configuration Supabase.

### Hot reload
```bash
npm run dev
```

### Debug
- F12 pour ouvrir les DevTools
- Menu > Affichage > Outils de développement

## 📦 Distribution

### Windows
```bash
npm run build
# Génère dist/logiciel-devis-Setup-2.0.0.exe
```

### macOS
```bash
npm run build
# Génère dist/logiciel-devis-2.0.0.dmg
```

### Linux
```bash
npm run build  
# Génère dist/logiciel-devis-2.0.0.AppImage
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajouter une nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- **Documentation** : Consultez ce README
- **Issues** : Ouvrir une issue sur GitHub
- **Wiki** : Documentation détaillée (à venir)

## 🎯 Roadmap

- [ ] **v2.1** : Génération PDF avancée
- [ ] **v2.2** : Synchronisation hors ligne
- [ ] **v2.3** : Rapports et analytics
- [ ] **v2.4** : API REST
- [ ] **v3.0** : Version mobile

---

**Développé avec ❤️ par [Votre Nom]**
