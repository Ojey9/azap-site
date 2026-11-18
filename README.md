# azap.cool

Site du studio de motion design Azap (www.azap.cool). Site statique : HTML, jQuery, Bootstrap 3.

- `main` : le site tel qu'il est dans le dossier « AZAP SAVE » (référence).
- `optimisation` : corrections sans changer le look (détail dans `CHANGEMENTS.txt`).

## Où modifier quoi

- Projets du portfolio : `js/mydata.js` (champ `VISIBLE` pour afficher ou masquer un projet).
- Menu et pied de page : `header.html` et `footer.html`. Sur la branche `optimisation`, ils sont aussi copiés dans chaque page.

## Tester sur son PC

Ouvrir un terminal dans le dossier et lancer `python -m http.server 8000`, puis aller sur http://localhost:8000.
Ouvrir `index.html` en double-clic marche aussi en partie, mais le menu chargé par JavaScript peut ne pas apparaître.
