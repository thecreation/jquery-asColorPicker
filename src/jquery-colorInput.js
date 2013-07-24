/*
 * jquery-colorInput
 * https://github.com/amazingSurge/jquery-colorInput
 *
 * Copyright (c) 2013 AmazingSurge
 * Licensed under the GPL license.
 */

(function(window, document, $, Color, undefined) {
    "use strict";

    var namespace = 'colorInput';

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
        this.$input = $(input).css({display: 'none'});
        this.$parent = $(input).parent();

        //flag
        this.opened = false;
        this.cancelled = false;

        // options
        var meta_data = [];
        $.each(this.$input.data(), function(k, v) {
            var re = new RegExp("^color", "i");
            if (re.test(k)) {
                meta_data[k.toLowerCase().replace(re, '')] = v;
            }
        });

        this.options = $.extend(true, {}, ColorInput.defaults, options, meta_data);
        this.hasTouch = hasTouch;

        //copy a registered components from prototype 
        //so every instance has their own components
        this.components = $.extend(true,{},this.components);

        // refer to a array object , so it also need deep copy to this._comps
        // here change array to string ,than change the string to array
        // it fixed the issue
        var _comps =  ColorInput.skins[this.options.skin] || '';
        this._comps = _comps.split(',');

        if (this.options.flat === true) {
            this._comps.splice(this._comps.indexOf('trigger'),1);
        }

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

        this.create();
    };

    
    // Default options for the plugin as a simple object
    ColorInput.prototype = {
        constructor: ColorInput,
        components: {},
        create: function() {
            var self = this;
            // Create picker
            this.$picker = $('<div draggable=false class="colorInput '+ this.options.skin +' drag-disable"></div>');

            // Init components
            $.each(this._comps,function(i,v) {
                self.components[v] && self.components[v].init(self);
            });

            this.$input.addClass('colorInput-input');

            if (this.options.flat === true) {
                this.$input.addClass('colorInput-flat').css({
                    display: 'none'
                });
                this.show();
            } else {

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

            // stop dragging in colorInput
            this.$picker.on('mousedown',function(e) {
                var duringDragEvents = {};
                duringDragEvents['selectstart'] = prevent;
                duringDragEvents['dragstart'] = prevent;
                duringDragEvents['mouseup'] = off;

                function prevent(e) {
                    if (e.stopPropagation) {
                        e.stopPropagation();
                    }
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    e.returnValue = false;
                }

                function off(e) {
                    $(document).off(duringDragEvents);
                }

                $(document).on(duringDragEvents);

                return false;
            });
        },
        show: function() {
            var self = this;

            this.opened = true;

            if (this.$input.prop('disabled')) {
                return false;
            }

            if (this.options.onlyBtn === true) {
                this.cancelled = true;
            }

            this.$picker.on('mousedown',function(e) {
                e.stopPropagation();
            });

            // add picker to DOM
            if (this.options.flat !== true) {

                this.$picker.appendTo('body')
                this.position();
                this.$picker.show();


                // bind input element action
                $(document).on('mousedown.colorInput', function(e) {

                    console.log('document mousedown');

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
            } else {

                this.$picker.addClass('colorInput-flat').appendTo(this.$parent).css({
                    position: 'relative',
                    top: 0,
                    left: 0
                });
            }   
        },

        // update all component value except trigger component
        // and set color to color object
        update: function(color,trigger) {
            var self = this;

            //set chosen color to color object
            if (color !== {}) {
                self.color.set(color);
            }

            // update all components 
            $.each(this._comps,function(i,v) {

                if (trigger !== v) {
                    self.components[v] && self.components[v].update && self.components[v].update(self);
                }
            });

            if (trigger !== 'input') {
                self.$input.val(self.color.toString());
            }
        },
        disabled: function(data) {
            if (this.created) {
                this.$input.prop('disabled', data);
            }

            if (data) {
                this.$picker.addClass('is-disabled');
            } else {
                this.$picker.removeClass('is-disabled');
            }

            return this;
        },
        value: function(data) {
            if (data) {
                this.color.from(data);
                this.update();
            } else {
                return this.color.toString();
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

        //resume to the value before the colorInput show
        cancel: function() {
            this.color.from(this.originalColor);
            this.update({});
            this.hide();
        },
        apply: function() {
            this.originalColor = this.color.toRGBA();
            this.hide();
        },
        hide: function() {

            // flat should keep open all the time
            if (this.options.flat === true) {
                return
            }

            if (this.cancelled === true) {
                this.cancel();
            }

            this.$picker.hide();
            this.$input.blur();

            $(document).off('mousedown.colorInput');
            $(window).off('resize.colorInput');
        },
        destroy: function() {},
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
        }
    };

    ColorInput.registerComponent = function (component, methods) {
        ColorInput.prototype.components[component] = methods;
    };

    // Default options for the plugin as a simple object
    ColorInput.defaults = {
        disabled: false,
        readonly: false,
        skin: 'skin-1',

        flat: false,

        //not ready
        showSelected: false,

        hideFireChange: false,

        onlyBtn: false,
        format: 'hex',
        components: {
            check: {
                applyText: 'apply',
                cancelText: 'cancel'
            }
        }
    };

    ColorInput.skins = {
        'skin-simple': 'trigger,palettes',
        'skin-fansion': 'trigger,saturation,hue,alpha,hex,preview',
        'skin-1': 'trigger,saturation,h-hue,h-alpha,hex,preview,palettes,check',
        'skin-2': 'trigger,saturation,hue,alpha,hex,preview,check'
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
                var api = $.data(this, namespace);
                if (typeof api[method] === 'function') {
                    api[method].apply(api, method_arguments);
                }
            });
        } else {
            return this.each(function() {
                if (!$.data(this, namespace)) {
                    $.data(this, namespace, new ColorInput(this, options));
                }
            });
        }
    };
}(window, document, jQuery, (function() {
    if ($.colorValue === undefined) {
        throw new Error('can not find dependency !');
    } else {
        return $.colorValue;
    }
}())));





