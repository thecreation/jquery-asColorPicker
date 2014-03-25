# jQuery asColorInput

The powerful jQuery plugin that for color picker. <a href="http://amazingsurge.github.io/jquery-asColorInput/">Project page and demos</a><br />
Download: <a href="https://github.com/amazingSurge/jquery-asColorInput/archive/master.zip">jquery-asColorInput-master.zip</a>

***

## Features

* **beautiful skin** — we provide some beautiful skins, it also support custom skin.
* **support all color format** — hex rgb raba hsl hsla. 
* **UX optimize** — we do a lot work to improve UX.
* **keyboard support** — we have carefully designed for keyboard support.
* **localstorage support** — record whatever you do on the plugin.

## Dependencies
* <a href="http://jquery.com/" target="_blank">jQuery 1.83+</a>
* <a href="https://github.com/amazingSurge/jquery-color" target="_blank">jquery-color.js</a>

## Usage

Import this libraries:
* jQuery
* jquery-color.js
* jquery-asColorInput.min.js

And CSS:
* asColorInput.css 

Still don't forget include: image file

Create base html element:
```html
    <div class="example">
        <input type="text" class="asColorInput" /> 
    </div>
```

Initialize tabs:
```javascript
$(".asColorInput").asColorInput();
```

Or initialize tabs with custom settings:
```javascript
$(".asColorInput").asColorInput({
	showInput: true,
	skin: 'simple'
});
```

## Settings

```javascript
{   

    // Optional property, Set a namespace for css class
    namespace: 'asColorInput',
    
    //Optional property, choose the loaded skin
    skin: null,

    //Optional property, if 'none',we can close at once needn't to give time to render css3 transition
    readonly: 'none',

    //Optional property, if true , it will remove trigger components, and show color panel on the page when page loaded.
    flat: true,

    //Optional property, string, define the output color format on input element, not component element.
    format: 'hex',

    //Optional property, object, config jquery.cookie options 
    cookie: {},

    //Optional property, if true, open keyboard function, note you need load jquery-asColorInput-keyboard.js file first 
    keyboard: false,

    //Optional property, config every registered component using component name 
    components: {
    	check: {},
    	hue: {},
    	alpha: {}
    },

    //Optional property, trigger when color change 
    onChange: function() {},

    //Optional property, trigger when open asColorInput pancel, flat type will never trigger this event
    onShow: function() {},

    //Optional property, trigger when close asColorInput pancel, flat type will never trigger this event
    onClose: function() {},

    //Optional property, trigger when init
    onInit: function() {},

    //Optional property, trigger when init, it will trigger after init event
    onReady: function() {},

    //Optional property, trigger when a color is applied
    onApply: function() {},
}
```

## Public methods

jquery asColorInput has different methods , we can use it as below :
```javascript
// show asColorInput panel
$(".asColorInput").asColorInput("show");

// close asColorInput panel
$(".asColorInput").asColorInput("close");

// apply selected color
$(".asColorInput").asColorInput("apply");

// cancel selceted color
$(".asColorInput").asColorInput("cancel");

// set asColorInput to specified color
$(".asColorInput").asColorInput("set");

// get selected color
$("asColorInput").asColorInput("get");

// enable asColorInput
$("asColorInput").asColorInput("enable");

// disable asColorInput
$("asColorInput").asColorInput("disable");

// destroy asColorInput
$("asColorInput").asColorInput("destroy");

```

## Event

* <code>asColorInput::show</code>: trigger when show asColorInput pancel, flat type will never trigger this event
* <code>asColorInput::close</code>: trigger when close asColorInput pancel, flat type will never trigger this event
* <code>asColorInput::apply</code>: trigger when a color is applied
* <code>asColorInput::init</code>: trigger when init
* <code>asColorInput::ready</code>: trigger after init event
* <code>asColorInput::change</code>: trigger when color change

how to use event:
```javascript
$(document).on('asColorInput::init', function(event,instance) {
    // instance means current asColorInput instance 
    // some stuff
});
```
## How to register a new component
* you can use <code>$.asColorInput.registerComponent('name', {init: function(){}})</code> to register
* this function need two arguments, as you see above
* init function is necessary, the function will be excuted when asColorInput intantiate

For Example: 
```javascript 
$.asColorInput.registerComponent('check', {
    selector: '.asColorInput-check',
    template: '<div class="asColorInput-check"><a class="asColorInput-check-apply"></a><a class="asColorInput-check-cancel"></a></div>',
    init: function(api) {
        var opts = $.extend(this.defaults, api.options.components.check),
            self = this;

        this.$check = $(this.template).appendTo(api.$picker);
        this.$apply = this.$check.find('.asColorInput-check-apply').text(opts.applyText);
        this.$cancel = this.$check.find('.asColorInput-check-cancel').text(opts.cancelText);

        this.$apply.on('click', $.proxy(api.apply, api));
        this.$cancel.on('click', $.proxy(api.cancel, api));
    }
});
```

## How to add new skin
* add the component register file you want in your page
* add new skin css files in your page
* config your skin using <code>$.asColorInput.skins['newSkinName'] = ['component1','component2', ...]</code>
* instantiate asColorInput with skin option <code>$('.asColorInput').asColorInput({skin:'your new skin'})</code>


## Browser support
jquery-popup is verified to work in Internet Explorer 7+, Firefox 2+, Opera 9+, Google Chrome and Safari browsers. Should also work in many others.

## Changes

| Version | Notes                                                            |
|---------|------------------------------------------------------------------|
|   0.1.2 | cancel text select when mousedown                                |
|   0.1.1 | add keyboard support                                             |

## Author
[amazingSurge](http://amazingSurge.com)

## License
jQuery-popup plugin is released under the <a href="https://github.com/amazingSurge/jquery-asColorInput/blob/master/LICENCE.GPL" target="_blank">GPL licence</a>.


