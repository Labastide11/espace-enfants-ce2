# Espace Enfants CE2 — Patch V0.12

## Accueil
La page d'accueil passe à 4 cartes en grille 2 × 2 :

Première ligne :
- Je peux aider
- J’ai besoin d’aide

Deuxième ligne :
- Je ne sais pas quoi faire
- Mon métier

Les deux nouvelles images fournies sont utilisées directement.

## Navigation
- `Je peux aider` ouvre `jaide.html?mode=give`
- `J’ai besoin d’aide` ouvre `jaide.html?mode=need`

Après avoir choisi son portrait, l'enfant arrive directement dans le bon parcours :
il n'a plus à choisir une seconde fois entre aider et demander de l'aide.

## Fichiers du patch
- `index.html`
- `accueil-v012.css`
- `jaide.html`
- `jaide.js`
- `assets/je-peux-aider.png`
- `assets/jai-besoin-aide.png`

Le fichier `style.css` n'est pas remplacé afin de conserver les modifications déjà faites dans les versions précédentes.
