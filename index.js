const contentElement = document.getElementById('content');
const routeButtons = document.getElementById('routesContainer').children;
let currentPagePath = new URLSearchParams(window.location.search).get('page') ?? 'main';
let slideIndex = 1;

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
            contentElement.style.margin = '0px';
            fetch('main.html').then(k => k.text()).then(k => contentElement.innerHTML = k);
            routeButtons[0].className = 'active-route';
            break;
        case 'gallery':
            contentElement.style.margin = '24px 16%';
            fetch('gallery.html').then(k => k.text()).then(k => contentElement.innerHTML = k);
            routeButtons[1].className = 'active-route';
            break;
        case 'about':
            contentElement.style.margin = '24px 64px';
            fetch('about.html').then(k => k.text()).then(k => contentElement.innerHTML = k);
            routeButtons[2].className = 'active-route';
            break;
        case 'contact':
            contentElement.style.margin = '24px';
            fetch('contact.html').then(k => k.text()).then(k => contentElement.innerHTML = k);
            routeButtons[3].className = 'active-route';
            break;
    }
}

function showSlide(n) {
    const slides = document.getElementsByClassName('slide-element');
    const dots = document.getElementsByClassName('dot');
    const slideCount = slides.length;

    if(n > slideCount) {
        slideIndex = 1;
    }

    if(n < 1) {
        slideIndex = slideCount;
    }

    for(let i = 0; i < slideCount; ++i) {
        slides[i].style.display = 'none';
        dots[i].classList.remove('active');
    }

    slides[slideIndex - 1].style.display = 'block';
    dots[slideIndex - 1].classList.add('active');
}


window.routeTo = function(pagePath) {
    contentElement.scrollTo(0, 0);

    if(pagePath !== currentPagePath) {
        window.history.pushState(currentPagePath, null, `?page=${pagePath}`);
        currentPagePath = pagePath;
        return showPage();
    }
};

window.slideByOffset = function(n) { showSlide(slideIndex += n); };
window.nthSlide = function(n) { showSlide(slideIndex = n); };
