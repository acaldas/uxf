(function($) {
    jQuery.fn.uxinfo = function(message, title, type, callback, options) {
        // the default values for the alert
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
            // retrieves the window (alert window) elements
            var window = jQuery(".window.window-info", matchedObject);
            if (window.length == 0) {
                window = jQuery("<div class=\"window window-info window-hide\">"
                        + "<h1></h1>" + "<p class=\"single\"></p>" + "</div>");
                window.uxwindow();
                matchedObject.append(window);
            }
            var windowHeader = jQuery("h1", window);
            var windowContents = jQuery("p", window);

            // removes the various classes from the window header and
            // then adds the appropriate class according to the type
            windowHeader.removeClass("information");
            windowHeader.removeClass("warning");
            windowHeader.addClass(type || "information");

            // processes the "wiki" message
            message = matchedObject.uxwiki(message);

            // sets the window properties and hides
            // button cancel
            windowHeader.html(title || "Information");
            windowContents.html(message);

            // shows the window
            window.uxwindow("show");
        };

        /**
         * Registers the event handlers for the created objects.
         */
        var _registerHandlers = function() {
        };

        // initializes the plugin
        initialize();

        // returns the object
        return this;
    };
})(jQuery);
