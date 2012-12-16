/*! jQuery ColorInput - v0.1.0 - 2012-12-16
* https://github.com/KaptinLin/colorInput
* Copyright (c) 2012 KaptinLin; Licensed GPL */

(function (window, document, $, undefined) {
  "use strict";

  var namespace = 'colorInput';

  var expandHex = function (hex) {
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
      parse: function (result) {
        return {
          r: (result[1].substr(-1) === '%') ? parseInt(result[1].slice(0, -1) * 2.55, 10) : parseInt(result[1], 10),
          g: (result[2].substr(-1) === '%') ? parseInt(result[2].slice(0, -1) * 2.55, 10) : parseInt(result[2], 10),
          b: (result[3].substr(-1) === '%') ? parseInt(result[3].slice(0, -1) * 2.55, 10) : parseInt(result[3], 10)
        };
      },
      to: function (color) {
        return "rgb(" + color.r + "," + color.g + "," + color.b + ")";
      }
    },
    RGBA: {
      match: /rgba\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d?(?:\.\d+)?)\s*\)/,
      parse: function (result) {
        return {
          r: (result[1].substr(-1) === '%') ? parseInt(result[1].slice(0, -1) * 2.55, 10) : parseInt(result[1], 10),
          g: (result[2].substr(-1) === '%') ? parseInt(result[2].slice(0, -1) * 2.55, 10) : parseInt(result[2], 10),
          b: (result[3].substr(-1) === '%') ? parseInt(result[3].slice(0, -1) * 2.55, 10) : parseInt(result[3], 10),
          a: parseFloat(result[4])
        };
      },
      to: function (color) {
        return "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")";
      }
    },
    HSL: {
      match: /hsl\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*\)/,
      parse: function (result) {
        var hsl = {
          h: ((result[1] % 360) + 360) % 360,
          s: parseFloat(result[2] / 100),
          l: parseFloat(result[3] / 100)
        };

        return Color.HSLToRGB(hsl);
      },
      to: function (color) {
        var hsl = Color.RGBToHSL(color);
        return 'hsl(' + parseInt(hsl.h, 10) + ',' + Math.round(hsl.s * 100) + '%,' + Math.round(hsl.l * 100) + '%)';
      }
    },
    HSLA: {
      match: /hsla\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d?(?:\.\d+)?)\s*\)/,
      parse: function (result) {
        var hsla = {
          h: ((result[1] % 360) + 360) % 360,
          s: parseFloat(result[2] / 100),
          l: parseFloat(result[3] / 100),
          a: parseFloat(result[4])
        };

        return Color.HSLToRGB(hsla);
      },
      to: function (color) {
        var hsl = Color.RGBToHSL(color);
        return 'hsla(' + parseInt(hsl.h, 10) + ',' + Math.round(hsl.s * 100) + '%,' + Math.round(hsl.l * 100) + '%,' + color.a + ')';
      }
    },
    HEX: {
      match: /#([a-f0-9]{6}|[a-f0-9]{3})/,
      parse: function (result) {
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
      to: function (color) {
        var hex = [color.r.toString(16), color.g.toString(16), color.b.toString(16)];
        $.each(hex, function (nr, val) {
          if (val.length === 1) {
            hex[nr] = '0' + val;
          }
        });
        return '#' + hex.join('');
      }
    },
    TRANSPARENT: {
      match: /transparent/,
      parse: function (result) {
        return {
          r: 0,
          g: 0,
          b: 0,
          a: 0
        };
      },
      to: function (color) {
        return 'transparent';
      }
    }
  };

  var Color = $.colorValue = function (string, format) {
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

    init: function (string, format, onChange) {
      this.onChange = (typeof onChange === 'function') ? onChange : function () {};

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

    from: function (string, format) {
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

    format: function (format) {
      if (typeof format === 'string' && (format = format.toUpperCase()) && typeof CssColorStrings[format] !== 'undefined') {
        if (format !== 'TRANSPARENT') {
          this._format = format;
        }
      } else {
        return this._format;
      }
    },

    toRGBA: function () {
      return CssColorStrings.RGBA.to(this.value);
    },

    toRGB: function () {
      return CssColorStrings.RGB.to(this.value);
    },

    toHSLA: function () {
      return CssColorStrings.HSLA.to(this.value);
    },

    toHSL: function () {
      return CssColorStrings.HSL.to(this.value);
    },

    toHEX: function () {
      return CssColorStrings.HEX.to(this.value);
    },

    toString: function () {
      if (this.value.a === 0) {
        return CssColorStrings.TRANSPARENT.to(this.value);
      }
      return CssColorStrings[this.format()].to(this.value);
    },

    get: function () {
      return this.value;
    },

    set: function (color) {
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

  Color.HSLToRGB = function (hsl) {
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

  Color.hueToRGB = function (m1, m2, h) {
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

  Color.RGBToHSL = function (rgb) {
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

  Color.RGBToHEX = function (rgb) {
    return CssColorStrings.HEX.to(rgb);
  };

  Color.HSLToHEX = function (hsl) {
    var rgb = Color.HSLToRGB(hsl);
    return CssColorStrings.HEX.to(rgb);
  };

  Color.HSVtoHEX = function (hsv) {
    var rgb = Color.HSVtoRGB(hsv);
    return CssColorStrings.HEX.to(rgb);
  };

  Color.RGBtoHSV = function (rgb) {
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

  Color.HSVtoRGB = function (hsv) {
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

  // Constructor
  var ColorInput = $.colorInput = function (input, options) {
    this.input = input;
    this.$input = $(input);

    this.$picker = $('<div>');

    // options
    var meta_data = [];
    $.each(this.$input.data(), function (k, v) {
      var re = new RegExp("^color", "i");
      if (re.test(k)) {
        meta_data[k.toLowerCase().replace(re, '')] = v;
      }
    });
    this.options = $.extend(true, {}, ColorInput.defaults, options, meta_data);

    // compoents
    this.components = $.extend(true, {}, this.components);

    for (var i in this.components) {
      if (typeof this.options.components[i] !== 'undefined' && this.options.components[i] === false) {
        delete this.components[i];
      }
    }

    if (!this.options.format) {
      this.options.format = this.options.format||'hex';
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

    // create
    this.created = false;
    this.create();
  };

  ColorInput.prototype = {
    constructor: ColorInput,
    components: {},
    create: function () {
      this.created = true;

      // Create picker
      this.$picker = $(this.options.template.picker);

      // Init components
      for (var i in this.components) {
        this.components[i].init(this);
      }

      // Init input
      this.$input.addClass('colorinput');

      var self = this;
      this.$input.on({
        'focus.colorinput': function () {
          self.show();
        },
        'keydown.colorinput': function (e) {
          if (e.keyCode === 9) {
            self.hide();
          } else if (e.keyCode === 13) {
            self.color.from(self.$input.val());
            self.update({}, 'input');
            self.hide();
          }
        },
        'keyup.colorinput': function () {
          self.color.from(self.$input.val());
          self.update({}, 'input');
        }
      });

      // Handle options
      if (this.options.readonly || this.$input.prop('readonly')) {
        this.readonly(true);
      }
      if (this.options.disabled || this.$input.prop('disabled')) {
        this.disabled(true);
      }
    },
    destroy: function () {
      this.created = false;

      this.hide();

      for (var i in this.components) {
        this.components[i].destroy(this);
      }

      this.$picker.remove();

      this.$input.removeClass('colorinput').removeData().off('.colorinput');
    },
    update: function (color, trigger) {
      var self = this;
      if (color !== {}) {
        self.color.set(color);
      }

      $.each(self.components, function (name, component) {
        if (trigger !== name) {
          component.update.call(component, self);
        }
      });

      if (trigger !== 'input') {
        self.$input.val(self.color.toString());
      }
    },
    show: function () {
      if (this.$input.prop('disabled')) {
        return false;
      }

      var self = this;

      // if not attached to body
      if (this.$picker.parent().length === 0) {
        this.$picker.appendTo('body').on('mousedown.colorinput', function (e) {
          e.stopPropagation();
          

          var target = $(e.target);
          var $component = target.closest('.colorinput-picker > div');

          $.each(self.components, function (name, component) {
            if ($component.is(component.selector) && typeof component.mousedown === 'function') {
              e.preventDefault();
              return component.mousedown(self, e);
            }
          });
        });
      }

      this.place();

      this.$picker.show();

      $(document).on('mousedown.colorinput', function (e) {
        if ($(e.target).is(self.$input)) {
          return;
        }
        self.hide();

        return false;
      });
      $(window).on('resize.colorinput', $.proxy(this.place, this));
    },
    hide: function () {
      this.$picker.hide();
      this.$input.blur();

      $(document).off('mousedown.colorinput');
      $(window).off('resize.colorinput');
    },
    place: function () {
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
        top: top,
        left: left
      });
    },
    readonly: function (data) {
      if (this.created) {
        this.$input.prop('readonly', data);
      }

      return this;
    },
    disabled: function (data) {
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
    value: function (data) {
      if (data) {
        this.color.from(data);
        this.update();
      } else {
        return this.color.toString();
      }
    },
    opacity: function (data) {
      if (data) {
        this.update({
          a: data
        });
      } else {
        return this.color.value.a;
      }
    }
  };

  ColorInput.registerComponent = function (component, methods) {
    ColorInput.prototype.components[component] = methods;
  };

  ColorInput.registerComponent('trigger', {
    selector: '.colorinput-trigger',
    template: '<span class="colorinput-trigger"><span></span></span>',
    init: function (api) {
      api.$trigger = $(this.template);
      this.$trigger_inner = api.$trigger.children('span');

      api.$trigger.insertAfter(api.$input);

      api.$trigger.on({
        'click': $.proxy(api.show, api)
      });

      this.update(api);
    },
    update: function (api) {
      this.$trigger_inner.css('backgroundColor', api.color.toRGBA());
    },
    destroy: function (api) {
      api.$trigger.remove();
    }
  });

  ColorInput.registerComponent('saturation', {
    selector: '.colorinput-picker-saturation',
    template: '<div class="colorinput-picker-saturation"><i><b></b></i></div>',
    width: 150,
    height: 150,
    size: 6,
    data: {},
    init: function (api) {
      this.$saturation = $(this.template).appendTo(api.$picker);

      this.$handle = this.$saturation.children('i');

      this.update(api);
    },
    mousedown: function (api, e) {
      var offset = this.$saturation.offset();

      this.data.startY = e.pageY;
      this.data.startX = e.pageX;
      this.data.top = e.pageY - offset.top;
      this.data.left = e.pageX - offset.left;

      this.move(api, this.data.left, this.data.top);

      this.mousemove = function (e) {
        e.stopPropagation();
        e.preventDefault();

        var x = this.data.left + (e.pageX || this.data.startX) - this.data.startX;
        var y = this.data.top + (e.pageY || this.data.startY) - this.data.startY;

        this.move(api, x, y);
        return false;
      };

      this.mouseup = function (e) {
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
    move: function (api, x, y, update) {
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
    update: function (api) {
      this.$saturation.css('backgroundColor', Color.HSLToHEX({
        h: api.color.value.h,
        s: 1,
        l: 0.5
      }));

      var x = api.color.value.s * this.width;
      var y = (1 - api.color.value.v) * this.height;

      this.move(api, x, y, false);
    },
    destroy: function (api) {
      $(document).off({
        mousemove: this.mousemove,
        mouseup: this.mouseup
      });
    }
  });

  ColorInput.registerComponent('hue', {
    selector: '.colorinput-picker-hue',
    template: '<div class="colorinput-picker-hue"><i></i></div>',
    height: 150,
    data: {},
    init: function (api) {
      this.$hue = $(this.template).appendTo(api.$picker);
      this.$handle = this.$hue.children('i');

      this.update(api);
    },
    mousedown: function (api, e) {
      var offset = this.$hue.offset();

      this.data.startY = e.pageY;
      this.data.top = e.pageY - offset.top;

      this.move(api, this.data.top);

      this.mousemove = function (e) {
        e.stopPropagation();
        e.preventDefault();

        var position = this.data.top + (e.pageY || this.data.startY) - this.data.startY;

        this.move(api, position);
        return false;
      };

      this.mouseup = function (e) {
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
    move: function (api, position, hub, update) {
      position = Math.max(0, Math.min(this.height, position));
      if (typeof hub === 'undefined') {
        hub = (1 - position / this.height) * 360;
      }
      hub = Math.max(0, Math.min(360, hub));
      this.$handle.css({
        top: position,
        background: Color.HSVtoHEX({
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
    update: function (api) {
      var position = (api.color.value.h === 0) ? 0 : this.height * (1 - api.color.value.h / 360);
      this.move(api, position, api.color.value.h, false);
    },
    destroy: function (api) {
      $(document).off({
        mousemove: this.mousemove,
        mouseup: this.mouseup
      });
    }
  });

  ColorInput.registerComponent('alpha', {
    selector: '.colorinput-picker-alpha',
    template: '<div class="colorinput-picker-alpha"><i></i></div>',
    height: 150,
    data: {},
    init: function (api) {
      this.$alpha = $(this.template).appendTo(api.$picker);
      this.$handle = this.$alpha.children('i');

      this.update(api);
    },
    mousedown: function (api, e) {
      var offset = this.$alpha.offset();

      this.data.startY = e.pageY;
      this.data.top = e.pageY - offset.top;

      this.move(api, this.data.top);

      this.mousemove = function (e) {
        e.stopPropagation();
        e.preventDefault();

        var position = this.data.top + (e.pageY || this.data.startY) - this.data.startY;

        this.move(api, position);
        return false;
      };

      this.mouseup = function (e) {
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
    move: function (api, position, alpha, update) {
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
    update: function (api) {
      var position = this.height * (1 - api.color.value.a);
      this.$alpha.css('backgroundColor', api.color.toHEX());

      this.move(api, position, api.color.value.a, false);
    },
    destroy: function (api) {
      $(document).off({
        mousemove: this.mousemove,
        mouseup: this.mouseup
      });
    }
  });

  ColorInput.registerComponent('extra', {
    selector: '.colorinput-picker-extra',
    template: '<div class="colorinput-picker-extra">' +
                '<ul class="colorinput-picker-sets">' +
                  '<li data-color="white">white</li>' +
                  '<li data-color="black">black</li>' +
                  '<li data-color="transparent">transparent</li>' +
                '</ul>' +
                '<ul class="colorinput-picker-info">' +
                  '<li><label>R:<input type="text" data-type="r"/></label></li>' +
                  '<li><label>G:<input type="text" data-type="g"/></label></li>' +
                  '<li><label>B:<input type="text" data-type="b"/></label></li>' +
                  '<li><label>A:<input type="text" data-type="a"/></label></li>' +
                '</ul>' +
                '<input type="text" class="colorinput-picker-hex" />' +
                '<div class="colorinput-picker-preview"><div></div></div>' +
              '</div>',
    height: 150,
    data: {},
    init: function (api) {
      this.$extra = $(this.template);

      this.$extra.$r = this.$extra.find('[data-type="r"]');
      this.$extra.$g = this.$extra.find('[data-type="g"]');
      this.$extra.$b = this.$extra.find('[data-type="b"]');
      this.$extra.$a = this.$extra.find('[data-type="a"]');
      this.$extra.$hex = this.$extra.find('.colorinput-picker-hex');
      this.$extra.$preview = this.$extra.find('.colorinput-picker-preview div');

      this.$extra.find('.colorinput-picker-sets').delegate('li','click',function(e){
        var color = {};
        var type = $(e.target).data('color');
        switch(type){
          case 'white':
            color = {
              r: 255,
              g: 255,
              b: 255,
              a: 1
            };
            break;
          case 'black':
            color = {
              r: 0,
              g: 0,
              b: 0,
              a: 1
            };
            break;
          case 'transparent':
            color = {
              r: 255,
              g: 255,
              b: 255,
              a: 0
            };
        }

        api.value(color);
        api.hide();
      });

      this.$extra.find('.colorinput-picker-info').delegate('input','change',function(e){
        var val;
        var type = $(e.target).data('type');

        switch(type){
          case 'r':
          case 'g':
          case 'b':
            val = parseInt(this.value,10);
            if(val>255){
              val = 255;
            } else if(val<0){
              val = 0;
            }
            break;
          case 'a':
            val = parseFloat(this.value, 10);
            if(val>1){
              val = 1;
            } else if(val < 0){
              val = 0;
            }
            break;
        }
        var color = {};
        color[type] = val;
        api.value(color);
      });

      this.$extra.$hex.on('change',function(){
        api.value(this.value);
      });

      this.update(api);

      this.$extra.appendTo(api.$picker);
    },
    update: function(api) {
      this.$extra.$r.val(api.color.value.r);
      this.$extra.$g.val(api.color.value.g);
      this.$extra.$b.val(api.color.value.b);
      this.$extra.$a.val(api.color.value.a);
      this.$extra.$hex.val(api.color.toHEX());
      this.$extra.$preview.css('backgroundColor', api.color.toRGBA());
    }
  });

  // Default options for the plugin as a simple object
  ColorInput.defaults = {
    disabled: false,
    readonly: false,
    format: null,
    components: {
      saturation: true,
      hue: true,
      alpha: true,
      extra: true
    },
    template: {
      picker: '<div class="colorinput-picker"></div>'
    }
  };

  // Collection method.
  $.fn.colorInput = function (options) {
    if (typeof options === 'string') {
      var method = options;
      var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;

      return this.each(function () {
        var api = $.data(this, namespace);
        if (typeof api[method] === 'function') {
          api[method].apply(api, method_arguments);
        }
      });
    } else {
      return this.each(function () {
        if (!$.data(this, namespace)) {
          $.data(this, namespace, new ColorInput(this, options));
        }
      });
    }
  };
}(window, document, jQuery));