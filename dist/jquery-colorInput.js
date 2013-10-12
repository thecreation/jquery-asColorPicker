/*! colorInput - v0.1.0 - 2013-10-11
* https://github.com/amazingSurge/jquery-colorInput
* Copyright (c) 2013 amazingSurge; Licensed GPL */
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
        this.$input = $(input).css({display: 'none'});

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

            if (trigger !== 'input') {
                self.$input.val(self.color.toString());
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
        get: function() {
            return this.color.toString();
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

        hideFireChange: false,

        onlyBtn: false,
        format: 'hex',
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


// Halpha

$.colorInput.registerComponent('Halpha', {
    selector: '.colorInput-alpha',
    template: '<div class="colorInput-alpha drag-disable"><i class="drag-disable"></i></div>',
    width: 150,
    data: {},
    init: function(api) {
        var self = this;

        this.$alpha = $(this.template).appendTo(api.$picker);
        this.$handle = this.$alpha.children('i');

        //bind action
        this.$alpha.on('mousedown.colorinput',function(e) {  
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            if (rightclick) {
                return false;
            }             
            $.proxy(self.mousedown,self)(api,e);
        });

        $(document).on('colorInput::init', function(event, instance) {
            self.width = self.$alpha.width();
            self.update(api);
        });
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

// Hhue

$.colorInput.registerComponent('Hhue', {
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
        this.$hue.on('mousedown.colorInput', function(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            if (rightclick) {
                return false;
            }
            $.proxy(self.mousedown, self)(api, e);
        });

        $(document).on('colorInput::init', function(event, instance) {
            self.width = self.$hue.width();
            self.update(api);
        });
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

        $(document).on('colorInput::init', function(event, instance) {
            self.height = self.$alpha.height();
            self.update(api);
        });
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

        $(document).on('colorInput::init', function(event, instance) {
            self.height = self.$hue.height();
            self.update(api);
        });
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
        colors: ['#fff','#000','#000','#ccc'],
        max: 6
    },
    init: function(api) {
        var list = '<ul>',
            self = this,
            palettes = $.extend(true, {}, this.palettes, api.options.components.palettes);

        $.each(palettes.colors, function(index,value) {
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

        api.$picker.on('colorInput::apply', function(event, api) {
            if (palettes.colors.length > palettes.max) {
                palettes.colors.shift();
                self.$list.find('li').eq(0).remove();
            } 
            if (palettes.colors.indexOf(api.originalColor) !== -1) {
                return;
            }
            palettes.colors.push(api.originalColor);
            self.$list.append('<li style="background-color:' + api.originalColor + '" data-color="' + api.originalColor + '">' + api.originalColor + '</li>')            
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

        api.$picker.on('colorInput::apply', function(event,api) {
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

        this.width = this.$saturation.width();
        this.height = this.$saturation.height();
        this.size = this.$handle.width() / 2;

        //bind action
        this.$saturation.on('mousedown.colorInput', function(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            if (rightclick) {
                return false;
            }

            $.proxy(self.mousedown, self)(api, e);
        });

        $(document).on('colorInput::init', function(event, instance) {
            self.width = self.$saturation.width();
            self.height = self.$saturation.height();
            self.size = self.$handle.width() / 2;
            self.update(api);
        });

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

