-- Schema pour le logiciel de devis
-- À exécuter dans l'éditeur SQL de Supabase

-- Table des clients
CREATE TABLE clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'France',
    siret TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des produits/services
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit TEXT DEFAULT 'unité',
    category TEXT,
    reference TEXT,
    tax_rate DECIMAL(5,2) DEFAULT 20.00,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des fournisseurs
CREATE TABLE suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'France',
    siret TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des devis
CREATE TABLE quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_number TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    quote_date DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    notes TEXT,
    
    -- Totaux
    subtotal_ht DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_ttc DECIMAL(10,2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des lignes de devis
CREATE TABLE quote_lines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    -- Détails de la ligne (copie des données produit au moment du devis)
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit_price_ht DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 20.00,
    
    -- Calculés
    line_total_ht DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price_ht) STORED,
    line_tax DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price_ht * tax_rate / 100) STORED,
    line_total_ttc DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price_ht * (1 + tax_rate / 100)) STORED,
    
    line_order INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table des paramètres utilisateur
CREATE TABLE user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Informations entreprise
    company_name TEXT,
    company_address TEXT,
    company_city TEXT,
    company_postal_code TEXT,
    company_country TEXT DEFAULT 'France',
    company_phone TEXT,
    company_email TEXT,
    company_siret TEXT,
    company_logo_url TEXT,
    
    -- Paramètres de devis
    quote_prefix TEXT DEFAULT 'DEV',
    quote_counter INTEGER DEFAULT 1,
    default_tax_rate DECIMAL(5,2) DEFAULT 20.00,
    currency TEXT DEFAULT 'EUR',
    
    -- Template de devis
    quote_terms TEXT DEFAULT 'Devis valable 30 jours. Acompte de 30% à la commande.',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_date ON quotes(quote_date);
CREATE INDEX idx_quote_lines_quote_id ON quote_lines(quote_id);

-- Triggers pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer le prochain numéro de devis
CREATE OR REPLACE FUNCTION generate_quote_number(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    settings_record user_settings%ROWTYPE;
    new_counter INTEGER;
    quote_number TEXT;
BEGIN
    -- Récupérer les paramètres utilisateur
    SELECT * INTO settings_record 
    FROM user_settings 
    WHERE user_id = p_user_id;
    
    -- Si pas de paramètres, créer des paramètres par défaut
    IF NOT FOUND THEN
        INSERT INTO user_settings (user_id) 
        VALUES (p_user_id)
        RETURNING * INTO settings_record;
    END IF;
    
    -- Incrémenter le compteur
    new_counter := settings_record.quote_counter + 1;
    
    -- Mettre à jour le compteur
    UPDATE user_settings 
    SET quote_counter = new_counter 
    WHERE user_id = p_user_id;
    
    -- Générer le numéro de devis
    quote_number := settings_record.quote_prefix || '-' || LPAD(new_counter::TEXT, 4, '0');
    
    RETURN quote_number;
END;
$$ LANGUAGE plpgsql;

-- Policies de sécurité RLS (Row Level Security)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies pour clients
CREATE POLICY "Users can view their own clients" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON clients
    FOR DELETE USING (auth.uid() = user_id);

-- Policies pour products
CREATE POLICY "Users can view their own products" ON products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products" ON products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" ON products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" ON products
    FOR DELETE USING (auth.uid() = user_id);

-- Policies pour suppliers
CREATE POLICY "Users can view their own suppliers" ON suppliers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suppliers" ON suppliers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers" ON suppliers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers" ON suppliers
    FOR DELETE USING (auth.uid() = user_id);

-- Policies pour quotes
CREATE POLICY "Users can view their own quotes" ON quotes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quotes" ON quotes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotes" ON quotes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quotes" ON quotes
    FOR DELETE USING (auth.uid() = user_id);

-- Policies pour quote_lines
CREATE POLICY "Users can view quote lines for their quotes" ON quote_lines
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quotes 
            WHERE quotes.id = quote_lines.quote_id 
            AND quotes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert quote lines for their quotes" ON quote_lines
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM quotes 
            WHERE quotes.id = quote_lines.quote_id 
            AND quotes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update quote lines for their quotes" ON quote_lines
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM quotes 
            WHERE quotes.id = quote_lines.quote_id 
            AND quotes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete quote lines for their quotes" ON quote_lines
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM quotes 
            WHERE quotes.id = quote_lines.quote_id 
            AND quotes.user_id = auth.uid()
        )
    );

-- Policies pour user_settings
CREATE POLICY "Users can view their own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Données de démonstration (optionnel)
-- Vous pouvez les ajouter après avoir créé votre premier utilisateur
