$.colorInput.registerComponent('check', {
    selector: '.colorInput-check',
    template: '<div class="colorInput-check drag-disable"><a class="colorInput-check-apply drag-disable"></a><a class="colorInput-check-cancel drag-disable"></a></div>',
    init: function(api) {
        var opts = $.extend(this.defaults, api.options.components.check),
            self = this;

        this.$check = $(this.template).appendTo(api.$picker);
        this.$apply = this.$check.find('.colorInput-check-apply').text(opts.applyText);
        this.$cancel = this.$check.find('.colorInput-check-cancel').text(opts.cancelText);

        this.$apply.on('click', $.proxy(api.apply, api));
        this.$cancel.on('click', $.proxy(api.cancel, api));
    }
});


