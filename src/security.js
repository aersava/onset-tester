 // Kein Copy:))
    document.addEventListener("contextmenu", (element) => {
        element.preventDefault();
    });
    document.addEventListener("keydown", (element) => {
        if (
            element.ctrlKey &&
            (element.key === "c" || element.key === "с" || element.key === "x" || element.key === "ч")
        ) {
            element.preventDefault();
        }
        if (element.ctrlKey && (element.key === "u" || element.key === "г")) {
            element.preventDefault();
        }
        if (element === "F12") {
            element.preventDefault();
        }
    });
    if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
        setInterval(() => {
            (() => false).constructor("debugger")();
        }, 200);
    }
