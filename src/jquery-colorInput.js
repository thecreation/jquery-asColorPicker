/*
 * jquery-colorInput
 * https://github.com/amazingSurge/jquery-colorInput
 *
 * Copyright (c) 2013 AmazingSurge
 * Licensed under the GPL license.
 */
(function(window, document, $, Color, undefined) {
    "use strict";

    var expandHex = function(hex) {
        if (!hex) {
            return null;
        }
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        return hex.length === 6 ? hex : null;
    };

    var hasTouch = ('ontouchstart' in window);

    // Constructor
    var ColorInput = $.colorInput = function(input, options) {

        this.input = input;
        this.$input = $(input);

        //flag
        this.opened = false;
        this.enabled = true;
        this.isFirstOpen = true;

        // options
        var meta_data = [];
        $.each(this.$input.data(), function(k, v) {
            var re = new RegExp("^color", "i");
            if (re.test(k)) {
                meta_data[k.toLowerCase().replace(re, '')] = v;
            }
        });

        this.options = $.extend(true, {}, ColorInput.defaults, options, meta_data);
        this.namespace = this.options.namespace;
        this.hasTouch = hasTouch;

        if (this.options.showInput === false) {
            this.$input.css({display: 'none'});
        }

        this.components = $.extend(true,{},this.components);

        var _comps =  ColorInput.skins[this.options.skin] || '';
        this._comps = _comps.split(',');

        // this._comps.splice(this._comps.indexOf('trigger'),1);

        // color value and format
        if (this.input.value === '') {
            this.color = new Color({
                r: 255,
                g: 255,
                b: 255,
                a: 1
            }, this.options.format);
        } else {
            this.color = new Color(this.input.value, this.options.format);
        }

        //save this.color  as a rgba value 
        this.originalColor = this.color.toRGBA();
        this.init();
    };

    ColorInput.prototype = {
        constructor: ColorInput,
        components: {},
        init: function() {
            var self = this;
            this.$picker = $('<div draggable=false class="' + this.namespace + ' '+ this.options.skin +' drag-disable"></div>');
            this.$input.addClass('colorInput-input');

            if (this.options.flat === true) {
                this.create();
                this.$input.addClass('colorInput-flat').css({
                    display: 'none'
                });

                this.$picker.addClass('colorInput-flat').insertAfter(this.$input).css({
                    position: 'relative',
                    top: 0,
                    left: 0
                });
                this.show();
            } else {
                this.components.trigger.init(this);
                this.create();
                this.$picker.appendTo('body');
                this.$input.on({
                    'focus.colorInput': function() {
                        self.show();
                    },
                    'keydown.colorInput': function(e) {
                        if (e.keyCode === 9) {
                            self.hide();
                        } else if (e.keyCode === 13) {
                            self.color.from(self.$input.val());
                            self.update({}, 'input');
                            self.hide();
                        }
                    },
                    'keyup.colorInput': function() {
                        self.color.from(self.$input.val());
                        self.update({}, 'input');
                    }
                });
            }
            this.$picker.trigger('colorInput::init', this);
            if ($.type(this.options.onInit) === 'function') {
                this.options.onInit(this);
            }
        },
        create: function() {
            var self = this;
            $.each(this._comps,function(i,v) {
                self.components[v] && self.components[v].init(self);
            });
            this.$picker.trigger('colorInput::create');
        },
        bindEvent: function() {
            var self = this;
            
            $(document).on('mousedown.colorInput', function(e) {
                if ($(e.target).is(self.$input)) {
                    return;
                }
                if (self.options.hideFireChange === false) {
                    self.cancel();
                } else {
                    self.apply();
                }

                return false;
            });

            // bind resize action
            $(window).on('resize.colorInput', $.proxy(this.position, this));
        },
        unbindEvent: function() {
            $(document).off('mousedown.colorInput');
            $(window).off('resize.colorInput');
        },

        // update all component value except trigger component
        // and set color to color object
        update: function(color,trigger) {
            var self = this;

            //set chosen color to color object
            if (color !== {}) {
                self.color.set(color);
            }

            this.$picker.trigger('colorInput::change', this);
            if ($.type(this.options.onChange) === 'function') {
                this.options.onChange(this);
            }

            // update all components 
            $.each(this._comps,function(i,v) {
                if (trigger !== v) {
                    self.components[v] && self.components[v].update && self.components[v].update(self);
                }
            });

            if (this.options.flat !== true) {
                this.components.trigger.update(this);
            }

            if (trigger !== 'input') {
                if (self.options.format) {
                    self.$input.val(self.get(self.options.format));
                } else {
                    self.$input.val(self.color.toString());
                }
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
            var hidden = !this.$input.is(':visible'),
                offset = hidden ? this.$trigger.offset() : this.$input.offset(),
                height = hidden ? this.$trigger.outerHeight() : this.$input.outerHeight(),
                width = hidden ? this.$trigger.outerWidth() : this.$input.outerWidth() + this.$trigger.outerWidth(),
                picker_width = this.$picker.outerWidth(),
                picker_height = this.$picker.outerHeight(),
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

            this.$picker.css({
                position: 'absolute',
                top: top,
                left: left
            });
        },

        /*
            Public Method
         */

        show: function() {

            if (this.enabled === false) {
                return;
            }

            this.$picker.on('mousedown',function(e) {
                e.stopPropagation();
            });

            if (this.options.flat === false) {             
                this.position();
                this.$picker.css({
                    display: 'block'
                });
                this.bindEvent();
            } 

            this.opened = true;
            this.$picker.trigger('colorInput::show', this);
            if ($.type(this.options.onChange) === 'function') {
                this.options.onShow(this);
            }
            this.isFirstOpen = false;
        },
        close: function() {
            if (this.options.flat === true) {
                return;
            }
            this.unbindEvent();
            this.$picker.css({display:'none'});
            this.$input.blur();

            this.$picker.trigger('colorInput::close', this);
            if ($.type(this.options.onChange) === 'function') {
                this.options.onClose(this);
            }
        },
        cancel: function() {
            this.color.from(this.originalColor);
            this.update({});
            this.close();
        },
        apply: function() {
            this.originalColor = this.color.toRGBA();
            this.close();

            this.$picker.trigger('colorInput::apply', this);
            if ($.type(this.options.onApply) === 'function') {
                this.options.onApply(this);
            }
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
            this.enabled = true;
            this.$parent.addClass(this.namespace + 'enabled');
            return this;
        },
        disable: function() {
            this.enabled = false;
            this.$parent.removeClass(this.namespace + 'enabled');
            return this;
        },
        destroy: function() {
            // need to fix
        }
    };

    ColorInput.registerComponent = function (component, methods) {
        ColorInput.prototype.components[component] = methods;
    };

    // Default options for the plugin as a simple object
    ColorInput.defaults = {
        namespace: 'colorInput',

        readonly: false,
        skin: null,

        flat: false,

        //not ready
        showSelected: false,
        showInput: false,

        hideFireChange: false,

        onlyBtn: false,
        format: 'rgb',
        components: {
            check: {
                applyText: 'apply',
                cancelText: 'cancel'
            }
        },
        onChange: function(instance) {
            console.log(instance);
        },
        onClose: function(instance) {
            console.log('close');
        },
        onShow: function(instance) {
            console.log('show');
        }
    };

    ColorInput.skins = {
        'skin-simple': 'palettes',
        'skin-fansion': 'saturation,hue,alpha,hex,preview',
        'skin-1': 'saturation,Hhue,Halpha,hex,preview,palettes,check',
        'skin-2': 'saturation,hue,alpha,hex,preview,check'
    };

    ColorInput.registerComponent('trigger', {
        template: '<div class="colorInput-trigger"><span></span></div>',
        init: function(api) {

            api.$trigger = $(this.template).addClass(api.options.skin);
            this.$trigger_inner = api.$trigger.children('span');

            api.$trigger.insertAfter(api.$input);
            api.$trigger.on('click',$.proxy(api.show, api));
            this.update(api);
        },
        update: function(api) {
            this.$trigger_inner.css('backgroundColor', api.color.toRGBA());
        },
        destroy: function(api) {
            api.$trigger.remove();
        }
    });

    // Collection method.
    $.fn.colorInput = function(options) {
        if (typeof options === 'string') {
            var method = options;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;

            return this.each(function() {
                var api = $.data(this, 'colorInput');
                if (typeof api[method] === 'function') {
                    api[method].apply(api, method_arguments);
                }
            });
        } else {
            return this.each(function() {
                if (!$.data(this, 'colorInput')) {
                    $.data(this, 'colorInput', new ColorInput(this, options));
                }
            });
        }
    };
}(window, document, jQuery, (function() {
    if ($.colorValue === undefined) {
        //console.info('lost dependency lib of $.colorValue , please load it first !');
        return false;
    } else {
        return $.colorValue;
    }
}())));


// todo list
// 
// 1, register modal: fast set different components
// 2, event: use event to extend component
// 3, theme: change skin to theme

