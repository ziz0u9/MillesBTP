# MILLESBTP - CONCEPTION PRODUIT COMPLÈTE

## 1️⃣ PHILOSOPHIE PRODUIT

### En quoi MillesBTP est différent des ERP BTP classiques

**Les ERP classiques** = outils de saisie administrative, reporting a posteriori, complexité qui décourage l'usage terrain.

**MillesBTP** = outil de **pilotage en temps réel** qui transforme chaque fait terrain en signal actionnable.

### Principe central : PILOTAGE PAR SIGNAUX FAIBLES

**Le problème fondamental** : Les pertes financières ne naissent pas le jour où elles apparaissent dans le bilan. Elles naissent 2, 3, 6 mois avant, quand :
- Un sous-traitant prend du retard (signal faible)
- Un client demande une modification orale (signal faible)
- Un aléa terrain n'est pas documenté (signal faible)
- Une décision est reportée (signal faible)

**MillesBTP capture ces signaux faibles et les transforme automatiquement en :**
- Alertes visuelles immédiates
- Décisions à prendre (avec deadline)
- Impact financier estimé
- Traçabilité complète

### Ce que le conducteur voit en 30 secondes chaque matin

**Écran d'accueil = Tableau de bord conducteur**

En un coup d'œil :
- **3 chantiers en urgence** (rouge) : décision critique à prendre aujourd'hui
- **5 chantiers à surveiller** (orange) : signaux faibles détectés
- **2 chantiers silencieux** (gris) : pas d'activité depuis X jours → risque caché
- **8 décisions en attente** : avec impact € estimé et deadline
- **3 avenants à finaliser** : en cours de négociation

**Philosophie** : Le conducteur ne cherche pas l'information, elle vient à lui. Priorisation automatique par impact financier + urgence.

---

## 2️⃣ STRUCTURE GLOBALE DU LOGICIEL

### Menu principal (navigation simple)

```
┌─────────────────────────────────────┐
│  MILLESBTP                          │
├─────────────────────────────────────┤
│  📊 Tableau de bord (par défaut)   │
│  🏗️  Mes chantiers                  │
│  ⚠️  Alertes & décisions            │
│  📝 Écarts & avenants               │
│  📸 Journal terrain                 │
│  📈 Rapports financiers             │
│  ⚙️  Paramètres                     │
└─────────────────────────────────────┘
```

### Rôle de chaque page

**📊 Tableau de bord** : Vue d'ensemble, priorités, signaux faibles
**🏗️ Mes chantiers** : Liste + détail de chaque chantier
**⚠️ Alertes & décisions** : Toutes les décisions en attente, classées par impact
**📝 Écarts & avenants** : Suivi des écarts, transformation en avenants
**📸 Journal terrain** : Chronologie complète d'un chantier (événements, photos, décisions)
**📈 Rapports financiers** : Marges réelles, écarts, prévisions
**⚙️ Paramètres** : Configuration, utilisateurs, intégrations

**Logique de navigation** : Toujours accessible depuis n'importe quelle page. Navigation contextuelle (ex: depuis un chantier → voir son journal terrain).

---

## 3️⃣ PAGE "TABLEAU DE BORD CONDUCTEUR"

### Ce qu'elle affiche par défaut

**Zone 1 : Alertes critiques (rouge)**
- Chantiers avec décision à prendre aujourd'hui
- Impact financier estimé si non-décision
- Exemple : "Chantier X : Retard sous-traitant → -15 jours → -8 500€ → Décision requise avant 18h"

**Zone 2 : Chantiers à surveiller (orange)**
- Signaux faibles détectés (retard, écart, silence)
- Tendance (s'améliore / se dégrade)
- Action suggérée

**Zone 3 : Chantiers silencieux (gris)**
- Pas d'activité terrain depuis X jours
- Risque : dérive cachée
- Action : "Vérifier l'avancement réel"

**Zone 4 : Décisions en attente (liste)**
- Décision | Chantier | Impact € | Deadline | Responsable
- Triable par impact financier, deadline, chantier

**Zone 5 : Avenants en cours**
- Statut (négociation / validé / refusé)
- Montant
- Délai de finalisation

**Zone 6 : Indicateurs globaux**
- Marge globale projetée vs prévue
- Nombre de chantiers en dérive
- Décisions non prises depuis > 7 jours

### Système d'alertes intelligentes

**Pas de reporting passif** : MillesBTP ne dit pas "voici les chiffres, débrouille-toi".

**Alertes intelligentes** = combinaison de :
- Fait terrain (ex: sous-traitant en retard)
- Impact délai calculé automatiquement
- Impact financier estimé (coût retard + coût main d'œuvre)
- Décision suggérée (ex: "Engager sous-traitant de secours ?")
- Deadline calculée (ex: "Décision requise avant 3 jours sinon impact +5 000€")

**Exemples d'alertes** :
- "Chantier X : Photo terrain montre aléa géologique non prévu → Impact estimé +12 000€ → Créer avenant ?"
- "Chantier Y : Aucune activité depuis 5 jours → Risque dérive cachée → Vérifier avancement réel"
- "Chantier Z : Décision 'changement client' non prise depuis 8 jours → Impact estimé -3 500€ si refusé"

### Comment elle aide à PRIORISER

**Algorithme de priorisation automatique** :
1. Impact financier (€)
2. Urgence (deadline)
3. Risque de dérive (chantier silencieux = risque élevé)

**Résultat** : Le conducteur sait immédiatement sur quoi agir en premier. Pas de temps perdu à analyser des tableaux Excel.

---

## 4️⃣ COMPORTEMENT CLÉ : GESTION DES CHANTIERS

### Pour chaque chantier

**Vue d'ensemble chantier** :
- Statut réel vs statut administratif
- Marge prévue vs marge projetée (calculée en temps réel)
- Délai prévu vs délai projeté
- Signaux faibles actifs (retard, écart, silence)

**Statut réel vs statut administratif** :
- **Statut administratif** : "En cours" (toujours vert dans l'ERP)
- **Statut réel** : "En dérive" (rouge dans MillesBTP)
- **Pourquoi** : L'ERP ne voit pas les signaux faibles. MillesBTP les détecte avant qu'ils ne deviennent des problèmes majeurs.

### Suivi des faits terrain

**Chronologie automatique** (Journal terrain) :
- Événements terrain (photos, notes, appels)
- Décisions prises / non prises
- Écarts détectés
- Avenants créés / négociés

**Capture en 10 secondes** :
- Photo + commentaire rapide
- Type d'événement (aléa, retard, changement client, etc.)
- Impact estimé (délai, coût)

### Lien automatique : Fait → Impact délai → Impact € → Impact marge

**Exemple concret** :
1. **Fait terrain** : "Photo : Aléa géologique découvert (terrain instable)"
2. **Impact délai** : +15 jours (calculé automatiquement selon type d'aléa)
3. **Impact €** : +12 000€ (coût terrassement supplémentaire)
4. **Impact marge** : Marge passe de 18% à 12% (calculé automatiquement)
5. **Alerte générée** : "Créer avenant ? Décision requise avant 3 jours"

**Tout est automatique** : Le conducteur ne calcule rien. Il documente le fait, MillesBTP calcule l'impact.

### Notion de "chantier silencieux à risque"

**Définition** : Chantier sans activité terrain depuis X jours (configurable, ex: 5 jours).

**Pourquoi c'est un risque** :
- Pas d'activité = pas de données = pas de visibilité
- Risque de dérive cachée (sous-traitant en retard mais ne le dit pas)
- Découverte tardive = perte financière importante

**Action automatique** :
- Alerte générée : "Chantier silencieux depuis 5 jours"
- Suggestion : "Vérifier avancement réel avec équipe terrain"
- Si pas d'action → alerte escalade (orange → rouge)

---

## 5️⃣ GESTION DES ÉCARTS & AVENANTS (POINT CENTRAL)

### Comment un écart naît

**4 sources d'écarts** :
1. **Terrain** : Aléa géologique, météo, imprévu
2. **Client** : Demande de modification, changement de périmètre
3. **MO (Maître d'œuvre)** : Demande de modification, erreur plan
4. **Interne** : Erreur estimation, sous-traitant défaillant

### Comment il est capturé en 10 secondes

**Workflow ultra-simple** :
1. Conducteur prend photo / note rapide
2. Sélectionne type d'écart (terrain / client / MO / interne)
3. Estime impact (délai, coût) - ou laisse MillesBTP estimer selon historique
4. Valide → Écart créé

**C'est tout.** Pas de formulaire complexe, pas de 15 champs obligatoires.

### Transformation automatique : Écart → Alerte → Décision → Avenant

**Étape 1 : Écart créé**
- Alerte générée automatiquement
- Apparaît dans "Alertes & décisions"
- Impact financier calculé

**Étape 2 : Décision à prendre**
- Question suggérée : "Créer avenant ?" / "Absorber l'écart ?" / "Négocier avec client ?"
- Deadline calculée (ex: "Décision requise avant 5 jours sinon impact +X€")
- Responsable assigné (conducteur ou autre)

**Étape 3 : Si décision = "Créer avenant"**
- Avenant créé automatiquement avec :
  - Description de l'écart
  - Photos / preuves
  - Impact délai
  - Impact coût
  - Statut (brouillon / envoyé / négocié / validé / refusé)

**Étape 4 : Suivi avenant**
- Rappels automatiques si pas de réponse client depuis X jours
- Escalade si refusé (alerte rouge)
- Impact marge mis à jour automatiquement selon statut

### Ce qui se passe si aucune décision n'est prise

**Traçabilité complète** :
- Journal automatique : "Décision 'Créer avenant ?' non prise depuis 8 jours"
- Impact financier cumulé affiché
- Escalade automatique (alerte orange → rouge)
- Responsabilité claire (qui devait décider, quand, pourquoi pas fait)

**Objectif** : Pas de flicage, mais traçabilité pour :
- Comprendre pourquoi une perte est survenue
- Apprendre (retour d'expérience)
- Défense en cas de litige

---

## 6️⃣ MÉMOIRE & RESPONSABILITÉ

### Journal automatique des décisions / non-décisions

**Tout est tracé automatiquement** :
- Décision prise : Qui, quand, quoi, pourquoi
- Décision non prise : Qui devait décider, deadline, impact si non-décision
- Évolution d'un écart : Création → Décision → Avenant → Négociation → Résultat

**Format** : Chronologie simple, lisible, avec photos / preuves.

### Historique exploitable en cas de litige

**En cas de litige client** :
- MillesBTP = preuve complète
- Chronologie : "Écart détecté le X, avenant envoyé le Y, client informé le Z"
- Photos, décisions, impacts calculés
- Responsabilité claire (qui a fait quoi, quand)

**En cas d'audit interne** :
- Comprendre pourquoi une perte est survenue
- Identifier les patterns (ex: "Décisions non prises systématiquement sur type d'écart X")
- Amélioration continue

### Responsabilité claire sans flicage

**Principe** : MillesBTP ne flic pas, il **documente pour protéger**.

**Exemple** :
- Si décision non prise → Traçabilité claire
- Si perte financière → On sait pourquoi (décision tardive ? écart non détecté ?)
- Si litige → Preuve complète

**Objectif** : Le conducteur est protégé s'il a bien documenté. S'il n'a pas documenté, la responsabilité est claire.

---

## 7️⃣ AUTOMATISATIONS CLÉS (inspiration PiscinistePro)

### Ce qui se déclenche automatiquement (sans ressaisie)

**1. Calcul d'impact financier**
- Écart détecté → Impact délai estimé → Impact coût calculé → Impact marge mis à jour
- Pas de calcul manuel, pas d'Excel

**2. Génération d'alertes**
- Écart créé → Alerte générée automatiquement
- Chantier silencieux → Alerte générée automatiquement
- Décision non prise depuis X jours → Alerte escalade

**3. Création d'avenant depuis écart**
- Un clic : "Créer avenant depuis cet écart"
- Avenant pré-rempli avec toutes les infos (description, photos, impact)
- Pas de ressaisie

**4. Mise à jour marge en temps réel**
- Chaque écart, chaque avenant validé → Marge recalculée automatiquement
- Pas de reporting mensuel, marge toujours à jour

**5. Rappels automatiques**
- Avenant envoyé mais pas de réponse depuis X jours → Rappel automatique
- Décision en attente depuis X jours → Rappel automatique

**6. Détection de patterns**
- Si plusieurs écarts similaires → Suggestion : "Pattern détecté : Aléas géologiques récurrents sur type de terrain X"
- Apprentissage automatique basique (pas de ML complexe, juste détection de patterns simples)

### Exemples concrets d'automatisations utiles

**Exemple 1 : Retard sous-traitant**
- Conducteur note : "Sous-traitant X en retard de 3 jours"
- MillesBTP calcule automatiquement :
  - Impact délai : +3 jours (minimum)
  - Impact coût : Coût main d'œuvre interne + pénalités possibles
  - Impact marge : Recalculé
  - Alerte générée : "Décision requise : Engager sous-traitant de secours ?"

**Exemple 2 : Changement client oral**
- Conducteur note : "Client demande modification orale (ajout cloison)"
- MillesBTP :
  - Crée écart automatiquement
  - Suggère : "Créer avenant ?"
  - Si oui → Avenant pré-rempli avec description, impact estimé
  - Rappel automatique si pas de réponse client

**Exemple 3 : Chantier silencieux**
- Pas d'activité depuis 5 jours
- MillesBTP :
  - Alerte générée : "Chantier silencieux, risque dérive cachée"
  - Suggestion : "Vérifier avancement réel"
  - Si pas d'action → Escalade (alerte rouge)

### Ce que le conducteur n'a PLUS besoin de faire

**Avant (sans MillesBTP)** :
- Calculer manuellement les impacts financiers (Excel)
- Se rappeler de suivre les avenants (post-it, mémoire)
- Découvrir les dérives trop tard (pas de signaux faibles)
- Documenter après coup (oubli, imprécision)
- Prioriser à l'aveugle (pas de vue d'ensemble)

**Maintenant (avec MillesBTP)** :
- ✅ Impacts calculés automatiquement
- ✅ Rappels automatiques pour avenants / décisions
- ✅ Signaux faibles détectés en temps réel
- ✅ Documentation en 10 secondes (photo + note)
- ✅ Priorisation automatique par impact financier

**Gain de temps estimé** : 2-3h/jour de travail administratif transformé en pilotage terrain.

---

## 8️⃣ CE QUE LE LOGICIEL NE FAIT PAS (IMPORTANT)

### Exclusions volontaires (pour simplicité et adoption terrain)

**❌ Gestion complète de la paie / RH**
- MillesBTP = pilotage chantier, pas gestion RH
- Intégration possible avec outils existants si besoin

**❌ Comptabilité complète**
- MillesBTP = suivi financier projet (marges, écarts, avenants)
- Pas de comptabilité générale, pas de TVA, pas de bilan
- Intégration possible avec ERP comptable

**❌ Gestion stocks / matériaux détaillée**
- MillesBTP = suivi des écarts matériaux (impact financier)
- Pas de gestion de stock en temps réel, pas de commandes
- Intégration possible avec outils existants

**❌ Planning détaillé type MS Project**
- MillesBTP = suivi des retards et impacts, pas de planning complexe
- Pas de Gantt, pas de dépendances entre tâches
- Focus sur signaux faibles, pas sur planification initiale

**❌ CRM complet**
- MillesBTP = pilotage chantier, pas gestion commerciale
- Pas de suivi leads, pas de devis détaillés
- Intégration possible avec CRM existant

**❌ Gestion documentaire complète**
- MillesBTP = journal terrain (photos, notes, décisions)
- Pas d'archivage complet de tous les documents chantier
- Focus sur ce qui impacte le pilotage et les décisions

### Pourquoi ces exclusions

**Principe** : MillesBTP fait UNE chose très bien = **pilotage par signaux faibles et décisions**.

**Risque d'inclusion** :
- Complexité → Adoption difficile terrain
- Temps de saisie → Conducteur ne l'utilise pas
- Fonctionnalités inutiles → Interface surchargée

**Stratégie** : Intégrations possibles avec outils existants (ERP, CRM, etc.) plutôt que tout refaire.

---

## RÉSUMÉ : VISION FINALE

### À quoi ressemble MillesBTP

**Interface simple** : Blocs, boutons, pas de design complexe. Focus sur l'information actionnable.

**Navigation fluide** : 7 pages principales, toujours accessibles. Navigation contextuelle.

**Priorisation automatique** : Le conducteur sait immédiatement sur quoi agir.

### Comment un conducteur l'utilise chaque jour

**Matin (30 secondes)** :
- Ouverture tableau de bord
- Vue immédiate : 3 urgences, 5 à surveiller, 8 décisions en attente
- Priorisation automatique par impact financier

**Terrain (10 secondes par événement)** :
- Photo + note rapide
- Type d'événement sélectionné
- Impact estimé (ou calculé automatiquement)
- Valide → C'est fait

**Décisions (5 minutes/jour)** :
- Page "Alertes & décisions"
- Décisions classées par impact
- Prise de décision en 1 clic
- Si avenant → Création automatique depuis écart

**Fin de journée (optionnel)** :
- Vérification chantiers silencieux
- Validation des décisions prises

### Pourquoi il réduit les pertes, le stress et les dérives

**Réduction des pertes** :
- Détection précoce des signaux faibles (2-3 mois avant la perte)
- Décisions prises à temps (deadlines claires)
- Avenants créés rapidement (pas d'oubli)
- Traçabilité complète (défense en cas de litige)

**Réduction du stress** :
- Priorisation automatique (pas de "par où commencer ?")
- Visibilité en temps réel (pas de surprises)
- Documentation rapide (10 secondes, pas de charge administrative)
- Responsabilité claire (protection si bien documenté)

**Réduction des dérives** :
- Signaux faibles détectés avant qu'ils ne deviennent des problèmes majeurs
- Chantiers silencieux identifiés (dérive cachée)
- Décisions non prises tracées (escalade automatique)
- Impact financier toujours visible (prise de conscience immédiate)

---

**FIN DU DOCUMENT DE CONCEPTION**

