import './security.js';
import { getStartSummary } from './simulator.js';
import { initI18n, setLanguage } from '../i18n.js';
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

const authPage = document.getElementById("auth-page");
const authTitle = document.getElementById("auth-title");
const authSubtitle = document.getElementById("auth-subtitle");
const authEmailInput = document.getElementById("auth-email");
const authPasswordInput = document.getElementById("auth-password");
const authSubmitBtn = document.getElementById("auth-action-submit-btn");
const toggleAuthModeBtn = document.getElementById("toggle-auth-mode-btn");
const authSwitchPrompt = document.getElementById("auth-switch-prompt");
const forgotPasswordBtn = document.getElementById("toggle-forgot-password");
const googleLoginBtn = document.getElementById("google-login-btn");

let authMode = "signup";

const instructionsPage = document.getElementById("instructions-page");
const realStartBtn = document.getElementById("start-simulation-btn");

const statsBtn = document.getElementById("nav-stats-btn");
const statsPopup = document.getElementById("stats-popup");
const statsBody = document.getElementById("stats-card-body");
const closeStatsBtn = document.getElementById("close-stats-btn");


const timerCheckBox = document.getElementById("timer-toggle-checkbox");
let isPremium = false;

navArticlesBtn.addEventListener("click", () => navigateTo('articlespage'));
startBtn.addEventListener("click", () => navigateTo('instructions'));
navSimBtn.addEventListener("click", () => navigateTo('instructions'));
homeBtn.addEventListener("click", () => navigateTo('homepage'));
realStartBtn.addEventListener("click", beginSimulation);

document.getElementById('footToHome')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('homepage');
});
document.getElementById('footToSim')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('instructions');
});
document.getElementById('footToTheory')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('articlespage');
});

document.getElementById("toHomeFromOferta")?.addEventListener("click", () => {
    navigateTo('homepage');
});
document.getElementById("open-oferta-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo('ofertapage');
});

document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        const lang = btn.dataset.lang;
        setLanguage(lang);
    });
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

document.getElementById('submit-access-key-btn')?.addEventListener('click', async () => {
    const keyInput = document.getElementById('manual-access-key-input')?.value.trim();
    if (!keyInput) {
        return alert("Bitte gib deinen Zugangsschlüssel ein!");
    }

    // Сохраняем ключ
    localStorage.setItem("user_access_key", keyInput);
    
    // Перезагружаем контент из Supabase
    await loadAllContent();
    
    alert("Schlüssel erfolgreich aktiviert!");
    navigateTo('instructions');
});

//рега и логин
navLoginBtn?.addEventListener("click", async (e) => {
    e.preventDefault();

    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        if (confirm("Möchtest du dich wirklich abmelden?")) {
            await supabaseClient.auth.signOut();
            alert("Erfolgreich abgemeldet.");
            window.location.reload();
        }
    } else {
        navigateTo('authpage');
    }
});

toggleAuthModeBtn?.addEventListener("click", (e) => {
    e.preventDefault();

    if (authMode === "signup") {
        authMode = "login";
        if (authTitle) authTitle.innerText = "ВХОД";
        if (authSubmitBtn) authSubmitBtn.innerText = "ВОЙТИ";
        if (authSwitchPrompt) authSwitchPrompt.innerText = "Нет аккаунта?";
        toggleAuthModeBtn.innerText = "Зарегистрироваться";
        if (forgotPasswordBtn) forgotPasswordBtn.style.display = "inline-block";
    } else {
        authMode = "signup";
        if (authTitle) authTitle.innerText = "НАЧНЕМ?";
        if (authSubmitBtn) authSubmitBtn.innerText = "ЗАРЕГИСТРИРОВАТЬСЯ";
        if (authSwitchPrompt) authSwitchPrompt.innerText = "Уже есть аккаунт?";
        toggleAuthModeBtn.innerText = "Войти";
        if (forgotPasswordBtn) forgotPasswordBtn.style.display = "none";
    }
});

authSubmitBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = authEmailInput?.value.trim();
    const password = authPasswordInput?.value.trim();

    if (!email || !password) {
        return alert("Bitte gib E-Mail und Passwort ein!");
    }
    if (password.length < 6) {
        return alert("Das Passwort muss mindestens 6 Zeichen lang sein!");
    }

    authSubmitBtn.disabled = true;
    authSubmitBtn.innerText = "BITTE WARTEN...";

    try {
        if (authMode === "signup") {
            const { error } = await supabaseClient.auth.signUp({ email, password });
            if (error) throw error;
            alert("Registrierung erfolgreich! Bitte prüfe ggf. dein Postfach 📩");
            navigateTo('homepage');
        } else {
            const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) throw error;
            alert("Erfolgreich angemeldet!");
            navigateTo('homepage');
        }
    } catch (err) {
        alert("Fehler: " + (err.message || "Etwas ist schiefgelaufen"));
    } finally {
        authSubmitBtn.disabled = false;
        authSubmitBtn.innerText = authMode === "signup" ? "ЗАРЕГИСТРИРОВАТЬСЯ" : "ВОЙТИ";
    }
});

googleLoginBtn?.addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });
    if (error) {
        alert("Fehler beim Google-Login: " + error.message);
    }
});

forgotPasswordBtn?.addEventListener("click", async () => {
    const email = authEmailInput?.value.trim();
    if (!email) {
        return alert("Gib bitte zuerst deine E-Mail-Adresse im Feld oben ein.");
    }
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname
    });
    if (error) {
        alert("Fehler: " + error.message);
    } else {
        alert("Ein Link zum Zurücksetzen des Passworts wurde gesendet!");
    }
});


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
        if (!isUserAuthorized) {
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
                    navigateTo('authpage');
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
                    alert("Эта тема заблокирована. Пожалуйста, войдите в аккаунт или проверьте подписки.");
                    navigateTo('authpage');
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
        ofertapage: ofertaPage,
        authpage: authPage
    });
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (session && session.user) {
            isPremium = true;
            if (navLoginBtn) navLoginBtn.innerText = "LOGOUT";
        } else {
            isPremium = false;
            if (navLoginBtn) navLoginBtn.innerText = "LOGIN";
        }
        updateSortingVisibility();
        await loadAllContent();
    });

    const hashPage = window.location.hash.replace('#', '');
    if (hashPage && ['articlespage', 'instructions', 'simulations', 'ofertapage', 'authpage'].includes(hashPage)) {
        navigateTo(hashPage);
    } else {
        navigateTo('homepage');
    }
});

statsBtn?.addEventListener("click", async () => {
    statsPopup.classList.toggle("hidden");
    if (statsPopup.classList.contains("hidden")) return;

    statsBody.innerHTML = "<p>Загрузка...</p>";
    const stats = await getStartSummary();

    if (!stats) {
        statsBody.innerHTML = "<p>Нет решенных тестов или ключ не активирован.</p>";
        return;
    }

    const formatSec = (s) => s ? `${Math.floor(s / 60)}м ${s % 60}с` : '—';

    statsBody.innerHTML = `
        <div style="margin-bottom: 12px;">
            <div style="font-size: 11px; opacity: 0.7;">ПОСЛЕДНИЙ ТЕСТ</div>
            <div style="font-size: 18px; font-weight: bold;">${stats.latest.score} баллов (${formatSec(stats.latest.time)})</div>
        </div>
        <div style="margin-bottom: 12px;">
            <div style="font-size: 11px; opacity: 0.7;">ВЧЕРА</div>
            <div style="font-size: 15px;">${stats.gestern.count > 0 ? `${stats.gestern.count} тестов • ср. ${stats.gestern.avgScore}` : 'Нет попыток'}</div>
        </div>
        <div>
            <div style="font-size: 11px; opacity: 0.7;">ЗА 7 ДНЕЙ</div>
            <div style="font-size: 15px;">${stats.woche.count} тестов • ср. ${stats.woche.avgScore}</div>
        </div>
    `;
});

closeStatsBtn?.addEventListener("click", () => {
    statsPopup.classList.add("hidden");
});

