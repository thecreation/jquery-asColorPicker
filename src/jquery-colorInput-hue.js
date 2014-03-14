// hue

(function($) {
    $.colorInput.registerComponent('hue', {
        height: 150,
        data: {},
        init: function(api) {
            var self = this;
            var template = '<div class="' + api.namespace + '-hue drag-disable"><i clsss="drag-disable"></i></div>';
            this.$hue = $(template).appendTo(api.$picker);
            this.$handle = this.$hue.children('i');

            this.height = this.$hue.height();

            //bind action
            this.$hue.on('mousedown.colorInput', function(e) {
                var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                if (rightclick) {
                    return false;
                }
                $.proxy(self.mousedown, self)(api, e);
            });

            api.$element.on('colorInput::ready', function() {
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

            api.makeUnselectable();

            this.mousemove = function(e) {
                var position = this.data.top + (e.pageY || this.data.startY) - this.data.startY;
                this.move(api, position);
                return false;
            };

            this.mouseup = function() {
                $(document).off({
                    mousemove: this.mousemove,
                    mouseup: this.mouseup
                });
                this.data.top = this.data.cach;
                api.cancelUnselectable();
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
            this.data.cach = position;
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
            var step = this.step,
                data = this.data;
            data.top = data.top - step;
            // see https://github.com/amazingSurge/jquery-colorInput/issues/8
            data.top = Math.max(0, Math.min(this.width, data.top));
            this.move(api, data.top);
        },
        moveDown: function(api) {
            var step = this.step,
                data = this.data;
            data.top = data.top + step;
            // see https://github.com/amazingSurge/jquery-colorInput/issues/8
            data.top = Math.max(0, Math.min(this.width, data.top));
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
            }).on('blur', function() {
                keyboard.detach();
            });
        },
        destroy: function() {
            $(document).off({
                mousemove: this.mousemove,
                mouseup: this.mouseup
            });
        }
    });
})(jQuery);