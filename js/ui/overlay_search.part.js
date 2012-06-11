/**
 * jQuery overlay search plugin, this jQuery plugin provides the base
 * infra-structure for the creation of an overlay search component.
 *
 * @name jquery-overlay-search.js
 * @author João Magalhães <joamag@hive.pt>
 * @version 1.0
 * @date March 10, 2010
 * @category jQuery plugin
 * @copyright Copyright (c) 2010 Hive Solutions Lda.
 * @license Hive Solutions Confidential Usage License (HSCUL) -
 *          http://www.hive.pt/licenses/
 */
(function($) {
    jQuery.fn.uxoverlaysearch = function(options) {
        // the default values for the plugin
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
        };

        /**
         * Registers the event handlers for the created objects.
         */
        var _registerHandlers = function() {
            // retrieves the text field for the matched object
            var textField = jQuery(".text-field", matchedObject);

            // registers for the key down event in the overlay
            // search text field
            textField.keydown(function(event) {
                        // retrieves the element
                        var element = jQuery(this);

                        // retrieves the parent overlay search
                        var overlaySearch = element.parents(".overlay-search");

                        // retrieves the key value
                        var keyValue = event.keyCode
                                ? event.keyCode
                                : event.charCode ? event.charCode : event.which;

                        // in case the escape key is pressed
                        // need to hide the overlay search
                        if (keyValue == 27) {
                            // hides the overlay search
                            _hide(overlaySearch, options);
                        }
                    });
        };

        var _hide = function(matchedObject, options) {
            // retrieves the overlay element
            var overlay = jQuery(".overlay");

            // shows the overlay
            overlay.fadeOut(200);

            // hidrs the matched object
            matchedObject.fadeOut(200);
        };

        // initializes the plugin
        initialize();

        // returns the object
        return this;
    };
})(jQuery);
