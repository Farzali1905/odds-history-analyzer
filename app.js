// Nümunə məlumatlar yalnız demo üçündür. Real arxiv CSV ilə əlavə edilir.
const demoMatches = [
 {date:"2025-08-17",home:"Team A",away:"Team B",o1:1.44,ox:4.55,o2:5.40,ht:"1-0",ft:"2-1",htft:"1/1"},
 {date:"2025-09-03",home:"Team C",away:"Team D",o1:1.47,ox:4.48,o2:5.62,ht:"0-0",ft:"1-2",htft:"X/2"},
 {date:"2025-10-11",home:"Team E",away:"Team F",o1:1.43,ox:4.60,o2:5.35,ht:"1-0",ft:"1-2",htft:"1/2"},
 {date:"2025-11-02",home:"Team G",away:"Team H",o1:1.46,ox:4.52,o2:5.48,ht:"1-1",ft:"2-2",htft:"X/X"},
 {date:"2026-01-19",home:"Team I",away:"Team J",o1:1.45,ox:4.50,o2:5.50,ht:"0-0",ft:"2-0",htft:"X/1"},
 {date:"2026-02-07",home:"Team K",away:"Team L",o1:1.40,ox:4.70,o2:5.60,ht:"1-0",ft:"1-1",htft:"1/X"},
 {date:"2026-03-14",home:"Team M",away:"Team N",o1:1.49,ox:4.42,o2:5.52,ht:"0-1",ft:"1-2",htft:"2/2"},
 {date:"2026-04-22",home:"Team O",away:"Team P",o1:1.45,ox:4.50,o2:5.50,ht:"1-0",ft:"1-2",htft:"1/2"}
];
let archive = JSON.parse(localStorage.getItem("oddsArchive")) || [...demoMatches];

function saveArchive() {
 localStorage.setItem("oddsArchive", JSON.stringify(archive));
}
const $ = id => document.getElementById(id);
const num = v => Number(v);
function outcome(score){const [h,a]=score.split("-").map(Number);return h>a?"1":h<a?"2":"X"}
function search(){
 const target=[num($("odd1").value),num($("oddX").value),num($("odd2").value)];
 if(target.some(v=>!Number.isFinite(v)||v<1.01)){alert("Zəhmət olmasa düzgün əmsallar daxil et.");return}
 const tol=num($("tolerance").value), market=$("market").value;
 const found=archive.filter(m=>[m.o1,m.ox,m.o2].every((v,i)=>Math.abs(v-target[i])<=tol));
 const shown=market==="htft"?found:found;
 $("count").textContent=shown.length+" oyun";
 $("total").textContent=shown.length;
 $("topResult").textContent=mostCommon(shown.map(m=>outcome(m.ft)))||"—";
 $("topHtft").textContent=mostCommon(shown.map(m=>m.htft))||"—";
 $("matches").innerHTML="";
 $("empty").style.display=shown.length?"none":"block";
 shown.forEach(m=>{
  const tr=document.createElement("tr");
  tr.innerHTML=`<td>${m.date}</td><td>${escapeHtml(m.home)} – ${escapeHtml(m.away)}</td><td class="odds">${m.o1.toFixed(2)} / ${m.ox.toFixed(2)} / ${m.o2.toFixed(2)}</td><td>${m.ht}</td><td><span class="result-pill">${m.ft}</span></td><td>${m.htft}</td>`;
  $("matches").appendChild(tr);
 });
}
function mostCommon(values){if(!values.length)return "";const counts={};values.forEach(v=>counts[v]=(counts[v]||0)+1);return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0]}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("searchBtn").addEventListener("click",search);
$("csvFile").addEventListener("change",async e=>{
 const file=e.target.files[0];if(!file)return;
 try{
  const rows=(await file.text()).replace(/^\uFEFF/,"").trim().split(/\r?\n/);
  const headers=rows.shift().split(",").map(x=>x.trim().toLowerCase());
  const idx=k=>headers.indexOf(k);
  const required=["date","home","away","odd1","oddx","odd2","ht_score","ft_score","htft"];
  if(required.some(k=>idx(k)<0))throw new Error("CSV sütun adları şablondakı kimi olmalıdır.");
  const imported=rows.filter(Boolean).map(line=>{
   const c=parseCSVLine(line);
   return {date:c[idx("date")],home:c[idx("home")],away:c[idx("away")],o1:num(c[idx("odd1")]),ox:num(c[idx("oddx")]),o2:num(c[idx("odd2")]),ht:c[idx("ht_score")],ft:c[idx("ft_score")],htft:c[idx("htft")]};
  }).filter(m=>[m.o1,m.ox,m.o2].every(Number.isFinite));
  archive=[...archive,...imported]; saveArchive();$("uploadStatus").textContent=imported.length+" oyun arxivə əlavə edildi.";search();
 }catch(err){$("uploadStatus").textContent="Xəta: "+err.message;$("uploadStatus").style.color="#ff9b9b"}
});
function parseCSVLine(line){const out=[];let cur="",quote=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quote&&line[i+1]==='"'){cur+='"';i++}else quote=!quote}else if(ch===","&&!quote){out.push(cur.trim());cur=""}else cur+=ch}out.push(cur.trim());return out}
$("downloadTemplate").addEventListener("click",()=>{
 const csv="date,home,away,odd1,oddX,odd2,ht_score,ft_score,htft\n2026-01-01,Home FC,Away FC,1.45,4.50,5.50,1-0,1-2,1/2\n";
 const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="odds-history-template.csv";a.click();URL.revokeObjectURL(url);
});
search();
