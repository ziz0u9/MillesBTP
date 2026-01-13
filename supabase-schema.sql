-- Script SQL pour créer toutes les tables MillesBTP dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Activer l'extension UUID si ce n'est pas déjà fait
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: chantiers
CREATE TABLE IF NOT EXISTS chantiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  client TEXT NOT NULL,
  adresse TEXT,
  type_chantier TEXT,
  statut_administratif TEXT DEFAULT 'en_cours',
  statut_reel TEXT DEFAULT 'non_mesure',
  marge_reference NUMERIC(10, 2) DEFAULT 0,
  marge_prevue NUMERIC(10, 2) DEFAULT 0,
  marge_projetee NUMERIC(10, 2) DEFAULT 0,
  couts_engages NUMERIC(10, 2) DEFAULT 0,
  delai_prevu INTEGER,
  delai_projete INTEGER,
  date_debut TIMESTAMP WITH TIME ZONE,
  date_fin_prevue TIMESTAMP WITH TIME ZONE,
  date_fin_reelle TIMESTAMP WITH TIME ZONE,
  montant_total NUMERIC(10, 2) DEFAULT 0,
  dernier_activite TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: ecarts
CREATE TABLE IF NOT EXISTS ecarts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chantier_id UUID NOT NULL REFERENCES chantiers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_delai INTEGER DEFAULT 0,
  impact_cout NUMERIC(10, 2) DEFAULT 0,
  impact_marge NUMERIC(10, 2) DEFAULT 0,
  statut TEXT DEFAULT 'nouveau',
  photos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: decisions
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecart_id UUID REFERENCES ecarts(id) ON DELETE SET NULL,
  chantier_id UUID NOT NULL REFERENCES chantiers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  question TEXT NOT NULL,
  impact_estime NUMERIC(10, 2) DEFAULT 0,
  deadline TIMESTAMP WITH TIME ZONE,
  statut TEXT DEFAULT 'en_attente',
  responsable_id UUID REFERENCES users(id) ON DELETE SET NULL,
  decision TEXT,
  prise_le TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: avenants
CREATE TABLE IF NOT EXISTS avenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecart_id UUID REFERENCES ecarts(id) ON DELETE SET NULL,
  chantier_id UUID NOT NULL REFERENCES chantiers(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  description TEXT NOT NULL,
  montant NUMERIC(10, 2) DEFAULT 0,
  delai_supplementaire INTEGER DEFAULT 0,
  statut TEXT DEFAULT 'brouillon',
  envoye_le TIMESTAMP WITH TIME ZONE,
  valide_le TIMESTAMP WITH TIME ZONE,
  refuse_le TIMESTAMP WITH TIME ZONE,
  raison_refus TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: evenements_terrain
CREATE TABLE IF NOT EXISTS evenements_terrain (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chantier_id UUID NOT NULL REFERENCES chantiers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  titre TEXT,
  description TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  impact_delai INTEGER DEFAULT 0,
  impact_cout NUMERIC(10, 2) DEFAULT 0,
  ecart_id UUID REFERENCES ecarts(id) ON DELETE SET NULL,
  auteur_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: alertes
CREATE TABLE IF NOT EXISTS alertes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chantier_id UUID REFERENCES chantiers(id) ON DELETE CASCADE,
  ecart_id UUID REFERENCES ecarts(id) ON DELETE SET NULL,
  decision_id UUID REFERENCES decisions(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  titre TEXT NOT NULL,
  description TEXT,
  impact_estime NUMERIC(10, 2) DEFAULT 0,
  urgence TEXT DEFAULT 'moyenne',
  statut TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_chantiers_user_id ON chantiers(user_id);
CREATE INDEX IF NOT EXISTS idx_ecarts_chantier_id ON ecarts(chantier_id);
CREATE INDEX IF NOT EXISTS idx_decisions_chantier_id ON decisions(chantier_id);
CREATE INDEX IF NOT EXISTS idx_decisions_statut ON decisions(statut);
CREATE INDEX IF NOT EXISTS idx_avenants_chantier_id ON avenants(chantier_id);
CREATE INDEX IF NOT EXISTS idx_evenements_terrain_chantier_id ON evenements_terrain(chantier_id);
CREATE INDEX IF NOT EXISTS idx_alertes_chantier_id ON alertes(chantier_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_chantiers_updated_at ON chantiers;
CREATE TRIGGER update_chantiers_updated_at
  BEFORE UPDATE ON chantiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ecarts_updated_at ON ecarts;
CREATE TRIGGER update_ecarts_updated_at
  BEFORE UPDATE ON ecarts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_decisions_updated_at ON decisions;
CREATE TRIGGER update_decisions_updated_at
  BEFORE UPDATE ON decisions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_avenants_updated_at ON avenants;
CREATE TRIGGER update_avenants_updated_at
  BEFORE UPDATE ON avenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Activer Row Level Security (RLS) sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chantiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecarts ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE avenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE evenements_terrain ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertes ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour users (chaque utilisateur voit seulement ses données)
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Politiques RLS pour chantiers
CREATE POLICY "Users can view own chantiers" ON chantiers
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own chantiers" ON chantiers
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own chantiers" ON chantiers
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own chantiers" ON chantiers
  FOR DELETE USING (auth.uid()::text = user_id);

-- Politiques RLS pour ecarts (via chantiers)
CREATE POLICY "Users can view ecarts of own chantiers" ON ecarts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = ecarts.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert ecarts on own chantiers" ON ecarts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = ecarts.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update ecarts of own chantiers" ON ecarts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = ecarts.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete ecarts of own chantiers" ON ecarts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = ecarts.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

-- Politiques RLS pour decisions
CREATE POLICY "Users can view decisions of own chantiers" ON decisions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = decisions.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert decisions on own chantiers" ON decisions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = decisions.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update decisions of own chantiers" ON decisions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = decisions.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete decisions of own chantiers" ON decisions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = decisions.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

-- Politiques RLS pour avenants
CREATE POLICY "Users can view avenants of own chantiers" ON avenants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = avenants.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert avenants on own chantiers" ON avenants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = avenants.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update avenants of own chantiers" ON avenants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = avenants.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete avenants of own chantiers" ON avenants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = avenants.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

-- Politiques RLS pour evenements_terrain
CREATE POLICY "Users can view evenements of own chantiers" ON evenements_terrain
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = evenements_terrain.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert evenements on own chantiers" ON evenements_terrain
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = evenements_terrain.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update evenements of own chantiers" ON evenements_terrain
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = evenements_terrain.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete evenements of own chantiers" ON evenements_terrain
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = evenements_terrain.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

-- Politiques RLS pour alertes
CREATE POLICY "Users can view alertes of own chantiers" ON alertes
  FOR SELECT USING (
    chantier_id IS NULL OR
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = alertes.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert alertes on own chantiers" ON alertes
  FOR INSERT WITH CHECK (
    chantier_id IS NULL OR
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = alertes.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update alertes of own chantiers" ON alertes
  FOR UPDATE USING (
    chantier_id IS NULL OR
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = alertes.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete alertes of own chantiers" ON alertes
  FOR DELETE USING (
    chantier_id IS NULL OR
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = alertes.chantier_id
      AND chantiers.user_id = auth.uid()::text
    )
  );

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Toutes les tables MillesBTP ont été créées avec succès !';
  RAISE NOTICE 'Row Level Security (RLS) activé sur toutes les tables.';
  RAISE NOTICE 'Vous pouvez maintenant utiliser l''application.';
END $$;

