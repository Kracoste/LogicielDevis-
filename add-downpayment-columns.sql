-- Script pour ajouter les colonnes d'acompte à la table quotes
-- À exécuter dans l'éditeur SQL de Supabase

ALTER TABLE quotes 
ADD COLUMN down_payment_required BOOLEAN DEFAULT FALSE,
ADD COLUMN down_payment_type TEXT DEFAULT 'percentage' CHECK (down_payment_type IN ('percentage', 'fixed')),
ADD COLUMN down_payment_value DECIMAL(10,2) DEFAULT 0,
ADD COLUMN down_payment_amount DECIMAL(10,2) DEFAULT 0;

-- Ajouter un commentaire pour documenter les nouvelles colonnes
COMMENT ON COLUMN quotes.down_payment_required IS 'Indique si un acompte est requis pour ce devis';
COMMENT ON COLUMN quotes.down_payment_type IS 'Type d''acompte: percentage (pourcentage du total) ou fixed (montant fixe)';
COMMENT ON COLUMN quotes.down_payment_value IS 'Valeur de l''acompte (pourcentage ou montant selon le type)';
COMMENT ON COLUMN quotes.down_payment_amount IS 'Montant calculé de l''acompte en euros';
