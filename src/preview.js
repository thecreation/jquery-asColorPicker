// preview

(function($) {
    "use strict";

    $.asColorInput.registerComponent('preview', {
        init: function(api) {
            var self = this;
            var template = '<ul class="' + api.namespace + '-preview"><li class="' + api.namespace + '-preview-current"><div /></li><li class="' + api.namespace + '-preview-previous"><div /></li></ul>';
            this.$preview = $(template).appendTo(api.$dropdown);
            this.$current = this.$preview.find('.' + api.namespace + '-preview-current div');
            this.$previous = this.$preview.find('.' + api.namespace + '-preview-previous div');
            

            api.$element.on('asColorInput::firstOpen', function() {
                api.$element.on('asColorInput::apply', function(event, api) {
                    self.$previous.css('backgroundColor', api.color.toRGBA());
                });

                self.$previous.on('click', function() {
                    api.set(self.previewColor);
                    return false;
                });
            });

            api.$element.on('asColorInput::open', function() {
                self.previewColor = api.color.toRGBA();
                self.update(api.color);
                self.$previous.css('backgroundColor', api.color.toRGBA());
            });

            api.$element.on('asColorInput::update', function(e, color) {
                self.update(color);
            });
        },
        update: function(color) {
            this.$current.css('backgroundColor', color.toRGBA());
        }
    });
})(jQuery);
