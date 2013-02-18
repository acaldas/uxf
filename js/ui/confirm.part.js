(function(jQuery) {
    jQuery.fn.uxconfirm = function(message, callback, options) {
        // the default values for the confirm
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
            var window = jQuery(".window.window-alert", matchedObject);
            var windowHeader = jQuery("h1", window);
            var windowContents = jQuery("p", window);
            var windowButtonConfirm = jQuery(".button-confirm", window);
            var windowButtonCancel = jQuery(".button-cancel", window);

            // processes the "wiki" message
            message = matchedObject.uxwiki(message);

            // sets the window properties and shows
            // button cancel
            windowHeader.html("Confirm");
            windowContents.html(message);
            windowButtonCancel.show();

            // shows the window
            window.uxwindow("show");
        };

        /**
         * Registers the event handlers for the created objects.
         */
        var _registerHandlers = function() {
            // retrieves the window (alert window) elements
            var window = jQuery(".window.window-alert", matchedObject);
            var windowButtonConfirm = jQuery(".button-confirm", window);
            var windowButtonCancel = jQuery(".button-cancel", window);

            // registers for the click event on the button confirm
            windowButtonConfirm.click(function() {
                        // retrieves the element
                        var element = jQuery(this);

                        // retrieves the associated window
                        var window = element.parents(".window");

                        // hides the window and calls the
                        // callback if defined
                        window.uxwindow("hide");
                        callback && callback(true);
                    });

            // registers for the click event on the button cancel
            windowButtonCancel.click(function() {
                        // retrieves the element
                        var element = jQuery(this);

                        // retrieves the associated window
                        var window = element.parents(".window");

                        // hides the window and calls the
                        // callback if defined
                        window.uxwindow("hide");
                        callback && callback(false);
                    });
        };

        // initializes the plugin
        initialize();

        // returns the object
        return this;
    };
})(jQuery);
