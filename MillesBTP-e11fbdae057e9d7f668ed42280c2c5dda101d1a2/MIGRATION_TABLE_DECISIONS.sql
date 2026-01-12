-- =====================================================
-- Migration : Ajout de la table decisions_chantier
-- =====================================================
-- Description : Permet aux conducteurs de formaliser leurs décisions
--               face aux écarts et risques détectés sur les chantiers
-- Date : 2026-01-03
-- =====================================================

-- 1. Créer la table decisions_chantier
CREATE TABLE IF NOT EXISTS decisions_chantier (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chantier_id TEXT NOT NULL REFERENCES chantiers(id) ON DELETE CASCADE,
  type_decision TEXT NOT NULL CHECK (type_decision IN ('corriger', 'regulariser', 'assumer')),
  motif TEXT NOT NULL,
  commentaire TEXT,
  impact_cout NUMERIC(10, 2),
  impact_delai INTEGER,
  date_decision TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Créer les index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_decisions_chantier_id ON decisions_chantier(chantier_id);
CREATE INDEX IF NOT EXISTS idx_decisions_created_by ON decisions_chantier(created_by);
CREATE INDEX IF NOT EXISTS idx_decisions_date_decision ON decisions_chantier(date_decision DESC);

-- 3. Créer le trigger pour updated_at
CREATE OR REPLACE FUNCTION update_decisions_chantier_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_decisions_chantier_updated_at
  BEFORE UPDATE ON decisions_chantier
  FOR EACH ROW
  EXECUTE FUNCTION update_decisions_chantier_updated_at();

-- 4. Activer Row Level Security (RLS)
ALTER TABLE decisions_chantier ENABLE ROW LEVEL SECURITY;

-- 5. Créer les politiques RLS
-- Politique SELECT : L'utilisateur peut voir ses propres décisions
CREATE POLICY "Users can view their own decisions"
  ON decisions_chantier
  FOR SELECT
  USING (created_by = auth.uid());

-- Politique INSERT : L'utilisateur peut créer des décisions pour ses chantiers
CREATE POLICY "Users can create decisions for their chantiers"
  ON decisions_chantier
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chantiers
      WHERE chantiers.id = decisions_chantier.chantier_id
      AND chantiers.user_id = auth.uid()
    )
  );

-- Politique UPDATE : L'utilisateur peut modifier ses propres décisions
CREATE POLICY "Users can update their own decisions"
  ON decisions_chantier
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Politique DELETE : L'utilisateur peut supprimer ses propres décisions
CREATE POLICY "Users can delete their own decisions"
  ON decisions_chantier
  FOR DELETE
  USING (created_by = auth.uid());

-- =====================================================
-- Vérification de la migration
-- =====================================================

-- Vérifier que la table existe
SELECT 
  table_name, 
  table_type
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name = 'decisions_chantier';

-- Vérifier les colonnes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'decisions_chantier'
ORDER BY ordinal_position;

-- Vérifier les index
SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE tablename = 'decisions_chantier';

-- Vérifier les politiques RLS
SELECT 
  policyname, 
  cmd, 
  qual
FROM pg_policies
WHERE tablename = 'decisions_chantier';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================

