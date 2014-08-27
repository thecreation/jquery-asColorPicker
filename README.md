# jQuery asColorInput

The powerful jQuery plugin that for color picker. 
Download: <a href="https://github.com/amazingSurge/jquery-asColorInput/archive/master.zip">jquery-asColorInput-master.zip</a>

***

## Features

* **beautiful skin** — we provide some beautiful skins, it also support custom skin.
* **support all color format** — hex rgb raba hsl hsla. 
* **UX optimize** — we do a lot work to improve UX.
* **keyboard support** — we have carefully designed for keyboard support.

## Dependencies
* <a href="http://jquery.com/" target="_blank">jQuery 1.83+</a>
* <a href="https://github.com/amazingSurge/jquery-asColor" target="_blank">jquery-asColor.js</a>
* <a href="https://github.com/amazingSurge/jquery-asGradient" target="_blank">jquery-asGradient.js</a>

## Usage

Import this libraries:
* jQuery
* jquery-asColor.js
* jquery-asGradient.js
* jquery-asColorInput.min.js

And CSS:
* asColorInput.css 

Create base html element:
```html
    <div class="example">
        <input type="text" class="color" /> 
    </div>
```

Initialize tabs:
```javascript
$(".color").asColorInput();
```

Or initialize tabs with custom settings:
```javascript
$(".color").asColorInput({
	hideInput: false,
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
    readonly: false,

    //Optional property, if true , it will remove trigger components, and show color panel on the page when page loaded.
    flat: true,

    //Optional property, if true, open keyboard function, note you need load jquery-asColorInput-keyboard.js file first 
    keyboard: false,

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
$(".asColorInput").asColorInput("set", '#fff');

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

## Author
[amazingSurge](http://amazingSurge.com)

## License
jQuery-asColorInput plugin is released under the <a href="https://github.com/amazingSurge/jquery-asColorInput/blob/master/LICENCE.GPL" target="_blank">GPL licence</a>.