let pages = {};

export function initRouter(domPages) {
    pages = domPages;

    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page) {
            switchPage(event.state.page, false);
        } else {
            switchPage('homepage', false);
        }
    });
}

export function navigateTo(pageId) {
    switchPage(pageId, true);
}

function switchPage(pageId, pushToHistory = true) {

    Object.values(pages).forEach(page => {
        if (page) page.style.display = 'none';
    });

    const activePage = pages[pageId];
    if (activePage) {
        activePage.style.display = 'block';
    }

    const navLoginBtn = document.getElementById("nav-login");
    const homeBtn = document.getElementById("toHome");
    const navSimBtn = document.getElementById("nav-simulations");
    const buttonToHide = document.querySelectorAll('.filterable-nav');

    if (pageId === 'instructions' || pageId === 'simulations' || pageId === 'articlespage') {
        buttonToHide.forEach(btn => btn.style.display = 'none');
    } else {
        buttonToHide.forEach(btn => btn.style.display = '');
    }

    if (pushToHistory) {
        history.pushState({ page: pageId }, "", `#${pageId}`);
    }
}
