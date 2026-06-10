(async () => {
    // ИНИЦИАЛИЗАЦИЯ SUPABASE
    const SUPABASE_URL = "https://mxscxbnfoflmyommmvkw.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_UywRzzKorhm2e27LVhB1yg_tguBQc21";
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // DOM ЭЛЕМЕНТЫ СТРАНИЦЫ
    const homePage = document.getElementById("homepage");
    const simulationPage = document.getElementById("simulations");
    const textContainer = document.getElementById("text-container");
    const navLoginBtn = document.getElementById("nav-login");

    const startBtn = document.getElementById("losgeht_btn");
    const navSimBtn = document.getElementById("nav-simulations");
    const homeBtn = document.getElementById("toHome");
    const nextBtn = document.getElementById("check-btn");

    const timer = document.getElementById("timer_box");

    const authSection = document.getElementById("auth-section");
    const login = document.getElementById("login-submit-btn");
    const keyInput = document.getElementById("access-key-input");

    const instructionsPage = document.getElementById("instructions-page");
    const realStartBtn = document.getElementById("start-simulation-btn");

    let countdownInterval;
    let articles = [];
    let simulatorTexts = [];
    let lastActiveInput = null;
    const usedTextIds = [];
    let totalScore = 0;
    let totalGaps = 0;
    let completedTexts = 0;

    document.addEventListener("focusin", (e) => {
        if (e.target.classList.contains("test-input")) {
            lastActiveInput = e.target;
        }
    });

    function enterGermanKey(e) {
        if (!e.target.classList.contains("key")) {
            return;
        }
        e.preventDefault();
        if (!lastActiveInput) {
            return;
        }
        const c = e.target.getAttribute("data-char");
        const start = lastActiveInput.selectionStart;
        const end = lastActiveInput.selectionEnd;
        const text = lastActiveInput.value;
        lastActiveInput.value = text.substring(0, start) + c + text.substring(end);
        lastActiveInput.selectionStart = start + 1;
        lastActiveInput.selectionEnd = start + 1;
        lastActiveInput.focus();
    }
    document.getElementById("german-keys").addEventListener("mousedown", enterGermanKey);
    document.getElementById("german-keys").addEventListener("touchstart", enterGermanKey);

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

    //ТАЙМЕР
    function startTimer(durationInSek) {
        let timeLeft = durationInSek;

        timer.classList.remove("visible");
        timer.innerText = "05:00";

        clearInterval(countdownInterval);

        countdownInterval = setInterval(() => {
            let minutes = Math.floor(timeLeft / 60); // минуты
            let seconds = timeLeft % 60; // секунды

            seconds = seconds < 10 ? "0" + seconds : seconds;
            minutes = minutes < 10 ? "0" + minutes : minutes;

            timer.innerText = `${minutes}:${seconds}`;

            if (timeLeft <= 60) {
                timer.classList.add("visible");
            }

            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                timer.classList.remove("visible");
                handleNextButtonClick();
            }
            timeLeft--;
        }, 1000);
    }

    function showSimulation() {
        homePage.style.display = "none";
        simulationPage.style.display = "none";
        instructionsPage.style.display = "block";
    }
    function beginSimulation() {
        instructionsPage.style.display = "none";
        simulationPage.style.display = "block";
        if (simulatorTexts.length === 0) {
            textContainer.innerHTML = "Тексты загружаются из базы данных или список пуст сори...";
            return;
        }

        loadNextText();
    }

    function showHomepage() {
        clearInterval(countdownInterval);
        timer.classList.remove("visible");

        simulationPage.style.display = "none";
        homePage.style.display = "block";
        instructionsPage.style.display = "none";
    }

    startBtn.addEventListener("click", showSimulation);
    navSimBtn.addEventListener("click", showSimulation);
    homeBtn.addEventListener("click", showHomepage);
    realStartBtn.addEventListener("click", beginSimulation);
    navLoginBtn.addEventListener("click", (e) => {
        e.preventDefault();

        const isAuthorised = localStorage.getItem("user_access_key");
        if (isAuthorised) {
            if (confirm("Вы уже авторизованы. Хотите выйти?")) {
                localStorage.removeItem("user_access_key");
                alert("Вы вышли из аккаунта.");
                window.location.reload();
            }
        } else {

            if (authSection.style.display === "none" || authSection.style.display === "") {
                showAuthForm();
                keyInput.focus();
            } else {
                hideAuthForm();
            }
        }
    });


    // ГЕНЕРАТОР ONSET
    function onsetText(textToProcess) {
        const text_sentences = textToProcess.split(". ");
        const count_sentences = text_sentences.length;

        let finalHTML = "";

        for (let i = 0; i < count_sentences; i++) {
            let current_sentence = text_sentences[i].trim();
            if (!current_sentence) continue;

            if (current_sentence.endsWith(".")) {
                current_sentence = current_sentence.slice(0, -1);
            }

            if (i === 0 || i === count_sentences - 1) {
                finalHTML += current_sentence + ". ";
            } else {
                const words = current_sentence.split(/\s+/);

                const process_word = words.map((word, wordIndex) => {
                    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

                    if (wordIndex % 2 === 1 && cleanWord.length > 1) {
                        const keepcount = Math.floor(cleanWord.length / 2);

                        const toKeep = cleanWord.substring(0, keepcount);
                        const toHide = cleanWord.substring(keepcount);

                        const prefix = word.substring(0, word.indexOf(cleanWord));
                        const suffix = word.substring(word.indexOf(cleanWord) + cleanWord.length);
                        const maxLength = 20;
                        const maxWidth = 10;

                        return `<span class="processed">${prefix}${toKeep}<input type="text" autocorrect="off" autocapitalize="none" spellcheck="false" class="test-input" data-answer="${toHide}" maxlength="${maxLength}" style="width: ${maxWidth}ch;">${suffix}</span>`;
                    }
                    return word;
                });

                finalHTML += process_word.join(" ") + ". ";
            }
        }

        return finalHTML.trim();
    }

    async function checkCurrentAccess() {
    const savedKey = localStorage.getItem("user_access_key");
    if (savedKey) {
        const hasAccess = await verifyKeyInDatabase(savedKey);
        if (hasAccess) {
            hideAuthForm();
            if (navLoginBtn) {
                navLoginBtn.innerText = "LOGOUT";
            }
            return true;
        }
    }
    showAuthForm();
    return false;
}

    async function verifyKeyInDatabase(key) {
        if (!key || key === "null" || key === undefined) {
            return false;
        }
        try {
            const { data, error } = await supabaseClient.rpc('get_simulator_texts', { 
                user_key: key
            });

            if (error) return false;
            const hasPremium = data.some(t => !t.is_free);
            return hasPremium;
        } catch (err) {
            return false;
        }
    }

    async function handleLogin() {
        const enteredKey = keyInput.value.trim();
        if (!enteredKey) {
            return alert("Введите ключ!");
        }

        const isValid = await verifyKeyInDatabase(enteredKey);

        if (isValid) {
            localStorage.setItem("user_access_key", enteredKey);
            alert("Доступ открыт 🎉");
            hideAuthForm();
            await loadAllContent();
        } else {
            alert("Ключ не найден или неактивен. Напиши мне в Telegram!");
        }
    }

    function showAuthForm() {
        if (authSection) authSection.style.display = "block";
    }

    function hideAuthForm() {
        if (authSection) authSection.style.display = "none";
    }

    //ЗАГРУЗКА ИЗ БАЗЫ ДАННЫХ
    async function loadAllContent() {
        const savedKey = localStorage.getItem("user_access_key") || "no_key_provided";
        
        try {
            
            let articlesQuery = supabaseClient.from("articles").select("*");
            const { data: fetchedArticles, error: artError } = await articlesQuery;
            if (!artError) {
                articles = fetchedArticles;
                renderArticles();
            }


            const { data: fetchedTexts, error: textError } = await supabaseClient.rpc('get_simulator_texts', {
                user_key: savedKey
            });

            if (!textError) {
                simulatorTexts = fetchedTexts;
                console.log(`Успешно загружено текстов: ${simulatorTexts.length}`);
            } else {
                console.error("Ошибка при получении текстов:", textError);
            }

        } catch (error) {
            console.error("сломався:", error);
        }
    }

    function loadNextText() {
        if (completedTexts >= 8) {
            finalizeResult();
            return;
        }
        const savedKey = localStorage.getItem("user_access_key");
        const availableTexts = simulatorTexts.filter((t) => savedKey || t.is_free);
        let newTexts = availableTexts.filter((t) => !usedTextIds.includes(t.id));
        if (newTexts.length === 0) {
            usedTextIds = [];
            newTexts = availableTexts;
        }
        if (newTexts.length === 0) {
            textContainer.innerHTML = "Больше нет текстов";
            return;
        }

        const index = Math.floor(Math.random() * newTexts.length);
        const data = newTexts[index];
        usedTextIds.push(data.id);
        const renderedText = onsetText(data.content);
        textContainer.innerHTML = `<h3>Текст №${data.id}: ${data.title || ""}</h3>` + renderedText;
        startTimer(300);
    }


    if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
        setInterval(() => {
            (() => false).constructor("debugger")();
        }, 200);
    }
    let checked = false;
    function handleNextButtonClick() {
        if (checked) {
            checked = false;
            nextBtn.innerText = "Weiter";
            loadNextText();
            return;
        }
        const inputs = textContainer.querySelectorAll(".test-input");
        let correct = 0;
        for (const input of inputs) {
            const userAnswer = input.value.trim().toLowerCase();
            const correctAnswer = input.getAttribute("data-answer").trim().toLowerCase();
            if (userAnswer === correctAnswer) {
                input.style.backgroundColor = "#d4edda";
                input.style.borderColor = "#28a745";
                ++correct;
            } else {
                input.style.backgroundColor = "#f8d7da";
                input.style.borderColor = "#dc3545";
            }
            input.disabled = true;
        }
        totalScore += correct;
        totalGaps += inputs.length;
        ++completedTexts;
        clearInterval(countdownInterval);
        nextBtn.innerText = "Zum nächsten Text";
        checked = true;
    }

    nextBtn?.addEventListener("click", handleNextButtonClick);

    function finalizeResult() {
        clearInterval(countdownInterval);
        timer.classList.remove("visible");
        const percent = totalGaps > 0 ? Math.round((totalScore / totalGaps) * 100) : 0;
        textContainer.innerHTML = `
        <div style="text-align: center; padding: 30px; background: #671830; color: #fef0e2; border-radius: 10px; margin-top: 20px;">
            <h2>Ergebnis / Результат</h2>
            <p style="font-size: 24px;">Вы успешно завершили 8 текстов!</p>
            <p style="font-size: 28px; font-weight: bold; margin: 20px 0;">
                Баллы: ${totalScore} из ${totalGaps} (${percent}%)
            </p>
            <button id="restart-session-btn" style="background: #fef0e2; color: #671830; font-size: 22px; padding: 10px 30px; margin-top: 15px;">Еще</button>
        </div>
    `;

        if (nextBtn) {
            nextBtn.style.display = "none";
        }

        document.getElementById("restart-session-btn").addEventListener("click", () => {
            // Полный сброс состояния сессии
            totalScore = 0;
            totalGaps = 0;
            completedTexts = 0;
            usedTextIds.length = 0;
            checked = false;
            if (nextBtn) {
                nextBtn.style.display = "inline-block";
            }
            loadNextText();
        });
    }

    function renderArticles() {
        // Сюда переедет будущая логика самой пиздатой отрисовки лайфхаков на странице
        console.log("Статьи в массиве:", articles);
    }

    if (login) {
        login.addEventListener("click", handleLogin);
    }

    window.addEventListener("DOMContentLoaded", async () => {
        await checkCurrentAccess();
        await loadAllContent();
    });
})();
