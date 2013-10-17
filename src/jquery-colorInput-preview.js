// preview

$.colorInput.registerComponent('preview', {
    selector: '.colorInput-preview',
    template: '<div class="colorInput-preview"><span class="colorInput-preview-previous drag-disable"></span><span class="colorInput-preview-current"></span></div>',
    height: 150,
    init: function(api) {
        var self = this;
        this.$preview = $(this.template).appendTo(api.$picker);
        this.$current = this.$preview.find('.colorInput-preview-current');
        this.$previous = this.$preview.find('.colorInput-preview-previous');
        this.update(api);
        // init $previous color
        self.$previous.css('backgroundColor', api.color.toRGBA());

        api.$picker.on('colorInput::apply', function(event,api) {
            self.$previous.css('backgroundColor', api.color.toRGBA());
        });
    },
    update: function(api) {
        this.$current.css('backgroundColor', api.color.toRGBA());
    },
});