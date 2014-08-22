// gradient

(function($) {
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

    var Gradient = function(api, options) {
        this.api = api;
        this.options = options;
        this.classes = {
            enable: api.namespace + '-gradient_enable',
            marker: api.namespace + '-gradient-marker',
            active: api.namespace + '-gradient-marker_active'
        };
        this.isOpened = false;
        this.initialized = false;
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
                self.$wrap.on('click', '.' + namespace + '-gradient-trigger', function(){
                    if (self.isOpened) {
                        self.disable();
                    } else {
                        self.enable();
                    }
                    self.api.position();
                    self.isOpened = !self.isOpened;
                    return false;
                });
                self.$wrap.on('click', '.' + namespace + '-gradient-cancel', function(){

                });
            },
            preview: {
                init: function(){
                    var that = this;
                    self.$preview = self.$gradient.find('.' + api.namespace + '-gradient-preview');

                    self.$gradient.on('update', function(e){
                        that.render();
                    });
                },
                render: function(){
                    self.$preview.css({
                        'background-image': self.gradient.toString(getPrefix()),
                    });
                    self.$preview.css({
                        'background-image': self.gradient.toString(),
                    });
                }
            },
            markers: {
                init: function(){
                    self.$markers = self.$gradient.find('.' + api.namespace + '-gradient-markers');
                },
                add: function(){

                },
                remove: function(){

                }
            },
            wheel: {
                init: function(){
                    var that = this;
                    self.$wheel = self.$gradient.find('.' + api.namespace + '-gradient-wheel');
                    self.$pointer = self.$wheel.find('i');

                    self.$gradient.on('update', function(e){
                        that.position(self.gradient.angle());
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
                        that.set(angle);
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
                set: function(value){
                    self.gradient.angle(value);
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
                    var x = Math.cos(angle * Math.PI / 180) * r;
                    var y = Math.sin(angle * Math.PI / 180) * r;
                    return {
                        x: r + x,
                        y: r - y
                    };
                }
            },
            angle: {
                init: function(){
                    var that = this;
                    self.$angle = self.$gradient.find('.' + api.namespace + '-gradient-angle');

                    self.$angle.on('blur.asColorInput', function() {
                        that.set(this.value);
                        return false;
                    }).on('keydown.asColorInput', function(e) {
                        var key = e.keyCode || e.which;
                        if (key === 13) {
                            $(this).blur();
                            return false;
                        }
                    });

                    self.$gradient.on('update', function(e){
                        self.$angle.val(self.gradient.angle());
                    });
                },
                set: function(value) {
                    self.gradient.angle(value);
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

        enable: function(){
            this.$gradient.addClass(this.classes.enable);
            if(this._last){
                this.gradient = this._last;
            } else {
                var gradient = new $.asGradient();
                gradient.append(this.api.color.toString(), 0);
                gradient.append(this.api.color.toString(), 1);
                this.gradient = gradient;
                this.$gradient.trigger('update');
            }
        },
        disable: function(){
            this.$gradient.removeClass(this.classes.enable);
            this._last = this.gradient;
            this.api.color.val(this.api.color.get(0).color.toString());
        }
    };

    $.asColorInput.registerComponent('gradient', {
        angle: 1,
        count: 0,
        markers: [],
        current: null,
        defaults: {
            triggerText: 'Gradient',
            cancelText: 'Cancel',
            format: function(value) {
                if (value) {
                    return value;
                } else {
                    return;
                }
            },
            template: function(){
                var namespace = this.api.namespace;
                return '<div class="' + namespace + '-gradient-controll">' +
                    '<a href="#" class="' + namespace + '-gradient-trigger">'+this.options.triggerText+'</a>' +
                    '<a href="#" class="' + namespace + '-gradient-cancel">'+this.options.cancelText+'</a>' +
                '</div>' +
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
            options = $.extend(this.defaults, options);
            

            api.$element.on('asColorInput::ready', function(event, instance) {
                if (instance.options.mode !== 'gradient') {
                    return;
                }

                api.gradient = new Gradient(api, options);
            });
        }
    });
})(jQuery);
