# 📋 Simplification des détails de statuts

## 🎯 Objectif

**Règle d'or : 1 statut = 3 infos max**

Le conducteur doit **comprendre d'un coup d'œil**, pas lire un roman.

---

## ❌ Avant (trop de blocs, trop de texte)

```
Détails du statut : Maison Famille p

┌─────────────────────────────────────┐
│ 🟡 Chantier non mesuré              │
│ Aucun coût engagé pour le moment.   │
└─────────────────────────────────────┘

Ce qui pose question
• Pas encore assez de données pour évaluer la situation.
• Objectif de marge défini : 35.0% (13 300 €)
• Coûts engagés : 0 € (0% du montant total). La marge sera fiable lorsque davantage de coûts seront engagés.

Actions recommandées
• Commencer à saisir les coûts engagés (main d'œuvre, matériaux, etc.)
• Documenter la situation terrain et les premiers événements
• Suivre l'avancement pour activer le suivi du statut

Dès que les premiers coûts seront saisis, le statut deviendra calculable.
```

**Problèmes :**
- ❌ Trop de blocs (3-4)
- ❌ Trop de phrases longues
- ❌ Détails en % inutiles à ce stade
- ❌ Rappels pédagogiques redondants
- ❌ Le message clé se perd

---

## ✅ Après (clair et rapide)

```
Détails du statut : Maison Famille p

┌─────────────────────────────────────┐
│ 🟤 Chantier non mesuré              │
│ Aucun coût saisi pour le moment     │
└─────────────────────────────────────┘

Pourquoi ce statut ?
• Aucun coût engagé enregistré
• La marge actuelle ne peut pas encore être calculée

À faire pour activer le suivi
• Saisir les premiers coûts (MO, matériaux, sous-traitance)
• Ajouter un premier événement terrain si nécessaire

Dès qu'un premier coût est saisi, le statut devient calculable.
```

**Améliorations :**
- ✅ **3 blocs maximum**
- ✅ **Phrases courtes et directes**
- ✅ **Message clé visible immédiatement**
- ✅ **Pas de détails inutiles**

---

## 📊 Structure pour chaque statut

### 🟤 Non mesuré

```
┌─────────────────────────────────────┐
│ 🟤 Chantier non mesuré              │
│ Aucun coût saisi pour le moment     │
└─────────────────────────────────────┘

Pourquoi ce statut ?
• Aucun coût engagé enregistré
• La marge actuelle ne peut pas encore être calculée

À faire pour activer le suivi
• Saisir les premiers coûts (MO, matériaux, sous-traitance)
• Ajouter un premier événement terrain si nécessaire

Dès qu'un premier coût est saisi, le statut devient calculable.
```

---

### 🟢 Sous contrôle

```
┌─────────────────────────────────────┐
│ 🟢 Chantier sous contrôle           │
│ Situation stable à ce stade         │
└─────────────────────────────────────┘

Pourquoi ce statut ?
• Marge en cours : 25.3%
• Marge objectif : 22.0%
• Écart : +3.3 points

À faire
• Continuer à saisir les coûts régulièrement
• Documenter les événements terrain importants

Le chantier avance comme prévu. Continuez.
```

---

### 🟠 À surveiller

```
┌─────────────────────────────────────┐
│ 🟠 Chantier à surveiller            │
│ Des écarts commencent à apparaître  │
└─────────────────────────────────────┘

Problème rencontré
• Des coûts ou événements récents s'écartent du prévu
• La marge commence à dériver (-4.0 points)
• Marge actuelle : 18.0% (objectif : 22.0%)

À faire
• Vérifier l'origine des derniers coûts ou événements
• Documenter la situation terrain si ce n'est pas fait
• Décider si l'écart doit être corrigé, régularisé ou assumé

Sans suivi ou décision, ce chantier peut basculer en risque.
```

---

### 🔴 À risque

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
```

---

## 🧠 Principes de simplification

### 1. **Structure fixe : 3 blocs**

1. **En-tête coloré** : Emoji + Titre + Sous-titre
2. **Bloc explicatif** : "Pourquoi ce statut ?" ou "Problème rencontré"
3. **Bloc action** : "À faire" ou "À faire pour activer le suivi"
4. **Phrase de fin** (1 seule ligne)

### 2. **Suppression des éléments inutiles**

❌ **Supprimé :**
- "Ce qui pose question" (trop vague)
- Détails en % inutiles à ce stade
- Rappels pédagogiques ("La marge sera fiable lorsque...")
- Textes redondants
- Listes trop longues (> 4 items)

✅ **Conservé :**
- Informations critiques (écart, marge)
- Actions concrètes et directes
- Message de fin clair

### 3. **Langage direct**

**Avant :**
> "Pas encore assez de données pour évaluer la situation. Coûts engagés : 0 € (0% du montant total). La marge sera fiable lorsque davantage de coûts seront engagés."

**Après :**
> "Aucun coût engagé enregistré. La marge actuelle ne peut pas encore être calculée."

### 4. **Hiérarchie visuelle**

- **Emoji** : Identification rapide du statut
- **Titre en gras** : Nom du statut
- **Sous-titre** : Résumé en 1 ligne
- **Blocs espacés** : Lisibilité

---

## 🎨 Code implémenté

### Fonction `calculerRaisonsStatut` (simplifiée)

```typescript
const calculerRaisonsStatut = (chantier: Chantier) => {
  const raisons: { titre: string; raison: string }[] = [];
  
  // ... calculs ...
  
  const statut = calculerStatutReel(chantier);

  // 🟤 NON MESURÉ
  if (statut === "non_mesure") {
    raisons.push({ 
      titre: "Pourquoi ce statut ?", 
      raison: "• Aucun coût engagé enregistré\n• La marge actuelle ne peut pas encore être calculée"
    });
    raisons.push({ 
      titre: "À faire pour activer le suivi", 
      raison: "• Saisir les premiers coûts (MO, matériaux, sous-traitance)\n• Ajouter un premier événement terrain si nécessaire"
    });
    raisons.push({ 
      titre: "", 
      raison: "Dès qu'un premier coût est saisi, le statut devient calculable."
    });
    return raisons;
  }

  // 🟢 SOUS CONTRÔLE
  if (statut === "sous_controle") {
    raisons.push({ 
      titre: "Pourquoi ce statut ?", 
      raison: `• Marge en cours : ${margeEnCoursPercent.toFixed(1)}%\n• Marge objectif : ${margeReferencePercent.toFixed(1)}%\n• Écart : ${ecartPoints > 0 ? '+' : ''}${ecartPoints.toFixed(1)} points`
    });
    raisons.push({ 
      titre: "À faire", 
      raison: "• Continuer à saisir les coûts régulièrement\n• Documenter les événements terrain importants"
    });
    raisons.push({ 
      titre: "", 
      raison: "Le chantier avance comme prévu. Continuez."
    });
  }
  
  // 🟠 À SURVEILLER
  else if (statut === "a_surveiller") {
    raisons.push({ 
      titre: "Problème rencontré", 
      raison: `• Des coûts ou événements récents s'écartent du prévu\n• La marge commence à dériver (${ecartPoints.toFixed(1)} points)\n• Marge actuelle : ${margeEnCoursPercent.toFixed(1)}% (objectif : ${margeReferencePercent.toFixed(1)}%)`
    });
    raisons.push({ 
      titre: "À faire", 
      raison: "• Vérifier l'origine des derniers coûts ou événements\n• Documenter la situation terrain si ce n'est pas fait\n• Décider si l'écart doit être corrigé, régularisé ou assumé"
    });
    raisons.push({ 
      titre: "", 
      raison: "Sans suivi ou décision, ce chantier peut basculer en risque."
    });
  }
  
  // 🔴 À RISQUE
  else if (statut === "a_risque") {
    let probleme = "";
    if (margeEnCoursPercent < 10) {
      probleme = "• Marge critique : " + margeEnCoursPercent.toFixed(1) + "% (< 10%)";
    } else {
      probleme = "• Dépassement financier confirmé\n• Écart : " + ecartPoints.toFixed(1) + " points (objectif : " + margeReferencePercent.toFixed(1) + "%)";
    }

    raisons.push({ 
      titre: "Problème rencontré", 
      raison: probleme + "\n• Écart identifié sans décision prise"
    });
    raisons.push({ 
      titre: "À faire", 
      raison: "• Corriger (organisation, coûts, planning)\n• Régulariser (avenant, refacturation)\n• Assumer l'impact et tracer la décision\n• Documenter l'action choisie"
    });
    raisons.push({ 
      titre: "", 
      raison: "Tant qu'aucune décision n'est prise, le risque reste actif."
    });
  }

  return raisons;
};
```

### Affichage simplifié

```typescript
return (
  <>
    {/* En-tête avec emoji et titre */}
    <div className={`p-4 rounded-lg border ${/* couleurs */}`}>
      <h3 className={`font-semibold text-lg flex items-center gap-2 ${/* couleurs */}`}>
        <span className="text-2xl">{emoji}</span>
        {titre}
      </h3>
      <p className="text-sm text-gray-300 mt-1">
        {sousTitre}
      </p>
    </div>

    {/* Affichage des raisons (max 3 blocs) */}
    {raisons.map((raison, idx) => (
      <div key={idx} className="space-y-2">
        {raison.titre && (
          <h4 className="font-semibold text-white text-sm">{raison.titre}</h4>
        )}
        <div className="text-sm text-gray-300 whitespace-pre-line">
          {raison.raison}
        </div>
      </div>
    ))}
  </>
);
```

---

## ✅ Résultat

### Avant
- 📄 **~200 mots** par statut
- ⏱️ **30-45 secondes** de lecture
- 😵 **Fatigue cognitive**

### Après
- 📄 **~50 mots** par statut
- ⏱️ **5-10 secondes** de lecture
- ✨ **Compréhension immédiate**

---

## 🎯 Philosophie

> **"Le conducteur doit comprendre, pas lire."**

- ✅ **Visuel** : Emoji + couleurs
- ✅ **Direct** : Phrases courtes
- ✅ **Actionnable** : "À faire" clair
- ✅ **Rapide** : 3 blocs max

**Résultat :** Le conducteur sait immédiatement où il en est et quoi faire.

