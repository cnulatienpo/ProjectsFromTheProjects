export function sanitizeJudgment(s:string){
  return (s || "")
    .replace(/\s+/g," ")
    .replace(/\s([,.;:!?])/g,"$1")
    .replace(/(^\s+|\s+$)/g,"")
    .trim();
}
