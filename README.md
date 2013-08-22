# jQuery colorInput

The powerful jQuery plugin that creates a different styles colorpicker. <a href="http://amazingsurge.github.io/jquery-colorinput/">Project page and demos</a><br />
Download: <a href="https://github.com/amazingSurge/jquery-colorinput/archive/master.zip">jquery-colorinput-master.zip</a>

***

## Features

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

<table>
    <thead>
        <tr>
            <th>Property</th>
            <th>Default</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>namespace</td>
            <td>'colorInput'</td>
            <td>Optional property, set a namspace for css class, for example, we have <code>.colorInput_active</code> class for active effect, if namespace set to 'as-colorInput', then it will be <code>.as-colorInput_active</code></td>
        </tr>
        <tr>
            <td>readonly</td>
            <td>false</td>
            <td>Optional property</td>
        </tr>
        <tr>
            <td>skin</td>
            <td>skin-1</td>
            <td>Optional property,it set what components will add to colorpicker</td>
        </tr>
        <tr>
            <td>flat</td>
            <td>false</td>
            <td>Optional property, set colorpicker as flat</td>
        </tr>
        <tr>
            <td>onlyBtn</td>
            <td>false</td>
            <td>Optional property</td>
        </tr>
        <tr>
            <td>showSelected</td>
            <td>false</td>
            <td>Optional property</td>
        </tr>
        <tr>
            <td>hideFireChange</td>
            <td>false</td>
            <td>Optional property, if true, it will save change when you click outside calorpicker</td>
        </tr>
        <tr>
            <td>format</td>
            <td>'hex'</td>
            <td>Optional property, set value's format, optional 'rgb','hsl'  
        </tr>
        <tr>
            <td>components</td>
            <td>{
                 check: 
                     {
                      applyText: 'apply',
                      cancelText: 'cancel'
                     }
            }</td>
            <td>Optional property,set component</td>
        </tr>
    </tbody>
</table>

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

| Version | Notes                                                            |
|---------|------------------------------------------------------------------|
|     ... | ...                                                              |


## Author
[amazingSurge](http://amazingSurge.com)

## License
jQuery-colorInput plugin is released under the <a href="https://github.com/amazingSurge/jquery-colorInput/blob/master/LICENCE.GPL" target="_blank">GPL licence</a>.


