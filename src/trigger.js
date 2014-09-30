// trigger

(function($) {
    "use strict";

    $.asColorInput.registerComponent('trigger', function() {
        return {
            defaults: {
                template: function(namespace) {
                    return '<div class="' + namespace + '-trigger"><span></span></div>';
                }
            },
            init: function(api, options) {
                this.options = $.extend(this.defaults, options),
                api.$trigger = $(this.options.template.call(this, api.namespace));
                this.$trigger_inner = api.$trigger.children('span');

                api.$trigger.insertAfter(api.$element);
                api.$trigger.on('click', function() {
                    if (!api.opened) {
                        api.open();
                    } else {
                        api.close();
                    }
                    return false;
                });
                var self = this;
                api.$element.on('asColorInput::update', function(e, api, color, gradient, instance) {
                    if (typeof instance === 'undefined') {
                        gradient = false;
                    }
                    self.update(color, gradient);
                });

                this.update(api.color);
            },
            update: function(color, gradient) {
                if (gradient) {
                    this.$trigger_inner.css('background', gradient.toString(true));
                } else {
                    this.$trigger_inner.css('background', color.toRGBA());
                }
            },
            destroy: function(api) {
                api.$trigger.remove();
            }
        };
    });
})(jQuery);
