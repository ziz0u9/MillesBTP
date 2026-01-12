-- Migration: Ajout de la colonne couts_engages si elle n'existe pas
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajouter la colonne couts_engages si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chantiers' 
    AND column_name = 'couts_engages'
  ) THEN
    ALTER TABLE chantiers 
    ADD COLUMN couts_engages NUMERIC(10, 2) DEFAULT 0;
    
    RAISE NOTICE 'Colonne couts_engages ajoutée avec succès !';
  ELSE
    RAISE NOTICE 'La colonne couts_engages existe déjà.';
  END IF;
END $$;

-- Mettre à jour les chantiers existants avec une valeur par défaut
UPDATE chantiers 
SET couts_engages = 0 
WHERE couts_engages IS NULL;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✓ Migration terminée avec succès !';
  RAISE NOTICE '✓ Vous pouvez maintenant enregistrer des coûts.';
END $$;


