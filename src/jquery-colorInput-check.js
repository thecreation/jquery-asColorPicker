// check

(function($) {
    $.colorInput.registerComponent('check', {
        init: function(api) {
            var opts = $.extend(this.defaults, api.options.components.check);
            var template = '<div class="' + api.namespace + '-check drag-disable"><a class="' + api.namespace + '-check-apply drag-disable"></a><a class="' + api.namespace + '-check-cancel drag-disable"></a></div>';
            this.$check = $(template).appendTo(api.$picker);
            this.$apply = this.$check.find('.' + api.namespace + '-check-apply').text(opts.applyText);
            this.$cancel = this.$check.find('.' + api.namespace + '-check-cancel').text(opts.cancelText);

            this.$apply.on('click', $.proxy(api.apply, api));
            this.$cancel.on('click', $.proxy(api.cancel, api));
        }
    });
})(jQuery);