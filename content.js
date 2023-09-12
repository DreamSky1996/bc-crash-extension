
var s = document.createElement('script');
s.src = chrome.runtime.getURL('inject.js');
s.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

var isBetting = false, bet_gameID, is_bull_or_bear;
$(document).ready(function () {
    init();

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

    setInterval(interval, 1000);

    function interval() {
        try {
            chrome.storage.local.get(null, data => {
                // console.log(data);
                var crash = JSON.parse(localStorage.getItem('crash'));
                if (crash.histroy.length > 0) {
                    var last_game = crash.histroy[crash.histroy.length - 1]
                    if (isBetting) {
                        if (bet_gameID == last_game.gameId) {
                            isBetting = false;
                            
                            switch (is_bull_or_bear) {
                                case "Bear":
                                    if (last_game.crash < 200) {
                                        console.log ("RED Bear: win");
                                        chrome.runtime.sendMessage('', {
                                            type: 'notification',
                                            message: "RED Bear: win"
                                        });
                                        
                                    } else {
                                        console.log ("RED Bear: lose");
                                        chrome.runtime.sendMessage('', {
                                            type: 'notification',
                                            message: "RED Bear: lose"
                                        });
                                    }
                                    break;
                                case "Bull":
                                    if (last_game.crash >= 200) {
                                        console.log ("Green Bull: win");
                                        chrome.runtime.sendMessage('', {
                                            type: 'notification',
                                            message: "Green Bull: win"
                                        });
                                    } else {
                                        console.log ("Green Bull: lose");
                                        chrome.runtime.sendMessage('', {
                                            type: 'notification',
                                            message: "Green Bull: lose"
                                        });
                                    }
                                    break;
                            }
                            
                        }
                    }
                    if (isBetting == false && data.trenball_start_stop == true) {
                        
                        onBet(data, crash.gameId);
                    }
                }
            });
        } catch (error) {
            console.log(error);
        }

    }

    function onBet(bet_data, gameId) {

        switch (bet_data.bet_category) {
            case "classic":
                onClassicBet(bet_data, gameId);
                break;
            case "trenball":
                onTrenballBet(bet_data, gameId);
                break;

            default:
                break;
        }
    }

    function onTrenballBet(bet_data, gameId) {
        const inputlist = document.getElementsByClassName("game-area-group-buttons");
        if (inputlist.length == 1) {
            const trenball_amount_ctl_btns = inputlist[0].getElementsByTagName("button");
            console.log(trenball_amount_ctl_btns.length);
        }
        const bet_items = document.getElementsByClassName("bet-item");
        if (bet_data.trenball_random_bet) {
            var index = Math.round(Math.random());
            if (index == 0) {
                console.log("Red Bear");
                is_bull_or_bear = "Bear";
            } else {
                console.log("Green Bull");
                is_bull_or_bear = "Bull";
            }
            const bet_btn = bet_items[index].getElementsByTagName("button")
            bet_btn[0].click();
            bet_gameID = gameId + 1;
            console.log(bet_gameID);
            isBetting = true;
        } else {
            is_bull_or_bear = "Bear";
            const bet_btn = bet_items[0].getElementsByTagName("button")
            bet_btn[0].click();
            bet_gameID = gameId + 1;
            console.log(bet_gameID);
            isBetting = true;
        }

    }

    function onClassicBet(bet_data) {
        const inputlist = document.getElementsByClassName("input-control");
        if (inputlist.length == 2) {
            const amount_input = inputlist[0].getElementsByTagName("input");
            const cash_out_input = inputlist[1].getElementsByTagName("input");
            console.log(amount_input[0].value, cash_out_input[0].value);
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
            }
        }
    );

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
    
});


