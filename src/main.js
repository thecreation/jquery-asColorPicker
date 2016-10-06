import $ from 'jquery';
import AsColorPicker from './asColorPicker';
import info from './info';

const NAMESPACE = 'asColorPicker';
const OtherAsColorPicker = $.fn.asColorPicker;

const jQueryAsColorPicker = function(options, ...args) {
  if (typeof options === 'string') {
    const method = options;

    if (/^_/.test(method)) {
      return false;
    } else if ((/^(get)/.test(method))) {
      const instance = this.first().data(NAMESPACE);
      if (instance && typeof instance[method] === 'function') {
        return instance[method](...args);
      }
    } else {
      return this.each(function() {
        const instance = $.data(this, NAMESPACE);
        if (instance && typeof instance[method] === 'function') {
          instance[method](...args);
        }
      });
    }
  }

  return this.each(function() {
    if (!$(this).data(NAMESPACE)) {
      $(this).data(NAMESPACE, new AsColorPicker(this, options));
    }
  });
};

$.fn.asColorPicker = jQueryAsColorPicker;

$.asColorPicker = $.extend({
  setDefaults: AsColorPicker.setDefaults,
  registerComponent: AsColorPicker.registerComponent,
  noConflict: function() {
    $.fn.asColorPicker = OtherAsColorPicker;
    return jQueryAsColorPicker;
  }
}, info);
