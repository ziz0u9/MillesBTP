# 🚦 Système de statuts automatiques basé sur les coûts

## 🎯 Principe de base

**Un coût = un signal**  
Plus les signaux s'accumulent ou sont graves → le statut monte automatiquement

---

## 🧱 Les 4 statuts possibles

### 1️⃣ ⚪ Non mesuré

**Condition :**
- Coûts engagés = 0 €

**Logique :**
- On ne sait rien encore → impossible de juger
- Aucune donnée terrain saisie

**Sortie :**
- Dès qu'un premier coût est ajouté, le statut change automatiquement

---

### 2️⃣ 🟢 Sous contrôle

**Conditions (toutes vraies) :**
- ✅ Coûts engagés > 0 €
- ✅ Marge actuelle ≥ marge de référence (ou écart ≤ 1 point)
- ✅ Aucun écart significatif

**Exemple :**
```
Marge référence : 22%
Marge actuelle  : 25%
Écart           : +3 points
→ 🟢 SOUS CONTRÔLE
```

**Message :**
- "Situation stable à ce stade du chantier"
- Tout va normalement, rien d'urgent

---

### 3️⃣ 🟠 À surveiller

**Conditions (au moins une vraie) :**
- ⚠️ Marge actuelle ↓ mais reste proche de la référence
  - Écart : **-1 à -8 points**
  - Exemple : 22% → 18% = -4 points
- ⚠️ Marge proche du seuil critique (entre 10% et 15%)
- ⚠️ Coûts qui arrivent plus vite que prévu
- ⚠️ Plusieurs petits coûts qui s'accumulent

**Exemple :**
```
Marge référence : 22%
Marge actuelle  : 18%
Écart           : -4 points
→ 🟠 À SURVEILLER
```

**Message :**
- "Signaux faibles, attention mais pas d'urgence"
- Rattrapable, mais il faut surveiller

---

### 4️⃣ 🔴 À risque

**Conditions (une seule suffit) :**
- 🚨 Marge actuelle < seuil critique
  - Seuil = `max(10%, marge_ref - 8 points)`
  - Exemple : Si marge ref = 22%, seuil = 14%
- 🚨 Écart > **8 points** en dessous de la référence
  - Exemple : 22% → 12% = -10 points
- 🚨 Marge actuelle < 10% (seuil absolu)

**Exemple :**
```
Marge référence : 22%
Marge actuelle  : 10%
Écart           : -12 points
→ 🔴 À RISQUE
```

**Message :**
- "Problème clair, décision obligatoire"
- Si je ne décide pas, je perds de l'argent

---

## 🔁 Comment un coût change le statut (concret)

### Processus automatique

Quand un coût est enregistré :

1. **➕ Ajout au total coûts engagés**
   ```
   Anciens coûts : 180 000 €
   Nouveau coût  : +50 000 €
   Total         : 230 000 €
   ```

2. **🔄 Recalcul marge actuelle**
   ```
   Montant total : 1 000 000 €
   Coûts engagés : 230 000 €
   Marge actuelle: 770 000 € (77%)
   ```

3. **🔍 Analyse automatique**
   - Type de coût : Main-d'œuvre
   - Cause : Aléa chantier
   - Montant : 50 000 € (5% du total)

4. **🚦 Mise à jour du statut**
   ```
   Marge référence : 22%
   Marge actuelle  : 77%
   Écart           : +55 points
   → Statut : 🟢 SOUS CONTRÔLE
   ```

5. **📢 Notification à l'utilisateur**
   - Si le statut change : "📊 Statut mis à jour : ⚪ Non mesuré → 🟢 Sous contrôle"
   - Toast de confirmation : "✓ Coût ajouté : 50 000 € enregistré avec succès"

---

## 📊 Exemples de scénarios réels

### Scénario 1 : Démarrage de chantier

```
État initial:
- Coûts engagés : 0 €
- Statut        : ⚪ Non mesuré

Action: Ajout de 50 000 € (Main-d'œuvre)

Résultat:
- Coûts engagés : 50 000 €
- Marge actuelle: 95%
- Statut        : 🟢 Sous contrôle

Notification:
📊 Statut mis à jour : ⚪ Non mesuré → 🟢 Sous contrôle
✓ Coût ajouté : 50 000 € enregistré avec succès
```

---

### Scénario 2 : Accumulation de coûts

```
État initial:
- Coûts engagés : 500 000 €
- Marge actuelle: 50%
- Statut        : 🟢 Sous contrôle

Action: Ajout de 200 000 € (Matériaux)

Résultat:
- Coûts engagés : 700 000 €
- Marge actuelle: 30%
- Marge référence: 22%
- Écart         : +8 points
- Statut        : 🟢 Sous contrôle (toujours OK)

Notification:
✓ Coût ajouté : 200 000 € enregistré avec succès
```

---

### Scénario 3 : Dégradation modérée

```
État initial:
- Coûts engagés : 700 000 €
- Marge actuelle: 30%
- Statut        : 🟢 Sous contrôle

Action: Ajout de 120 000 € (Sous-traitance)

Résultat:
- Coûts engagés : 820 000 €
- Marge actuelle: 18%
- Marge référence: 22%
- Écart         : -4 points
- Statut        : 🟠 À surveiller

Notification:
📊 Statut mis à jour : 🟢 Sous contrôle → 🟠 À surveiller
✓ Coût ajouté : 120 000 € enregistré avec succès
```

---

### Scénario 4 : Situation critique

```
État initial:
- Coûts engagés : 820 000 €
- Marge actuelle: 18%
- Statut        : 🟠 À surveiller

Action: Ajout de 100 000 € (Demande client)

Résultat:
- Coûts engagés : 920 000 €
- Marge actuelle: 8%
- Marge référence: 22%
- Écart         : -14 points
- Statut        : 🔴 À risque

Notifications:
📊 Statut mis à jour : 🟠 À surveiller → 🔴 À risque
💡 Ce coût provient d'une demande client. Souhaitez-vous créer un avenant ?
⚠ Coût important détecté : Ce coût représente 10% du montant total
✓ Coût ajouté : 100 000 € enregistré avec succès
```

---

## 🧠 Logique de calcul détaillée

### Formules utilisées

```typescript
// 1. Marge actuelle en euros
margeActuelle = montantTotal - coutsEngages

// 2. Marge actuelle en pourcentage
margeActuellePercent = (margeActuelle / montantTotal) * 100

// 3. Marge de référence en pourcentage
margeReferencePercent = (margeReference / montantTotal) * 100

// 4. Écart en points de pourcentage
ecartPoints = margeActuellePercent - margeReferencePercent

// 5. Seuil critique
seuilCritique = max(10, margeReferencePercent - 8)
```

### Arbre de décision

```
Coûts engagés = 0 ?
├─ OUI → ⚪ Non mesuré
└─ NON → Calculer écart
    │
    ├─ Marge < seuil critique OU écart < -8 points ?
    │  └─ OUI → 🔴 À risque
    │
    ├─ Écart entre -8 et -1 points ?
    │  └─ OUI → 🟠 À surveiller
    │
    └─ Sinon → 🟢 Sous contrôle
```

---

## 🎨 Interface utilisateur

### Notifications visuelles

**Changement de statut :**
```
┌─────────────────────────────────────┐
│ 📊 Statut mis à jour                │
│                                     │
│ 🟢 Sous contrôle → 🟠 À surveiller │
└─────────────────────────────────────┘
```

**Coût ajouté :**
```
┌─────────────────────────────────────┐
│ ✓ Coût ajouté                       │
│                                     │
│ 50 000 € enregistré avec succès    │
└─────────────────────────────────────┘
```

**Alerte coût important :**
```
┌─────────────────────────────────────┐
│ ⚠ Coût important détecté            │
│                                     │
│ Ce coût représente 15.2% du montant│
│ total. Le chantier pourrait         │
│ nécessiter une surveillance.        │
└─────────────────────────────────────┘
```

---

## ✅ Avantages du système

### Pour le conducteur de travaux
- ✅ **Automatique** : Pas de calcul mental
- ✅ **Temps réel** : Statut mis à jour immédiatement
- ✅ **Visuel** : Couleurs claires (🟢🟠🔴)
- ✅ **Préventif** : Alerte avant que ce soit trop grave

### Pour l'entreprise
- ✅ **Traçabilité** : Chaque changement est enregistré
- ✅ **Réactivité** : Détection rapide des dérives
- ✅ **Objectivité** : Critères clairs et mesurables
- ✅ **Rentabilité** : Protection de la marge

---

## 🔧 Configuration

### Seuils modifiables

Dans `Chantiers.tsx`, fonction `calculerStatutReel` :

```typescript
// Seuil critique (ligne ~658)
const seuilCritique = Math.max(10, margeReferencePercent - 8);
//                                 ^^                      ^
//                                 |                       |
//                         Seuil absolu            Écart max acceptable

// À surveiller (ligne ~668)
if (ecartPoints >= -8 && ecartPoints < -1) {
//                  ^^                  ^^
//                  |                   |
//          Limite haute          Limite basse
```

**Recommandations :**
- **Seuil absolu** : 10% (minimum de rentabilité)
- **Écart max À risque** : -8 points (dégradation importante)
- **Écart max À surveiller** : -1 à -8 points (dégradation modérée)

---

## 📝 Résumé ultra simple

| Situation | Statut | Couleur |
|-----------|--------|---------|
| Pas de coûts | Non mesuré | ⚪ |
| Coûts OK + marge OK | Sous contrôle | 🟢 |
| Coûts qui dégradent un peu | À surveiller | 🟠 |
| Coûts qui menacent la marge | À risque | 🔴 |

**Philosophie :** Aider le conducteur à prendre les bonnes décisions au bon moment.


