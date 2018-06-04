import Vue from "vue";
import jQuery from "jquery";

import {
    UxButton,
    UxDropDown
} from "./ui";

import "../examples/vue/ux.ico";

window.$ = window.jQuery = jQuery;

export const examples = function() {
    const app = new Vue({
        el: "#app",
        components: {
            UxButton,
            UxDropDown
        },
        data: {
            items: [{
                text: "first",
                value: "first"
            }, {
                text: "second",
                value: "second"
            }, {
                text: "third",
                value: "third"
            }]
        },
        methods: {
            onClick: function(value) {
                alert(`Clicked: ${value || "normal"}`);
            },
            onValueChange: function(value) {
                alert(`Selected: ${value}`);
            }
        }
    });
    return app;
};

export default examples;
