var currentUrl = location.href;
browser.runtime.onMessage.addListener(request => {
	//console.log("Message from the background script:");
	console.log('request from extension', request);
	
	switch (request.type) {
		case 'show':
			var query = getShowTitle();
			console.log(query);
			return Promise.resolve({'valid': true, 'show': query});
			break;
		case 'possibleUrlChange':
			var same = currentUrl == location.href;
			console.log('urlchange?', !same, currentUrl, location.href);
			currentUrl = location.href;
			if (!same) {
				startUp();
			}
			break;
	}
});

// console.time('five');
console.log(document.querySelector('video'))
// console.trace();
var initTimer;
function startUp() {
	console.log('and...');
	clearInterval(initTimer);
	initTimer = setTimeout(function() {
		// console.timeEnd('five');
		if (testIfShow()) {
			if (readyToGo()) {
				console.log('lets go');
				console.log('is show', document.querySelector('video'));
				if (document.querySelector('#ozsrel')) {
					console.log(document.querySelector('#ozsrel'));
					document.querySelector('#ozsrel').parentNode.removeChild(document.querySelector('#ozsrel'));
				}
				var vid = document.querySelector('video');
				console.log(vid);
				vid.removeEventListener('play', pressedPlay);
				vid.removeEventListener('pause', pressedPause);
				console.log('hello');
				initScrobble();
				console.log('hello');
				scrobblePopup();
				console.log('hello');
				// browser.runtime.sendMessage({'type': 'pause'})
				// .then(function (msg, sender, sendresponse) {
					// console.log('response from bg', arguments)
					//needs to send a whole new message after the response from the background script
				// });
			} else {
				console.log('not ready yet, another ten');
				setTimeout(startUp, 10000)
			}
		}
	}, 10000);
}
startUp();




var qS;
function scrobblePopup() {
	console.log('scrobblePopup');
	// console.trace();
	var el = document.querySelector('video').parentElement.nodeName.toLowerCase();
	// document.querySelector('video').classList.add('ozsvid')
	var st = document.createElement('style');
	st.textContent = el + ':hover > #ozsrel { opacity: 0.2; }'
	document.head.appendChild(st);

	var ozsouter = document.createElement('div');
	ozsouter.id = 'ozsrel';
	var vid = document.querySelector('video');
	vid.parentNode.insertBefore(ozsouter, vid);
	console.log(vid, vid.parentNode);

	// var ozsouter = document.querySelector('#ozsrel')
	ozsouter.attachShadow({mode: 'open'});
	ozsouter.shadowRoot.innerHTML = `<style>@import '${browser.runtime.getURL("inject/shadow.css")}'</style>
	<div id="ozsouter">
		<img src="${browser.runtime.getURL('icons/icon38.png')}" id="ozsicon">
		<div id="ozsmenu">
			<h3><span id="ozsshowtitle">Loading...</span> <span id="ozsepnum"></span></h3>
			<h3><span id="ozseptitle"></span></h3>
			<h3 id="ozserror">Episode Titles Don't Match</h3>
			<section id="ozsselectshows" class="hide">
				<h3>Select the right show:</h3>
				<select id="sel" name="show">
					<!--<option value="thank-god-you-re-here-2008">Thank God You're Here</option>
					<option value="thank-god-you-re-here-au">Thank God You're Here (AU)</option>
					<option value="thank-god-you-re-here-us">Thank God You're Here (US)</option>-->
				</select>
				<button id="ozsbtn">Select</button>
			</section>
			<h3 id="ozscancel" class=""><button>Cancel Scrobbling This Episode</button></h3>
		</div>
	</div>`;
	if (getService() == 'sbs') {
		var extra = document.createElement('style');
		extra.textContent = '#ozsouter { top: -85vh !important; }';
		ozsouter.shadowRoot.appendChild(extra);
	}
	ozsouter.shadowRoot.querySelector('#ozsbtn').addEventListener('click', function() {
		console.log('initial click')
		setTimeout(function() {
			document.querySelector('video').focus()
		}, 500)
	});
	qS = ozsouter.shadowRoot.querySelector.bind(ozsouter.shadowRoot);

	qS('#ozscancel').addEventListener('click', removeFromPage);

}

function initScrobble() {
	// console.trace();
	console.log('page', title);
	var title = getShowTitle();
	console.log('page', title);

	var hasPattern = urlPatternExists();
	var searchMsg = {
		'type': 'searchShow',
		'query': title,
		'hasPattern': hasPattern
	};
	if (hasPattern) {
		searchMsg['pattern'] = getUrlPattern();
	}
	console.log(searchMsg);
	browser.runtime.sendMessage(searchMsg).then(function(msg){
		console.log(msg);
		console.log(qS('#sel'));
		switch (msg.type) {
			case 'multipleShows':
				var list = msg.shows;
				var years = msg.years;
				var select = qS('#sel');
				var listkeys = Object.keys(list);
				for (var slug of listkeys) {
					var opt = document.createElement('option');
					opt.value = slug;
					opt.innerText = list[slug] + ' ' + years[slug];
					select.appendChild(opt);
					console.log(select, opt);
				}
				var box = qS('#ozsselectshows');
				box.classList.remove('hide');
				console.log(list);
				
				var btn = qS('#ozsbtn');
				btn.addEventListener('click', function() {
					var slug = select.value;
					box.classList.add('hide');
					var showTitle = select.options[select.selectedIndex].text;
					// qS('#ozsshowtitle').textContent = showTitle;
					//send message
					// console.trace();
					var hasPattern = urlPatternExists();
					var chosenMsg = {
						'type':'chosenShow',
						'show': slug,
						'showTitle': showTitle,
						'hasPattern': hasPattern
					};
					if (hasPattern) {
						chosenMsg['pattern'] = getUrlPattern();
					}
					console.log(chosenMsg);
					browser.runtime.sendMessage(chosenMsg).then(titleEpisode);
				});
				// return true;
				break;
			case 'episode':
				titleEpisode(msg);
				break;
			case 'noFoundShows':
				// document.querySelector('#ozsrel').style.display = 'none';
				qS('#ozsshowtitle').textContent = 'Could not find a show on the current page. Use extension popup to search for show';
				break;
		}
	})
}

function titleEpisode(epMsg) {
	// console.trace();
	console.log('titling episode', epMsg);
	//qS('#ozsmenu').classList.remove('wrongEpisode');
	// qS('#ozsshowtitle').textContent = epMsg['showTitle'];
	// qS('#ozsepnum').textContent = epMsg['epPos'] + ': ';
	// qS('#ozseptitle').textContent = epMsg['epTitle'];
	reTitleEpisode(epMsg);

	//search for episode
	checkEpisodeMatches(epMsg['epTitle'], epMsg['epPos'])
	.then(function(check){
		if (check['matches']) {
			document.querySelector('video').addEventListener('timeupdate', throttledVideoProgress);
			console.log('episode matches', qS('#ozscancel'))
			qS('#ozsmenu').classList.remove('wrongEpisode');
			//give an option to not scrobble?
			//qS('#ozscancel').classList.remove('hide');
			qS('#ozscancel').addEventListener('click', cancelScrobble);
		} else {
			if (check['epTitle']) {
				console.log('starting titling again with correct episode');
				//start titling again?
				titleEpisode(check);
			} else {
				qS('#ozsmenu').classList.add('wrongEpisode');
			}
		}
	})

	// qS('#ozseptitle').addEventListener('click', )
	
	
	// vid.play();
	// vid.pause();
}
function reTitleEpisode(epMsg) {
	//console.log('titling episode again', epMsg);
	console.log('setting values', qS('#ozsmenu').classList)
	qS('#ozsmenu').classList.remove('wrongEpisode');
	qS('#ozsshowtitle').textContent = epMsg['showTitle'];
	qS('#ozsepnum').textContent = epMsg['epPos'] + ': ';
	qS('#ozseptitle').textContent = epMsg['epTitle'];
}

var videoProgress = function(){
	var vid = document.querySelector('video');
	var prog = (100 * vid.currentTime / vid.duration).toFixed(2);
	console.log(prog);
	if (handholdingNeeded()) {
		vid.removeEventListener('timeupdate', throttledVideoProgress);
		vid.addEventListener('timeupdate', throttledVideoProgress);
	}
	if (prog > 85) {
		scrobbleEvent(prog, 'stop');
		vid.removeEventListener('timeupdate', throttledVideoProgress);
		vid.removeEventListener('play', pressedPlay);
		vid.removeEventListener('pause', pressedPlay);
	} else if (prog > 10) {
		//vid.removeEventListener('timeupdate', throttledVideoProgress);
		// console.log('removed timeupdate listener')
		console.log('started playing episode');
		scrobbleEvent(prog, 'play');
		vid.addEventListener('play', pressedPlay);
		vid.addEventListener('pause', pressedPause);
		document.addEventListener('beforeunload', pressedPause);
	}

	
}

var throttledVideoProgress = function() {
	// console.log('throttled');
	throttle(videoProgress, 15000);
}

function pressedPause() {
	var vid = document.querySelector('video');
	var prog = (100 * vid.currentTime / vid.duration).toFixed(2);
	
	
	if (prog > 85) {
		vid.removeEventListener('timeupdate', throttledVideoProgress);
		vid.removeEventListener('play', pressedPlay);
		vid.removeEventListener('pause', pressedPlay);
		// vid.removeEventListener('pause', pressedPause);
		console.log('greater than 85% played', prog)
		scrobbleEvent(prog, 'stop');
	} else {
		console.log('pause', prog);
		scrobbleEvent(prog, 'pause');
		setTimeout(function(){
			scrobbleEvent(prog, 'pause');
		}, 14000);
	}
}
function pressedPlay() {
	var vid = document.querySelector('video');
	var prog = (100 * vid.currentTime / vid.duration).toFixed(2);
	console.log('play', prog);
	scrobbleEvent(prog, 'play');
}


function scrobbleEvent(progress, event) {
	var msg = {
		'type': event,
		'progress': progress
	};
	browser.runtime.sendMessage(msg)
	.then(console.log);
}


function checkEpisodeMatches(traktTitle, traktPos) {
	var localTitleExists = episodeTitleExists();
	var numberingExists = episodeNumberingExists();
	var localTitle = localTitleExists ? getEpisodeTitle() : traktTitle;
	console.log(localTitle, traktTitle, compareTwoStrings(localTitle, traktTitle));
	if (localTitleExists && compareTwoStrings(localTitle, traktTitle) > 0.7) {
		console.log('no further searches needed');
		return Promise.resolve({'matches': true})
	} else if (numberingExists) {
		console.log('search by numbering');
		var numbering = getEpisodeNumbering();
		return searchByNumbering(numbering, traktPos);
	} else if (localTitleExists) {
		console.log('search by name');
		//background script search
		return searchForEpisode(localTitle);
	} else {
		//if there's no way to search the episode (which there shouldn't be), then assume it's the correct episode
		return Promise.resolve({'matches':false});
	}
	
	
}

function searchForEpisode(localTitle) {
	qS('#ozsmenu').classList.add('wrongEpisode');
	console.log('search', localTitle);
	return browser.runtime.sendMessage({
		'type': 'searchEpisode',
		'episodeTitle': localTitle
	}).then(function(epMsg){
		console.log('search returned', epMsg);
		if (epMsg.type == 'foundEpisode') {
			//qS('#ozsmenu').classList.remove('wrongEpisode');
			epMsg['matches'] = false;
			return Promise.resolve(epMsg);
			//update episode details
			// document.querySelector('video').addEventListener('timeupdate', throttledVideoProgress);
			// qS('#ozsmenu').classList.remove('wrongEpisode');
			// qS('#ozsepnum').textContent = epMsg['epPos'] + ': ';
			// qS('#ozseptitle').textContent = epMsg['epTitle'];
			// return Promise.resolve(true);
		} else {
			//not found
			return Promise.resolve({'matches': false});
		}
	})
}
function searchByNumbering(numbers, traktPos) {
	qS('#ozsmenu').classList.add('wrongEpisode');
	console.log('search numbers', numbers);
	return browser.runtime.sendMessage({
		'type': 'searchEpisodeByNumber',
		'episodeNumbering': numbers
	}).then(function(epMsg){
		console.log(epMsg);
		if (epMsg.type == 'foundEpisode') {
			if (epMsg['epPos'] != traktPos) {
				epMsg['matches'] = false;
			} else {
				epMsg['matches'] = true;
			}
			// qS('#ozsmenu').classList.remove('wrongEpisode');
			return Promise.resolve(epMsg);

			// document.querySelector('video').addEventListener('timeupdate', throttledVideoProgress);
			// qS('#ozsmenu').classList.remove('wrongEpisode');
			// qS('#ozsepnum').textContent = epMsg['epPos'] + ': ';
			// qS('#ozseptitle').textContent = epMsg['epTitle'];
		} else {
			console.log(epMsg);
			return Promise.resolve({'matches': false});
		}
	});
}

function removeFromPage() {
	console.log('removing from page');
	var vid = document.querySelector('video')
	vid.removeEventListener('timeupdate', throttledVideoProgress);
	vid.removeEventListener('play', pressedPlay);
	vid.removeEventListener('pause', pressedPlay);
	document.querySelector('#ozsrel').parentNode.removeChild(document.querySelector('#ozsrel'));
	setTimeout(function(){
		vid.removeEventListener('timeupdate', throttledVideoProgress);
	}, 17000);
}
function cancelScrobble() {
	console.log('cancelling scrobble');
	var vid = document.querySelector('video')
	vid.removeEventListener('timeupdate', throttledVideoProgress);
	vid.removeEventListener('play', pressedPlay);
	vid.removeEventListener('pause', pressedPlay);
	scrobbleEvent(0, 'pause');
	setTimeout(function(){
		vid.removeEventListener('timeupdate', throttledVideoProgress);
		scrobbleEvent(0, 'pause');
	}, 17000);
	document.querySelector('#ozsrel').parentNode.removeChild(document.querySelector('#ozsrel'));
}

//from https://www.telerik.com/blogs/debouncing-and-throttling-in-javascript
var timerId;
var throttle = function(func, delay) {
	if (timerId) {
		return;
	}
	timerId = setTimeout(function() {
		func();
		timerId = undefined;
	}, delay);
}

//https://github.com/aceakash/string-similarity is MIT licensed, everything else (above this) is GPLv3
function compareTwoStrings(first, second) {
	first = first.replace(/\s+/g, '')
	second = second.replace(/\s+/g, '')

	if (!first.length && !second.length) return 1;                   // if both are empty strings
	if (!first.length || !second.length) return 0;                   // if only one is empty string
	if (first === second) return 1;       							 // identical
	if (first.length === 1 && second.length === 1) return 0;         // both are 1-letter strings
	if (first.length < 2 || second.length < 2) return 0;			 // if either is a 1-letter string

	let firstBigrams = new Map();
	for (let i = 0; i < first.length - 1; i++) {
		const bigram = first.substring(i, i + 2);
		const count = firstBigrams.has(bigram)
			? firstBigrams.get(bigram) + 1
			: 1;

		firstBigrams.set(bigram, count);
	};

	let intersectionSize = 0;
	for (let i = 0; i < second.length - 1; i++) {
		const bigram = second.substring(i, i + 2);
		const count = firstBigrams.has(bigram)
			? firstBigrams.get(bigram)
			: 0;

		if (count > 0) {
			firstBigrams.set(bigram, count - 1);
			intersectionSize++;
		}
	}

	return (2.0 * intersectionSize) / (first.length + second.length - 2);
}