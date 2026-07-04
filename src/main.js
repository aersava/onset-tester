import './security.js';
import {initRouter, navigateTo} from './router.js';
import {
    beginSimulation,
    loadNextText,
    simulatorTexts,
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
const articlesPage = document.getElementById("articles-page");
const ofertaPage = document.getElementById("oferta-page");

const navArticlesBtn = document.getElementById("nav-articles");
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

navArticlesBtn.addEventListener("click", () => navigateTo('articlespage'));
startBtn.addEventListener("click", () => navigateTo('instructions'));
navSimBtn.addEventListener("click", () => navigateTo('instructions'));
homeBtn.addEventListener("click", () => navigateTo('homepage'));
realStartBtn.addEventListener("click", beginSimulation);
login.addEventListener("click", handleLogin);
document.getElementById("toHomeFromOferta")?.addEventListener("click", () => {
    navigateTo('homepage');
});
document.getElementById("open-oferta-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo('ofertapage');
});

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

    try {
        const { data: fetchedArticles, error: articlesError } = await supabaseClient
            .rpc('get_public_articles');

        if (!articlesError && fetchedArticles) {
            const gridContainer = document.getElementById('articles-grid');
            
            if (gridContainer) {
                gridContainer.innerHTML = ''; 

                fetchedArticles.forEach(art => {
                    const card = document.createElement('a');
                    card.href = `article.html?slug=${art.slug}`;
                    card.className = 'article-card';
                    card.style.textDecoration = 'none';

                    card.innerHTML = `
                        <div class="card-inner" style="display: flex; gap: 20px; padding: 15px; background: #E2E2E2; color: #2E2828; border-radius: 8px; margin-bottom: 20px;">
                            <div class="card-image" style="width: 120px; height: 120px; flex-shrink: 0;">
                                <img src="css/workspace.png" alt="Урок" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">
                            </div>
                            <div class="card-text" style="display: flex; flex-direction: column; justify-content: center;">
                                <span style="font-size: 11px; font-family: monospace; background: #2E2828; color: #E2E2E2; padding: 2px 6px; border-radius: 3px; width: fit-content; margin-bottom: 8px;">
                                    ${art.category || 'Grammatik'}
                                </span>
                                <h3 style="margin: 0 0 8px 0; font-size: 20px; font-family: sans-serif; font-weight: bold;">
                                    ${art.title}
                                </h3>
                                <p style="margin: 0; font-size: 14px; line-height: 1.4; color: #4A4A4A;">
                                    ${art.summary}
                                </p>
                            </div>
                        </div>
                    `;
                    gridContainer.appendChild(card);
                });
            }
        } else {
            console.error("Ошибка RPC статей:", articlesError);
        }
    } catch (articleErr) {
        console.error("Не удалось собрать каталог статей:", articleErr);
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

        const levelSelect = document.getElementById("filter-level");
        if(levelSelect) levelSelect.value = "all";
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    initRouter({
        homepage: homePage,
        simulations: simulationPage,
        instructions: instructionsPage,
        articlespage: articlesPage,
        ofertapage: ofertaPage
    });
    if (window.location.hash === '#articlespage') {
        hideAuthForm();
        navigateTo('articlespage');
    } else {
        await checkCurrentAccess();
    }
    await loadAllContent();
});

