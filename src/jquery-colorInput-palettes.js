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
            cookie_key = 'colorInput_' + api.id + '_palettes',
            cookie = $.cookie(cookie_key),
            palettes = $.extend(true, {}, this.palettes, api.options.components.palettes);

        if (cookie) {
            palettes.colors = cookie;
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
            
            $.cookie(cookie_key, palettes.colors, palettes.cookie);
        });
    }
});

