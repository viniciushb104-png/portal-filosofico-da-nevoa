(()=>{
'use strict';
const KEY='nevoaActivityV1';
const BASELINE_KEY='nevoaActivityBaselineV1';
const MAX=80;

function read(){
 try{
  const v=JSON.parse(localStorage.getItem(KEY)||'[]');
  return Array.isArray(v)?v:[];
 }catch(e){return []}
}
function write(list){
 try{localStorage.setItem(KEY,JSON.stringify((Array.isArray(list)?list:[]).slice(0,MAX)))}catch(e){}
}
function normalize(data={}){
 return {
  id:String(data.id||('event:'+Date.now()+':'+Math.random().toString(36).slice(2,7))),
  type:String(data.type||'progress'),
  icon:String(data.icon||'✦'),
  title:String(data.title||'Jornada atualizada'),
  text:String(data.text||''),
  xp:Number.isFinite(Number(data.xp))?Number(data.xp):null,
  ts:Number.isFinite(Number(data.ts))?Number(data.ts):Date.now(),
  legacy:!!data.legacy,
  href:data.href?String(data.href):null
 };
}
function log(data={}){
 const item=normalize(data),list=read();
 const idx=list.findIndex(x=>x.id===item.id);
 if(idx>=0){
   const current=list[idx];
   if(current.legacy&&!item.legacy){list.splice(idx,1);list.unshift(item);write(list);window.dispatchEvent(new CustomEvent('nevoa-activity',{detail:item}));return item}
   return current;
 }
 list.unshift(item);write(list);
 window.dispatchEvent(new CustomEvent('nevoa-activity',{detail:item}));
 return item;
}
function once(id,data={}){return log({...data,id})}
function list(limit=20){return read().slice(0,Math.max(1,Number(limit)||20))}
function clear(){write([]);try{localStorage.removeItem(BASELINE_KEY)}catch(e){}}
function baseline(journey){
 if(!journey||localStorage.getItem(BASELINE_KEY))return false;
 const items=[];
 const push=(id,icon,title,text,href)=>items.push({id,type:'milestone',icon,title,text,href,ts:0,legacy:true});
 if(journey.mansion?.completed)push('baseline:mansion','🏚️','Mansão de Sócrates concluída','Conquista registrada antes do início da Crônica.','#jogos');
 (journey.labyrinth?.phases||[]).forEach(p=>{if(p.done)push('baseline:lab:'+p.phase,p.icon,'Fase '+p.phase+' concluída — '+p.name,'Conquista registrada antes do início da Crônica.','jogos/plataforma-filosofica/')});
 if(journey.labyrinth?.completed)push('baseline:labmaster','🏆','Mestre do Labirinto','As cinco fases já estavam concluídas antes do início da Crônica.','universo/grimorio.html');
 if(journey.paradoxia?.completed)push('baseline:paradoxia','🎭','Cidadão de Paradoxia','O Capítulo I já estava concluído antes do início da Crônica.','jogos/paradoxia/');
 items.reverse().forEach(x=>log(x));
 try{localStorage.setItem(BASELINE_KEY,'1')}catch(e){}
 return true;
}
function formatTime(item){
 if(!item||item.legacy||!item.ts)return 'Já registrado';
 try{
   const d=new Date(item.ts),now=new Date(),same=d.toDateString()===now.toDateString();
   return same?'Hoje, '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):d.toLocaleDateString('pt-BR')+' • '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
 }catch(e){return ''}
}
window.NevoaActivity={log,once,list,clear,baseline,formatTime};
window.dispatchEvent(new Event('nevoa-activity-ready'));
})();