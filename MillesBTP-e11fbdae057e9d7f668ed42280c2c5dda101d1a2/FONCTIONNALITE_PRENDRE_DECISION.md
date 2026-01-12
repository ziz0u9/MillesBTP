# 📋 Fonctionnalité : Prendre une décision

## 🎯 Objectif

Permettre au conducteur de travaux de **formaliser sa décision** face aux écarts et risques détectés sur un chantier.

**Philosophie :**
- MillesBTP **détecte** les écarts
- MillesBTP **alerte** le conducteur
- Le conducteur **enregistre la décision**
- MillesBTP **trace le contexte**

---

## 🔍 Quand la fonctionnalité apparaît

### Conditions d'affichage

Le bouton **"Prendre une décision"** est visible uniquement si :

✅ Le chantier est **À surveiller** (🟠) ou **À risque** (🔴)  
✅ Au moins un écart ou un coût est détecté

❌ **Jamais** sur un chantier "Sous contrôle" (🟢)

### Emplacement dans l'UI

```
┌─────────────────────────────────────┐
│ 🏗️ Maison Famille p                │
│ 🔴 À risque | 🟠 Décision attendue  │
│                                     │
│ [➕ Ajouter un coût]                │
│ [🕐 Prendre une décision]  ← ICI   │
│ [➕ Ajouter un événement]           │
│ [👁️ Voir détails]                   │
└─────────────────────────────────────┘
```

---

## 📝 Modal "Prendre une décision"

### Structure du formulaire

#### 1. Type de décision (obligatoire - radio buttons)

```
○ Corriger
  Mettre en place des actions pour limiter la dérive

○ Régulariser
  Avenant, refacturation, négociation

○ Assumer
  Accepter l'impact et tracer la décision
```

#### 2. Motif / contexte (obligatoire - select)

Options disponibles :
- Erreur d'estimation
- Demande client
- Aléa chantier
- Problème fournisseur
- Organisation interne
- Autre

#### 3. Commentaire court (optionnel - max 200 caractères)

Exemple : "Attente retour client pour avenant"

#### 4. Impact estimé (optionnel)

- **Impact coût** : Montant en €
- **Impact délai** : Nombre de jours

#### 5. Date de décision

- Par défaut : Aujourd'hui
- Modifiable si nécessaire

### Boutons

- **Annuler** : Ferme le modal sans enregistrer
- **Enregistrer la décision** : Enregistre et ferme le modal

---

## 🔄 Comportement après enregistrement

### Ce qui se passe

1. ✅ **La décision est enregistrée** dans la base de données
2. 🔄 **Le badge change** :
   - Avant : `🟠 Décision attendue`
   - Après : `✅ Décision prise`
3. 📊 **Le statut reste identique** (À surveiller / À risque)
4. 📝 **La décision est visible** dans le détail du chantier
5. 🕐 **La décision est horodatée** et signée (utilisateur)

### Ce qui ne se passe PAS

❌ Aucune action automatique  
❌ Aucun recalcul forcé du statut  
❌ Aucune validation hiérarchique  
❌ Aucune fermeture automatique du problème

**Principe :** Une décision ne ferme pas le problème, elle le **cadre**.

---

## 📊 Affichage des décisions

### Dans le détail du statut

```
┌─────────────────────────────────────┐
│ 🔴 Chantier à risque                │
│ La rentabilité et/ou le délai       │
│ sont menacés                        │
└─────────────────────────────────────┘

Problème rencontré
• Dépassement financier confirmé
• Écart : -12.0 points (objectif : 22.0%)
• Écart identifié sans décision prise

À faire
• Corriger (organisation, coûts, planning)
• Régulariser (avenant, refacturation)
• Assumer l'impact et tracer la décision
• Documenter l'action choisie

Tant qu'aucune décision n'est prise, le risque reste actif.

────────────────────────────────────────

Décisions prises

┌─────────────────────────────────────┐
│ [Régulariser] 15 déc 2024           │
│ Motif : Demande client              │
│ "Attente retour client pour avenant"│
│ Impact coût : 25 000 €              │
└─────────────────────────────────────┘

Une décision a été enregistrée pour ce chantier.
Le suivi continue tant que la situation évolue.
```

---

## 🗄️ Structure de données

### Table `decisions_chantier`

```sql
CREATE TABLE decisions_chantier (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chantier_id UUID NOT NULL REFERENCES chantiers(id) ON DELETE CASCADE,
  type_decision TEXT NOT NULL CHECK (type_decision IN ('corriger', 'regulariser', 'assumer')),
  motif TEXT NOT NULL,
  commentaire TEXT,
  impact_cout NUMERIC(10, 2),
  impact_delai INTEGER,
  date_decision TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### Exemple de données

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "chantier_id": "456e7890-e89b-12d3-a456-426614174111",
  "type_decision": "regulariser",
  "motif": "Demande client",
  "commentaire": "Attente retour client pour avenant",
  "impact_cout": 25000.00,
  "impact_delai": 7,
  "date_decision": "2024-12-15T10:30:00Z",
  "created_by": "789e0123-e89b-12d3-a456-426614174222",
  "created_at": "2024-12-15T10:30:00Z"
}
```

---

## 🎨 Badges et indicateurs

### Badge "Décision attendue" (🟠)

**Conditions :**
- Chantier À surveiller ou À risque
- **Aucune** décision prise dans les 7 derniers jours

**Couleur :** Orange (`bg-orange-500/20`)

### Badge "Décision prise" (✅)

**Conditions :**
- Chantier À surveiller ou À risque
- **Au moins une** décision prise dans les 7 derniers jours

**Couleur :** Vert (`bg-green-500/20`)

---

## 🔗 Lien avec le statut chantier

### Règle simple

| Situation | Badge | Statut |
|-----------|-------|--------|
| Pas de décision + écart | 🟠 Décision attendue | Reste actif (🟠/🔴) |
| Décision prise | ✅ Décision prise | Reste actif (🟠/🔴) |
| Nouvel écart après décision | 🟠 Décision attendue | Reste actif (🟠/🔴) |

**Important :** Une décision ne change pas automatiquement le statut. Le statut est recalculé uniquement quand de nouveaux coûts sont ajoutés.

---

## 📋 Exemples de scénarios

### Scénario 1 : Corriger une dérive

```
Situation :
- Chantier : Maison Famille p
- Statut : 🟠 À surveiller
- Marge actuelle : 18% (objectif : 22%)
- Badge : 🟠 Décision attendue

Action du conducteur :
1. Clic sur "Prendre une décision"
2. Type : Corriger
3. Motif : Organisation interne
4. Commentaire : "Réorganisation équipe pour gagner en efficacité"
5. Impact délai : 0 jours
6. Enregistrer

Résultat :
- Badge : ✅ Décision prise
- Statut : 🟠 À surveiller (inchangé)
- Décision visible dans le détail
```

---

### Scénario 2 : Régulariser avec avenant

```
Situation :
- Chantier : Extension Bureau
- Statut : 🔴 À risque
- Marge actuelle : 8% (objectif : 22%)
- Badge : 🟠 Décision attendue

Action du conducteur :
1. Clic sur "Prendre une décision"
2. Type : Régulariser
3. Motif : Demande client
4. Commentaire : "Avenant en cours de négociation pour travaux supplémentaires"
5. Impact coût : +35 000 €
6. Impact délai : +10 jours
7. Enregistrer

Résultat :
- Badge : ✅ Décision prise
- Statut : 🔴 À risque (inchangé)
- Décision visible dans le détail
- Le conducteur peut ensuite créer l'avenant dans la section Écarts
```

---

### Scénario 3 : Assumer un aléa

```
Situation :
- Chantier : Rénovation Appartement
- Statut : 🟠 À surveiller
- Marge actuelle : 16% (objectif : 22%)
- Badge : 🟠 Décision attendue

Action du conducteur :
1. Clic sur "Prendre une décision"
2. Type : Assumer
3. Motif : Aléa chantier
4. Commentaire : "Découverte de travaux non prévus, non récupérables"
5. Impact coût : -8 000 €
6. Enregistrer

Résultat :
- Badge : ✅ Décision prise
- Statut : 🟠 À surveiller (inchangé)
- Décision visible dans le détail
- La marge finale sera impactée, mais la décision est tracée
```

---

## ✅ Ce que cette fonctionnalité apporte

### Pour le conducteur de travaux

✅ **Il ne subit plus** → Il choisit activement  
✅ **Il cadre la situation** → Décision formalisée  
✅ **Il garde une trace** → Mémoire du chantier  
✅ **Il reste autonome** → Pas de validation hiérarchique

### Pour la direction

✅ **Visibilité** → Comprend les décisions après coup  
✅ **Traçabilité** → Historique complet des décisions  
✅ **Confiance** → Le conducteur prend ses responsabilités  
✅ **Analyse** → Retour d'expérience facilité

### Pour l'entreprise

✅ **Mémoire** → Chaque chantier a son historique  
✅ **Apprentissage** → Capitalisation sur les décisions  
✅ **Protection** → Trace en cas de litige  
✅ **Culture** → Responsabilisation terrain

---

## ❌ Ce que cette fonctionnalité n'est PAS

❌ **Pas un workflow ERP** → Pas de circuit de validation  
❌ **Pas un moteur automatique** → Pas de règles automatiques  
❌ **Pas une validation hiérarchique** → Pas d'approbation requise  
❌ **Pas une obligation quotidienne** → Seulement si nécessaire

**Philosophie :** C'est une **trace intelligente**, pas une **contrainte administrative**.

---

## 🚀 Installation

### 1. Exécuter le script SQL

```sql
-- Dans Supabase SQL Editor
-- Copier-coller le contenu de MIGRATION_TABLE_DECISIONS.sql
```

### 2. Vérifier la création

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'decisions_chantier';
```

### 3. Tester la fonctionnalité

1. Aller sur un chantier **À surveiller** ou **À risque**
2. Cliquer sur **"Prendre une décision"**
3. Remplir le formulaire
4. Enregistrer
5. Vérifier le badge **"✅ Décision prise"**
6. Ouvrir le détail du statut
7. Voir la décision affichée

---

## 📊 Résumé visuel

```
┌─────────────────────────────────────────────────────┐
│                  FLUX COMPLET                       │
└─────────────────────────────────────────────────────┘

1. MillesBTP détecte un écart
   ↓
2. Statut passe à 🟠 À surveiller ou 🔴 À risque
   ↓
3. Badge affiché : 🟠 Décision attendue
   ↓
4. Conducteur clique sur "Prendre une décision"
   ↓
5. Formulaire : Type + Motif + Commentaire + Impact
   ↓
6. Enregistrement dans decisions_chantier
   ↓
7. Badge change : ✅ Décision prise
   ↓
8. Décision visible dans le détail du chantier
   ↓
9. Le suivi continue (statut reste actif)
   ↓
10. Nouvel écart → Nouvelle décision possible
```

---

## 🎯 Pourquoi c'est parfaitement cohérent

| Avant | Après |
|-------|-------|
| Le conducteur subit les alertes | Le conducteur choisit |
| Pas de trace des décisions | Historique complet |
| Direction dans le flou | Direction informée |
| Chantier sans mémoire | Chantier avec mémoire |
| MillesBTP = contrainte | MillesBTP = aide |

**Résultat :** MillesBTP reste **simple, terrain, crédible**.

