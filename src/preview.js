// preview

(function($) {
    "use strict";

    $.asColorInput.registerComponent('preview', function() {
        return {
            defaults: {
                template: function(namespace) {
                    return '<ul class="' + namespace + '-preview"><li class="' + namespace + '-preview-current"><span /></li><li class="' + namespace + '-preview-previous"><span /></li></ul>';
                }
            },
            init: function(api, options) {
                var self = this;
                this.options = $.extend(this.defaults, options);
                this.$preview = $(this.options.template.call(self, api.namespace)).appendTo(api.$dropdown);
                this.$current = this.$preview.find('.' + api.namespace + '-preview-current span');
                this.$previous = this.$preview.find('.' + api.namespace + '-preview-previous span');

                api.$element.on('asColorInput::firstOpen', function() {
                    self.$previous.on('click', function() {
                        api.set($(this).data('color'));
                        return false;
                    });
                });

                api.$element.on('asColorInput::setup', function(e, api, color) {
                    self.updateCurrent(color);
                    self.updatePreview(color);
                });
                api.$element.on('asColorInput::update', function(e, api, color) {
                    self.updateCurrent(color);
                });
            },
            updateCurrent: function(color) {
                this.$current.css('backgroundColor', color.toRGBA());
            },
            updatePreview: function(color) {
                this.$previous.css('backgroundColor', color.toRGBA());
                this.$previous.data('color', {
                    r: color.value.r,
                    g: color.value.g,
                    b: color.value.b,
                    a: color.value.a
                });
            }
        };
    });
})(jQuery);
