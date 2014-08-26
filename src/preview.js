// preview

(function($) {
    "use strict";

    $.asColorInput.registerComponent('preview', {
        init: function(api) {
            var self = this;
            var template = '<ul class="' + api.namespace + '-preview"><li class="' + api.namespace + '-preview-current"><span /></li><li class="' + api.namespace + '-preview-previous"><span /></li></ul>';
            this.$preview = $(template).appendTo(api.$dropdown);
            this.$current = this.$preview.find('.' + api.namespace + '-preview-current span');
            this.$previous = this.$preview.find('.' + api.namespace + '-preview-previous span');

            api.$element.on('asColorInput::firstOpen', function(e, color) {
                self.$previous.on('click', function() {
                    api.set($(this).data('color'));
                    return false;
                });
            });

            api.$element.on('asColorInput::setup', function(e, color) {
                self.updateCurrent(color);
                self.updatePreview(color);
            });
            api.$element.on('asColorInput::update', function(e, color) {
                self.updateCurrent(color);
            });
        },
        updateCurrent: function(color) {
            this.$current.css('backgroundColor', color.toRGBA());
        },
        updatePreview: function(color) {
            this.$previous.css('backgroundColor', color.toRGBA());
            this.$previous.data('color', color.toRGBA());
        }
    });
})(jQuery);
