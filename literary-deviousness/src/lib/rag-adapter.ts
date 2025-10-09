import type { RagQuery, RagResult, RagDimensionScore, RagCitation, RagEvidence } from "@/lib/rag-types";
function clamp(n: any){const x=Number(n);return isFinite(x)?Math.max(0,Math.min(1,x)):0.5;}
function normDims(d:any):RagDimensionScore[]{if(!Array.isArray(d))return[];return d.map((x:any)=>({name:String(x?.name??x?.key??"Unknown"),score:clamp(x?.score??x?.value??x?.rating??0.5),rationale:String(x?.rationale??x?.why??x?.note??"")}));}
function normCites(c:any):RagCitation[]{if(!Array.isArray(c))return[];return c.map((x:any,i:number)=>({id:String(x?.id??`c${i}`),title:String(x?.title??x?.name??"Context"),snippet:String(x?.snippet??x?.text??"").slice(0,240),score:clamp(x?.score??x?.relevance??0.5)}));}
function normEvid(e:any):RagEvidence[]{if(!Array.isArray(e))return[];return e.map((x:any)=>({quote:String(x?.quote??x?.span??"").slice(0,180),note:String(x?.note??x?.why??""),start:typeof x?.start==="number"?x.start:undefined,end:typeof x?.end==="number"?x.end:undefined}));}
/** Attempts to import ragGrader.ts and normalize to RagResult. */
export async function tryGradeWithRagGrader(q:RagQuery,contexts:{title:string;text:string}[]):Promise<RagResult|null>{
  let mod:any=null; try{mod=await import("@/ragGrader");}catch{try{mod=await import("../../ragGrader");}catch{}}
  if(!mod) return null; const fn=(mod.grade||mod.evaluate||mod.score||mod.default); if(typeof fn!=="function") return null;
  let raw:any; try{raw=await fn({text:q.text,level:q.level,writerType:q.writerType,contexts});}
  catch{try{raw=await fn(q.text,{level:q.level,writerType:q.writerType,contexts});}
  catch{try{raw=await fn(q.text,contexts,q.level,q.writerType);}catch{return null;}}}
  if(raw&&typeof raw==="object"&&"overall"in raw&&"dimensions"in raw&&"tips"in raw){
    return {overall:clamp(raw.overall),dimensions:normDims(raw.dimensions),flags:Array.isArray(raw.flags)?raw.flags:[],tips:Array.isArray(raw.tips)?raw.tips:[],citations:normCites(raw.citations),evidence:normEvid(raw.evidence),model:String(raw.model||"ragGrader"),debug:{...(raw.debug||{}),usedOfflineMock:false}};
  }
  return {overall:clamp(raw?.score??raw?.overall??0.5),dimensions:normDims(raw?.axes??raw?.dimensions??[]),flags:Array.isArray(raw?.flags)?raw.flags:[],tips:Array.isArray(raw?.suggestions)?raw.suggestions:Array.isArray(raw?.tips)?raw.tips:[],citations:normCites(raw?.sources??raw?.citations),evidence:normEvid(raw?.evidence),model:"ragGrader",debug:{from:"ragGrader-mapped",usedOfflineMock:false}};
}
