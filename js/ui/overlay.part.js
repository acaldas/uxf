/**
 * jQuery overlay plugin, this jQuery plugin provides the base infra-structure
 * for the creation of an overlay component.
 *
 * @name jquery-overlay.js
 * @author João Magalhães <joamag@hive.pt>
 * @version 1.0
 * @category jQuery plugin
 * @copyright Copyright (c) 2008-2015 Hive Solutions Lda.
 * @license Hive Solutions Confidential Usage License (HSCUL) -
 *          http://www.hive.pt/licenses/
 */
(function(jQuery) {
    jQuery.fn.uxoverlay = function(options) {
        // the default values for the overlay
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
            // resizes the overlay in the screen, this is the initial
            // operation so that it becomes of the correct size, then
            // adds the resizable class to the current element to identify
            // the element as an element that is meant to be resizes, this
            // is imporant to avoid error in the resize operations
            _resize(matchedObject, options);
            __transition(matchedObject, options, 0);
            matchedObject.addClass("resizable");

            // iterates over the complete set of overlay elements to be
            // able to populate the original opacity value for each of
            // them and then sets the zero based opacity value (initial value)
            matchedObject.each(function(index, element) {
                        var _element = jQuery(this);
                        var target = _element.css("opacity") || "1";
                        var targetF = parseFloat(target);
                        _element.data("original", targetF);
                        _element.css("opacity", "0");
                    });
        };

        /**
         * Registers the event handlers for the created objects.
         */
        var _registerHandlers = function() {
            // retrieves the window
            var _window = jQuery(window);

            // registers the ready event in the window, avoids
            // possible initial resize problem
            _window.ready(function(event) {
                        // resizes the overlay in the screen
                        _resize(matchedObject, options);
                    });

            // registers the laod event in the window, avoids
            // possible initial resize problem
            _window.load(function(event) {
                        // resizes the overlay in the screen
                        _resize(matchedObject, options);
                    });

            // registers the resize in the window, this is a custom
            // event triggered at the correct timing of the window
            // sizing workflow, this will trigger a delayed based
            // resizing operation on the oeverlay element
            _window.bind("size", function(event) {
                        // resizes the overlay in the screen
                        _resizeDelay(matchedObject, options);
                    });

            // registers for the click event so that
            // no propagation of it is done
            matchedObject.click(function(event) {
                        // stops the event propagation, no need to propagate
                        // clicks to the upper levels
                        event.stopPropagation();
                    });

            // registers for the toggle (visibility) event so that the proper
            // hide operation is performed in the associated overlay
            matchedObject.bind("toggle", function(event, timeout) {
                        var element = jQuery(this);
                        _toggle(element, options, timeout);
                    });

            // registers for the show event so that the proper
            // hide operation is performed in the associated overlay
            matchedObject.bind("show", function(event, timeout) {
                        var element = jQuery(this);
                        _show(element, options, timeout);
                    });

            // registers for the hide event so that the proper
            // hide operation is performed in the associated overlay
            matchedObject.bind("hide", function(event, timeout) {
                        var element = jQuery(this);
                        _hide(element, options, timeout);
                    });

            // registers for the resize event on the overlayy
            // so that the overlay may be resized in for such events
            matchedObject.bind("resize", function() {
                        // retrieves teh current element and uses it
                        // resize the overlay in the screen
                        var element = jQuery(this);
                        _resize(element, options);
                    });

            // registers for the transition end envet so that the
            // visual state of the element is properly updated
            matchedObject.bind("transitionend", function(event) {
                        var element = jQuery(this);
                        var transition = element.data("transition");
                        if (transition != "fadeout") {
                            return;
                        }
                        element.hide();
                        element.removeData("transition");
                    });
        };

        var _toggle = function(matchedObject, options, timeout) {
            // in case the matched object is visible hides the
            // overlay otherwise shows it (opposite operation)
            if (matchedObject.is(":visible")) {
                _hide(matchedObject, options, timeout);
            } else {
                _show(matchedObject, options, timeout);
            }
        };

        var _show = function(matchedObject, options, timeout) {
            // shows the matched object and then runs
            // the show operation for the overlay element
            _resize(matchedObject, options);
            __fadeIn(matchedObject, options, timeout || 250, true);
        };

        var _hide = function(matchedObject, options, timeout) {
            // hides the matched object, using the default
            // strategy for such operation (as expected)
            __fadeOut(matchedObject, options, timeout || 100, true);
        };

        var _resize = function(matchedObject, options) {
            // retrieves the document and the window
            // element references
            var _document = jQuery(document);
            var _window = jQuery(window);

            // resets the dimensions of the overlay
            // to avoid problems in the document size
            matchedObject.width(0);
            matchedObject.height(0);

            // retrieves the document dimensions, in case
            // the current browser is the internet explorer
            // the window width is used (to avoid the well
            // internet explorer's overflow width bug)
            var documentWidth = jQuery.browser.msie
                    ? _window.width()
                    : _document.width();
            var documentHeight = _document.height();

            // sets the "new" matched object dimensions,
            // using the document as reference
            matchedObject.width(documentWidth);
            matchedObject.height(documentHeight);
        };

        var _resizeDelay = function(matchedObject, options) {
            setTimeout(function() {
                        _resize(matchedObject, options);
                    });
        };

        var __fadeIn = function(matchedObject, options, timeout, useHardware) {
            matchedObject.data("transition", "fadein");
            if (useHardware) {
                var original = matchedObject.data("original");
                __transitionDuration(matchedObject, options, timeout);
                matchedObject.show();
                matchedObject.css("opacity", String(original));
            } else {
                matchedObject.fadeIn(timeout, function() {
                            matchedObject.removeData("transition");
                        });
            }
        };

        var __fadeOut = function(matchedObject, options, timeout, useHardware) {
            matchedObject.data("transition", "fadeout");
            if (useHardware) {
                __transitionDuration(matchedObject, options, timeout);
                matchedObject.css("opacity", "0");
            } else {
                matchedObject.fadeIn(timeout, function() {
                            matchedObject.removeData("transition");
                        });
            }
        };

        var __transition = function(matchedObject, options, timeout) {
            var value = "opacity " + String(timeout) + "ms ease-in-out";
            matchedObject.css("transition", value);
            matchedObject.css("-webkit-transition", value);
            matchedObject.css("-moz-transition", value);
            matchedObject.css("-o-transition", value);
            matchedObject.css("-ms-transition", value);
        };

        var __transitionDuration = function(matchedObject, options, timeout) {
            var value = String(timeout) + "ms";
            matchedObject.css("transition-duration", value);
            matchedObject.css("-webkit-transition-duration", value);
            matchedObject.css("-moz-transition-duration", value);
            matchedObject.css("-o-transition-duration", value);
            matchedObject.css("-ms-transition-duration", value);
        };

        // initializes the plugin
        initialize();

        // returns the object
        return this;
    };
})(jQuery);
