// saturation

(function($) {
    "use strict";
     
    $.asColorInput.registerComponent('saturation', {
        defaults: {},
        width: 0,
        height: 0,
        size: 6,
        data: {},
        init: function(api, options) {
            var self = this;
            var template = '<div class="' + api.namespace + '-saturation"><i><b></b></i></div>';
            this.options = $.extend(this.defaults, options),

            //build element and add component to picker
            this.$saturation = $(template).appendTo(api.$dropdown);
            this.$handle = this.$saturation.children('i');

            api.$element.on('asColorInput::firstOpen', function() {
                // init variable
                self.width = self.$saturation.width();
                self.height = self.$saturation.height();
                self.step = {
                    left: self.width / 20,
                    top: self.height / 20
                };
                self.size = self.$handle.width() / 2;

                // update
                self.update(api);
                
                // bind events
                self.bindEvents(api);
                self.keyboard(api);
            });
        },
        bindEvents: function(api) {
            var self = this;

            this.$saturation.on('mousedown.asColorInput', function(e) {
                var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                if (rightclick) {
                    return false;
                }
                $.proxy(self.mousedown, self)(api, e);
            });
        },
        mousedown: function(api, e) {
            var offset = this.$saturation.offset();

            this.data.startY = e.pageY;
            this.data.startX = e.pageX;
            this.data.top = e.pageY - offset.top;
            this.data.left = e.pageX - offset.left;
            this.data.cach = {};

            this.move(api, this.data.left, this.data.top);

            this.mousemove = function(e) {
                var x = this.data.left + (e.pageX || this.data.startX) - this.data.startX;
                var y = this.data.top + (e.pageY || this.data.startY) - this.data.startY;
                this.move(api, x, y);
                return false;
            };

            this.mouseup = function() {
                $(document).off({
                    mousemove: this.mousemove,
                    mouseup: this.mouseup
                });
                this.data.left = this.data.cach.left;
                this.data.top = this.data.cach.top;

                return false;
            };

            $(document).on({
                mousemove: $.proxy(this.mousemove, this),
                mouseup: $.proxy(this.mouseup, this)
            });

            return false;
        },
        move: function(api, x, y, update) {
            y = Math.max(0, Math.min(this.height, y));
            x = Math.max(0, Math.min(this.width, x));

            if (this.data.cach === undefined) {
                this.data.cach = {};
            }
            this.data.cach.left = x;
            this.data.cach.top = y;

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
            this.$saturation.css('backgroundColor', $.asColor.HSLToHEX({
                h: api.color.value.h,
                s: 1,
                l: 0.5
            }));

            var x = api.color.value.s * this.width;
            var y = (1 - api.color.value.v) * this.height;

            this.move(api, x, y, false);
        },
        moveLeft: function(api) {
            var step = this.step.left,
                data = this.data;
            data.left = Math.max(0, Math.min(this.width, data.left - step));
            this.move(api, data.left, data.top);
        },
        moveRight: function(api) {
            var step = this.step.left,
                data = this.data;
            data.left = Math.max(0, Math.min(this.width, data.left + step));
            this.move(api, data.left, data.top);
        },
        moveUp: function(api) {
            var step = this.step.top,
                data = this.data;
            data.top = Math.max(0, Math.min(this.width, data.top - step));
            this.move(api, data.left, data.top);
        },
        moveDown: function(api) {
            var step = this.step.top,
                data = this.data;
            data.top = Math.max(0, Math.min(this.width, data.top + step));
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
