// gradient

(function($, asGradient) {
    function getPrefix() {
        var ua = window.navigator.userAgent;
        var prefix = '';
        if (/MSIE/g.test(ua)) {
            prefix = '-ms-';
        } else if (/Firefox/g.test(ua)) {
            prefix = '-moz-';
        } else if (/(WebKit)/i.test(ua)) {
            prefix = '-webkit-';
        } else if (/Opera/g.test(ua)) {
            prefix = '-o-';
        }
        return prefix;
    }

    function conventToPercentage(n) {
        if (n < 0) {
            n = 0;
        } else if (n > 1) {
            n = 1;
        }
        return n * 100 + '%';
    }

    var Gradient = function(api, options) {
        this.api = api;
        this.options = options;
        this.classes = {
            enable: api.namespace + '-gradient_enable',
            marker: api.namespace + '-gradient-marker',
            active: api.namespace + '-gradient-marker_active'
        };
        this.isOpened = false;
        this.isEnabled = false;
        this.initialized = false;
        this.current = null;
        this.$doc = $(document);

        var self = this;
        $.extend(self, {
            init: function() {
                self.$wrap = $(self.options.template.call(self)).appendTo(api.$dropdown);

                self.$gradient = self.$wrap.filter('.' + api.namespace + '-gradient');

                this.angle.init();
                this.preview.init();
                this.markers.init();
                this.wheel.init();

                this.bind();
            },
            bind: function() {
                var namespace = api.namespace;

                if (self.options.switchable) {
                    self.$wrap.on('click', '.' + namespace + '-gradient-switch', function() {
                        if (self.isOpened) {
                            self.disable();
                        } else {
                            self.enable();
                        }
                        self.api.position();
                        self.isOpened = !self.isOpened;
                        return false;
                    });
                }

                self.$wrap.on('click', '.' + namespace + '-gradient-cancel', function() {

                });
            },
            preview: {
                init: function() {
                    var that = this;
                    self.$preview = self.$gradient.find('.' + api.namespace + '-gradient-preview');

                    self.$gradient.on('add del update', function(e) {
                        that.render();
                    });
                },
                render: function() {
                    self.$preview.css({
                        'background-image': self.value.toStringWithAngle('to right', getPrefix()),
                    });
                    self.$preview.css({
                        'background-image': self.value.toStringWithAngle('to right'),
                    });
                }
            },
            markers: {
                width: 160,
                init: function() {
                    self.$markers = self.$gradient.find('.' + api.namespace + '-gradient-markers');
                    var that = this;
                    self.$gradient.on('add', function(e, data) {
                        that.add(data.stop.color.toString(), data.stop.position, data.stop.id);
                    });

                    self.$gradient.on('active', function(e, data) {
                        that.active(data.id);
                    });

                    self.$gradient.on('del', function(e, data) {
                        that.del(data.id);
                    });

                    self.$markers.on('mousedown.asColorInput', function(e) {
                        var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                        if (rightclick) {
                            return false;
                        }

                        var position = parseFloat((e.pageX - self.$markers.offset().left) / self.markers.width, 10);
                        self.add('#fff', position);
                        return false;
                    });

                    self.$markers.on('mousedown.asColorInput', 'span', function(e) {
                        var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                        if (rightclick) {
                            return false;
                        }
                        that.mousedown(this, e);
                        return false;
                    });

                    self.$markers.on('focus.asColorInput', 'span', function(e) {
                        if (!$(this).isBinded) {
                            var id = $(this).data('id');
                            $(document).on('keydown.asColorInput' + id, function(e) {
                                var key = e.keyCode || e.which;
                                if (key === 46 || key === 8) {
                                    if (self.value.length <= 2) {
                                        return;
                                    }

                                    return self.del(id);
                                }
                            });

                            $(this).isBinded = true;
                        }
                    }).on('blur', 'span', function() {
                        $(document).off('keydown.asColorInput' + $(this).data('id'));
                        $(this).isBinded = false;
                    });

                    self.$markers.on('click', 'span', function(e) {
                        var id = $(this).data('id');
                        self.active(id);
                    });
                },
                add: function(color, position, id) {
                    $('<span data-id="' + id + '" style="background: ' + color + '; left:' + conventToPercentage(position) + '" class="' + self.classes.marker + '"><i style="background: ' + color + '"></i></span>').attr('tabindex', 0).appendTo(self.$markers);
                },
                del: function(id) {
                    self.$markers.find('[data-id="' + id + '"]').remove();
                },
                active: function(id) {
                    var $marker = self.$markers.find('[data-id="' + id + '"]');

                    self.$markers.children().removeClass(self.classes.active);
                    $marker.addClass(self.classes.active);

                    $marker.focus();
                },
                mousedown: function(marker, e) {
                    var that = this,
                        id = $(marker).data('id'),
                        first = $(marker).position().left,
                        start = e.pageX,
                        end;

                    this.mousemove = function(e) {
                        end = e.pageX || start;
                        var position = (first + end - start) / this.width;
                        that.move(marker, position, id);
                        return false;
                    };

                    this.mouseup = function() {
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
                    $(marker).focus();
                    return false;
                },
                move: function(marker, position, id) {
                    position = Math.max(0, Math.min(1, position));
                    $(marker).css({
                        left: conventToPercentage(position)
                    });
                    if (!id) {
                        id = $(marker).data('id');
                    }

                    self.value.getById(id).setPosition(position);

                    self.$gradient.trigger('update', {
                        id: $(marker).data('id'),
                        position: position
                    });
                },
            },
            wheel: {
                init: function() {
                    var that = this;
                    self.$wheel = self.$gradient.find('.' + api.namespace + '-gradient-wheel');
                    self.$pointer = self.$wheel.find('i');

                    self.$gradient.on('update', function(e, data) {
                        if (typeof data.angle !== 'undefined') {
                            that.position(data.angle);
                        }
                    });

                    self.$wheel.on('mousedown.asColorInput', function(e) {
                        var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                        if (rightclick) {
                            return false;
                        }
                        that.mousedown(e, self);
                        return false;
                    });
                },
                mousedown: function(e, self) {
                    var offset = self.$wheel.offset();
                    var r = self.$wheel.width() / 2;
                    var startX = offset.left + r;
                    var startY = offset.top + r;
                    var $doc = self.$doc;
                    var that = this;

                    this.r = r;

                    this.wheelMove = function(e) {
                        var x = e.pageX - startX;
                        var y = startY - e.pageY;

                        var position = that.getPosition(x, y);
                        var angle = that.calAngle(position.x, position.y);
                        self.setAngle(angle);
                    };
                    this.wheelMouseup = function() {
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

                    this.wheelMove(e);
                },
                getPosition: function(a, b) {
                    var r = this.r;
                    var x = a / Math.sqrt(a * a + b * b) * r;
                    var y = b / Math.sqrt(a * a + b * b) * r;
                    return {
                        x: x,
                        y: y
                    };
                },
                calAngle: function(x, y) {
                    var deg = Math.round(Math.atan(Math.abs(x / y)) * (180 / Math.PI));
                    if (x < 0 && y > 0) {
                        return 360 - deg;
                    }
                    if (x < 0 && y <= 0) {
                        return deg + 180;
                    }
                    if (x >= 0 && y <= 0) {
                        return 180 - deg;
                    }
                    if (x >= 0 && y > 0) {
                        return deg;
                    }
                },
                set: function(value) {
                    self.value.angle(value);
                    self.$gradient.trigger('update', {
                        angle: value
                    });
                },
                position: function(angle) {
                    var r = this.r || self.$wheel.width() / 2;
                    var pos = this.calPointer(angle, r);
                    self.$pointer.css({
                        left: pos.x,
                        top: pos.y
                    });
                },
                calPointer: function(angle, r) {
                    var x = Math.sin(angle * Math.PI / 180) * r;
                    var y = Math.cos(angle * Math.PI / 180) * r;
                    return {
                        x: r + x,
                        y: r - y
                    };
                }
            },
            angle: {
                init: function() {
                    var that = this;
                    self.$angle = self.$gradient.find('.' + api.namespace + '-gradient-angle');

                    self.$angle.on('blur.asColorInput', function() {
                        self.setAngle(this.value);
                        return false;
                    }).on('keydown.asColorInput', function(e) {
                        var key = e.keyCode || e.which;
                        if (key === 13) {
                            $(this).blur();
                            return false;
                        }
                    });

                    self.$gradient.on('update', function(e, data) {
                        if (typeof data.angle !== 'undefined') {
                            self.$angle.val(data.angle);
                        }
                    });
                },
                set: function(value) {
                    self.value.angle(value);
                    self.$gradient.trigger('update', {
                        angle: value
                    });
                }
            }
        });

        this.init();
    };

    Gradient.prototype = {
        constructor: Gradient,

        enable: function() {
            var self = this;
            this.isEnabled = true;
            this.api.$element.off('asColorInput::set');
            this.api.$element.on('asColorInput::set', function(e, value){
                self.value.getById(self.current).color.set(value);
                self.$gradient.trigger('update', {});
            });

            this.$gradient.addClass(this.classes.enable);
            this.markers.width = this.$markers.width();

            if (this._last) {
                this.value = this._last;
            } else {
                var gradient = new asGradient();
                this.value = gradient;

                this.add(this.api.color.toString(), 0, 0);
                this.add(this.api.color.toString(), 1, 1);
            }
            this.api.color = this.value;
            this.$gradient.trigger('update', this.value.value);
        },
        disable: function() {
            this.isEnabled = false;
            this.api.$element.off('asColorInput::set');
            this.api.$element.on('asColorInput::set', $.proxy(this.api._set, this.api));

            this.$gradient.removeClass(this.classes.enable);
            this._last = this.value;
            this.api.color.val(this.api.color.get(0).color.toString());
        },
        active: function(id) {
            if (this.current !== id) {
                this.current = id;

                this.$gradient.trigger('active', {
                    id: id
                });
            }
        },
        add: function(color, position) {
            var stop = this.value.insert(color, position);
            this.value.reorder();

            this.$gradient.trigger('add', {
                stop: stop
            });

            this.active(stop.id);

            return stop;
        },
        del: function(id) {
            this.value.removeById(id);
            this.value.reorder();
            this.$gradient.trigger('del', {
                id: id
            });
        },
        setAngle: function(value) {
            this.value.angle(value);
            this.$gradient.trigger('update', {
                angle: value
            });
        }
    };

    $.asColorInput.registerComponent('gradient', {
        angle: 1,
        count: 0,
        markers: [],
        current: null,
        defaults: {
            switchable: true,
            switchText: 'Gradient',
            cancelText: 'Cancel',
            format: function(value) {
                if (value) {
                    return value;
                } else {
                    return;
                }
            },
            template: function() {
                var namespace = this.api.namespace;
                var control = '<div class="' + namespace + '-gradient-control">';
                if (this.options.switchable) {
                    control += '<a href="#" class="' + namespace + '-gradient-switch">' + this.options.switchText + '</a>';
                }
                control += '<a href="#" class="' + namespace + '-gradient-cancel">' + this.options.cancelText + '</a>' +
                    '</div>';

                return control +
                    '<div class="' + namespace + '-gradient">' +
                    '<div class="' + namespace + '-gradient-preview">' +
                    '<div class="' + namespace + '-gradient-markers"></div>' +
                    '</div>' +
                    '<div class="' + namespace + '-gradient-wheel">' +
                    '<i></i>' +
                    '</div>' +
                    '<input class="' + namespace + '-gradient-angle" type="text" value="" size="3" />' +
                    '</div>';
            }
        },
        init: function(api, options) {
            var self = this;

            api.$element.on('asColorInput::ready', function(event, instance) {
                if (instance.options.mode !== 'gradient') {
                    return;
                }

                options = $.extend(self.defaults, options);

                api.gradient = new Gradient(api, options);
            });
            
        }
    });
})(jQuery, (function($) {
    if ($.asGradient === undefined) {
        // console.info('lost dependency lib of $.asGradient , please load it first !');
        return false;
    } else {
        return $.asGradient;
    }
}(jQuery)));
