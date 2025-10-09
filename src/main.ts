import { bootApi } from "./lib/api-boot";
await bootApi();

const app = document.getElementById("app");
if (app) app.innerHTML = "<h1>Literary Deviousness Vite App is running!</h1>";
