const text = document.getElementById('notify-text');
const notify = document.getElementById('notify-button');
const reset = document.getElementById('notify-reset');
const counter = document.getElementById('notify-count');
const classicTab = document.getElementById('classic-tab');
const trenballTab = document.getElementById('trenball-tab');
const trenballAmount = document.getElementById('trenball-amount');
const trenballApply = document.getElementById('trenball-apply');
const trenball_random_bet = document.getElementById('trenball_random_bet');
const trenball_random_round = document.getElementById('trenball_random_round');

chrome.storage.local.get(['notifyCount'], data => {
	let value = data.notifyCount || 0;
	counter.innerHTML = value;
});

chrome.storage.local.get( ['trenball_amount'], data => {
	let value = data.trenball_amount || 100;
	trenballAmount.value = value;
});

chrome.storage.local.get(['bet_category'], data => {
	if(data.bet_category == "classic") {
		clickTab(classicTab, "classic");
	}
	if(data.bet_category == "trenball") {
		clickTab(trenballTab, "trenball");
	}
});

chrome.storage.onChanged.addListener((changes, namespace) => {
	console.log(changes);
	if (changes.notifyCount) {
		let value = changes.notifyCount.newValue || 0;
		counter.innerHTML = value;
	}
	if (changes.bet_category) {
		if(changes.bet_category.newValue == "classic") {
			clickTab(classicTab, "classic");
		}
		if(changes.bet_category.newValue == "trenball") {
			clickTab(trenballTab, "trenball");
		}
		
	}
});

reset.addEventListener('click', () => {
	chrome.storage.local.clear();
	text.value = '';
});

classicTab.addEventListener('click', () => {
	console.log("classic tab click");
	clickTab(classicTab, "classic");
	chrome.storage.local.set({ 'bet_category': 'classic' });
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {type:"classic"}, function(response){
			console.log("trenball tab click", response);
		});
	});
});

trenballTab.addEventListener('click', () => {
	console.log("trenball tab click");
	clickTab(trenballTab, "trenball");
	chrome.storage.local.set({ 'bet_category': 'trenball' });
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {type:"trenball"}, function(response){
			console.log("trenball tab click", response);
		});
	});
	
});

trenballApply.addEventListener('click', () => {
	console.log("trenball apply");
	console.log(trenballAmount.value);
	chrome.storage.local.set({ 'trenball_amount': trenballAmount.value });
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {type:"trenball-amount", amount: trenballAmount.value}, function(response){
			console.log("trenball amount set", response);
		});
	});
})

trenballAmount.addEventListener('keypress', (event) => {

	console.log(event.target.value);
	chrome.storage.local.set({ 'trenball_amount': event.target.value });

})

trenball_random_bet.addEventListener('change', (event) => {
	console.log(event.target.checked);
	chrome.storage.local.set({ 'trenball_random_bet': event.target.checked });

})
trenball_random_round.addEventListener('change', (event) => {
	console.log(event.target.checked);
	chrome.storage.local.set({ 'trenball_random_round': event.target.checked });

})

notify.addEventListener('click', () => {
	chrome.runtime.sendMessage('', {
		type: 'notification',
		message: text.value
	});
});

function clickTab(tabBtn, tabsName) {
	var i, tabcontent, tablinks;
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}
	document.getElementById(tabsName).style.display = "block";
	tabBtn.className += " active";
}

