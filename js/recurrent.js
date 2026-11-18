jQuery(document).ready(function($) {
	var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	$('.azap-category-slideshow').each(function() {
		var slideshow = this;
		var category = slideshow.getAttribute('data-portfolio-category');
		var featuredSlides = category === 'digitalscreen' ? [
			{ IMG: 'img/blog/devialet-fnac.jpg', ALT_TXT: 'Motion design DOOH Devialet sur écrans Fnac', TITLE: 'Devialet — écrans Fnac' },
			{ IMG: 'img/blog/devialet-shanghai-ifc-phantom.webp', ALT_TXT: 'Campagne Devialet Phantom diffusée sur un écran panoramique au Shanghai IFC Mall', TITLE: 'Devialet Phantom — Shanghai IFC Mall' },
			{ IMG: 'img/blog/devialet-shanghai-ifc-gemini.webp', ALT_TXT: 'Campagne Devialet Gemini diffusée sur un écran panoramique au Shanghai IFC Mall', TITLE: 'Devialet Gemini — Shanghai IFC Mall' },
			{ IMG: 'img/blog/e-208-Peugeot-video.jpg', ALT_TXT: 'Campagne DOOH Peugeot e-208', TITLE: 'Peugeot e-208 — écrans digitaux' },
			{ IMG: 'img/blog/laposte-dooh.jpg', ALT_TXT: 'Campagne La Poste en affichage digital', TITLE: 'La Poste — affichage digital' },
			{ IMG: 'img/blog/360-salon.jpg', ALT_TXT: 'Création pour écran 360 degrés au salon Porte de Versailles', TITLE: 'Écran 360° — Porte de Versailles' }
		] : [];
		var categoryProjects = typeof getArray === 'function' ? getArray().filter(function(item) {
			return item.VISIBLE === true && (item.CLASS || '').split(/\s+/).indexOf(category) !== -1 && item.IMG;
		}) : [];
		var usedImages = {};
		var projects = featuredSlides.concat(categoryProjects).filter(function(item) {
			if (usedImages[item.IMG]) return false;
			usedImages[item.IMG] = true;
			return true;
		}).slice(0, 8);
		if (!projects.length) {
			slideshow.style.display = 'none';
			return;
		}
		projects.forEach(function(project, index) {
			var figure = document.createElement('figure');
			figure.className = 'azap-category-slide' + (index === 0 ? ' is-active' : '');
			var image = document.createElement('img');
			image.src = project.IMG;
			image.alt = project.ALT_TXT || project.TITLE || '';
			image.loading = index === 0 ? 'eager' : 'lazy';
			var caption = document.createElement('figcaption');
			caption.textContent = project.TITLE || '';
			figure.appendChild(image);
			figure.appendChild(caption);
			slideshow.appendChild(figure);
		});
		if (projects.length > 1 && !reduceMotion) {
			var current = 0;
			var timer = null;
			function nextSlide() {
				var slides = slideshow.querySelectorAll('.azap-category-slide');
				slides[current].classList.remove('is-active');
				current = (current + 1) % slides.length;
				slides[current].classList.add('is-active');
			}
			function play() { if (!timer) timer = window.setInterval(nextSlide, 4000); }
			function pause() { window.clearInterval(timer); timer = null; }
			play();
			slideshow.addEventListener('mouseenter', pause);
			slideshow.addEventListener('mouseleave', play);
			document.addEventListener('visibilitychange', function() { document.hidden ? pause() : play(); });
		}
	});
	var revealTargets = document.querySelectorAll('main .basic-breadcrumb h2, main .azap-service-intro, main .azap-card, main .da-panel, main .da-faq details, main .portfolio-item');
	if (!reduceMotion && 'IntersectionObserver' in window) {
		var revealObserver = new IntersectionObserver(function(entries) {
			entries.forEach(function(entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('azap-visible');
					revealObserver.unobserve(entry.target);
				}
			});
		}, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
		Array.prototype.forEach.call(revealTargets, function(target, index) {
			target.classList.add('azap-reveal');
			target.style.setProperty('--azap-delay', ((index % 3) * 70) + 'ms');
			revealObserver.observe(target);
		});
	} else {
		Array.prototype.forEach.call(revealTargets, function(target) { target.classList.add('azap-visible'); });
	}

	if (!reduceMotion && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
		$('.portfolio-wrapper').on('pointermove', function(event) {
			var rect = this.getBoundingClientRect();
			var rotateY = ((event.clientX - rect.left) / rect.width - .5) * 3;
			var rotateX = -((event.clientY - rect.top) / rect.height - .5) * 3;
			$(this).find('.portfolio-thumb').css('transform', 'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)');
		}).on('pointerleave', function() {
			$(this).find('.portfolio-thumb').css('transform', '');
		});
	}

	var formatStage = document.getElementById('azap-format-stage');
	if (formatStage) {
		var result = document.getElementById('azap-game-result');
		var draggables = formatStage.querySelectorAll('.azap-draggable');
		var activeDrag = null;
		var dragOffsetX = 0;
		var dragOffsetY = 0;

		function moveDrag(event) {
			if (!activeDrag) return;
			var stageRect = formatStage.getBoundingClientRect();
			var itemRect = activeDrag.getBoundingClientRect();
			var left = Math.max(0, Math.min(stageRect.width - itemRect.width, event.clientX - stageRect.left - dragOffsetX));
			var top = Math.max(0, Math.min(stageRect.height - itemRect.height, event.clientY - stageRect.top - dragOffsetY));
			activeDrag.style.left = (left / stageRect.width * 100) + '%';
			activeDrag.style.top = (top / stageRect.height * 100) + '%';
		}

		Array.prototype.forEach.call(draggables, function(item) {
			item.addEventListener('keydown', function(event) {
				if ([37, 38, 39, 40].indexOf(event.keyCode) === -1) return;
				event.preventDefault();
				var stageRect = formatStage.getBoundingClientRect();
				var itemRect = item.getBoundingClientRect();
				var step = event.shiftKey ? 10 : 3;
				var left = (itemRect.left - stageRect.left) / stageRect.width * 100;
				var top = (itemRect.top - stageRect.top) / stageRect.height * 100;
				if (event.keyCode === 37) left -= step;
				if (event.keyCode === 39) left += step;
				if (event.keyCode === 38) top -= step;
				if (event.keyCode === 40) top += step;
				item.style.left = Math.max(0, Math.min(100 - itemRect.width / stageRect.width * 100, left)) + '%';
				item.style.top = Math.max(0, Math.min(100 - itemRect.height / stageRect.height * 100, top)) + '%';
				formatStage.classList.remove('show-zones');
			});
			item.addEventListener('pointerdown', function(event) {
				activeDrag = item;
				var itemRect = item.getBoundingClientRect();
				dragOffsetX = event.clientX - itemRect.left;
				dragOffsetY = event.clientY - itemRect.top;
				item.setPointerCapture(event.pointerId);
				formatStage.classList.remove('show-zones');
				result.className = 'azap-game-result';
				result.textContent = 'Continuez, puis vérifiez votre composition.';
			});
			item.addEventListener('pointermove', moveDrag);
			item.addEventListener('pointerup', function(event) {
				if (activeDrag === item) {
					item.releasePointerCapture(event.pointerId);
					activeDrag = null;
				}
			});
			item.addEventListener('pointercancel', function() { activeDrag = null; });
		});

		$('.azap-ratio-buttons button').on('click', function() {
			$('.azap-ratio-buttons button').removeClass('active').attr('aria-pressed', 'false');
			$(this).addClass('active').attr('aria-pressed', 'true');
			formatStage.className = 'azap-format-stage ratio-' + $(this).data('ratio');
			result.className = 'azap-game-result';
			result.textContent = 'Le cadre change : vérifiez à nouveau la position de chaque élément.';
		});

		function overlap(a, b) {
			return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
		}

		$('#azap-check-zones').on('click', function() {
			formatStage.classList.add('show-zones');
			var zones = formatStage.querySelectorAll('.azap-danger-zone');
			var errors = 0;
			Array.prototype.forEach.call(draggables, function(item) {
				var itemRect = item.getBoundingClientRect();
				var unsafe = Array.prototype.some.call(zones, function(zone) { return overlap(itemRect, zone.getBoundingClientRect()); });
				item.classList.toggle('is-unsafe', unsafe);
				if (unsafe) errors++;
			});
			var score = Math.max(10, 100 - errors * 30);
			if (!errors) {
				result.className = 'azap-game-result is-success';
				result.textContent = '100 % — Parfait ! Tous les éléments restent visibles.';
			} else {
				result.className = 'azap-game-result is-warning';
				result.textContent = score + ' % — ' + errors + (errors > 1 ? ' éléments risquent' : ' élément risque') + ' d’être masqué' + (errors > 1 ? 's' : '') + ' par l’interface.';
			}
		});

		$('#azap-reset-zones').on('click', function() {
			formatStage.classList.remove('show-zones');
			Array.prototype.forEach.call(draggables, function(item) {
				item.style.left = item.getAttribute('data-start-x') + '%';
				item.style.top = item.getAttribute('data-start-y') + '%';
				item.classList.remove('is-unsafe');
			});
			result.className = 'azap-game-result';
			result.textContent = 'Glissez les trois éléments pour composer votre publicité.';
		});
	}

	var makingCarousel = $('#ocy-making-carousel');
	if (makingCarousel.length) {
		makingCarousel.attr('data-interval', '4000');
		makingCarousel.carousel({ interval: 4000 });
	}

	if (window.location.hostname !== 'www.azap.cool' && window.location.hostname !== 'azap.cool') {
		$('form[action="mail.php"]').on('submit', function(event) {
			event.preventDefault();
			$('.ajax-response').text('Formulaire désactivé sur la version de prévisualisation.');
		});
	}
			
	$('#header').load('header.html', function () {
		var mobileNav = $('#mobile-nav');
		var mobileMenu = $('.basic-mobile-menu');
		if (mobileNav.length && !mobileMenu.find('.mean-bar').length) {
			mobileNav.meanmenu({
				meanMenuContainer: '.basic-mobile-menu',
				meanScreenWidth: '767'
			});
			var reveal = mobileMenu.find('.meanmenu-reveal');
			reveal.attr({ 'aria-label': 'Ouvrir le menu', 'aria-expanded': 'false' });
			mobileMenu.on('click', '.meanmenu-reveal', function () {
				var button = $(this);
				window.setTimeout(function () {
					var open = button.hasClass('meanclose');
					button.attr('aria-expanded', open ? 'true' : 'false');
					button.attr('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
				}, 0);
			});
			mobileMenu.on('click', '.meanmenu-reveal, .mean-expand', function () {
				$('.header-area').removeClass('headroom--unpinned').addClass('headroom--pinned');
			});
		}

		var myElement = document.querySelector('.headroom');
		if (myElement && window.matchMedia('(min-width: 768px)').matches) {
			var headroom = new Headroom(myElement, { offset: 80, tolerance: { up: 8, down: 8 } });
			headroom.init();
		}
	});
	$('#footer').load('footer.html', function () {
		console.log('footer.html loaded')
	});
})
