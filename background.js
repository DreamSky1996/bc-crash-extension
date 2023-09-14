chrome.runtime.onMessage.addListener(data => {
	if (data.type === 'notification') {
		notify(data.message);
	}
});

const notify = message => {
	chrome.storage.local.get(['trenball_rount_count'], data => {
		let value = data.trenball_rount_count || 0;
		chrome.storage.local.set({ 'trenball_rount_count': Number(value) + 1 });
	});
	chrome.storage.local.get(['trenball_total_earning'], data => {
		let trenball_total_earning = data.trenball_total_earning || 0;
		if (message.isWin) {
			if (message.isRed) {
				trenball_total_earning = parseFloat(trenball_total_earning) + (parseFloat(message.amount) * 0.96);
			} else {
				trenball_total_earning = parseFloat(trenball_total_earning) + parseFloat(message.amount);
			}
		} else {
			trenball_total_earning = parseFloat(trenball_total_earning) - parseFloat(message.amount);
		}

		chrome.storage.local.set({ 'trenball_total_earning': trenball_total_earning });
	});
	chrome.storage.local.get(['bet_history'], data => {
		let bet_history = data.bet_history ? data.bet_history : "[]";
		let history_data = JSON.parse(bet_history);
		history_data.push({
			gameID: message.text,
			amount: message.amount,
			isWin: message.isWin,
			isRed: message.isRed
		});

		bet_history = JSON.stringify(history_data);
		chrome.storage.local.set({ 'bet_history': bet_history });
	});
	return chrome.notifications.create(
		'',
		{
			type: 'basic',
			title: message.title,
			message: message.text + (message.isWin ? " : WIN" : " : LOSE"),
			iconUrl: message.isWin ? './assets/image/win-256.png' : './assets/image/lose.png',
		}
	);
};

let activeTabId, lastUrl, lastTitle;

function getTabInfo(tabId) {
	chrome.tabs.get(tabId, function (tab) {
		console.log(tab, tab.url);
		if (lastUrl != tab.url)
			if (tab.url == "https://bcgame.im/game/crash") {
				console.log("classic");
				chrome.storage.local.set({ 'bet_category': 'classic' });
			}
		if (tab.url == "https://bcgame.im/game/crash?type=trenball") {
			console.log("trenball");
			chrome.storage.local.set({ 'bet_category': 'trenball' });
		}
	});
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
	getTabInfo(activeTabId = activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	console.log(tabId, activeTabId);
	if (activeTabId == tabId) {
		getTabInfo(tabId);
	}
});