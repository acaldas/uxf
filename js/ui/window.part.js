/**
 * jQuery window plugin, this jQuery plugin provides the base infra-structure
 * for the creation of a window component.
 *
 * @name jquery-window.js
 * @author João Magalhães <joamag@hive.pt>
 * @version 1.0
 * @category jQuery plugin
 * @copyright Copyright (c) 2008-2016 Hive Solutions Lda.
 * @license Apache License, Version 2.0 - http://www.apache.org/licenses/
 */
(function(jQuery) {
    jQuery.fn.uxwindow = function(method, options) {
        // the default timeout to be applied while limiting
        // the dimensions of the window
        var DEFAULT_PADDING = 0;

        // the default values for the window
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
            // tries to find the window mask
            var windowMask = jQuery(".window-mask", matchedObject);
            var windowMaskExists = windowMask.length > 0;

            // retrieves the reference for both the close and the accept
            // button for the window as they are going to be marked as
            // window buttons for future reference
            var closeButton = jQuery(".close-button", matchedObject);
            var acceptButton = jQuery(".accept-button", matchedObject);
            closeButton.data("window_button", true);
            acceptButton.data("window_button", true);

            // adds the window mask to the window in case it does not exist
            !windowMaskExists
                && matchedObject.append("<div class=\"window-mask\">" +
                    "<div class=\"window-mask-contents\">Loading " +
                    "<span class=\"window-mask-dots\"></span>" + "</div>" + "</div>");

            // positions the window
            _positionWindow(matchedObject, options);
        };

        /**
         * Registers the event handlers for the created objects.
         */
        var _registerHandlers = function() {
            // retrieves the top level elements that are going
            // to be used on the event registration steps
            var _window = jQuery(window);
            var _body = jQuery("body");

            // retrieves the references to both the close and
            // the accept buttons to be used in the registration
            var closeButton = jQuery(".close-button", matchedObject);
            var acceptButton = jQuery(".accept-button", matchedObject);

            // gathers references to any underlying form element in the
            // current window to handle it's events
            var form = jQuery("form", matchedObject);

            // registers for the click in the close button
            closeButton.click(function(event) {
                // retrieves the element and uses it
                // to retrieve the parent window
                var element = jQuery(this);
                var window = element.parents(".window");

                // hides the window with the success flag
                // set to invalid
                _hide(window, options, false);
            });

            // registers for the click in the accept button
            acceptButton.click(function(event) {
                // retrieves the element and uses it
                // to retrieve the parent window
                var element = jQuery(this);
                var window = element.parents(".window");

                // hides the window with the success flag
                // set to valid
                _hide(window, options, true);
            });

            // registers for the success event triggered when
            // an async based form has completed the submission
            form.bind("success", function() {
                // retrieves the reference to the current form element
                // and uses it to gather the parent window and hides it
                // but just in case there's no form success
                var element = jQuery(this);
                var formSuccess = jQuery(".form-success", element);
                var shouldHide = formSuccess.length == 0;
                var window = element.parents(".window");
                shouldHide && window.uxwindow("hide");
            });

            // registers for the click event in the matched
            // object, to avoid event propagation
            matchedObject.click(function(event) {
                // stops the event propagation, no need
                // to propagate the click to the upper levels
                event.stopPropagation();
            });

            // iterates over all the elements in the matched object
            matchedObject.each(function(index, element) {
                // retrieves the element reference
                var _element = jQuery(element);

                // registers the resize in the window
                // should keep the window centered
                _window.resize(function(event) {
                    // positions the window in the screen
                    // runs it using a delayed approach just
                    // to make sure the size is not modified meanwhile
                    _positionWindow(_element, options);
                    _positionDelay(_element, options);
                });

                // registers the scroll in the window
                // should keep the window centered
                _window.scroll(function() {
                    // positions the window in the screen
                    _positionWindow(_element, options);
                });

                // registers for the global hide modal event
                // so that the window is properly hidden
                _body.bind("hide_modal", function() {
                    // runs the hide operation for the current
                    // window in clojure
                    _hide(_element, options, false);
                });

                // registers the changing of contents in
                // the internal structure of the window
                _element.bind("layout", function() {
                    // positions the window in the screen
                    _positionWindow(_element, options);
                });

                // registers for the refresh event in the current
                // element so that the internal structures are updated
                // with the new elements added, for instance event
                // handling registration is performed
                _element.bind("refresh", function() {
                    // registers the new element for the window buttons only
                    // for the new added elements
                    _registerButtons(_element, options);
                });
            });
        };

        var _show = function(matchedObject, options) {
            // retrieves the overlay element and in case it's not present
            // creates a default element adding it to the start of the
            // top level body element (default behaviour)
            var overlay = jQuery(".overlay:first");
            if (overlay.length == 0) {
                var _body = jQuery("body");
                overlay = jQuery("<div id=\"overlay\" class=\"overlay\"></div>");
                overlay.uxoverlay();
                _body.prepend(overlay);
            }

            // triggers the resize event on the overlay in order
            // to force a resize on it to ensure dimensions
            // (ensures proper "final" size)
            overlay.triggerHandler("resize");

            // makes sure that the current object is the only visible
            // window on the screen (ensures modal visibility)
            var pending = __ensureModal(matchedObject, options);
            if (pending) {
                return;
            }

            // shows the overlay and shows at the same time the
            // current object (window)
            overlay.triggerHandler("show", [250]);
            matchedObject.fadeIn(250);

            // registers for the click event on the global overlay
            // so that the window hides in such case
            __registerClick(matchedObject, options);

            // registers for the key event for the dismissal
            // of the window on the key press
            __registerKey(matchedObject, options);

            // positions the window in the screen
            _positionWindow(matchedObject, options);

            // starts the various forms components contained
            // in the window should reset the form to its
            // original values and layout
            _startForm(matchedObject, options);

            // triggers the show handler so that any handler
            // may be notified about the visibility change
            matchedObject.triggerHandler("show");
        };

        var _hide = function(matchedObject, options, success) {
            // retrieves the overlay element
            var overlay = jQuery(".overlay:first");

            // unregisters from the click event on the global overlay
            // so that the windows stop respoding from the event
            __unregisterClick(matchedObject, options);

            // unregisters from the key event for the dismissal
            // of the window on the key press
            __unregisterKey(matchedObject, options);

            // hides the overlay and hides at the same time the
            // current object (window)
            overlay.triggerHandler("hide", [250]);
            matchedObject.fadeOut(250);

            // retrieves the appropriate name for the event to be
            // triggered indicating the state the window has closed,
            // note that the options map is used for the fallback
            var name = options["reason"] || "cancel";
            name = success ? "success" : name;

            // triggers the hide handler so that any handler
            // may be notified about the visibility change
            matchedObject.triggerHandler("hide");
            matchedObject.triggerHandler(name);
        };

        var _showMask = function(matchedObject, options) {
            // retrieves the window mask
            var mask = jQuery(".window-mask", matchedObject);

            // resizes the mask
            _resizeMask(matchedObject, options);

            // sets the interval for dot update
            var intervalHandler = setInterval(function() {
                __updateDots(matchedObject, options);
            }, 500);

            // shows the window mask
            mask.fadeIn(250);

            // sets the interval handler in the mask
            mask.data("interval_handler", intervalHandler)
        };

        var _hideMask = function(matchedObject, options) {
            // retrieves the window mask
            var mask = jQuery(".window-mask", matchedObject);

            // retrieves the interval handler
            var intervalHandler = mask.data("interval_handler");
            window.clearInterval(intervalHandler);

            // hides the window mask
            mask.fadeOut(250);
        };

        var _positionWindow = function(matchedObject, options, noLimit) {
            // in case the no limit flag is unset limits the size
            // of the current window according to the global window
            // and then runs the centering operation in the window
            !noLimit && _limitWindow(matchedObject, options);
            matchedObject.uxcenter();
        };

        var _positionDelay = function(matchedObject, options) {
            setTimeout(function() {
                _positionWindow(matchedObject, options);
            });
        };

        var _limitWindow = function(matchedObject, options) {
            // retrieves the reference to the global window that
            // is going to be used in the measures
            var _window = jQuery(window);

            // retrieves the padding value that is going to be used
            // in the limits of the window, then it tries to parse
            // the string value and in case it fails fallsback to the
            // default value (as expected by behaviour)
            var padding = matchedObject.attr("data-padding") || String(DEFAULT_PADDING);
            padding = parseInt(padding);
            padding = isNaN(padding) ? DEFAULT_PADDING : padding;

            // retrieves the dimensions of the global window and then
            // calculates the delta values for margins in the element
            var windowWidth = _window.width();
            var windowHeight = _window.height();
            var extraWidth = matchedObject.outerWidth(false) - matchedObject.width();
            var extraHeight = matchedObject.outerHeight(false) - matchedObject.height();

            // determines if the current element/object is currently
            // sized using content box and if that's the case reduces
            // the available dimensions with the extra (margin) value
            var boxSizing = matchedObject.css("box-sizing");
            var isContentBox = boxSizing == "content-box";
            var maxWidth = isContentBox ? windowWidth - extraWidth : windowWidth;
            var maxHeight = isContentBox ? windowHeight - extraHeight : windowHeight;

            // decrements both the dimensions by twice the value of
            // the paddin for both sides of the dimension
            maxWidth -= padding * 2;
            maxHeight -= padding * 2;

            // updates the maximum dimensioons of the window according to the
            // available space from the containing window
            matchedObject.css("max-width", maxWidth + "px");
            matchedObject.css("max-height", maxHeight + "px");
        };

        var _resizeMask = function(matchedObject, options) {
            // retrieves the window mask
            var mask = jQuery(".window-mask", matchedObject);

            // retrieves the matched object dimensions
            var matchedObjectWidth = matchedObject.width();
            var matchedObjectHeight = matchedObject.height();

            // sets the mask dimensions
            mask.width(matchedObjectWidth);
            mask.height(matchedObjectHeight);
        };

        var _startForm = function(matchedObject, options) {
            // retrieves the complete set of forms currently defined
            // in the window and runs the proper operations for each
            var forms = jQuery(".form", matchedObject);
            forms.each(function(index, element) {
                var _element = jQuery(this);
                _element.triggerHandler("reset");
            });

            // retrieves the complete set of fields (form fields)
            // for the current window and then retrieves the first
            // of these elements (to be focused)
            var fields = matchedObject.uxfields()
            var first = jQuery(fields[0]);

            // resets the complete set of form fields and then
            // focus the control on the first field of the window
            // form, providing a rapid interaction scheme for
            // the end user (form reset operation)
            fields.uxreset();
            first.uxfocus();
        };

        var __updateDots = function(matchedObject, options) {
            // retrieves the window mask dots
            var windowMaskDots = jQuery(".window-mask-dots", matchedObject);

            // retrieves the window mask dots contents and length
            var windowMaskDotsContents = windowMaskDots.html();
            windowMaskDotsContentsLength = windowMaskDotsContents.length;

            // in case the dots contents length overflows
            if (windowMaskDotsContentsLength == 3) {
                // resets the dots contents length
                windowMaskDotsContentsLength = 0;
            }
            // otherwise it's a normal increments of dots
            else {
                // increments the dots contents length
                windowMaskDotsContentsLength++;
            }

            // starts the "new" window mask dots contentes
            var windowMaskDotsContents = "";

            // iterates over the dots contents range
            for (index = 0; index < windowMaskDotsContentsLength; index++) {
                // adds a new dot to the contents
                windowMaskDotsContents += "."
            }

            // updates the window mask dots contents
            windowMaskDots.html(windowMaskDotsContents)
        };

        var __registerClick = function(matchedObject, options) {
            // retrieves the overlay element and registers for
            // the click event on it in order to hide the current
            // window then stores it in the data element
            var overlay = jQuery(".overlay:first");
            var handler = function() {
                var isHiddable = matchedObject.hasClass("window-hide");
                if (!isHiddable) {
                    return;
                }
                matchedObject.uxwindow("hide");
            };
            overlay.click(handler);
            matchedObject.data("click_handler", handler);
        };

        var __unregisterClick = function(matchedObject, options) {
            // retrieves the global overlay and the handle to the
            // callback function then unbinds it from the click
            // even on the overlay
            var overlay = jQuery(".overlay:first");
            var handle = matchedObject.data("click_handler");
            overlay.unbind("click", handle);
        };

        var __registerKey = function(matchedObject, options) {
            // retrieves the reference to the document element
            // and registers for the key press event on it and
            // sets the key handler in handler key for the
            // current matched object
            var _document = jQuery(document);
            var handler = _document.keydown(function(event) {
                // retrieves the key value
                var keyValue = event.keyCode ? event.keyCode : event.charCode ? event.charCode :
                    event.which;

                // switches over the key value
                switch (keyValue) {
                    case 27:
                        _hide(matchedObject, options, false);
                        break;
                }
            });
            matchedObject.data("key_handler", handler);
        };

        var __unregisterKey = function(matchedObject, options) {
            // retrieves the reference to the global document
            // element and then unregisters the key down event
            // handler from it (avoid duplicated events)
            var _document = jQuery(document);
            var handle = matchedObject.data("key_handler");
            _document.unbind("keydown", handle);
        };

        var _registerButtons = function(matchedObject, options) {
            // retrieves the references to both the close and
            // the accept buttons to be used in the registration
            var closeButton = jQuery(".close-button", matchedObject);
            var acceptButton = jQuery(".accept-button", matchedObject);

            // iterates over each of the close button to verify if
            // they've already been registered and if they've not
            // registers them for the first time
            closeButton.each(function(index, element) {
                // retrieves the current element in iteration and verifies
                // if it has already been registered as a window button,
                // returning immediately if it has been
                var _element = jQuery(this);
                var registered = _element.data("window_button");
                if (registered) {
                    return;
                }

                // registers for the click even in the element
                // so that the window is closed on click returning
                // false (no success in form submission)
                _element.click(function(event) {
                    // retrieves the element and uses it
                    // to retrieve the parent window
                    var element = jQuery(this);
                    var window = element.parents(".window");

                    // hides the window with the success flag
                    // set to invalid
                    _hide(window, options, false);
                });
            });

            // iterates over all the accept buttons to try to find out the
            // ones that have not been registered as window buttons and for
            // those register the proper click event handler
            acceptButton.each(function(index, element) {
                // retrieves the current element in iteration and verifies
                // if it has already been registered as a window button,
                // returning immediately if it has been
                var _element = jQuery(this);
                var registered = _element.data("window_button");
                if (registered) {
                    return;
                }

                // registers for the click even in the element
                // so that the window is closed on click returning
                // true (correct form submission)
                _element.click(function(event) {
                    // retrieves the element and uses it
                    // to retrieve the parent window
                    var element = jQuery(this);
                    var window = element.parents(".window");

                    // hides the window with the success flag
                    // set to valid
                    _hide(window, options, true);
                });
            });

            // sets the window button submission flag in the complete set
            // of window buttons as they all have been registered
            closeButton.data("window_button", true);
            acceptButton.data("window_button", true);
        };

        var __ensureModal = function(matchedObject, options) {
            // retrieves the current visible set of windows (only
            // one should be visible at a certain time)
            var visibleWindow = jQuery(".window:visible");
            if (visibleWindow.length == 0) {
                return false;
            }

            // hides the current set of windows that are visible and
            // at the end of the hide operation shows the window
            visibleWindow.fadeOut(150, function() {
                matchedObject.uxwindow("show");
            });
            return true;
        };

        // switches over the method
        switch (method) {
            case "show":
                // shows the matched object
                _show(matchedObject, options);

                // breaks the switch
                break;

            case "hide":
                // hides the matched object
                _hide(matchedObject, options);

                // breaks the switch
                break;

            case "show_mask":
                // shows the mask in the matched object
                _showMask(matchedObject, options);

                // breaks the switch
                break;

            case "hide_mask":
                // hide the mask in the matched object
                _hideMask(matchedObject, options);

                // breaks the switch
                break;

            case "default":
                // initializes the plugin
                initialize();

                // breaks the switch
                break;
        }

        // returns the object
        return this;
    };
})(jQuery);
