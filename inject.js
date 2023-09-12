
function setCrashData() {
    if (crash) {
        localStorage.setItem("crash_histroy", JSON.stringify(crash.history));
    }
}

setInterval(setCrashData, 1000);

