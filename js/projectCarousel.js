(function () {
	'use strict';

	function text(value) {
		return value == null ? '' : String(value);
	}

	function videoEmbedUrl(url) {
		var value = text(url);
		var vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/);
		if (vimeo) return 'https://player.vimeo.com/video/' + vimeo[1] + '?title=0&byline=0&portrait=0&controls=1';
		var youtube = value.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&?/]+)/);
		if (youtube) return 'https://www.youtube.com/embed/' + youtube[1] + '?rel=0&controls=1';
		if (value.indexOf('youtube.com/embed/') !== -1) {
			return value.replace(/([?&])controls=0(?=&|$)/, '$1controls=1');
		}
		return value;
	}

	function element(tag, className, content) {
		var node = document.createElement(tag);
		if (className) node.className = className;
		if (content) node.textContent = content;
		return node;
	}

	function renderMedia(project) {
		var media = element('div', 'azap-project-media');
		if (project.VIDEO) {
			var ratio = element('div', 'embed-responsive embed-responsive-16by9');
			var iframe = document.createElement('iframe');
			iframe.src = videoEmbedUrl(project.VIDEO);
			iframe.title = project.TITLE || 'Vidéo du projet';
			iframe.loading = 'lazy';
			iframe.allow = 'autoplay; fullscreen; picture-in-picture';
			iframe.setAttribute('allowfullscreen', '');
			ratio.appendChild(iframe);
			media.appendChild(ratio);
			return media;
		}

		var gallery = project.GALLERY && project.GALLERY.length ? project.GALLERY : [project.IMG];
		var galleryNode = element('div', 'azap-project-case-gallery');
		var main = element('figure', 'azap-project-case-gallery-main');
		var mainImage = document.createElement('img');
		mainImage.src = gallery[0];
		mainImage.alt = project.ALT_TXT || project.TITLE || '';
		main.appendChild(mainImage);
		galleryNode.appendChild(main);
		if (gallery.length > 1) {
			var thumbs = element('div', 'azap-project-case-thumbs');
			gallery.forEach(function (src, index) {
				var button = element('button', index === 0 ? 'is-active' : '');
				button.type = 'button';
				button.setAttribute('aria-label', 'Afficher la photo ' + (index + 1) + ' du projet ' + project.TITLE);
				var image = document.createElement('img');
				image.src = src;
				image.alt = '';
				image.loading = index === 0 ? 'eager' : 'lazy';
				button.appendChild(image);
				button.addEventListener('click', function () {
					mainImage.src = src;
					Array.prototype.forEach.call(thumbs.children, function (item) { item.classList.remove('is-active'); });
					button.classList.add('is-active');
				});
				thumbs.appendChild(button);
			});
			galleryNode.appendChild(thumbs);
		}
		media.appendChild(galleryNode);
		return media;
	}

	function renderHeader(project) {
		var header = element('header', 'azap-project-header');
		header.appendChild(element('span', 'da-label', project.VIDEO ? 'Projet vidéo' : 'Projet en images'));
		header.appendChild(element('h3', '', project.TITLE + (project.CASE_TITLE ? ' — ' + project.CASE_TITLE : '')));

		var meta = element('div', 'azap-project-case-meta');
		[['Client', project.CLIENT], ['Date', project.DATE], ['Mon rôle', project.SKILL]].forEach(function (item) {
			if (!item[1]) return;
			var span = document.createElement('span');
			var strong = element('b', '', item[0] + ' : ');
			span.appendChild(strong);
			span.appendChild(document.createTextNode(item[1]));
			meta.appendChild(span);
		});
		header.appendChild(meta);
		return header;
	}

	function renderCopy(project) {
		var copy = element('div', 'azap-project-copy');
		var lead = project.CASE_LEAD || project.INFO || ('Une création en ' + (project.TYPE || 'motion design') + ' réalisée pour ' + (project.CLIENT || 'une campagne'));
		copy.appendChild(element('p', 'azap-project-case-lead', lead));
		var body = project.CASE_BODY && project.CASE_BODY.length ? project.CASE_BODY : (project.INFO2 ? [project.INFO2] : []);
		body.forEach(function (paragraph) { copy.appendChild(element('p', '', paragraph)); });

		if (project.CASE_FACTS && project.CASE_FACTS.length) {
			var facts = element('dl', 'azap-project-case-facts');
			project.CASE_FACTS.forEach(function (fact) {
				var wrap = document.createElement('div');
				wrap.appendChild(element('dt', '', fact.VALUE));
				wrap.appendChild(element('dd', '', fact.LABEL));
				facts.appendChild(wrap);
			});
			copy.appendChild(facts);
		}

		var impact = project.CASE_IMPACT || ('Une réalisation de ' + (project.TYPE || 'motion design') + ' pour ' + (project.CLIENT || 'une campagne audiovisuelle') + '.');
		copy.appendChild(element('p', 'azap-project-impact', impact));
		if ((project.CLASS || '').split(/\s+/).indexOf('trailer') !== -1) copy.appendChild(element('p', 'azap-project-format-note', 'Chaque bande-annonce existe aussi en déclinaison verticale 9:16 pour les réseaux sociaux.'));
		if (project.SOURCE_URL) {
			var source = element('p', 'azap-project-source', 'Photographies et informations de campagne : ');
			var link = element('a', '', project.SOURCE_LABEL || 'source');
			link.href = project.SOURCE_URL;
			link.target = '_blank';
			link.rel = 'noopener';
			source.appendChild(link);
			copy.appendChild(source);
		}
		return copy;
	}

	function renderGallery(project) {
		if (!project.GALLERY || !project.GALLERY.length) return null;
		var gallery = element('div', 'azap-project-editorial-gallery');
		var figure = document.createElement('figure');
		var image = document.createElement('img');
		var caption = element('figcaption');
		var index = 0;
		var update = function () { image.src = project.GALLERY[index]; image.alt = project.GALLERY_CAPTIONS && project.GALLERY_CAPTIONS[index] || project.TITLE; caption.textContent = project.GALLERY_CAPTIONS && project.GALLERY_CAPTIONS[index] || ''; };
		figure.appendChild(image); figure.appendChild(caption); gallery.appendChild(figure); update();
		if (project.GALLERY.length > 1) gallery._timer = setInterval(function () { index = (index + 1) % project.GALLERY.length; update(); }, 3000);
		return gallery;
	}

	document.addEventListener('DOMContentLoaded', function () {
		var carousel = document.querySelector('[data-project-carousel], #dooh-project-carousel');
		if (!carousel || typeof getArray !== 'function') return;
		var category = carousel.getAttribute('data-project-category') || 'digitalscreen';
		var projects = getArray().filter(function (item) {
			return item.VISIBLE === true && (item.CLASS || '').split(/\s+/).indexOf(category) !== -1;
		});
		if (typeof getShowcaseTitles === 'function') {
			var showcaseTitles = getShowcaseTitles()[category] || [];
			projects = projects.filter(function (item) { return showcaseTitles.indexOf(item.TITLE) !== -1; });
		}
		if (category === 'trailer') {
			projects.sort(function (a, b) {
				if (a.TITLE === 'Tesla Note') return -1;
				if (b.TITLE === 'Tesla Note') return 1;
				return 0;
			});
		}
		if (!projects.length) return;

		var caseNode = carousel.querySelector('.azap-project-case');
		var dotsNode = carousel.querySelector('.azap-project-dots');
		var previous = carousel.querySelector('.azap-project-prev');
		var next = carousel.querySelector('.azap-project-next');
		var position = carousel.querySelector('.azap-project-position');
		var requested = category === 'digitalscreen' ? new URLSearchParams(window.location.search).get('projet') : null;
		var current = Math.max(0, projects.findIndex(function (project) { return project.SLUG === requested; }));

		function render(index, updateUrl) {
			current = (index + projects.length) % projects.length;
			var project = projects[current];
			caseNode.className = 'azap-project-case ' + (project.VIDEO ? 'azap-project-case-video' : 'azap-project-case-images');
			caseNode.innerHTML = '';
			caseNode.appendChild(renderHeader(project));
			caseNode.appendChild(renderMedia(project));
			var copyNode = renderCopy(project);
			var gallery = project.NO_EDITORIAL_GALLERY ? null : renderGallery(project);
			if (gallery) copyNode.appendChild(gallery);
			caseNode.appendChild(copyNode);
			Array.prototype.forEach.call(dotsNode.children, function (dot, dotIndex) {
				dot.classList.toggle('is-active', dotIndex === current);
				dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
			});
			if (position) position.textContent = project.TITLE + ', projet ' + (current + 1) + ' sur ' + projects.length;
			if (updateUrl && window.history && project.SLUG) {
				var url = new URL(window.location.href);
				url.searchParams.set('projet', project.SLUG);
				url.hash = carousel.id || 'projets';
				window.history.replaceState({}, '', url.pathname + url.search + url.hash);
			}
		}

		projects.forEach(function (project, index) {
			var dot = element('button', 'azap-project-dot');
			dot.type = 'button';
			dot.setAttribute('aria-label', 'Afficher le projet ' + project.TITLE);
			dot.title = project.TITLE;
			dot.addEventListener('click', function () { render(index, true); });
			dotsNode.appendChild(dot);
		});
		previous.addEventListener('click', function () { render(current - 1, true); });
		next.addEventListener('click', function () { render(current + 1, true); });
		carousel.addEventListener('keydown', function (event) {
			if (event.key === 'ArrowLeft') { event.preventDefault(); render(current - 1, true); }
			if (event.key === 'ArrowRight') { event.preventDefault(); render(current + 1, true); }
		});
		render(current, false);
	});
}());
