/*
 * jquery-asColorInput
 * https://github.com/amazingSurge/jquery-asColorInput
 *
 * Copyright (c) 2014 AmazingSurge
 * Licensed under the GPL license.
 */
(function(window, document, $, Color, undefined) {
    "use strict";

    var id = 0,
        IE = !!/msie/i.exec(window.navigator.userAgent);

    function createId(api) {
        api.id = id;
        id++;
    }

    // Constructor
    var AsColorInput = $.asColorInput = function(element, options) {
        this.element = element;
        this.$element = $(element);

        //flag
        this.opened = false;
        this.firstOpen = true;
        this.disabled = false;
        this.clear = false;

        createId(this);

        this.options = $.extend(true, {}, AsColorInput.defaults, options, this.$element.data());
        this.namespace = this.options.namespace;

        this.classes = {
            wrap: this.namespace + '-wrap',
            dropdown: this.namespace + '-dropdown',
            input: this.namespace + '-input',
            clear: this.namespace + '-clear',
            skin: this.namespace + '_' + this.options.skin,
            open: this.namespace + '_open',
            mask: this.namespace + '-mask',
            hideInput: this.namespace + '_hideInput',
            disabled: this.namespace + '_disabled',
            mode: this.namespace + '-mode_' + this.options.mode
        };

        this.components = $.extend(true, {}, this.components);

        this._comps = AsColorInput.modes[this.options.mode];

        // color value and format
        // here get init value from input elemnt
        if (this.element.value === '') {
            this.color = new Color({
                r: 255,
                g: 255,
                b: 255,
                a: 1
            }, this.options.format);
        } else {
            if (this.options.mode === 'gradient') {
                this.gradient = this.element.value;
            }
            this.color = new Color(this.element.value, this.options.format);
        }

        if (this.options.hideInput) {
            this.$element.addClass(this.classes.hideInput);
        }


        this.updateInput();

        //save this.color  as a rgba value 
        this.originalColor = this.color.toRGBA();

        this._trigger('init');
        this.init();
    };

    AsColorInput.prototype = {
        constructor: AsColorInput,
        components: {},
        init: function() {
            var self = this;
            this.$dropdown = $('<div class="' + this.classes.dropdown + '" data-mode="'+this.options.mode+'"></div>');
            this.$element.wrap('<div class="' + this.classes.wrap + '"></div>').addClass(this.classes.input);
            this.$clear = $('<a href="#" class="' + this.classes.clear + '">x</a>').insertAfter(this.$element);
            this.$wrap = this.$element.parent();
            this.$body = $('body');

            this.$dropdown.data('asColorInput', this);

            if (this.options.skin) {
                this.$dropdown.addClass(this.classes.skin);
                this.$element.parent().addClass(this.classes.skin);
            }

            this.create();

            if(this.options.readonly){
                this.$element.prop('readonly', true);
            }
            
            this.$element.on({
                'click.asColorInput': function() {
                    if (!self.opened) {
                        self.open();
                    }
                    return false;
                },
                'keydown.asColorInput': function(e) {
                    if (self.isGradient) {
                        return;
                    }
                    if (e.keyCode === 9) {
                        self.close();
                    } else if (e.keyCode === 13) {
                        self.color.from(self.$element.val());
                        self.update({}, 'input');
                        self.close();
                    }
                },
                'keyup.asColorInput': function() {
                    if (self.isGradient) {
                        return;
                    }
                    self.color.from(self.$element.val());
                    self.update({}, 'input');
                }
            });
            this.$clear.on('click', function() {
                self.clear = true;
                self.color.from('transparent');
                self.update({});
                self.$element.val('');
                self.clear = false;
                return false;
            })

            this._trigger('ready');
        },
        create: function() {
            var self = this;
            
            this.components.trigger.init(this);
            
            $.each(this._comps, function(key, options) {
                if (options === true) {
                    options = {};
                }
                if (self.options.components[key] !== undefined) {
                    options = $.extend(options, self.options.components[key]);
                }
                self.components[key] && self.components[key].init(self, options);
            });

            this._trigger('create');
        },
        _trigger: function(eventType) {
            // event
            this.$element.trigger('asColorInput::' + eventType, this);
            this.$element.trigger(eventType + '.asColorInput', this);

            // callback
            eventType = eventType.replace(/\b\w+\b/g, function(word) {
                return word.substring(0, 1).toUpperCase() + word.substring(1);
            });
            var onFunction = 'on' + eventType;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;
            if (typeof this.options[onFunction] === 'function') {
                this.options[onFunction].apply(this, method_arguments);
            }
        },
        // update all component value except trigger component
        // and set color to color object
        update: function(color, trigger) {
            var self = this;

            //set chosen color to color object
            if (color !== {}) {
                self.color.set(color);
            }

            this._trigger('change', color);

            // update all components 
            $.each(this._comps, function(key, options) {
                if (trigger !== key) {
                    self.components[key] && self.components[key].update && self.components[key].update(self);
                }
            });

            this.components.trigger.update(this);

            if (trigger !== 'input') {
                if (!this.isGradient) {
                    this.updateInput();
                }
            }
        },
        updateInput: function(){
            var format = this.options.format;

            if (format) {
                if(this.options.reduceAlpha && this.color.value.a === 1){
                    switch(format){
                        case 'rgba':
                            format = 'rgb';
                            break;
                        case 'hsla':
                            format = 'hsl';
                            break;
                    }
                }
                this.$element.val(this.get(format));
            } else {
                this.$element.val(this.color.toString());
            }
        },
        opacity: function(data) {
            if (data) {
                this.update({
                    a: data
                });
            } else {
                return this.color.value.a;
            }
        },
        position: function() {
            var hidden = !this.$element.is(':visible'),
                offset = hidden ? this.$trigger.offset() : this.$element.offset(),
                height = hidden ? this.$trigger.outerHeight() : this.$element.outerHeight(),
                width = hidden ? this.$trigger.outerWidth() : this.$element.outerWidth() + this.$trigger.outerWidth(),
                picker_width = this.$dropdown.outerWidth(true),
                picker_height = this.$dropdown.outerHeight(true),
                top, left;

            if (picker_height + offset.top > $(window).height() + $(window).scrollTop()) {
                top = offset.top - picker_height;
            } else {
                top = offset.top + height;
            }

            if (picker_width + offset.left > $(window).width() + $(window).scrollLeft()) {
                left = offset.left - picker_width + width;
            } else {
                left = offset.left;
            }

            this.$dropdown.css({
                position: 'absolute',
                top: top,
                left: left
            });
        },

        /*
         *  Public Method
         */
        open: function() {
            if (this.disabled) {
                return;
            }

            var self = this;

            if(this.$dropdown[0] !== this.$body.children().last()[0]) {
                this.$dropdown.detach().appendTo(this.$body);
            }

            this.$mask = $('.'+self.classes.mask);
            if (this.$mask.length == 0) {
                this.createMask();
            }

            // ensure the mask is always right before the dropdown
            if(this.$dropdown.prev()[0] !== this.$mask[0]){
                this.$dropdown.before(this.$mask);
            }

            $("#asColorInput-dropdown").removeAttr("id");
            this.$dropdown.attr("id", "asColorInput-dropdown");

            // show the mask
            this.$mask.show();

            this.position();

            $(window).on('resize.asColorInput', $.proxy(this.position, this));

            this.$dropdown.addClass(this.classes.open);

            this.opened = true;

            if(this.firstOpen){
                this.firstOpen = false;

                this._trigger('firstOpen');
            }
            this._trigger('open');
        },
        createMask: function(){
            this.$mask = $(document.createElement("div"));
            this.$mask.attr("class",this.classes.mask);
            this.$mask.hide();
            this.$mask.appendTo(this.$body);

            var self = this;

            this.$mask.on("mousedown touchstart click", function (e) {
                var $dropdown = $("#asColorInput-dropdown"), self;
                if ($dropdown.length > 0) {
                    self = $dropdown.data("asColorInput");
                    if (self.opened) {
                        if (self.options.hideFireChange) {
                            self.apply();
                        } else {
                            self.cancel();
                        }
                    }

                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        },
        close: function() {
            this.opened = false;
            this.$element.blur();
            this.$mask.hide();

            this.$dropdown.removeClass(this.classes.open);

            $(window).off('resize.asColorInput');

            this._trigger('close');
        },
        clear: function() {
            this.color.from('#fff');
            this.update({});
            this.close();
        },
        cancel: function() {
            this.color.from(this.originalColor);
            this.update({});
            this.close();

            return false;
        },
        apply: function() {
            this.originalColor = this.color.toRGBA();
            this.close();
            this._trigger('apply');

            return false;
        },
        set: function(value) {
            this.color.from(value);
            this.update();
            return this;
        },
        get: function(type) {
            if (this.isGradient) {
                return this.element.value;
            }
            if (type === undefined) {
                return this.color.toString();
            }
            if (type === 'rgb') {
                return this.color.toRGB();
            }
            if (type === 'rgba') {
                return this.color.toRGBA();
            }
            if (type === 'hsl') {
                return this.color.toHSL();
            }
            if (type === 'hsla') {
                return this.color.toHSLA();
            }
            if (type === 'hex') {
                return this.color.toHEX();
            }
        },
        enable: function() {
            this.disabled = false;
            this.$parent.addClass(this.classes.disabled);
            return this;
        },
        disable: function() {
            this.disabled = true;
            this.$parent.removeClass(this.classes.disabled);
            return this;
        },
        destroy: function() {

        }
    };

    AsColorInput.registerComponent = function(component, methods) {
        AsColorInput.prototype.components[component] = methods;
    };

    AsColorInput.localization = [];

    AsColorInput.defaults = {
        namespace: 'asColorInput',
        readonly: false,
        skin: null,
        hideInput: false,
        hideFireChange: true,
        keyboard: false,
        format: 'rgba',
        reduceAlpha: true,
        mode: 'simple',
        components: {
            
        },
        onInit: null,
        onReady: null,
        onChange: null,
        onClose: null,
        onOpen: null,
        onApply: null
    };

    AsColorInput.modes = {
        'simple': {
            saturation: true,
            hue: true,
            alpha: true
        },
        'palettes': {
            palettes: true
        },
        'complex': {
            preview: true,
            palettes: true,
            saturation: true,
            hue: true,
            alpha: true,
            hex: true,
            buttons: true
        },
        'gradient': {
            preview: true,
            palettes: true,
            saturation: true,
            hue: true,
            alpha: true,
            hex: true,
            gradient: true
        }
    };

    AsColorInput.registerComponent('trigger', {
        template: '<div class="asColorInput-trigger"><span></span></div>',
        init: function(api) {
            var template = '<div class="' + api.namespace + '-trigger"><span></span></div>';
            api.$trigger = $(template);
            this.$trigger_inner = api.$trigger.children('span');

            api.$trigger.insertAfter(api.$element);
            api.$trigger.on('click', function() {
                if (!api.opened) {
                    api.open();
                } else {
                    api.close();
                }
                return false;
            });
            this.update(api);
        },
        update: function(api) {
            if (api.isGradient) {
                this.$trigger_inner.css('backgroundColor', 'transparent');
                this.$trigger_inner[0].style.backgroundImage = api.gradient;
            }else {
                this.$trigger_inner[0].style.backgroundImage = '';
                this.$trigger_inner.css('backgroundColor', api.color.toRGBA());
            }
        },
        destroy: function(api) {
            api.$trigger.remove();
        }
    });

    // Collection method.
    $.fn.asColorInput = function(options) {
        if (typeof options === 'string') {
            var method = options;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;

            return this.each(function() {
                var api = $.data(this, 'asColorInput');
                if (typeof api[method] === 'function') {
                    api[method].apply(api, method_arguments);
                }
            });
        } else {
            return this.each(function() {
                if (!$.data(this, 'asColorInput')) {
                    $.data(this, 'asColorInput', new AsColorInput(this, options));
                }
            });
        }
    };
}(window, document, jQuery, (function($) {
    if ($.asColor === undefined) {
        // console.info('lost dependency lib of $.asColor , please load it first !');
        return false;
    } else {
        return $.asColor;
    }
}(jQuery))));
