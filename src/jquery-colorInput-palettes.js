// palettes

$.colorInput.registerComponent('palettes', {
    selector: '.colorInput-palettes',
    template: '<div class="colorInput-palettes"></div>',
    height: 150,
    palettes: {
        colors: ['#fff','#000','#000','#ccc'],
        cookie: {expires: 7},
        max: 6
    },
    init: function(api) {
        var list = '<ul>',
            self = this,
            palettes = $.extend(true, {}, this.palettes, api.options.components.palettes);

        this.keyboardBinded = false;

        if (api.options.cookie !== true) {
            var cookie_key = 'colorInput_' + api.id + '_palettes';
            var cookie = $.cookie(cookie_key);
            if (cookie) {
                palettes.colors = cookie;
            }
        }

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

        this.$palettes.attr('tabindex', '0').on('blur', function() {
            self.$list.find('li').removeClass('colorInput-palettes-checked');
        });

        api.$picker.on('colorInput::apply', function(event, api) {
            if (palettes.colors.indexOf(api.originalColor) !== -1) {
                return;
            }
            if (palettes.colors.length >= palettes.max) {
                palettes.colors.shift();
                self.$list.find('li').eq(0).remove();
            } 
            palettes.colors.push(api.originalColor);
            self.$list.append('<li style="background-color:' + api.originalColor + '" data-color="' + api.originalColor + '">' + api.originalColor + '</li>')            
               
            if (api.options.cookie !== true) {
                $.cookie(cookie_key, palettes.colors, palettes.cookie);
            }
        });
        $(document).on('colorInput::ready', function(event, api) {
            self.keyboard(api);
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

        this.$list.find('li').on('click', function(e) {
            if (self.keyboardBinded === true) {
                return;
            } 
            var $lists = self.$list.find('li');
            index = $lists.index($(e.target));
            len = $lists.length;

            function select(index) {
                var color = $lists.eq(index).data('color');
                $lists.removeClass('colorInput-palettes-checked');
                $lists.eq(index).addClass('colorInput-palettes-checked');
                api.set(color);
            } 

            keyboard.attach({
                left: function() {
                    if (index < 0) {
                        index = len - 1;
                    } else {
                        index = index - 1;
                    }
                    select(index);
                },
                right: function() {
                    if (index >= len) {
                        index = 0;
                    } else {
                        index = index + 1;
                    }
                    select(index);
                }
            });
            this.keyboardBinded = true;

        });
    }
});

