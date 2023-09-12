
function setCrashData() {
    if (crash) {
        localStorage.setItem("crash", JSON.stringify({ 
            "histroy": crash.history, 
            "gameId": crash.gameId, 
            "isActived": crash.isActived,
            "isBetting":  crash.isBetting,
            "isInited" : crash.isInited
        }));
    }
}

setInterval(setCrashData, 1000);