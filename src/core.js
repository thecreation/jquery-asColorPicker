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
        this.initialed = false;

        createId(this);

        this.options = $.extend(true, {}, AsColorInput.defaults, options, this.$element.data());
        this.namespace = this.options.namespace;

        this.classes = {
            wrap: this.namespace + '-wrap',
            dropdown: this.namespace + '-dropdown',
            input: this.namespace + '-input',
            skin: this.namespace + '_' + this.options.skin,
            open: this.namespace + '_open',
            mask: this.namespace + '-mask',
            hideInput: this.namespace + '_hideInput',
            disabled: this.namespace + '_disabled',
            mode: this.namespace + '-mode_' + this.options.mode
        };
        if (this.options.hideInput) {
            this.$element.addClass(this.classes.hideInput);
        }

        this.components = $.extend(true, {}, this.components);

        this._comps = AsColorInput.modes[this.options.mode];

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
  
            this.color = new Color(this.element.value, this.options.format, this.options.color);

            this._create();

            if (this.options.skin) {
                this.$dropdown.addClass(this.classes.skin);
                this.$element.parent().addClass(this.classes.skin);
            }

            if(this.options.readonly){
                this.$element.prop('readonly', true);
            }
            
            this._bindEvent();

            this.initialed = true;
            this._trigger('ready');
        },

        _create: function() {
            var self = this;

            this.$dropdown = $('<div class="' + this.classes.dropdown + '" data-mode="'+this.options.mode+'"></div>');
            this.$element.wrap('<div class="' + this.classes.wrap + '"></div>').addClass(this.classes.input);
            
            this.$wrap = this.$element.parent();
            this.$body = $('body');

            this.$dropdown.data('asColorInput', this);

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
        _bindEvent: function() {
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
                        self.color.val(self.$element.val());
                        self.update({}, 'input');
                        self.close();
                    }
                },
                'keyup.asColorInput': function() {
                    if (self.isGradient) {
                        return;
                    }
                    self.color.val(self.$element.val());
                    self.update({}, 'input');
                }
            });
        },
        _trigger: function(eventType) {
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined,
                data;
            if (method_arguments) {
                data = method_arguments;
                data.push(this);
            }else {
                data = this;
            }
            // event
            this.$element.trigger('asColorInput::' + eventType, data);
            this.$element.trigger(eventType + '.asColorInput', data);

            // callback
            eventType = eventType.replace(/\b\w+\b/g, function(word) {
                return word.substring(0, 1).toUpperCase() + word.substring(1);
            });
            var onFunction = 'on' + eventType;
            if (typeof this.options[onFunction] === 'function') {
                this.options[onFunction].apply(this, method_arguments);
            }
        },
        update: function(color, trigger) {
            var self = this;

            //set chosen color to color object
            if (color !== {}) {
                self.color.set(color);
            }

            this._trigger('change', this.val(), this.options.name, 'asColorInput');

            // update all components 
            $.each(this._comps, function(key, options) {
                if (trigger !== key) {
                    self.components[key] && self.components[key].update && self.components[key].update(self);
                }
            });

            this.components.trigger.update(this);

            this.$element.val(this.color.toString());
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
            this.color.val('#fff');
            this.update({});
            this.close();
        },
        cancel: function() {
            this.color.val(this.originalColor);
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
        val: function(value) {
            if (typeof value === 'undefined') {
                return this.value.toString();
            }

            if (value) {
                this.set(value);
            } else {
                this.clear();
            }
        },
        set: function(value, update) {
            this.color.val(value);

            if (update !== false) {
                this.update();
            }
            return this;
        },
        get: function() {
            return this.color;
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
        color: {
            shortenHex: false,
            hexUseName: false,
            reduceAlpha: false,
            nameDegradation: 'HEX',
            invalidValue: '',
            zeroAlphaAsTransparent: true
        },
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
            this.$trigger_inner[0].style.backgroundImage = '';
            this.$trigger_inner.css('backgroundColor', api.color.toRGBA());
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
