import { onsetText } from "./generator.js";
import { navigateTo } from "./router.js";
const timer = document.getElementById("timer_box");
const textContainer = document.getElementById("text-container");
const simulationPage = document.getElementById("simulations");
const nextBtn = document.getElementById("check-btn");
const timerCheckBox = document.getElementById("timer-toggle-checkbox");

export const usedTextIds = [];
export let simulatorTexts = [];

export let selectedLevel = "all";
export let totalScore = 0;
export let totalGaps = 0;
export let completedTexts = 0;

export let timerEnabled = true;
let countdownInterval;
let lastActiveInput = null;
let checked = false;


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

//ТАЙМЕР
export function startTimer(durationInSek) {
    clearInterval(countdownInterval);
    timer.classList.remove("visible");

    if (!timerEnabled) {
        timer.innerText = "Без таймера";
        timer.style.display = "block";
        timer.style.color = "var(--bg-dark)";
        return;
    }
    timer.style.color = "";
    timer.innerText = "05:00";
    let timeLeft = durationInSek;


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

export function beginSimulation() {
    const levelSelect = document.getElementById("filter-level");

    if (levelSelect) selectedLevel = levelSelect.value;

    navigateTo('simulations');

    if (timerCheckBox) {
        timerEnabled = timerCheckBox.checked;
    }
    if (simulatorTexts.length === 0) {
        textContainer.innerHTML = "Тексты загружаются из базы данных или список пуст сори...";
        return;
    }

    loadNextText();
}

export function loadNextText() {
    if (completedTexts >= 8) {
        finalizeResult();
        return;
    }

    const savedKey = localStorage.getItem("user_access_key");

    let filtered = simulatorTexts.filter((text) => {
        const hasAccess = savedKey || text.is_free;
        
        // Сортировка по уровеню
        const matchesLevel = selectedLevel === "all" || 
            (text.level && text.level.trim().toUpperCase() === selectedLevel.trim().toUpperCase());
            
        return hasAccess && matchesLevel;
    });

    const maxTextsInTest = Math.min(8, filtered.length);
    if (completedTexts >= maxTextsInTest || maxTextsInTest === 0){
        finalizeResult(maxTextsInTest);
        return;
    }

    let newTexts = filtered.filter((t) => !usedTextIds.includes(t.id));

    if (newTexts.length === 0 && filtered.length > 0) {
        filtered.forEach(t => {
            const index = usedTextIds.indexOf(t.id);
            if (index > -1) usedTextIds.splice(index, 1);
        });
        newTexts = filtered;
    }

    // Если текстов под выбранные настройки вообще нет в базе
    if (newTexts.length === 0) {
        textContainer.innerHTML = `
            <div style="text-align: center; padding: 30px; font-family: var(--font-main);">
                <p>Текстов уровня (${selectedLevel}) не найдено.</p>
            </div>`;
        return;
    }

    const index = Math.floor(Math.random() * newTexts.length);
    const data = newTexts[index];
    console.log("Данные текста из базы:", data);
    usedTextIds.push(data.id);

    const renderedText = onsetText(data.content);


    const mainHeader = simulationPage.querySelector("h2");
    if (mainHeader) {
        const currentLevel = data.level ? data.level.toUpperCase() : "A2"; 

        mainHeader.innerHTML = `Lückentexts <span style="font-size: 14px; font-family: var(--font-main); background: var(--bg-dark); color: var(--bg-light); padding: 4px 10px; margin-left: 15px; vertical-align: middle; border-radius: 3px; letter-spacing: 1px;"> ${currentLevel}</span>`;
    }
    textContainer.innerHTML = renderedText;
        
    startTimer(300);
}

function handleNextButtonClick() {
    if (checked) {
        checked = false;
        nextBtn.innerText = "Weiter";
        loadNextText();
        return;
    }

    const currentTextId = usedTextIds[usedTextIds.length - 1];
    if(currentTextId){
        saveCompletedTextIds(currentTextId);
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

function finalizeResult(maxTexts) {
    clearInterval(countdownInterval);
    timer.classList.remove("visible");
    const percent = totalGaps > 0 ? Math.round((totalScore / totalGaps) * 100) : 0;
    textContainer.innerHTML = `
    <div style="text-align: center; padding: 30px; background: #E2E2E2; color: #2E2828; border-radius: 10px; margin-top: 20px;">
        <h2>Ergebnis / Результат</h2>
        <p style="font-size: 24px;">Вы успешно завершили ${completedTexts} из ${maxTexts} текстов!</p>
        <p style="font-size: 28px; font-weight: bold; margin: 20px 0;">
            Баллы: ${totalScore} из ${totalGaps} (${percent}%)
        </p>
        <button id="restart-session-btn" style="background: #2E2828; color: #E2E2E2; font-size: 22px; padding: 10px 30px; margin-top: 15px;">Еще</button>
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
nextBtn?.addEventListener("click", handleNextButtonClick);

export function resetFilters() {
    selectedLevel = "all";
}

//сохранение решенных текстов в айдишнике
async function saveCompletedTextIds(textId) {
    const savedKey = localStorage.getItem("user_access_key");
    if (!savedKey) return;

    try {
        const {data: profile, error: selectError } = await supabaseClient
        .from("access_keys")
        .select("used_id_texts")
        .eq("key_value", savedKey)
        .single();
        if (selectError) throw selectError;

        const surrentSolved = profile.used_id_texts || [];

        if(!currentSolved.includes(textId)) {
            const updatedSolved = [...currentSolved, textId];

            const {error: updateError } = await supabaseClient
            .from("access_keys")
            .update({ used_id_texts: updatedSolved })
            .eq("key_value", savedKey);

            if (updateError) throw updateError;
            console.log(`Текст с ID ${textId} успешно сохранен как решенный.`);
        }
    } catch (error) {
        console.error("Ошибка при сохранении решенного текста:", err);
    }
}
