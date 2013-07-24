// Hhue

$.colorInput.registerComponent('Hhue', {
    selector: '.colorInput-picker-hue',
    template: '<div class="colorInput-hue drag-disable"><i class="drag-disable"></i></div>',
    width: 150,
    data: {},
    init: function(api) {
        var self = this;
        this.$hue = $(this.template).appendTo(api.$picker);
        this.$handle = this.$hue.children('i');

        this.width = this.$hue.width();

        //bind action
        this.$hue.on('mousedown.colorInput', function(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            if (rightclick) {
                return false;
            }
            $.proxy(self.mousedown, self)(api, e);
        });

        this.update(api);
    },
    mousedown: function(api, e) {
        var offset = this.$hue.offset();

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
    move: function(api, position, hub, update) {
        position = Math.max(0, Math.min(this.width, position));

        if (typeof hub === 'undefined') {
            hub = (1 - position / this.width) * 360;
        }
        hub = Math.max(0, Math.min(360, hub));
        this.$handle.css({
            left: position,
            background: $.colorValue.HSVtoHEX({
                h: hub,
                s: 1,
                v: 1
            })
        });
        if (update !== false) {
            api.update({
                h: hub
            }, 'h-hue');
        }
    },
    update: function(api) {
        var position = (api.color.value.h === 0) ? 0 : this.width * (1 - api.color.value.h / 360);
        this.move(api, position, api.color.value.h, false);
    },
    destroy: function(api) {
        $(document).off({
            mousemove: this.mousemove,
            mouseup: this.mouseup
        });
    }
});
