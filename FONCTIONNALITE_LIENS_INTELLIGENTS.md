# 🔗 Liens Intelligents : Coûts → Décisions

## 📋 Vue d'ensemble

Système automatique qui suggère des actions après l'enregistrement d'un coût terrain, sans être intrusif.

---

## ✨ Fonctionnalités

### 1️⃣ Suggestion d'avenant automatique

**Quand ?**
- Dès qu'un coût est enregistré avec la cause "Demande client"

**Comment ?**
- Popup discrète après la sauvegarde :
  ```
  💡 Ce coût provient d'une demande client.
  
  Souhaitez-vous créer un avenant ?
  ```

**Actions possibles :**
- ✅ **Oui** → Redirection vers la page des écarts/avenants avec :
  - Chantier pré-sélectionné
  - Montant pré-rempli
  - Prêt à finaliser l'avenant
  
- ❌ **Non** → Simple fermeture, rien d'autre

**Avantage :**
- Le conducteur ne perd pas de temps
- Il n'oublie pas de créer l'avenant
- Tout est pré-rempli

---

### 2️⃣ Alerte sur coût important

**Quand ?**
- Si le coût représente **> 10% du montant total** du chantier

**Comment ?**
- Toast discret en bas à droite :
  ```
  ⚠ Coût important détecté
  Ce coût représente 15.2% du montant total. 
  Le chantier pourrait nécessiter une surveillance.
  ```

**Résultat :**
- Le conducteur est alerté
- Il peut décider de :
  - Surveiller de plus près
  - Créer une décision
  - Analyser l'impact

**Pas d'action forcée**, juste une information.

---

## 🎯 Logique métier

### Calcul du seuil (10%)

```typescript
const montantTotal = parseFloat(chantier.montant_total);
const pourcentageCout = (montant / montantTotal) * 100;

if (pourcentageCout > 10) {
  // Alerte
}
```

**Exemple concret :**
- Chantier de 1 000 000 €
- Coût ajouté : 150 000 €
- Pourcentage : 15%
- → **Alerte déclenchée**

---

## 🧩 Intégration avec le système

### Lien avec les statuts

Après l'ajout d'un coût important :
1. Les coûts engagés augmentent
2. La marge en cours est recalculée
3. Le statut peut passer automatiquement de :
   - 🟢 **Sous contrôle** → 🟠 **À surveiller**
   - 🟠 **À surveiller** → 🔴 **À risque**

**Tout est automatique**, pas d'action manuelle.

---

### Lien avec les avenants

Si le conducteur accepte de créer un avenant :
1. Redirection vers `/dashboard/ecarts?chantier=XXX&montant=YYY`
2. Formulaire pré-rempli avec :
   - Chantier sélectionné
   - Montant du coût
   - Type : "Avenant"
3. Il n'a plus qu'à :
   - Ajouter une description
   - Valider

**Gain de temps : 80%**

---

## 🎨 Design

### Principes
- ✅ **Discret** : Pas de popup envahissante
- ✅ **Rapide** : 1 clic pour accepter ou refuser
- ✅ **Contextuel** : Uniquement quand c'est pertinent
- ✅ **Non bloquant** : On peut ignorer

### Exemples visuels

**Suggestion d'avenant :**
```
┌─────────────────────────────────────────┐
│ 💡 Ce coût provient d'une demande      │
│    client.                              │
│                                         │
│    Souhaitez-vous créer un avenant ?   │
│                                         │
│    [Annuler]              [Créer]      │
└─────────────────────────────────────────┘
```

**Alerte coût important :**
```
┌─────────────────────────────────────────┐
│ ⚠ Coût important détecté                │
│                                         │
│ Ce coût représente 15.2% du montant    │
│ total. Le chantier pourrait nécessiter │
│ une surveillance.                       │
└─────────────────────────────────────────┘
```

---

## 📊 Cas d'usage

### Cas 1 : Demande client
```
1. Conducteur ajoute un coût de 50 000 €
2. Cause : "Demande client"
3. → Popup : "Créer un avenant ?"
4. Il accepte
5. → Redirection avec tout pré-rempli
6. Il valide en 10 secondes
```

### Cas 2 : Coût important
```
1. Conducteur ajoute un coût de 200 000 €
2. Chantier de 1 000 000 €
3. → Alerte : "20% du montant total"
4. Il voit l'alerte
5. Il décide de surveiller
6. Le statut passe automatiquement à "À surveiller"
```

### Cas 3 : Coût normal
```
1. Conducteur ajoute un coût de 5 000 €
2. Cause : "Ajustement normal"
3. Montant < 10%
4. → Aucune alerte
5. Simple toast : "✓ Coût ajouté"
```

---

## 🔧 Configuration

### Seuil d'alerte modifiable

Dans `Chantiers.tsx`, ligne ~1550 :

```typescript
if (pourcentageCout > 10) {  // ← Modifier ici
  toast({
    title: "⚠ Coût important détecté",
    // ...
  });
}
```

**Recommandations :**
- **5%** : Très strict (beaucoup d'alertes)
- **10%** : Équilibré (recommandé)
- **15%** : Souple (peu d'alertes)

---

## ✅ Avantages

### Pour le conducteur de travaux
- ✅ Ne rate jamais un avenant
- ✅ Alerté sur les coûts importants
- ✅ Gain de temps (pré-remplissage)
- ✅ Pas de calcul mental

### Pour l'entreprise
- ✅ Meilleure traçabilité
- ✅ Moins d'oublis
- ✅ Décisions plus rapides
- ✅ Rentabilité protégée

---

## 🚀 Prochaines évolutions possibles

### Idées futures
1. **Suggestion de décision** si coût > 20%
2. **Alerte si cumul de coûts** dépasse un seuil
3. **Suggestion de contact client** si trop d'aléas
4. **Analyse prédictive** : "Ce chantier risque de déraper"

---

## 📝 Résumé

| Déclencheur | Action | Résultat |
|------------|--------|----------|
| Cause = "Demande client" | Suggérer avenant | Redirection pré-remplie |
| Montant > 10% | Alerte discrète | Information, pas d'action forcée |
| Coût normal | Rien | Simple confirmation |

**Philosophie :** Aider sans déranger.


