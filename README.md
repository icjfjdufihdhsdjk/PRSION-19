# PRSION-19 — version GitHub simple

Cette version ne demande aucune installation, aucun terminal et aucun serveur.

## Mettre le site sur GitHub

1. Décompresse le fichier `PRSION-19-v2.zip`.
2. Sur GitHub, crée un nouveau dépôt nommé `PRSION-19`.
3. Dans le dépôt, clique sur **Add file**, puis **Upload files**.
4. Glisse tout le contenu du dossier décompressé : `index.html`, `style.css`, `app.js`, `README.md` et le dossier `assets`.
5. Clique sur **Commit changes**.
6. Ouvre **Settings → Pages**.
7. Dans **Build and deployment**, choisis **Deploy from a branch**, puis `main` et `/ (root)`.
8. Clique sur **Save**.

## Personnages et animations

- Les animations sont volontairement discrètes : pose principale, micro-geste occasionnel et petits déplacements brefs.
- Les personnages ne sont plus animés comme des GIF synchronisés : chaque personnage possède son propre rythme.
- Les déplacements automatiques sont plus courts et plus rapides afin d'éviter l'effet de glissement.
- Le garde du sas a été redessiné en soldat carcéral de science-fiction lourd, avec casque fermé, épaulières, plastron et arme tenue au corps.
- `app.js` contient les positions, routines, vitesses et rythmes d'animation.
- `characters.png` contient la planche de sprites.
- `reception.png` contient le décor.

Le visiteur ne contrôle aucun personnage. Les déplacements restent entièrement automatiques.
