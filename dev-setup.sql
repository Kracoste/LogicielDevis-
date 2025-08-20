-- Script pour configurer Supabase en mode développement
-- À exécuter dans le SQL Editor de Supabase

-- 1. Confirmer automatiquement tous les utilisateurs existants non confirmés
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmation_sent_at = NOW(),
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. Créer une fonction pour auto-confirmer les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION auto_confirm_users()
RETURNS trigger AS $$
BEGIN
  -- Auto-confirmer l'email en mode développement
  NEW.email_confirmed_at = NOW();
  NEW.confirmation_sent_at = NOW();
  NEW.confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Créer un trigger pour auto-confirmer (OPTIONNEL - pour le développement seulement)
-- Décommentez ces lignes si vous voulez auto-confirmer tous les nouveaux comptes :

-- DROP TRIGGER IF EXISTS auto_confirm_users_trigger ON auth.users;
-- CREATE TRIGGER auto_confirm_users_trigger
--   BEFORE INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION auto_confirm_users();

-- 4. Alternative : Confirmer manuellement un utilisateur spécifique
-- Remplacez 'votre-email@example.com' par votre email :

-- UPDATE auth.users 
-- SET email_confirmed_at = NOW(), 
--     confirmation_sent_at = NOW(),
--     confirmed_at = NOW()
-- WHERE email = 'full.g4m3@gmail.com';

-- 5. Vérifier les utilisateurs
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;
