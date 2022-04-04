// useful functions for handling textarea input
let prev = "";

/**
 * Positive = +1 char
 * Negative = deleted
 * Zero = nothing
 * @param text The new text
 * @returns Difference
 */
export function compare(text) {
    const l = prev.length;
    prev = text;
    return text.length - l;
}

export function reset() {
    prev = "";
}

export function filterText(el) {
    el.addEventListener("keydown", e => {
        if (["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(e.code)) {
            e.preventDefault();
        }
    });
}