// palettes

(function($) {
    "use strict";

    function noop() {
        return;
    }
    if (!window.localStorage) {
        window.localStorage = noop;
    }

    $.asColorInput.registerComponent('palettes', {
        colors: [],
        defaults: {
            colors: ['white', 'black', 'red', 'blue', 'yellow'],
            max: 10,
            localStorage: false
        },
        init: function(api, options) {
            var self = this, colors, asColor = new $.asColor();

            this.options = $.extend(true, {}, this.defaults, options);

            if (this.options.localStorage) {
                var localKey = api.namespace + '_palettes_' + api.id;
                colors = this.getLocal(localKey);
                if (!colors) {
                    colors = this.options.colors;
                    this.setLocal(localKey, colors);
                }
            } else {
                colors = this.options.colors;
            }

            for(var i in colors){
                this.colors.push(asColor.val(colors[i]).toRGBA());
            }

            var list = '';
            $.each(this.colors, function(i, color) {
                list += self.getItem(color);
            });

            this.$palettes = $('<ul class="' + api.namespace + '-palettes"></ul>').html(list).appendTo(api.$dropdown);

            this.$palettes.delegate('li', 'click', function(e) {
                var color = $(this).data('color');
                api.set(color);

                e.preventDefault();
                e.stopPropagation();
            });

            api.$element.on('asColorInput::apply', function(e, color) {
                if(typeof color.toRGBA !== 'function'){
                    color = color.get().color;
                }

                var rgba = color.toRGBA();
                if($.inArray(rgba, self.colors) === -1){
                    if (self.colors.length >= self.options.max) {
                        self.colors.shift();
                        self.$palettes.find('li').eq(0).remove();
                    }

                    self.colors.push(rgba);

                    self.$palettes.append(self.getItem(rgba));

                    if(self.options.localStorage) {
                        self.setLocal(localKey, self.colors);
                    }
                }
            });
        },
        getItem: function(color) {
            return '<li data-color="' + color + '"><span style="background-color:' + color + '" /></li>';
        },
        setLocal: function(key, value) {
            var jsonValue = JSON.stringify(value);

            localStorage[key] = jsonValue;
        },
        getLocal: function(key) {
            var value = localStorage[key];

            return value ? JSON.parse(value) : value;
        }
    });
})(jQuery);
