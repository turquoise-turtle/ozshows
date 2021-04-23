var ji = document.querySelector('#header-search-query');
var container = document.querySelector('#progress-wrapper').querySelector('.container');
//ji.addEventListener('keyup', handlesearch);

function handlesearch () {
	var filter = ji.value.toUpperCase();
	var li = container.getElementsByClassName('fanarts');
	/*console.log('fanarts', li);*/
	for (i=0; i<li.length; i++) {
		var ae = li[i].querySelector('.main-info').querySelector('h3').querySelector('a').textContent.toUpperCase();
		/*console.log(ae);*/
		if (ae.indexOf(filter) > -1) {
			li[i].style.display = '';
		} else {
			li[i].style.display = 'none';
		}
	}
}


function moregranularpercent() {
	console.log('updating percentage')
	var percent = document.querySelector('#watched-percentage');
	var numerator = percent.nextSibling.firstChild.textContent.replace(',', '')
	var denominator = percent.nextSibling.lastChild.textContent.replace(',', '')
	denominator = denominator.replace(' episodes', '');
	var actualpercent = numerator / denominator * 100;
	var newpercent = Math.round(actualpercent * 100) / 100;
	//percent.textContent = newpercent + '%';
	console.log({percent, numerator, denominator, actualpercent, newpercent});
}

moregranularpercent();






var currentUrl = location.href;
browser.runtime.onMessage.addListener(request => {
	//console.log("Message from the background script:");
	// console.log('request from extension', request);
	
	switch (request.type) {
		case 'possibleUrlChange':
			var same = currentUrl == location.href;
			console.log('urlchange?', !same, currentUrl, location.href);
			currentUrl = location.href;
			if (!same) {
				//ji.removeEventListener('keyup', handlesearch);
				//ji.addEventListener('keyup', handlesearch);
				// moregranularpercent();
				setTimeout(moregranularpercent, 3000);
			}
			break;
	}
});


// Select the node that will be observed for mutations
const targetNode = document.getElementById('watched-percentage');
var paginationNode = document.querySelector('.pagination');

// Options for the observer (which mutations to observe)
const config = { subtree: true, characterData: true, attributes: true}//, childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
	// Use traditional 'for loops' for IE 11
	console.log('mutation')
	setTimeout(moregranularpercent, 3000);
    // moregranularpercent();
};

// Create an observer instance linked to the callback function
// const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
// observer.observe(targetNode, config);
// observer.observe(paginationNode, config);

// Later, you can stop observing
// observer.disconnect();




// var x = document.querySelectorAll('div.row[data-type="show"]');
// var n = Math.floor(Math.random() * 50);
// x[n].scrollIntoView();
// x[n].style.backgroundColor = 'linen';