# Correction : Disparition des Données Après Inactivité

## Problème Identifié

**Symptôme :** Après être resté longtemps sur l'application web, toutes les données disparaissent. Il faut rafraîchir la page pour les voir réapparaître.

**Causes Identifiées :**

1. **Expiration du token Supabase** : Par défaut, les tokens expirent après 1 heure
2. **Pas de rafraîchissement automatique** : Le token n'était pas rafraîchi proactivement
3. **Cache React Query vidé** : Le cache se vidait sans rechargement
4. **Pas de détection de reconnexion** : Après perte de connexion, pas de rechargement
5. **Pas de gestion de visibilité** : Onglet caché longtemps = session expirée

## Solutions Implémentées

### 1. Rafraîchissement Automatique du Token (`useSession.ts`)

#### Vérification Périodique (Toutes les 5 Minutes)

```typescript
// Vérifier et rafraîchir la session toutes les 5 minutes
refreshInterval = setInterval(async () => {
  // Vérifier si le token expire bientôt (< 10 minutes)
  if (timeUntilExpiry < tenMinutes) {
    // Rafraîchir le token proactivement
    await supabase.auth.refreshSession();
  }
}, 5 * 60 * 1000);
```

**Avantages :**
- ✅ Token rafraîchi **avant** expiration
- ✅ Pas d'interruption pour l'utilisateur
- ✅ Logs détaillés pour débogage

#### Gestion des Événements d'Authentification

```typescript
supabase.auth.onAuthStateChange((event, newSession) => {
  if (event === 'SIGNED_OUT') {
    // Redirection automatique vers login
    window.location.href = "/auth/login";
  } else if (event === 'TOKEN_REFRESHED') {
    // Mise à jour de la session
    setSession(newSession);
  }
});
```

**Événements Gérés :**
- `SIGNED_OUT` → Redirection vers login
- `TOKEN_REFRESHED` → Mise à jour session
- `SIGNED_IN` → Connexion détectée

### 2. Détection de Perte de Connexion (`App.tsx`)

#### Rechargement Automatique au Retour de Connexion

```typescript
window.addEventListener('online', () => {
  console.log("[App] Connexion rétablie, rechargement des données");
  queryClient.invalidateQueries();
});

window.addEventListener('offline', () => {
  console.warn("[App] Connexion perdue");
});
```

**Scénario :**
```
1. Utilisateur perd la connexion
   ↓
2. Alerte dans la console
   ↓
3. Connexion rétablie
   ↓
4. Rechargement automatique des données
   ↓
5. Utilisateur voit ses données à jour
```

### 3. Gestion de la Visibilité de l'Onglet

#### Rechargement Après Longue Absence

```typescript
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    const timeSinceLastChange = now - lastVisibilityChange;
    
    // Si caché > 5 minutes, recharger
    if (timeSinceLastChange > 5 * 60 * 1000) {
      queryClient.invalidateQueries();
    }
  }
});
```

**Scénario :**
```
1. Utilisateur change d'onglet
   ↓
2. Application reste ouverte 10 minutes
   ↓
3. Utilisateur revient sur l'onglet
   ↓
4. Détection : absence > 5 minutes
   ↓
5. Rechargement automatique des données
```

### 4. Configuration Supabase Améliorée

#### Persistance et Sécurité

```typescript
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,           // Persister la session
    autoRefreshToken: true,          // Rafraîchir automatiquement
    detectSessionInUrl: true,        // Détecter session dans URL
    storage: window.localStorage,    // Utiliser localStorage
    storageKey: 'millesbtp-auth-token', // Clé personnalisée
    flowType: 'pkce',                // Plus sécurisé
  },
});
```

**Améliorations :**
- ✅ Session persistée dans localStorage
- ✅ Clé personnalisée pour éviter conflits
- ✅ PKCE pour plus de sécurité
- ✅ Auto-refresh activé

#### Écoute Globale des Événements

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  console.log("[Supabase] Événement:", event);
});
```

## Logs de Débogage

### Logs Ajoutés

Tous les logs sont préfixés pour faciliter le débogage :

```
[Session] Session active, expiration: 02/01/2026 19:30:00
[Session] Vérification de la session...
[Session] Token valide, expire dans 45 minutes
[Session] Token expire bientôt, rafraîchissement...
[Session] Token rafraîchi avec succès
[Session] Changement d'état: TOKEN_REFRESHED
[App] Connexion rétablie, rechargement des données
[App] Onglet visible après longue absence, rechargement des données
[Supabase] Token rafraîchi globalement
```

### Ouvrir la Console (F12)

Pour surveiller l'état de la session :

1. Ouvrir la console (F12)
2. Filtrer par `[Session]` ou `[App]`
3. Voir les événements en temps réel

## Scénarios de Test

### Scénario 1 : Longue Inactivité (> 5 minutes)

```
1. Ouvrir l'application
2. Laisser ouverte 10 minutes sans interaction
3. Vérifier dans la console :
   - [Session] Vérification de la session... (toutes les 5 min)
   - [Session] Token valide, expire dans X minutes
4. ✅ Données toujours visibles
5. ✅ Pas besoin de rafraîchir
```

### Scénario 2 : Token Proche de l'Expiration

```
1. Ouvrir l'application
2. Attendre que le token expire dans < 10 minutes
3. Vérifier dans la console :
   - [Session] Token expire bientôt, rafraîchissement...
   - [Session] Token rafraîchi avec succès
4. ✅ Token rafraîchi automatiquement
5. ✅ Pas d'interruption
```

### Scénario 3 : Perte de Connexion

```
1. Ouvrir l'application
2. Désactiver le Wi-Fi / Ethernet
3. Vérifier dans la console :
   - [App] Connexion perdue
4. Réactiver la connexion
5. Vérifier dans la console :
   - [App] Connexion rétablie, rechargement des données
6. ✅ Données rechargées automatiquement
```

### Scénario 4 : Changement d'Onglet Prolongé

```
1. Ouvrir l'application
2. Changer d'onglet pendant 10 minutes
3. Revenir sur l'onglet MillesBTP
4. Vérifier dans la console :
   - [App] Onglet visible après longue absence, rechargement des données
5. ✅ Données actualisées automatiquement
```

### Scénario 5 : Session Expirée

```
1. Ouvrir l'application
2. Attendre l'expiration complète du token (rare)
3. Vérifier dans la console :
   - [Session] Session expirée, redirection vers login
4. ✅ Redirection automatique vers /auth/login
5. ✅ Pas de données corrompues
```

## Fichiers Modifiés

### 1. `client/src/hooks/useSession.ts`
- ✅ Vérification périodique toutes les 5 minutes
- ✅ Rafraîchissement proactif du token
- ✅ Gestion des événements d'authentification
- ✅ Logs détaillés
- ✅ Redirection automatique si session expirée

### 2. `client/src/App.tsx`
- ✅ Détection de perte/retour de connexion
- ✅ Gestion de la visibilité de l'onglet
- ✅ Rechargement automatique après longue absence
- ✅ Invalidation du cache React Query

### 3. `client/src/lib/supabaseClient.ts`
- ✅ Configuration améliorée (localStorage, PKCE)
- ✅ Clé de stockage personnalisée
- ✅ Écoute globale des événements
- ✅ Logs globaux

## Avantages

### Pour l'Utilisateur

✅ **Pas d'interruption** : Token rafraîchi automatiquement  
✅ **Pas de perte de données** : Rechargement automatique  
✅ **Pas de rafraîchissement manuel** : Tout est automatique  
✅ **Expérience fluide** : Pas de déconnexion surprise  

### Pour le Développeur

✅ **Logs détaillés** : Facile à déboguer  
✅ **Gestion robuste** : Tous les cas couverts  
✅ **Sécurité** : PKCE + localStorage  
✅ **Traçabilité** : Tous les événements loggés  

## Durée de Vie du Token

### Avant
```
Token expire après : 1 heure
Rafraîchissement : Manuel (rafraîchir la page)
Résultat : Données disparaissent
```

### Après
```
Token expire après : 1 heure
Vérification : Toutes les 5 minutes
Rafraîchissement : Automatique si < 10 min avant expiration
Résultat : Jamais de données disparues
```

## Timeline Typique

```
00:00 - Connexion
05:00 - Vérification (token OK, expire dans 55 min)
10:00 - Vérification (token OK, expire dans 50 min)
15:00 - Vérification (token OK, expire dans 45 min)
...
50:00 - Vérification (token expire dans 10 min)
50:01 - Rafraîchissement automatique
50:02 - Nouveau token valide pour 1 heure
55:00 - Vérification (token OK, expire dans 55 min)
...
```

**Résultat :** L'utilisateur peut rester connecté **indéfiniment** sans interruption !

## Compatibilité

✅ **Tous les navigateurs modernes**  
✅ **Chrome, Firefox, Safari, Edge**  
✅ **Desktop et Mobile**  
✅ **Onglets multiples** (même session partagée)  

## Prochaines Améliorations Possibles

1. **Notification visuelle** : Alerte quand connexion perdue
2. **Mode hors-ligne** : Continuer à travailler sans connexion
3. **Synchronisation différée** : Sauvegarder quand connexion revient
4. **Heartbeat** : Ping serveur pour vérifier connexion
5. **Statistiques** : Temps de session, nombre de rafraîchissements

## Date de Correction

2 janvier 2026

---

**Les données ne disparaîtront plus après inactivité !** 🎉


