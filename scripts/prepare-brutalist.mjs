import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_DIRS = [
  path.join(ROOT,'brutalist'),
  path.join(ROOT,'themes','brutalist'),
  path.join(ROOT,'public','brutalist'),
];
const SRC = SRC_DIRS.find(p => { try { fs.accessSync(p); return true; } catch { return false; } });
if(!SRC){ console.error('[prep] No brutalist folder found'); process.exit(1); }

const OUT_CSS = path.join(ROOT,'src','styles','theme','brutalist-src');
const OUT_ASSETS = path.join(ROOT,'public','brutalist');

fs.rmSync(OUT_CSS,{recursive:true,force:true});
fs.rmSync(OUT_ASSETS,{recursive:true,force:true});
fs.mkdirSync(OUT_CSS,{recursive:true});
fs.mkdirSync(OUT_ASSETS,{recursive:true});

const isCSS = f => /\.css$/i.test(f);

function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const abs = path.join(dir, ent.name);
    if(ent.isDirectory()){ walk(abs); continue; }
    const rel = path.relative(SRC, abs).replace(/\\/g,'/');
    if(isCSS(abs)){
      // read+rewrite CSS (text only)
      const cssDirRel = path.posix.dirname(rel);
      let css = fs.readFileSync(abs,'utf8');
      css = css.replace(/url\(([^)]+)\)/g,(m,raw)=>{
        let v = raw.trim().replace(/^["']|["']$/g,'');
        if(v.startsWith('/') || /^data:/.test(v)) return `url(${v})`;
        return `url(${path.posix.normalize(path.posix.join('/brutalist', cssDirRel, v))})`;
      });
      const out = path.join(OUT_CSS, rel);
      fs.mkdirSync(path.dirname(out),{recursive:true});
      fs.writeFileSync(out, css, 'utf8');
      console.log('[prep][css]', rel);
    } else {
      // copy ANY non-css as raw (no reading/printing)
      const out = path.join(OUT_ASSETS, rel);
      fs.mkdirSync(path.dirname(out),{recursive:true});
      fs.copyFileSync(abs, out);
    }
  }
}
walk(SRC);

// aggregate imports (text)
const agg = path.join(ROOT,'src','styles','brutalist.css');
function listCSS(dir){
  let out=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,e.name);
    if(e.isDirectory()) out=out.concat(listCSS(p));
    else if(isCSS(p)) out.push(p);
  } return out;
}
const all = listCSS(OUT_CSS).sort((a,b)=>a.localeCompare(b));
fs.mkdirSync(path.dirname(agg),{recursive:true});
fs.writeFileSync(
  agg,
  all.map(p=>`@import "${path.relative(path.dirname(agg),p).replace(/\\/g,'/')}";`).join('\n') + '\n/* brutalist overrides last */\n',
  'utf8'
);
console.log('[prep] source:', path.relative(ROOT,SRC));
console.log('[prep] wrote:', path.relative(ROOT,agg));

