//maybe get a listener which checks which episode has been clicked and keeps track
//as well as a content script for the individual episode page as well

console.log(document.title);
console.log(document.title);

//readyToGo()
function readyToGo() {
	return !!document.querySelector('video');
}
//testIfShow()
function testIfShow() {
	//return false;

	var url = location.href;
	var regex = /ondemand\/program\/(.+)/;
	return regex.test(url);
}
// handholdingNeeded()
function handholdingNeeded() {
	return false;
}
//getShowTitle()
function getShowTitle() {
	//used to work, doesn't anymore
	//var query = document.title.substring(0, document.title.indexOf(' | '));

	for (var potential of document.querySelector('.bitmovinplayer-container').childNodes) {
		if (potential.tagName == 'DIV' && potential.childNodes.length == 2) {
			console.log('z', potential)
			if (potential.firstChild.classList.contains('admessage') || potential.firstChild.textContent == 'Advertisement' || potential.firstChild.nextSibling.classList.contains('adclick')) {
				//the adbox
			} else {
				console.log('the chosen one', potential.childNodes);
				var queryel = potential.childNodes[1].textContent;
				var regex = /(.*), Season/;
				var query = queryel.match(regex)[1];
				console.log(query);
				return query;
			}
		}
	}
	return '';
}
// urlPatternExists()
function urlPatternExists() {
	return true;
}
// getUrlPattern()
function getUrlPattern() {
	var url = location.href;
	var regex = /ondemand\/program\/(.*?)(?:(?:\?)|$)/;
	var pattern = url.match(regex)[1];
	console.log('pattern', pattern)
	return pattern;
}
// episodeNumberingExists()
function episodeNumberingExists() {
	for (var potential of document.querySelector('.bitmovinplayer-container').childNodes) {
		if (potential.tagName == 'DIV' && potential.childNodes.length == 2) {
			console.log('z', potential)
			if (potential.firstChild.classList.contains('admessage') || potential.firstChild.textContent == 'Advertisement' || potential.firstChild.nextSibling.classList.contains('adclick')) {
				//the adbox
			} else {
				var possibleTitle = potential.childNodes[1].textContent;
			}
		}
	}
	var regex = /Season \d+ Episode \d+/;
	return regex.test(possibleTitle);
}
// getEpisodeNumbering()
function getEpisodeNumbering() {
	for (var potential of document.querySelector('.bitmovinplayer-container').childNodes) {
		if (potential.tagName == 'DIV' && potential.childNodes.length == 2) {
			console.log('z', potential)
			if (potential.firstChild.classList.contains('admessage') || potential.firstChild.textContent == 'Advertisement' || potential.firstChild.nextSibling.classList.contains('adclick')) {
				//the adbox
			} else {
				var possibleTitle = potential.childNodes[1].textContent;
			}
		}
	}

	var regex = /Season \d+ Episode \d+/;
	var numberString = possibleTitle.match(regex)[0];
	var digits = /\d+/g;
	var seasonEpisode = numberString.match(digits);
	console.log(seasonEpisode);
	return seasonEpisode;
}
//episodeTitleExists()
function episodeTitleExists() {
	return false;
}
// getEpisodeTitle()
// getService()
function getService() {
	return 'sbs';
}