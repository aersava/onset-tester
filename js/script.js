import './security.js';
import {initRouter, navigateTo} from './router.js';
import {
    beginSimulation,
    loadNextText,
    simulatorTexts,
    selectedCategory,
    selectedLevel,
    timerEnabled,
    resetFilters
} from './simulator.js';

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


const timerCheckBox = document.getElementById("timer-toggle-checkbox");
let isPremium = false;


startBtn.addEventListener("click", () => navigateTo('instructions'));
navSimBtn.addEventListener("click", () => navigateTo('instructions'));
homeBtn.addEventListener("click", () => navigateTo('homepage'));
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


async function checkCurrentAccess() {
const savedKey = localStorage.getItem("user_access_key");
    if (savedKey) {
        const hasAccess = await verifyKeyInDatabase(savedKey);
        if (hasAccess) {
            isPremium = true;
            hideAuthForm();
            if (navLoginBtn) {
                navLoginBtn.innerText = "LOGOUT";
            }
            updateSortingVisibility();
            return true;
        }
    }
    isPremium = false;
    showAuthForm();
    updateSortingVisibility();
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
        isPremium = true;
        hideAuthForm();
        updateSortingVisibility();
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
        const { data: fetchedTexts, error: textError } = await supabaseClient.rpc('get_simulator_texts', {
            user_key: savedKey
        });

        if (!textError) {
            simulatorTexts.push(...fetchedTexts);
            console.log(`Успешно загружено текстов: ${simulatorTexts.length}`);
        } else {
            console.error("Ошибка при получении текстов:", textError);
        }

    } catch (error) {
        console.error("сломався:", error);
    }
}

function updateSortingVisibility() {
    const filterBlock = document.getElementById('filtered-container');
    if (!filterBlock) return;
    if(isPremium) {
        filterBlock.style.display = 'block';
    } else {
        filterBlock.style.display = 'none';
        resetFilters();

        const categorySelect = document.getElementById("filter-category");
        const levelSelect = document.getElementById("filter-level");
        if (categorySelect) categorySelect.value = "all";
        if(levelSelect) levelSelect.value = "all";
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    initRouter({
        homepage: homePage,
        simulations: simulationPage,
        instructions: instructionsPage
    });
    await checkCurrentAccess();
    await loadAllContent();
});
