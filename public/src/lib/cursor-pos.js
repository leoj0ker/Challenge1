// credit: https://github.com/component/textarea-caret-position
let properties = [
    "direction",
    "boxSizing",
    "width",
    "height",
    "overflowX",
    "overflowY",

    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "borderStyle",

    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",

    "fontStyle",
    "fontletiant",
    "fontWeight",
    "fontStretch",
    "fontSize",
    "fontSizeAdjust",
    "lineHeight",
    "fontFamily",

    "textAlign",
    "textTransform",
    "textIndent",
    "textDecoration",

    "letterSpacing",
    "wordSpacing",

    "tabSize",
    "MozTabSize"
];

let isFirefox = false;

export function getCaretCoords(element, position, options) {
    let debug = options && options.debug || false;
    if (debug) {
        let el = document.querySelector("#input-textarea-caret-position-mirror-div");
        if (el) el.parentNode.removeChild(el);
    }

    let div = document.createElement("div");
    div.id = "input-textarea-caret-position-mirror-div";
    element.parentNode.appendChild(div);

    let style = div.style;
    let computed = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;
    let isInput = element.nodeName == "INPUT";

    // Default textarea styles
    style.whiteSpace = "pre-wrap";
    if (!isInput)
        style.wordWrap = "break-word";

    // Position off-screen
    style.position = "absolute";
    if (!debug)
        style.visibility = "hidden";

    properties.forEach(prop => {
        if (isInput && prop == "lineHeight") {
            if (computed.boxSizing == "border-box") {
                let height = parseInt(computed.height);
                let outerHeight =
                    parseInt(computed.paddingTop) +
                    parseInt(computed.paddingBottom) +
                    parseInt(computed.borderTopWidth) +
                    parseInt(computed.borderBottomWidth);
                let targetHeight = outerHeight + parseInt(computed.lineHeight);
                if (height > targetHeight) {
                    style.lineHeight = height - outerHeight + "px";
                } else if (height == targetHeight) {
                    style.lineHeight = computed.lineHeight;
                } else {
                    style.lineHeight = "0";
                }
            } else {
                style.lineHeight = computed.height;
            }
        } else {
            style[prop] = computed[prop];
        }
    });

    if (isFirefox) {
        style.overflow = "hidden";
    } else {
        style.overflow = "hidden";
    }

    div.textContent = element.value.substring(0, position);

    if (isInput)
        div.textContent = div.textContent.replace(/\s/g, "\u00a0");

    let span = document.createElement("span");

    span.textContent = element.value.substring(position) || ".";
    div.appendChild(span);

    let coordinates = {
        top: span.offsetTop + parseInt(computed["borderTopWidth"]),
        left: span.offsetLeft + parseInt(computed["borderLeftWidth"]),
        height: parseInt(computed["lineHeight"])
    };

    if (debug) {
        span.style.backgroundColor = "#aaa";
    } else {
        element.parentNode.removeChild(div);
    }

    return coordinates;
}
