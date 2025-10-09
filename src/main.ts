import { bootApi } from "./lib/api-boot";
await bootApi();

console.info('[vite] UI booting…');
const app = document.getElementById("root");
if (app) app.innerHTML = "<h1>Literary Deviousness Vite App is running!</h1>";
