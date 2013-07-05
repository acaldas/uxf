(function(jQuery) {
    jQuery.fn.uxgprint = function(method, options) {
        // the default values for the print
        var defaults = {};

        // sets the default method value
        var method = method ? method : "default";

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
        };

        /**
         * Registers the event handlers for the created objects.
         */
        var _registerHandlers = function() {
            // registers for the click event on the matched
            // object (should trigger the print)
            matchedObject.click(function() {
                        // retrieves the element reference and runs the print
                        // process on it
                        var element = jQuery(this);
                        _print(element, options);
                    });
        };

        var _print = function(matchedObject, options) {
            // retrieves the element reference and then
            // uses it to retrieve the url to the binie
            // resource containing the document description
            var element = matchedObject;
            var binieUrl = element.attr("data-binie") || options["binie"];

            // retrieves the reference to the document element
            var _document = jQuery(document);

            // tries to retrieve the reference to the
            // gateway plugin to be used for plugin calls
            var gateway = _document.uxg();

            // in case the gateway was successfully retrieved
            // time to retrieve the binie data to be printed
            if (gateway) {
                // retrieves the printing format associated
                // with the printing infra-structure of the
                // currently loaded gateway
                var format = gateway.pformat();

                // creates the initial data structure to be uses
                // to instruct the data source on how to print
                // the document and how the provided data is structured
                var data = {
                    base_64 : 1,
                    format : format
                };

                // tries to retrive the data processing method for
                // the currently defined format in case it exists
                // calls it with the data structure so that it
                // "completes" it with the "extra" data
                var method = matchedObject["uxgprint" + format];
                method && method(gateway, data);

                // runs the remote call to retrieve the binie
                // contents
                jQuery.ajax({
                    url : binieUrl,
                    data : data,
                    success : function(data) {
                        // prints the "just" received data using the
                        // gateway plugin (direct access to driver)
                        gateway.print(false, data);
                    },
                    error : function() {
                        // retrieves the body and uses it to raise an info message
                        // about the error in the retrieval of the data
                        var _body = jQuery("body");
                        _body.uxinfo(
                                "There was an error retrieving remote print data.<br />"
                                        + "Please try again latter or contact the support team.",
                                "Error", "warning");
                    }
                });
            }
            // otherwise the normal printing process must be used
            // in case a fallback url exists
            else {
                // tries to retrieve the fallback url and the
                // target for the link
                var fallbackUrl = element.attr("data-fallback")
                        || options["fallback"];
                var target = element.attr("data-target") || options["target"];

                // in case no fallback url is defined, must return
                // immediately (nothing is done)
                if (!fallbackUrl) {
                    // returns immediately, nothing can
                    // be done
                    return;
                }

                // in case the target parameter is set a new window
                // must be created with the defined target
                if (target) {
                    // creates a new window with the defined target
                    window.open(fallbackUrl, target);
                }
                // otherwise the current document is used and the location
                // on it is changed
                else {
                    // sets the new location for the document as the
                    // fallback url
                    jQuery.uxlocation(fallbackUrl);
                }
            }
        };

        // switches over the method
        switch (method) {
            case "print" :
                // runs the print process in the matched object
                _print(matchedObject, options);

                // breaks the switch
                break;

            case "default" :
                // initializes the plugin
                initialize();

                // breaks the switch
                break;
        }

        // returns the object
        return this;
    };
})(jQuery);
