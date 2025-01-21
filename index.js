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
            contentElement.appendChild(createPreloadElement('assets/about/shop.webp', 'image'));

            fetch('about.html').then(k => k.text()).then(k => {
                contentElement.style.margin = '24px';
                contentElement.innerHTML = k;
            });

            routeButtons[2].className = 'active-route';
            break;
        case 'contact':
            const preconnect = document.createElement('link');
            preconnect.href = 'https://www.google.com';
            preconnect.toggleAttribute('crossorigin');
            contentElement.appendChild(preconnect);

            fetch('contact.html').then(k => k.text()).then(k => {
                contentElement.style.margin = '24px';
                contentElement.innerHTML = k;

                const now = new Date();
                const currentDayRow = document.getElementById(`day-${now.getDay()}`);
                const currentOpeningStatusElement = document.getElementById('current-opening-status');
                const currentDayHourText = currentDayRow.lastElementChild.innerText;

                if(currentDayHourText === 'Zárva' && !isStoreOpen(currentDayHourText, now)) {
                    currentOpeningStatusElement.innerText = 'Zárva';
                    currentOpeningStatusElement.style.color = 'red';
                }else{
                    currentOpeningStatusElement.innerText = 'Nyitva';
                    currentOpeningStatusElement.style.color = 'green';
                }

                currentDayRow.style.fontWeight = 'bold';
            });

            routeButtons[3].className = 'active-route';
            break;
    }
}

/**
  * @param { string } currentDayHourText
  * @param { Date } now
  */
function isStoreOpen(currentDayHourText, now) {
    if(currentDayHourText === 'Zárva') {
        return true;
    }

    const dashIndex = currentDayHourText.indexOf('-');
    const openingMinutes = parseTimeAsMinutes(currentDayHourText.substring(0, dashIndex));
    const closingMinutes = parseTimeAsMinutes(currentDayHourText.substring(dashIndex + 1));
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    return nowMinutes >= openingMinutes && nowMinutes <= closingMinutes;
}

/** @param { string } text */
function parseTimeAsMinutes(text) {
    const separator = text.indexOf(':');

    return Number.parseInt(text.substring(0, separator)) * 60 + Number.parseInt(text.substring(separator + 1));
}

function createPreloadElement(path, type) {
    const element = document.createElement('link');
    element.rel = 'preload';
    element.href = path;
    element.as = type;
    return element;
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
    fullscreenImage.style.position = 'absolute';
    fullscreenImage.style.zIndex = '2';
    fullscreenImage.style.top = `calc(${scrollY}px + 50%)`;
    fullscreenImage.style.left = '50%';
    fullscreenImage.style.translate = '-50% -50%';

    if(window.innerWidth < window.innerHeight) {
        fullscreenImage.style.width = '80%';
    }else{
        fullscreenImage.style.height = '80%';
    }

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
