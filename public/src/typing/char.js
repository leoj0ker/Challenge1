const cont = document.querySelector(".char-cont");

export class Char {
    constructor(char) {
        const el = document.createElement("span");
        el.classList.add("char");
        el.textContent = char;
        
        cont.appendChild(el);

        this.el = el;
        this.char = char;
    }

    remove() {
        this.el.remove();
        this.el = null;
    }

    backspace() {
        this.el.classList.remove("correct", "incorrect");
        this.el.textContent = this.char;
    }

    check(c) {
        if (c == this.char) {
            this.el.classList.add("correct");
            return 0;
        } else {
            this.el.classList.add("incorrect");
            this.el.textContent = c;
            return 1;
        }
    }
}