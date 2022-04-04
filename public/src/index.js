import { getCaretCoords } from "./lib/cursor-pos.js";
import { WordsType } from "./modes/words.js";
import { filterText } from "./typing/input.js";
import { generateText } from "./typing-test.js";

import "https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js";


const textarea = document.querySelector(".textarea");
const cursor = document.querySelector(".cursor");

const statsEl = document.querySelector(".stats");
const wpmEl = document.querySelector(".wpm");
const accEl = document.querySelector(".accuracy");
const pointsEl = document.querySelector(".points");

const nextText = document.querySelector(".next");
const shareEl = document.querySelector(".share");

const charCont = document.querySelector(".char-cont");

const typingCont = document.querySelector(".typing-cont");

const blur = document.querySelector(".blur-div");

const pb = document.querySelector(".pb");
const ctx = document.querySelector(".chart").getContext('2d');

let focused = true;
let stopChartInterval = false;
let globwpm, chart;


textarea.value = "";
textarea.focus();

let text = makeText();

textarea.addEventListener("keypress", e => {
    if (e.key == "Enter") {
        nextText.click();
        e.preventDefault();
    }
});

nextText.addEventListener("click", () => {
    text.dispose();
    textarea.value = "";
    statsEl.style.display = "none";
    charCont.innerHTML = "";

    if (chart) {
        stopChartInterval = true;
        chart.destroy();
    }
    
    const coords = getCaretCoords(textarea, textarea.selectionEnd, { debug: 0 });

    cursor.style.top = `${coords.top}px`;
    cursor.style.left = `${coords.left}px`;
    
    text = makeText();
});

shareEl.addEventListener("click", () => {
   window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(`I just got ${Math.floor(globwpm)} wpm on this weeks Challenge! https://Challenge1.korbindev.repl.co/`)); 
});


filterText(textarea);


const coords = getCaretCoords(textarea, textarea.selectionEnd, { debug: 0 });

cursor.style.top = `${coords.top}px`;
cursor.style.left = `${coords.left}px`;

textarea.addEventListener("input", () => {
    text.handler();

    const coords = getCaretCoords(textarea, textarea.selectionEnd, { debug: 0 });

    cursor.style.top = `${coords.top}px`;
    cursor.style.left = `${coords.left}px`;
});

textarea.addEventListener("blur", () => {
    focused = false;
    
    blur.classList.add("fade-in");
    blur.classList.remove("fade-out");
    blur.style.display = "block";
});

textarea.addEventListener("focus", () => {
    focused = true;
    
    blur.classList.add("fade-out");
    blur.classList.remove("fade-in");
})

window.addEventListener("resize", () => {
    const coords = getCaretCoords(textarea, textarea.selectionEnd);

    cursor.style.top = `${coords.top}px`;
    cursor.style.left = `${coords.left}px`;
});

typingCont.addEventListener("click", () => {
    blur.classList.remove("fade-in");
    blur.classList.add("fade-out");

    textarea.focus();
});

blur.addEventListener("animationend", () => {
    if (blur.classList.contains("fade-out")) blur.style.display = "none";
});

document.body.addEventListener("keypress", e => {
    if (!focused) {
        e.preventDefault();
        textarea.focus();
        blur.classList.remove("fade-in");
        blur.classList.add("fade-out");
    }
}, true);

function makeText() {
    const chars = generateText(25);
    
    return new WordsType(chars, textarea, (wrong, typed, wpm, start, end, wpms) => {
        // const mins100 = Math.round((end - start) / 60);
        // const mins = mins100 / 1000;
        globwpm = wpm;
        // console.log(wpm, wrong, typed, mins);
        fetch("/", {
            method: "POST",
            body: JSON.stringify({
                wrong, typed, wpm: Math.round(wpm), start: start.getTime(), end: end.getTime()
            }),
            headers: {
                "content-type": "application/json"
            }
        }).then(r => r.text()).then(r => {
            if (r == "pb") {
                pb.style.display = "block";
            }
        });
    
        statsEl.style.display = "flex";
        wpmEl.textContent = Math.round(wpm);
        accEl.textContent = Math.floor(((1 - wrong / typed) * 100));
        pointsEl.textContent = Math.floor(wpm * (typed - wrong) / 100);
    
        const labels = [...new Array(wpms.length)].map((_, i) => i + 1);
        
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'WPM over time',
                    data: wpms,
                    tension: 0.1,
                    borderColor: document.documentElement.style.getPropertyValue('--accent-primary'),
                }]
            },
            options: {
                scales: {
                    y: {
                        grid: {
                            color: localStorage.getItem("isLight") == 'true' ? '#d1cbbc' : '#292e33'
                        },
                        beginAtZero: false
                    },
                    x: {
                        grid: {
                            color: localStorage.getItem("isLight") == 'true' ? '#d1cbbc' : '#292e33'
                        }
                    }
                }
            }
        });

        let interval = setInterval(() => {
            if (stopChartInterval) clearInterval(interval);
            const bc = chart.data.datasets[0].borderColor;
            const gp = document.documentElement.style.getPropertyValue('--accent-primary');
            
            if (bc != gp) {
                chart.data.datasets[0].borderColor = gp;
                chart.options.scales['y'].grid.color = localStorage.getItem("isLight") == 'true' ? '#d1cbbc' : '#292e33';
                chart.options.scales['x'].grid.color = localStorage.getItem("isLight") == 'true' ? '#d1cbbc' : '#292e33';
                chart.update();
            }
        }, 100);
    
        document.body.addEventListener("keypress", e => {
            if (e.key == "Enter") nextText.click();
        });
    });
}
