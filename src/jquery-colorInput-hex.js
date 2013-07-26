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


