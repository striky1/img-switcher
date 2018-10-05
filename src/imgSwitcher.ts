import Timer = NodeJS.Timer;

// Polyfill for Element.closest()
if (!Element.prototype.closest) {
    Element.prototype.closest = function (s: any) {
        let el = this;
        if (!document.documentElement.contains(el)) {
            return null;
        }
        do {
            if (el.matches(s)) {
                return el;
            }
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

export interface ImgSwitcherOptions {
    attributes: ImgSwitcherAttributes;
    breakpoints?: Array<number>;
    cssClass?: string;
    cssStyleClass?: string;
    closestCssStyleClass?: {
        find: string,
        remove: string
    };
    observerOptions?: string;
    enableLazyLoadOnAllImages?: boolean;
    debug?: boolean;
    multiplier?: Array<number>;
}

export interface ImgSwitcherAttributes {
    breakpoints: string;
    lastBreakpoint: string;
    multipliers: string;
    targetExtension: string;
    lazyLoading: string;
}

/**
 * Image Switcher
 *
 * On IMG or SVG tag is automatically loaded closest best resolution of image by width of his parent.
 * On DIV tag is closest best resolution by width of itself.
 *
 * Name of file in situation of three breakpoints (320, 960, 1280) and for @1x, @2x multipliers is:
 *      - nameOfImage.jpg (base most downsized image for first load of page)
 *      - nameOfImage-320.jpg (image until 320px breakpoint)
 *      - nameOfImage-320@2x.jpg (image until 320px breakpoint but for retina displays, so with doubled resolution)
 *      - nameOfImage-960.jpg (image from 321px and until 960px breakpoint)
 *      - nameOfImage-960@2x.jpg (image from 321px and until 960px breakpoint but for retina displays, so with doubled resolution)
 *      - nameOfImage-1280.jpg (image from 961px breakpoint)
 *      - nameOfImage-1280@2x.jpg (image from 961px breakpoint but for retina displays, so with doubled resolution)
 *
 * Possible global options:
 *      - attributes = list of name data attributes, see described bellow
 *      - breakpoints = list of breakpoints, which you want to handle
 *      - cssClass = base class selector for ImgSwitcher
 *      - cssStyleClass = class which is removed from image when is loaded new image
 *      - debug = boolean for enable/disable echo to console.log some part of code for debugging
 *      - multiplier = list of resolution multipliers, which you want to handle, e.g. retina display (@2, @3, etc.)
 *
 * Also, you can set name of data attributes on image for specify separately settings for each of images:
 *      - data-img-switcher-bp = list of breakpoints divided by comma (e.g.: "320,640,960")
 *      - data-img-switcher-lbp = last used breakpoint
 *      - data-img-switcher-mp = list of multipliers divided by commma (e.g.: "1,2,3")
 *      - data-img-switcher-te = target extension it is used for example for SVG elements, where you must to define
 *                               which type of new image will be loaded (e.g.: "png", "jpg", etc.)
 *
 * @author Lukáš Strišovský, 2018 <info@striky.sk>
 * @license The MIT License, see LICENSE for more information
 */
export class ImgSwitcher {

    private static instance: ImgSwitcher;
    private options: ImgSwitcherOptions = {
        attributes: {
            breakpoints: 'data-img-switcher-bp',
            lastBreakpoint: 'data-img-switcher-lbp',
            multipliers: 'data-img-switcher-mp',
            targetExtension: 'data-img-switcher-te',
            lazyLoading: 'data-img-switcher-ll'
        },
        breakpoints: [320, 640, 768, 1024, 1280, 1920],
        cssClass: 'js-img-switcher',
        cssStyleClass: 'o-img-switcher',
        closestCssStyleClass: {
            find: 'o-loader',
            remove: 'o-loader--is-loading'
        },
        observerOptions: '200% 0% 200%',
        enableLazyLoadOnAllImages: true,
        debug: false,
        multiplier: [1, 2]
    };
    private images: HTMLElement[] = [];
    private multiplier: number;

    public observer: IntersectionObserver;

    private constructor() {}

    public static getInstance(): ImgSwitcher {
        if (!ImgSwitcher.instance) {
            ImgSwitcher.instance = new ImgSwitcher();
        }
        return ImgSwitcher.instance;
    }

    public static isResMultiplied(pixelRatio: number): boolean {
        const dpi = pixelRatio * 96;
        pixelRatio = pixelRatio - 0.75;

        return ((window.matchMedia &&
                (window.matchMedia(
                    'only screen and (min-resolution: ' + dpi + 'dpi), only screen and (min-resolution: 2dppx), ' +
                    'only screen and (min-resolution: ' + (dpi / 2.54) + 'dpcm)').matches
                    || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: ' + pixelRatio + '), ' +
                        'only screen and (-o-min-device-pixel-ratio: ' + (pixelRatio * 4) + '/4), ' +
                        'only screen and (min--moz-device-pixel-ratio: ' + pixelRatio + '), ' +
                        'only screen and (min-device-pixel-ratio: ' + pixelRatio + ')').matches)
            )
            || (window.devicePixelRatio && window.devicePixelRatio >= pixelRatio));
    }

    private static getClosestValueCeil(width: number, breakpoints: Array<number>): number {
        let higherMinValue = null,
            lowerMaxValue = null;

        for (const breakpoint of breakpoints) {
            if (breakpoint >= width && higherMinValue === null) {
                higherMinValue = breakpoint;
                break;
            }

            if (breakpoint < width && (lowerMaxValue === null || breakpoint > lowerMaxValue)) {
                lowerMaxValue = breakpoint;
            }
        }

        return higherMinValue !== null ? higherMinValue : lowerMaxValue;
    }

    private initIntersectionObserver(): void {
        if (this.options.observerOptions) {
            this.observer = new IntersectionObserver(
                    this.onEntryIntersectionObserver,
                    {rootMargin: this.options.observerOptions}
                );

            if (this.images.length > 0) {
                let tempImages: HTMLElement[] = [];

                for (const image of this.images) {
                    if (this.enabledLazyLoad(image)) {
                        this.observer.observe(image);
                    } else {
                        tempImages.push(image);
                    }
                }

                this.images = tempImages;
                tempImages = null;
            }
        }
    }

    private enabledLazyLoad(el: HTMLElement): boolean {
        let result = false;

        if (this.options.enableLazyLoadOnAllImages) {
            if (el.hasAttribute(this.options.attributes.lazyLoading)
                && el.getAttribute(this.options.attributes.lazyLoading) === 'true') {
                result = true;
            } else {
                result = true;
            }
        } else {
            if (el.hasAttribute(this.options.attributes.lazyLoading)
                && el.getAttribute(this.options.attributes.lazyLoading) === 'true') {
                result = true;
            }
        }

        return result;
    }

    private onEntryIntersectionObserver(entry: IntersectionObserverEntry[]): void {
        entry.forEach((change: IntersectionObserverEntry) => {
            if (change.intersectionRatio) {
                const imgSwitcherInstance = ImgSwitcher.getInstance();

                imgSwitcherInstance.runImgSwitcher([change.target as HTMLElement]);
                imgSwitcherInstance.observer.unobserve(change.target);
            }
        });
    }

    private removeClosestClass(el: HTMLElement): void {
        const closestEl = el.closest('.' + this.options.closestCssStyleClass.find);
        if (closestEl) {
            closestEl.classList.remove(this.options.closestCssStyleClass.remove);
        }
    }

    public initImgSwitcher(): void {
        this.getImages();
        this.getMultiplier();

        this.callDebug([
            'Images: ' + this.images,
            'Multiplier: ' + this.multiplier
        ]);

        this.runImgSwitcher();
    }

    public runImgSwitcher(images = this.images): void {
        if (images.length > 0) {
            for (const image of images) {
                const imageLastBreakpoint = parseInt(image.getAttribute(this.options.attributes.lastBreakpoint), 10),
                    imageTargetExtension = image.getAttribute(this.options.attributes.targetExtension) ? image.getAttribute(this.options.attributes.targetExtension) : null;

                let imageWidth = 0,
                    imageSrc = '',
                    imageMultiplier = this.multiplier,
                    imageBreakpoints = this.options.breakpoints,
                    imageMultiplierString = '';

                // Get Element width and src by type of Element
                if (image.tagName === 'IMG') {
                    imageWidth = image.parentElement.clientWidth;
                    imageSrc = image.getAttribute('src');
                } else if (image.tagName === 'svg') {
                    imageWidth = image.parentElement.clientWidth;
                    imageSrc = image.getAttribute('data-src');
                } else {
                    imageWidth = image.clientWidth;
                    imageSrc = getComputedStyle(image).backgroundImage;
                }

                // Check if we have probably correct src, if not, skip this image
                if (imageSrc === null || imageSrc.trim() === '' || imageSrc === 'none') {
                    continue;
                }

                // Try find separately defined multipliers
                if (image.hasAttribute(this.options.attributes.multipliers)) {
                    imageMultiplier = this.getMultiplier(image.getAttribute(this.options.attributes.multipliers).split(',').map((multiplier) => parseInt(multiplier, 10)));
                }

                // Add multiplier to name of file
                if (imageMultiplier > 1) {
                    imageMultiplierString += '@' + imageMultiplier + 'x';
                }

                // Try find separately defined breakpoints
                if (image.hasAttribute(this.options.attributes.breakpoints)) {
                    imageBreakpoints = image.getAttribute(this.options.attributes.breakpoints).split(',').map((multiplier) => parseInt(multiplier, 10));
                }

                // Get target breakpoint/width
                const targetBreakpoint = ImgSwitcher.getClosestValueCeil(imageWidth, imageBreakpoints);

                // If we have another width as we need, try change it
                if (imageLastBreakpoint !== targetBreakpoint) {
                    // Remove old resolution from src and set new one
                    let newImageSrc = imageSrc
                            .replace('-' + imageLastBreakpoint + imageMultiplierString, '')
                            .replace(/.([^.]+).?$/g, '-' + targetBreakpoint + imageMultiplierString +
                                (imageTargetExtension ? '.' + imageTargetExtension : imageSrc.match(/.([^.]+).?$/g)[0])),
                        newImage = new Image();

                    // Save new resolution to attribute
                    image.setAttribute(this.options.attributes.lastBreakpoint, targetBreakpoint.toString());

                    // Create new temporary image and load him, after that switch loaded image with current
                    if (image.tagName === 'IMG') {
                        newImage.src = newImageSrc;
                        newImage.onload = ((img, newImgSrc) => () => {
                                img.setAttribute('src', newImgSrc);
                                img.classList.remove(this.options.cssStyleClass);

                                if (this.enabledLazyLoad(img)) {
                                    this.removeClosestClass(img);
                                }

                                newImage = null;
                            }
                        )(image, newImageSrc);
                    } else if (image.tagName === 'svg') {
                        newImage.src = newImageSrc;
                        newImage.onload = ((img, newImgSrc) => () => {
                                // In SVG situation we must create new img Element
                                let newChildImg = document.createElement('img');
                                newChildImg.src = newImgSrc;

                                // Preserve all classes
                                for (let y = 0; y < img.classList.length; y++) {
                                    newChildImg.classList.add(img.classList[y]);
                                }

                                newChildImg.classList.remove(this.options.cssStyleClass);

                                // and also attributes
                                for (let y = 0; y < img.attributes.length; y++) {
                                    const attr = img.attributes.item(y);

                                    // expect data-title/alt which are after change as majority title/alt attributes
                                    if (attr.name === 'data-title' || attr.name === 'data-alt') {
                                        newChildImg.setAttribute(attr.name.replace('data-', ''), attr.nodeValue);
                                    } else if (attr.name.indexOf('data-') >= 0) {
                                        newChildImg.setAttribute(attr.nodeName, attr.nodeValue);
                                    }
                                }

                                // Insert new Element before previous image and remove previous one
                                img.parentNode.insertBefore(newChildImg, img);
                                img.remove();

                                if (this.enabledLazyLoad(newChildImg)) {
                                    this.removeClosestClass(newChildImg);
                                }

                                newImage = null;
                                newChildImg = null;
                            }
                        )(image, newImageSrc);
                    } else {
                        newImageSrc = newImageSrc.replace('url(', '').replace(')', '').replace(/"/g, '').replace(/'/g, '');
                        newImage.src = newImageSrc;
                        newImage.onload = ((img, newImgSrc, options) => () => {
                                img.style.backgroundImage = 'url(' + newImgSrc + ')';
                                img.classList.remove(options.cssStyleClass);

                                if (this.enabledLazyLoad(img)) {
                                    this.removeClosestClass(img);
                                }

                                newImage = null;
                            }
                        )(image, newImageSrc, this.options);
                    }

                    newImageSrc = null;
                }
            }
        } else {
            this.callDebug([
                'Init Error: No images were found!'
            ]);
        }
    }

    public setOptions(_options: ImgSwitcherOptions): void {
        this.options = {...this.options, ..._options};
    }

    public getImages(): HTMLElement[] {
        const images = document.querySelectorAll('.' + this.options.cssClass);

        for (let i = 0; i < images.length; i++) {
            this.images.push(images[i] as HTMLElement);
        }

        this.initIntersectionObserver();

        return this.images;
    }

    private getMultiplier(multipliers: Array<number> = this.options.multiplier): number {
        let result = 1;

        if (multipliers.length === 1) {
            result = multipliers[0];
        } else {
            multipliers.sort((a, b) => b - a);

            for (const multiplier of multipliers) {
                if (ImgSwitcher.isResMultiplied(multiplier)) {
                    result = multiplier;
                    break;
                }
            }
        }

        return this.multiplier = result;
    }

    private callDebug(messages: Array<any>) {
        if (this.options.debug) {
            for (const message of messages) {
                console.log(message);
            }
        }
    }
}

const imgSwitcher = ImgSwitcher.getInstance();
imgSwitcher.initImgSwitcher();

let timer: Timer;
window.addEventListener('resize', () => {
    if (timer) {
        clearTimeout(timer);
    }
    timer = setTimeout( () => {
        imgSwitcher.getImages();
        imgSwitcher.runImgSwitcher();
    }, 333);
}, true);
