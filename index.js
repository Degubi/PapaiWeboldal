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
            fetch('main.html').then(k => k.text()).then(k => {
                contentElement.style.margin = '0px';
                contentElement.innerHTML = k;
            });

            routeButtons[0].className = 'active-route';
            break;
        case 'gallery':
            fetch('gallery.html').then(k => k.text()).then(k => {
                contentElement.style.margin = '24px';
                contentElement.innerHTML = k;
            });

            routeButtons[1].className = 'active-route';
            break;
        case 'about':
            fetch('about.html').then(k => k.text()).then(k => {
                contentElement.style.margin = '24px';
                contentElement.innerHTML = k;
            });

            routeButtons[2].className = 'active-route';
            break;
        case 'contact':
            fetch('contact.html').then(k => k.text()).then(k => {
                contentElement.style.margin = '24px';
                contentElement.innerHTML = k;
            });

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
window.zoomGalleryImage = function(/**@type { HTMLImageElement } */ clickedImage) {
    const scrollY = window.scrollY;
    const removeZoomedImage = () => {
        document.body.style.overflowY = '';
        document.body.removeChild(fullscreenImage);
        document.body.removeChild(modalBackground);
        document.body.removeEventListener('keyup', escapeKeyListener);
    };

    const fullscreenImage = document.createElement('img');
    fullscreenImage.src = clickedImage.src;
    fullscreenImage.style.height = '80%';
    fullscreenImage.style.position = 'absolute';
    fullscreenImage.style.zIndex = '2';
    fullscreenImage.style.top = `calc(${scrollY}px + 50%)`;
    fullscreenImage.style.left = '50%';
    fullscreenImage.style.translate = '-50% -50%';

    const modalBackground = document.createElement('div');
    modalBackground.style.position = 'absolute';
    modalBackground.style.top = `${scrollY}px`;
    modalBackground.style.width = '100%';
    modalBackground.style.height = '100%';
    modalBackground.style.backgroundColor = 'black';
    modalBackground.style.opacity = '0.75';
    modalBackground.style.zIndex = '1';

    const escapeKeyListener = (/** @type { KeyboardEvent } */ e) => {
        if(e.key === 'Escape') {
            removeZoomedImage();
        }
    };

    modalBackground.addEventListener('click', removeZoomedImage);

    document.body.style.overflowY = 'hidden';
    document.body.appendChild(modalBackground);
    document.body.appendChild(fullscreenImage);
    document.body.addEventListener('keyup', escapeKeyListener);
};
