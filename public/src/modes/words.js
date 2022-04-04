import { compare, reset } from "../typing/input.js";

export class WordsType {
    constructor(chars, textarea, done) {
        this.i = 0;
        this.typed = 0;
        this.wrong = 0;
        
        this.chars = chars;
        this.textarea = textarea;

        this.ans = chars.map(c => c.char).join("");

        this.done = done;
        this.wpms = [];
        this.tick = 0;

        this.completed = false;

        this.textarea.maxLength = chars.length;
    }

    handler() {
        if (this.completed) return;
        if (!this.start) this.start = new Date();

        this.tick++;
        if (this.tick >= 5) {
            this.tick = 0;

            const wpm = Math.round(this.calcwpm(new Date()));
            
            this.wpms.push(wpm);
        }
        
        const val = this.textarea.value;

        let diff = compare(val);

        if (diff > 0) {
            this.append(val.slice(-diff));
        } else {
            this.delete(diff);
        }

        if (val.length == this.ans.length) {
            this.completed = true;
            
            const end = new Date();
            
            const wpm = this.calcwpm(end, true);
            this.done(this.wrong, this.typed, wpm, this.start, end, this.wpms);
        }
    }

    append(c) {
        this.typed++;
        this.wrong += this.chars[this.i]?.check(c);
        if (this.i < this.chars.length) this.i++;
    }

    delete(diff) {
        const clength = this.i;
        const start = clength - 1;
        const end = clength + diff;
        
        for (let i = start; i >= end; i--) {
            this.chars[i].backspace();
        }

        this.i += diff;
    }

    dispose() {
        this.completed = true;
        this.chars = [];
        this.wpms = [];
        reset();
    }

    calcwpm(end, w25 = false) {
        const mins100 = Math.round((end - this.start) / 60);
        const mins = mins100 / 1000;

        const ind = this.textarea.value;
        const words = w25 ? 25 : ind.split(" ").length;

        const wmin100 = Math.round((words / mins) * 100);
        const wmin = wmin100 / 100;
        
        const accuracy100 = Math.round((this.wrong / this.typed) * 100);
        const accuracy = 1 - accuracy100 / 100;
        
        const wpm = accuracy * wmin;
        
        return Math.max(wpm, 0);
    }
}
