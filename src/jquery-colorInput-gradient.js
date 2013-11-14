// gradient

$.colorInput.registerComponent('gradient', {
    selector: '.colorInput-gradient',
    template: '<a href="#" class="colorInput-gradient-trigger">Gradient</a>' +
        '<div class="colorInput-gradient">' +
        '<div class="colorInput-gradient-panel">' +
        '<div class="colorInput-gradient-markers"></div>' +
        '</div>' +
        '<div class="colorInput-gradient-wheel">' +
        '<i></i>' +
        '</div>' +
        '<input class="colorInput-gradient-degree" type="text" value="360" size="3" />' +
        '</div>',
    degree: 1,
    count: 0,
    markers: [],
    current: null,
    init: function(api) {
        var self = this;

        this.api = api;
        this.classes = {
            show: 'colorInput-gradient' + '_show',
            marker: 'colorInput-gradient-marker'
        };
        this.isOpened = false;
        this.$doc = $(document);

        this.$template = $(this.template).appendTo(api.$picker);
        this.$trigger = this.$template.eq(0);
        this.$gradient = this.$template.eq(1);
        this.$panel = this.$gradient.find('.colorInput-gradient-markers');
        this.$wheel = this.$gradient.find('.colorInput-gradient-wheel');
        this.$pointer = this.$wheel.find('i');
        this.$degree = this.$gradient.find('.colorInput-gradient-degree');

        this.$trigger.on('click', function() {
            if (self.isOpened) {
                self.$gradient.removeClass(self.classes.show);
                api.isGradient = false;
            } else {
                self.$gradient.addClass(self.classes.show);
                api.isGradient = true;
            }
            self.isOpened = !self.isOpened;
            return false;
        });

        // create new marker
        this.$panel.on('mousedown.colorinput', function(e) {
            var position = e.pageX - self.$panel.offset().left;
            var percent = Math.round((position / self.width) * 100);
            self.makeMarker('#fff', percent);
            return false;
        });
        this.$wheel.on('mousedown.colorInput', function(e) {
            self.wheelMousedown(e);
            return false;
        });

        api.$element.on('colorInput::ready', function() {
            self.width = self.$panel.width();
        });
        api.$element.on('colorInput::change', function(event, instance) {
            if (self.current) {
                self.current.setColor(instance.color.toRGBA());
            }
        });
        this.$degree.on('blur.colorInput', function() {
            var deg = parseInt(this.value, 10);
            self.setDegree(deg);
            return false;
        });

        this.makeMarker('#fff', 0);
        this.makeMarker('#000', 100);
        this.setDegree(0);
    },
    mousedown: function(e, dom) {
        // get current marker
        var id = $(dom).data('id');
        var instance;
        $.each(this.markers, function(key, marker) {
            if (marker._id === id) {
                instance = marker;
            }
        });
        this.current = instance;

        // get marker current position
        var begining = $(dom).position().left,
            start = e.pageX,
            api = this.api,
            end;

        api.makeUnselectable();
        api.set(instance.color);

        this.mousemove = function(e) {
            end = e.pageX || start;
            var position = begining + end - start;
            this.move(instance, position);
            return false;
        };

        this.mouseup = function(e) {
            $(document).off({
                mousemove: this.mousemove,
                mouseup: this.mouseup
            });
            api.cancelUnselectable();
            return false;
        };

        $(document).on({
            mousemove: $.proxy(this.mousemove, this),
            mouseup: $.proxy(this.mouseup, this)
        });
        $(dom).focus();
        return false;
    },
    move: function(marker, position) {
        var api = this.api;
        var $element = marker.$element;

        position = Math.max(0, Math.min(this.width, position));
        var percent = Math.round((position / this.width) * 100);

        marker.setPercent(percent);
        this.makeGradient();
    },
    makeMarker: function(color, percent) {
        var self = this;
        var $doc = this.$doc;
        var api = this.api;
        var Marker = function() {
            this.color = color;
            this.percent = percent;
            this._id = ++self.count;
            this.$element = $('<span class="' + self.classes.marker + '"><i></i></span>').attr('tabindex', 0).data('id', this._id);
            this.$element.appendTo(self.$panel);
            this.$element.on('mousedown.colorInput', function(e) {
                var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                if (rightclick) {
                    return false;
                }
                self.mousedown.call(self, e, this);
                return false;
            });
        };
        Marker.prototype.setColor = function(color) {
            this.color = color;
            this.$element.css({
                background: color
            });
        };
        Marker.prototype.setPercent = function(percent) {
            this.percent = percent;
            this.$element.css({
                left: percent + '%'
            });
        };

        var marker = new Marker();
        marker.setPercent(percent);
        marker.setColor(color);
        this.markers.push(marker);
        this.current = marker;

        // init and set color
        marker.$element.on('focus', function() {
            $doc.on('keydown.' + marker._id, function(e) {
                var key = e.keyCode || e.which;
                if (key === 46) {
                    self.del(marker);
                }
            });
        }).on('blur', function() {
            $doc.off('keydown.' + marker._id);
        });

        return marker;
    },
    makeGradient: function() {
        var markers = this.markers,
            api = this.api,
            gradient = 'gradient(' + this.degree + 'deg,';
        // sort array by percent 
        markers.sort(function(a, b) {
            return a.percent > b.percent;
        });
        $.each(markers, function(key, marker) {
            gradient += marker.color + ' ' + marker.percent + '%,';
        });
        gradient = gradient.substring(0, gradient.length - 1);
        gradient += ')';
        api.gradient = gradient;
        api._trigger('gradientChange', gradient);
        return gradient;
    },

    // wheel method
    getPosition: function(a, b) {
        var r = this.r;
        var x = a / Math.sqrt(a * a + b * b) * r;
        var y = b / Math.sqrt(a * a + b * b) * r;
        return {
            x: x,
            y: y
        };
    },
    calDegree: function(x, y) {
        var deg = Math.round(Math.atan(Math.abs(y / x)) * (180 / Math.PI));
        if (x <= 0 && y > 0) {
            return 180 - deg;
        }
        if (x <= 0 && y <= 0) {
            return deg + 180;
        }
        if (x > 0 && y <= 0) {
            return 360 - deg;
        }
        if (x > 0 && y > 0) {
            return deg;
        }
    },
    _setDegree: function(deg) {
        this.deg = deg;
        this.$degree.val(deg);
        this.makeGradient();
    },
    setDegree: function(deg) {
        if (this.degree === deg) {
            return false;
        }

        var r = this.r || this.$wheel.width() / 2;
        var pos = this.calPointer(deg, r);
        this.$pointer.css({
            left: pos.x,
            top: pos.y
        });
        this._setDegree(deg);
    },
    calPointer: function(deg, r) {
        var x = Math.cos(deg * Math.PI / 180) * r;
        var y = Math.sin(deg * Math.PI / 180) * r;
        return {
            x: r + x,
            y: r - y
        };
    },
    wheelMousedown: function(e) {
        var offset = this.$wheel.offset();
        var r = this.$wheel.width() / 2;
        var startX = offset.left + r;
        var startY = offset.top + r;
        var $doc = this.$doc;

        this.r = r;

        this.wheelMove = function(e) {
            var x = e.pageX - startX;
            var y = startY - e.pageY;
            var position = this.getPosition(x, y);
            var deg = this.calDegree(position.x, position.y);
            this._setDegree(deg);
            var pos = this.calPointer(deg, r);
            this.$pointer.css({
                left: pos.x,
                top: pos.y
            });
        };
        this.wheelMouseup = function(e) {
            $doc.off({
                mousemove: this.wheelMove,
                mouseup: this.wheelMouseup
            });
            return false;
        };
        $doc.on({
            mousemove: $.proxy(this.wheelMove, this),
            mouseup: $.proxy(this.wheelMouseup, this)
        });

        // set value first
        this.wheelMove(e);
    },
    del: function(marker) {
        marker.$element.remove();
        this.markers.splice($.inArray(marker, this.markers), 1);
    },
    destory: function() {
        this.$element.off('click');
        this.$element.remove();
    }
});