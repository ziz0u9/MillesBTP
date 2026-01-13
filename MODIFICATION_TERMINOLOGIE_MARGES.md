# Modification de la Terminologie des Marges

## Contexte

L'affichage "Marge actuelle" était trompeur car il s'affichait même quand aucun coût réel n'était renseigné. Une marge ne peut être "actuelle" que si elle est calculée avec des coûts réels engagés.

## Problème Identifié

- **Avant** : "Marge actuelle" s'affichait toujours, même sans coûts renseignés
- **Confusion** : L'utilisateur ne pouvait pas distinguer une marge calculée d'une marge hypothétique

## Solution Implémentée

### Logique Conditionnelle

La terminologie change maintenant en fonction de l'état du chantier :

#### 1. **Avec coûts renseignés** (coûts engagés > 0)
- **Label** : "Marge en cours"
- **Valeur** : Calcul réel basé sur `montantTotal - coutsEngages`
- **Couleur** : Vert si positif, rouge si négatif
- **Signification** : C'est une vraie marge calculée avec les coûts réels

#### 2. **Sans coûts renseignés** (coûts engagés = 0)
- **Label** : "Marge prévue"
- **Valeur** : Affiche la marge de référence
- **Couleur** : Gris (neutre)
- **Signification** : C'est une hypothèse, pas une mesure réelle

## Modifications Apportées

### 1. Page Chantiers (`client/src/pages/modules/Chantiers.tsx`)

**Avant :**
```tsx
<p className="text-xs text-gray-400 mb-1">Marge actuelle</p>
{chantier.coutsEngages && chantier.coutsEngages > 0 ? (
  <p>{formatCurrency(chantier.montantTotal - chantier.coutsEngages)}</p>
) : (
  <p>Non calculable (aucun coût saisi)</p>
)}
```

**Après :**
```tsx
<p className="text-xs text-gray-400 mb-1">
  {chantier.coutsEngages && chantier.coutsEngages > 0 ? "Marge en cours" : "Marge prévue"}
</p>
{chantier.coutsEngages && chantier.coutsEngages > 0 ? (
  <p className="text-green-400">{formatCurrency(chantier.montantTotal - chantier.coutsEngages)}</p>
) : (
  <p className="text-gray-400">{formatCurrency(chantier.margeReference)}</p>
)}
```

### 2. Page Détail Chantier (`client/src/pages/modules/ChantierDetail.tsx`)

Même logique appliquée avec affichage de la marge de référence quand pas de coûts.

### 3. Dashboard (`client/src/pages/dashboard/Dashboard.tsx`)

**Avant :** "Marge actuelle"  
**Après :** "Marge globale en cours"

### 4. Rapports (`client/src/pages/modules/Rapports.tsx`)

- **Carte** : "Marge actuelle" → "Marge globale en cours"
- **Graphique** : "Marge actuelle" → "Marge en cours"
- **Tableau** : Colonne "Marge actuelle" → "Marge en cours"

## Bénéfices

✅ **Clarté** : L'utilisateur sait immédiatement si c'est une marge calculée ou prévue  
✅ **Transparence** : Distinction claire entre hypothèse et réalité  
✅ **Meilleure prise de décision** : Pas de confusion sur la fiabilité des données  
✅ **Cohérence** : Terminologie uniforme dans toute l'application  

## Exemples Visuels

### Chantier avec coûts renseignés
```
┌─────────────────────────────────┐
│ Marge de référence: 50 000 €    │
│ Marge en cours: 45 000 € ✓      │ ← Calcul réel
│   Écart: -5 000 €               │
└─────────────────────────────────┘
```

### Chantier sans coûts renseignés
```
┌─────────────────────────────────┐
│ Marge de référence: 50 000 €    │
│ Marge prévue: 50 000 €          │ ← Hypothèse
└─────────────────────────────────┘
```

## Fichiers Modifiés

1. `client/src/pages/modules/Chantiers.tsx` - Liste des chantiers
2. `client/src/pages/modules/ChantierDetail.tsx` - Détail d'un chantier
3. `client/src/pages/dashboard/Dashboard.tsx` - Tableau de bord
4. `client/src/pages/modules/Rapports.tsx` - Page des rapports

## Test

Pour vérifier les modifications :

1. **Chantier sans coûts** : Créer un nouveau chantier → devrait afficher "Marge prévue"
2. **Chantier avec coûts** : Ajouter des coûts à un chantier → devrait afficher "Marge en cours"
3. **Dashboard** : Vérifier que "Marge globale en cours" s'affiche
4. **Rapports** : Vérifier le graphique et le tableau

## Date de Modification

2 janvier 2026

