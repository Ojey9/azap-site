function parsePortfolio(idItem,myArray,typeVideo=null,linkToProjectPage=false ) {
	var x = document.getElementById(idItem);
	if (!x) return;
	for(var i=0;i<myArray.length;i++){
		var item = myArray[i];
		var classes = (item.CLASS || '').split(/\s+/);
		var matchesType = typeVideo == null || item.TYPE2 == typeVideo || item.TYPE_PLAYER == typeVideo || classes.indexOf(typeVideo) !== -1;
		if(item.CLASS && item.VISIBLE === true && matchesType){
			var itemHref = linkToProjectPage ? (item.PAGE || '#') : (item.VIDEO || item.PAGE || '#');
			var itemLinkClass = !linkToProjectPage && item.VIDEO ? ' class="popup-video"' : '';
			x.innerHTML += '<div class="portfolio-item '+item.CLASS+'">'
				+'<div class="portfolio-wrapper"><a'+itemLinkClass+' href="'+itemHref+'">'
					+'<div class="portfolio-thumb">'
						+'<img src="'+item.IMG+'" alt="'+item.ALT_TXT+'" />'
						+'<div class="view-icon"><span class="icon-video"></span></div>'
					+'</div>'
					+'<div class="portfolio-caption text-left">'
						+'<h4 class="color-blue"><b>'+item.TITLE+'</b></h4>'
						+'<div class="work-tag">Client : <b>'+item.CLIENT+'</b></div>'
						+'<div class="work-tag">Compétences : <b>'+item.SKILL+'</b></div>'
					+'</div>'
				+'</a></div>'
			+'</div>';
		}
	}
}






function parsePortfolio_old(idItem,myArray) {
	console.log('parsePortfolio called');
	console.log(myArray);
	console.log(myArray.length);
	var x = document.getElementById(idItem);	
	var numberOfMngrName = 0;
	for(var i=0;i<myArray.length;i++){
		if(myArray[i].CLASS != null){
			x.innerHTML += '<div class="portfolio-item '+myArray[i].CLASS+'">'
				+'<div class="portfolio-wrapper"><a href="'+myArray[i].PAGE+'">'
					+'<div class="portfolio-thumb">'
						+'<img src="'+myArray[i].IMG+'" alt="'+myArray[i].ALT_TXT+'" />'
						+'<div class="view-icon ><a class="popup-video" ><span class="icon-video"></span></a></div>'
					+'</div>'
					+'<div class="portfolio-caption text-left">'
						+'<h4>'+myArray[i].TITLE+'</h4>'
						+'<div class="work-tag">'+myArray[i].SKILL+'</div>'
					+'</div>'
				+'</a></div>'
			+'</div>';
			
			numberOfMngrName++;
		}
	}
	console.log(numberOfMngrName);
}
