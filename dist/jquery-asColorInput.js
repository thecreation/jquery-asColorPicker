/*! asColorInput - v0.1.3 - 2014-06-25
* https://github.com/amazingSurge/jquery-asColorInput
* Copyright (c) 2014 amazingSurge; Licensed GPL */
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

// keyboard
(function(window, document, $, undefined) {
    var $doc = $(document);
    var keyboard = {
        keys: {
            'UP': 38,
            'DOWN': 40,
            'LEFT': 37,
            'RIGHT': 39,
            'RETURN': 13,
            'ESCAPE': 27,
            'BACKSPACE': 8,
            'SPACE': 32
        },
        map: {},
        bound: false,
        press: function(e) {
            var key = e.keyCode || e.which;
            if (key in keyboard.map && typeof keyboard.map[key] === 'function') {
                keyboard.map[key](e);
            }
            return false;
        },
        attach: function(map) {
            var key, up;
            for (key in map) {
                if (map.hasOwnProperty(key)) {
                    up = key.toUpperCase();
                    if (up in keyboard.keys) {
                        keyboard.map[keyboard.keys[up]] = map[key];
                    } else {
                        keyboard.map[up] = map[key];
                    }
                }
            }
            if (!keyboard.bound) {
                keyboard.bound = true;
                $doc.bind('keydown', keyboard.press);
            }
        },
        detach: function() {
            keyboard.bound = false;
            keyboard.map = {};
            $doc.unbind('keydown', keyboard.press);
        }
    };
    $doc.on('asColorInput::init', function(event, instance) {
        if (instance.options.keyboard === true) {
            instance._keyboard = keyboard;
        }
    });
})(window, document, jQuery);

// alpha

(function($) {
    $.asColorInput.registerComponent('alpha', {
        size: 150,
        defaults: {
            direction: 'vertical', // horizontal
        },
        data: {},
        init: function(api, options) {
            var self = this;

            this.options = $.extend(this.defaults, options);
            self.direction = this.options.direction;

            this.$alpha = $('<div class="' + api.namespace + '-alpha ' + api.namespace + '-alpha-' + this.direction + '"><i></i></div>').appendTo(api.$dropdown);
            this.$handle = this.$alpha.children('i');

            api.$element.on('asColorInput::firstOpen', function() {
                // init variable
                if (self.direction === 'vertical') {
                    self.size = self.$alpha.height();
                } else {
                    self.size = self.$alpha.width();
                }
                self.step = self.size / 360;

                // update
                self.update(api);

                // bind events
                self.bindEvents(api);
                self.keyboard(api);
            });
        },
        bindEvents: function(api){
            var self = this;
            this.$alpha.on('mousedown.asColorInput', function(e) {
                var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                if (rightclick) {
                    return false;
                }
                $.proxy(self.mousedown, self)(api, e);
            });
        },
        mousedown: function(api, e) {
            var offset = this.$alpha.offset();
            if (this.direction === 'vertical') {
                this.data.startY = e.pageY;
                this.data.top = e.pageY - offset.top;
                this.move(api, this.data.top);
            } else {
                this.data.startX = e.pageX;
                this.data.left = e.pageX - offset.left;
                this.move(api, this.data.left);
            }

            this.mousemove = function(e) {
                var position;
                if (this.direction === 'vertical') {
                    position = this.data.top + (e.pageY || this.data.startY) - this.data.startY;
                } else {
                    position = this.data.left + (e.pageX || this.data.startX) - this.data.startX;
                }

                this.move(api, position);
                return false;
            };

            this.mouseup = function() {
                $(document).off({
                    mousemove: this.mousemove,
                    mouseup: this.mouseup
                });
                if (this.direction === 'vertical') {
                    this.data.top = this.data.cach;
                } else {
                    this.data.left = this.data.cach;
                }

                return false;
            };

            $(document).on({
                mousemove: $.proxy(this.mousemove, this),
                mouseup: $.proxy(this.mouseup, this)
            });
            return false;
        },
        move: function(api, position, alpha, update) {
            position = Math.max(0, Math.min(this.size, position));
            this.data.cach = position;
            if (typeof alpha === 'undefined') {
                alpha = 1 - (position / this.size);
            }
            alpha = Math.max(0, Math.min(1, alpha));
            if (this.direction === 'vertical') {
                this.$handle.css({
                    top: position
                });
            } else {
                this.$handle.css({
                    left: position
                });
            }

            if (update !== false) {
                api.update({
                    a: Math.round(alpha * 100) / 100
                }, 'alpha');
            }
        },
        moveLeft: function(api) {
            var step = this.step,
                data = this.data;
            data.left = Math.max(0, Math.min(this.width, data.left - step));
            this.move(api, data.left);
        },
        moveRight: function(api) {
            var step = this.step,
                data = this.data;
            data.left = Math.max(0, Math.min(this.width, data.left + step));
            this.move(api, data.left);
        },
        moveUp: function(api) {
            var step = this.step,
                data = this.data;
            data.top = Math.max(0, Math.min(this.width, data.top - step));
            this.move(api, data.top);
        },
        moveDown: function(api) {
            var step = this.step,
                data = this.data;
            data.top = Math.max(0, Math.min(this.width, data.top + step));
            this.move(api, data.top);
        },
        keyboard: function(api) {
            var keyboard, self = this;
            if (api._keyboard) {
                keyboard = $.extend(true, {}, api._keyboard);
            } else {
                return false;
            }

            this.$alpha.attr('tabindex', '0').on('focus', function() {
                if (this.direction === 'vertical') {
                    keyboard.attach({
                        up: function() {
                            self.moveUp.call(self, api);
                        },
                        down: function() {
                            self.moveDown.call(self, api);
                        }
                    });
                } else {
                    keyboard.attach({
                        left: function() {
                            self.moveLeft.call(self, api);
                        },
                        right: function() {
                            self.moveRight.call(self, api);
                        }
                    });
                }
                return false;
            }).on('blur', function() {
                keyboard.detach();
            });
        },
        update: function(api) {
            var position = this.size * (1 - api.color.value.a);
            this.$alpha.css('backgroundColor', api.color.toHEX());

            this.move(api, position, api.color.value.a, false);
        },
        destroy: function() {
            $(document).off({
                mousemove: this.mousemove,
                mouseup: this.mouseup
            });
        }
    });
})(jQuery);

// buttons

(function($) {
    $.asColorInput.registerComponent('buttons', {
        defaults: {
            apply: false,
            cancel: true,
            applyText: 'apply',
            cancelText: 'cancel'
        },
        init: function(api, options) {
            var self = this;

            this.options = $.extend(this.defaults, options);
            this.$buttons = $('<div class="' + api.namespace + '-buttons"></div>').appendTo(api.$dropdown);

            api.$element.on('asColorInput::firstOpen', function() {
                if (self.options.apply) {
                    self.$apply = $('<a href="#" alt="'+self.options.applyText+'" class="' + api.namespace + '-buttons-apply"></a>').text(self.options.applyText).appendTo(self.$buttons).on('click', $.proxy(api.apply, api));
                }

                if (self.options.cancel) {
                    self.$cancel = $('<a href="#" alt="'+self.options.cancelText+'" class="' + api.namespace + '-buttons-cancel"></a>').text(self.options.cancelText).appendTo(self.$buttons).on('click', $.proxy(api.cancel, api));
                }
            });
        }
    });
})(jQuery);

// hex

(function($) {
    $.asColorInput.registerComponent('hex', {
        init: function(api) {
            var template = '<input type="text" class="' + api.namespace + '-hex" />';
            this.$hex = $(template).appendTo(api.$dropdown);

            this.$hex.on('change', function() {
                api.set(this.value);
            });

            this.update(api);
        },
        update: function(api) {
            this.$hex.val(api.color.toHEX());
        },
    });
})(jQuery);

// hue

(function($) {
    $.asColorInput.registerComponent('hue', {
        size: 150,
        defaults: {
            direction: 'vertical', // horizontal
        },
        data: {},
        init: function(api, options) {
            var self = this;

            this.options = $.extend(this.defaults, options);
            this.direction = this.options.direction;

            this.$hue = $('<div class="' + api.namespace + '-hue ' + api.namespace + '-hue-' + this.direction + '"><i></i></div>').appendTo(api.$dropdown);
            this.$handle = this.$hue.children('i');

            api.$element.on('asColorInput::firstOpen', function() {
                // init variable
                if (self.direction === 'vertical') {
                    self.size = self.$hue.height();
                } else {
                    self.size = self.$hue.width();
                }
                self.step = self.size / 360;

                // update
                self.update(api);

                // bind events
                self.bindEvents(api);
                self.keyboard(api);
            });
        },
        bindEvents: function(api){
            var self = this;
            this.$hue.on('mousedown.asColorInput', function(e) {
                var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                if (rightclick) {
                    return false;
                }
                $.proxy(self.mousedown, self)(api, e);
            });
        },
        mousedown: function(api, e) {
            var offset = this.$hue.offset();
            if (this.direction === 'vertical') {
                this.data.startY = e.pageY;
                this.data.top = e.pageY - offset.top;
                this.move(api, this.data.top);
            } else {
                this.data.startX = e.pageX;
                this.data.left = e.pageX - offset.left;
                this.move(api, this.data.left);
            }

            this.mousemove = function(e) {
                var position;
                if (this.direction === 'vertical') {
                    position = this.data.top + (e.pageY || this.data.startY) - this.data.startY;
                } else {
                    position = this.data.left + (e.pageX || this.data.startX) - this.data.startX;
                }

                this.move(api, position);
                return false;
            };

            this.mouseup = function() {
                $(document).off({
                    mousemove: this.mousemove,
                    mouseup: this.mouseup
                });
                if (this.direction === 'vertical') {
                    this.data.top = this.data.cach;
                } else {
                    this.data.left = this.data.cach;
                }

                return false;
            };

            $(document).on({
                mousemove: $.proxy(this.mousemove, this),
                mouseup: $.proxy(this.mouseup, this)
            });

            return false;
        },
        move: function(api, position, hub, update) {
            position = Math.max(0, Math.min(this.size, position));
            this.data.cach = position;
            if (typeof hub === 'undefined') {
                hub = (1 - position / this.size) * 360;
            }
            hub = Math.max(0, Math.min(360, hub));
            if (this.direction === 'vertical') {
                this.$handle.css({
                    top: position
                });
            } else {
                this.$handle.css({
                    left: position
                });
            }
            if (update !== false) {
                api.update({
                    h: hub
                }, 'hue');
            }
        },
        moveLeft: function(api) {
            var step = this.step,
                data = this.data;
            data.left = Math.max(0, Math.min(this.width, data.left - step));
            this.move(api, data.left);
        },
        moveRight: function(api) {
            var step = this.step,
                data = this.data;
            data.left = Math.max(0, Math.min(this.width, data.left + step));
            this.move(api, data.left);
        },
        moveUp: function(api) {
            var step = this.step,
                data = this.data;
            data.top = Math.max(0, Math.min(this.width, data.top - step));
            this.move(api, data.top);
        },
        moveDown: function(api) {
            var step = this.step,
                data = this.data;
            data.top = Math.max(0, Math.min(this.width, data.top + step));
            this.move(api, data.top);
        },
        keyboard: function(api) {
            var keyboard, self = this;
            if (api._keyboard) {
                keyboard = $.extend(true, {}, api._keyboard);
            } else {
                return false;
            }

            this.$hue.attr('tabindex', '0').on('focus', function() {
                if (this.direction === 'vertical') {
                    keyboard.attach({
                        up: function() {
                            self.moveUp.call(self, api);
                        },
                        down: function() {
                            self.moveDown.call(self, api);
                        }
                    });
                } else {
                    keyboard.attach({
                        left: function() {
                            self.moveLeft.call(self, api);
                        },
                        right: function() {
                            self.moveRight.call(self, api);
                        }
                    });
                }
                return false;
            }).on('blur', function() {
                keyboard.detach();
            });
        },
        update: function(api) {
            var position = (api.color.value.h === 0) ? 0 : this.size * (1 - api.color.value.h / 360);
            this.move(api, position, api.color.value.h, false);
        },
        destroy: function() {
            $(document).off({
                mousemove: this.mousemove,
                mouseup: this.mouseup
            });
        }
    });
})(jQuery);

// info

(function($) {
    $.asColorInput.registerComponent('info', {
        color: ['white', 'black', 'transparent'],
        init: function(api) {
            var template = '<ul class="' + api.namespace + '-info">' + '<li><label>R:<input type="text" data-type="r"/></label></li>' + '<li><label>G:<input type="text" data-type="g"/></label></li>' + '<li><label>B:<input type="text" data-type="b"/></label></li>' + '<li><label>A:<input type="text" data-type="a"/></label></li>' + '</ul>';
            this.$info = $(template).appendTo(api.$dropdown);
            this.$r = this.$info.find('[data-type="r"]');
            this.$g = this.$info.find('[data-type="g"]');
            this.$b = this.$info.find('[data-type="b"]');
            this.$a = this.$info.find('[data-type="a"]');

            this.$info.delegate('input', 'keyup update change', function(e) {
                var val;
                var type = $(e.target).data('type');
                switch (type) {
                    case 'r':
                    case 'g':
                    case 'b':
                        val = parseInt(this.value, 10);
                        if (val > 255) {
                            val = 255;
                        } else if (val < 0) {
                            val = 0;
                        }
                        break;
                    case 'a':
                        val = parseFloat(this.value, 10);
                        if (val > 1) {
                            val = 1;
                        } else if (val < 0) {
                            val = 0;
                        }
                        break;
                }
                if (isNaN(val)) {
                    val = 0;
                }
                var color = {};
                color[type] = val;
                api.value(color);
            });

            this.update(api);
        },
        update: function(api) {
            this.$r.val(api.color.value.r);
            this.$g.val(api.color.value.g);
            this.$b.val(api.color.value.b);
            this.$a.val(api.color.value.a);
        },
    });
})(jQuery);

// palettes

(function($) {
    function noop() {
        return;
    }
    if (!window.localStorage) {
        window.localStorage = noop;
    }

    $.asColorInput.registerComponent('palettes', {
        defaults: {
            colors: ['#fff', '#ffff00', '#f00', '#0f0', '#0ff', '#000'],
            max: 10,
            localStorage: true
        },
        init: function(api, options) {
            var self = this;

            this.options = $.extend(true, {}, this.defaults, options);

            // load colors from local storage
            if (this.options.localStorage) {
                var storeKey = api.namespace + '_palettes_' + api.id;
                var storeValue = this.getLocalItem(storeKey);
                if (storeValue) {
                    this.options.colors = storeValue;
                }
            }

            var list = '';
            $.each(this.options.colors, function(index, value) {
                list += self.getItem(value);
            });

            this.$palettes = $('<ul class="' + api.namespace + '-palettes"></ul>').html(list).appendTo(api.$dropdown);

            this.$palettes.delegate('li', 'click', function(e) {
                var color = $(this).data('color');

                api.set(color);

                e.preventDefault();
                e.stopPropagation();
            });

            api.$element.on('asColorInput::apply', function(event, api) {
                if (self.options.colors.indexOf(api.originalColor) !== -1) {
                    return;
                }
                if (self.options.colors.length >= self.options.max) {
                    self.options.colors.shift();
                    self.$palettes.find('li').eq(0).remove();
                }
                self.options.colors.push(api.originalColor);
                self.$palettes.append(self.getItem(api.originalColor));

                if (self.options.localStorage) {
                    self.setLocalItem(storeKey, self.options.colors);
                }
            });
        },
        getItem: function(color){
            return '<li data-color="' + color + '"><div style="background-color:' + color + '" /></li>';
        },
        setLocalItem: function(key, value) {
            var jsonValue = JSON.stringify(value);

            localStorage[key] = jsonValue;
        },
        getLocalItem: function(key) {
            var value = localStorage[key];

            return value ? JSON.parse(value) : value;
        }
    });
})(jQuery);

// preview

(function($) {
    $.asColorInput.registerComponent('preview', {
        init: function(api) {
            var self = this;
            var template = '<ul class="' + api.namespace + '-preview"><li class="' + api.namespace + '-preview-current"><div /></li><li class="' + api.namespace + '-preview-previous"><div /></li></ul>';
            this.$preview = $(template).appendTo(api.$dropdown);
            this.$current = this.$preview.find('.' + api.namespace + '-preview-current div');
            this.$previous = this.$preview.find('.' + api.namespace + '-preview-previous div');

            api.$element.on('asColorInput::firstOpen', function() {
                self.update(api);
                self.$previous.css('backgroundColor', api.color.toRGBA());

                api.$element.on('asColorInput::apply', function(event, api) {
                    self.$previous.css('backgroundColor', api.color.toRGBA());
                });

                self.$previous.on('click', function(){
                    api.set(api.originalColor);

                    return false;
                }); 
            });
        },
        update: function(api) {
            this.$current.css('backgroundColor', api.color.toRGBA());
        }
    });
})(jQuery);
// saturation

(function($) {
    $.asColorInput.registerComponent('saturation', {
        defaults: {},
        width: 0,
        height: 0,
        size: 6,
        data: {},
        init: function(api, options) {
            var self = this;
            var template = '<div class="' + api.namespace + '-saturation"><i><b></b></i></div>';
            this.options = $.extend(this.defaults, options),

            //build element and add component to picker
            this.$saturation = $(template).appendTo(api.$dropdown);
            this.$handle = this.$saturation.children('i');

            api.$element.on('asColorInput::firstOpen', function() {
                // init variable
                self.width = self.$saturation.width();
                self.height = self.$saturation.height();
                self.step = {
                    left: self.width / 20,
                    top: self.height / 20
                };
                self.size = self.$handle.width() / 2;

                // update
                self.update(api);
                
                // bind events
                self.bindEvents(api);
                self.keyboard(api);
            });
        },
        bindEvents: function(api) {
            var self = this;

            this.$saturation.on('mousedown.asColorInput', function(e) {
                var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                if (rightclick) {
                    return false;
                }
                $.proxy(self.mousedown, self)(api, e);
            });
        },
        mousedown: function(api, e) {
            var offset = this.$saturation.offset();

            this.data.startY = e.pageY;
            this.data.startX = e.pageX;
            this.data.top = e.pageY - offset.top;
            this.data.left = e.pageX - offset.left;
            this.data.cach = {};

            this.move(api, this.data.left, this.data.top);

            this.mousemove = function(e) {
                var x = this.data.left + (e.pageX || this.data.startX) - this.data.startX;
                var y = this.data.top + (e.pageY || this.data.startY) - this.data.startY;
                this.move(api, x, y);
                return false;
            };

            this.mouseup = function() {
                $(document).off({
                    mousemove: this.mousemove,
                    mouseup: this.mouseup
                });
                this.data.left = this.data.cach.left;
                this.data.top = this.data.cach.top;

                return false;
            };

            $(document).on({
                mousemove: $.proxy(this.mousemove, this),
                mouseup: $.proxy(this.mouseup, this)
            });

            return false;
        },
        move: function(api, x, y, update) {
            y = Math.max(0, Math.min(this.height, y));
            x = Math.max(0, Math.min(this.width, x));

            if (this.data.cach === undefined) {
                this.data.cach = {};
            }
            this.data.cach.left = x;
            this.data.cach.top = y;

            this.$handle.css({
                top: y - this.size,
                left: x - this.size
            });

            if (update !== false) {
                api.update({
                    s: x / this.width,
                    v: 1 - (y / this.height)
                }, 'saturation');
            }
        },
        update: function(api) {
            if (api.color.value.h === undefined) {
                api.color.value.h = 0;
            }
            this.$saturation.css('backgroundColor', $.asColor.HSLToHEX({
                h: api.color.value.h,
                s: 1,
                l: 0.5
            }));

            var x = api.color.value.s * this.width;
            var y = (1 - api.color.value.v) * this.height;

            this.move(api, x, y, false);
        },
        moveLeft: function(api) {
            var step = this.step.left,
                data = this.data;
            data.left = Math.max(0, Math.min(this.width, data.left - step));
            this.move(api, data.left, data.top);
        },
        moveRight: function(api) {
            var step = this.step.left,
                data = this.data;
            data.left = Math.max(0, Math.min(this.width, data.left + step));
            this.move(api, data.left, data.top);
        },
        moveUp: function(api) {
            var step = this.step.top,
                data = this.data;
            data.top = Math.max(0, Math.min(this.width, data.top - step));
            this.move(api, data.left, data.top);
        },
        moveDown: function(api) {
            var step = this.step.top,
                data = this.data;
            data.top = Math.max(0, Math.min(this.width, data.top + step));
            this.move(api, data.left, data.top);
        },
        keyboard: function(api) {
            var keyboard, self = this;
            if (api._keyboard) {
                keyboard = $.extend(true, {}, api._keyboard);
            } else {
                return false;
            }

            this.$saturation.attr('tabindex', '0').on('focus', function() {
                keyboard.attach({
                    left: function() {
                        self.moveLeft.call(self, api);
                    },
                    right: function() {
                        self.moveRight.call(self, api);
                    },
                    up: function() {
                        self.moveUp.call(self, api);
                    },
                    down: function() {
                        self.moveDown.call(self, api);
                    }
                });
                return false;
            }).on('blur', function() {
                keyboard.detach();
            });
        },
        destroy: function() {
            $(document).off({
                mousemove: this.mousemove,
                mouseup: this.mouseup
            });
        }
    });
})(jQuery);

// gradient

(function($) {
    $.asColorInput.registerComponent('gradient', {
        degree: 1,
        count: 0,
        markers: [],
        current: null,
        defaults: {
            gradientText: 'Gradient',
            cancelText: 'Cancel',
            keepMode: false,
        },
        init: function(api, options) {
            var self = this;
            this.options = $.extend(this.defaults, options);

            var template = '<div class="' + api.namespace + '-gradient-controll">' +
                    '<a href="#" class="' + api.namespace + '-gradient-trigger">'+this.options.gradientText+'</a>' +
                    '<a href="#" class="' + api.namespace + '-gradient-cancel">'+this.options.cancelText+'</a>' +
                '</div>' +
                '<div class="' + api.namespace + '-gradient">' +
                    '<div class="' + api.namespace + '-gradient-panel">' +
                        '<div class="' + api.namespace + '-gradient-markers"></div>' +
                    '</div>' +
                    '<div class="' + api.namespace + '-gradient-wheel">' +
                         '<i></i>' +
                    '</div>' +
                    '<input class="' + api.namespace + '-gradient-degree" type="text" value="360" size="3" />' +
                '</div>';
            this.api = api;
            this.classes = {
                enable: api.namespace + '-gradient' + '_enable',
                marker: api.namespace + '-gradient-marker',
                active: api.namespace + '-gradient-marker_active'
            };
            this.isOpened = false;
            this.initialized = false;
            this.$doc = $(document);

            this.$template = $(template).appendTo(api.$dropdown);
            this.$controll = self.$template.eq(0);
            this.$trigger = this.$controll.find('.' + api.namespace + '-gradient-trigger');
            this.$cancel = this.$controll.find('.' + api.namespace + '-gradient-cancel');
            this.$gradient = this.$template.eq(1);
            this.$panel = this.$gradient.find('.' + api.namespace + '-gradient-panel');
            this.$markers = this.$gradient.find('.' + api.namespace + '-gradient-markers');
            this.$wheel = this.$gradient.find('.' + api.namespace + '-gradient-wheel');
            this.$pointer = this.$wheel.find('i');
            this.$degree = this.$gradient.find('.' + api.namespace + '-gradient-degree');

            this.g_input.init(this);
            this.g_controll.init(this);
            this.g_panel.init(this);
            this.g_wheel.init(this);
            this.g_degree.init(this);

            api.$element.on('asColorInput::ready', function(event, instance) {
                if (instance.options.mode !== 'gradient') {
                    return;
                }
                if ((matched = self.g_input.gradient.match.exec(self.api.gradient)) != null) {
                    self.keepGradient(self);
                    self.g_input.gradient.parse(matched, self);
                }

                if (self.options.keepMode) {
                    self.keepGradient(self);
                }
            });
        },
        keepGradient: function(self) {
            self.width = self.$markers.width();
            self.isOpened = true;
            self.$gradient.addClass(self.classes.enable);
            self.api.isGradient = true;
            self.g_controll.makeGradient(self);
            self.api.position();
        },
        g_input: {
            init: function(self) {
                this.bind(self);
            },
            bind: function(self) {
                var itself = this;
                self.api.$element.on('keyup', function(e) {
                    if (!self.api.isGradient) {
                        return;
                    }

                    if (e.keyCode === 27) {
                        self.api.close();
                    }else if (e.keyCode === 13) {
                        if ((matched = itself.gradient.match.exec(self.api.$element.val())) != null) {
                            itself.gradient.parse(matched, self);
                            self.api.update({}, 'input');
                            self.api.$element.focus();
                        }
                    }
                });
            },
            gradient: {
                match: /gradient\(\s*(\d{1,3})deg\s*,((\s*\S*)+)\)/,
                parse: function(result, self) {
                    var markers_re = /(#([^\s]+)|rgb\([^\)]+\)|rgba\([^\)]+\))\s*(\d{1,3}%)/g,
                        degree = result[1],
                        markers = result[2].match(markers_re),
                        percent;

                    self.$markers.children().remove();
                    self.markers = [];
                    self.count = 0;
                    self.g_wheel.setDegree(degree, self);
                    for (var i in markers) {
                        self.api.color.from(markers[i]);
                        percent = parseInt(markers[i].match(/[^\,\(]\)*\s+(\d{1,3})%/)[1]);
                        self.g_panel.makeMarker(self.api.color, percent, self);
                        self.api.set(self.api.color);
                    }
                },
            },
        },
        g_controll: {
            init: function(self) {
                var itself = this;
                this.bind(self);

                self.api.$element.on('asColorInput::close', function() {
                    if (self.api.isGradient) {
                        itself.setGradient(self);
                    }
                    return false;
                });
            },
            bind: function(self) {
                var itself = this,
                    api = self.api;
                self.$trigger.on('click', function() {
                    if (self.options.keepMode) {
                        return false;
                    }
                    if (self.isOpened) {
                        self.$gradient.removeClass(self.classes.enable);
                        itself.setGradient(self);
                        api.isGradient = false;
                        api.set(api.originalColor);
                    } else {
                        self.width = self.$markers.width();
                        self.$gradient.addClass(self.classes.enable);
                        api.isGradient = true;
                        itself.makeGradient(self);
                        api.$element.focus();
                    }
                    api.position();
                    self.isOpened = !self.isOpened;
                    return false;
                });

                self.$cancel.on('click', function() {
                    api.color.from('#000');
                    api.update({});
                    self.count = 0;
                    itself.retrieve(self);
                    return false;
                });
            },
            setGradient: function(self) {
                var itself = this;
                // copy array with object element
                this.origin = {};
                this.origin.markers = [];
                self.markers.map(function(marker) {
                    var copy = {
                        color: marker.color,
                        percent: marker.percent
                    };
                    itself.origin.markers.push(copy);
                });
                this.origin.degree = self.degree;
            },
            makeGradient: function(self) {
                var markers = self.markers,
                    api = self.api,
                    gradient = 'gradient(' + (self.degree ? self.degree : 0) + 'deg,',
                    f1 = '',
                    f2 = '',
                    prefix = this.getPrefix();
                // sort array by percent 
                markers.sort(function(a, b) {
                    return a.percent > b.percent;
                });
                markers.map(function(marker, key, markers) {
                    gradient += marker.color + ' ' + marker.percent + '%,';
                    if (key === (markers.length - 1)) {
                        f1 += 'color-stop(' + marker.percent / 100 + ',' + marker.color + ')';
                        f2 += marker.color + ' ' + marker.percent + '%';
                    } else {
                        f1 += 'color-stop(' + marker.percent / 100 + ',' + marker.color + '),';
                        f2 += marker.color + ' ' + marker.percent + '%,';
                    }
                });
                gradient = gradient.substring(0, gradient.length - 1);
                gradient += ')';
                api.gradient = prefix + 'linear-' + gradient;
                api._trigger('gradientChange', gradient);

                // enable value on input element
                api.$element.val(gradient);

                if (prefix === '-webkit-') {
                    self.$panel[0].style.backgroundImage = prefix + 'gradient(linear, left top, right top, ' + f1 + ')';
                }
                self.$panel[0].style.backgroundImage = prefix + 'linear-gradient(left, ' + f2 + ')';

                api.components.trigger.update(api);
                
                return gradient;
            },
            retrieve: function(self) {
                self.markers.map(function(marker) {
                    marker.$element.blur();
                    marker.$element.remove();
                });
                self.markers = [];
                self.g_panel.makeMarker('#fff', 0, self);
                self.g_panel.makeMarker('#000', 100, self);
                self.g_wheel.setDegree(0, self);
                this.makeGradient(self);
            },
            getPrefix: function() {
                var ua = window.navigator.userAgent;
                var prefix = '';
                if (/MSIE/g.test(ua)) {
                    prefix = '-ms-';
                } else if (/Firefox/g.test(ua)) {
                    prefix = '-moz-';
                } else if (/(WebKit)/i.test(ua)) {
                    prefix = '-webkit-';
                } else if (/Opera/g.test(ua)) {
                    prefix = '-o-';
                }
                return prefix;
            },
        },
        g_panel: {
            init: function(self) {
                this.makeMarker('#fff', 0, self);
                this.makeMarker('#000', 100, self);
                this.bind(self);

                self.api.$element.on('asColorInput::change', function(event, instance) {
                    if (self.current && self.api.isGradient && !self.api.clear) {
                        if (instance.color.value.a === 0) {
                            instance.color.value.a = 1;
                        }
                        self.current.setColor(instance.color.toRGBA());
                        self.g_controll.makeGradient(self);
                        self.api._trigger('apply');
                    }else if (self.api.clear) {
                        self.count = 0;
                        self.g_controll.retrieve(self);
                        self.api.gradient = '';
                    }
                });
            },
            bind: function(self) {
                var itself = this;
                // create new marker
                self.$markers.on('mousedown.asColorInput', function(e) {
                    var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                    if (rightclick) {
                        return false;
                    }
                    var position = e.pageX - self.$markers.offset().left;
                    var percent = Math.round((position / self.width) * 100);
                    itself.makeMarker('#fff', percent, self);
                    self.g_controll.makeGradient(self);
                    return false;
                });
            },
            makeMarker: function(color, percent, self) {
                var itself = this;
                var $doc = self.$doc;
                var Marker = function() {
                    this.color = color;
                    this.percent = percent;
                    this._id = ++self.count;
                    this.$element = $('<span class="' + self.classes.marker + '"><i></i></span>').attr('tabindex', 0).data('id', this._id);
                    this.$element.appendTo(self.$markers);
                    this.$element.on('mousedown.asColorInput', function(e) {
                        var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                        if (rightclick) {
                            return false;
                        }
                        itself.mousedown(e, this, self);
                        return false;
                    });
                };
                Marker.prototype.setColor = function(color) {
                    this.color = color;
                    this.$element.find('i').css({
                        background: color
                    });
                };
                Marker.prototype.setPercent = function(percent) {
                    this.percent = percent;
                    this.$element.css({
                        left: percent + '%'
                    });
                };

                var marker = new Marker();
                marker.setPercent(percent);
                marker.setColor(color);
                self.markers.push(marker);

                if (self.current !== null) {
                    self.api.originalColor = self.current.color;
                    self.api._trigger('apply');
                }

                self.$markers.children().removeClass(self.classes.active);
                self.current = marker;
                marker.$element.addClass(self.classes.active).focus();

                marker.hasBinded = false;
                marker.$element.on('focus', function() {
                    if (!marker.hasBinded) {
                        $doc.on('keydown.' + marker._id, function(e) {
                            var key = e.keyCode || e.which;
                            if (key === 46) {
                                if (self.count <= 2) {
                                    return;
                                }
                                itself.del(marker, self);
                                self.g_controll.makeGradient(self);
                                self.$markers.children().eq(self.count - 1).addClass(self.classes.active).focus();
                            }
                        });
                        
                        marker.hasBinded = true;
                    }
                }).on('blur', function() {
                    $doc.off('keydown.' + marker._id);
                    marker.hasBinded = false;
                });

                return marker;
            },
            mousedown: function(e, dom, self) {
                var itself = this,
                    api = self.api;
                // get current marker
                var id = $(dom).data('id');
                var instance;
                $.each(self.markers, function(key, marker) {
                    if (marker._id === id) {
                        instance = marker;
                    }
                });
                
                if (self.current !== instance) {
                    api.originalColor = self.current.color;
                    self.current.$element.removeClass(self.classes.active);
                    self.current = instance;
                    instance.$element.addClass(self.classes.active);
                }

                // get marker current position
                var begining = $(dom).position().left,
                    start = e.pageX,
                    end;

                api.set(instance.color);

                this.mousemove = function(e) {
                    end = e.pageX || start;
                    var position = begining + end - start;
                    itself.move(instance, position, self);
                    return false;
                };

                this.mouseup = function() {
                    $(document).off({
                        mousemove: this.mousemove,
                        mouseup: this.mouseup
                    });

                    return false;
                };

                $(document).on({
                    mousemove: $.proxy(this.mousemove, this),
                    mouseup: $.proxy(this.mouseup, this)
                });
                $(dom).focus();
                return false;
            },
            move: function(marker, position, self) {
                position = Math.max(0, Math.min(self.width, position));
                var percent = Math.round((position / self.width) * 100);

                marker.setPercent(percent);
                self.g_controll.makeGradient(self);
            },
            del: function(marker, self) {
                self.count -= 1;
                marker.$element.blur();
                marker.$element.remove();
                self.markers.splice(self.markers.indexOf(marker), 1);
            },
        },
        g_wheel: {
            init: function(self) {
                var itself = this;
                this.bind(self);

                setTimeout(function() {
                    itself.setDegree(0, self);
                    self.initialized = true;
                }, 0);
            },
            bind: function(self) {
                var itself = this;
                self.$wheel.on('mousedown.asColorInput', function(e) {
                    var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                    if (rightclick) {
                        return false;
                    }
                    itself.mousedown(e, self);
                    return false;
                });
            },
            mousedown: function(e, self) {
                var offset = self.$wheel.offset();
                var r = self.$wheel.width() / 2;
                var startX = offset.left + r;
                var startY = offset.top + r;
                var $doc = self.$doc;
                var itself = this;

                this.r = r;

                this.wheelMove = function(e) {
                    var x = e.pageX - startX;
                    var y = startY - e.pageY;
                    var position = itself.getPosition(x, y);
                    var deg = itself.calDegree(position.x, position.y);
                    itself._setDegree(deg, self);
                    var pos = itself.calPointer(deg, r);
                    self.$pointer.css({
                        left: pos.x,
                        top: pos.y
                    });
                };
                this.wheelMouseup = function() {
                    $doc.off({
                        mousemove: this.wheelMove,
                        mouseup: this.wheelMouseup
                    });
                    return false;
                };
                $doc.on({
                    mousemove: $.proxy(this.wheelMove, this),
                    mouseup: $.proxy(this.wheelMouseup, this)
                });

                // set value first
                this.wheelMove(e);
            },
            getPosition: function(a, b) {
                var r = this.r;
                var x = a / Math.sqrt(a * a + b * b) * r;
                var y = b / Math.sqrt(a * a + b * b) * r;
                return {
                    x: x,
                    y: y
                };
            },
            calDegree: function(x, y) {
                var deg = Math.round(Math.atan(Math.abs(y / x)) * (180 / Math.PI));
                if (x <= 0 && y > 0) {
                    return 180 - deg;
                }
                if (x <= 0 && y <= 0) {
                    return deg + 180;
                }
                if (x > 0 && y <= 0) {
                    return 360 - deg;
                }
                if (x > 0 && y > 0) {
                    return deg;
                }
            },
            _setDegree: function(deg, self) {
                self.degree = deg;
                self.$degree.val(deg);
                if (self.initialized) {
                    // avoid setting value on input element when init
                    self.g_controll.makeGradient(self);
                }
            },
            setDegree: function(deg, self) {
                if (self.degree === deg) {
                    return false;
                }
                var r = this.r || self.$wheel.width() / 2;
                var pos = this.calPointer(deg, r);
                self.$pointer.css({
                    left: pos.x,
                    top: pos.y
                });
                this._setDegree(deg, self);
            },
            calPointer: function(deg, r) {
                var x = Math.cos(deg * Math.PI / 180) * r;
                var y = Math.sin(deg * Math.PI / 180) * r;
                return {
                    x: r + x,
                    y: r - y
                };
            },
        },
        g_degree: {
            init: function(self) {
                this.bind(self);
            },
            bind: function(self) {
                self.$degree.on('blur.asColorInput', function() {
                    var deg = parseInt(this.value, 10);
                    self.g_wheel.setDegree(deg, self);
                    return false;
                }).on('keydown.asColorInput', function(e) {
                    var key = e.keyCode || e.which;
                    if (key === 13) {
                        $(this).blur();
                        return false;
                    }
                });
            }
        },
        destory: function() {
            this.$element.off('click');
            this.$element.remove();
        }
    });
})(jQuery);
