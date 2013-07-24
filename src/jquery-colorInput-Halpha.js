// Halpha

$.colorInput.registerComponent('Halpha', {
    selector: '.colorInput-alpha',
    template: '<div class="colorInput-alpha drag-disable"><i class="drag-disable"></i></div>',
    width: 150,
    data: {},
    init: function(api) {
        var self = this;

        this.$alpha = $(this.template).appendTo(api.$picker);
        this.$handle = this.$alpha.children('i');

        this.width = this.$alpha.width();

        //bind action
        this.$alpha.on('mousedown.colorinput', function(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            if (rightclick) {
                return false;
            }
            $.proxy(self.mousedown, self)(api, e);
        });

        this.update(api);
    },
    mousedown: function(api, e) {
        var offset = this.$alpha.offset();

        this.data.startX = e.pageX;
        this.data.left = e.pageX - offset.left;

        this.move(api, this.data.left);

        this.mousemove = function(e) {

            var position = this.data.left + (e.pageX || this.data.startX) - this.data.startX;

            this.move(api, position);
            return false;
        };

        this.mouseup = function(e) {

            $(document).off({
                mousemove: this.mousemove,
                mouseup: this.mouseup
            });
            return false;
        };

        $(document).on({
            mousemove: $.proxy(this.mousemove, this),
            mouseup: $.proxy(this.mouseup, this)
        });
        return false;
    },
    move: function(api, position, alpha, update) {
        position = Math.max(0, Math.min(this.width, position));
        if (typeof alpha === 'undefined') {
            alpha = 1 - (position / this.width);
        }
        alpha = Math.max(0, Math.min(1, alpha));
        this.$handle.css({
            left: position
        });
        if (update !== false) {
            api.update({
                a: Math.round(alpha * 100) / 100
            }, 'h-alpha');
        }
    },
    update: function(api) {
        var position = this.width * (1 - api.color.value.a);
        this.$alpha.css('backgroundColor', api.color.toHEX());

        this.move(api, position, api.color.value.a, false);
    },
    destroy: function(api) {
        $(document).off({
            mousemove: this.mousemove,
            mouseup: this.mouseup
        });
    }
});
