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

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const navContainer = document.getElementById("nav-container");
    const navLinks = document.querySelectorAll("#nav-container a");

    if(menuToggle && navContainer) {
        menuToggle.addEventListener("click", () => {
            menuToggle.classList.toggle("active");
            navContainer.classList.toggle("active");
        });

        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                menuToggle.classList.remove("active");
                navContainer.classList.remove("active");
            });
        });
    }
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
            simulatorTexts.length = 0; 
            simulatorTexts.push(...fetchedTexts);
            console.log(`Успешно загружено текстов: ${simulatorTexts.length}`);
        } else {
            console.error("Ошибка при получении текстов:", textError);
        }

    } catch (error) {
        console.error("сломався:", error);
    }

    await loadArticlesGrid();
}

async function loadArticlesGrid() {
    const articlesGrid = document.getElementById("articles-grid");
    if (!articlesGrid) return;

    const savedKey = localStorage.getItem("user_access_key") || "no_key_provided";
    articlesGrid.innerHTML = "<p>Загрузка доступных тем...</p>";

    try {
        const { data: articles, error } = await supabaseClient
            .rpc('get_articles_preview', { user_key: savedKey });

        if (error || !articles) {
            articlesGrid.innerHTML = "<p>Не удалось загрузить темы. Пожалуйста, обновите страницу.</p>";
            console.error("Ошибка RPC статей:", error);
            return;
        }

        articlesGrid.innerHTML = "";

        const isUserAuthorized = articles.length > 0 ? !articles[0].is_locked : false;

        let warningBanner = document.getElementById("articles-auth-banner");
        const isAuthFormVisible = authSection && (authSection.style.display === "block");
        if (!isUserAuthorized && !isAuthFormVisible) {
            if (!warningBanner) {
                warningBanner = document.createElement("div");
                warningBanner.id = "articles-auth-banner";
                warningBanner.className = "auth-warning-banner";
                warningBanner.innerHTML = `
                    <span>Надо войти, чтобы прочитать теорию и открыть упражнения!</span>
                    <button id="go-to-auth-btn">ВОЙТИ</button>
                `;
                const container = document.querySelector(".articles-container");
                if (container) {
                    container.insertBefore(warningBanner, container.firstChild);
                }

                document.getElementById("go-to-auth-btn")?.addEventListener("click", () => {
                    showAuthForm();
                    authSection.scrollIntoView({ behavior: "smooth" });
                    warningBanner.remove();
                });
            }
        } else {
            if (warningBanner) warningBanner.remove();
        }

        articles.forEach(art => {
            const card = document.createElement(art.is_locked ? "div" : "a");
            card.className = `article-card ${art.is_locked ? "locked" : ""}`;
            
            if (!art.is_locked) {
                card.href = `article.html?slug=${art.slug}`;
            }

            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-text">
                        <span class="card-category">
                            ${art.category || 'Grammatik'}
                        </span>
                        <h3 class="card-title">
                            ${art.title}
                        </h3>
                        <p class="card-summary">
                            ${art.summary}
                        </p>
                    </div>
                </div>
            `;

            if (art.is_locked) {
                card.addEventListener("click", () => {
                    alert("Эта тема заблокирована. Пожалуйста, введите ваш Ключ доступа вверху сайта.");
                    showAuthForm();
                    authSection.scrollIntoView({ behavior: "smooth" });
                });
            }

            articlesGrid.appendChild(card);
        });

    } catch (err) {
        console.error("Не удалось собрать каталог статей:", err);
        articlesGrid.innerHTML = "<p>Что-то пошло не так при загрузке тем.</p>";
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

