var AZAP_GIF_VIDEOS = {"img/blog/formation-elearning-natixis-video.gif": [400, 225], "img/portfolio/mosaic/Air-france-Insta-video.gif": [400, 225], "img/portfolio/mosaic/Devialet-alcove-video.gif": [400, 470], "img/portfolio/mosaic/Heetch-Dooh.gif": [400, 225], "img/portfolio/mosaic/Les-ptits-voyagent-video.gif": [400, 225], "img/portfolio/mosaic/Louca-Trailer-Dupuis.gif": [400, 225], "img/portfolio/mosaic/Lucja-Trailer-VegaDupuis-2.gif": [400, 225], "img/portfolio/mosaic/TeslaNote-Trailer-VegaDupuis-large.gif": [825, 225], "img/portfolio/mosaic/d-bloc-asso.gif": [400, 225], "img/portfolio/mosaic/formation-elearning-natixis-video.gif": [400, 225], "img/portfolio/mosaic/lockers-natixis-video-.gif": [400, 225], "img/portfolio/mosaic/mariee-de-bretagne.gif": [400, 225], "img/portfolio/mosaic/ocytocine-museeconfluence.gif": [400, 470], "img/portfolio/mosaic/skeleton-double.gif": [400, 225]};
function azapPlayVideos(root) {
	var list = (root || document).querySelectorAll('video[autoplay]');
	for (var i = 0; i < list.length; i++) { list[i].muted = true; var pr = list[i].play(); if (pr && pr.catch) pr.catch(function(){}); }
}
function azapMedia(src, alt) {
	var d = AZAP_GIF_VIDEOS[src];
	if (!d) return '<img src="'+src+'" alt="'+alt+'" loading="lazy" />';
	return '<video autoplay muted loop playsinline preload="metadata" width="'+d[0]+'" height="'+d[1]+'" style="width:100%;height:auto;display:block" aria-label="'+alt+'"><source src="'+src.replace(/\.gif$/, '.webm')+'" type="video/webm"><source src="'+src.replace(/\.gif$/, '.mp4')+'" type="video/mp4"><img src="'+src+'" alt="'+alt+'" /></video>';
}

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
						+azapMedia(item.IMG, item.ALT_TXT)
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
	azapPlayVideos(x);
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
