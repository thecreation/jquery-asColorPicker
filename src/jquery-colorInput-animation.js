;(function(window, document, $, undefined) {
    var $doc = $(document);
    var animate = {
        
    };
    
    $doc.on('colorInput::init', function(event, instance) {
        if (instance.options.animation === true) {
            instance._keyboard = keyboard;
        }   
    });
})(window, document, jQuery);