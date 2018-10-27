
function addClass(elemento, classe){
	if (elemento != null && elemento.className.indexOf(classe) < 0){
		elemento.className = elemento.className + " " + classe;
	}
}

function remClass(elemento, classe){
	if (elemento != null ){
		var index = elemento.className.indexOf(classe);
		if (index >= 0){
			var classes = elemento.className.split(classe);
			if (classes.length > 0){
				elemento.className = classes[0] ;
			}
			if (classes.length == 2){
				elemento.className = elemento.className + " " + classes[1];
			}
		}
	}
}

/**
 * getNextSibling
 * Recupera o proximo elemento do mesmo tipo que o elemento (node) ou do tipo especificado (tag)
 **/
function getNextSibling(node, tag){
	if (!tag) tag = node.nodeName;
	tag = tag.toUpperCase();
	var cont = 20; // Limita o numero de itera��es para evitar sobrecarga no ie
	while (node.nextSibling && node.nextSibling.nodeName && node.nextSibling.nodeName.toUpperCase() != tag && cont-- > 0 ){
		node = node.nextSibling;
	}
	return node.nextSibling;
}

/**
 * getPreviousSibling
 * Recupera o proximo elemento do mesmo tipo que o elemento (node) ou do tipo especificado (tag)
 **/
function getPreviousSibling(node, tag){
	if (!tag) tag = node.nodeName;
	var cont = 20; // Limita o numero de itera��es para evitar sobrecarga no ie
	while (node.previousSibling && node.previousSibling.nodeName != tag && cont-- > 0 ){
		node = node.previousSibling;
	}
	return node.previousSibling;
}

