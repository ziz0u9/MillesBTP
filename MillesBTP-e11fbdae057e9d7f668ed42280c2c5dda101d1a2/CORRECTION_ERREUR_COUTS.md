# 🔧 Correction : Erreur lors de l'enregistrement des coûts

## ❌ Erreur rencontrée

```
Could not find the 'couts_engages' column of 'chantiers' in the schema cache
```

## 🔍 Cause

La colonne `couts_engages` n'existe pas dans votre table `chantiers` sur Supabase.

## ✅ Solution rapide (2 minutes)

### Étape 1 : Ouvrir Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre projet
3. Cliquez sur **"SQL Editor"** dans le menu de gauche

### Étape 2 : Exécuter le script de migration

1. Cliquez sur **"New query"**
2. Copiez-collez ce code :

```sql
-- Ajouter la colonne couts_engages
ALTER TABLE chantiers 
ADD COLUMN IF NOT EXISTS couts_engages NUMERIC(10, 2) DEFAULT 0;

-- Mettre à jour les chantiers existants
UPDATE chantiers 
SET couts_engages = 0 
WHERE couts_engages IS NULL;
```

3. Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter`)

### Étape 3 : Vérifier

Vous devriez voir :

```
Success. No rows returned
```

C'est normal ! La colonne a été ajoutée.

### Étape 4 : Rafraîchir l'application

1. Retournez sur votre application web
2. Appuyez sur `F5` pour rafraîchir la page
3. Essayez d'ajouter un coût → ✅ Ça devrait fonctionner !

---

## 🔄 Alternative : Script complet

Si vous préférez utiliser le script de migration complet :

1. Ouvrez le fichier `MIGRATION_AJOUT_COUTS_ENGAGES.sql`
2. Copiez tout son contenu
3. Collez-le dans l'éditeur SQL de Supabase
4. Cliquez sur "Run"

---

## ✅ Vérification rapide

Pour vérifier que la colonne existe bien :

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chantiers' 
AND column_name = 'couts_engages';
```

Résultat attendu :

```
column_name    | data_type
---------------|----------
couts_engages  | numeric
```

---

## 🚀 Après la correction

Une fois la colonne ajoutée, vous pourrez :

✅ Enregistrer des coûts terrain  
✅ Voir la marge en cours calculée automatiquement  
✅ Recevoir des suggestions d'avenants  
✅ Être alerté sur les coûts importants  

---

## 📝 Note importante

Si vous avez d'autres erreurs de colonnes manquantes, il est recommandé d'exécuter le script complet `supabase-schema.sql` pour créer toutes les tables avec toutes les colonnes nécessaires.

Voir le guide : `INSTALLATION_SUPABASE.md`


