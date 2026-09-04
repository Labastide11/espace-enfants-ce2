# Espace Enfants CE2 — V0.26 — Compteur de répartition des métiers

## Nouveau
Un bouton `📊 Répartition de la période` affiche un compteur par élève.

Pour chaque élève, Nino indique :
- les métiers déjà exercés pendant la période ;
- le nombre de fois pour chaque métier (`×1`, `×2`, etc.) ;
- le nombre total de semaines/métiers comptabilisés.

## Équilibrage automatique
Le compteur n'est pas seulement informatif :
le tirage du lundi utilise désormais l'historique de la période pour éviter
qu'un même élève retrouve trop souvent le même métier.

Plus un élève a déjà exercé un métier pendant la période, plus ce métier est
pénalisé dans le prochain tirage.

Les autres règles V0.24 restent actives :
- 12 métiers toujours attribués ;
- 9 solos + 3 binômes ;
- rotation des binômes ;
- Anis et Rayan ne sont pas seuls sur un métier critique du matin.

## Nouvelle période
Le bouton `🔄 Nouvelle période` remet le point de départ des compteurs à la
semaine courante sans effacer l'historique annuel.

## Fichiers
- `mon-metier.html`
- `metiers-v026.js`
- `mon-metier-v026.css`
- `eleves-manifest.js`
