// palettes

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
