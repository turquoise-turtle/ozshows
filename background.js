browser.storage.local.get({
	'access_token': false,
	'date': new Date().getTime()
}).then(function(e) {
	console.log(e);
	var ref = new Date(e['date']);
	var check = new Date();
	check.setMonth(check.getMonth() - 2);
	var refreshNeeded = ref < check;
	console.log(ref, check, refreshNeeded);

	if (e['access_token'] == false) {
		auth();
	} else if (refreshNeeded) {
		refresh();
	}
})

//https://api.trakt.tv/oauth/authorize?response_type=code&client_id=6495975d86f6270a58f745c62216b7b7d35516f301fe94a401ba64f95d8d6b01&redirect_uri=https://9340aed018c85b8231e392d11a4d70ab3af8c8a2.extensions.allizom.org/
function auth() {
	var authlink = browser.identity.getRedirectURL();
	var link = 'https://trakt.tv/oauth/authorize?response_type=code&client_id=6495975d86f6270a58f745c62216b7b7d35516f301fe94a401ba64f95d8d6b01&redirect_uri=' + authlink;
	var authorizing = browser.identity.launchWebAuthFlow({
		'url': link,
		'interactive': true
	})
	.then(function(url){
		var s = url.indexOf('?code=') + 6;
		var code = url.substring(s);

		var request = new XMLHttpRequest();
		request.open('POST', 'https://api.trakt.tv/oauth/token');
		request.setRequestHeader('Content-Type', 'application/json');
		request.onreadystatechange = function () {
			if (this.readyState === 4) {
				// console.log('Status:', this.status);
				// console.log('Headers:', this.getAllResponseHeaders());
				// console.log('Body:', this.responseText);
				var body = JSON.parse(this.responseText);
				console.log(body);
				let settingItem = browser.storage.local.set({
					'access_token': body['access_token'],
					'refresh_token': body['refresh_token'],
					'date': new Date().getTime()
				});
			}
		};
		var body = {
			'code': code,
			'client_id': '6495975d86f6270a58f745c62216b7b7d35516f301fe94a401ba64f95d8d6b01',
			'client_secret': '21654bd0d5a60b6edcdbf092a4e968f158f38a2ce63cd0341abd44e2f014a923',
			'redirect_uri': authlink,
			'grant_type': 'authorization_code'
		};
		request.send(JSON.stringify(body));

	}).catch(console.warn)
}



function needsRefresh() {
	return browser.storage.local.get(['date'])
	.then(function(s){
		var ref = new Date(s['date']);
		var check = new Date();
		check.setMonth(check.getMonth() - 2);
		console.log(ref, check);
		if (ref < check) {
			return refresh()
		} else {
			console.log('no refresh needed')
			return false;
		}
	})
}

function refresh() {
	console.log('refreshing token');
	return browser.storage.local.get(['refresh_token'])
	.then(function(s){
		console.log(s)
		var authlink = browser.identity.getRedirectURL();
		var request = new XMLHttpRequest();

		request.open('POST', 'https://api.trakt.tv/oauth/token');
		request.setRequestHeader('Content-Type', 'application/json');
		request.onreadystatechange = function () {
			if (this.readyState === 4) {
				// console.log('Status:', this.status);
				// console.log('Headers:', this.getAllResponseHeaders());
				// console.log('Body:', this.responseText);
				var body = JSON.parse(this.responseText);
				console.log(body);
				let settingItem = browser.storage.local.set({
					'access_token': body['access_token'],
					'refresh_token': body['refresh_token'],
					'date': new Date().getTime()
				});
			}
		};

		var body = {
			'refresh_token': s['refresh_token'],
			'client_id': '6495975d86f6270a58f745c62216b7b7d35516f301fe94a401ba64f95d8d6b01',
			'client_secret': '21654bd0d5a60b6edcdbf092a4e968f158f38a2ce63cd0341abd44e2f014a923',
			'redirect_uri': authlink,
			'grant_type': 'refresh_token'
		};

		request.send(JSON.stringify(body));
	})
	
}


// function startScrobble(show) {
// ✓
//this should be split up into functions with messaging from the individual content scripts to this background script
// ✓
//it needs a hover icon for the video element
// ✓
//for when the show cannot be determined, a list of options for user to pick shows up
// ✓
//otherwise the hover menu shows the episode name that is being scrobbled (make a thing to search episode and pick the right one by the id of the show?)
// ✓
//ozshows saves the show's url as a regex pattern mapped to the show's trakt id
// ✓
//scrobble starts when the video starts playing (or maybe when it gets to 10%, to make sure the person is actually watching it?)
// ✓
//send pause event on pause, play event on play
// ~
//reload next episode when page reloads/when the next episode starts (for those sites with autoplay)
// }



// var showid = 'g';
// var episodeIds = {};
// var isPlaying = false;
//maybe
var tabToContent = {}
/*	123: {
		'showSlug': 'g',
		'episodeIds': {}//,
		'epTitle': 'g',
		'epPos': 's1e1'
	}
}*/




browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	
	console.log(arguments);
	console.log(new Date())
	var tabNum = sender['tab']['id'];
	switch (request.type) {
		case 'searchShow':
			//handle url as well
			// return doSearch(request.query, tabNum);
			if (request.hasPattern) {
				var pattern = request['pattern'];
				var hasPattern = true;
			} else {
				var hasPattern = false;
				var pattern = '';
			}
			return searchShow(request.query, hasPattern, pattern)
			.then(function([shows, years]) {
				console.log(years);
				return handleSearchResults(shows, years, tabNum);
			}).catch(console.warn)
			break;
		case 'chosenShow':
			//initiate show
			var slug = request['show'];
			var title = request['showTitle'];
			tabToContent[tabNum] = {
				'showSlug': slug,
				'showTitle': title
			};
			console.log('chosen',slug, tabNum, title)
			if (request.hasPattern) {
				var newpattern = request['pattern'];
				var savePatternSlug = browser.storage.local.get({'urlPatterns':{}, 'slugToShow':{}})
				.then(function(e){
					patterns = e['urlPatterns'];
					slugs = e['slugToShow']
					patterns[newpattern] = slug;
					slugs[slug] = title;
					return browser.storage.local.set({
						'urlPatterns': patterns,
						'slugToShow': slugs
					});
				});
			} else {
				var savePatternSlug = new Promise(function(resolve,reject){
					resolve();
				});
			}

			//get next episode
			return savePatternSlug
			.then(function(){
				return getNextEp(tabNum)
			});
			//check if episode titles match
			break;
		case 'searchEpisode':
			var title = request['episodeTitle'];
			return searchEpisode(title, tabNum)
			.then(function(found){
				console.log(found);
				if (found) {
					return sendEpisodeBack(tabNum);
				} else {
					var msg = {
						'type': 'notFound'
					}
					return Promise.resolve(msg);
				}
				
			})
			break;
		case 'searchEpisodeByNumber':
			var numbers = request['episodeNumbering'];
			return searchEpisodeByNum(numbers, tabNum)
			.then(function(){
				return sendEpisodeBack(tabNum);
			})
			break;
		case 'play':
			//send play event with provided progress %
			var prog = request['progress'];
			return episodeUpdate('start', tabNum, prog);
			break;
		case 'pause':
			//send pause event with provided progress %
			//if over 85% send stop so the episode is marked as played - NOT NEEDED ANYMORE
			var prog = request['progress'];
			// if (prog < 85) {
				return episodeUpdate('pause', tabNum, prog);
			// } else {
				// return episodeUpdate('stop', tabNum, prog);
				//return Promise.resolve('yo its already more than 85%')
			// }
			//.then(console.log)
			break;
		
		case 'stop':
			var prog = request['progress'];
			return episodeUpdate('stop', tabNum, prog);
			//is this needed? yes, to mark the episode as played
			break;
		// default:
		// 	console.log()
	}
	
});

function searchShow(showtitle, haspattern, urlpattern, score) {
	return browser.storage.local.get({'urlPatterns':{}, 'slugToShow':{}})
	.then(function(e){
		patterns = e['urlPatterns'];
		slugs = e['slugToShow']
		if (haspattern && patterns[urlpattern] != undefined) {
			var slug = patterns[urlpattern];
			var title = slugs[slug];
			var item = {};
			item[slug] = title;
			//slug: title
			console.log(item);
			return Promise.resolve([item]);
		} else {
			console.log(showtitle);
			var url = 'https://api.trakt.tv/search/show?query=' + showtitle;
			if (score == undefined) {
				score = 500;
			}

			return makeRequest('GET', url)
			.then(function(responseText) {
				var shows = JSON.parse(responseText);
				console.log(shows)
				var li = {};
				var years = {};
				for (var show of shows) {
					console.log(show['score'])
					if (show['score'] > score) {
						var slug = show['show']['ids']['slug'];
						li[slug] = show['show']['title'];
						var year = show['show']['year'];
						years[slug] = year;
					}
				}
				console.log(li, years, Object.keys(li).length);
				if (Object.keys(li).length == 1) {
					//if there's only one show, save it immediately
					var slug = shows[0]['show']['ids']['slug'];
					var title = shows[0]['show']['title']
					
					patterns[urlpattern] = slug;
					slugs[slug] = title;
					var savePatternSlug = browser.storage.local.set({
						'urlPatterns': patterns,
						'slugToShow': slugs
					});
				} else {
					var savePatternSlug = new Promise(function(resolve,reject){
						resolve();
					});
				}

				return savePatternSlug.then(function(){
					console.log(years);
					return Promise.resolve([li, years]);
				});
				//just testing
				// var t = true;
				// if (t) {
				// 	var s = new Promise(function(resolve,reject){
				// 		resolve('first');
				// 	});
				// } else {
				// 	var s = new Promise(function(resolve,reject){
				// 		resolve('second');
				// 	});
				// }
				// s.then(console.log);
				
			})
		}
	});
	
}

function handleSearchResults(shows, years, tabNum) {//, initialSearch, tabNum) {
	console.log(years);
	console.log(shows);
	var resultLength = Object.keys(shows).length;
	if (resultLength == 1) {
		//initiate show
		var slug = Object.keys(shows)[0];
		var title = shows[slug];

		// var tabNum = sender['tab']['id'];
		tabToContent[tabNum] = {
			'showSlug': slug,
			'showTitle': title
		};
		console.log(slug)
		//get next episode
		return getNextEp(tabNum);
		//check if episode titles match
	} else if (resultLength > 1) {
		var msg = {
			'shows': shows,
			'type': 'multipleShows',
			'years': years
		};
		
		//send shows back to content script
		
		console.log(msg);
		return Promise.resolve(msg);
	} else {
		//no found shows
		//I sorta gave up on recursion using lower score bounds for searching shows
		// if (tabToContent[tabNum] == undefined) {
			// tabToContent[tabNum] = {
				// score: 250
			// }
			// return doSearch(initialSearch, tabNum)
		// } else if( tabToContent[tabNum]['score'] == undefined) {

		// }
		var msg = {
			'type': 'noFoundShows'
		}
		console.log(msg);
		return Promise.resolve(msg);
	}
}

// function doSearch(query, tabNum) {
// 	//I sorta gave up on recursion using lower score bounds for searching shows
// 	//this function shouldn't even be used at the moment
// 	console.log(arguments);
// 	return searchShow(query)
// 	.then(function(shows) {
// 		return handleSearchResults(shows, tabNum);
// 	})
// }

function getNextEp(tabId) {
	console.log(tabId)
	var showSlug = tabToContent[tabId]['showSlug'];
	var showTitle = tabToContent[tabId]['showTitle'];
	var url = 'https://api.trakt.tv/shows/' + showSlug + '/progress/watched?hidden=false&specials=false&count_specials=false';
	return makeRequest('GET', url, true)
	.then(function (responseText) {
		var body = JSON.parse(responseText);
		console.log(body)
		// console.log(body['next_episode'])

		return new Promise(function(resolve, reject){
			if (body['next_episode'] != null) {
				resolve(body['next_episode']);
			} else if (body['reset_at'] != null) {
				resolve(getnexteprewatch(showSlug, body['reset_at'], body['seasons']));
			} else {
				resolve(null);
			}
		})
	}).then(function (epobj){
		//epobj
		if (epobj == null) {
			//no next episode
			console.log('no next episode');
			var episodeids = {};
			var epTitle = '';
			var epPos = '';
		} else {
			var episodeids = epobj['ids'];
			var epTitle = epobj['title'];
			var epPos = 's' + epobj['season'] + 'e' + epobj['number'];
		}
		
		tabToContent[tabId]['episodeIds'] = episodeids;
		tabToContent[tabId]['epTitle'] = epTitle;
		tabToContent[tabId]['epPos'] = epPos;
		
		var msg = {
			'type': 'episode',
			'epTitle': epTitle,
			'epPos': epPos,
			'showTitle': showTitle
		};
		// browser.tabs.sendMessage(tabId, msg);
		return Promise.resolve(msg);
		
	});
}
function getnexteprewatch(slug, resetdate, seasons) {
	console.log('getnexteprewatch');
	var fullep = false;
	for (var season of seasons) {
		for (var episode of season['episodes']) {
			if (episode['last_watched_at'] < resetdate) {
				var sn = season['number'];
				var en = episode['number'];
				fullep = true;
				console.log(slug, sn, en);
				break;
			}
		}
	}
	if (fullep) {
		var url = 'https://api.trakt.tv/shows/' + slug + '/seasons/' + sn + '/episodes/' + en;
		return makeRequest('GET', url)
		.then(function(responseText) {
			var item = JSON.parse(responseText);
			console.log(item);
			return Promise.resolve(item);
		})
	} else {
		return Promise.resolve(null);
	}
}

function episodeUpdate(state, tabNum, progress) {
	var epIds = tabToContent[tabNum]['episodeIds'];
	var req = {
		'episode': {
			'ids': epIds
		},
		'progress': progress
	};
	var url = 'https://api.trakt.tv/scrobble/' + state;

	//delete the info from tabToContent?

	return makeRequest('POST', url, true, req)
	// return Promise.resolve('{"asdf":"asdf"}')
	.then(function(res){
		console.log(JSON.parse(res));
		return Promise.resolve(JSON.parse(res));
	}).catch(function(error){
		if (error.status == 409) {
			//it was just scrobbled, so just leave the error silently?
		} else {
			console.warn(error);
			return error;
		}
	})
}

function searchEpisode(eptitle, tabNum) {
	console.log(eptitle);
	var url = 'https://api.trakt.tv/search/episode?query=' + eptitle + '&fields=title';

	return makeRequest('GET', url)
	.then(function(responseText) {
		var items = JSON.parse(responseText);
		console.log(items)
		var found = false;
		for (var item of items) {
			var condition = item['show']['ids']['slug'] === tabToContent[tabNum]['showSlug'];
			console.log(item, condition && !found);
			if (condition && !found) {
				console.log('hello?');
				var actualepisode = item['episode']['ids'];
				var epTitle = item['episode']['title'];
				var epPos = 's' + item['episode']['season'] + 'e' + item['episode']['number'];
				found = true;
				console.log(actualepisode, epTitle, epPos, found);

				tabToContent[tabNum]['episodeIds'] = actualepisode;
				tabToContent[tabNum]['epTitle'] = epTitle;
				tabToContent[tabNum]['epPos'] = epPos;
				
				//break;
			} else {
				console.log('what. why?')
			}
		}
		//console.log(li, Object.keys(li).length);
		console.log(found);
		
		return Promise.resolve(found);
	})
}

function searchEpisodeByNum(numbers, tabNum) {
	var slug = tabToContent[tabNum]['showSlug'];
	var season = numbers[0];
	var episode = numbers[1];
	var url = 'https://api.trakt.tv/shows/' + slug + '/seasons/' + season + '/episodes/' + episode;
	return makeRequest('GET', url)
	.then(function(responseText) {
		var item = JSON.parse(responseText);
		console.log(item)
		var actualepisode = item['ids'];
		var epTitle = item['title'];
		var epPos = 's' + item['season'] + 'e' + item['number'];
		found = true;
		console.log(actualepisode, epTitle, epPos, found);

		tabToContent[tabNum]['episodeIds'] = actualepisode;
		tabToContent[tabNum]['epTitle'] = epTitle;
		tabToContent[tabNum]['epPos'] = epPos;
		return Promise.resolve();
	});

	//return Promise.resolve();
}

function sendEpisodeBack(tabNum) {
	var epTitle = tabToContent[tabNum]['epTitle'];
	var epPos = tabToContent[tabNum]['epPos'];
	var showTitle = tabToContent[tabNum]['showTitle'];
	var msg = {
		'type': 'foundEpisode',
		'epTitle': epTitle,
		'epPos': epPos,
		'showTitle': showTitle
	}
	console.log('full details', tabToContent[tabNum])
	return Promise.resolve(msg);
}


browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	// console.log(changeInfo, tab);
	// console.log(tabId);
	browser.tabs.sendMessage(tabId, {'type': 'possibleUrlChange'})
	.catch(function(error){
		// console.log(error, error.includes('Error: Could not establish connection. Receiving end does not exist'));

	})
});//console.log);



function makeRequest (method, url, bearer, obj) {
	return needsRefresh()
	.then(function(){
		return browser.storage.local.get('access_token')
	}).then(function(e){
		token = 'Bearer ' + e['access_token'];
		return new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open(method, url);
			xhr.onload = function () {
				if (this.status >= 200 && this.status < 300) {
					resolve(xhr.responseText);
				} else {
					reject({
						status: this.status,
						statusText: xhr.statusText,
						response: xhr.responseText
					});
				}
			};
			xhr.onerror = function () {
				reject({
					status: this.status,
					statusText: xhr.statusText,
					response: xhr.responseText
				});
			};
			console.log(url, bearer, token);
			if (bearer) {
				xhr.setRequestHeader('Authorization', token);
				console.log(bearer, token, xhr);
			}
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.setRequestHeader('trakt-api-version', '2');
			xhr.setRequestHeader('trakt-api-key', '6495975d86f6270a58f745c62216b7b7d35516f301fe94a401ba64f95d8d6b01');

			console.log(xhr);
			if (obj) {
				xhr.send(JSON.stringify(obj))
			} else {
				xhr.send()
			}
		});
	});
	
}