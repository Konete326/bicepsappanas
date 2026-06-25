const isElectron =
    typeof window !== "undefined" &&
    window.electronAPI &&
    typeof window.electronAPI.log === "function";

function forward(level, message) {
    const text = typeof message === "string" ? message : JSON.stringify(message);
    if (isElectron) {
        window.electronAPI.log(level, text);
    }
}

export function logInfo(message) {
    forward("info", message);
    if (!isElectron) console.log(message);
}

export function logError(message) {
    forward("error", message);
    if (!isElectron) console.error(message);
}

export function logWarn(message) {
    forward("warn", message);
    if (!isElectron) console.warn(message);
}

export function logDebug(message) {
    forward("debug", message);
    if (!isElectron) console.debug(message);
}
