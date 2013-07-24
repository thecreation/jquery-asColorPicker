// hex

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
