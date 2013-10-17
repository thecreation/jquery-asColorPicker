// hue

$.colorInput.registerComponent('hue', {
    selector: '.colorInput-picker-hue',
    template: '<div class="colorInput-hue drag-disable"><i clsss="drag-disable"></i></div>',
    height: 150,
    data: {},
    init: function(api) {
        var self = this;
        this.$hue = $(this.template).appendTo(api.$picker);
        this.$handle = this.$hue.children('i');

        this.height = this.$hue.height();

        //bind action
        this.$hue.on('mousedown.colorInput', function(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            if (rightclick) {
                return false;
            }
            $.proxy(self.mousedown, self)(api, e);
        });

        api.$picker.on('colorInput::ready', function(event, api) {
            self.height = self.$hue.height();
            self.step = self.height / 360;
            self.update(api);
            self.keyboard(api);
        });
    },
    mousedown: function(api, e) {
        var offset = this.$hue.offset();

        this.data.startY = e.pageY;
        this.data.top = e.pageY - offset.top;

        this.move(api, this.data.top);

        this.mousemove = function(e) {
            e.stopPropagation();
            e.preventDefault();

            var position = this.data.top + (e.pageY || this.data.startY) - this.data.startY;

            this.move(api, position);
            return false;
        };

        this.mouseup = function(e) {
            e.stopPropagation();
            e.preventDefault();

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
        position = Math.max(0, Math.min(this.height, position));
        if (typeof hub === 'undefined') {
            hub = (1 - position / this.height) * 360;
        }
        hub = Math.max(0, Math.min(360, hub));
        this.$handle.css({
            top: position
        });
        if (update !== false) {
            api.update({
                h: hub
            }, 'hue');
        }
    },
    moveUp: function(api) {
        var step=this.step, data = this.data;
        data.top = data.top - step;
        this.move(api, data.top);
    },
    moveDown: function(api) {
        var step=this.step, data = this.data;
        data.top = data.top + step;
        this.move(api, data.top);
    },
    update: function(api) {
        var position = (api.color.value.h === 0) ? 0 : this.height * (1 - api.color.value.h / 360);
        this.move(api, position, api.color.value.h, false);
    },
    keyboard: function(api) {
        var keyboard, self = this;
        if (api._keyboard) {
            keyboard = $.extend(true, {}, api._keyboard);
        } else {
            return false;
        }

        this.$hue.attr('tabindex', '0').on('focus', function() {
            keyboard.attach({
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

