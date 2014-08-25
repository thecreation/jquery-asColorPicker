// buttons

(function($) {
    "use strict";

    $.asColorInput.registerComponent('buttons', {
        defaults: {
            apply: false,
            cancel: true,
            applyText: 'apply',
            cancelText: 'cancel'
        },
        init: function(api, options) {
            var self = this;

            this.options = $.extend(this.defaults, options);
            this.$buttons = $('<div class="' + api.namespace + '-buttons"></div>').appendTo(api.$dropdown);

            api.$element.on('asColorInput::firstOpen', function() {
                if (self.options.apply) {
                    self.$apply = $('<a href="#" alt="' + self.options.applyText + '" class="' + api.namespace + '-buttons-apply"></a>').text(self.options.applyText).appendTo(self.$buttons).on('click', $.proxy(api.apply, api));
                }

                if (self.options.cancel) {
                    self.$cancel = $('<a href="#" alt="' + self.options.cancelText + '" class="' + api.namespace + '-buttons-cancel"></a>').text(self.options.cancelText).appendTo(self.$buttons).on('click', $.proxy(api.cancel, api));
                }
            });
        }
    });
})(jQuery);
