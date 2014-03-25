/*
 * jquery-asColorInput
 * https://github.com/amazingSurge/jquery-asColorInput
 *
 * Copyright (c) 2013 AmazingSurge
 * Licensed under the GPL license.
 */
(function(window, document, $, Color, undefined) {
    "use strict";

    var id = 0,
        IE = !! /msie/i.exec(window.navigator.userAgent);

    function createId(api) {
        api.id = id;
        id++;
    }

    function noop() {
        return;
    }
    if (!window.localStorage) {
        window.localStorage = noop;
    }

    // Constructor
    var AsColorInput = $.asColorInput = function(element, options) {
        this.element = element;
        this.$element = $(element);

        //flag
        this.opened = false;
        this.disabled = false;
        this.isFirstOpen = true;

        // options
        var meta_data = [];
        $.each(this.$element.data(), function(k, v) {
            var re = new RegExp("^asColorInput", "i");
            if (re.test(k)) {
                meta_data[k.toLowerCase().replace(re, '')] = v;
            }
        });

        createId(this);

        this.options = $.extend(true, {}, AsColorInput.defaults, options, meta_data);
        this.namespace = this.options.namespace;

        this.classes = {
            input: this.namespace + '-input',
            skin: this.namespace + '_' + this.options.skin,
            show: this.namespace + '_show',
            mask: this.namespace + '-mask',
            flat: this.namespace + '_flat',
            showInput: this.namespace + '_showInput',
            disabled: this.namespace + '_disabled'
        };

        this.components = $.extend(true, {}, this.components);

        if (this.options.localStorage) {
            var key = 'input_' + this.id;
            var value = this.getLocalItem(key);
            if (value) {
                this.element.value = value;
            }
        }

        var _comps = AsColorInput.skins[this.options.skin] || 'saturation,hue';
        this._comps = _comps.split(',');

        // color value and format
        // here get init value from input elemnt
        // fix: how about setting it on options ?
        if (this.element.value === '') {
            this.color = new Color({
                r: 255,
                g: 255,
                b: 255,
                a: 1
            }, this.options.format);
        } else {
            this.color = new Color(this.element.value, this.options.format);
        }

        if (this.options.showInput) {
            this.$element.addClass(this.classes.showInput);
        } else {
            if (this.options.format) {
                this.$element.val(this.get(this.options.format));
            } else {
                this.$element.val(this.color.toString());
            }
        }

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
            this.$picker = $('<div draggable=false class="' + this.namespace + ' drag-disable"></div>');
            this.$element.wrap('<div class="' + this.namespace + '-wrap"></div>').addClass(this.classes.input);
            this.$wrap = this.$element.parent();

            if (this.options.skin) {
                this.$picker.addClass(this.classes.skin);
                this.$element.parent().addClass(this.classes.skin);
            }

            this.create();
            if (this.options.flat) {
                this.$element.addClass(this.classes.flat);
                this.$picker.addClass(this.classes.flat).insertAfter(this.$element);
                this.show();
            } else {
                this.$picker.appendTo('body');
                this.$element.on({
                    'click.asColorInput': function() {
                        if (!self.opened) {
                            self.show();
                        }
                        return false;
                    },
                    'keydown.asColorInput': function(e) {
                        if (e.keyCode === 9) {
                            self.close();
                        } else if (e.keyCode === 13) {
                            self.color.from(self.$element.val());
                            self.update({}, 'input');
                            self.close();
                        }
                    },
                    'keyup.asColorInput': function() {
                        self.color.from(self.$element.val());
                        self.update({}, 'input');
                    }
                });
            }

            this._trigger('ready');
        },
        create: function() {
            var self = this;
            if (!this.options.flat) {
                this.components.trigger.init(this);
            }
            $.each(this._comps, function(i, v) {
                self.components[v] && self.components[v].init(self);
            });
            this._trigger('create');
        },
        bindEvent: function() {
            $(window).on('resize.asColorInput', $.proxy(this.position, this));
            this.$picker.on('click.asColorInput', function() {
                return false;
            });
            this.$wrap.on('click.asColorInput', function() {
                return false;
            });
        },
        unbindEvent: function() {
            $(window).off('resize.asColorInput');
        },
        _trigger: function(eventType) {
            // event
            this.$element.trigger('asColorInput::' + eventType, this);

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
            $.each(this._comps, function(i, v) {
                if (trigger !== v) {
                    self.components[v] && self.components[v].update && self.components[v].update(self);
                }
            });

            if (!this.options.flat) {
                this.components.trigger.update(this);
            }

            if (trigger !== 'input') {
                if (!this.isGradient) {
                    if (self.options.format) {
                        self.$element.val(self.get(self.options.format));
                    } else {
                        self.$element.val(self.color.toString());
                    }
                }
                if (self.options.localStorage) {
                    var key = 'input_' + this.id;
                    self.setLocalItem(key, self.$element.val());
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
            var hidden = !this.$element.is(':visible'),
                offset = hidden ? this.$trigger.offset() : this.$element.offset(),
                height = hidden ? this.$trigger.outerHeight() : this.$element.outerHeight(),
                width = hidden ? this.$trigger.outerWidth() : this.$element.outerWidth() + this.$trigger.outerWidth(),
                picker_width = this.$picker.outerWidth(true),
                picker_height = this.$picker.outerHeight(true),
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
        // thanks to http://stackoverflow.com/questions/826782/css-rule-to-disable-text-selection-highlighting
        makeUnselectable: function() {
            $('body').addClass('unselectable');
            if (IE) {
                this.$picker.find("*:not(input)").attr("unselectable", "on");
            }
        },
        cancelUnselectable: function() {
            $('body').removeClass('unselectable');
            if (IE) {
                this.$picker.find("*:not(input)").removeAttr("unselectable");
            }
        },
        setLocalItem: function(key, value) {
            var prefixedKey = this.namespace + '_' + key,
                jsonValue = JSON.stringify(value);
            localStorage[prefixedKey] = jsonValue;
        },
        getLocalItem: function(key) {
            var prefixedKey = this.namespace + '_' + key,
                value = localStorage[prefixedKey];
            return value ? JSON.parse(value) : value;
        },

        /*
            Public Method
         */

        show: function() {
            if (this.disabled) {
                return;
            }

            var self = this;

            this.$picker.on('mousedown', function(e) {
                e.stopPropagation();
            });

            $(document).on('click.asColorInput', function() {
                if (self.opened) {
                    if (self.options.hideFireChange) {
                        self.apply();
                    } else {
                        self.close();
                    }
                }
            });

            if (this.options.flat === false) {
                this.position();
                this.bindEvent();
            }

            this.$picker.addClass(this.classes.show);

            this.opened = true;
            this.isFirstOpen = false;
            this._trigger('show');
        },
        close: function() {
            if (this.options.flat === true) {
                return;
            }
            $(document).off('click.asColorInput');
            this.unbindEvent();

            this.opened = false;
            this.$element.blur();

            this.$picker.removeClass(this.classes.show);
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
        },
        apply: function() {
            this.originalColor = this.color.toRGBA();
            this.close();
            this._trigger('apply');
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
            // need to fix
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
        flat: false,
        showInput: false,
        localStorage: true,
        hideFireChange: true,
        keyboard: false,
        onlyBtn: false,
        format: 'rgb',
        components: {
            check: {
                disabled: 'apply',
                applyText: 'apply',
                cancelText: 'cancel'
            }
        }, // callback onInit:
        onInit: null,
        onReady: null,
        onChange: null,
        onClose: null,
        onShow: null,
        onApply: null
    };

    AsColorInput.skins = {
        'flatSpirit': 'saturation,hHue,hAlpha,hex,preview,palettes,check,gradient',
        'realWorld': 'saturation,hue,alpha,hex,preview,check',
        'fullStack': 'saturation,hue,alpha,hex,preview,palettes,gradient',
        'basicStyle': 'saturation,hue,hex,preview,palettes,check,gradient'
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
                    api.show();
                } else {
                    api.close();
                }
                api.opened = !api.opened;
                return false;
            });
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
}(window, document, jQuery, (function() {
    if ($.asColor === undefined) {
        // console.info('lost dependency lib of $.asColor , please load it first !');
        return false;
    } else {
        return $.asColor;
    }
}())));