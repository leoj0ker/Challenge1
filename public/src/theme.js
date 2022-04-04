/*
credit: unnospid
*/

const light = {
    "--background-primary": "#E2D8C0",
    "--background-primaryt": "#E2D8C000",
    "--background-secondary": "#DCCDAA",
    
    "--accent-primary": "#827A5A",
    "--accent-primary-hover": "#6A6449",
    
    "--accent-secondary": "#000",
    
    "--accent-positive": "#477848",
    "--accent-negative": "#AC3829",

    "--text-foreground": "#000",
};

const dark = {
    "--background-primary": '#121212',
    "--background-primaryt": '#12121200',
    "--background-secondary": '#212121',
    "--accent-primary": '#627D98',
    "--accent-primary-hover": '#829AB1',
    "--accent-secondary": '#d1dce8',
    "--accent-positive": '#00892b',
    "--accent-negative": '#C62828',

    "--text-foreground": "#D2D2D2",
};
let isLight = (localStorage.getItem("isLight") || 'true') == 'true';
theme(isLight ? light : dark);
    
function theme(color) {
    for (const key in color) {
        document.documentElement.style.setProperty(key, color[key]);
    }
}


window.onload = () => {
    const el = document.querySelector(".theme-btn");
    const icon = document.querySelector(".theme-icon");
    
    function handler() {
        theme(isLight ? light : dark);
        icon.setAttribute("name", isLight ? "sunny" : "moon");
    }
    
    handler();
    
    el.addEventListener("click", () => {
        isLight = !isLight;
        localStorage.setItem("isLight", isLight);
        handler();
    });
};