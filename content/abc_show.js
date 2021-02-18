console.log(document.title);
console.log(document.title);

browser.runtime.onMessage.addListener(request => {
	

	//console.log("Message from the background script:");
	console.log(request);
	if (request.type == 'show') {
		var query = document.title.substring(0, document.title.indexOf(' : ABC iview'));
		//console.log(query);
		return Promise.resolve({'valid': true, 'show': query});
	}
	// console.log(dataLayer)
});

//not a show, so no need to inject the scrobbler