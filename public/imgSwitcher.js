"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
if (!Element.prototype.closest) {
    Element.prototype.closest = function (s) {
        var el = this;
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
var ImgSwitcher = (function () {
    function ImgSwitcher() {
        this.options = {
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
        this.images = [];
    }
    ImgSwitcher.getInstance = function () {
        if (!ImgSwitcher.instance) {
            ImgSwitcher.instance = new ImgSwitcher();
        }
        return ImgSwitcher.instance;
    };
    ImgSwitcher.isResMultiplied = function (pixelRatio) {
        var dpi = pixelRatio * 96;
        pixelRatio = pixelRatio - 0.75;
        return ((window.matchMedia &&
            (window.matchMedia('only screen and (min-resolution: ' + dpi + 'dpi), only screen and (min-resolution: 2dppx), ' +
                'only screen and (min-resolution: ' + (dpi / 2.54) + 'dpcm)').matches
                || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: ' + pixelRatio + '), ' +
                    'only screen and (-o-min-device-pixel-ratio: ' + (pixelRatio * 4) + '/4), ' +
                    'only screen and (min--moz-device-pixel-ratio: ' + pixelRatio + '), ' +
                    'only screen and (min-device-pixel-ratio: ' + pixelRatio + ')').matches))
            || (window.devicePixelRatio && window.devicePixelRatio >= pixelRatio));
    };
    ImgSwitcher.getClosestValueCeil = function (width, breakpoints) {
        var higherMinValue = null, lowerMaxValue = null;
        for (var _i = 0, breakpoints_1 = breakpoints; _i < breakpoints_1.length; _i++) {
            var breakpoint = breakpoints_1[_i];
            if (breakpoint >= width && higherMinValue === null) {
                higherMinValue = breakpoint;
                break;
            }
            if (breakpoint < width && (lowerMaxValue === null || breakpoint > lowerMaxValue)) {
                lowerMaxValue = breakpoint;
            }
        }
        return higherMinValue !== null ? higherMinValue : lowerMaxValue;
    };
    ImgSwitcher.prototype.initIntersectionObserver = function () {
        if (this.options.observerOptions) {
            this.observer = new IntersectionObserver(this.onEntryIntersectionObserver, { rootMargin: this.options.observerOptions });
            if (this.images.length > 0) {
                var tempImages = [];
                for (var _i = 0, _a = this.images; _i < _a.length; _i++) {
                    var image = _a[_i];
                    if (this.enabledLazyLoad(image)) {
                        this.observer.observe(image);
                    }
                    else {
                        tempImages.push(image);
                    }
                }
                this.images = tempImages;
                tempImages = null;
            }
        }
    };
    ImgSwitcher.prototype.enabledLazyLoad = function (el) {
        var result = false;
        if (this.options.enableLazyLoadOnAllImages) {
            if (el.hasAttribute(this.options.attributes.lazyLoading)
                && el.getAttribute(this.options.attributes.lazyLoading) === 'true') {
                result = true;
            }
            else {
                result = true;
            }
        }
        else {
            if (el.hasAttribute(this.options.attributes.lazyLoading)
                && el.getAttribute(this.options.attributes.lazyLoading) === 'true') {
                result = true;
            }
        }
        return result;
    };
    ImgSwitcher.prototype.onEntryIntersectionObserver = function (entry) {
        entry.forEach(function (change) {
            if (change.intersectionRatio) {
                var imgSwitcherInstance = ImgSwitcher.getInstance();
                imgSwitcherInstance.runImgSwitcher([change.target]);
                imgSwitcherInstance.observer.unobserve(change.target);
            }
        });
    };
    ImgSwitcher.prototype.removeClosestClass = function (el) {
        var closestEl = el.closest('.' + this.options.closestCssStyleClass.find);
        if (closestEl) {
            closestEl.classList.remove(this.options.closestCssStyleClass.remove);
        }
    };
    ImgSwitcher.prototype.initImgSwitcher = function () {
        this.getImages();
        this.getMultiplier();
        this.callDebug([
            'Images: ' + this.images,
            'Multiplier: ' + this.multiplier
        ]);
        this.runImgSwitcher();
    };
    ImgSwitcher.prototype.runImgSwitcher = function (images) {
        var _this = this;
        if (images === void 0) { images = this.images; }
        if (images.length > 0) {
            var _loop_1 = function (image) {
                var imageLastBreakpoint = parseInt(image.getAttribute(this_1.options.attributes.lastBreakpoint), 10), imageTargetExtension = image.getAttribute(this_1.options.attributes.targetExtension) ? image.getAttribute(this_1.options.attributes.targetExtension) : null;
                var imageWidth = 0, imageSrc = '', imageMultiplier = this_1.multiplier, imageBreakpoints = this_1.options.breakpoints, imageMultiplierString = '';
                if (image.tagName === 'IMG') {
                    imageWidth = image.parentElement.clientWidth;
                    imageSrc = image.getAttribute('src');
                }
                else if (image.tagName === 'svg') {
                    imageWidth = image.parentElement.clientWidth;
                    imageSrc = image.getAttribute('data-src');
                }
                else {
                    imageWidth = image.clientWidth;
                    imageSrc = getComputedStyle(image).backgroundImage;
                }
                if (imageSrc === null || imageSrc.trim() === '' || imageSrc === 'none') {
                    return "continue";
                }
                if (image.hasAttribute(this_1.options.attributes.multipliers)) {
                    imageMultiplier = this_1.getMultiplier(image.getAttribute(this_1.options.attributes.multipliers).split(',').map(function (multiplier) { return parseInt(multiplier, 10); }));
                }
                if (imageMultiplier > 1) {
                    imageMultiplierString += '@' + imageMultiplier + 'x';
                }
                if (image.hasAttribute(this_1.options.attributes.breakpoints)) {
                    imageBreakpoints = image.getAttribute(this_1.options.attributes.breakpoints).split(',').map(function (multiplier) { return parseInt(multiplier, 10); });
                }
                var targetBreakpoint = ImgSwitcher.getClosestValueCeil(imageWidth, imageBreakpoints);
                if (imageLastBreakpoint !== targetBreakpoint) {
                    var newImageSrc = imageSrc
                        .replace('-' + imageLastBreakpoint + imageMultiplierString, '')
                        .replace(/.([^.]+).?$/g, '-' + targetBreakpoint + imageMultiplierString +
                        (imageTargetExtension ? '.' + imageTargetExtension : imageSrc.match(/.([^.]+).?$/g)[0])), newImage_1 = new Image();
                    image.setAttribute(this_1.options.attributes.lastBreakpoint, targetBreakpoint.toString());
                    if (image.tagName === 'IMG') {
                        newImage_1.src = newImageSrc;
                        newImage_1.onload = (function (img, newImgSrc) { return function () {
                            img.setAttribute('src', newImgSrc);
                            img.classList.remove(_this.options.cssStyleClass);
                            if (_this.enabledLazyLoad(img)) {
                                _this.removeClosestClass(img);
                            }
                            newImage_1 = null;
                        }; })(image, newImageSrc);
                    }
                    else if (image.tagName === 'svg') {
                        newImage_1.src = newImageSrc;
                        newImage_1.onload = (function (img, newImgSrc) { return function () {
                            var newChildImg = document.createElement('img');
                            newChildImg.src = newImgSrc;
                            for (var y = 0; y < img.classList.length; y++) {
                                newChildImg.classList.add(img.classList[y]);
                            }
                            newChildImg.classList.remove(_this.options.cssStyleClass);
                            for (var y = 0; y < img.attributes.length; y++) {
                                var attr = img.attributes.item(y);
                                if (attr.name === 'data-title' || attr.name === 'data-alt') {
                                    newChildImg.setAttribute(attr.name.replace('data-', ''), attr.nodeValue);
                                }
                                else if (attr.name.indexOf('data-') >= 0) {
                                    newChildImg.setAttribute(attr.nodeName, attr.nodeValue);
                                }
                            }
                            img.parentNode.insertBefore(newChildImg, img);
                            img.remove();
                            if (_this.enabledLazyLoad(newChildImg)) {
                                _this.removeClosestClass(newChildImg);
                            }
                            newImage_1 = null;
                            newChildImg = null;
                        }; })(image, newImageSrc);
                    }
                    else {
                        newImageSrc = newImageSrc.replace('url(', '').replace(')', '').replace(/"/g, '').replace(/'/g, '');
                        newImage_1.src = newImageSrc;
                        newImage_1.onload = (function (img, newImgSrc, options) { return function () {
                            img.style.backgroundImage = 'url(' + newImgSrc + ')';
                            img.classList.remove(options.cssStyleClass);
                            if (_this.enabledLazyLoad(img)) {
                                _this.removeClosestClass(img);
                            }
                            newImage_1 = null;
                        }; })(image, newImageSrc, this_1.options);
                    }
                    newImageSrc = null;
                }
            };
            var this_1 = this;
            for (var _i = 0, images_1 = images; _i < images_1.length; _i++) {
                var image = images_1[_i];
                _loop_1(image);
            }
        }
        else {
            this.callDebug([
                'Init Error: No images were found!'
            ]);
        }
    };
    ImgSwitcher.prototype.setOptions = function (_options) {
        this.options = __assign({}, this.options, _options);
    };
    ImgSwitcher.prototype.getImages = function () {
        var images = document.querySelectorAll('.' + this.options.cssClass);
        for (var i = 0; i < images.length; i++) {
            this.images.push(images[i]);
        }
        this.initIntersectionObserver();
        return this.images;
    };
    ImgSwitcher.prototype.getMultiplier = function (multipliers) {
        if (multipliers === void 0) { multipliers = this.options.multiplier; }
        var result = 1;
        if (multipliers.length === 1) {
            result = multipliers[0];
        }
        else {
            multipliers.sort(function (a, b) { return b - a; });
            for (var _i = 0, multipliers_1 = multipliers; _i < multipliers_1.length; _i++) {
                var multiplier = multipliers_1[_i];
                if (ImgSwitcher.isResMultiplied(multiplier)) {
                    result = multiplier;
                    break;
                }
            }
        }
        return this.multiplier = result;
    };
    ImgSwitcher.prototype.callDebug = function (messages) {
        if (this.options.debug) {
            for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
                var message = messages_1[_i];
                console.log(message);
            }
        }
    };
    return ImgSwitcher;
}());
exports.ImgSwitcher = ImgSwitcher;
var imgSwitcher = ImgSwitcher.getInstance();
imgSwitcher.initImgSwitcher();
var timer;
window.addEventListener('resize', function () {
    if (timer) {
        clearTimeout(timer);
    }
    timer = setTimeout(function () {
        imgSwitcher.getImages();
        imgSwitcher.runImgSwitcher();
    }, 333);
}, true);
