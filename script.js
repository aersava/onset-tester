// ИНИЦИАЛИЗАЦИЯ SUPABASE
const SUPABASE_URL = "https://mxscxbnfoflmyommmvkw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_UywRzzKorhm2e27LVhB1yg_tguBQc21"; 
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM ЭЛЕМЕНТЫ СТРАНИЦЫ 
const homePage = document.getElementById("homepage");
const simulationPage = document.getElementById("simulations");
const textContainer = document.getElementById("text-container");

const startBtn = document.getElementById("losgeht_btn");
const navSimBtn = document.getElementById("nav-simulations");
const homeBtn = document.getElementById("toHome");
const nextBtn = document.getElementById("check-btn");

const timer = document.getElementById("timer_box");

const authSection = document.getElementById("auth-section");
const login = document.getElementById("login-submit-btn");
const keyInput = document.getElementById("access-key-input");


let countdownInterval;
let articles = [];
let simulatorTexts = [];
let currentTextIndex = 0;

// Kein Copy)
document.addEventListener('contextmenu', function(element){
    element.preventDefault();
});
document.addEventListener('keydown', function(element) {
    if (element.ctrlKey && (element.key === 'c' || element.key === 'с' || element.key === 'x' || element.key === 'ч')) {
        element.preventDefault();
    }
    if (element.ctrlKey && (element.key === 'u' || element.key === 'г' )) {
        element.preventDefault();
    }
    if (element === 'F12') {
        element.preventDefault();
    }
});

//ТАЙМЕР 
function startTimer (durationInSek) {
    let timeLeft = durationInSek;

    timer.classList.remove("visible");
    timer.innerText = "05:00"; 

    clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
        let minutes = Math.floor(timeLeft / 60); // минуты
        let seconds = timeLeft % 60;            // секунды

        seconds = seconds < 10 ? "0" + seconds : seconds;
        minutes = minutes < 10 ? "0" + minutes : minutes;

        timer.innerText = `${minutes}:${seconds}`; 

        if (timeLeft <= 30) {
            timer.classList.add("visible");
        }

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            timer.classList.remove("visible");
            alert("Zeit ist um!");
        }
        timeLeft--;
    }, 1000);
}

function showSimulation() {
    homePage.style.display = "none";
    simulationPage.style.display = "block";

    // Защита: если база пуста или еще грузится
    if (simulatorTexts.length === 0) {
        textContainer.innerHTML = "Тексты загружаются из базы данных или список пуст сори...";
        return;
    }

    const savedKey = localStorage.getItem('user_access_key');
    
    // Ограничение Freemium: если ключа нет и бесплатные 10 текстов закончились
    if (!savedKey && currentTextIndex >= simulatorTexts.length) {
        textContainer.innerHTML = `
            <div style="text-align: center; padding: 20px; background: #671830; color: #fef0e2; border-radius: 10px; margin-top: 20px;">
                <h3>🎉 Вы прошли все бесплатные симуляции!</h3>
                <p>Остальные тексты доступны в Premium-версии.</p>
                <p>Чтобы получить индивидуальный пароль доступа, напиши мне в Telegram.</p>
            </div>
        `;
        if (nextBtn) nextBtn.style.display = "none";
        clearInterval(countdownInterval);
        timer.classList.remove("visible");
        return;
    }

    if (nextBtn) nextBtn.style.display = "inline-block";

    // Берем текст из массива Supabase
    const currentTextData = simulatorTexts[currentTextIndex % simulatorTexts.length];    
    
    const cTestSim = onsetText(currentTextData.content);
    textContainer.innerHTML = `<h3>Текст №${currentTextData.id}: ${currentTextData.title || 'тут могло быть название...'}</h3>` + cTestSim;

    startTimer(300); // 5 минут на тест
}

function loadNextTxt() {
    currentTextIndex++; 
    showSimulation(); 
}

if (nextBtn) nextBtn.addEventListener("click", loadNextTxt);

function showHomepage() {
    clearInterval(countdownInterval);
    timer.classList.remove("visible");

    simulationPage.style.display = "none";
    homePage.style.display = "block";
}

startBtn.addEventListener("click", showSimulation);
navSimBtn.addEventListener("click", showSimulation);
homeBtn.addEventListener("click", showHomepage);

// ГЕНЕРАТОР ONSET
function onsetText(textToProcess) {
    const text_sentences = textToProcess.split(". ");
    const count_sentences = text_sentences.length;
    
    let finalHTML = "";

    for (let i = 0; i < count_sentences; i++){
        let current_sentence = text_sentences[i].trim();
        if (!current_sentence) continue;

        if (current_sentence.endsWith('.')) {
            current_sentence = current_sentence.slice(0, -1);
        }

        if (i === 0 || i === count_sentences - 1){
            finalHTML += current_sentence + ". ";
        }
        else {
            const words = current_sentence.split(" ");

            const process_word = words.map((word, wordIndex) => {
                const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");

                if(wordIndex % 2 === 1 && cleanWord.length > 1) {
                    const keepcount = Math.floor(cleanWord.length / 2);
                    const missingcount = cleanWord.length - keepcount;

                    const toKeep = cleanWord.substring(0, keepcount);
                    const toHide = cleanWord.substring(keepcount);

                    const toInputWord = Math.max((missingcount * 12), 25);
                    const punctuation = word.slice(cleanWord.length);

                    return `${toKeep}<input type="text" class="test-input" data-answer="${toHide}" maxlength="${missingcount}" style="width: ${toInputWord}px;">${punctuation}`;
                }
                return word;
            });

            finalHTML += process_word.join(" ") + ". ";
        }
    }

    return finalHTML.trim();
}
 
async function checkCurrentAccess() {
    const savedKey = localStorage.getItem('user_access_key');
    if (savedKey) {
        const hasAccess = await verifyKeyInDatabase(savedKey);
        if (hasAccess) {
            hideAuthForm();
            return true;
        }
    }
    showAuthForm();
    return false;
}

async function verifyKeyInDatabase(key) {
    if (!key || key === 'null' || key === undefined) {
        return false;
    }
    try {
        const { data, error } = await supabaseClient
            .from('access_keys')
            .select('*')
            .eq('key_value', key)
            .eq('is_active', true)
            .single();

        if (error || !data) return false;
        return true;
    } catch (err) {
        return false;
    }
}

async function handleLogin() {
    const enteredKey = keyInput.value.trim();
    if (!enteredKey) return alert("Введите ключ!");

    const isValid = await verifyKeyInDatabase(enteredKey);

    if (isValid) {
        localStorage.setItem('user_access_key', enteredKey);
        alert('Доступ открыт 🎉');
        hideAuthForm();
        await loadAllContent(); 
    } else {
        alert('Ключ не найден или неактивен. Напиши мне в ТГ!');
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
    const savedKey = localStorage.getItem('user_access_key');
    const hasAccess = await verifyKeyInDatabase(savedKey);

    try {
        // 1. Загрузка статей
        let articlesQuery = supabaseClient.from('articles').select('*');
        if (!hasAccess) {
            articlesQuery = articlesQuery.eq('is_free', true); 
        }
        
        const { data: fetchedArticles, error: artError } = await articlesQuery;
        if (!artError) {
            articles = fetchedArticles;
            renderArticles();
        }

        let textsQuery = supabaseClient.from('simulator_texts').select('*');
        if (!hasAccess) {
            textsQuery = textsQuery.eq('is_free', true); 
        }
        
        textsQuery = textsQuery.order('category', {ascending: true});
        const { data: fetchedTexts, error: textError } = await textsQuery;
        if (!textError) {
            simulatorTexts = fetchedTexts;
            console.log(`Успешно загружено текстов: ${simulatorTexts.length}`);
        }

    } catch (error) {
        console.error("сломався:", error);
    }
}

function renderArticles() {
    // Сюда переедет будущая логика самой пиздатой отрисовки лайфхаков на странице
    console.log("Статьи в массиве:", articles);
}

if (login) login.addEventListener("click", handleLogin);

window.addEventListener('DOMContentLoaded', async () => {
    await checkCurrentAccess();
    await loadAllContent();
});