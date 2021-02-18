console.log(document.title);
console.log(document.title);
// var script = document.createElement('script');
// script.textContent = '\n\tdocument.body.addEventListener("ozshowinfo", function(e) {\n\t\tconsole.log(window.dataLayer);\n\t});';
// document.body.appendChild(script);
// console.log(script);


//readyToGo()
function readyToGo() {
	if (document.querySelector('[data-component="VideoPlayer"]').firstChild.childNodes.length == 1) {
		return false;
	} else {
		return true;
	}
}
//testIfShow()
function testIfShow() {
	return true;
}
//getShowTitle()
function getShowTitle() {
	console.trace();
	var titles = document.querySelectorAll('h3[data-component="Heading"]');
	console.log(titles);
	if (titles.length == 2) {
		var query = titles[1].textContent;
	} else if (titles.length == 1) {
		var query = titles[0].textContent;
	} else {
		var query = document.querySelector('.jw-nextup-title').textContent;
	}
	return query;
}
// urlPatternExists()
function urlPatternExists() {
	return false;
}
// getUrlPattern()
// episodeNumberingExists()
function episodeNumberingExists() {
	var title = document.querySelector('h4[data-component="Heading"]').textContent;
	var regex = /Series \d+ Episode \d+/;
	return regex.test(title);
}
// getEpisodeNumbering()
function getEpisodeNumbering() {
	var numberString = document.querySelector('h4[data-component="Heading"]').textContent;
	var digits = /\d+/g;
	var seasonEpisode = numberString.match(digits);
	console.log(seasonEpisode);
	return seasonEpisode;
}
//episodeTitleExists()
function episodeTitleExists() {
	var title = document.querySelector('h4[data-component="Heading"]').textContent;
	var regex = /Series \d+ (.*)/;
	if (episodeNumberingExists()) {
		return false;
	} else if (regex.test(title)) {
		return true;
		
	} else {
		return false;
	}
}
// getEpisodeTitle()
function getEpisodeTitle() {
	var title = document.querySelector('h4[data-component="Heading"]').textContent;
	var regex = /Series \d+ (.*)/;
	var epTitle = title.match(regex)[1];
	return epTitle;
}
// handholdingNeeded()
function handholdingNeeded() {
	return true;
}
// getService()
function getService() {
	return 'abc_episode';
}