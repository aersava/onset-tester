export const translations = {
  de: {
    toHome: "HOME",
    toAbout: "ÜBER UNS",
    navSim: "SIMULATOR",
    contacts: "KONTAKT",
    navArticles: "THEORIE",
    navLogin: "LOGIN",

    authTitle: "Los geht's!",
    googleBtn: "Mit Google fortfahren",
    divider: "oder",
    passwordLabel: "Passwort",
    passwordPlaceholder: "Mindestens 6 Zeichen",
    authSubmit: "REGISTRIEREN",
    forgotPass: "Passwort vergessen?",
    switchPrompt: "Bereits registriert?",
    switchLink: "Einloggen",

    heroDesc: "Ein interaktiver C-Test-Simulator zur gezielten Vorbereitung auf den onSET-Sprachtest.",
    losgehtBtn: "JETZT TESTEN",

    aboutTitle: "ÜBER UNS",
    aboutText: "Die meisten Sprachplattformen sind mit unnötiger Theorie überladen, und Sprachunterricht kostet Hunderte Euro. Dieses Projekt zeigt, dass die Vorbereitung auf anspruchsvolle Lückentexte effektiv, zugänglich und ästhetisch sein kann. Keine Ablenkung – nur gezieltes Training des Sprachgefühls, das Zeit und Geld spart.",
    plusesTitle: "WAS GIBT ES HIER?",
    plus1Title: "Prüfungsnah",
    plus1Desc: "Vollständige Simulation des echten onSET-Tests mit Countdown-Timer, damit du in der Prüfung sicher bleibst.",
    plus2Title: "Umfangreiche Praxis",
    plus2Desc: "Über 200 Texte für verschiedene Niveaustufen und Themenbereiche.",
    plus3Title: "Fokussiertes Design",
    plus3Desc: "Minimalistisches UI ohne Ablenkungen für maximale Konzentration auf Grammatik und Schnelligkeit.",

    timerLabel: "Timer aktivieren",
    startBtn: "Test starten",

    // Theorie
    articlesSub: "Lernmaterialien & Grammatik-Tipps für DaF-Lernende:",
    articlesLoading: "Themen werden geladen...",


    ofertaLink: "Rechtliche Hinweise / Оферта"
  },
  ru: {

    toHome: "ГЛАВНАЯ",
    toAbout: "О НАС",
    navSim: "СИМУЛЯТОР",
    contacts: "КОНТАКТЫ",
    navArticles: "ТЕОРИЯ",
    navLogin: "ВХОД",

    authTitle: "Начнем?",
    googleBtn: "Продолжить через Google",
    divider: "или",
    passwordLabel: "Пароль",
    passwordPlaceholder: "Минимум 6 символов",
    authSubmit: "ЗАРЕГИСТРИРОВАТЬСЯ",
    forgotPass: "Забыли пароль?",
    switchPrompt: "Уже есть аккаунт?",
    switchLink: "Войти",

    heroDesc: "Это независимый интерактивный тренажер, созданный специально для тех, кто готовится к сдаче экзамена onSET",
    losgehtBtn: "ПОПРОБОВАТЬ",

    aboutTitle: "ABOUT US",
    aboutText: "Большинство языковых платформ перегружены лишней теорией, а наем репетиторов обходится в сотни евро. Этот проект доказывает, что подготовка к сложному Lückentext может быть эффективной, доступной и эстетичной. В основе симулятора лежит умный алгоритм и реальная база заданий. Никакой воды — только целенаправленная тренировка языкового чутья, которая сэкономит ваше время и деньги, превращая рутину в понятный пошаговый процесс.",

    plusesTitle: "WAS GIBT ES HIER?",
    plus1Title: "Прям как на тесте",
    plus1Desc: "Полная имитация реального теста с учетом всех нюансов, что поможет не растеряться на распределительном тесте",
    plus2Title: "Куча практики",
    plus2Desc: "Более 200 текстов для практики, охватывающих широкий спектр тем и уровней сложности",
    plus3Title: "Простота дизайна",
    plus3Desc: "Минимум деталей, чтобы ничего не отвлекало при отработке грамматики и скорости решения теста",

    timerLabel: "Включить таймер",
    startBtn: "Test starten",

    articlesSub: "Выбери тему, чтобы разогреть мозг перед симулятором:",
    articlesLoading: "Загрузка доступных тем...",

    ofertaLink: "Публичная оферта"
  }
};

export function setLanguage(lang) {
  const t = translations[lang];
  if (!t) return;

  // nav
  const toHome = document.getElementById("toHome");
  if (toHome) toHome.textContent = t.toHome;
  const toAbout = document.getElementById("toAbout");
  if (toAbout) toAbout.textContent = t.toAbout;
  const navSim = document.getElementById("nav-simulations");
  if (navSim) navSim.textContent = t.navSim;
  const contacts = document.getElementById("contacts");
  if (contacts) contacts.textContent = t.contacts;
  const navArticles = document.getElementById("nav-articles");
  if (navArticles) navArticles.textContent = t.navArticles;
  const navLogin = document.getElementById("nav-login");
  if (navLogin) navLogin.textContent = t.navLogin;

  const heroDesc = document.querySelector(".hero-description");
  if (heroDesc) heroDesc.textContent = t.heroDesc;
  const losgehtBtn = document.getElementById("losgeht_btn");
  if (losgehtBtn) losgehtBtn.textContent = t.losgehtBtn;

  // About us
  const aboutTitle = document.querySelector(".about-content h2");
  if (aboutTitle) aboutTitle.textContent = t.aboutTitle;
  const aboutText = document.querySelector(".about-text");
  if (aboutText) aboutText.textContent = t.aboutText;

  // Pluses
  const plusesTitle = document.querySelector(".pluses-section h2");
  if (plusesTitle) plusesTitle.textContent = t.plusesTitle;

  const plusTitles = document.querySelectorAll(".plus-description");
  const plusDetails = document.querySelectorAll(".plus-details");
  if (plusTitles[0]) plusTitles[0].textContent = t.plus1Title;
  if (plusDetails[0]) plusDetails[0].textContent = t.plus1Desc;
  if (plusTitles[1]) plusTitles[1].textContent = t.plus2Title;
  if (plusDetails[1]) plusDetails[1].textContent = t.plus2Desc;
  if (plusTitles[2]) plusTitles[2].textContent = t.plus3Title;
  if (plusDetails[2]) plusDetails[2].textContent = t.plus3Desc;

  const timerLabel = document.querySelector(".timer_simulation_btn label");
  const timerCheckbox = document.getElementById("timer-toggle-checkbox");
  if (timerLabel && timerCheckbox) {
    timerLabel.innerHTML = "";
    timerLabel.appendChild(timerCheckbox);
    timerLabel.append(" " + t.timerLabel);
  }

  // theorie
  const articlesSub = document.querySelector("#articles-page p");
  if (articlesSub) articlesSub.textContent = t.articlesSub;

  // footer
  const openOfertaBtn = document.getElementById("open-oferta-btn");
  if (openOfertaBtn) openOfertaBtn.textContent = t.ofertaLink;

  const authTitle = document.getElementById("auth-title");
  if (authTitle) authTitle.textContent = t.authTitle;
  const authDivider = document.querySelector(".auth-divider-line span");
  if (authDivider) authDivider.textContent = t.divider;
  const passInput = document.getElementById("auth-password");
  if (passInput) passInput.placeholder = t.passwordPlaceholder;
  const authSubmitBtn = document.getElementById("auth-action-submit-btn");
  if (authSubmitBtn) authSubmitBtn.textContent = t.authSubmit;
  const forgotPassLink = document.getElementById("toggle-forgot-password");
  if (forgotPassLink) forgotPassLink.textContent = t.forgotPass;
  const switchPrompt = document.getElementById("auth-switch-prompt");
  if (switchPrompt) switchPrompt.textContent = t.switchPrompt;
  const switchLink = document.getElementById("toggle-auth-mode-btn");
  if (switchLink) switchLink.textContent = t.switchLink;

  localStorage.setItem("lucken_lang", lang);
}

export function initI18n() {
  const savedLang = localStorage.getItem("lucken_lang") || "de";
  setLanguage(savedLang);
}
