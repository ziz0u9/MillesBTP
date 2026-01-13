# Améliorations du Chargement des Chantiers

## Problème Identifié
Les chantiers ne se chargeaient pas toujours au premier affichage, nécessitant un rechargement manuel de la page.

## Causes Identifiées

1. **Configuration React Query contradictoire**
   - Les options globales désactivaient le refetch (`refetchOnWindowFocus: false`)
   - Les composants individuels essayaient de forcer le refetch
   - Pas de retry en cas d'échec de requête

2. **Race condition session/requêtes**
   - Les requêtes pouvaient démarrer avant que la session soit complètement initialisée
   - Pas de synchronisation entre le changement de session et l'invalidation du cache

3. **Manque de visibilité**
   - Aucun log pour déboguer les problèmes
   - Pas d'affichage d'erreur pour l'utilisateur
   - Pas d'indicateur de rechargement en arrière-plan

## Solutions Implémentées

### 1. Configuration React Query Améliorée (`client/src/lib/queryClient.ts`)

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,    // ✅ Recharger quand on revient sur la page
      staleTime: 30000,               // ✅ Données fraîches pendant 30 secondes
      gcTime: 5 * 60 * 1000,         // ✅ Garder en cache 5 minutes
      retry: 2,                       // ✅ Réessayer 2 fois en cas d'échec
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    },
  },
});
```

### 2. Retry Automatique Renforcé pour les Chantiers

Dans `client/src/pages/modules/Chantiers.tsx` :
- **3 tentatives** au lieu de 0
- **Délai exponentiel** entre les tentatives (1s, 2s, 5s max)
- **Logs détaillés** à chaque étape du chargement

### 3. Gestion d'Erreur Visible

Ajout d'un affichage d'erreur avec bouton "Réessayer" :
```typescript
if (queryError && !chantiers) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
      <p className="text-red-400 font-medium mb-2">Erreur de chargement des chantiers</p>
      <p className="text-red-300/70 text-sm mb-3">{queryError.message}</p>
      <Button onClick={() => refetch()}>Réessayer</Button>
    </div>
  );
}
```

### 4. Indicateur de Rechargement en Arrière-plan

Un indicateur discret s'affiche en haut à droite pendant le rechargement :
```typescript
{isLoading && chantiers && (
  <div className="fixed top-4 right-4 bg-blue-500/20 border border-blue-500/30 rounded-lg px-4 py-2 z-50">
    <p className="text-blue-300 text-sm">Actualisation...</p>
  </div>
)}
```

### 5. Synchronisation Session/Cache

Dans `client/src/App.tsx`, invalidation automatique du cache quand la session change :
```typescript
useEffect(() => {
  if (session?.user) {
    console.log("[App] Session utilisateur détectée, invalidation du cache");
    queryClient.invalidateQueries();
  }
}, [session?.user?.id]);
```

### 6. Logs Détaillés pour le Débogage

Tous les composants qui chargent des données ont maintenant des logs préfixés :
- `[Chantiers]` pour la page des chantiers
- `[Dashboard]` pour le tableau de bord
- `[App]` pour les événements globaux

Exemple :
```
[Chantiers] Début du chargement des chantiers...
[Chantiers] Chargement pour userId: abc123
[Chantiers] 5 chantier(s) chargé(s) avec succès
```

## Bénéfices

✅ **Fiabilité accrue** : Les chantiers se chargent systématiquement grâce au retry automatique  
✅ **Meilleure UX** : L'utilisateur voit ce qui se passe (chargement, erreurs, rechargement)  
✅ **Débogage facilité** : Les logs permettent de comprendre rapidement les problèmes  
✅ **Performance** : Le cache intelligent évite les rechargements inutiles  
✅ **Résilience** : En cas d'erreur temporaire, le système réessaie automatiquement  

## Fichiers Modifiés

1. `client/src/lib/queryClient.ts` - Configuration globale React Query
2. `client/src/pages/modules/Chantiers.tsx` - Gestion des chantiers
3. `client/src/pages/dashboard/Dashboard.tsx` - Tableau de bord
4. `client/src/App.tsx` - Synchronisation session/cache

## Test

Pour tester les améliorations :

1. **Test de chargement normal** : Accéder à la page des chantiers → devrait charger immédiatement
2. **Test de retry** : Simuler une erreur réseau → devrait réessayer automatiquement
3. **Test de cache** : Naviguer entre les pages → les données en cache s'affichent instantanément
4. **Test de rechargement** : Revenir sur l'onglet après l'avoir quitté → rechargement automatique
5. **Test d'erreur** : Si erreur persistante → affichage clair avec bouton "Réessayer"

## Logs à Surveiller

Ouvrez la console du navigateur (F12) et surveillez les logs préfixés :
- `[Chantiers]` - Chargement des chantiers
- `[Dashboard]` - Chargement du dashboard
- `[App]` - Événements de session

Ces logs vous permettront de comprendre exactement ce qui se passe lors du chargement.

