chrome.runtime.onMessage.addListener( data => {
	if ( data.type === 'notification' ) {
		notify( data.message );
	}
});

const notify = message => {
	chrome.storage.local.get( ['round_count'], data => {
		let value = data.round_count || 0;
		chrome.storage.local.set({ 'round_count': Number( value ) + 1 });
	} );
	chrome.storage.local.get( ['total_earning'], data => {
		let total_earning = data.total_earning || 0;
		if (message.isWin) {
			if(message.isRed) {
				total_earning = total_earning + parseFloat(message.amount)*0.96;
			} else {
				total_earning = total_earning + parseFloat(message.amount);
			}
		} else {
			total_earning = total_earning - parseFloat(message.amount);
		}
		
		chrome.storage.local.set({ 'total_earning': total_earning});
	} );
	return chrome.notifications.create(
		'',
		{
			type: 'basic',
			title: message.title,
			message: message.text,
			iconUrl: message.isWin? './assets/image/win-256.png':'./assets/image/lose.png',
		}
	);
};

let activeTabId, lastUrl, lastTitle;

function getTabInfo(tabId) {
  chrome.tabs.get(tabId, function(tab) {
	console.log(tab, tab.url);
    if(lastUrl != tab.url)
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

chrome.tabs.onActivated.addListener(function(activeInfo) {
  getTabInfo(activeTabId = activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	console.log(tabId, activeTabId);
  if(activeTabId == tabId) {
    getTabInfo(tabId);
  }
});