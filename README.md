# jQuery colorInput

The powerful jQuery plugin that provides a different styles colorpicker. <a href="http://amazingsurge.github.io/jquery-colorinput/">Project page and demos</a><br />
Download: <a href="https://github.com/amazingSurge/jquery-colorinput/archive/master.zip">jquery-colorinput-master.zip</a>

***

## Features

* **Flat mode** — as element in page
* **Powerful controls for color selection**
* **Fits into the viewport**
* **Lightweight size** — 1 kb gzipped

## Dependencies
* <a href="http://jquery.com/" target="_blank">jQuery 1.83+</a>

## Usage

Import this libraries:
* jQuery
* jquery-colorInput.min.js

And CSS:
* jquery-colorInput.css - desirable if you have not yet connected one


Create base html element:
```html
<input type='text' class="custom" />
```

Initialize colorInput:
```javascript
$(".custom").colorInput({ color: '#f00'});
```

Or initialize colorInput with custom settings:
```javascript
$(".custom").colorInput({
      namespace: 'colorInput',
      skin: 'skin-1',
      flat: false,
      hideFireChange: false,
      onlyBtn: false,
      format: 'hex',
      components: {
          check: {
               applyText: 'apply',
               cancelText: 'cancel'
          }
      }
});
```

the most important thing is you should set skin value to let plugin find his skin content




## Settings

```javascript
{
    //Optional property, set a namspace for css class, for example, we have <code>.
    //colorInput_active</code> class for active effect, if namespace set to 'as-
    //colorInput', then it will be <code>.as-colorInput_active</code>
    namespace: 'colorInput',

    //Optional property
    readonly: false,

    //Optional property,it set what components will add to colorpicker
    skin: skin-1,

    //The default color. String for hex color or hash for RGB or HSl
    color: '#ffffff',

    //Optional property,    Whatever if the color picker is appended to the element or triggered by an event.
    flat: false,

    //Optional property, 
    onlyBtn: false,

    //Optional property
    showSelected: false,

    //Optional property, if true, it will save change when you click outside calorpicker
    hideFireChange: false,

    //Optional property, set value's format, optional 'rgb','hsl'
    format: 'hex',

    //Optional property,colorpicker's component
    components: {
         check:{
             applyText: 'apply',
             cancelText: 'cancel'
         }
    } 

}
```
## Public methods

jquery colorInput has different methods , we can use it as below :
```javascript
// show colorpicker
$(".custom").colorInput("show");

// hide colorpicker
$(".custom").colorInput("close");

// cancel change color
$(".custom").colorInput("cancel");

// apply new color
$(".custom").colorInput("apply");

// srt color and update all components
$(".custom").colorInput("set");

// get value of color
$(".custom").colorInput("get");

// set colorpicker can show 
$(".custom").colorInput("enable");

// set color picker can't show
$(".custom").colorInput("disable");

// unbound all events
$(".custom").colorInput("destroy");
```

## Event / Callback

* <code>colorInput::init</code>: trigger when colorInput initilize
* <code>colorInput::create</code>: trigger when colorpicker is created
* <code>colorInput::show</code>:  trigger when colorpicker show

how to use event:
```javascript
$(document).on('colorInput::init', function(event,instance) {
    // instance means current colorInput instance 
    // some stuff
});
```

## Browser support
jquery-cplorInput is verified to work in Internet Explorer 7+, Firefox 2+, Opera 9+, Google Chrome and Safari browsers. Should also work in many others.

Mobile browsers (like Opera mini, Chrome mobile, Safari mobile, Android browser and others) is coming soon.

## Changes

| Version | Notes
|   0.1.x | ([compare][compare-1.1]) add position function                   |                                                            
|---------|------------------------------------------------------------------|
|     ... | ...                                                              |

[compare-1.1]: https://github.com/amazingSurge/jquery-colorInput/compare/v1.1.0...v1.2.0
## Author
[amazingSurge](http://amazingSurge.com)

## License
jQuery-colorInput plugin is released under the <a href="https://github.com/amazingSurge/jquery-colorInput/blob/master/LICENCE.GPL" target="_blank">GPL licence</a>.


