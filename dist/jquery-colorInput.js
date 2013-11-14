/*! colorInput - v0.1.3 - 2014-02-19
 * https://github.com/amazingSurge/jquery-colorInput
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
    var ColorInput = $.colorInput = function(element, options) {
        this.element = element;
        this.$element = $(element);

        //flag
        this.opened = false;
        this.disabled = false;
        this.isFirstOpen = true;

        // options
        var meta_data = [];
        $.each(this.$element.data(), function(k, v) {
            var re = new RegExp("^color", "i");
            if (re.test(k)) {
                meta_data[k.toLowerCase().replace(re, '')] = v;
            }
        });

        createId(this);

        this.options = $.extend(true, {}, ColorInput.defaults, options, meta_data);
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

        var _comps = ColorInput.skins[this.options.skin] || 'saturation,hue';
        this._comps = _comps.split(',');

        // this._comps.splice(this._comps.indexOf('trigger'),1);

        // color value and format
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

    ColorInput.prototype = {
        constructor: ColorInput,
        components: {},
        init: function() {
            var self = this;
            this.$picker = $('<div draggable=false class="' + this.namespace + ' drag-disable"></div>');
            this.$element.addClass(this.classes.input);

            if (this.options.skin) {
                this.$picker.addClass(this.classes.skin);
            }

            this.create();
            if (this.options.flat) {
                this.$element.addClass(this.classes.flat);
                this.$picker.addClass(this.classes.flat).insertAfter(this.$element);
                this.show();
            } else {
                this.$picker.appendTo('body');
                this.$element.on({
                    'focus.colorInput': function() {
                        self.show();
                    },
                    'keydown.colorInput': function(e) {
                        if (e.keyCode === 9) {
                            self.hide();
                        } else if (e.keyCode === 13) {
                            self.color.from(self.$element.val());
                            self.update({}, 'input');
                            self.hide();
                        }
                    },
                    'keyup.colorInput': function() {
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
            this.$picker.trigger('colorInput::create');
        },
        _generateMask: function() {
            var self = this;
            if (this.options.flat) {
                return;
            }
            this.$mask = $('<div></div>').addClass(this.classes.mask).appendTo('body');
            this.$mask.on('click.colorInput', function() {
                if (self.options.hideFireChange === false) {
                    self.cancel();
                } else {
                    self.apply();
                }
                return false;
            });
        },
        _clearMask: function() {
            if (this.options.flat) {
                return;
            }
            this.$mask.off('click.colorInput');
            this.$mask.remove();
            this.$mask = null;
        },
        bindEvent: function() {
            $(window).on('resize.colorInput', $.proxy(this.position, this));
        },
        unbindEvent: function() {
            $(window).off('resize.colorInput');
        },
        _trigger: function(eventType) {
            // event
            this.$element.trigger('colorInput::' + eventType, this);

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
                if (self.options.format) {
                    self.$element.val(self.get(self.options.format));
                } else {
                    self.$element.val(self.color.toString());
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

            this.$picker.on('mousedown', function(e) {
                e.stopPropagation();
            });

            this._generateMask();

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
            this.unbindEvent();
            this._clearMask();
            this.$element.blur();

            this.$picker.removeClass(this.classes.show);
            this._trigger('close');
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

    ColorInput.registerComponent = function(component, methods) {
        ColorInput.prototype.components[component] = methods;
    };

    ColorInput.localization = [];

    ColorInput.defaults = {
        namespace: 'colorInput',
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
                applyText: 'apply',
                cancelText: 'cancel'
            }
        },
        // callback
        onInit: function(instance) {},
        onReady: function(instance) {},
        onChange: function(instance) {},
        onClose: function(instance) {},
        onShow: function(instance) {},
        onApply: function(instance) {}
    };

    ColorInput.skins = {
        'flatSpirit': 'saturation,hHue,hAlpha,hex,preview,palettes,check,gradient',
        'realWorld': 'saturation,hue,alpha,hex,preview,check',
        'fullStack': 'saturation,hue,alpha,hex,preview,gradient'
    };

    ColorInput.registerComponent('trigger', {
        template: '<div class="colorInput-trigger"><span></span></div>',
        init: function(api) {

            api.$trigger = $(this.template);
            this.$trigger_inner = api.$trigger.children('span');

            if (api.options.skin !== null) {
                api.$trigger.addClass(api.classes.skin);
            }

            api.$trigger.insertAfter(api.$element);
            api.$trigger.on('click', $.proxy(api.show, api));
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
// keyboard
;
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
    $doc.on('colorInput::init', function(event, instance) {
        if (instance.options.keyboard === true) {
            instance._keyboard = keyboard;
        }
    });
})(window, document, jQuery);
// hAlpha

$.colorInput.registerComponent('hAlpha', {
    selector: '.colorInput-alpha',
    template: '<div class="colorInput-alpha drag-disable"><i class="drag-disable"></i></div>',
    width: 150,
    data: {},
    init: function(api) {
        var self = this;

        this.$alpha = $(this.template).appendTo(api.$picker);
        this.$handle = this.$alpha.children('i');

        //bind action
        this.$alpha.on('mousedown.colorinput', function(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            if (rightclick) {
                return false;
            }
            $.proxy(self.mousedown, self)(api, e);
        });

        api.$element.on('colorInput::ready', function(event, instance) {
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
        // see https://github.com/amazingSurge/jquery-colorInput/issues/8
        data.left = Math.max(0, Math.min(this.width, data.left));
        this.move(api, data.left);
    },
    moveRight: function(api) {
        var step = this.step,
            data = this.data;
        data.left = data.left + step;
        // see https://github.com/amazingSurge/jquery-colorInput/issues/8
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
// hHue

$.colorInput.registerComponent('hHue', {
    selector: '.colorInput-picker-hue',
    template: '<div class="colorInput-hue drag-disable"><i class="drag-disable"></i></div>',
    width: 150,
    data: {},
    init: function(api) {
        var self = this;
        this.$hue = $(this.template).appendTo(api.$picker);
        this.$handle = this.$hue.children('i');

        //bind action
        this.$hue.on('mousedown.colorInput', function(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            if (rightclick) {
                return false;
            }
            $.proxy(self.mousedown, self)(api, e);
        });

        api.$element.on('colorInput::ready', function(event, instance) {
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
    move: function(api, position, hub, update) {
        position = Math.max(0, Math.min(this.width, position));
        this.data.cach = position;
        if (typeof hub === 'undefined') {
            hub = (1 - position / this.width) * 360;
        }

        hub = Math.max(0, Math.min(360, hub));
        this.$handle.css({
            left: position,
            background: $.colorValue.HSVtoHEX({
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
        // see https://github.com/amazingSurge/jquery-colorInput/issues/8
        data.left = Math.max(0, Math.min(this.width, data.left));
        this.move(api, data.left);
    },
    moveRight: function(api) {
        var step = this.step,
            data = this.data;
        data.left = data.left + step;
        // see https://github.com/amazingSurge/jquery-colorInput/issues/8
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
        }).on('blur', function(e) {
            keyboard.detach();
        });
    },
    update: function(api) {
        var position = (api.color.value.h === 0) ? 0 : this.width * (1 - api.color.value.h / 360);
        this.move(api, position, api.color.value.h, false);
    },
    destroy: function(api) {
        $(document).off({
            mousemove: this.mousemove,
            mouseup: this.mouseup
        });
    }
});
// alpha

$.colorInput.registerComponent('alpha', {
    selector: '.colorInput-alpha',
    template: '<div class="colorInput-alpha drag-disable"><i class="drag-disable"></i></div>',
    height: 150,
    data: {},
    init: function(api) {
        var self = this;

        this.$alpha = $(this.template).appendTo(api.$picker);
        this.$handle = this.$alpha.children('i');

        this.height = this.$alpha.height();

        //bind action
        this.$alpha.on('mousedown.colorinput', function(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            if (rightclick) {
                return false;
            }
            $.proxy(self.mousedown, self)(api, e);
        });

        api.$element.on('colorInput::ready', function(event, instance) {
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

        this.mouseup = function(e) {
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
        // see https://github.com/amazingSurge/jquery-colorInput/issues/8
        data.top = Math.max(0, Math.min(this.width, data.top));
        this.move(api, data.top);
    },
    moveDown: function(api) {
        var step = this.step,
            data = this.data;
        data.top = data.top + step;
        // see https://github.com/amazingSurge/jquery-colorInput/issues/8
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
        }).on('blur', function(e) {
            keyboard.detach();
        });
    },
    update: function(api) {
        var position = this.height * (1 - api.color.value.a);
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
$.colorInput.registerComponent('check', {
    selector: '.colorInput-check',
    template: '<div class="colorInput-check drag-disable"><a class="colorInput-check-apply drag-disable"></a><a class="colorInput-check-cancel drag-disable"></a></div>',
    init: function(api) {
        var opts = $.extend(this.defaults, api.options.components.check),
            self = this;

        this.$check = $(this.template).appendTo(api.$picker);
        this.$apply = this.$check.find('.colorInput-check-apply').text(opts.applyText);
        this.$cancel = this.$check.find('.colorInput-check-cancel').text(opts.cancelText);

        this.$apply.on('click', $.proxy(api.apply, api));
        this.$cancel.on('click', $.proxy(api.cancel, api));
    }
});



// hex

$.colorInput.registerComponent('hex', {
    selector: '.colorInput-hex',
    template: '<input type="text" class="colorInput-hex" />',
    init: function(api) {
        this.$hex = $(this.template).appendTo(api.$picker);;

        this.$hex.on('change', function() {
            api.set(this.value);
        });

        this.update(api);
    },
    update: function(api) {
        this.$hex.val(api.color.toHEX());
    },
});



// hue

$.colorInput.registerComponent('hue', {
    selector: '.colorInput-picker-hue',
    template: '<div class="colorInput-hue drag-disable"><i clsss="drag-disable"></i></div>',
    height: 150,
    data: {},
    init: function(api) {
        var self = this;
        this.$hue = $(this.template).appendTo(api.$picker);
        this.$handle = this.$hue.children('i');

        this.height = this.$hue.height();

        //bind action
        this.$hue.on('mousedown.colorInput', function(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            if (rightclick) {
                return false;
            }
            $.proxy(self.mousedown, self)(api, e);
        });

        api.$element.on('colorInput::ready', function(event, instance) {
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

        this.mouseup = function(e) {
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
        // see https://github.com/amazingSurge/jquery-colorInput/issues/8
        data.top = Math.max(0, Math.min(this.width, data.top));
        this.move(api, data.top);
    },
    moveDown: function(api) {
        var step = this.step,
            data = this.data;
        data.top = data.top + step;
        // see https://github.com/amazingSurge/jquery-colorInput/issues/8
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
        }).on('blur', function(e) {
            keyboard.detach();
        });
    },
    destroy: function(api) {
        $(document).off({
            mousemove: this.mousemove,
            mouseup: this.mouseup
        });
    }
});
// info

$.colorInput.registerComponent('info', {
    selector: '.colorInput-info',
    template: '<ul class="colorInput-info">' + '<li><label>R:<input type="text" data-type="r"/></label></li>' + '<li><label>G:<input type="text" data-type="g"/></label></li>' + '<li><label>B:<input type="text" data-type="b"/></label></li>' + '<li><label>A:<input type="text" data-type="a"/></label></li>' + '</ul>',
    color: ['white', 'black', 'transparent'],
    init: function(api) {
        this.$info = $(this.template).appendTo(api.$picker);;
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


// palettes

$.colorInput.registerComponent('palettes', {
    selector: '.colorInput-palettes',
    template: '<div class="colorInput-palettes"></div>',
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
        this.$palettes = $(this.template).append(this.$list).appendTo(api.$picker);

        this.$palettes.delegate('li', 'click', function(e) {
            var color = $(e.target).data('color');
            self.$list.find('li').removeClass('colorInput-palettes-checked');
            $(e.target).addClass('colorInput-palettes-checked');
            api.set(color);
            api.close();
        });

        this.$palettes.attr('tabindex', '0').on('blur', function() {
            self.$list.find('li').removeClass('colorInput-palettes-checked');
        });

        api.$element.on('colorInput::apply', function(event, api) {
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
        api.$element.on('colorInput::ready', function() {
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

        this.$palettes.attr('tabindex', '0').on('blur', function(e) {
            keyboard.detach();
            self.keyboardBinded = false;
        });

        this.$palettes.attr('tabindex', '0').on('focus', function(e) {
            if (self.keyboardBinded === true) {
                return;
            }
            var $lists = self.$list.find('li');
            index = -1;
            len = $lists.length;

            function select(index) {
                $lists.removeClass('colorInput-palettes-checked');
                $lists.eq(index).addClass('colorInput-palettes-checked');
            }

            function getIndex() {
                return $lists.index(self.$palettes.find('.colorInput-palettes-checked'));
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
// preview

$.colorInput.registerComponent('preview', {
    selector: '.colorInput-preview',
    template: '<div class="colorInput-preview"><span class="colorInput-preview-previous drag-disable"></span><span class="colorInput-preview-current"></span></div>',
    height: 150,
    init: function(api) {
        var self = this;
        this.$preview = $(this.template).appendTo(api.$picker);
        this.$current = this.$preview.find('.colorInput-preview-current');
        this.$previous = this.$preview.find('.colorInput-preview-previous');
        this.update(api);
        // init $previous color
        self.$previous.css('backgroundColor', api.color.toRGBA());

        api.$picker.on('colorInput::apply', function(event, api) {
            self.$previous.css('backgroundColor', api.color.toRGBA());
        });
    },
    update: function(api) {
        this.$current.css('backgroundColor', api.color.toRGBA());
    },
});
// saturation

$.colorInput.registerComponent('saturation', {
    template: '<div class="colorInput-saturation drag-disable"><i class="drag-disable"><b class="drag-disable"></b></i></div>',
    defaults: {},
    options: {},
    width: 0,
    height: 0,
    size: 6,
    data: {},
    init: function(api) {
        var opts = $.extend(this.defaults, api.options.components.saturation),
            self = this;

        this.options = opts;

        //build element and add component to picker
        this.$saturation = $(this.template).appendTo(api.$picker);
        this.$handle = this.$saturation.children('i');

        this.step = {};

        //bind action
        this.$saturation.on('mousedown.colorInput', function(e) {
            var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
            if (rightclick) {
                return false;
            }
            $.proxy(self.mousedown, self)(api, e);
        });

        api.$element.on('colorInput::ready', function() {
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

        this.mouseup = function(e) {
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
        this.$saturation.css('backgroundColor', $.colorValue.HSLToHEX({
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
        // see https://github.com/amazingSurge/jquery-colorInput/issues/8
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
        }).on('blur', function(e) {
            keyboard.detach();
        });
    },
    destroy: function(api) {
        $(document).off({
            mousemove: this.mousemove,
            mouseup: this.mouseup
        });
    }
});