# Image Switcher

Switch images after JS is loaded to target resolution by breakpoints.

ImgSwitcher allows you load image by breakpoints and by DPI's (retina display).
You can define how many breakpoints you want to detect, how much DPI you want to check (@2x, @3x, etc.) 
and also you can have another type of image as first image and others loaded by ImgSwitcher with another type.

## Installation

You can use NPM package: 

    npm i img-switcher --save

or download this repository and add `imgSwticher.ts` or `imgSwitcher.js` from **public** folder
to your project.


## Usage

At first you must get instance of ImgSwitcher:

    const imgSwitcher = ImgSwitcher.getInstance();

After that you can simply initialize Image Switcher: 

    imgSwitcher.initImgSwitcher();

About naming of files/images, see **Naming** described below.

### Optional Usage

If you want configure options (see **Available options** described below), you can do it via `setOptions()` function:

    imgSwitcher.setOptions(options);

If you need reload list of images for example after you lazy load new images on website, 
you can call `getImages()` function on existing instance:

    imgSwitcher.getImages();

and after that or often you will want use listener for resize width of viewport, so, 
in these cases you can simply call on existing instance `runImgSwitcher()` function:

    imgSwitcher.runImgSwitcher();

#### Example

    const imgSwitcher = ImgSwitcher.getInstance();
    imgSwitcher.initImgSwitcher();
    
    let timer: Timer;
    window.addEventListener('resize', () => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout( () => {
            imgSwitcher.runImgSwitcher();
        }, 333);
    }, true);

### Available options

#### Via JS/TS

Object of options can contains:
 - **attributes** = list of name data attributes, see described bellow
 - **breakpoints** = list of breakpoints, which you want to handle
 - **cssClass** = base class selector for ImgSwitcher
 - **cssStyleClass** = class which is removed from image when is loaded new image
 - **debug** = boolean for enable/disable echo to console.log some part of code for debugging
 - **multiplier** = list of resolution multipliers, which you want to handle, e.g. retina display (@2x, @3x, etc.)
 
Also, you can set name of data attributes on image for specify separately settings for each of images:
 - **data-img-switcher-bp** = list of breakpoints divided by comma (e.g.: "320,640,960")
 - **data-img-switcher-lbp** = last used breakpoint
 - **data-img-switcher-mp** = list of multipliers divided by commma (e.g.: "1,2,3")
 - **data-img-switcher-te** = target extension it is used for example for SVG elements, where you must to define 
                          which type of new image will be loaded (e.g.: "png", "jpg", etc.)
                          
Example of default options:

    {
        attributes: {
            breakpoints: 'data-img-switcher-bp',
            lastBreakpoint: 'data-img-switcher-lbp',
            multipliers: 'data-img-switcher-mp',
            targetExtension: 'data-img-switcher-te'
        },
        breakpoints: [320, 640, 768, 1024, 1280, 1920],
        cssClass: 'js-img-switcher',
        cssStyleClass: 'o-img-switcher',
        debug: false,
        multiplier: [1, 2]
    }

#### Directly on HTML Tag

Available options, as I described higher, are:
 - breakpoints: `data-img-switcher-bp=""`
    - divided by comma, e.g.: `data-img-switcher-bp="320,640,960"`
 - multipliers: `data-img-switcher-mp=""`
    - divided by comma, e.g.: `data-img-switcher-mp="1,2"`
 - target extension: `data-img-switcher-te=""`
    - it is used when you want to have type of first image another like loaded by ImgSwitcher.
      Typically usage is for SVG as first loaded images. So, if you have SVG (inline or as img tag) and you want to load jpg's
      you must use it in this way:
      
      `<img src="/images/nameOfFile.svg" alt="" title="" data-img-switcher-te="jpg">`
      
      After ImgSwitcher is initialized, he will try to load by specified breakpoint for example `nameOfFile-640.jpg` 

### Naming of files/images

Name of file in situation of three breakpoints (320, 960, 1280) and for @1x, @2x multipliers is:
 - **nameOfImage.jpg** (base most downsized image for first load of page)
 - **nameOfImage-320.jpg** (image until 320px breakpoint)
 - **nameOfImage-320@2x.jpg** (image until 320px breakpoint but for retina displays, so with doubled resolution)
 - **nameOfImage-960.jpg** (image from 321px and until 960px breakpoint)
 - **nameOfImage-960@2x.jpg** (image from 321px and until 960px breakpoint but for retina displays, so with doubled resolution)
 - **nameOfImage-1280.jpg** (image from 961px breakpoint)
 - **nameOfImage-1280@2x.jpg** (image from 961px breakpoint but for retina displays, so with doubled resolution)
 
## Known issues

- *Image is not loaded if script did not found image* 
    - yes, if you forgot add for example `nameOfimage-960.jpg` on your FTP or somewhere, script 
    don't trying to find closest higher available image. It is because this should be potential overkill for calling 
    many calls to server trying to find available variant of image. If you need to have for example four breakpoints 
    globally on images but for one of them just for example two breakpoints, use data attributes to define breakpoints 
    for this image.
    
If you found a **bug**, please, create a issue. 

## Contributing

### Fork 

1. Fork this project.
2. Clone your fork to your local machine

    `git clone https://github.com/your-username/img-switcher.git`

3. Create a branch with short name described bug/feature

    `git checkout -b branch-name`

4. Make your changes.
   - please, make a **manual testing**
   - **update documentation** (README.md).
   - **update examples** if it's necessary

5. Commit, push and create a pull request

### Development

Simply run npm install

    npm i
    
After that you can change code and in the end, please, run gulp task runner:

    gulp
    
or

    ./node_modules/.bin/gulp
    
### Rules

Please, install and use TSLint for keeping code style!

## Contact

Email: info@striky.sk

Web: https://www.striky.sk/

## License

MIT