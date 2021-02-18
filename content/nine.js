console.log(document.title);
console.log(document.title);


//readyToGo()
function readyToGo() {
	// return true;
	return !!document.querySelector('video');
}
function handholdingNeeded() {
	return false;
}
//testIfShow()
function testIfShow() {
	var ok = !!document.querySelector('[alt="9Now"]');
	if (!ok) {
		ok = !!document.querySelector('[alt="Channel 9"]');
	}
	console.log('is show:', ok);
	return ok;
}
//getShowTitle()
function getShowTitle() {
	var query = document.title.substring(0, document.title.indexOf(' Season'));
	console.log(query);
	return query;
}
// urlPatternExists()
function urlPatternExists() {
	return true;
}
// getUrlPattern()
function getUrlPattern() {
	var regex = /(?:\.au\/)(.*?)(?:\/sea|$)/
	var url = location.href;
	var pattern = url.match(regex)[1];
	console.log(pattern);
	return pattern;
}
// episodeNumberingExists()
function episodeNumberingExists() {
	return true;
	// return false;
}
// getEpisodeNumbering()
function getEpisodeNumbering() {
	var regex = /\/season-.*/;
	var url = location.href;
	var numberString = url.match(regex)[0];
	var digits = /\d+/g;
	var seasonEpisode = numberString.match(digits);
	console.log(seasonEpisode);
	return seasonEpisode;
}
//episodeTitleExists()
function episodeTitleExists() {
	return !!document.querySelector('.player').parentNode.querySelector('h2');
	// return false;
	// return true;
}
// getEpisodeTitle()
function getEpisodeTitle() {
	var fulltitle = document.querySelector('.player').parentNode.querySelector('h2').textContent;
	var regex = /(?:Ep \d+ )(.*)/
	var newregex = /(?:Episode \d+: )(.*)/;
	if (regex.test(fulltitle)) {
		var title = fulltitle.match(regex)[1];
	} else if (newregex.test(fulltitle)) {
		var title = fulltitle.match(newregex)[1];
	} else {
		var title = fulltitle;
	}
	
	console.log(title);
	return title;
}
// getService()
function getService() {
	return 'nine';
}