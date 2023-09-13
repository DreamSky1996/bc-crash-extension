const text = document.getElementById('notify-text');
const notify = document.getElementById('notify-button');
const reset = document.getElementById('notify-reset');
const trenball_round_count = document.getElementById('trenball-round-count');
const trenball_total_earning = document.getElementById('trenball-total-earning');
const classicTab = document.getElementById('classic-tab');
const trenballTab = document.getElementById('trenball-tab');
const trenball_random_bet = document.getElementById('trenball_random_bet');
const trenball_random_round = document.getElementById('trenball_random_round');
const trenball_start_stop = document.getElementById('trenball_start_stop');

const trenball_bet_radio_box = document.getElementById('trenball-bet-radio-box');



chrome.storage.local.get(null, data => {
	if(data.bet_category == "classic") {
		clickTab(classicTab, "classic");
	}
	if(data.bet_category == "trenball") {
		clickTab(trenballTab, "trenball");
	}
	trenball_start_stop.checked = data.trenball_start_stop|| false;
	trenball_random_bet.checked = data.trenball_random_bet || true;
	trenball_random_round.checked = data.trenball_random_round || false;
	trenball_round_count.innerHTML = data.trenball_rount_count || 0;
	trenball_total_earning.innerHTML = data.trenball_total_earning || 0;

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

trenball_random_bet.addEventListener('change', (event) => {
	console.log(event.target.checked);
	if (event.target.checked) {
		trenball_bet_radio_box.style.display = 'none';
	} else {
		trenball_bet_radio_box.style.display = 'flex';
	}
	chrome.storage.local.set({ 'trenball_random_bet': event.target.checked });

})

trenball_random_round.addEventListener('change', (event) => {
	console.log(event.target.checked);
	chrome.storage.local.set({ 'trenball_random_round': event.target.checked });

})
trenball_start_stop.addEventListener('change', (event) => {
	console.log(event.target.checked);
	chrome.storage.local.set({ 'trenball_start_stop': event.target.checked });

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

