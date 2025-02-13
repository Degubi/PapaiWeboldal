const contentElement = document.getElementsByTagName('main')[0];
const routeButtons = document.getElementById('routesContainer').children;
const isMobile = window.matchMedia('(max-width: 768px)').matches;
let currentPagePath = new URLSearchParams(window.location.search).get('page') ?? 'main';
let activeSlideOrdinal = 1;

showCurrentPage();
window.history.replaceState(currentPagePath, null, `?page=${currentPagePath}`);
window.addEventListener('popstate', _ => {
    const requestedPage = new URLSearchParams(window.location.search).get('page') ?? 'main';
    currentPagePath = requestedPage;
    showCurrentPage();
});

function showCurrentPage() {
    Array.prototype.forEach.call(routeButtons, k => k.className = '');

    switch(currentPagePath) {
        case 'main':
            fetch('pages/main.html').then(k => k.text()).then(k => {
                contentElement.style.margin = '0px';
                contentElement.innerHTML = k;
            });

            routeButtons[0].className = 'active-route';
            document.title = 'Pápai Fázismester Kft.';
            break;
        case 'gallery':
            fetch('pages/gallery.html').then(k => k.text()).then(k => {
                contentElement.style.margin = '24px';
                contentElement.innerHTML = k;
            });

            routeButtons[1].className = 'active-route';
            document.title = 'Galéria - Pápai Fázismester Kft.';
            break;
        case 'about':
            contentElement.appendChild(createPreloadElement('assets/about/shop.webp', 'image'));

            fetch('pages/about.html').then(k => k.text()).then(k => {
                contentElement.style.margin = '24px';
                contentElement.innerHTML = k;
            });

            routeButtons[2].className = 'active-route';
            document.title = 'Rólunk - Pápai Fázismester Kft.';
            break;
        case 'contact':
            const preconnect = document.createElement('link');
            preconnect.href = 'https://www.google.com';
            preconnect.toggleAttribute('crossorigin');
            contentElement.appendChild(preconnect);

            fetch('pages/contact.html').then(k => k.text()).then(k => {
                contentElement.style.margin = '24px';
                contentElement.innerHTML = k;

                const now = new Date();
                const currentDayRow = document.getElementById(`day-${now.getDay()}`);
                const currentOpeningStatusElement = document.getElementById('current-opening-status');
                const currentDayHourText = currentDayRow.lastElementChild.innerText;

                if(currentDayHourText === 'Zárva' || !isStoreOpen(currentDayHourText, now)) {
                    currentOpeningStatusElement.innerText = 'Zárva';
                    currentOpeningStatusElement.style.color = 'red';
                }else{
                    currentOpeningStatusElement.innerText = 'Nyitva';
                    currentOpeningStatusElement.style.color = 'green';
                }

                currentDayRow.style.fontWeight = 'bold';
            });

            routeButtons[3].className = 'active-route';
            document.title = 'Elérhetőség - Pápai Fázismester Kft.';
            break;
    }
}

/**
 * @param { string } currentDayHourText
 * @param { Date } now
 */
function isStoreOpen(currentDayHourText, now) {
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

/**
 * @param { string } path
 * @param { string } type
 */
function createPreloadElement(path, type) {
    const element = document.createElement('link');
    element.rel = 'preload';
    element.href = path;
    element.as = type;
    return element;
}

/** @param { number } n */
function showSlide(n) {
    /** @type { HTMLCollectionOf<HTMLImageElement> } */// @ts-ignore
    const slideImages = document.getElementsByClassName('slide-element');
    const dots = document.getElementsByClassName('dot');
    const slideCount = slideImages.length;

    activeSlideOrdinal = n > slideCount ? 1 : n < 1 ? slideCount : activeSlideOrdinal;

    const imageToDisplay = slideImages[activeSlideOrdinal - 1];
    if(imageToDisplay.complete) {
        handleActiveImageChange(slideImages, dots);
    }else{
        imageToDisplay.removeAttribute('loading');
        imageToDisplay.addEventListener('load', _ => handleActiveImageChange(slideImages, dots));
    }
}

/**
 * @param { HTMLCollectionOf<HTMLImageElement> } slideImages
 * @param { HTMLCollectionOf<Element> } dots
 */
function handleActiveImageChange(slideImages, dots) {
    const slideCount = slideImages.length;

    for(let i = 0; i < slideCount; ++i) {
        slideImages[i].style.display = 'none';
        dots[i].classList.remove('active');
    }

    slideImages[activeSlideOrdinal - 1].style.display = 'block';
    dots[activeSlideOrdinal - 1].classList.add('active');
}

/** @param { HTMLImageElement } clickedImage */
function zoomGalleryImage(clickedImage) {
    const scrollY = window.scrollY;
    const removeZoomedImage = () => {
        document.body.style.overflowY = '';
        document.body.removeChild(fullscreenImage);
        document.body.removeChild(modalBackground);
        document.body.removeChild(closeButton);
        document.body.removeEventListener('keyup', escapeKeyListener);
    };

    const fullscreenImage = document.createElement('img');
    fullscreenImage.src = clickedImage.src.replace('.webp', '_hd.webp');
    fullscreenImage.style.position = 'absolute';
    fullscreenImage.style.zIndex = '2';
    fullscreenImage.style.top = `calc(${scrollY}px + 50%)`;
    fullscreenImage.style.left = '50%';
    fullscreenImage.style.translate = '-50% -50%';

    if(window.innerWidth < window.innerHeight) {
        fullscreenImage.style.width = '80%';
    }else{
        fullscreenImage.style.height = '80dvh';
    }

    const modalBackground = document.createElement('div');
    modalBackground.style.position = 'absolute';
    modalBackground.style.top = `${scrollY}px`;
    modalBackground.style.width = '100%';
    modalBackground.style.height = '100dvh';
    modalBackground.style.backgroundColor = 'black';
    modalBackground.style.opacity = '0.75';
    modalBackground.style.zIndex = '1';

    const escapeKeyListener = (/** @type { KeyboardEvent } */ e) => {
        if(e.key === 'Escape') {
            removeZoomedImage();
        }
    };

    modalBackground.addEventListener('click', removeZoomedImage);

    const closeButton = document.createElement('div');
    closeButton.style.position = 'absolute';
    closeButton.style.right = '32px';
    closeButton.style.top = `${scrollY + 32}px`;
    closeButton.style.color = 'white';
    closeButton.style.cursor = 'pointer';
    closeButton.style.zIndex = '2';
    closeButton.style.fontSize = '22px';
    closeButton.innerText = 'X';
    closeButton.addEventListener('click', removeZoomedImage);

    document.body.style.overflowY = 'hidden';
    document.body.appendChild(modalBackground);
    document.body.appendChild(fullscreenImage);
    document.body.appendChild(closeButton);
    document.body.addEventListener('keyup', escapeKeyListener);
};

function preloadSlideByOffset(offset) {
    /** @type { HTMLCollectionOf<HTMLImageElement> } */// @ts-ignore
    const slideImages = document.getElementsByClassName('slide-element');
    const slideCount = slideImages.length;
    const slideOrdinal = activeSlideOrdinal + offset;
    const checkedSlideOrdinal = slideOrdinal > slideCount ? 1 : slideOrdinal < 1 ? slideCount : slideOrdinal;

    contentElement.appendChild(createPreloadElement(slideImages[checkedSlideOrdinal - 1].src, 'image'));
}


window.customElements.define('gallery-section', class extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const titleElement = document.createElement('h2');
        titleElement.className = 'gallery-section-title';
        titleElement.innerText = this.getAttribute('section-title');

        const placeholder = document.createElement('div');
        placeholder.className = 'gallery-section-placeholder';
        placeholder.innerHTML = !isMobile ? '<div class = "gallery-section-placeholder-divider" style = "left: 23%;"></div>' +
                                            '<div class = "gallery-section-placeholder-divider" style = "left: 48%;"></div>' +
                                            '<div class = "gallery-section-placeholder-divider" style = "left: 74%;"></div>' : '';
        this.style.display = 'block';
        this.appendChild(titleElement);
        this.appendChild(placeholder);

        /** @type { HTMLCollectionOf<HTMLOptionElement> } */
        const imageOptions = document.getElementById(this.getAttribute('section-data-list')).options;
        let loadedImages = 0;

        const imageElements = Array.prototype.reduce.call(imageOptions, (/** @type { HTMLImageElement[] } */ result, /** @type { HTMLOptionElement } */ k) => {
            const image = document.createElement('img');
            image.className = 'gallery-image';
            image.src = `assets/gallery/${k.value}`;
            image.alt = k.innerText;
            image.addEventListener('click', e => zoomGalleryImage(e.target));
            image.addEventListener('load', _ => {
                ++loadedImages;

                if(loadedImages === imageOptions.length) {
                    this.removeChild(placeholder);
                    imageElements.forEach(k => k.style.display = 'inline');
                }
            });

            result.push(image);
            this.appendChild(image);
            return result;
        }, []);
    }
});

window.togglePhoneNavigation = function() {
    Array.prototype.forEach.call(routeButtons, k => {
        if(!k.classList.contains('active-route')) {
            k.style.display = k.style.display === 'none' || k.style.display === '' ? 'block' : '';
        }
    });
};

window.routeTo = function(event, /** @type { string } */ pagePath) {
    event.preventDefault();
    contentElement.scrollTo(0, 0);

    if(pagePath !== currentPagePath) {
        window.history.pushState(currentPagePath, null, `?page=${pagePath}`);
        currentPagePath = pagePath;
        showCurrentPage();
    }

    if(document.getElementById('phoneRoutesButton').offsetParent !== null) {
        Array.prototype.forEach.call(routeButtons, k => {
            if(!k.classList.contains('active-route')) {
                k.style.display = '';
            }
        });
    }
};

window.nthSlide = function(n) { showSlide(activeSlideOrdinal = n); };
window.preloadSlideByOffset = function(n) { preloadSlideByOffset(n); }
window.slideByOffset = function(offset) {
    showSlide(activeSlideOrdinal += offset);
    preloadSlideByOffset(offset);
};
