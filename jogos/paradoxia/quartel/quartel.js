(()=>{
'use strict';
const $=s=>document.querySelector(s);
const STORE='paradoxiaTacticalV1';
const CLASSES={
 dialetico:{icon:'💬',name:'Dialético',desc:'Contrapontos, cooperação e pressão argumentativa.',hp:8,sp:6,move:4,range:1,skills:['Contraponto','Cadeia de Argumentos']},
 cetico:{icon:'🔎',name:'Cético',desc:'Investigação, alcance e leitura de fraquezas.',hp:7,sp:7,move:4,range:2,skills:['Suspender o Juízo','Rastro da Evidência']},
 etico:{icon:'⚖️',name:'Guardião Ético',desc:'Proteção, área e controle de consequências.',hp:10,sp:5,move:3,range:1,skills:['Ponderação','Mapa de Consequências']},
 existencial:{icon:'🗝️',name:'Andarilho Existencial',desc:'Mobilidade, autonomia e reposicionamento.',hp:8,sp:6,move:5,range:1,skills:['Assumir a Escolha','Salto de Liberdade']}
};
let profile=null,selected=0,serverMissions=[];

function defaults(){
 let main='dialetico';
 try{const s=JSON.parse(localStorage.getItem('paradoxiaSaveV1')||'{}');if(CLASSES[s.classKey])main=s.classKey}catch(e){}
 return {version:1,party:[main,...Object.keys(CLASSES).filter(k=>k!==main)],roster:Object.fromEntries(Object.keys(CLASSES).map(k=>[k,{level:1,xp:0,equipment:[null,null,null],mastery:0}])),currency:{mist:0},updatedAt:Date.now()};
}
function normalize(p){const d=defaults();p=Object.assign(d,p||{});p.party=(p.party||d.party).filter(k=>CLASSES[k]);for(const k of Object.keys(CLASSES))if(!p.party.includes(k))p.party.push(k);p.party=p.party.slice(0,4);p.roster=Object.assign(d.roster,p.roster||{});return p}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
function saveLocal(){profile.updatedAt=Date.now();localStorage.setItem(STORE,JSON.stringify(profile))}
async function saveOnline(){saveLocal();if(!window.NevoaOnline?.getSession())return;try{await NevoaOnline.saveParadoxiaTacticalProfile(profile);$('#saveState').textContent='online';$('#saveState').classList.add('online')}catch(e){toast('Salvo localmente; nuvem indisponível.')}}

async function load(){
 let local=null;try{local=JSON.parse(localStorage.getItem(STORE)||'null')}catch(e){}
 profile=normalize(local);
 if(window.NevoaOnline?.getSession()){
  try{
   const row=await NevoaOnline.loadParadoxiaTacticalProfile();
   if(row?.profile_data){const cloud=normalize(row.profile_data);if((cloud.updatedAt||0)>(profile.updatedAt||0))profile=cloud;else await NevoaOnline.saveParadoxiaTacticalProfile(profile)}
   $('#saveState').textContent='online';$('#saveState').classList.add('online');
  }catch(e){}
 }
 try{serverMissions=await NevoaOnline?.paradoxiaMissions?.()||[]}catch(e){serverMissions=[]}
 saveLocal();render();
}
function moveSlot(i,dir){const j=i+dir;if(j<0||j>=profile.party.length)return;[profile.party[i],profile.party[j]]=[profile.party[j],profile.party[i]];selected=j;saveOnline();render()}
function renderParty(){
 $('#party').innerHTML=profile.party.map((k,i)=>{const c=CLASSES[k],r=profile.roster[k]||{};return '<article class="partyCard '+(i===selected?'active':'')+'" data-slot="'+i+'"><div class="avatar">'+c.icon+'</div><b>'+c.name+'</b><small>Nv. '+(r.level||1)+' • domínio '+(r.mastery||0)+'</small><div class="slotControls"><button data-left="'+i+'">←</button><button data-right="'+i+'">→</button></div></article>'}).join('');
 document.querySelectorAll('.partyCard').forEach(x=>x.onclick=e=>{if(e.target.tagName==='BUTTON')return;selected=Number(x.dataset.slot);render()});
 document.querySelectorAll('[data-left]').forEach(b=>b.onclick=()=>moveSlot(Number(b.dataset.left),-1));
 document.querySelectorAll('[data-right]').forEach(b=>b.onclick=()=>moveSlot(Number(b.dataset.right),1));
}
function renderDetail(){
 const k=profile.party[selected],c=CLASSES[k],r=profile.roster[k]||{};
 $('#unitDetail').innerHTML='<div class="unitHero"><div class="bigAvatar">'+c.icon+'</div><div><h2>'+c.name+'</h2><p>'+c.desc+'</p><div class="stats"><div><b>'+c.hp+'</b><small>HP</small></div><div><b>'+c.sp+'</b><small>SP</small></div><div><b>'+c.move+'</b><small>MOV</small></div><div><b>'+c.range+'</b><small>ALC</small></div></div></div></div><div class="skillList">'+c.skills.map(s=>'<span>✦ '+s+'</span>').join('')+'<span>🎒 Equipamentos: '+(r.equipment||[null,null,null]).map(x=>x||'vazio').join(' • ')+'</span></div>';
}
function renderMissions(){
 const metas=window.ParadoxiaMissions?.all||[];
 const online=Object.fromEntries(serverMissions.map(x=>[x.mission_key,x]));
 $('#missionList').innerHTML=metas.map(m=>{const s=online[m.key]||{},enabled=!!s.enabled;const href='../tatico/?mission='+encodeURIComponent(m.key);return '<article class="mission '+(enabled?'':'locked')+'"><div class="mTop"><span>'+m.icon+'</span><div><b>'+m.title+'</b><small>'+m.theme+' • '+m.kind+'</small></div></div><p>'+m.description+'</p>'+(enabled?'<a href="'+href+'">⚔️ Entrar</a>':'<button disabled>🔒 Estruturada</button>')+'</article>'}).join('');
}
function render(){renderParty();renderDetail();renderMissions()}
async function init(){await load()}
if(window.NevoaOnline)init();else window.addEventListener('nevoa-online-ready',init,{once:true});
})();