// clear

(function($) {
    "use strict";

    $.asColorInput.registerComponent('clear', {
        defaults: {

        },
        init: function(api, options) {
            var self = this;

            this.options = $.extend(this.defaults, options);
            this.$clear = $('<a href="#"' + api.namespace + '-clear"></a>').insertAfter(this.$element);

            this.$clear.on('click', function() {
                api.clear();
                return false;
            });
        }
    });
})(jQuery);
