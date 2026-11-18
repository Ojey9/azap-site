(function () {
	'use strict';
	var games = document.querySelectorAll('.azap-runner');
	if (!games.length) return;

	Array.prototype.forEach.call(games, function (root) {
		var canvas = root.querySelector('canvas');
		var context = canvas.getContext('2d');
		var startButton = root.querySelector('.azap-runner-start');
		var scoreNode = root.querySelector('.azap-runner-score');
		var recordNode = root.querySelector('.azap-runner-record');
		var progressNode = root.querySelector('.azap-runner-progress');
		var progressFill = root.querySelector('.azap-runner-progress-fill');
		var trailerCta = root.querySelector('.azap-runner-cta');
		var statusNode = root.querySelector('.azap-runner-status');
		var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		var running = false;
		var crashed = false;
		var lastTime = 0;
		var elapsed = 0;
		var score = 0;
		var speed = 310;
		var spawnIn = 1.2;
		var pickupIn = 1.8;
		var ground = 0;
		var width = 0;
		var height = 0;
		var obstacles = [];
		var pickups = [];
		var trailerProgress = 0;
		var ingredientIndex = 0;
		var ingredients = ['PLANCHES', 'STORYBOARD', 'MOTION', 'SOUND', 'PACKSHOT'];
		var constraints = ['DEADLINE', 'EXPORT', 'FORMAT', 'SPOILER'];
		var hero = { x: 72, y: 0, width: 52, height: 72, velocity: 0 };
		var record = 0;
		try { record = parseInt(localStorage.getItem('azapRunnerRecord') || '0', 10); } catch (error) {}
		recordNode.textContent = record;

		function resize() {
			var rect = canvas.getBoundingClientRect();
			var ratio = Math.min(window.devicePixelRatio || 1, 2);
			width = Math.max(280, Math.round(rect.width));
			height = Math.max(240, Math.round(rect.height));
			canvas.width = Math.round(width * ratio);
			canvas.height = Math.round(height * ratio);
			context.setTransform(ratio, 0, 0, ratio, 0, 0);
			ground = height - 45;
			if (!running) hero.y = ground - hero.height;
			draw();
		}

		function reset() {
			obstacles = [];
			pickups = [];
			score = 0;
			trailerProgress = 0;
			ingredientIndex = 0;
			speed = reducedMotion ? 255 : 310;
			spawnIn = 1.15;
			pickupIn = 1.7;
			elapsed = 0;
			hero.y = ground - hero.height;
			hero.velocity = 0;
			crashed = false;
			scoreNode.textContent = '0';
			progressNode.textContent = '0 %';
			progressFill.style.width = '0%';
			if (trailerCta) trailerCta.hidden = true;
			statusNode.textContent = 'Récupérez les ingrédients du trailer et évitez les contraintes.';
		}

		function start() {
			reset();
			running = true;
			lastTime = performance.now();
			startButton.textContent = 'Recommencer';
			canvas.focus();
			requestAnimationFrame(loop);
		}

		function jump(event) {
			if (event && event.type === 'keydown' && [' ', 'ArrowUp'].indexOf(event.key) === -1) return;
			if (event) event.preventDefault();
			if (!running) { start(); return; }
			if (hero.y >= ground - hero.height - 2) hero.velocity = reducedMotion ? -590 : -680;
		}

		function spawnObstacle() {
			var tall = Math.random() > .7;
			obstacles.push({ x: width + 20, width: tall ? 45 : 62, height: tall ? 78 : 50, label: constraints[Math.floor(Math.random() * constraints.length)] });
			spawnIn = Math.max(.72, 1.45 - speed / 850) + Math.random() * .75;
		}

		function spawnPickup() {
			pickups.push({ x: width + 30, y: ground - 112 - Math.random() * 55, width: 42, height: 48, label: ingredients[ingredientIndex % ingredients.length] });
			ingredientIndex++;
			pickupIn = 2.2 + Math.random() * 1.35;
		}

		function collision(a, obstacle) {
			var padding = 7;
			return a.x + padding < obstacle.x + obstacle.width && a.x + a.width - padding > obstacle.x && a.y + padding < ground && a.y + a.height - padding > ground - obstacle.height;
		}

		function collect(a, item) {
			var padding = 5;
			return a.x + padding < item.x + item.width && a.x + a.width - padding > item.x && a.y + padding < item.y + item.height && a.y + a.height - padding > item.y;
		}

		function endGame() {
			running = false;
			crashed = true;
			if (score > record) {
				record = score;
				recordNode.textContent = record;
				try { localStorage.setItem('azapRunnerRecord', String(record)); } catch (error) {}
				statusNode.textContent = 'Nouveau record ! Cliquez pour repartir.';
			} else {
				statusNode.textContent = 'Aïe ! Cliquez pour retenter votre chance.';
			}
			draw();
		}

		function update(delta) {
			elapsed += delta;
			score = Math.floor(elapsed * 10);
			scoreNode.textContent = score;
			speed = Math.min(650, speed + delta * 5.5);
			hero.velocity += 1750 * delta;
			hero.y += hero.velocity * delta;
			if (hero.y > ground - hero.height) { hero.y = ground - hero.height; hero.velocity = 0; }
			spawnIn -= delta;
			if (spawnIn <= 0) spawnObstacle();
			pickupIn -= delta;
			if (pickupIn <= 0) spawnPickup();
			obstacles.forEach(function (obstacle) { obstacle.x -= speed * delta; });
			pickups.forEach(function (item) { item.x -= speed * delta; });
			obstacles = obstacles.filter(function (obstacle) { return obstacle.x + obstacle.width > -20; });
			pickups = pickups.filter(function (item) {
				if (collect(hero, item)) {
					trailerProgress = Math.min(100, trailerProgress + 20);
					progressNode.textContent = trailerProgress + ' %';
					progressFill.style.width = trailerProgress + '%';
					statusNode.textContent = item.label + ' récupéré' + (item.label === 'PLANCHES' ? 'es' : '') + ' — le trailer prend vie.';
					if (trailerProgress === 100 && trailerCta) {
						statusNode.textContent = 'Votre manga est prêt à prendre vie !';
						trailerCta.hidden = false;
					}
					return false;
				}
				return item.x + item.width > -20;
			});
			for (var i = 0; i < obstacles.length; i++) if (collision(hero, obstacles[i])) { endGame(); return; }
		}

		function drawHero() {
			context.save();
			context.translate(hero.x, hero.y);
			if (crashed) context.rotate(-.12);
			var stride = running && hero.y >= ground - hero.height - 2 ? Math.sin(elapsed * 18) * 7 : 0;
			context.strokeStyle = '#f7fbff'; context.lineWidth = 7; context.lineCap = 'round';
			context.beginPath(); context.moveTo(23, 51); context.lineTo(14 + stride, 69); context.moveTo(29, 51); context.lineTo(39 - stride, 69); context.stroke();
			context.fillStyle = '#157bdb'; context.strokeStyle = '#061c34'; context.lineWidth = 3;
			context.beginPath(); context.moveTo(12, 32); context.lineTo(39, 29); context.lineTo(43, 57); context.lineTo(15, 58); context.closePath(); context.fill(); context.stroke();
			context.fillStyle = '#f7fbff'; context.beginPath(); context.arc(25, 20, 14, 0, Math.PI * 2); context.fill(); context.stroke();
			context.fillStyle = '#061c34'; context.beginPath(); context.moveTo(10, 18); context.lineTo(5, 5); context.lineTo(17, 10); context.lineTo(23, 0); context.lineTo(29, 10); context.lineTo(43, 6); context.lineTo(39, 21); context.closePath(); context.fill();
			context.fillRect(18, 19, 3, 5); context.fillRect(30, 19, 3, 5);
			context.strokeStyle = '#f7fbff'; context.lineWidth = 6; context.beginPath(); context.moveTo(14, 38); context.lineTo(2, 50); context.stroke();
			context.fillStyle = '#fff'; context.strokeStyle = '#157bdb'; context.lineWidth = 3; context.fillRect(32, 35, 20, 27); context.strokeRect(32, 35, 20, 27);
			context.fillStyle = '#061c34'; context.font = '700 7px Arial'; context.textAlign = 'center'; context.fillText('MANGA', 42, 50);
			context.strokeStyle = '#157bdb'; context.lineWidth = 3; context.beginPath(); context.moveTo(13, 33); context.lineTo(-5, 26); context.lineTo(5, 40); context.stroke();
			context.restore();
		}

		function draw() {
			context.clearRect(0, 0, width, height);
			context.fillStyle = '#07131f'; context.fillRect(0, 0, width, height);
			context.fillStyle = '#0b2136';
			for (var building = -((elapsed * speed * .07) % 170); building < width; building += 170) { context.fillRect(building, ground - 155, 125, 155); context.fillStyle = '#157bdb'; context.fillRect(building + 18, ground - 128, 18, 24); context.fillRect(building + 55, ground - 128, 18, 24); context.fillRect(building + 92, ground - 128, 18, 24); context.fillStyle = '#0b2136'; }
			context.fillStyle = 'rgba(21,123,219,.3)';
			for (var x = 16; x < width; x += 28) for (var y = 18; y < ground - 25; y += 28) { context.beginPath(); context.arc(x, y, 1.2, 0, Math.PI * 2); context.fill(); }
			context.strokeStyle = '#157bdb'; context.lineWidth = 3; context.beginPath(); context.moveTo(0, ground); context.lineTo(width, ground); context.stroke();
			context.strokeStyle = '#4a91d1'; context.lineWidth = 2;
			for (var line = -((elapsed * speed * .35) % 32); line < width; line += 32) { context.beginPath(); context.moveTo(line, ground + 12); context.lineTo(line + 14, ground + 12); context.stroke(); }
			obstacles.forEach(function (obstacle) {
				context.fillStyle = '#fff'; context.fillRect(obstacle.x, ground - obstacle.height, obstacle.width, obstacle.height);
				context.strokeStyle = '#157bdb'; context.lineWidth = 4; context.strokeRect(obstacle.x, ground - obstacle.height, obstacle.width, obstacle.height);
				context.fillStyle = '#07131f'; context.font = '700 9px Arial'; context.textAlign = 'center'; context.fillText(obstacle.label, obstacle.x + obstacle.width / 2, ground - obstacle.height / 2 + 3);
			});
			pickups.forEach(function (item) {
				context.save(); context.translate(item.x, item.y + Math.sin(elapsed * 5 + item.x) * 4);
				context.fillStyle = '#157bdb'; context.strokeStyle = '#fff'; context.lineWidth = 3; context.fillRect(3, 0, 36, 44); context.strokeRect(3, 0, 36, 44);
				context.strokeStyle = '#9fd0ff'; context.beginPath(); context.moveTo(9, 9); context.lineTo(32, 9); context.moveTo(9, 15); context.lineTo(28, 15); context.stroke();
				context.fillStyle = '#fff'; context.font = '700 7px Arial'; context.textAlign = 'center'; context.fillText(item.label, 21, 31); context.restore();
			});
			drawHero();
		}

		function loop(time) {
			if (!running) return;
			var delta = Math.min((time - lastTime) / 1000, .035);
			lastTime = time;
			update(delta);
			draw();
			if (running) requestAnimationFrame(loop);
		}

		startButton.addEventListener('click', start);
		canvas.addEventListener('pointerdown', jump);
		canvas.addEventListener('keydown', jump);
		window.addEventListener('resize', resize);
		resize();
	});
}());
