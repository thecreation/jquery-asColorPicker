/*! color - v0.1.0 - 2013-07-23
* https://github.com/amazingSurge/color
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
