// alpha

(function($) {
     "use strict";
     
    $.asColorInput.registerComponent('alpha', {
        size: 150,
        defaults: {
            direction: 'vertical', // horizontal
        },
        data: {},
        init: function(api, options) {
            var self = this;

            this.options = $.extend(this.defaults, options);
            self.direction = this.options.direction;

            this.$alpha = $('<div class="' + api.namespace + '-alpha ' + api.namespace + '-alpha-' + this.direction + '"><i></i></div>').appendTo(api.$dropdown);
            this.$handle = this.$alpha.children('i');

            api.$element.on('asColorInput::firstOpen', function() {
                // init variable
                if (self.direction === 'vertical') {
                    self.size = self.$alpha.height();
                } else {
                    self.size = self.$alpha.width();
                }
                self.step = self.size / 360;

                // update
                self.update(api);

                // bind events
                self.bindEvents(api);
                self.keyboard(api);
            });
        },
        bindEvents: function(api){
            var self = this;
            this.$alpha.on('mousedown.asColorInput', function(e) {
                var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                if (rightclick) {
                    return false;
                }
                $.proxy(self.mousedown, self)(api, e);
            });
        },
        mousedown: function(api, e) {
            var offset = this.$alpha.offset();
            if (this.direction === 'vertical') {
                this.data.startY = e.pageY;
                this.data.top = e.pageY - offset.top;
                this.move(api, this.data.top);
            } else {
                this.data.startX = e.pageX;
                this.data.left = e.pageX - offset.left;
                this.move(api, this.data.left);
            }

            this.mousemove = function(e) {
                var position;
                if (this.direction === 'vertical') {
                    position = this.data.top + (e.pageY || this.data.startY) - this.data.startY;
                } else {
                    position = this.data.left + (e.pageX || this.data.startX) - this.data.startX;
                }

                this.move(api, position);
                return false;
            };

            this.mouseup = function() {
                $(document).off({
                    mousemove: this.mousemove,
                    mouseup: this.mouseup
                });
                if (this.direction === 'vertical') {
                    this.data.top = this.data.cach;
                } else {
                    this.data.left = this.data.cach;
                }

                return false;
            };

            $(document).on({
                mousemove: $.proxy(this.mousemove, this),
                mouseup: $.proxy(this.mouseup, this)
            });
            return false;
        },
        move: function(api, position, alpha, update) {
            position = Math.max(0, Math.min(this.size, position));
            this.data.cach = position;
            if (typeof alpha === 'undefined') {
                alpha = 1 - (position / this.size);
            }
            alpha = Math.max(0, Math.min(1, alpha));
            if (this.direction === 'vertical') {
                this.$handle.css({
                    top: position
                });
            } else {
                this.$handle.css({
                    left: position
                });
            }

            if (update !== false) {
                api.update({
                    a: Math.round(alpha * 100) / 100
                }, 'alpha');
            }
        },
        moveLeft: function(api) {
            var step = this.step,
                data = this.data;
            data.left = Math.max(0, Math.min(this.width, data.left - step));
            this.move(api, data.left);
        },
        moveRight: function(api) {
            var step = this.step,
                data = this.data;
            data.left = Math.max(0, Math.min(this.width, data.left + step));
            this.move(api, data.left);
        },
        moveUp: function(api) {
            var step = this.step,
                data = this.data;
            data.top = Math.max(0, Math.min(this.width, data.top - step));
            this.move(api, data.top);
        },
        moveDown: function(api) {
            var step = this.step,
                data = this.data;
            data.top = Math.max(0, Math.min(this.width, data.top + step));
            this.move(api, data.top);
        },
        keyboard: function(api) {
            var keyboard, self = this;
            if (api._keyboard) {
                keyboard = $.extend(true, {}, api._keyboard);
            } else {
                return false;
            }

            this.$alpha.attr('tabindex', '0').on('focus', function() {
                if (this.direction === 'vertical') {
                    keyboard.attach({
                        up: function() {
                            self.moveUp.call(self, api);
                        },
                        down: function() {
                            self.moveDown.call(self, api);
                        }
                    });
                } else {
                    keyboard.attach({
                        left: function() {
                            self.moveLeft.call(self, api);
                        },
                        right: function() {
                            self.moveRight.call(self, api);
                        }
                    });
                }
                return false;
            }).on('blur', function() {
                keyboard.detach();
            });
        },
        update: function(api) {
            var position = this.size * (1 - api.color.value.a);
            this.$alpha.css('backgroundColor', api.color.toHEX());

            this.move(api, position, api.color.value.a, false);
        },
        destroy: function() {
            $(document).off({
                mousemove: this.mousemove,
                mouseup: this.mouseup
            });
        }
    });
})(jQuery);
