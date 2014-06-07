## Trucs qui Bug ou qu'il reste à faire

###Vendredi 9 mai 2014

####BUGS

*résolu 11/05/14* 
- Bug sur les regex, faire en sorte qu'elle ne soit prise que si le mot est tout seul, et non dans un mot. 
(exemple si j'écris "prendre", le pr se transforme en "pour" pour donne "pourendre")

*résolu 12/05/14* 
[Avec la méthode "users.splice(i, 1);"]
- Quand un user ferme sa fenêtre, il ne se déconnecte pas vraiment et reste dans la liste des users connectés. 

*résolu - 12/05/14* 
[var textArea = $('#visu'); textArea.scrollTop(textArea[0].scrollHeight - textArea.height());]
- Le pad "visualisateur" ne suit pas le texte. 

- [12/05/14] Pour l'instant, dans le visualisateur, la "ligne de temps" (|) n'apparait que lorsqu'on fait un keyup ou keydown.

*résolu - 02/06/14*
[distribution des visualisateurs côté client] 
- [19/05/14] Clignotement dans les visualisateurs depuis l'instauration du multi-users

- [19/05/14] Quand un nouvel user se connecte, il ne voit pas le contenu déjà ajouté par les autres users. 

*résolu - 07/06/14*
- [21/05/14] Bug Update dans les pseudos sur les visualisateurs -> créer une fonction d'update

####TO DO

- Pad Perso 
	*fait le 02/03/14*
	- [13/05/14] Faire un WYSIWYG (avec les fonctionnalités établies: bold, souligné etc.) -> MARKDOWN
	
	- [13/05/14] Automatiser les Regex -> système qui permet de les ajouter

(1)- Visualisateurs
	
	*fait pour 4 visualisateurs - 19/05/14*
	*fait pour 5 visualisateurs - 02/06/14*
	(1)- [12/05/14] Mettre plusieurs visualisateurs (à ce jour, on ne voit qu'un seul user dans le visu - 12/05/14)


(3)- Faire la rivière

	*fait - 13/05/14* 
	- Insérer des images depuis un ordinateur

	- [13/05/14] Insérer des images depuis internet

	- [13/05/14] Insérer les url automatiquement depuis le pad. 


(2)- Faire la timeline -> timecode
	
	- [13/05/14] Timecode sur les lignes

	- [13/05/14] Timecode sur les images 

	- [13/05/14] Lier les différents pad par les timecodes


(2)- Mysql
	
	- Enregistrer les images et les textes dans une base de données. 

