/*! Paginator - v0.1.0 - 2013-07-23
* https://github.com/amazingSurge/jquery-colorInput
* Copyright (c) 2013 joeylin; Licensed MIT */
(function(window, document, $, undefined) {
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

    var CssColorStrings = {
        RGB: {
            match: /rgb\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*\)/,
            parse: function(result) {
                return {
                    r: (result[1].substr(-1) === '%') ? parseInt(result[1].slice(0, -1) * 2.55, 10) : parseInt(result[1], 10),
                    g: (result[2].substr(-1) === '%') ? parseInt(result[2].slice(0, -1) * 2.55, 10) : parseInt(result[2], 10),
                    b: (result[3].substr(-1) === '%') ? parseInt(result[3].slice(0, -1) * 2.55, 10) : parseInt(result[3], 10)
                };
            },
            to: function(color) {
                return "rgb(" + color.r + "," + color.g + "," + color.b + ")";
            }
        },
        RGBA: {
            match: /rgba\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d?(?:\.\d+)?)\s*\)/,
            parse: function(result) {
                return {
                    r: (result[1].substr(-1) === '%') ? parseInt(result[1].slice(0, -1) * 2.55, 10) : parseInt(result[1], 10),
                    g: (result[2].substr(-1) === '%') ? parseInt(result[2].slice(0, -1) * 2.55, 10) : parseInt(result[2], 10),
                    b: (result[3].substr(-1) === '%') ? parseInt(result[3].slice(0, -1) * 2.55, 10) : parseInt(result[3], 10),
                    a: parseFloat(result[4])
                };
            },
            to: function(color) {
                return "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")";
            }
        },
        HSL: {
            match: /hsl\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*\)/,
            parse: function(result) {
                var hsl = {
                    h: ((result[1] % 360) + 360) % 360,
                    s: parseFloat(result[2] / 100),
                    l: parseFloat(result[3] / 100)
                };

                return Color.HSLToRGB(hsl);
            },
            to: function(color) {
                var hsl = Color.RGBToHSL(color);
                return 'hsl(' + parseInt(hsl.h, 10) + ',' + Math.round(hsl.s * 100) + '%,' + Math.round(hsl.l * 100) + '%)';
            }
        },
        HSLA: {
            match: /hsla\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d?(?:\.\d+)?)\s*\)/,
            parse: function(result) {
                var hsla = {
                    h: ((result[1] % 360) + 360) % 360,
                    s: parseFloat(result[2] / 100),
                    l: parseFloat(result[3] / 100),
                    a: parseFloat(result[4])
                };

                return Color.HSLToRGB(hsla);
            },
            to: function(color) {
                var hsl = Color.RGBToHSL(color);
                return 'hsla(' + parseInt(hsl.h, 10) + ',' + Math.round(hsl.s * 100) + '%,' + Math.round(hsl.l * 100) + '%,' + color.a + ')';
            }
        },
        HEX: {
            match: /#([a-f0-9]{6}|[a-f0-9]{3})/,
            parse: function(result) {
                var hex = result[1];
                if (hex.length === 3) {
                    hex = expandHex(hex);
                }

                return {
                    r: parseInt(hex.substr(0, 2), 16),
                    g: parseInt(hex.substr(2, 2), 16),
                    b: parseInt(hex.substr(4, 2), 16)
                };
            },
            to: function(color) {
                var hex = [color.r.toString(16), color.g.toString(16), color.b.toString(16)];
                $.each(hex, function(nr, val) {
                    if (val.length === 1) {
                        hex[nr] = '0' + val;
                    }
                });
                return '#' + hex.join('');
            }
        },
        TRANSPARENT: {
            match: /transparent/,
            parse: function(result) {
                return {
                    r: 0,
                    g: 0,
                    b: 0,
                    a: 0
                };
            },
            to: function(color) {
                return 'transparent';
            }
        }
    };

    var Color = $.colorValue = function(string, format) {
        this.value = {
            r: 0,
            g: 0,
            b: 0,
            h: 0,
            s: 0,
            v: 0,
            a: 1
        };
        this._format = 'HEX';

        this.init(string, format);
    };

    Color.prototype = {
        constructor: Color,

        init: function(string, format, onChange) {
            this.onChange = (typeof onChange === 'function') ? onChange : function() {};

            if (typeof format !== 'undefined') {
                this.format(format);
            } else {
                for (var i in CssColorStrings) {
                    var matched = null;
                    if ((matched = CssColorStrings[i].match.exec(string)) != null) {
                        this.format(i);
                        break;
                    }
                }
            }

            this.from(string);
        },

        from: function(string, format) {
            if (typeof string === 'string') {
                var matched = null;
                for (var i in CssColorStrings) {
                    if ((matched = CssColorStrings[i].match.exec(string)) != null) {
                        this.set(CssColorStrings[i].parse(matched));
                        break;
                    }
                }
            } else if (typeof string === 'object') {
                this.set(string);
            }
        },

        format: function(format) {
            if (typeof format === 'string' && (format = format.toUpperCase()) && typeof CssColorStrings[format] !== 'undefined') {
                if (format !== 'TRANSPARENT') {
                    this._format = format;
                }
            } else {
                return this._format;
            }
        },

        toRGBA: function() {
            return CssColorStrings.RGBA.to(this.value);
        },

        toRGB: function() {
            return CssColorStrings.RGB.to(this.value);
        },

        toHSLA: function() {
            return CssColorStrings.HSLA.to(this.value);
        },

        toHSL: function() {
            return CssColorStrings.HSL.to(this.value);
        },

        toHEX: function() {
            return CssColorStrings.HEX.to(this.value);
        },

        toString: function() {
            if (this.value.a === 0) {
                return CssColorStrings.TRANSPARENT.to(this.value);
            }
            return CssColorStrings[this.format()].to(this.value);
        },

        get: function() {
            return this.value;
        },

        set: function(color) {
            var from_rgb = 0,
                from_hsv = 0;

            for (var i in color) {
                if ("hsv".indexOf(i) !== -1) {
                    from_hsv++;

                    this.value[i] = color[i];
                } else if ("rgb".indexOf(i) !== -1) {
                    from_rgb++;

                    this.value[i] = color[i];
                } else if (i === 'a') {
                    this.value.a = color.a;
                }
            }
            if (from_rgb > from_hsv) {
                var hsv = Color.RGBtoHSV(this.value);
                if (this.value.r === 0 && this.value.g === 0 && this.value.b === 0) {
                    this.value.h = color.h;
                } else {
                    this.value.h = hsv.h;
                }

                this.value.s = hsv.s;
                this.value.v = hsv.v;
            } else if (from_hsv > from_rgb) {
                var rgb = Color.HSVtoRGB(this.value);
                this.value.r = rgb.r;
                this.value.g = rgb.g;
                this.value.b = rgb.b;
            }
        }
    };

    Color.HSLToRGB = function(hsl) {
        var h = hsl.h / 360,
            s = hsl.s,
            l = hsl.l,
            m1, m2;
        if (l <= 0.5) {
            m2 = l * (s + 1);
        } else {
            m2 = l + s - (l * s);
        }
        m1 = l * 2 - m2;
        var rgb = {
            r: Color.hueToRGB(m1, m2, h + (1 / 3)),
            g: Color.hueToRGB(m1, m2, h),
            b: Color.hueToRGB(m1, m2, h - (1 / 3))
        };
        if (typeof hsl.a !== 'undefined') {
            rgb.a = hsl.a;
        }
        if (hsl.l === 0) {
            rgb.h = hsl.h;
        }
        return rgb;
    };

    Color.hueToRGB = function(m1, m2, h) {
        var v;
        if (h < 0) {
            h = h + 1;
        } else if (h > 1) {
            h = h - 1;
        }
        if ((h * 6) < 1) {
            v = m1 + (m2 - m1) * h * 6;
        } else if ((h * 2) < 1) {
            v = m2;
        } else if ((h * 3) < 2) {
            v = m1 + (m2 - m1) * ((2 / 3) - h) * 6;
        } else {
            v = m1;
        }
        return Math.round(v * 255);
    };

    Color.RGBToHSL = function(rgb) {
        var r = rgb.r / 255,
            g = rgb.g / 255,
            b = rgb.b / 255,
            min = Math.min(r, g, b),
            max = Math.max(r, g, b),
            diff = max - min,
            add = max + min,
            l = add * 0.5,
            h, s;

        if (min === max) {
            h = 0;
        } else if (r === max) {
            h = (60 * (g - b) / diff) + 360;
        } else if (g === max) {
            h = (60 * (b - r) / diff) + 120;
        } else {
            h = (60 * (r - g) / diff) + 240;
        }
        if (diff === 0) {
            s = 0;
        } else if (l <= 0.5) {
            s = diff / add;
        } else {
            s = diff / (2 - add);
        }

        return {
            h: Math.round(h) % 360,
            s: s,
            l: l
        };
    };

    Color.RGBToHEX = function(rgb) {
        return CssColorStrings.HEX.to(rgb);
    };

    Color.HSLToHEX = function(hsl) {
        var rgb = Color.HSLToRGB(hsl);
        return CssColorStrings.HEX.to(rgb);
    };

    Color.HSVtoHEX = function(hsv) {
        var rgb = Color.HSVtoRGB(hsv);
        return CssColorStrings.HEX.to(rgb);
    };

    Color.RGBtoHSV = function(rgb) {
        var r = rgb.r / 255,
            g = rgb.g / 255,
            b = rgb.b / 255,
            max = Math.max(r, g, b),
            min = Math.min(r, g, b),
            h, s, v = max,
            diff = max - min;
        s = (max === 0) ? 0 : diff / max;
        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r:
                    h = (g - b) / diff + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / diff + 2;
                    break;
                case b:
                    h = (r - g) / diff + 4;
                    break;
            }
            h /= 6;
        }

        return {
            h: h * 360,
            s: s,
            v: v
        };
    };

    Color.HSVtoRGB = function(hsv) {
        var r, g, b, h = (hsv.h % 360) / 60,
            s = hsv.s,
            v = hsv.v,
            c = v * s,
            x = c * (1 - Math.abs(h % 2 - 1));

        r = g = b = v - c;
        h = ~~h;

        r += [c, x, 0, 0, x, c][h];
        g += [x, c, c, x, 0, 0][h];
        b += [0, 0, x, c, c, x][h];

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    };
}(window, document, jQuery));

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
        //console.info('lost dependency lib of $.colorValue , please load it first !');
        return false;
    } else {
        return $.colorValue;
    }
}())));

$.colorInput.registerComponent('saturation', {
    template: '<div class="colorInput-saturation drag-disable"><i class="drag-disable"><b class="drag-disable"></b></i></div>',
    defaults: {},
    options: {},
    width: 0,
    height: 0,
    size: 6,
    data: {},
    init: function(api) {

        var opts = $.extend(this.defaults,api.options.components.saturation),
            self = this;

        this.options = opts;  


        //build element and add component to picker
        this.$saturation = $(this.template).appendTo(api.$picker);
        this.$handle = this.$saturation.children('i');

        this.width = this.$saturation.width();
        this.height = this.$saturation.height();
        this.size = this.$handle.width() / 2;

        //bind action
        this.$saturation.on('mousedown.colorInput',function(e) { 
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            if (rightclick) {
                return false;
            }            

            $.proxy(self.mousedown,self)(api,e);
        });

        this.update(api);
    },
    mousedown: function(api, e) {
        var offset = this.$saturation.offset();

        this.data.startY = e.pageY;
        this.data.startX = e.pageX;
        this.data.top = e.pageY - offset.top;
        this.data.left = e.pageX - offset.left;

        this.move(api, this.data.left, this.data.top);

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
    destroy: function(api) {
        $(document).off({
            mousemove: this.mousemove,
            mouseup: this.mouseup
        });
    }
});

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
        this.$hue.on('mousedown.colorInput',function(e) { 
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            if (rightclick) {
                return false;
            }              
            $.proxy(self.mousedown,self)(api,e);
        });

        this.update(api);
    },
    mousedown: function(api, e) {
        var offset = this.$hue.offset();

        this.data.startY = e.pageY;
        this.data.top = e.pageY - offset.top;

        this.move(api, this.data.top);

        this.mousemove = function(e) {
            e.stopPropagation();
            e.preventDefault();

            var position = this.data.top + (e.pageY || this.data.startY) - this.data.startY;

            this.move(api, position);
            return false;
        };

        this.mouseup = function(e) {
            e.stopPropagation();
            e.preventDefault();

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

        return false;
    },
    move: function(api, position, hub, update) {
        position = Math.max(0, Math.min(this.height, position));
        if (typeof hub === 'undefined') {
            hub = (1 - position / this.height) * 360;
        }
        hub = Math.max(0, Math.min(360, hub));
        this.$handle.css({
            top: position,
            background: $.colorValue.HSVtoHEX({
                h: hub,
                s: 1,
                v: 1
            })
        });
        if (update !== false) {
            api.update({
                h: hub
            }, 'hue');
        }
    },
    update: function(api) {
        var position = (api.color.value.h === 0) ? 0 : this.height * (1 - api.color.value.h / 360);
        this.move(api, position, api.color.value.h, false);
    },
    destroy: function(api) {
        $(document).off({
            mousemove: this.mousemove,
            mouseup: this.mouseup
        });
    }
});

$.colorInput.registerComponent('h-hue', {
    selector: '.colorInput-picker-hue',
    template: '<div class="colorInput-hue drag-disable"><i class="drag-disable"></i></div>',
    width: 150,
    data: {},
    init: function(api) {
        var self = this;
        this.$hue = $(this.template).appendTo(api.$picker);
        this.$handle = this.$hue.children('i');

        this.width = this.$hue.width();

        //bind action
        this.$hue.on('mousedown.colorInput',function(e) {   
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            if (rightclick) {
                return false;
            }            
            $.proxy(self.mousedown,self)(api,e);
        });

        this.update(api);
    },
    mousedown: function(api, e) {
        var offset = this.$hue.offset();

        this.data.startX = e.pageX;
        this.data.left = e.pageX - offset.left;

        this.move(api, this.data.left);

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
            }, 'h-hue');
        }
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
        this.$alpha.on('mousedown.colorinput',function(e) {   
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            if (rightclick) {
                return false;
            }            
            $.proxy(self.mousedown,self)(api,e);
        });

        this.update(api);
    },
    mousedown: function(api, e) {
        var offset = this.$alpha.offset();

        this.data.startY = e.pageY;
        this.data.top = e.pageY - offset.top;

        this.move(api, this.data.top);

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

$.colorInput.registerComponent('h-alpha', {
    selector: '.colorInput-alpha',
    template: '<div class="colorInput-alpha drag-disable"><i class="drag-disable"></i></div>',
    width: 150,
    data: {},
    init: function(api) {
        var self = this;

        this.$alpha = $(this.template).appendTo(api.$picker);
        this.$handle = this.$alpha.children('i');

        this.width = this.$alpha.width();

        //bind action
        this.$alpha.on('mousedown.colorinput',function(e) {  
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            if (rightclick) {
                return false;
            }             
            $.proxy(self.mousedown,self)(api,e);
        });

        this.update(api);
    },
    mousedown: function(api, e) {
        var offset = this.$alpha.offset();

        this.data.startX= e.pageX;
        this.data.left = e.pageX - offset.left;

        this.move(api, this.data.left);

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
            }, 'h-alpha');
        }
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

$.colorInput.registerComponent('palettes', {
    selector: '.colorInput-palettes',
    template: '<div class="colorInput-palettes"></div>',
    height: 150,
    colors: {
        white: '#fff',
        black: '#000',
        a: '#555',
        b: '#ccc'
    },
    init: function(api) {
        var list = '<ul>',
            self = this,
            colors = $.extend(true, {}, this.colors, api.options.components.palettes);

        $.each(this.colors, function(key, value) {
            list += '<li style="background-color:' + value + '" data-color="' + key + '">' + key + '</li>';
        });

        list += '</ul>';

        this.$palettes = $(this.template).append($(list)).appendTo(api.$picker);

        this.$palettes.delegate('li', 'click', function(e) {
            var type = $(e.target).data('color');
            self.$palettes.find('li').removeClass('colorInput-palettes-checked');
            $(e.target).addClass('checked');
            api.value(colors[type]);
            api.hide();
        });

    },
    update: function(api) {

    }
});

$.colorInput.registerComponent('info', {
    selector: '.colorInput-info',
    template: '<ul class="colorInput-info">' + '<li><label>R:<input type="text" data-type="r"/></label></li>' + '<li><label>G:<input type="text" data-type="g"/></label></li>' + '<li><label>B:<input type="text" data-type="b"/></label></li>' + '<li><label>A:<input type="text" data-type="a"/></label></li>' + '</ul>',
    height: 150,
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

$.colorInput.registerComponent('hex', {
    selector: '.colorInput-hex',
    template: '<input type="text" class="colorInput-hex" />',
    height: 150,
    init: function(api) {
        this.$hex = $(this.template).appendTo(api.$picker);;

        this.$hex.on('change', function() {
            api.value(this.value);
        });

        this.update(api);

    },
    update: function(api) {
        this.$hex.val(api.color.toHEX());
    },
});

$.colorInput.registerComponent('preview', {
    selector: '.colorInput-preview',
    template: '<div class="colorInput-preview"><span class="colorInput-preview-previous drag-disable"></span><span class="colorInput-preview-current"></span></div>',
    height: 150,
    init: function(api) {
        this.$preview = $(this.template).appendTo(api.$picker);
        this.$current = this.$preview.find('.colorInput-preview-current');
        this.update(api);

    },
    update: function(api) {
        this.$current.css('backgroundColor', api.color.toRGBA());
    },
});

$.colorInput.registerComponent('check', {
    selector: '.colorInput-check',
    template: '<div class="colorInput-check drag-disable"><a class="colorInput-check-apply drag-disable"></a><a class="colorInput-check-cancel drag-disable"></a></div>',
    init: function(api) {
        var opts = $.extend(this.defaults,api.options.components.check),
            self = this;

        this.$check = $(this.template).appendTo(api.$picker);
        this.$apply = this.$check.find('.colorInput-check-apply').text(opts.applyText);
        this.$cancel = this.$check.find('.colorInput-check-cancel').text(opts.cancelText);

        this.$apply.on('click',$.proxy(api.apply,api));
        this.$cancel.on('click',$.proxy(api.cancel,api));
    }
});
