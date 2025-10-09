const fs=require("fs");const path=require("path");const dir=path.join(process.cwd(),"docs");
if(!fs.existsSync(dir)){console.log("No docs/ directory; skipping guard.");process.exit(0);}
const files=fs.readdirSync(dir).filter(f=>f.endsWith(".md"));const bad=[];
for(const f of files){const p=path.join(dir,f);const txt=fs.readFileSync(p,"utf8");const re=/```\s*(ts|tsx|typescript|js|javascript)[\s\S]*?```/gi;if(re.test(txt))bad.push(f);}
if(bad.length){console.error("Docs contain executable code blocks (ts/js). Move code into src/:");bad.forEach(b=>console.error(" - "+b));process.exit(1);}else{console.log("Docs OK: no executable code blocks found.");}
