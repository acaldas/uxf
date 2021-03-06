(function(jQuery) {
    jQuery.fn.uxlchart = function(query, callback, options) {
        // the default values for the data query json
        var defaults = {};

        // sets the default options value
        var options = options ? options : {};

        // constructs the options
        var options = jQuery.extend(defaults, options);

        // sets the jquery matched object
        var matchedObject = this;

        /**
         * Initializer of the plugin, runs the necessary functions to initialize
         * the structures.
         */
        var initialize = function() {
            _appendHtml();
            _registerHandlers();
        };

        /**
         * Creates the necessary html for the component.
         */
        var _appendHtml = function() {
            matchedObject.each(function(index, element) {
                var _element = jQuery(this);
                _initialize(_element, options);
            });
        };

        /**
         * Registers the event handlers for the created objects.
         */
        var _registerHandlers = function() {};

        var _initialize = function(matchedObject, options) {
            matchedObject.prepend("<canvas></canvas>");
            var canvas = jQuery("canvas", matchedObject);
            canvas = canvas[0];
        };

        // initializes the plugin
        initialize();

        // returns the object
        return this;
    };
})(jQuery);
