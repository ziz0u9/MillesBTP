# ✅ Vérification Rapide - MillesBTP

## Problème Actuel

**Toutes les requêtes retournent 404** car les tables n'existent pas dans Supabase.

## Solution en 5 Minutes

### 1️⃣ Ouvrir Supabase
```
https://supabase.com
→ Projet: lqcqmcnrkmozafvhjimm
→ SQL Editor (menu gauche)
→ New Query
```

### 2️⃣ Copier-Coller le Script
```
1. Ouvrir: supabase-schema.sql
2. Tout sélectionner (Ctrl+A)
3. Copier (Ctrl+C)
4. Coller dans Supabase SQL Editor
5. Cliquer sur "Run" (ou Ctrl+Enter)
```

### 3️⃣ Vérifier
```
✅ Message: "Toutes les tables MillesBTP ont été créées avec succès !"
✅ Table Editor → Voir les 7 tables créées
```

### 4️⃣ Tester l'Application
```
1. Rafraîchir la page (F5)
2. Se connecter
3. Créer un chantier
4. ✅ Ça marche !
```

## Tables Créées

| Table | Description |
|-------|-------------|
| users | Utilisateurs |
| chantiers | Chantiers |
| ecarts | Écarts détectés |
| decisions | Décisions à prendre |
| avenants | Avenants créés |
| evenements_terrain | Journal terrain |
| alertes | Alertes générées |

## Sécurité

✅ **Row Level Security (RLS)** activé
✅ Chaque utilisateur voit **uniquement ses données**
✅ Impossible d'accéder aux données d'un autre utilisateur

## Après Installation

### Console (F12) - Avant
```
❌ GET 404 (Not Found)
❌ Could not find the table 'public.chantiers'
```

### Console (F12) - Après
```
✅ [Chantiers] Début du chargement des chantiers...
✅ [Chantiers] 0 chantier(s) chargé(s) avec succès
```

## Aide

📖 **Guide complet** : `INSTALLATION_SUPABASE.md`
🔧 **Problèmes de sauvegarde** : `CORRECTION_PROBLEME_SAUVEGARDE.md`

## Temps Estimé

⏱️ **5 minutes** pour créer toutes les tables

---

**Une fois les tables créées, tous les problèmes 404 seront résolus !** 🎉

