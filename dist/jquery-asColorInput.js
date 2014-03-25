/*! asColorInput - v0.1.3 - 2014-04-15
* https://github.com/amazingSurge/jquery-asColorInput
* Copyright (c) 2014 amazingSurge; Licensed GPL */
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
// hAlpha

(function($) {
    $.asColorInput.registerComponent('hAlpha', {
        width: 150,
        data: {},
        init: function(api) {
            var self = this;
            var template = '<div class="' + api.namespace + '-alpha drag-disable"><i class="drag-disable"></i></div>';
            this.$alpha = $(template).appendTo(api.$picker);
            this.$handle = this.$alpha.children('i');

            //bind action
            this.$alpha.on('mousedown.asColorInput', function(e) {
                var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
                if (rightclick) {
                    return false;
                }
                $.proxy(self.mousedown, self)(api, e);
            });

            api.$element.on('asColorInput::ready', function(event, instance) {
                self.width = self.$alpha.width();
                self.step = self.width / 100;
                self.update(api);
                self.keyboard(api);
            });
        },
        mousedown: function(api, e) {
            var offset = this.$alpha.offset();

            this.data.startX = e.pageX;
            this.data.left = e.pageX - offset.left;
            this.move(api, this.data.left);

            api.makeUnselectable();

            this.mousemove = function(e) {
                var position = this.data.left + (e.pageX || this.data.startX) - this.data.startX;
                this.move(api, position);
                return false;
            };

            this.mouseup = function(e) {
                $(document).off({
                    mousemove: this.mousemove,
                    mouseup: this.mouseup
                });
                this.data.left = this.data.cach;
                api.cancelUnselectable();
                return false;
            };

            $(document).on({
                mousemove: $.proxy(this.mousemove, this),
                mouseup: $.proxy(this.mouseup, this)
            });
            return false;
        },
        move: function(api, position, alpha, update) {
            position = Math.max(0, Math.min(this.width, position));
            this.data.cach = position;
            if (typeof alpha === 'undefined') {
                alpha = 1 - (position / this.width);
            }
            alpha = Math.max(0, Math.min(1, alpha));
            this.$handle.css({
                left: position
            });
            if (update !== false) {
                api.update({
                    a: Math.round(alpha * 100) / 100
                }, 'hAlpha');
            }
        },
        moveLeft: function(api) {
            var step = this.step,
                data = this.data;
            data.left = data.left - step;
            // see https://github.com/amazingSurge/jquery-asColorInput/issues/8
            data.left = Math.max(0, Math.min(this.width, data.left));
            this.move(api, data.left);
        },
        moveRight: function(api) {
            var step = this.step,
                data = this.data;
            data.left = data.left + step;
            // see https://github.com/amazingSurge/jquery-asColorInput/issues/8
            data.left = Math.max(0, Math.min(this.width, data.left));
            this.move(api, data.left);
        },
        keyboard: function(api) {
            var keyboard, self = this;
            if (api._keyboard) {
                keyboard = $.extend(true, {}, api._keyboard);
            } else {
                return false;
            }

            this.$alpha.attr('tabindex', '0').on('focus', function() {
                keyboard.attach({
                    left: function() {
                        self.moveLeft.call(self, api);
                    },
                    right: function() {
                        self.moveRight.call(self, api);
                    }
                });
                return false;
            }).on('blur', function(e) {
                keyboard.detach();
            });
        },
        update: function(api) {
            var position = this.width * (1 - api.color.value.a);
            this.$alpha.css('backgroundColor', api.color.toHEX());

            this.move(api, position, api.color.value.a, false);
        },
        destroy: function(api) {
            $(document).off({
                mousemove: this.mousemove,
                mouseup: this.mouseup
            });
        }
    });
})(jQuery);
// hHue

(function($) {
    $.asColorInput.registerComponent('hHue', {
        width: 150,
        data: {},
        init: function(api) {
            var self = this;
            var template = '<div class="' + api.namespace + '-hue drag-disable"><i class="drag-disable"></i></div>';
            this.$hue = $(template).appendTo(api.$picker);
            this.$handle = this.$hue.children('i');

            //bind action
            this.$hue.on('mousedown.asColorInput', function(e) {
                var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                if (rightclick) {
                    return false;
                }
                $.proxy(self.mousedown, self)(api, e);
            });

            api.$element.on('asColorInput::ready', function() {
                self.width = self.$hue.width();
                self.step = self.width / 360;
                self.update(api);
                self.keyboard(api);
            });
        },
        mousedown: function(api, e) {
            var offset = this.$hue.offset();

            this.data.startX = e.pageX;
            this.data.left = e.pageX - offset.left;
            this.move(api, this.data.left);

            api.makeUnselectable();

            this.mousemove = function(e) {
                var position = this.data.left + (e.pageX || this.data.startX) - this.data.startX;
                this.move(api, position);
                return false;
            };

            this.mouseup = function() {
                $(document).off({
                    mousemove: this.mousemove,
                    mouseup: this.mouseup
                });
                this.data.left = this.data.cach;
                api.cancelUnselectable();
                return false;
            };

            $(document).on({
                mousemove: $.proxy(this.mousemove, this),
                mouseup: $.proxy(this.mouseup, this)
            });
            return false;
        },
        move: function(api, position, hub, update) {
            position = Math.max(0, Math.min(this.width, position));
            this.data.cach = position;
            if (typeof hub === 'undefined') {
                hub = (1 - position / this.width) * 360;
            }

            hub = Math.max(0, Math.min(360, hub));
            this.$handle.css({
                left: position,
                background: $.asColor.HSVtoHEX({
                    h: hub,
                    s: 1,
                    v: 1
                })
            });
            if (update !== false) {
                api.update({
                    h: hub
                }, 'hHue');
            }
        },
        moveLeft: function(api) {
            var step = this.step,
                data = this.data;
            data.left = data.left - step;
            // see https://github.com/amazingSurge/jquery-asColorInput/issues/8
            data.left = Math.max(0, Math.min(this.width, data.left));
            this.move(api, data.left);
        },
        moveRight: function(api) {
            var step = this.step,
                data = this.data;
            data.left = data.left + step;
            // see https://github.com/amazingSurge/jquery-asColorInput/issues/8
            data.left = Math.max(0, Math.min(this.width, data.left));
            this.move(api, data.left);
        },
        keyboard: function(api) {
            var keyboard, self = this;
            if (api._keyboard) {
                keyboard = $.extend(true, {}, api._keyboard);
            } else {
                return false;
            }

            this.$hue.attr('tabindex', '0').on('focus', function() {
                keyboard.attach({
                    left: function() {
                        self.moveLeft.call(self, api);
                    },
                    right: function() {
                        self.moveRight.call(self, api);
                    }
                });
                return false;
            }).on('blur', function() {
                keyboard.detach();
            });
        },
        update: function(api) {
            var position = (api.color.value.h === 0) ? 0 : this.width * (1 - api.color.value.h / 360);
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
// alpha

(function($) {
    $.asColorInput.registerComponent('alpha', {
        height: 150,
        data: {},
        init: function(api) {
            var self = this;

            this.$alpha = $('<div class="' + api.namespace + '-alpha drag-disable"><i class="drag-disable"></i></div>').appendTo(api.$picker);
            this.$handle = this.$alpha.children('i');

            this.height = this.$alpha.height();

            //bind action
            this.$alpha.on('mousedown.asColorInput', function(e) {
                var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                if (rightclick) {
                    return false;
                }
                $.proxy(self.mousedown, self)(api, e);
            });

            api.$element.on('asColorInput::ready', function() {
                self.height = self.$alpha.height();
                self.step = self.height / 100;
                self.update(api);
                self.keyboard(api);
            });
        },
        mousedown: function(api, e) {
            var offset = this.$alpha.offset();

            this.data.startY = e.pageY;
            this.data.top = e.pageY - offset.top;
            this.move(api, this.data.top);

            api.makeUnselectable();

            this.mousemove = function(e) {
                var position = this.data.top + (e.pageY || this.data.startY) - this.data.startY;
                this.move(api, position);
                return false;
            };

            this.mouseup = function() {
                $(document).off({
                    mousemove: this.mousemove,
                    mouseup: this.mouseup
                });
                this.data.top = this.data.cach;
                api.cancelUnselectable();
                return false;
            };

            $(document).on({
                mousemove: $.proxy(this.mousemove, this),
                mouseup: $.proxy(this.mouseup, this)
            });
            return false;
        },
        move: function(api, position, alpha, update) {
            position = Math.max(0, Math.min(this.height, position));
            this.data.cach = position;
            if (typeof alpha === 'undefined') {
                alpha = 1 - (position / this.height);
            }
            alpha = Math.max(0, Math.min(1, alpha));
            this.$handle.css({
                top: position
            });
            if (update !== false) {
                api.update({
                    a: Math.round(alpha * 100) / 100
                }, 'alpha');
            }
        },
        moveUp: function(api) {
            var step = this.step,
                data = this.data;
            data.top = data.top - step;
            // see https://github.com/amazingSurge/jquery-asColorInput/issues/8
            data.top = Math.max(0, Math.min(this.width, data.top));
            this.move(api, data.top);
        },
        moveDown: function(api) {
            var step = this.step,
                data = this.data;
            data.top = data.top + step;
            // see https://github.com/amazingSurge/jquery-asColorInput/issues/8
            data.top = Math.max(0, Math.min(this.width, data.top));
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
                keyboard.attach({
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
        update: function(api) {
            var position = this.height * (1 - api.color.value.a);
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
// check

(function($) {
    $.asColorInput.registerComponent('check', {
        init: function(api) {
            var opts = $.extend(this.defaults, api.options.components.check);
            var template = '<div class="' + api.namespace + '-check drag-disable"><a class="' + api.namespace + '-check-apply drag-disable"></a><a class="' + api.namespace + '-check-cancel drag-disable"></a></div>';
            this.$check = $(template).appendTo(api.$picker);
            this.$apply = this.$check.find('.' + api.namespace + '-check-apply').text(opts.applyText);
            this.$cancel = this.$check.find('.' + api.namespace + '-check-cancel').text(opts.cancelText);

            if (opts.disabled === 'cancel') {
                this.$cancel.css({
                    display: 'none'
                });
            }
            if (opts.disabled === 'apply') {
                this.$apply.css({
                    display: 'none'
                });
            }

            this.$apply.on('click', $.proxy(api.apply, api));
            this.$cancel.on('click', $.proxy(api.cancel, api));
        }
    });
})(jQuery);
// hex

(function($) {
    $.asColorInput.registerComponent('hex', {
        init: function(api) {
            var template = '<input type="text" class="' + api.namespace + '-hex" />';
            this.$hex = $(template).appendTo(api.$picker);

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
        height: 150,
        data: {},
        init: function(api) {
            var self = this;
            var template = '<div class="' + api.namespace + '-hue drag-disable"><i clsss="drag-disable"></i></div>';
            this.$hue = $(template).appendTo(api.$picker);
            this.$handle = this.$hue.children('i');

            this.height = this.$hue.height();

            //bind action
            this.$hue.on('mousedown.asColorInput', function(e) {
                var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                if (rightclick) {
                    return false;
                }
                $.proxy(self.mousedown, self)(api, e);
            });

            api.$element.on('asColorInput::ready', function() {
                self.height = self.$hue.height();
                self.step = self.height / 360;
                self.update(api);
                self.keyboard(api);
            });
        },
        mousedown: function(api, e) {
            var offset = this.$hue.offset();

            this.data.startY = e.pageY;
            this.data.top = e.pageY - offset.top;
            this.move(api, this.data.top);

            api.makeUnselectable();

            this.mousemove = function(e) {
                var position = this.data.top + (e.pageY || this.data.startY) - this.data.startY;
                this.move(api, position);
                return false;
            };

            this.mouseup = function() {
                $(document).off({
                    mousemove: this.mousemove,
                    mouseup: this.mouseup
                });
                this.data.top = this.data.cach;
                api.cancelUnselectable();
                return false;
            };

            $(document).on({
                mousemove: $.proxy(this.mousemove, this),
                mouseup: $.proxy(this.mouseup, this)
            });

            return false;
        },
        move: function(api, position, hub, update) {
            position = Math.max(0, Math.min(this.height, position));
            this.data.cach = position;
            if (typeof hub === 'undefined') {
                hub = (1 - position / this.height) * 360;
            }
            hub = Math.max(0, Math.min(360, hub));
            this.$handle.css({
                top: position
            });
            if (update !== false) {
                api.update({
                    h: hub
                }, 'hue');
            }
        },
        moveUp: function(api) {
            var step = this.step,
                data = this.data;
            data.top = data.top - step;
            // see https://github.com/amazingSurge/jquery-asColorInput/issues/8
            data.top = Math.max(0, Math.min(this.width, data.top));
            this.move(api, data.top);
        },
        moveDown: function(api) {
            var step = this.step,
                data = this.data;
            data.top = data.top + step;
            // see https://github.com/amazingSurge/jquery-asColorInput/issues/8
            data.top = Math.max(0, Math.min(this.width, data.top));
            this.move(api, data.top);
        },
        update: function(api) {
            var position = (api.color.value.h === 0) ? 0 : this.height * (1 - api.color.value.h / 360);
            this.move(api, position, api.color.value.h, false);
        },
        keyboard: function(api) {
            var keyboard, self = this;
            if (api._keyboard) {
                keyboard = $.extend(true, {}, api._keyboard);
            } else {
                return false;
            }

            this.$hue.attr('tabindex', '0').on('focus', function() {
                keyboard.attach({
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
// info

(function($) {
    $.asColorInput.registerComponent('info', {
        color: ['white', 'black', 'transparent'],
        init: function(api) {
            var template = '<ul class="' + api.namespace + '-info">' + '<li><label>R:<input type="text" data-type="r"/></label></li>' + '<li><label>G:<input type="text" data-type="g"/></label></li>' + '<li><label>B:<input type="text" data-type="b"/></label></li>' + '<li><label>A:<input type="text" data-type="a"/></label></li>' + '</ul>';
            this.$info = $(template).appendTo(api.$picker);
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
    $.asColorInput.registerComponent('palettes', {
        height: 150,
        palettes: {
            defines: [''],
            colors: ['#fff', '#000', '#000', '#ccc'],
            max: 6
        },
        init: function(api) {
            var list = '<ul>',
                self = this,
                palettes = $.extend(true, {}, this.palettes, api.options.components.palettes);

            this.keyboardBinded = false;

            if (api.options.localStorage) {
                var storeKey = 'palettes_' + api.id;
                var storeValue = api.getLocalItem(storeKey);
                if (storeValue) {
                    palettes.colors = storeValue;
                }
            }

            $.each(palettes.colors, function(index, value) {
                list += '<li style="background-color:' + value + '" data-color="' + value + '">' + value + '</li>';
            });

            list += '</ul>';

            this.$list = $(list);
            this.$palettes = $('<div class="' + api.namespace + '-palettes"></div>').append(this.$list).appendTo(api.$picker);

            this.$palettes.delegate('li', 'click', function(e) {
                var color = $(e.target).data('color');
                self.$list.find('li').removeClass('' + api.namespace + '-palettes-checked');
                $(e.target).addClass('' + api.namespace + '-palettes-checked');
                api.set(color);
                // fix: does here need close ?
                // api.close();
            });

            this.$palettes.attr('tabindex', '0').on('blur', function() {
                self.$list.find('li').removeClass('' + api.namespace + '-palettes-checked');
            });

            api.$element.on('asColorInput::apply', function(event, api) {
                if (palettes.colors.indexOf(api.originalColor) !== -1) {
                    return;
                }
                if (palettes.colors.length >= palettes.max) {
                    palettes.colors.shift();
                    self.$list.find('li').eq(0).remove();
                }
                palettes.colors.push(api.originalColor);
                self.$list.append('<li style="background-color:' + api.originalColor + '" data-color="' + api.originalColor + '">' + api.originalColor + '</li>');

                if (api.options.localStorage) {
                    api.setLocalItem(storeKey, palettes.colors);
                }
            });
            api.$element.on('asColorInput::ready', function() {
                self.keyboard(api);
                return false;
            });
        },
        keyboard: function(api) {
            var keyboard, index, len, self = this;
            if (api._keyboard) {
                keyboard = $.extend(true, {}, api._keyboard);
            } else {
                return false;
            }

            this.$palettes.attr('tabindex', '0').on('blur', function() {
                keyboard.detach();
                self.keyboardBinded = false;
            });

            this.$palettes.attr('tabindex', '0').on('focus', function() {
                if (self.keyboardBinded === true) {
                    return;
                }
                var $lists = self.$list.find('li');
                index = -1;
                len = $lists.length;

                function select(index) {
                    $lists.removeClass(api.namespace + '-palettes-checked');
                    $lists.eq(index).addClass(api.namespace + '-palettes-checked');
                }

                function getIndex() {
                    return $lists.index(self.$palettes.find('.' + api.namespace + '-palettes-checked'));
                }

                keyboard.attach({
                    left: function() {
                        var hasIndex = getIndex();
                        if (hasIndex === -1) {
                            index = index - 1;
                        } else {
                            index = hasIndex - 1;
                        }
                        if (index < 0) {
                            index = len - 1;
                        }
                        select(index);
                    },
                    right: function() {
                        var hasIndex = getIndex();
                        if (hasIndex === -1) {
                            index = index + 1;
                        } else {
                            index = hasIndex + 1;
                        }
                        if (index >= len) {
                            index = 0;
                        }
                        select(index);
                    },
                    RETURN: function() {
                        if (index < 0) {
                            return;
                        }
                        var color = $lists.eq(index).data('color');
                        api.set(color);
                        api.close();
                    }
                });

                self.keyboardBinded = true;
            });
        }
    });
})(jQuery);
// preview

(function($) {
    $.asColorInput.registerComponent('preview', {
        height: 150,
        init: function(api) {
            var self = this;
            var template = '<div class="' + api.namespace + '-preview"><span class="' + api.namespace + '-preview-previous drag-disable"></span><span class="' + api.namespace + '-preview-current"></span></div>';
            this.$preview = $(template).appendTo(api.$picker);
            this.$current = this.$preview.find('.' + api.namespace + '-preview-current');
            this.$previous = this.$preview.find('.' + api.namespace + '-preview-previous');
            this.update(api);
            // init $previous color
            self.$previous.css('backgroundColor', api.color.toRGBA());

            api.$element.on('asColorInput::apply', function(event, api) {
                self.$previous.css('backgroundColor', api.color.toRGBA());
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
        options: {},
        width: 0,
        height: 0,
        size: 6,
        data: {},
        init: function(api) {
            var opts = $.extend(this.defaults, api.options.components.saturation),
                self = this;
            var template = '<div class="' + api.namespace + '-saturation drag-disable"><i class="drag-disable"><b class="drag-disable"></b></i></div>';
            this.options = opts;

            //build element and add component to picker
            this.$saturation = $(template).appendTo(api.$picker);
            this.$handle = this.$saturation.children('i');

            this.step = {};

            //bind action
            this.$saturation.on('mousedown.asColorInput', function(e) {
                var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                if (rightclick) {
                    return false;
                }
                $.proxy(self.mousedown, self)(api, e);
            });

            api.$element.on('asColorInput::ready', function() {
                self.width = self.$saturation.width();
                self.height = self.$saturation.height();
                self.step.left = self.width / 20;
                self.step.top = self.height / 20;
                self.size = self.$handle.width() / 2;

                self.update(api);
                self.keyboard(api);
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
            api.makeUnselectable();

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
                api.cancelUnselectable();
                return false;
            };

            // when mousedown ,bind the mousemove event to document
            // when mouseup unbind the event
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
            data.left = data.left - step;
            // see https://github.com/amazingSurge/jquery-asColorInput/issues/8
            data.left = Math.max(0, Math.min(this.width, data.left));
            this.move(api, data.left, data.top);
        },
        moveRight: function(api) {
            var step = this.step.left,
                data = this.data;
            data.left = data.left + step;
            data.left = Math.max(0, Math.min(this.width, data.left));
            this.move(api, data.left, data.top);
        },
        moveUp: function(api) {
            var step = this.step.top,
                data = this.data;
            data.top = data.top - step;
            data.top = Math.max(0, Math.min(this.width, data.top));
            this.move(api, data.left, data.top);
        },
        moveDown: function(api) {
            var step = this.step.top,
                data = this.data;
            data.top = data.top + step;
            data.top = Math.max(0, Math.min(this.width, data.top));
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
        init: function(api) {
            var self = this;
            var template = '<div class="' + api.namespace + '-gradient-controll">' +
                '<a href="#" class="' + api.namespace + '-gradient-trigger">Gradient</a>' +
                '<a href="#" class="' + api.namespace + '-gradient-cancel">Cancel</a>' +
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
                show: api.namespace + '-gradient' + '_show',
                marker: api.namespace + '-gradient-marker',
                active: api.namespace + '-gradient-marker_active'
            };
            this.isOpened = false;
            this.initialized = false;
            this.$doc = $(document);

            this.$template = $(template).appendTo(api.$picker);
            this.$controll = this.$template.eq(0);
            this.$trigger = this.$controll.find('.' + api.namespace + '-gradient-trigger');
            this.$cancel = this.$controll.find('.' + api.namespace + '-gradient-cancel');
            this.$gradient = this.$template.eq(1);
            this.$panel = this.$gradient.find('.' + api.namespace + '-gradient-panel');
            this.$markers = this.$gradient.find('.' + api.namespace + '-gradient-markers');
            this.$wheel = this.$gradient.find('.' + api.namespace + '-gradient-wheel');
            this.$pointer = this.$wheel.find('i');
            this.$degree = this.$gradient.find('.' + api.namespace + '-gradient-degree');

            this.$trigger.on('click', function() {
                if (self.isOpened) {
                    self.$gradient.removeClass(self.classes.show);
                    self.setGradient();
                    api.isGradient = false;
                    api.set(api.originalColor);
                } else {
                    self.$gradient.addClass(self.classes.show);
                    api.isGradient = true;
                    self.makeGradient();
                }
                self.isOpened = !self.isOpened;
                return false;
            });
            this.$cancel.on('click', function() {
                api.color.from(api.originalColor);
                api.update({});
                self.retrieve();
                return false;
            });

            // create new marker
            this.$markers.on('mousedown.asColorInput', function(e) {
                var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                if (rightclick) {
                    return false;
                }
                var position = e.pageX - self.$markers.offset().left;
                var percent = Math.round((position / self.width) * 100);
                self.makeMarker('#fff', percent);
                self.makeGradient();
                return false;
            });
            this.$wheel.on('mousedown.asColorInput', function(e) {
                var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                if (rightclick) {
                    return false;
                }
                self.wheelMousedown(e);
                return false;
            });

            api.$element.on('asColorInput::ready', function() {
                self.width = self.$markers.width();
            });
            api.$element.on('asColorInput::change', function(event, instance) {
                if (self.current && api.isGradient) {
                    self.current.setColor(instance.color.toRGBA());
                    self.makeGradient();
                }
            });
            api.$element.on('asColorInput::close', function() {
                if (api.isGradient) {
                    self.setGradient();
                }
                return false;
            });
            this.$degree.on('blur.asColorInput', function() {
                var deg = parseInt(this.value, 10);
                self.setDegree(deg);
                return false;
            }).on('keydown.asColorInput', function(e) {
                var key = e.keyCode || e.which;
                if (key === 13) {
                    $(this).blur();
                    return false;
                }
            });

            this.makeMarker('#fff', 0);
            this.makeMarker('#000', 100);
            setTimeout(function() {
                self.setDegree(0);
                self.initialized = true;
            }, 0);
        },
        mousedown: function(e, dom) {
            // get current marker
            var id = $(dom).data('id');
            var instance;
            $.each(this.markers, function(key, marker) {
                if (marker._id === id) {
                    instance = marker;
                }
            });
            this.current = instance;

            // get marker current position
            var begining = $(dom).position().left,
                start = e.pageX,
                api = this.api,
                end;

            api.makeUnselectable();
            api.set(instance.color);

            this.mousemove = function(e) {
                end = e.pageX || start;
                var position = begining + end - start;
                this.move(instance, position);
                return false;
            };

            this.mouseup = function() {
                $(document).off({
                    mousemove: this.mousemove,
                    mouseup: this.mouseup
                });
                api.cancelUnselectable();
                return false;
            };

            $(document).on({
                mousemove: $.proxy(this.mousemove, this),
                mouseup: $.proxy(this.mouseup, this)
            });
            $(dom).focus();
            return false;
        },
        move: function(marker, position) {
            position = Math.max(0, Math.min(this.width, position));
            var percent = Math.round((position / this.width) * 100);

            marker.setPercent(percent);
            this.makeGradient();
        },
        makeMarker: function(color, percent) {
            var self = this;
            var $doc = this.$doc;
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
                    self.mousedown.call(self, e, this);
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
            this.markers.push(marker);
            this.current = marker;
            marker.hasBinded = false;
            marker.$element.on('focus', function() {
                if (!marker.hasBinded) {
                    $doc.on('keydown.' + marker._id, function(e) {
                        var key = e.keyCode || e.which;
                        if (key === 46) {
                            self.del(marker);
                            self.makeGradient();
                        }
                    });
                    marker.$element.addClass(self.classes.active);
                    marker.hasBinded = true;
                }
            }).on('blur', function() {
                $doc.off('keydown.' + marker._id);
                marker.$element.removeClass(self.classes.active);
                marker.hasBinded = false;
            });

            return marker;
        },
        makeGradient: function() {
            var markers = this.markers,
                api = this.api,
                self = this,
                gradient = 'gradient(' + this.degree + 'deg,',
                f1 = '',
                f2 = '';
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
            api.gradient = gradient;
            api._trigger('gradientChange', gradient);

            // show value on input element
            api.$element.val(gradient);

            var gradientArray = ['-moz-linear-gradient(left, ' + f2 + ')', '-webkit-gradient(linear, left top, right top, ' + f1 + ')', '-webkit-linear-gradient(left, ' + f2 + ')', '-o-linear-gradient(left, ' + f2 + ')'];
            $.each(gradientArray, function(key, value) {
                self.$panel[0].style.backgroundImage = value;
            });
            return gradient;
        },
        setGradient: function() {
            var self = this;
            // copy array with object element
            this.origin = {};
            this.origin.markers = [];
            this.markers.map(function(marker) {
                var copy = {
                    color: marker.color,
                    percent: marker.percent
                };
                self.origin.markers.push(copy);
            });
            this.origin.degree = this.degree;
        },
        retrieve: function() {
            var self = this;
            self.markers.map(function(marker) {
                marker.$element.blur();
                marker.$element.remove();
            });
            self.markers = [];
            if (!self.origin) {
                self.makeMarker('#fff', 0);
                self.makeMarker('#000', 100);
                self.setDegree(0);
            } else {
                self.origin.markers.map(function(marker) {
                    self.makeMarker(marker.color, marker.percent);
                });
                self.setDegree(self.origin.degree);
            }
        },
        // wheel method
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
        _setDegree: function(deg) {
            this.degree = deg;
            this.$degree.val(deg);
            if (this.initialized) {
                // avoid setting value on input element when init
                this.makeGradient();
            }
        },
        setDegree: function(deg) {
            if (this.degree === deg) {
                return false;
            }
            var r = this.r || this.$wheel.width() / 2;
            var pos = this.calPointer(deg, r);
            this.$pointer.css({
                left: pos.x,
                top: pos.y
            });
            this._setDegree(deg);
        },
        calPointer: function(deg, r) {
            var x = Math.cos(deg * Math.PI / 180) * r;
            var y = Math.sin(deg * Math.PI / 180) * r;
            return {
                x: r + x,
                y: r - y
            };
        },
        wheelMousedown: function(e) {
            var offset = this.$wheel.offset();
            var r = this.$wheel.width() / 2;
            var startX = offset.left + r;
            var startY = offset.top + r;
            var $doc = this.$doc;

            this.r = r;

            this.wheelMove = function(e) {
                var x = e.pageX - startX;
                var y = startY - e.pageY;
                var position = this.getPosition(x, y);
                var deg = this.calDegree(position.x, position.y);
                this._setDegree(deg);
                var pos = this.calPointer(deg, r);
                this.$pointer.css({
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
        del: function(marker) {
            marker.$element.blur();
            marker.$element.remove();
            this.markers.splice(this.markers.indexOf(marker), 1);
        },
        destory: function() {
            this.$element.off('click');
            this.$element.remove();
        }
    });
})(jQuery);