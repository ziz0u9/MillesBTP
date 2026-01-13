# Fonctionnalité : Ajouter un Coût Terrain

## Objectif

Permettre aux conducteurs de travaux d'enregistrer facilement les coûts réels, sans complexité comptable, directement depuis la liste des chantiers.

## Problème Résolu

**Avant :**
- Pas de moyen simple d'enregistrer les coûts
- Chantiers bloqués en statut "Non mesuré"
- Impossible de calculer la marge réelle
- Pas de traçabilité des dépenses

**Après :**
- ✅ Bouton visible sur chaque chantier
- ✅ Formulaire ultra-rapide (10-15 secondes)
- ✅ Mise à jour automatique du statut
- ✅ Traçabilité automatique via événements terrain

## Fonctionnalité Implémentée

### 1️⃣ **Bouton Visible Partout**

Sur chaque carte de chantier, en haut des actions :

```
┌─────────────────────────────────────┐
│  ➕ Ajouter un coût                │  ← Bouton vert principal
│  ⚠ Voir l'alerte                   │
│  📝 Journal terrain                │
└─────────────────────────────────────┘
```

**Caractéristiques :**
- Couleur verte (#00ff88) pour attirer l'attention
- Toujours visible, quel que soit le statut
- Icône Plus (+) claire

### 2️⃣ **Formulaire Ultra-Simple**

**Temps de saisie : 10-15 secondes maximum**

#### Champs du Formulaire

| Champ | Type | Obligatoire | Options |
|-------|------|-------------|---------|
| **Type de coût** | Liste déroulante | ✅ Oui | • Main-d'œuvre<br>• Matériaux<br>• Sous-traitance<br>• Location / matériel<br>• Autre |
| **Montant (€)** | Nombre | ✅ Oui | Montant en euros |
| **Date** | Date | ✅ Oui | Par défaut = aujourd'hui |
| **Cause / Contexte** | Liste déroulante | ✅ Oui | • Aléa chantier<br>• Erreur estimation<br>• Demande client<br>• Retard fournisseur<br>• Ajustement normal |
| **Commentaire** | Texte court | ❌ Non | Max 100 caractères |

#### Exemple de Saisie Rapide

```
Type : Matériaux
Montant : 5 000 €
Date : 02/01/2026 (aujourd'hui)
Cause : Ajustement normal
Commentaire : Béton supplémentaire

→ Clic sur "Enregistrer" → Terminé !
```

### 3️⃣ **Lien Automatique avec le Statut**

Dès qu'un coût est ajouté :

```
AVANT l'ajout :
├─ couts_engages = 0 €
├─ Statut = ⚪ Non mesuré
└─ Marge = Non calculable

APRÈS l'ajout de 5 000 € :
├─ couts_engages = 5 000 €
├─ Statut = 🟢 Sous contrôle / 🟠 À surveiller / 🔴 À risque
└─ Marge = Calculable et affichée
```

**Calcul Automatique :**
- `couts_engages` est mis à jour
- Le pourcentage d'avancement est recalculé
- Le statut change automatiquement selon l'écart
- La marge en cours devient visible

### 4️⃣ **Documentation Automatique**

Chaque coût devient **automatiquement un événement terrain** :

```
📝 Événement créé automatiquement :
├─ Type : cout
├─ Titre : "Matériaux - 5 000 €"
├─ Description : "Cause: Ajustement normal
│                 Commentaire: Béton supplémentaire"
├─ Impact coût : 5 000 €
├─ Date : 02/01/2026
└─ Auteur : [Conducteur de travaux]
```

**Avantages :**
- ✅ Traçabilité complète
- ✅ Historique daté
- ✅ Réutilisable pour litiges
- ✅ Retour d'expérience facilité
- ✅ **Le conducteur ne documente pas en plus**

### 5️⃣ **Résultat pour le Conducteur**

#### Avant (Sans Coûts)
```
⚪ Non mesuré
Pas encore assez de données pour évaluer

→ Le conducteur ne sait pas où il en est
```

#### Après (Avec Coûts)
```
🟢 Sous contrôle
Marge en cours : 22.5% (270 000 €)
Écart : +2.3%

→ Le conducteur voit immédiatement si ça va ou pas
```

## Workflow Complet

```
1. Conducteur sur chantier
   ↓
2. Facture reçue / Dépense engagée
   ↓
3. Clic sur "➕ Ajouter un coût"
   ↓
4. Saisie rapide (10-15 secondes)
   • Type : Matériaux
   • Montant : 5 000 €
   • Cause : Ajustement normal
   ↓
5. Clic sur "Enregistrer"
   ↓
6. AUTOMATIQUE :
   ├─ Coûts engagés mis à jour
   ├─ Événement terrain créé
   ├─ Statut recalculé
   └─ Marge actualisée
   ↓
7. Conducteur voit immédiatement :
   ✅ Nouveau statut
   ✅ Marge en cours
   ✅ Si ça dérape ou pas
```

## Avantages Clés

### Pour le Conducteur de Travaux

✅ **Simplicité** : 10-15 secondes, pas de calcul compliqué  
✅ **Visibilité** : Voit immédiatement l'impact sur la marge  
✅ **Traçabilité** : Tout est documenté automatiquement  
✅ **Gain de temps** : Une seule action au lieu de plusieurs  
✅ **Décision** : Sait quand agir (alerte automatique)  

### Pour le Suivi de Chantier

✅ **Données réelles** : Pas de projection, des coûts réels  
✅ **Historique** : Chaque coût est tracé et daté  
✅ **Analyse** : Causes documentées pour retour d'expérience  
✅ **Prévention** : Détection précoce des dérives  
✅ **Justification** : Preuves en cas de litige  

### Pour la Rentabilité

✅ **Marge fiable** : Calcul basé sur des données réelles  
✅ **Alertes précoces** : Détection avant qu'il soit trop tard  
✅ **Décisions éclairées** : Données pour négocier/agir  
✅ **Suivi précis** : Écart référence vs réel en temps réel  

## Exemple Concret

### Scénario : Chantier "Maison Famille Martin"

#### Jour 1 : Création du Chantier
```
Montant total : 1 200 000 €
Marge de référence : 22% (264 000 €)
Coûts engagés : 0 €
Statut : ⚪ Non mesuré
```

#### Jour 15 : Premier Coût Ajouté
```
Action : ➕ Ajouter un coût
├─ Type : Main-d'œuvre
├─ Montant : 50 000 €
├─ Cause : Ajustement normal
└─ Commentaire : Équipe de terrassement

Résultat :
├─ Coûts engagés : 50 000 € (4%)
├─ Statut : ⚪ Non mesuré (< 20%)
└─ Message : "Pas encore assez de données"
```

#### Jour 45 : Coûts Accumulés
```
Coûts engagés : 300 000 € (25%)
Marge en cours : 75% (900 000 €)
Statut : 🟢 Sous contrôle
Message : "Situation stable"
```

#### Jour 90 : Dérive Détectée
```
Coûts engagés : 750 000 € (62.5%)
Marge en cours : 15% (180 000 €)
Écart : -31.8%
Statut : 🔴 À risque
Message : "Décision urgente requise"

→ Le conducteur voit immédiatement le problème
→ Il peut agir avant qu'il soit trop tard
```

## Code Implémenté

### Bouton sur Chaque Chantier
```tsx
<Button 
  size="sm" 
  className="bg-[#00ff88] text-black hover:bg-[#00cc6a]"
  onClick={() => {
    setSelectedChantierId(chantier.id);
    setOpenCoutDialog(true);
  }}
>
  <Plus className="h-4 w-4 mr-2" />
  Ajouter un coût
</Button>
```

### Traitement du Formulaire
```typescript
1. Créer un événement terrain automatiquement
2. Mettre à jour couts_engages du chantier
3. Mettre à jour dernier_activite
4. Recharger les données
5. Recalculer le statut automatiquement
```

## Fichiers Modifiés

- `client/src/pages/modules/Chantiers.tsx`
  - Ajout du bouton "Ajouter un coût"
  - Ajout du dialog de saisie
  - Logique de sauvegarde avec retry
  - Création automatique d'événement terrain
  - Mise à jour automatique des coûts engagés

## Test

### Scénario de Test 1 : Premier Coût
1. Ouvrir la page Chantiers
2. Cliquer sur "➕ Ajouter un coût"
3. Remplir le formulaire (10 secondes)
4. Cliquer sur "Enregistrer"
5. ✅ Vérifier que le coût est ajouté
6. ✅ Vérifier que le statut change si > 20%

### Scénario de Test 2 : Coûts Multiples
1. Ajouter plusieurs coûts
2. ✅ Vérifier que couts_engages s'accumule
3. ✅ Vérifier que le statut évolue
4. ✅ Vérifier que la marge se recalcule

### Scénario de Test 3 : Traçabilité
1. Ajouter un coût
2. Aller dans Journal terrain
3. ✅ Vérifier que l'événement est créé
4. ✅ Vérifier les détails (type, montant, cause)

## Prochaines Améliorations Possibles

1. **Import de factures** : Scanner une facture pour extraire le montant
2. **Coûts récurrents** : Modèles pour coûts fréquents
3. **Validation** : Workflow d'approbation pour gros montants
4. **Statistiques** : Répartition des coûts par type
5. **Export** : Exporter l'historique des coûts

## Date de Création

2 janvier 2026


