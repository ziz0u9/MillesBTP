# 🚀 Guide de Déploiement MillesBTP

## Déploiement sur Vercel

### Prérequis
- Un compte Vercel (gratuit) : https://vercel.com
- Votre dépôt GitHub : https://github.com/ziz0u9/MillesBTP

### Étapes de déploiement

#### 1. Installation de Vercel CLI

```bash
npm install -g vercel
```

#### 2. Connexion à Vercel

```bash
vercel login
```

#### 3. Déploiement

```bash
vercel --prod
```

Suivez les instructions :
- **Set up and deploy**: Yes
- **Which scope**: Votre compte personnel
- **Link to existing project**: No
- **Project name**: millesbtp (ou votre choix)
- **Directory**: ./
- **Override settings**: No

### Configuration des variables d'environnement

Après le premier déploiement, ajoutez vos variables d'environnement :

#### Via le Dashboard Vercel :
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet **millesbtp**
3. Allez dans **Settings** > **Environment Variables**
4. Ajoutez les variables suivantes :

```
VITE_SUPABASE_URL = https://lqcqmcnrkmozafvhjimm.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxY3FtY25ya21vemFmdmhqaW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTgyMzcsImV4cCI6MjA4MTI5NDIzN30.Pr6UDgGAAkN7B1-DzJmZ6dn_Is_xRUZJ6S-92c3hlAg
NODE_ENV = production
```

#### Via CLI :
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add NODE_ENV
```

### Configurer votre nom de domaine personnalisé

1. Dans le Dashboard Vercel, allez dans **Settings** > **Domains**
2. Cliquez sur **Add Domain**
3. Entrez votre nom de domaine (ex: `millesbtp.com`)
4. Suivez les instructions pour configurer vos DNS :

**Chez votre registrar de domaine, ajoutez :**
- Type: `A` ou `CNAME`
- Nom: `@` (ou `www`)
- Valeur: Fournie par Vercel (ex: `cname.vercel-dns.com`)

5. Attendez la propagation DNS (quelques minutes à quelques heures)

### Redéploiement

Pour redéployer après des modifications :

```bash
git add .
git commit -m "Votre message"
git push origin main
```

Vercel redéploiera automatiquement ! 🎉

---

## Alternative : Déploiement via GitHub (Recommandé)

### 1. Connectez votre dépôt GitHub à Vercel

1. Allez sur https://vercel.com/new
2. Cliquez sur **Import Git Repository**
3. Sélectionnez votre dépôt **ziz0u9/MillesBTP**
4. Configurez les variables d'environnement (voir ci-dessus)
5. Cliquez sur **Deploy**

### 2. Déploiement automatique

Chaque fois que vous pushez sur GitHub, Vercel redéploiera automatiquement ! ✨

---

## 🔒 Sécurité

⚠️ **IMPORTANT** : Ne committez JAMAIS vos clés API ou tokens dans le code !

Les clés Supabase dans ce projet sont des clés **publiques** (anon key), donc c'est OK.
Mais pour les clés **privées** (service_role_key), utilisez TOUJOURS des variables d'environnement.

---

## 🆘 Dépannage

### Erreur de build
```bash
vercel logs
```

### Problème de connexion Supabase
Vérifiez que vos variables d'environnement sont bien configurées dans Vercel.

### Le site ne charge pas
Attendez quelques minutes après le déploiement et videz le cache de votre navigateur (Ctrl+Shift+R).

---

## 📞 Support

En cas de problème, consultez :
- Documentation Vercel : https://vercel.com/docs
- Documentation Supabase : https://supabase.com/docs

