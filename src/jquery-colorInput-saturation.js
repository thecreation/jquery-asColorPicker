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

        this.step = {};

        //bind action
        this.$saturation.on('mousedown.colorInput', function(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            if (rightclick) {
                return false;
            }

            $.proxy(self.mousedown, self)(api, e);
        });

        $(document).on('colorInput::ready', function(event, api) {
            self.width = self.$saturation.width();
            self.height = self.$saturation.height();
            self.step.left = self.width / 20;
            self.step.top = self.height / 20;
            self.size = self.$handle.width() / 2;

            self.update(api);
            self.keyboard(api);
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
    moveLeft: function(api) {
        var step=this.step.left, data = this.data;
        data.left = data.left - step;
        this.move(api, data.left, data.top);
    },
    moveRight: function(api) {
        var step=this.step.left, data = this.data;
        data.left = data.left + step;
        this.move(api, data.left, data.top);
    },
    moveUp: function(api) {
        var step=this.step.top, data = this.data;
        data.top = data.top - step;
        this.move(api, data.left, data.top);
    },
    moveDown: function(api) {
        var step=this.step.top, data = this.data;
        data.top = data.top + step;
        this.move(api, data.left, data.top);
    },
    keyboard: function(api) {
        var keyboard, self = this;
        if (api._keyboard) {
            keyboard = $.extend(true, {}, api._keyboard);
        } else {
            return false;
        }

        this.$saturation.attr('tabindex', '0').on('focus', function() {
            keyboard.attach({
                left: function() {
                    self.moveLeft.call(self, api);
                },
                right: function() {
                    self.moveRight.call(self, api);
                },
                up: function() {
                    self.moveUp.call(self, api);
                },
                down: function() {
                    self.moveDown.call(self, api);
                }
            });
            return false;
        }).on('blur', function(e) {
            keyboard.detach();
        });
    },
    destroy: function(api) {
        $(document).off({
            mousemove: this.mousemove,
            mouseup: this.mouseup
        });
    }
});

