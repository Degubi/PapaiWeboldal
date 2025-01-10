const contentElement = document.getElementById('content');
const routeButtons = document.getElementById('routesContainer').children;
let currentPagePath = new URLSearchParams(window.location.search).get('page') ?? 'main';

showPage(currentPagePath);
window.history.replaceState(currentPagePath, null, `?page=${currentPagePath}`);
window.addEventListener('popstate', _ => {
    const requestedPage = new URLSearchParams(window.location.search).get('page') ?? 'main';
    currentPagePath = requestedPage;
    showPage();
});

function showPage() {
    Array.prototype.forEach.call(routeButtons, k => k.className = '');

    switch(currentPagePath) {
        case 'main':
            contentElement.innerHTML = 'Epic nagy kép helye';
            routeButtons[0].className = 'active';
            break;
        case 'services':
            contentElement.innerHTML = 'Szolgáltatások leírása';
            routeButtons[1].className = 'active';
            break;
        case 'about':
            contentElement.innerHTML = 'Leírás helye';
            routeButtons[2].className = 'active';
            break;
        case 'contact':
            contentElement.innerHTML = 'Elérhetőségek helye';
            routeButtons[3].className = 'active';
            break;
    }
}

window.routeTo = function(pagePath) {
    contentElement.scrollTo(0, 0);

    if(pagePath !== currentPagePath) {
        window.history.pushState(currentPagePath, null, `?page=${pagePath}`);
        currentPagePath = pagePath;
        return showPage();
    }
};
