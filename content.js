
var s = document.createElement('script');
s.src = chrome.runtime.getURL('inject.js');
s.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

var isBetting = false, bet_gameID = 0, is_bull_or_bear, stop_bet_rounds = 0, continue_lose_count = 0;
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
                            checkBet(bet_gameID, last_game);
                        }
                    }
                    if (isBetting == false && data.trenball_start_stop == true) {
                        onBet(data, crash.gameId);
                    }
                    if (data.trenball_start_stop == false) {
                        bet_gameID = 0;
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

    async function checkBet(bet_gameID, last_game) {
        const inputlist = document.getElementsByClassName("input-control");
        console.log("inputlist.length", inputlist.length);
        if (inputlist.length == 1) {
            const trenball_amount = inputlist[0].getElementsByTagName("input");

            var message = {
                title: "",
                text: "",
                amount: trenball_amount[0].value,
                isWin: false,
                isRed: false
            }
            switch (is_bull_or_bear) {
                case "Bear":
                    message.isRed = true;
                    message.title = "RED Bear";
                    if (last_game.crash < 200) {
                        console.log("RED Bear: win");
                        message.text = `${bet_gameID}`;
                        message.isWin = true;
                    } else {
                        console.log("RED Bear: lose");
                        message.text = `${bet_gameID}`;
                        message.isWin = false;
                    }
                    break;
                case "Bull":
                    message.title = "Green Bull";
                    if (last_game.crash >= 200) {
                        console.log("Green Bull: win");
                        message.text = `${bet_gameID}`;
                        message.isWin = true;
                    } else {
                        console.log("Green Bull: lose");
                        message.text = `${bet_gameID}`;
                        message.isWin = false;
                    }
                    break;
            }
            
            chrome.runtime.sendMessage('', {
                type: 'notification',
                message: message
            });
            if(message.isWin) {
                for (let i = 0; i < continue_lose_count; i++) {
                    halfAmount();
                    await delay(100);
                }
                continue_lose_count = 0
            } else {
                if(continue_lose_count > 2) {
                    for (let i = 0; i < continue_lose_count; i++) {
                        halfAmount();
                        await delay(100);
                    }
                    continue_lose_count = 0
                } else {
                    doubleAmount();
                    await delay(100);
                    continue_lose_count += 1;
                }
                
            }
        }

    }

    function onTrenballBet(bet_data, gameId) {

        if (bet_data.trenball_random_round == false) {
            doingBet(bet_data, gameId);
            stop_bet_rounds = 0
        } else {
            if (bet_gameID == 0 || (bet_gameID + stop_bet_rounds == gameId) || stop_bet_rounds == 0) {
                doingBet(bet_data, gameId);
                stop_bet_rounds = Math.round(Math.random() * 3);
                console.log("stop_bet_rounds", stop_bet_rounds);
            }
        }
    }

    function doingBet(bet_data, gameId) {
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
        } else {
            is_bull_or_bear = bet_data.trenball_bet == 0 ? "Bear" : "Bull";
            const bet_btn = bet_items[bet_data.trenball_bet].getElementsByTagName("button")
            bet_btn[0].click();
            bet_gameID = gameId + 1;
            console.log(bet_gameID);
        }
        isBetting = true;
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

    function doubleAmount() {
        const inputlist = document.getElementsByClassName("game-area-group-buttons");
        if (inputlist.length == 1) {
            const trenball_amount_ctl_btns = inputlist[0].getElementsByTagName("button");
            trenball_amount_ctl_btns[1].click();
        }

    }

    function halfAmount() {
        const inputlist = document.getElementsByClassName("game-area-group-buttons");
        if (inputlist.length == 1) {
            const trenball_amount_ctl_btns = inputlist[0].getElementsByTagName("button");
            trenball_amount_ctl_btns[0].click();
        }
    }

    function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

});


