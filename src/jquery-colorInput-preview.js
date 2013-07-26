// preview

$.colorInput.registerComponent('preview', {
    selector: '.colorInput-preview',
    template: '<div class="colorInput-preview"><span class="colorInput-preview-previous drag-disable"></span><span class="colorInput-preview-current"></span></div>',
    height: 150,
    init: function(api) {
        this.$preview = $(this.template).appendTo(api.$picker);
        this.$current = this.$preview.find('.colorInput-preview-current');
        this.update(api);
    },
    update: function(api) {
        this.$current.css('backgroundColor', api.color.toRGBA());
    },
});

