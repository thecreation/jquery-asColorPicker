// palettes

$.colorInput.registerComponent('palettes', {
    selector: '.colorInput-palettes',
    template: '<div class="colorInput-palettes"></div>',
    height: 150,
    palettes: {
        defines: [''],
        colors: ['#fff','#000','#000','#ccc'],
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
            self.$list.append('<li style="background-color:' + api.originalColor + '" data-color="' + api.originalColor + '">' + api.originalColor + '</li>');          
               
            if (api.options.localStorage) {
                api.setLocalItem(storeKey, palettes.colors);
            }
        });
        $(document).on('colorInput::ready', function() {
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
                        index = hasIndex +1;
                    }
                    if (index >= len) {
                        index = 0;
                    } 
                    select(index);
                },
                RETURN: function() {
                    if(index < 0) {
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

