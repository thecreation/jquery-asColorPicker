// preview

(function($) {
    $.colorInput.registerComponent('preview', {
        height: 150,
        init: function(api) {
            var self = this;
            var template = '<div class="' + api.namespace + '-preview"><span class="' + api.namespace + '-preview-previous drag-disable"></span><span class="' + api.namespace + '-preview-current"></span></div>';
            this.$preview = $(template).appendTo(api.$picker);
            this.$current = this.$preview.find('.' + api.namespace + '-preview-current');
            this.$previous = this.$preview.find('.' + api.namespace + '-preview-previous');
            this.update(api);
            // init $previous color
            self.$previous.css('backgroundColor', api.color.toRGBA());

            api.$picker.on('colorInput::apply', function(event, api) {
                self.$previous.css('backgroundColor', api.color.toRGBA());
            });
        },
        update: function(api) {
            this.$current.css('backgroundColor', api.color.toRGBA());
        },
    });
})(jQuery);