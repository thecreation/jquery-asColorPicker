// saturation

$.colorInput.registerComponent('saturation', {
    template: '<div class="colorInput-saturation drag-disable"><i class="drag-disable"><b class="drag-disable"></b></i></div>',
    defaults: {},
    options: {},
    width: 0,
    height: 0,
    size: 6,
    data: {},
    init: function(api) {

        var opts = $.extend(this.defaults, api.options.components.saturation),
            self = this;

        this.options = opts;

        //build element and add component to picker
        this.$saturation = $(this.template).appendTo(api.$picker);
        this.$handle = this.$saturation.children('i');

        this.width = this.$saturation.width();
        this.height = this.$saturation.height();
        this.size = this.$handle.width() / 2;

        //bind action
        this.$saturation.on('mousedown.colorInput', function(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            if (rightclick) {
                return false;
            }

            $.proxy(self.mousedown, self)(api, e);
        });

        $(document).on('colorInput::init', function(event, instance) {
            self.width = self.$saturation.width();
            self.height = self.$saturation.height();
            self.size = self.$handle.width() / 2;
            self.update(api);
        });

    },
    mousedown: function(api, e) {
        var offset = this.$saturation.offset();

        this.data.startY = e.pageY;
        this.data.startX = e.pageX;
        this.data.top = e.pageY - offset.top;
        this.data.left = e.pageX - offset.left;

        this.move(api, this.data.left, this.data.top);

        this.mousemove = function(e) {

            var x = this.data.left + (e.pageX || this.data.startX) - this.data.startX;
            var y = this.data.top + (e.pageY || this.data.startY) - this.data.startY;

            this.move(api, x, y);

            return false;
        };

        this.mouseup = function(e) {

            $(document).off({
                mousemove: this.mousemove,
                mouseup: this.mouseup
            });
            return false;
        };

        // when mousedown ,bind the mousemove event to document
        // when mouseup unbind the event
        $(document).on({
            mousemove: $.proxy(this.mousemove, this),
            mouseup: $.proxy(this.mouseup, this)
        });

        return false;
    },
    move: function(api, x, y, update) {

        y = Math.max(0, Math.min(this.height, y));
        x = Math.max(0, Math.min(this.width, x));

        this.$handle.css({
            top: y - this.size,
            left: x - this.size
        });

        if (update !== false) {

            api.update({
                s: x / this.width,
                v: 1 - (y / this.height)
            }, 'saturation');
        }
    },
    update: function(api) {

        if (api.color.value.h === undefined) {
            api.color.value.h = 0;
        }
        this.$saturation.css('backgroundColor', $.colorValue.HSLToHEX({
            h: api.color.value.h,
            s: 1,
            l: 0.5
        }));

        var x = api.color.value.s * this.width;
        var y = (1 - api.color.value.v) * this.height;

        this.move(api, x, y, false);
    },
    destroy: function(api) {
        $(document).off({
            mousemove: this.mousemove,
            mouseup: this.mouseup
        });
    }
});

