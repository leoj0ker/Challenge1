import { minify } from "terser";
import { readFileSync, writeFileSync } from "fs";

const code = (
    await minify(
        `${readFileSync("code.js", "utf-8")}`
    )
).code;

writeFileSync("code.txt", code);
writeFileSync("out.txt", `javascript:(()=>{${encodeURIComponent(code)}})();`);

console.log("wrote to bookmarklet/out.txt");