# 🔍 ANALYSE DES MANQUES FONCTIONNELS — MillesBTP
**Date :** Analyse produit  
**Objectif :** Identifier et prioriser les fonctionnalités manquantes pour rendre MillesBTP utilisable au quotidien par un conducteur de travaux en PME BTP

---

## 📊 ÉTAT ACTUEL DU PRODUIT

### ✅ Ce qui EXISTE (Structure UI)
- **Tableau de bord** : Liste des chantiers avec filtres et recherche
- **Fiche chantier** : Structure de base avec 3 onglets (Infos générales, Suivi financier, Avenants)
- **Formulaire création** : Possibilité de créer un nouveau chantier (nom, client, adresse, budget initial)
- **Module Clients** : Liste des clients avec création
- **Statuts visuels** : Affichage 🟢/🟠/🔴 de rentabilité

### ❌ Ce qui MANQUE (Valeur métier)

---

## 🚨 PRIORITÉ 1 : SUIVI FINANCIER RÉEL ET ACTIONNABLE

### Problème identifié
Le conducteur de travaux ne peut **PAS** :
- Saisir/modifier les coûts engagés
- Saisir les coûts estimés
- Voir l'évolution de la marge dans le temps
- Comprendre **d'où viennent les coûts**

### Impact utilisateur
**Douleur n°1 non résolue** : Impossible de faire un suivi financier réel du chantier. Le produit reste un "tableau de bord passif" sans usage quotidien.

### Fonctionnalités requises

#### 1.1 Saisie des coûts engagés (CRITIQUE)
**Où :** Onglet "Suivi financier" de la fiche chantier

**Fonctionnalités :**
- **Champ éditable "Coûts engagés"** avec validation
- **Bouton "Mettre à jour"** pour sauvegarder
- **Calcul automatique** de la marge et du pourcentage
- **Recalcul automatique** du statut de rentabilité :
  - 🟢 Rentable : marge ≥ 15% du budget
  - 🟠 À surveiller : marge entre 5% et 15%
  - 🔴 À risque : marge < 5% ou négative

**ROI utilisateur :** Répond directement à la question "Où en suis-je financièrement sur ce chantier ?"

---

#### 1.2 Saisie des coûts estimés
**Où :** Onglet "Suivi financier"

**Fonctionnalités :**
- **Champ "Coûts estimés"** (prévisionnel) séparé des coûts engagés
- **Affichage côte à côte** : Estimé vs Engagé
- **Différence visuelle** si écart significatif (>10%)

**ROI utilisateur :** Permet de comparer prévisionnel vs réalité

---

#### 1.3 Visualisation claire Budget vs Coûts
**Où :** Onglet "Suivi financier"

**Fonctionnalités :**
- **Barre de progression visuelle** :
  - Budget initial (100%)
  - Coûts engagés (en rouge si dépassement, en orange si proche)
  - Marge restante (en vert)
- **Alertes visuelles** :
  - "⚠️ Budget dépassé de X€" (si coûts > budget)
  - "⚠️ 90% du budget consommé" (si coûts > 90% budget)

**ROI utilisateur :** Compréhension immédiate de la santé financière sans calcul mental

---

## 🚨 PRIORITÉ 2 : GESTION DES AVENANTS (MODIFICATIONS)

### Problème identifié
L'onglet "Avenants" est **VIDE**. Aucune fonctionnalité de création ou gestion.

**Impact métier :** Les modifications de chantier sont perdues, non tracées, non facturées → pertes invisibles.

### Fonctionnalités requises

#### 2.1 Création d'un avenant
**Où :** Onglet "Avenants" → Bouton "Nouvel avenant"

**Formulaire :**
- **Titre** (ex: "Ajout d'une salle de bain")
- **Description** (textarea)
- **Impact coût** (€) - estimation
- **Impact délai** (jours/heures) - optionnel
- **Statut** : En attente (par défaut) / Validé / Refusé
- **Date de demande**

**ROI utilisateur :** Trace tous les changements, évite les "on avait dit que..." oraux

---

#### 2.2 Liste des avenants
**Où :** Onglet "Avenants"

**Affichage :**
- Tableau ou cartes avec :
  - Titre
  - Impact coût (en évidence)
  - Statut (badge coloré)
  - Date de demande
- **Filtres** : Tous / En attente / Validés / Refusés
- **Tri** : Par date (récent en premier)

**ROI utilisateur :** Vue d'ensemble rapide des modifications en cours

---

#### 2.3 Validation/Refus d'un avenant
**Fonctionnalités :**
- **Bouton "Valider"** → Statut passe à "Validé"
  - **Impact automatique** : Mise à jour du budget initial du chantier
  - **Impact automatique** : Recalcul de la marge
- **Bouton "Refuser"** → Statut passe à "Refusé"
- **Champ "Notes"** pour justifier la décision

**ROI utilisateur :** Décisions tracées, budget mis à jour automatiquement

---

#### 2.4 Alerte "Avenant en attente"
**Fonctionnalités :**
- **Badge rouge** sur le chantier dans la liste si avenant en attente > 7 jours
- **Notification visuelle** dans le dashboard
- **Badge "Avenants"** sur la fiche chantier si avenants en attente

**ROI utilisateur :** Rien ne passe inaperçu

---

## 🚨 PRIORITÉ 3 : FICHE CHANTIER COMPLÈTE ET ÉDITABLE

### Problème identifié
La fiche chantier est **incomplète** et **non éditable** (sauf création initiale).

### Fonctionnalités requises

#### 3.1 Édition complète du chantier
**Où :** Bouton "Modifier" dans la fiche chantier

**Fonctionnalités :**
- **Chargement** des données existantes dans le formulaire
- **Édition** de tous les champs :
  - Nom, code, adresse, type, description
  - Dates (début, fin prévue)
  - Budget initial
  - Responsable
- **Sauvegarde** avec retour sur la fiche chantier

**ROI utilisateur :** Mise à jour des informations au fil du temps

---

#### 3.2 Onglet "Infos générales" enrichi
**Contenu actuel :** Client, Adresse (minimal)

**Contenu requis :**
- **Client** : Nom + lien vers fiche client
- **Adresse** complète
- **Type de chantier** (si renseigné)
- **Dates** : Début / Fin prévue (si renseignées)
- **Responsable** (nom du conducteur)
- **Description** (si renseignée)
- **Code chantier** (si renseigné)
- **Statut** : Actif / Terminé / Archivé

**ROI utilisateur :** Toutes les infos clés en un coup d'œil

---

## 🚨 PRIORITÉ 4 : LIEN CLIENTS ↔ CHANTIERS

### Problème identifié
Le module "Clients" est **isolé**. Aucun lien avec les chantiers.

**Impact métier :** Impossible de voir l'historique d'un client, sa rentabilité globale, ses chantiers en cours.

### Fonctionnalités requises

#### 4.1 Vue chantiers depuis un client
**Où :** Fiche client (à créer) ou liste clients améliorée

**Fonctionnalités :**
- **Section "Chantiers"** dans la fiche client
- **Liste des chantiers** liés au client :
  - Nom du chantier (lien vers la fiche)
  - Statut (Actif/Terminé)
  - Rentabilité (🟢/🟠/🔴)
  - Budget / Marge
  - Dates
- **Tri** : Par date (récent en premier) ou par statut

**ROI utilisateur :** Vision globale d'un client, historique, relation long terme

---

#### 4.2 Statistiques client
**Où :** Fiche client

**Métriques :**
- **Nombre total de chantiers**
- **Chantiers actifs** (en cours)
- **Chantiers terminés**
- **Chiffre d'affaires total** (somme des budgets des chantiers terminés)
- **Marge moyenne** des chantiers terminés

**ROI utilisateur :** Identifier les clients les plus rentables

---

#### 4.3 Lien depuis fiche chantier vers client
**Où :** Onglet "Infos générales" de la fiche chantier

**Fonctionnalités :**
- **Nom du client** cliquable → redirection vers fiche client
- **Icône/indicateur** si le client a plusieurs chantiers

**ROI utilisateur :** Navigation fluide entre chantier et client

---

## 🚨 PRIORITÉ 5 : ALERTES INTELLIGENTES ET ROI VISIBLE

### Problème identifié
Les alertes existent en base (`has_budget_alert`, `has_amendment_alert`, `has_admin_alert`) mais **ne sont pas calculées automatiquement**.

**Impact :** Aucun signal d'action immédiate pour l'utilisateur.

### Fonctionnalités requises

#### 5.1 Calcul automatique des alertes
**Logique métier :**

**Budget Alert :**
- **Déclenchement** : Si `coûts_engagés > budget_initial * 0.9` (90% du budget)
- **Ou** : Si `coûts_engagés > budget_initial` (budget dépassé)

**Amendment Alert :**
- **Déclenchement** : Si avenant(s) avec statut "en attente" > 7 jours

**Admin Alert :**
- **Déclenchement** : Si `planned_end_date` passée et chantier toujours "actif"
- **Ou** : Si chantier actif depuis > 6 mois sans date de fin

**ROI utilisateur :** Signaux proactifs, rien ne passe inaperçu

---

#### 5.2 Dashboard avec alertes prioritaires
**Où :** Page d'accueil dashboard

**Fonctionnalités :**
- **Section "Actions requises"** en haut de page
- **Liste des chantiers** avec alertes :
  - Budget dépassé
  - Avenants en attente
  - Retards administratifs
- **Badge rouge** avec nombre d'alertes totales

**ROI utilisateur :** Répond à "Pourquoi j'ouvre ce logiciel aujourd'hui ?" → Action immédiate requise

---

#### 5.3 Indicateurs de gain/perte
**Où :** Dashboard et fiche chantier

**Fonctionnalités :**
- **Marge totale** : Somme des marges de tous les chantiers actifs
- **Chantiers à risque** : Nombre de chantiers 🔴 avec coûts > budget
- **Économies potentielles** : Si avenants validés, impact sur marge

**ROI utilisateur :** Vision macro de la rentabilité globale

---

## 📋 PRIORITÉS RÉCAPITULATIVES

### Phase 1 : MVP Utilisable (2-3 semaines)
1. ✅ **Suivi financier réel** (1.1 + 1.2 + 1.3)
2. ✅ **Gestion des avenants** (2.1 + 2.2 + 2.3)
3. ✅ **Édition chantier** (3.1)

### Phase 2 : Valeur ajoutée (1-2 semaines)
4. ✅ **Lien Clients ↔ Chantiers** (4.1 + 4.2 + 4.3)
5. ✅ **Alertes intelligentes** (5.1 + 5.2)

### Phase 3 : Amélioration continue
6. Statistiques avancées
7. Export PDF/Email
8. Historique des modifications

---

## 🎯 CRITÈRES DE SUCCÈS

Un conducteur de travaux doit pouvoir :
- ✅ **Ouvrir le logiciel** et voir immédiatement "ce qui cloche" (alertes)
- ✅ **Saisir les coûts réels** d'un chantier et voir la marge se recalculer
- ✅ **Créer un avenant** et le valider → impact automatique sur le budget
- ✅ **Voir tous les chantiers d'un client** en un clic
- ✅ **Comprendre en 30 secondes** la santé financière de ses chantiers

**Si ces 5 actions ne sont pas possibles → Le produit n'est pas utilisable au quotidien.**

---

## ❌ CE QUI NE DOIT PAS ÊTRE FAIT

- ❌ Gestion complète de facturation (hors scope)
- ❌ Planning/Gantt (hors scope)
- ❌ Suivi d'heures de travail (hors scope)
- ❌ Gestion de stock (hors scope)
- ❌ Outil terrain pour ouvriers (hors scope)

**Focus strict :** Administration et finance des chantiers pour conducteur de travaux.

