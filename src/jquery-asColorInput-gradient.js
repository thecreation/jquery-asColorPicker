// gradient

(function($) {
    $.asColorInput.registerComponent('gradient', {
        degree: 1,
        count: 0,
        markers: [],
        current: null,
        defaults: {
            gradientText: 'Gradient',
            cancelText: 'Cancel',
            keepMode: false,
            parse: function(text) {
                var re = /gradient\(\s*(\d{1,3})deg\s*,((?:\s*(#([a-f0-9]{6}|[a-f0-9]{3})|((rgb|rgba|hsl|hsla)\([^\)]*\)))\s*(\d{1,3}%)\s*\,?)+)\)/,
                    markers_re = /(#([^\s]+)|((rgb|rgba|hsl|hsla)\([^\)]*\)))\s*(\d{1,3}%)/g;
                
                if (re.exec(text) === null) {
                    return null;
                }else {
                    return {
                        degree: re.exec(text)[1],
                        markers: re.exec(text)[2].match(markers_re)
                    };
                }
            },
            format: function(value) {
                if (value) {
                    return value;
                }else {
                    return;
                }
            }
        },
        init: function(api, options) {
            var self = this;
            this.options = $.extend(this.defaults, options);

            var template = '<div class="' + api.namespace + '-gradient-controll">' +
                    '<a href="#" class="' + api.namespace + '-gradient-trigger">'+this.options.gradientText+'</a>' +
                    '<a href="#" class="' + api.namespace + '-gradient-cancel">'+this.options.cancelText+'</a>' +
                '</div>' +
                '<div class="' + api.namespace + '-gradient">' +
                    '<div class="' + api.namespace + '-gradient-panel">' +
                        '<div class="' + api.namespace + '-gradient-markers"></div>' +
                    '</div>' +
                    '<div class="' + api.namespace + '-gradient-wheel">' +
                         '<i></i>' +
                    '</div>' +
                    '<input class="' + api.namespace + '-gradient-degree" type="text" value="360" size="3" />' +
                '</div>';
            this.api = api;
            this.classes = {
                enable: api.namespace + '-gradient' + '_enable',
                marker: api.namespace + '-gradient-marker',
                active: api.namespace + '-gradient-marker_active'
            };
            this.isOpened = false;
            this.initialized = false;
            this.$doc = $(document);

            this.$template = $(template).appendTo(api.$dropdown);
            this.$controll = self.$template.eq(0);
            this.$trigger = this.$controll.find('.' + api.namespace + '-gradient-trigger');
            this.$cancel = this.$controll.find('.' + api.namespace + '-gradient-cancel');
            this.$gradient = this.$template.eq(1);
            this.$panel = this.$gradient.find('.' + api.namespace + '-gradient-panel');
            this.$markers = this.$gradient.find('.' + api.namespace + '-gradient-markers');
            this.$wheel = this.$gradient.find('.' + api.namespace + '-gradient-wheel');
            this.$pointer = this.$wheel.find('i');
            this.$degree = this.$gradient.find('.' + api.namespace + '-gradient-degree');

            this.g_input.init(this);
            this.g_controll.init(this);
            this.g_panel.init(this);
            this.g_wheel.init(this);
            this.g_degree.init(this);

            api.$element.on('asColorInput::ready', function(event, instance) {
                if (instance.options.mode !== 'gradient') {
                    return;
                }
                if ((self.value = self.options.parse(self.api.gradient)) != null) {
                    self.keepGradient(self);
                    self.g_input.getMarkers(self.value, self);
                }

                if (self.options.keepMode) {
                    self.keepGradient(self);
                }
            });
        },
        keepGradient: function(self) {
            self.width = self.$markers.width();
            self.isOpened = true;
            self.$gradient.addClass(self.classes.enable);
            self.api.isGradient = true;
            self.g_controll.makeGradient(self);
            self.api.position();
        },
        g_input: {
            init: function(self) {
                this.bind(self);
            },
            bind: function(self) {
                var itself = this;
                self.api.$element.on('keyup', function(e) {
                    if (!self.api.isGradient) {
                        return;
                    }

                    if (e.keyCode === 27) {
                        self.api.close();
                    }else if (e.keyCode === 13) {
                        if ((self.value = self.options.parse(self.api.$element.val())) != null) {
                            itself.getMarkers(self.value, self);
                            self.api.update({}, 'input');
                            self.api.$element.focus();
                        }
                    }
                });
            },
            getMarkers: function(value, self) {
                var markers = value.markers;

                self.$markers.children().remove();
                self.markers = [];
                self.count = 0;
                self.g_wheel.setDegree(value.degree, self);
                for (var i in markers) {
                    self.api.color.from(markers[i]);
                    percent = parseInt(markers[i].match(/[^\,\(]\)*\s+(\d{1,3})%/)[1]);
                    self.g_panel.makeMarker(self.api.color, percent, self);
                    self.api.set(self.api.color);
                }
            },
        },
        g_controll: {
            init: function(self) {
                var itself = this;
                this.bind(self);

                self.api.$element.on('asColorInput::close', function() {
                    if (self.api.isGradient) {
                        itself.setGradient(self);
                    }
                    return false;
                });
            },
            bind: function(self) {
                var itself = this,
                    api = self.api;
                self.$trigger.on('click', function() {
                    if (self.options.keepMode) {
                        return false;
                    }
                    if (self.isOpened) {
                        self.$gradient.removeClass(self.classes.enable);
                        itself.setGradient(self);
                        api.isGradient = false;
                        api.set(api.originalColor);
                    } else {
                        self.width = self.$markers.width();
                        self.$gradient.addClass(self.classes.enable);
                        api.isGradient = true;
                        itself.makeGradient(self);
                        api.$element.focus();
                    }
                    api.position();
                    self.isOpened = !self.isOpened;
                    return false;
                });

                self.$cancel.on('click', function() {
                    api.color.from('#000');
                    api.update({});
                    self.count = 0;
                    itself.retrieve(self);
                    return false;
                });
            },
            setGradient: function(self) {
                var itself = this;
                // copy array with object element
                this.origin = {};
                this.origin.markers = [];
                self.markers.map(function(marker) {
                    var copy = {
                        color: marker.color,
                        percent: marker.percent
                    };
                    itself.origin.markers.push(copy);
                });
                this.origin.degree = self.degree;
            },
            makeGradient: function(self) {
                var markers = self.markers,
                    api = self.api,
                    gradient = 'gradient(' + (self.degree ? self.degree : 0) + 'deg,',
                    f1 = '',
                    f2 = '',
                    prefix = this.getPrefix();
                // sort array by percent 
                markers.sort(function(a, b) {
                    return a.percent > b.percent;
                });
                markers.map(function(marker, key, markers) {
                    gradient += marker.color + ' ' + marker.percent + '%,';
                    if (key === (markers.length - 1)) {
                        f1 += 'color-stop(' + marker.percent / 100 + ',' + marker.color + ')';
                        f2 += marker.color + ' ' + marker.percent + '%';
                    } else {
                        f1 += 'color-stop(' + marker.percent / 100 + ',' + marker.color + '),';
                        f2 += marker.color + ' ' + marker.percent + '%,';
                    }
                });
                gradient = gradient.substring(0, gradient.length - 1);
                gradient += ')';
                api.gradient = prefix + 'linear-' + gradient;
                api._trigger('gradientChange', gradient);

                // enable value on input element
                api.$element.val(gradient);

                if (prefix === '-webkit-') {
                    self.$panel[0].style.backgroundImage = prefix + 'gradient(linear, left top, right top, ' + f1 + ')';
                }
                self.$panel[0].style.backgroundImage = prefix + 'linear-gradient(left, ' + f2 + ')';

                api.components.trigger.update(api);
                
                return gradient;
            },
            retrieve: function(self) {
                self.markers.map(function(marker) {
                    marker.$element.blur();
                    marker.$element.remove();
                });
                self.markers = [];
                self.g_panel.makeMarker('#fff', 0, self);
                self.g_panel.makeMarker('#000', 100, self);
                self.g_wheel.setDegree(0, self);
                this.makeGradient(self);
            },
            getPrefix: function() {
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
            },
        },
        g_panel: {
            init: function(self) {
                this.makeMarker('#fff', 0, self);
                this.makeMarker('#000', 100, self);
                this.bind(self);

                self.api.$element.on('asColorInput::change', function(event, color, name, pluginName, instance) {
                    if (self.current && self.api.isGradient && !self.api.clear) {
                        if (instance.color.value.a === 0) {
                            instance.color.value.a = 1;
                        }
                        self.current.setColor(instance.color.toRGBA());
                        self.g_controll.makeGradient(self);
                    }else if (self.api.clear) {
                        self.count = 0;
                        self.g_controll.retrieve(self);
                        self.api.gradient = '';
                    }
                });
            },
            bind: function(self) {
                var itself = this;
                // create new marker
                self.$markers.on('mousedown.asColorInput', function(e) {
                    var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                    if (rightclick) {
                        return false;
                    }
                    var position = e.pageX - self.$markers.offset().left;
                    var percent = Math.round((position / self.width) * 100);
                    itself.makeMarker('#fff', percent, self);
                    self.g_controll.makeGradient(self);
                    return false;
                });
            },
            makeMarker: function(color, percent, self) {
                var itself = this;
                var $doc = self.$doc;
                var Marker = function() {
                    this.color = color;
                    this.percent = percent;
                    this._id = ++self.count;
                    this.$element = $('<span class="' + self.classes.marker + '"><i></i></span>').attr('tabindex', 0).data('id', this._id);
                    this.$element.appendTo(self.$markers);
                    this.$element.on('mousedown.asColorInput', function(e) {
                        var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                        if (rightclick) {
                            return false;
                        }
                        itself.mousedown(e, this, self);
                        return false;
                    });
                };
                Marker.prototype.setColor = function(color) {
                    this.color = color;
                    this.$element.find('i').css({
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
                self.markers.push(marker);

                if (self.current !== null) {
                    self.api.originalColor = self.current.color;
                    self.api._trigger('apply');
                }

                self.$markers.children().removeClass(self.classes.active);
                self.current = marker;
                marker.$element.addClass(self.classes.active).focus();

                marker.hasBinded = false;
                marker.$element.on('focus', function() {
                    if (!marker.hasBinded) {
                        $doc.on('keydown.' + marker._id, function(e) {
                            var key = e.keyCode || e.which;
                            if (key === 46) {
                                if (self.count <= 2) {
                                    return;
                                }
                                itself.del(marker, self);
                                self.g_controll.makeGradient(self);
                                self.$markers.children().eq(self.count - 1).addClass(self.classes.active).focus();
                            }
                        });
                        
                        marker.hasBinded = true;
                        self.api.originalColor = self.current.color;
                        self.api._trigger('apply');
                    }
                }).on('blur', function() {
                    $doc.off('keydown.' + marker._id);
                    marker.hasBinded = false;
                });

                return marker;
            },
            mousedown: function(e, dom, self) {
                var itself = this,
                    api = self.api;
                // get current marker
                var id = $(dom).data('id');
                var instance;
                $.each(self.markers, function(key, marker) {
                    if (marker._id === id) {
                        instance = marker;
                    }
                });
                
                if (self.current !== instance) {
                    api.originalColor = self.current.color;
                    self.current.$element.removeClass(self.classes.active);
                    self.current = instance;
                    instance.$element.addClass(self.classes.active);
                    api._trigger('apply');
                }

                // get marker current position
                var begining = $(dom).position().left,
                    start = e.pageX,
                    end;

                api.set(instance.color);

                this.mousemove = function(e) {
                    end = e.pageX || start;
                    var position = begining + end - start;
                    itself.move(instance, position, self);
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
                $(dom).focus();
                return false;
            },
            move: function(marker, position, self) {
                position = Math.max(0, Math.min(self.width, position));
                var percent = Math.round((position / self.width) * 100);

                marker.setPercent(percent);
                self.g_controll.makeGradient(self);
            },
            del: function(marker, self) {
                self.count -= 1;
                marker.$element.blur();
                marker.$element.remove();
                self.markers.splice(self.markers.indexOf(marker), 1);
            },
        },
        g_wheel: {
            init: function(self) {
                var itself = this;
                this.bind(self);

                setTimeout(function() {
                    itself.setDegree(0, self);
                    self.initialized = true;
                }, 0);
            },
            bind: function(self) {
                var itself = this;
                self.$wheel.on('mousedown.asColorInput', function(e) {
                    var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                    if (rightclick) {
                        return false;
                    }
                    itself.mousedown(e, self);
                    return false;
                });
            },
            mousedown: function(e, self) {
                var offset = self.$wheel.offset();
                var r = self.$wheel.width() / 2;
                var startX = offset.left + r;
                var startY = offset.top + r;
                var $doc = self.$doc;
                var itself = this;

                this.r = r;

                this.wheelMove = function(e) {
                    var x = e.pageX - startX;
                    var y = startY - e.pageY;
                    var position = itself.getPosition(x, y);
                    var deg = itself.calDegree(position.x, position.y);
                    itself._setDegree(deg, self);
                    var pos = itself.calPointer(deg, r);
                    self.$pointer.css({
                        left: pos.x,
                        top: pos.y
                    });
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

                // set value first
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
            _setDegree: function(deg, self) {
                self.degree = deg;
                self.$degree.val(deg);
                if (self.initialized) {
                    // avoid setting value on input element when init
                    self.g_controll.makeGradient(self);
                }
            },
            setDegree: function(deg, self) {
                if (self.degree === deg) {
                    return false;
                }
                var r = this.r || self.$wheel.width() / 2;
                var pos = this.calPointer(deg, r);
                self.$pointer.css({
                    left: pos.x,
                    top: pos.y
                });
                this._setDegree(deg, self);
            },
            calPointer: function(deg, r) {
                var x = Math.cos(deg * Math.PI / 180) * r;
                var y = Math.sin(deg * Math.PI / 180) * r;
                return {
                    x: r + x,
                    y: r - y
                };
            },
        },
        g_degree: {
            init: function(self) {
                this.bind(self);
            },
            bind: function(self) {
                self.$degree.on('blur.asColorInput', function() {
                    var deg = parseInt(this.value, 10);
                    self.g_wheel.setDegree(deg, self);
                    return false;
                }).on('keydown.asColorInput', function(e) {
                    var key = e.keyCode || e.which;
                    if (key === 13) {
                        $(this).blur();
                        return false;
                    }
                });
            }
        },
        get: function() {
            var value = this.options.format(self.value);
            return value;
        },
        destory: function() {
            this.$element.off('click');
            this.$element.remove();
        }
    });
})(jQuery);
