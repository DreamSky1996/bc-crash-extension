const text = document.getElementById('notify-text');
const notify = document.getElementById('notify-button');
const reset = document.getElementById('notify-reset');

const classicTab = document.getElementById('classic-tab');
const trenballTab = document.getElementById('trenball-tab');

const trenball_bet_radio_box = document.getElementById('trenball-bet-radio-box');

// Bet Result Options
const trenball_round_count = document.getElementById('trenball-round-count');
const trenball_total_earning = document.getElementById('trenball-total-earning');
const bet_history_table = document.getElementById('history-table');
// Bet Options Elements 
const trenball_random_bet = document.getElementById('trenball_random_bet');
const trenball_random_round = document.getElementById('trenball_random_round');
const trenball_start_stop = document.getElementById('trenball_start_stop');
const trenball_red_bear = document.getElementById("red_bear");
const trenball_green_bull = document.getElementById("green_bull");

const trenball_reset_btn = document.getElementById("trenball-reset-btn");

chrome.storage.local.get(null, data => {
	if (data.bet_category == "classic") {
		clickTab(classicTab, "classic");
	}
	if (data.bet_category == "trenball") {
		clickTab(trenballTab, "trenball");
	}
	trenball_start_stop.checked = data.trenball_start_stop || false;
	trenball_random_bet.checked = data.trenball_random_bet || false;
	trenball_random_round.checked = data.trenball_random_round || false;
	trenball_green_bull.checked = data.trenball_bet || 0;
	trenball_round_count.innerHTML = data.trenball_rount_count || 0;
	trenball_total_earning.innerHTML = data.trenball_total_earning || 0;
	loadBetHistory(data.bet_history || "[]");
	if (trenball_random_bet.checked == false) {
		trenball_bet_radio_box.style.display = 'flex';
	}

});

chrome.storage.onChanged.addListener((changes, namespace) => {
	console.log(changes);
	if (changes.notifyCount) {
		let value = changes.notifyCount.newValue || 0;
		counter.innerHTML = value;
	}
	if (changes.bet_category) {
		if (changes.bet_category.newValue == "classic") {
			clickTab(classicTab, "classic");
		}
		if (changes.bet_category.newValue == "trenball") {
			clickTab(trenballTab, "trenball");
		}
	}
	if (changes.trenball_rount_count) {
		let value = changes.trenball_rount_count.newValue || 0;
		trenball_round_count.innerHTML = value;
	}
	if (changes.trenball_total_earning) {
		let value = changes.trenball_total_earning.newValue || 0;
		trenball_total_earning.innerHTML = value;
	}
	if (changes.bet_history) {
		let value = changes.bet_history.newValue || "[]";
		loadBetHistory(value);
	}
});

trenball_reset_btn.addEventListener('click', () => {
	chrome.storage.local.clear();
	text.value = '';
	chrome.storage.local.set({ 
		'trenball_rount_count': 0,
		'trenball_total_earning': 0,
		'trenball_start_stop': false,
		'trenball_random_bet': false,
		'trenball_random_round': false,
		'trenball_bet': 0,
		'bet_history': "[]",
		"bet_category": "trenball"
	});
});

reset.addEventListener('click', () => {
	chrome.storage.local.clear();
	text.value = '';
});

classicTab.addEventListener('click', () => {
	console.log("classic tab click");
	clickTab(classicTab, "classic");
	chrome.storage.local.set({ 'bet_category': 'classic' });
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { type: "classic" }, function (response) {
			console.log("trenball tab click", response);
		});
	});
});

trenballTab.addEventListener('click', () => {
	console.log("trenball tab click");
	clickTab(trenballTab, "trenball");
	chrome.storage.local.set({ 'bet_category': 'trenball' });
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { type: "trenball" }, function (response) {
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

trenball_red_bear.addEventListener('change', (event) => {
	console.log(event.target.checked);
	chrome.storage.local.set({ 'trenball_bet': event.target.checked ? 0 : 1 });
})

trenball_green_bull.addEventListener('change', (event) => {
	console.log(event.target.checked);
	chrome.storage.local.set({ 'trenball_bet': event.target.checked ? 1 : 0 });
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

function loadBetHistory(bet_history) {
	let innerHTML = `<tr>
						<th>GameID</th>
						<th>Result</th>
						<th>BEAR / BULL</th>
						<th>Amount</th>
					</tr>`;
	if (bet_history) {
		let data = JSON.parse(bet_history);
		if (data.length > 0) {
			for (var i = data.length - 1; i >= 0; i--) {
				console.log(data[i]);
				innerHTML += `<tr>
							<td class="${data[i].isWin ? "green" : "red"}">${data[i].gameID}</td>
							<td class="${data[i].isWin ? "green" : "red"}">${data[i].isWin ? "WIN" : "LOSE"}</td>
							<td class="${data[i].isRed ? "red" : "green"}">${data[i].isRed ? "Red Bear" : "Green Bull"}</td>
							<td>${data[i].amount}</td>
						</tr>`;
			}

		}
	}
	bet_history_table.innerHTML = innerHTML;
}

