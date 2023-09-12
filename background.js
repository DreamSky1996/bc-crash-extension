chrome.runtime.onMessage.addListener( data => {
	if ( data.type === 'notification' ) {
		notify( data.message );
	}
});

const notify = message => {
	chrome.storage.local.get( ['notifyCount'], data => {
		let value = data.notifyCount || 0;
		chrome.storage.local.set({ 'notifyCount': Number( value ) + 1 });
	} );

	return chrome.notifications.create(
		'',
		{
			type: 'basic',
			title: 'Notify!',
			message: message || 'Notify!',
			iconUrl: './assets/icons/icon-128.png',
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