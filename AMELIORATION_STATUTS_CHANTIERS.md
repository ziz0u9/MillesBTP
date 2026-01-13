# Amélioration des Statuts de Chantiers

## Problème Identifié

L'affichage des statuts de chantiers était **trompeur** :
- Affichait "Marge meilleure que prévue : 85%" avec seulement 180 000€ de coûts engagés
- Présentait une projection mathématique comme une réalité terrain
- Ne distinguait pas les chantiers avec données insuffisantes

## Solution Implémentée

### Nouveau Système de Statuts

#### ⚪ **Non Mesuré** (NOUVEAU)
**Quand ?** Pas encore assez de données (< 20% des coûts engagés)

**Affichage :**
```
⚪ Chantier non mesuré
Pas encore assez de données pour évaluer la situation.

Ce qui est OK :
✓ Objectif de marge défini : 22.0% (264 000 €)

À retenir :
Coûts engagés : 180 000 € (15% du montant total). 
La marge sera fiable lorsque davantage de coûts seront engagés.
```

**Critères :**
- Aucun ou trop peu de coûts saisis (< 20%)
- Chantier trop récent

**Traduction terrain :**
> "Objectif posé, mais pas encore assez d'infos pour juger."

---

#### 🟢 **Sous Contrôle**
**Quand ?** Tout va normalement, rien d'urgent

**Affichage :**
```
🟢 Chantier sous contrôle
Situation stable à ce stade du chantier.

Ce qui est OK :
✓ Objectif de marge défini : 22.0% (264 000 €)
✓ Aucun écart significatif constaté à ce jour
✓ Coûts engagés : 500 000 € (42%)

À retenir :
La marge en cours sera plus fiable lorsque davantage de coûts seront engagés.
```

**Critères :**
- Coûts engagés cohérents avec l'avancement (≥ 20%)
- Marge en cours proche de la marge de référence (écart < 10%)
- Aucun écart significatif non expliqué
- Aucun événement terrain bloquant
- Aucune décision en attente

**Traduction terrain :**
> "Le chantier avance comme prévu. Je continue."

---

#### 🟠 **À Surveiller**
**Quand ?** Signaux faibles, attention mais pas d'urgence

**Affichage :**
```
🟠 À surveiller
Signaux faibles détectés, attention mais pas d'urgence.

Ce qui nécessite attention :
⚠ Marge en cours : 18.5% (222 000 €)
⚠ Objectif : 22.0% (264 000 €)
⚠ Écart : -15.9%

Coûts engagés :
700 000 € (58% du montant total)

Action recommandée :
Surveiller l'évolution des coûts. Analyser les écarts avant qu'ils ne s'aggravent.
```

**Critères :**
- Écarts en train d'apparaître mais encore limités
- Coûts qui accélèrent plus vite que prévu
- Événement terrain non encore analysé
- Décision en attente depuis quelques jours
- Marge en cours commence à s'éloigner (écart entre -10% et -25%)

**Traduction terrain :**
> "Ça peut déraper si je ne regarde pas."

---

#### 🔴 **À Risque**
**Quand ?** Problème clair, décision obligatoire

**Affichage :**
```
🔴 À risque
Problème clair détecté, décision obligatoire.

Situation critique :
🔴 Marge en cours : 15.0% (180 000 €)
🔴 Objectif : 22.0% (264 000 €)
🔴 Écart : -31.8%

Coûts engagés :
1 020 000 € (85% du montant total)

Action urgente :
Décision requise maintenant. Sans action, risque de perte financière avérée.
```

**Critères :**
- Écart financier avéré et significatif (écart > -25%)
- Coûts engagés sans couverture (avenant / devis)
- Décision non prise malgré alerte
- Retard impactant coût ou rentabilité
- Marge en cours nettement inférieure à la référence

**Traduction terrain :**
> "Si je ne décide pas, je perds de l'argent."

---

## Logique de Calcul

### Seuil de Données Suffisantes
```typescript
const assezDeDonnees = coutsEngages > 0 && pourcentageCoutsEngages >= 20;
```

**Pourquoi 20% ?**
- En dessous, la marge calculée n'est pas représentative
- Les premiers coûts sont souvent des acomptes/mobilisation
- La vraie tendance apparaît après 20-30% d'avancement

### Calcul de l'Écart
```typescript
const ecartPercent = ((margeEnCoursPercent - margeReferencePercent) / margeReferencePercent) * 100;
```

**Seuils :**
- Écart < -25% → 🔴 À risque
- Écart entre -25% et -10% → 🟠 À surveiller
- Écart entre -10% et +10% → 🟢 Sous contrôle
- Données insuffisantes → ⚪ Non mesuré

## Changements Visuels

### Couleurs
- ⚪ Non mesuré : Gris (`text-gray-400`)
- 🟢 Sous contrôle : Vert (`text-green-400`)
- 🟠 À surveiller : Orange (`text-orange-400`)
- 🔴 À risque : Rouge (`text-red-400`)

### Labels
- **Avant** : "À surveiller – chantier non mesuré"
- **Après** : "Non mesuré"

## Bénéfices

✅ **Transparence** : L'utilisateur sait si les données sont fiables ou non  
✅ **Pas de faux positifs** : Plus de "Marge meilleure que prévue" avec données insuffisantes  
✅ **Clarté** : Messages adaptés à chaque situation  
✅ **Actionnable** : Recommandations claires selon le statut  
✅ **Professionnel** : Vocabulaire métier précis  

## Exemples Réels

### Exemple 1 : Chantier Démarré (15% coûts)
```
⚪ Non mesuré
→ Normal, pas encore assez de données
→ Pas d'alerte inutile
```

### Exemple 2 : Chantier Mi-parcours (50% coûts, marge OK)
```
🟢 Sous contrôle
→ Marge en cours calculée et affichée
→ Situation stable
```

### Exemple 3 : Chantier Avancé (70% coûts, dérive -18%)
```
🟠 À surveiller
→ Écart significatif détecté
→ Action recommandée avant aggravation
```

### Exemple 4 : Chantier Critique (85% coûts, dérive -32%)
```
🔴 À risque
→ Situation critique
→ Décision urgente requise
```

## Fichiers Modifiés

- `client/src/pages/modules/Chantiers.tsx`
  - Fonction `calculerRaisonsStatut()` complètement réécrite
  - Labels et couleurs mis à jour
  - Logique de seuil à 20% ajoutée

## Test

Pour tester les différents statuts :

1. **Non mesuré** : Créer un chantier sans coûts ou avec < 20%
2. **Sous contrôle** : Chantier avec 30-50% coûts, marge proche objectif
3. **À surveiller** : Chantier avec écart de -15%
4. **À risque** : Chantier avec écart de -30%

## Date de Modification

2 janvier 2026


