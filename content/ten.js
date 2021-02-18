console.log(document.title);
console.log(document.title);


function readyToGo() {
	return true;
}
function handholdingNeeded() {
	return false;
}
function getShowTitle() {
	var title = document.title.substring(0, document.title.indexOf(' - '));
	if (title.indexOf('Episode') > -1) {
		title = document.querySelector('.page-title-bar ').querySelector('h1').textContent;
	}
	return title;
}

function episodeTitleExists() {
	//return !!document.querySelector('[data-test-id="Title"]');
	var possibleTitle = document.querySelector('.side').querySelector('h3').innerText;
	possibleTitle = possibleTitle.substring(0, possibleTitle.indexOf('\n'));
	var showTitle = getShowTitle();
	if (possibleTitle.match(showTitle) != null) {
		//if the possible title contains the name of the show, it's more likely to use the episode numbering
		return false
	} else {
		return true;
	}
	// document.querySelector('.side').querySelector('h3').textContent
	return false;
}
function getEpisodeTitle() {
	var possibleTitle = document.querySelector('.side').querySelector('h3').innerText;
	var possibleTitleEnd = possibleTitle.indexOf('\n');

	var possibleTitleStart = possibleTitle.indexOf(' - ') + 3;
	var epTitle = possibleTitle.substring(possibleTitleStart, possibleTitleEnd);

	// document.querySelector('.side').querySelector('h3').innerText.substring(0, document.querySelector('.side').querySelector('h3').innerText.indexOf('\n'))
	//var fulltitle = document.querySelector('[data-test-id="Title"]').textContent;
	//
	//var start = fulltitle.indexOf(' - ') + 3;
	//var title = fulltitle.substring(start);
	//return title;
	return epTitle;
}

function episodeNumberingExists() {
	var possibleTitle = document.querySelector('.side').querySelector('h3').innerText;
	possibleTitle = possibleTitle.substring(0, possibleTitle.indexOf('\n'));
	var regex = /S\d+ Ep\. \d+/;
	return regex.test(possibleTitle);
}
function getEpisodeNumbering() {
	var possibleTitle = document.querySelector('.side').querySelector('h3').innerText;
	possibleTitle = possibleTitle.substring(0, possibleTitle.indexOf('\n'));
	var regex = /S\d+ Ep\. \d+/;
	var numberString = possibleTitle.match(regex)[0];
	var digits = /\d+/g;
	var seasonEpisode = numberString.match(digits);
	console.log(seasonEpisode);
	return seasonEpisode;
}

function testIfShow() {
	var ok = false;
	if (!ok) {
		ok = !!document.querySelector('.show-video__details')
	}
	
	console.log('is show:', ok);
	return ok;
}

function urlPatternExists() {
	return true;
}
function getUrlPattern() {
	var regex = /(?:\.au\/)(.*?)(?:\/epi|$)/;
	var url = location.href;
	var pattern = url.match(regex)[1];
	console.log(pattern);
	return pattern;
}
// getService()
function getService() {
	return 'ten';
}


// readyToGo()
// handholdingNeeded()
// testIfShow()
// getShowTitle()
// urlPatternExists()
// getUrlPattern()
// episodeNumberingExists()
// getEpisodeNumbering()
// episodeTitleExists()
// getEpisodeTitle()