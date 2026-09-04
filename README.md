# Espace Enfants CE2 — V0.13 — Entraide simultanée

## Principe
Les pages « Je peux aider » et « J’ai besoin d’aide » partagent maintenant le même état.

Chaque élève a 3 états possibles :
- ⚪ Je travaille
- 🟢 Disponible pour aider
- 🟠 J’ai besoin d’aide

## Je peux aider
Après avoir choisi sa photo, l’enfant choisit seulement :
- ✅ J’ai eu tout bon
- 💡 J’ai compris mes erreurs

Il devient alors « 🟢 Disponible pour aider ».

## J’ai besoin d’aide
L’enfant choisit sa photo puis confirme qu’il est bloqué.
Il devient « 🟠 J’ai besoin d’aide » et Nino affiche les camarades actuellement disponibles.

## Fonctionnement simultané
- un élève « disponible pour aider » disparaît de la page « J’ai besoin d’aide » ;
- un élève « j’ai besoin d’aide » disparaît de la page « Je peux aider » ;
- les changements sont partagés via `localStorage` ;
- si les deux pages sont ouvertes dans deux onglets/fenêtres du même navigateur, elles se mettent à jour automatiquement.

## Retour à l’état normal
- « ✅ J’ai fini d’aider » remet l’élève en état neutre ;
- « ✅ Je n’ai plus besoin d’aide » remet également l’élève en état neutre.

## Fichiers
- `index.html`
- `jaide.html`
- `jaide.js`
- `entraide-v013.css`
- `eleves-manifest.js`
