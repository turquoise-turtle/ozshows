console.log(document.title);
console.log(document.title);

//readyToGo()
function readyToGo() {
	return true;
}
function handholdingNeeded() {
	return false;
}
//testIfShow()
function testIfShow() {
	var ok = false;
	document.querySelectorAll('[data-test-id="Text"]').forEach(function(a){
		if (a.classList.length < 2) {
			// console.log(a, a.classList);
			if (a.textContent == 'Watchlist') {
				ok = true;
			}
		}
	})
	if (!ok) {
		ok = !!document.querySelector('[alt="Expiry date"]')
	}
	
	console.log('is show:', ok);
	return ok;
}
//getShowTitle()
function getShowTitle() {
	var title = document.title.substring(0, document.title.indexOf(' | 7plus'));
	return title;
}
// urlPatternExists()
function urlPatternExists() {
	return true;
}
// getUrlPattern()
function getUrlPattern() {
	var regex = /(?:\.au\/)(.*?)(?:\?epi|$)/
	var url = location.href;
	var pattern = url.match(regex)[1];
	console.log(pattern);
	return pattern;
}
// episodeNumberingExists()
function episodeNumberingExists() {
	var fulltitle = document.querySelector('[data-test-id="Title"]').textContent;
	var regex = /S\d+ E\d+/;
	if (regex.test(fulltitle)) {
		return true;
	} else {
		var newregex = /Season \d+ Episode \d+/;
		return newregex.test(fulltitle);
	}
}
// getEpisodeNumbering()
function getEpisodeNumbering() {
	var fulltitle = document.querySelector('[data-test-id="Title"]').textContent;
	var regex = /S\d+ E\d+/;
	if (regex.test(fulltitle)) {
		var numberString = fulltitle.match(regex)[0];
	} else {
		var newregex = /Season \d+ Episode \d+/;
		var numberString = fulltitle.match(newregex)[0];
	}
	var digits = /\d+/g;
	var seasonEpisode = numberString.match(digits);
	console.log(seasonEpisode);
	return seasonEpisode;
}
//episodeTitleExists()
function episodeTitleExists() {
	if (!!document.querySelector('[data-test-id="Title"]')) {
		var fulltitle = document.querySelector('[data-test-id="Title"]').textContent;
		var regex = /S\d+ E\d+ - .*/;
		return regex.test(fulltitle);
	} else {
		return false;
	}
}
// getEpisodeTitle()
function getEpisodeTitle() {
	var fulltitle = document.querySelector('[data-test-id="Title"]').textContent;
	var start = fulltitle.indexOf(' - ') + 3;
	var title = fulltitle.substring(start);
	return title;
}

// getService()
function getService() {
	return 'seven';
}