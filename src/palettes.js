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
        defaults: {
            colors: ['#fff', '#ffff00', '#f00', '#0f0', '#0ff', '#000'],
            max: 10,
            localStorage: true
        },
        init: function(api, options) {
            var self = this;

            this.options = $.extend(true, {}, this.defaults, options);

            // load colors from local storage
            if (this.options.localStorage) {
                var storeKey = api.namespace + '_palettes_' + api.id;
                var storeValue = this.getLocalItem(storeKey);
                if (storeValue) {
                    this.options.colors = storeValue;
                }
            }

            var list = '';
            $.each(this.options.colors, function(index, value) {
                list += self.getItem(value);
            });

            this.$palettes = $('<ul class="' + api.namespace + '-palettes"></ul>').html(list).appendTo(api.$dropdown);

            this.$palettes.delegate('li', 'click', function(e) {
                var color = $(this).data('color');

                api.set(color);

                e.preventDefault();
                e.stopPropagation();
            });

            api.$element.on('asColorInput::apply', function(event, api) {
                if (self.options.colors.indexOf(api.originalColor) !== -1) {
                    return;
                }
                if (self.options.colors.length >= self.options.max) {
                    self.options.colors.shift();
                    self.$palettes.find('li').eq(0).remove();
                }
                self.options.colors.push(api.originalColor);
                self.$palettes.append(self.getItem(api.originalColor));

                if (self.options.localStorage) {
                    self.setLocalItem(storeKey, self.options.colors);
                }
            });
        },
        getItem: function(color){
            return '<li data-color="' + color + '"><div style="background-color:' + color + '" /></li>';
        },
        setLocalItem: function(key, value) {
            var jsonValue = JSON.stringify(value);

            localStorage[key] = jsonValue;
        },
        getLocalItem: function(key) {
            var value = localStorage[key];

            return value ? JSON.parse(value) : value;
        }
    });
})(jQuery);
