(()=>{
'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const typeLabel={puzzle:'PUZZLE',platform:'PLATAFORMA',hybrid:'HÍBRIDA'};
let scope='global',stopWatch=null,serverMissions=[];

function fmtDate(v){
 if(!v)return '—';
 try{return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(v))}catch(e){return '—'}
}
function renderMissionCards(){
 const host=$('#competitionMissions');if(!host)return;
 const meta=window.ParadoxiaMissions?.all||[];
 const online=Object.fromEntries(serverMissions.map(x=>[x.mission_key,x]));
 host.innerHTML=meta.map(m=>{
   const s=online[m.key]||{};
   const best=Number(s.best_score)||0, attempts=Number(s.attempts_count)||0;
   const enabled=!!s.enabled;
   const status=enabled?(best?'<span class="mStatus best">🏆 Melhor: '+best+' pts • '+attempts+' tentativa(s)</span>':'<span class="mStatus ready">🟢 Liberada para competição</span>'):'<span class="mStatus">🔒 Fase em produção</span>';
   const launch=m.href&&enabled?'<a class="missionLaunch" href="'+esc(m.href)+'">🎮 Jogar fase</a>':'';
   return '<article class="competitionMission" data-mission="'+esc(m.key)+'"><div class="mTop"><span class="mIcon">'+esc(m.icon)+'</span><div><b>'+esc(m.title)+'</b><em>'+esc(typeLabel[m.kind]||m.kind)+' • '+esc(m.place||m.giver||'Missão NPC')+'</em></div></div><p>'+esc(m.description)+'</p><div class="mStats"><span>'+esc(m.theme)+'</span><strong>até '+esc(m.max)+' pts</strong></div>'+status+launch+'</article>';
 }).join('');
}
function renderRanks(rows){
 const host=$('#competitionRanks');if(!host)return;
 if(!rows?.length){host.innerHTML='<div class="emptyRank">A temporada está aberta. O ranking aparecerá quando as primeiras fases competitivas forem concluídas.</div>';return}
 host.innerHTML=rows.map(r=>'<div class="rankRow '+(r.is_me?'me':'')+'"><span class="rankPos">#'+esc(r.rank_position)+'</span><div class="rankName"><b>'+esc(r.nickname)+'</b><small>'+esc(r.class_name||'Sem turma')+' • '+esc(r.missions_completed)+' missões</small></div><div class="rankPts">'+esc(r.total_points)+'<small>pontos</small></div></div>').join('');
}
async function loadStatic(){
 const api=window.NevoaOnline;if(!api)return;
 try{
   const [season,missions,status]=await Promise.all([
     api.activeParadoxiaSeason(),
     api.paradoxiaMissions(),
     api.paradoxiaCompetitionStatus()
   ]);
   serverMissions=missions||[];
   renderMissionCards();
   if(season){
     $('#competitionSeason').textContent=season.title||'Temporada de Paradoxia';
     $('#competitionEnds').textContent='até '+fmtDate(season.ends_at);
   }
   if(status){
     $('#myCompPoints').textContent=status.total_points||0;
     $('#myCompRank').textContent=status.rank_position?'#'+status.rank_position:'—';
     $('#myClassRank').textContent=status.class_rank_position?'#'+status.class_rank_position:'—';
     $('#myMissionCount').textContent=status.missions_completed||0;
   }else{
     $('#compLogin').hidden=false;
   }
 }catch(e){
   const el=$('#competitionNotice');if(el)el.textContent='Competição online temporariamente indisponível.';
 }
}
function startBoard(){
 const api=window.NevoaOnline;if(!api)return;
 if(stopWatch)stopWatch();
 stopWatch=api.watchParadoxiaLeaderboard((rows,err)=>{
   if(err){$('#competitionNotice').textContent='Não foi possível atualizar o ranking agora.';return}
   $('#competitionNotice').textContent=scope==='class'?'Ranking da sua turma':'Ranking geral';
   renderRanks(rows);
 },scope,15000);
}
function focusMission(key){
 const card=document.querySelector('.competitionMission[data-mission="'+CSS.escape(key)+'"]');
 if(!card)return;
 document.querySelectorAll('.competitionMission.focused').forEach(x=>x.classList.remove('focused'));
 card.classList.add('focused');
 card.scrollIntoView({behavior:'smooth',block:'center'});
 setTimeout(()=>card.classList.remove('focused'),2200);
}
function bind(){
 document.querySelectorAll('[data-region-mission],[data-npc-mission]').forEach(el=>{
   const key=el.dataset.regionMission||el.dataset.npcMission;
   const go=()=>focusMission(key);
   el.addEventListener('click',go);
   el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
 });
 document.querySelectorAll('[data-rank-scope]').forEach(b=>b.addEventListener('click',()=>{
   scope=b.dataset.rankScope||'global';
   document.querySelectorAll('[data-rank-scope]').forEach(x=>x.classList.toggle('active',x===b));
   startBoard();
 }));
}
async function init(){bind();await loadStatic();startBoard()}
if(window.NevoaOnline)init();else window.addEventListener('nevoa-online-ready',init,{once:true});
window.addEventListener('beforeunload',()=>{if(stopWatch)stopWatch()});
})();