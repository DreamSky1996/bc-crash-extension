
var s = document.createElement('script');
s.src = chrome.runtime.getURL('inject.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

$(document).ready(function () {
    init();
    

    function clickCrashTabs(tabName) {
        const gameView = document.getElementsByClassName("game-view");
        if (gameView.length > 0) {
            const tabBtnList = gameView[0].getElementsByClassName("tabs-navs");
            if (tabBtnList.length > 0) {
                const tabBtns = tabBtnList[0].getElementsByTagName("button");
                if (tabBtns.length > 1) {
                    console.log(tabName);
                    switch (tabName) {
                        case "Classic":
                            tabBtns[0].click();
                            break;
                        case "Trenball":
                            tabBtns[1].click();
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }

    setInterval(interval, 2000);

    

});

function init() {
    console.log("init");
    const currentUrl = window.location.href;
    if (currentUrl == "https://bcgame.im/game/crash") {
        console.log("classic");
        chrome.storage.local.set({ 'bet_category': 'classic' });
    }
    if (currentUrl == "https://bcgame.im/game/crash?type=trenball") {
        console.log("trenball");
        chrome.storage.local.set({ 'bet_category': 'trenball' });
    }
}

function interval() {
    try {
        var crash_histroy = JSON.parse(localStorage.getItem('crash_histroy'));
        console.log( crash_histroy );
        const inputlist = document.getElementsByClassName("input-control");
        if (inputlist.length == 2) {
            const amount_input = inputlist[0].getElementsByTagName("input");
            const cash_out_input = inputlist[1].getElementsByTagName("input");
            console.log(amount_input[0].value, cash_out_input[0].value);
        }
        else (inputlist.length == 1)
        {
            const trenball_input = inputlist[0].getElementsByTagName("input");
            console.log(trenball_input[0].value);
        }
    } catch (error) {
        console.log(error);
    }

}

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        console.log(`request: ${message.type}`);
        switch (message.type) {
            case "trenball":
                clickCrashTabs("Trenball");
                sendResponse("Click Trenball tab!");
                break;
            case "classic":
                clickCrashTabs("Classic");
                sendResponse("Click Classic tab!");
                break;
            case "trenball-amount":
                console.log(message.amount);
                chrome.storage.local.set({ 'trenball_amount': message.amount });
                const inputlist = document.getElementsByClassName("input-control");
                if (inputlist.length == 2) {
                }
                else (inputlist.length == 1)
                {
                    const trenball_input = inputlist[0].getElementsByTagName("input");
                    trenball_input[0].value = message.amount;
                }
                sendResponse("Okay!");
                break;
        }
    }
);