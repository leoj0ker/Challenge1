// todo: check class names on release

/*
@keyframes x {
    from {
        opacity: 0;
        background: red;
    }
}

.x { animation: x 0.8s; }
*/
const el = document.querySelector("[title=cycles]");


const css = `iframe{display:block;width:300px;height:250px;border:none;}`;

if (location.pathname[1] != "@") {
    alert("Please go to a profile like replit.com/@Korbindev!");
} else {
    let username = location.pathname.replace(/\/@(.+?)\/?$/, "$1");
    if (!document.querySelector(".standardiframe")) document.querySelector("[title=cycles]").innerHTML += `<style>${css}</style> <iframe src="https://Challenge1.korbindev.repl.co/user/${username}?mini=1" class="standardiframe">`;
}