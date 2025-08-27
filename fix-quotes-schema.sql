-- Script pour ajouter les colonnes client à la table quotes
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajouter les colonnes client à la table quotes
ALTER TABLE quotes 
ADD COLUMN client_name VARCHAR(255),
ADD COLUMN client_email VARCHAR(255),
ADD COLUMN client_phone VARCHAR(100),
ADD COLUMN client_address TEXT;

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quotes' 
ORDER BY ordinal_position;
