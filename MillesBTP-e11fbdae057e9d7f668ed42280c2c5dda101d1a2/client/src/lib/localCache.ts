/**
 * Système de cache local pour éviter les pertes de données
 * Sauvegarde temporaire dans localStorage en cas d'échec de sauvegarde
 */

const CACHE_PREFIX = 'millesbtp_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 heures

interface CacheItem<T> {
  data: T;
  timestamp: number;
  userId: string;
}

/**
 * Sauvegarder des données dans le cache local
 */
export function saveToLocalCache<T>(key: string, data: T, userId: string): void {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      userId,
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    console.log(`[Cache Local] Données sauvegardées: ${key}`);
  } catch (error) {
    console.error('[Cache Local] Erreur de sauvegarde:', error);
  }
}

/**
 * Récupérer des données du cache local
 */
export function getFromLocalCache<T>(key: string, userId: string): T | null {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      return null;
    }
    
    const cacheItem: CacheItem<T> = JSON.parse(cached);
    
    // Vérifier que c'est bien pour le bon utilisateur
    if (cacheItem.userId !== userId) {
      console.warn('[Cache Local] Cache pour un autre utilisateur, ignoré');
      return null;
    }
    
    // Vérifier l'expiration
    const age = Date.now() - cacheItem.timestamp;
    if (age > CACHE_EXPIRY) {
      console.log('[Cache Local] Cache expiré, suppression');
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    console.log(`[Cache Local] Données récupérées: ${key}`);
    return cacheItem.data;
  } catch (error) {
    console.error('[Cache Local] Erreur de lecture:', error);
    return null;
  }
}

/**
 * Supprimer des données du cache local
 */
export function removeFromLocalCache(key: string): void {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    localStorage.removeItem(cacheKey);
    console.log(`[Cache Local] Données supprimées: ${key}`);
  } catch (error) {
    console.error('[Cache Local] Erreur de suppression:', error);
  }
}

/**
 * Nettoyer tous les caches expirés
 */
export function cleanExpiredCache(): void {
  try {
    const keys = Object.keys(localStorage);
    let cleaned = 0;
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cacheItem: CacheItem<any> = JSON.parse(cached);
            const age = Date.now() - cacheItem.timestamp;
            
            if (age > CACHE_EXPIRY) {
              localStorage.removeItem(key);
              cleaned++;
            }
          }
        } catch (error) {
          // Si erreur de parsing, supprimer l'item
          localStorage.removeItem(key);
          cleaned++;
        }
      }
    });
    
    if (cleaned > 0) {
      console.log(`[Cache Local] ${cleaned} cache(s) expiré(s) nettoyé(s)`);
    }
  } catch (error) {
    console.error('[Cache Local] Erreur de nettoyage:', error);
  }
}

/**
 * Obtenir tous les caches en attente pour un utilisateur
 */
export function getPendingCaches(userId: string): Array<{ key: string; data: any; age: number }> {
  const pending: Array<{ key: string; data: any; age: number }> = [];
  
  try {
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cacheItem: CacheItem<any> = JSON.parse(cached);
            
            if (cacheItem.userId === userId) {
              const age = Date.now() - cacheItem.timestamp;
              if (age <= CACHE_EXPIRY) {
                pending.push({
                  key: key.replace(CACHE_PREFIX, ''),
                  data: cacheItem.data,
                  age,
                });
              }
            }
          }
        } catch (error) {
          console.error(`[Cache Local] Erreur lecture ${key}:`, error);
        }
      }
    });
  } catch (error) {
    console.error('[Cache Local] Erreur getPendingCaches:', error);
  }
  
  return pending;
}

