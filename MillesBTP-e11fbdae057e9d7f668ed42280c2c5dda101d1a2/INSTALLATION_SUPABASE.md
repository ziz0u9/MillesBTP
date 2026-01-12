# Installation de la Base de Données Supabase pour MillesBTP

## Problème Actuel

Les erreurs 404 "Could not find the table 'public.chantiers' in the schema cache" indiquent que **les tables n'existent pas encore dans votre base de données Supabase**.

## Solution : Créer les Tables

### Étape 1 : Accéder à Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet : **lqcqmcnrkmozafvhjimm**

### Étape 2 : Ouvrir l'Éditeur SQL

1. Dans le menu de gauche, cliquez sur **SQL Editor** (icône de base de données)
2. Cliquez sur **New Query** pour créer une nouvelle requête

### Étape 3 : Exécuter le Script SQL

1. Ouvrez le fichier `supabase-schema.sql` qui vient d'être créé
2. **Copiez tout le contenu** du fichier
3. **Collez-le** dans l'éditeur SQL de Supabase
4. Cliquez sur **Run** (ou appuyez sur Ctrl+Enter)

### Étape 4 : Vérifier la Création

Vous devriez voir un message de confirmation :
```
Toutes les tables MillesBTP ont été créées avec succès !
Row Level Security (RLS) activé sur toutes les tables.
Vous pouvez maintenant utiliser l'application.
```

### Étape 5 : Vérifier les Tables

1. Dans le menu de gauche, cliquez sur **Table Editor**
2. Vous devriez voir toutes les tables créées :
   - ✅ users
   - ✅ chantiers
   - ✅ ecarts
   - ✅ decisions
   - ✅ avenants
   - ✅ evenements_terrain
   - ✅ alertes

## Tables Créées

### 1. **users** - Utilisateurs
- Stocke les comptes utilisateurs
- Champs : username, password, email, full_name, company_name

### 2. **chantiers** - Chantiers
- Stocke tous les chantiers
- Champs : nom, client, adresse, montant_total, marges, délais, statuts

### 3. **ecarts** - Écarts
- Stocke les écarts détectés sur les chantiers
- Champs : type, description, impacts (délai, coût, marge), photos

### 4. **decisions** - Décisions
- Stocke les décisions à prendre
- Champs : question, type, impact_estime, deadline, statut

### 5. **avenants** - Avenants
- Stocke les avenants créés
- Champs : numero, description, montant, statut

### 6. **evenements_terrain** - Journal Terrain
- Stocke les événements terrain
- Champs : type, titre, description, photos, impacts

### 7. **alertes** - Alertes
- Stocke les alertes générées
- Champs : type, titre, urgence, statut

## Sécurité : Row Level Security (RLS)

Le script active automatiquement **Row Level Security** sur toutes les tables :

✅ **Chaque utilisateur ne voit que ses propres données**
✅ **Impossible d'accéder aux données d'un autre utilisateur**
✅ **Politiques de sécurité automatiques**

### Comment ça marche ?

```sql
-- Exemple : Un utilisateur ne peut voir que ses propres chantiers
CREATE POLICY "Users can view own chantiers" ON chantiers
  FOR SELECT USING (auth.uid()::text = user_id);
```

## Fonctionnalités Automatiques

### 1. Mise à Jour Automatique de `updated_at`
Les champs `updated_at` sont automatiquement mis à jour lors de chaque modification.

### 2. Génération Automatique d'UUID
Tous les ID sont générés automatiquement avec `gen_random_uuid()`.

### 3. Index pour Performance
Des index sont créés automatiquement pour optimiser les requêtes :
- Index sur `user_id` pour les chantiers
- Index sur `chantier_id` pour les écarts, décisions, etc.
- Index sur `statut` pour les décisions

## Après l'Installation

### Test de l'Application

1. **Redémarrez l'application** si elle tourne déjà
2. **Rafraîchissez la page** dans le navigateur (F5)
3. **Connectez-vous** ou créez un compte
4. **Créez un chantier** pour tester

### Vérification dans la Console

Ouvrez la console du navigateur (F12) et vérifiez les logs :

```
[Chantiers] Début du chargement des chantiers...
[Chantiers] Chargement pour userId: xxx
[Chantiers] 0 chantier(s) chargé(s) avec succès
```

✅ **Plus d'erreur 404 !**

## Dépannage

### Erreur : "permission denied for table users"

**Cause** : Les politiques RLS bloquent l'accès

**Solution** : Vérifiez que vous êtes bien connecté avec Supabase Auth

### Erreur : "relation 'users' already exists"

**Cause** : Les tables existent déjà

**Solution** : Pas de problème ! Le script utilise `IF NOT EXISTS`

### Les Données ne s'Affichent Pas

**Vérifications** :
1. Ouvrez **Table Editor** dans Supabase
2. Sélectionnez la table `chantiers`
3. Vérifiez si des données existent
4. Vérifiez que le `user_id` correspond à votre utilisateur connecté

## Commandes Utiles (Optionnel)

### Vérifier les Tables Créées
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Compter les Chantiers
```sql
SELECT COUNT(*) FROM chantiers;
```

### Voir Tous les Chantiers (Admin)
```sql
SELECT id, nom, client, created_at FROM chantiers;
```

### Supprimer Toutes les Données (ATTENTION !)
```sql
-- ATTENTION : Ceci supprime TOUTES les données !
TRUNCATE users, chantiers, ecarts, decisions, avenants, evenements_terrain, alertes CASCADE;
```

## Architecture de Sécurité

```
┌─────────────────────────────────────────┐
│         Utilisateur A                   │
│  (auth.uid() = "abc-123")              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      Row Level Security (RLS)           │
│  Filtre automatique par user_id         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Base de Données                 │
│                                         │
│  Chantiers A (user_id = "abc-123") ✅  │
│  Chantiers B (user_id = "xyz-789") ❌  │
└─────────────────────────────────────────┘
```

## Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs** dans la console (F12)
2. **Consultez** `CORRECTION_PROBLEME_SAUVEGARDE.md`
3. **Vérifiez** que le script SQL s'est bien exécuté
4. **Testez** la connexion à Supabase

## Prochaines Étapes

Une fois les tables créées :

1. ✅ Créer un compte utilisateur
2. ✅ Créer votre premier chantier
3. ✅ Ajouter des écarts
4. ✅ Créer des décisions
5. ✅ Utiliser le journal terrain

**Votre application MillesBTP est maintenant prête à l'emploi !** 🎉

