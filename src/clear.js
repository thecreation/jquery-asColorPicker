// clear

(function($) {
    "use strict";

    $.asColorInput.registerComponent('clear', function() {
        return {
            defaults: {
                template: function(namespace) {
                    return '<a href="#"' + namespace + '-clear"></a>';
                }
            },
            init: function(api, options) {
                this.options = $.extend(this.defaults, options);
                this.$clear = $(this.options.template.call(this, api.namespace)).insertAfter(this.$element);

                this.$clear.on('click', function() {
                    api.clear();
                    return false;
                });
            }
        };
    });
})(jQuery);
