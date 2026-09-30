(()=>{
if(!window.NevoaNotify&&!document.querySelector('script[data-nevoa-notify]')){
 const ns=document.createElement('script');ns.src='../nevoa-notify.js?v=2';ns.dataset.nevoaNotify='1';document.head.appendChild(ns);
}

const D=window.NEVOA_DATA,$=s=>document.querySelector(s);
function readJSON(k,f){try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}}
function progress(){return readJSON("nevoaProgressV4",readJSON("nevoaProgressV3",{xp:0,completed:{},achievements:{},socrates:0}))}
function universe(){const u=readJSON("nevoaUniverseV1",{unlocks:[],cards:[],secrets:[],coins:0});u.unlocks||=[];u.cards||=[];u.secrets||=[];return u}
function saveU(u){localStorage.setItem("nevoaUniverseV1",JSON.stringify(u))}
window.NevoaUniverse={unlock(id){const x=universe();if(!x.unlocks.includes(id))x.unlocks.push(id);saveU(x)},addCard(id){const x=universe();if(!x.cards.includes(id))x.cards.push(id);saveU(x)},addSecret(id){const x=universe();if(!x.secrets.includes(id))x.secrets.push(id);saveU(x)},addCoins(n=1){const x=universe();x.coins=(x.coins||0)+n;saveU(x)}};
function seed(){const p=progress(),x=universe(),c=p.completed||{},ids=["socrates","argumento"];if(c.platao)ids.push("platao","caverna");if(c.descartes)ids.push("descartes");if(c.logica)ids.push("popularidade","adhominem");if((p.xp||0)>=120)ids.push("autonomia");if(localStorage.getItem("paradoxiaSave"))ids.push("teseu","certeza");ids.forEach(i=>{if(!x.unlocks.includes(i))x.unlocks.push(i)});D.cards.forEach(i=>{if((p.xp||0)>=i.xp&&!x.cards.includes(i.id))x.cards.push(i.id)});saveU(x);return x}
const u=seed(),p=progress();
const Progress=window.NevoaProgress;
const LAB_PHASES=[
 {id:"platform_socrates",name:"Sócrates",icon:"🏛️",localKey:"plataforma",score:60},
 {id:"platform_plato",name:"Platão",icon:"🌞",localKey:"plataoPlataforma",score:70},
 {id:"platform_descartes",name:"Descartes",icon:"🪞",localKey:"descartesPlataforma",score:80},
 {id:"platform_hume",name:"Hume",icon:"🌫️",localKey:"humePlataforma",score:90},
 {id:"platform_ethics",name:"Ética",icon:"⚖️",localKey:"eticaPlataforma",score:100}
];
const JOURNEY_TROPHIES=[
 {id:"mansion",icon:"🏚️",name:"Discípulo do Diálogo",desc:"Conclua os sete cômodos da Mansão de Sócrates."},
 {id:"platform_socrates",icon:"🏛️",name:"Caminhante de Atenas",desc:"Conclua a primeira fase do Labirinto."},
 {id:"platform_plato",icon:"🌞",name:"Libertado da Caverna",desc:"Conclua A Caverna de Platão."},
 {id:"platform_descartes",icon:"🪞",name:"A Certeza do Cogito",desc:"Conclua O Pesadelo de Descartes."},
 {id:"platform_hume",icon:"🌫️",name:"Investigador do Hábito",desc:"Conclua O Labirinto de Hume."},
 {id:"platform_ethics",icon:"⚖️",name:"Juiz da Névoa",desc:"Conclua O Tribunal da Ética."},
 {id:"labyrinthMaster",icon:"🏆",name:"Mestre do Labirinto",desc:"Conclua as cinco fases do Labirinto dos Filósofos."},
 {id:"paradoxia",icon:"🎭",name:"Cidadão de Paradoxia",desc:"Conclua o Capítulo I de Paradoxia."}
];
function journeyStatus(progressRows=[],cloudRpg=null,base=progress(),missionRows=[]){
 if(!Progress)throw new Error('NevoaProgress não carregado');
 const core=Progress.analyze({
  local:base,progressRows,cloudRpg,missionRows,
  routes:{
   mansion:'../index.html#jogos',
   labyrinth:['../jogos/plataforma-filosofica/','../jogos/plataforma-filosofica/fase2/','../jogos/plataforma-filosofica/fase3/','../jogos/plataforma-filosofica/fase4/','../jogos/plataforma-filosofica/fase5/'],
   paradoxia:'../jogos/paradoxia/',memories:'grimorio.html'
  }
 });
 return {
  claims:core.claims,effectiveMansionRooms:core.mansion.rooms,mansionPct:core.mansion.pct,
  labPhases:core.labyrinth.phases.map(x=>x.done),labDoneCount:core.labyrinth.doneCount,labPct:core.labyrinth.pct,
  paraScore:core.paradoxia.score,paraPct:core.paradoxia.pct,paraStarted:core.paradoxia.started,paraDone:core.paradoxia.completed,
  paraStory:core.paradoxia.story,paraStoryDone:core.paradoxia.storyDoneCount,paraStoryTotal:core.paradoxia.storyTotal,
  paraPlace:core.paradoxia.place,paraConcepts:core.paradoxia.concepts,paraSecrets:core.paradoxia.secrets,paraCoins:core.paradoxia.mistCoins,
  paraMissionDone:core.paradoxia.tacticalCompleted,paraMissionTotal:core.paradoxia.tacticalTotal,paraMissionBest:core.paradoxia.tacticalBest,
  trophies:core.memories.trophies,trophyCount:core.memories.count,memoriesPct:core.memories.pct,next:core.next,nextTrophy:core.hud.nextTrophy,core
 };
}
function shell(title,lead,body){document.title=title+" — Portal Filosófico da Névoa";$("#app").innerHTML=`<header class="top"><div class="wrap topIn"><a class="brand" href="../index.html#grande-mapa" title="Abrir o Grande Mapa">Portal Filosófico <span>da Névoa</span></a><nav class="nav"><a href="../index.html#grande-mapa">🗺️ Mapa</a><a href="../jogos/paradoxia/">Paradoxia</a><a href="../jogos/plataforma-filosofica/">Labirinto</a><a href="grimorio.html">Grimório</a><a href="perfil.html">Perfil</a><a href="../salao-da-nevoa.html">Salão</a></nav><a class="worldMapBtn" href="../index.html#grande-mapa" aria-label="Abrir Grande Mapa">🗺️ <span>Mapa</span></a></div></header><section class="hero"><div class="wrap"><div class="eyebrow">Universo da Névoa</div><h1>${title}</h1><p class="lead">${lead}</p><div class="chips"><span class="chip">${p.xp||0} XP</span><span class="chip">${u.unlocks.length} registros</span><span class="chip">${u.cards.length} cartas</span><span class="chip">${u.secrets.length} segredos</span></div></div></section>${body}<footer class="footer"><div class="wrap">PENSAR • QUESTIONAR • ARGUMENTAR • TRANSFORMAR<br><br><a href="../index.html#grande-mapa">← Voltar ao Grande Mapa</a></div></footer>`}
const card=(icon,title,desc,href,meta="")=>`<article class="card"><div class="icon">${icon}</div>${meta?`<div class="meta">${meta}</div>`:""}<h3>${title}</h3><p>${desc}</p>${href?`<a href="${href}">Entrar →</a>`:""}</article>`;
function hub(){shell("Praça Central da Névoa","Um refúgio entre as aventuras: aqui ficam seus livros, registros, coleções e ferramentas para pensar.",`<section class="section"><div class="wrap"><div class="sectionHead"><div class="eyebrow">ARQUIVOS • REFLEXÃO • DESCOBERTAS</div><h2>Explore os espaços da Praça</h2></div><div class="grid">${card("📖","Grimório do Explorador","Enciclopédia que registra filósofos, conceitos, paradoxos, falácias e criaturas encontrados.","grimorio.html","Coleção")}${card("📓","Diário Filosófico","Registre respostas e volte a elas no futuro para perceber como seu pensamento mudou.","diario.html","Reflexão")}${card("🏛️","Museu dos Filósofos","Galeria navegável de pensadores, problemas, conceitos e perguntas.","museu.html","Conhecimento")}${card("🧠","Oficina de Argumentos","Construa tese, razões, evidência, objeção e resposta.","oficina.html","Argumentação")}${card("👻","Bestiário Filosófico","Criaturas inspiradas em falácias e vícios argumentativos.","bestiario.html","Lógica")}${card("🃏","Cartas da Névoa","Coleção desbloqueada pela progressão do Portal.","cartas.html","Colecionável")}${card("🧙","Perfil do Explorador","XP, títulos, coleções, registros e jornada.","perfil.html","Progressão")}${card("🎭","Teatro Filosófico","Cenas interativas nas quais razões mudam o rumo do diálogo.","teatro.html","Narrativa")}${card("🎵","Fonógrafo da Névoa","Casa das trilhas e futuras músicas desbloqueáveis.","fonografo.html","Música")}${card("🔐","Segredos da Mansão","Enigmas opcionais e registros secretos.","segredos.html","Exploração")}${card("👨‍🏫","Central do Professor","Planejamento de sessões e estrutura para turmas.","professor.html?v=15","Docente")}${card("🗺️","Grande Mapa","Retorne ao coração do Portal e escolha seu próximo destino.","../index.html#grande-mapa","Navegação")}</div></div></section>`)}
function grimorio(){
 let filter="Todos";
 const localJourney=journeyStatus();
 shell("Grimório do Explorador","O livro cresce junto com a jornada. Aqui ficam seus registros filosóficos e as Memórias conquistadas nos grandes caminhos do Portal.",`
 <section class="section memoriesSection"><div class="wrap">
   <div class="journeySectionHead"><div><div class="eyebrow">MEMÓRIAS DA JORNADA</div><h2>Troféus do Explorador</h2></div><p>As Memórias são liberadas somente por conclusões reais registradas nos jogos.</p></div>
   <div class="memorySummary panel"><div><small>MEMÓRIAS DESPERTAS</small><b id="memoryCount">0 / ${JOURNEY_TROPHIES.length}</b></div><a class="btn subtle" href="perfil.html">Ver Minha Jornada →</a></div>
   <div class="memoryTrophyGrid" id="memoryTrophyGrid"></div>
 </div></section>
 <section class="section"><div class="wrap"><div class="journeySectionHead"><div><div class="eyebrow">ENCICLOPÉDIA DA NÉVOA</div><h2>Registros encontrados</h2></div></div><div class="toolbar" id="filters"></div><div id="entries" class="grid"></div></div></section>`);
 const renderEntries=()=>{$("#entries").innerHTML=D.grimorio.filter(x=>filter==="Todos"||x.type===filter).map(x=>`<article class="card ${u.unlocks.includes(x.id)?"":"locked"}"><div class="icon">${x.icon}</div><div class="meta">${x.type}</div><h3>${u.unlocks.includes(x.id)?x.title:"Entrada selada"}</h3><p>${u.unlocks.includes(x.id)?x.desc:"Continue explorando o Portal para revelar este registro."}</p></article>`).join("")};
 const renderMemories=st=>{
   const count=JOURNEY_TROPHIES.filter(t=>st.trophies[t.id]).length;
   $("#memoryCount").textContent=count+" / "+JOURNEY_TROPHIES.length;
   $("#memoryTrophyGrid").innerHTML=JOURNEY_TROPHIES.map(t=>{const on=!!st.trophies[t.id];return `<article class="memoryTrophy ${on?"unlocked":"locked"}"><div class="memoryTrophySeal"><span>${on?t.icon:"◇"}</span></div><small>${on?"MEMÓRIA DESPERTA":"MEMÓRIA SELADA"}</small><h3>${on?t.name:"Segredo ainda adormecido"}</h3><p>${t.desc}</p><b>${on?"✓ Conquistada":"○ Ainda não conquistada"}</b></article>`}).join("");
 };
 ["Todos",...new Set(D.grimorio.map(x=>x.type))].forEach(t=>{const b=document.createElement("button");b.className="btn subtle";b.textContent=t;b.onclick=()=>{filter=t;renderEntries()};$("#filters").appendChild(b)});
 renderEntries();renderMemories(localJourney);
 (async()=>{if(!window.NevoaOnline?.getSession())return;let snap=null,cloud=null;try{snap=await window.NevoaOnline.syncLocal(progress())}catch(e){}try{cloud=await window.NevoaOnline.loadRpgState()}catch(e){}renderMemories(journeyStatus(snap?.progress||[],cloud,progress()))})().catch(()=>{});
}
function diario(){const key="nevoaDiaryV1";let notes=readJSON(key,[]);shell("Diário Filosófico","Aqui não há resposta automática: o objetivo é registrar pensamento, razões e mudanças de posição.",`<section class="section"><div class="wrap two"><div class="panel"><div class="eyebrow">Pergunta do momento</div><h2>O que torna uma escolha verdadeiramente sua?</h2><div class="field"><label>Sua reflexão</label><textarea id="diaryText" placeholder="Escreva o que pensa hoje..."></textarea></div><button class="btn" id="saveDiary">Registrar no diário</button></div><div class="panel"><h3>Registros anteriores</h3><div id="notes"></div></div></div></section>`);const draw=()=>$("#notes").innerHTML=notes.length?notes.slice().reverse().map(n=>`<div class="note"><b>${n.q}</b><small>${n.date}</small><p>${n.text}</p></div>`).join(""):`<div class="empty">Seu diário ainda está em branco.</div>`;draw();$("#saveDiary").onclick=()=>{const text=$("#diaryText").value.trim();if(!text)return;notes.push({q:"O que torna uma escolha verdadeiramente sua?",text,date:new Date().toLocaleDateString("pt-BR")});localStorage.setItem(key,JSON.stringify(notes));$("#diaryText").value="";draw()}}
function museu(){shell("Museu dos Filósofos","Uma galeria de problemas e perguntas. Depois poderemos substituir estes símbolos por retratos e salas animadas.",`<section class="section"><div class="wrap"><input class="input search" id="search" placeholder="Buscar filósofo, época ou conceito..."><div class="grid" id="museum" style="margin-top:16px"></div></div></section>`);const draw=q=>{$("#museum").innerHTML=D.philosophers.filter(x=>(x.name+x.era+x.concept).toLowerCase().includes(q.toLowerCase())).map(x=>`<article class="card"><div class="icon">${x.icon}</div><div class="meta">${x.era}</div><h3>${x.name}</h3><p><b>${x.concept}</b></p><p>${x.question}</p></article>`).join("")};draw("");$("#search").oninput=e=>draw(e.target.value)}
function oficina(){const key="nevoaArgumentsV1";shell("Oficina de Argumentos","Monte um argumento por partes. A ferramenta avalia estrutura, não qual opinião você escolheu defender.",`<section class="section"><div class="wrap two"><div class="panel"><div class="field"><label>Tese</label><textarea id="thesis"></textarea></div><div class="field"><label>Razão</label><textarea id="reason"></textarea></div><div class="field"><label>Evidência ou exemplo</label><textarea id="evidence"></textarea></div><div class="field"><label>Possível objeção</label><textarea id="objection"></textarea></div><div class="field"><label>Resposta à objeção</label><textarea id="reply"></textarea></div><button class="btn" id="build">Construir argumento</button></div><div class="panel"><h2>Estrutura</h2><div id="preview" class="empty">Preencha os blocos para montar seu argumento.</div></div></div></section>`);$("#build").onclick=()=>{const ids=["thesis","reason","evidence","objection","reply"],vals=ids.map(id=>$("#"+id).value.trim()),names=["Tese","Razão","Evidência","Objeção","Resposta"];$("#preview").className="";$("#preview").innerHTML=vals.map((v,i)=>`<div class="note ${v?"success":"warning"}"><b>${names[i]}</b><small>${v||"Bloco ainda vazio"}</small></div>`).join("");if(vals.filter(Boolean).length===5){const a=readJSON(key,[]);a.push({date:new Date().toISOString(),values:vals});localStorage.setItem(key,JSON.stringify(a))}}}
function bestiario(){const discovered=(p.completed?.logica||0)>0||u.unlocks.includes("popularidade");shell("Bestiário Filosófico","Falácias viram criaturas porque um erro de raciocínio fica mais fácil de reconhecer quando ganha rosto, nome e fraqueza.",`<section class="section"><div class="wrap collection">${D.beasts.map((x,i)=>`<article class="miniCard ${(discovered||i<2)?"":"locked"}"><div class="icon">${x.icon}</div><b>${(discovered||i<2)?x.name:"Criatura desconhecida"}</b><small>${(discovered||i<2)?x.fallacy:"Continue explorando a Sala da Lógica"}</small>${(discovered||i<2)?`<p>${x.weakness}</p>`:""}</article>`).join("")}</div></section>`)}
function cartas(){shell("Cartas da Névoa","Coleção sem compra e sem vantagem paga: as cartas registram progresso e conhecimento conquistado nos jogos.",`<section class="section"><div class="wrap collection">${D.cards.map(x=>{const on=u.cards.includes(x.id);return `<article class="miniCard ${on?"":"locked"}"><div class="icon">${on?x.icon:"❔"}</div><b>${on?x.name:"Carta selada"}</b><small>${on?x.type:`Desbloqueia em ${x.xp} XP`}</small>${on?`<p>${x.skill}</p>`:""}</article>`}).join("")}</div></section>`)}
function perfil(){
const diary=readJSON("nevoaDiaryV1",[]),args=readJSON("nevoaArgumentsV1",[]),localXp=Number(p.xp||0);
const avatars=Array.isArray(window.NEVOA_AVATARS)?window.NEVOA_AVATARS:[];
const rankInfo=x=>{const r=Progress.rank(x);return {name:r.name,next:r.nextShort,min:r.min,max:r.max,pct:r.pct}};
const journeyData=(xp,progressRows=[],cloudRpg=null,missionRows=[])=>{
 const r=rankInfo(xp),j=journeyStatus(progressRows,cloudRpg,progress(),missionRows);
 return {...j,r,pct:r.pct,next:j.next};
};
const jd=journeyData(localXp);
const worldCard=(cls,icon,kicker,title,pct,desc,href)=>`<a class="journeyWorldCard ${cls}" href="${href}"><div class="journeyWorldArt"><span>${icon}</span><i style="--world-progress:${pct}%"></i></div><div class="journeyWorldCopy"><small>${kicker}</small><h3>${title}</h3><p>${desc}</p><div class="journeyWorldProgress"><i style="width:${pct}%"></i></div><b>${pct}% explorado <span>→</span></b></div></a>`;
const timelineState=(started,done)=>done?"done":started?"active":"pending";
const timelineLabel=state=>state==="done"?"✓ Concluído":state==="active"?"◈ Em andamento":"◇ Não iniciado";
const timelineChapter=(id,number,icon,title,state,pct,meta,href)=>`<a class="journeyTimelineChapter ${state}" id="journeyTimeline${id}" data-timeline-id="${id}" href="${href}"><span class="journeyTimelineNumber">${number}</span><div class="journeyTimelineSigil">${icon}</div><small class="journeyTimelineState">${timelineLabel(state)}</small><h3>${title}</h3><p class="journeyTimelineMeta">${meta}</p><div class="journeyTimelineProgress"><i style="width:${pct}%"></i></div><b class="journeyTimelinePct">${pct}%</b></a>`;
const paradoxiaMissionDefs=()=>window.ParadoxiaMissions?.places||[];
const missionRowsMap=rows=>Object.fromEntries((Array.isArray(rows)?rows:[]).map(r=>[r.mission_key,r]));
const renderParadoxiaMissions=rows=>{
 const box=$("#journeyParadoxiaMissions");if(!box)return;
 const map=missionRowsMap(rows),defs=paradoxiaMissionDefs();
 const done=defs.filter(m=>Number(map[m.key]?.best_score||0)>0).length;
 const status=$("#journeyParaMissionStatus");if(status)status.textContent=done+"/"+defs.length+" concluídas";
 box.innerHTML=defs.map(m=>{const row=map[m.key]||{},ok=Number(row.best_score||0)>0;return `<a class="journeyParaMission ${ok?"done":""}" href="../jogos/paradoxia/${m.href}"><span>${m.icon}</span><div><b>${m.title}</b><small>${m.theme}</small></div><em>${ok?"✓ "+Number(row.best_score||0)+" pts":"◇ Pendente"}</em></a>`}).join("");
};
const renderActivityChronicle=()=>{
 const box=$("#journeyActivityList");if(!box)return;
 const items=window.NevoaActivity?.list?.(10)||[];
 if(!items.length){box.innerHTML='<div class="journeyActivityEmpty">A Crônica começa a registrar seus próximos marcos a partir de agora.</div>';return}
 box.innerHTML=items.map(item=>`<div class="journeyActivityItem ${item.type||"progress"} ${item.legacy?"legacy":""}"><div class="journeyActivityIcon">${item.icon||"✦"}</div><div><b>${item.title||"Jornada atualizada"}</b><small>${item.text||""}</small><em>${window.NevoaActivity?.formatTime?.(item)||""}</em></div>${item.xp!==null&&item.xp!==undefined&&Number(item.xp)!==0?`<span>${Number(item.xp)>0?"+":""}${Number(item.xp)} XP</span>`:""}</div>`).join("");
};

shell("Minha Jornada","Sua identidade, conquistas e caminhos percorridos dentro da Névoa. Cada pergunta respondida deixa uma marca no mundo.",`
<section class="section journeySection"><div class="wrap">
  <div class="journeyHero panel">
    <div class="journeyMoon" aria-hidden="true">☾</div>
    <button class="profileAvatarButton journeyAvatar" id="openAvatarGallery" type="button" aria-label="Escolher avatar"><img id="profileAvatarImage" alt="Avatar do Explorador"><span>Trocar avatar</span></button>
    <div class="profileIdentityMain journeyIdentity">
      <div class="eyebrow">Livro de jornada do explorador</div>
      <h2 id="profileDisplayName">Explorador da Névoa</h2>
      <p class="profileAccountHint" id="profileAccountHint">Conectando à sua conta...</p>
      <div class="journeyTitle"><span>✦</span><b id="journeyRankName">${jd.r.name}</b></div>
      <div class="journeyXpTrack"><div><small id="journeyXpText">${localXp} XP</small><small id="journeyXpNext">${jd.r.next?"Próximo título: "+jd.r.next:"Título máximo alcançado"}</small></div><div class="progress journeyProgress"><i id="journeyXpBar" style="width:${jd.pct}%"></i></div></div>
      <div class="profileIdentityActions"><button class="btn" id="editProfileName" type="button" hidden>✏️ Alterar nome</button><button class="btn subtle" id="openAvatarGalleryAction" type="button" hidden>🖼️ Escolher avatar</button><a class="btn subtle" id="profileLoginLink" href="../login.html" hidden>🔐 Entrar na conta</a></div>
    </div>
    <div class="journeySeal"><small>REGISTRO DA NÉVOA</small><b id="journeySealXp">${localXp}</b><span>XP TOTAL</span><em>✦</em></div>
  </div>

  <div class="journeyNext panel">
    <div class="journeyNextIcon" id="journeyNextIcon">${jd.next.icon}</div><div><small>A NÉVOA RECOMENDA</small><h3 id="journeyNextTitle">${jd.next.title}</h3><p id="journeyNextText">${jd.next.text}</p></div><a class="btn" id="journeyNextLink" href="${jd.next.href}">Continuar jornada →</a>
  </div>

  <a class="panel journeyNextAchievement" id="journeyNextAchievement" href="${jd.nextTrophy.href}">
    <div class="journeyAchievementSeal" id="journeyAchievementIcon">${jd.nextTrophy.icon}</div>
    <div class="journeyAchievementCopy">
      <small>PRÓXIMA CONQUISTA</small>
      <h3 id="journeyAchievementName">${jd.nextTrophy.name}</h3>
      <p id="journeyAchievementRequirement">${jd.nextTrophy.requirement}</p>
      <div class="journeyAchievementTrack"><i id="journeyAchievementFill" style="width:${jd.nextTrophy.pct}%"></i></div>
    </div>
    <strong id="journeyAchievementPct">${jd.nextTrophy.pct}%</strong>
  </a>

  <div class="journeySectionHead journeyTimelineHead"><div><div class="eyebrow">LINHA DA JORNADA</div><h2>Os capítulos da sua história</h2></div><p>Cada marco acende conforme sua jornada real é registrada no Portal.</p></div>
  <div class="journeyTimeline" id="journeyTimeline">
    ${timelineChapter("Mansion","I","🏚️","Mansão de Sócrates",timelineState(jd.effectiveMansionRooms>0,jd.mansionPct===100),jd.mansionPct,jd.effectiveMansionRooms+"/7 cômodos","../index.html#jogos")}
    ${timelineChapter("Labyrinth","II","🎮","Labirinto dos Filósofos",timelineState(jd.labDoneCount>0,jd.labPct===100),jd.labPct,jd.labDoneCount+"/5 fases","../jogos/plataforma-filosofica/")}
    ${timelineChapter("Paradoxia","III","🎭","Paradoxia",timelineState(jd.paraStarted,jd.paraDone),jd.paraPct,jd.paraDone?"Capítulo I concluído":jd.paraStarted?"Capítulo em andamento":"Reino ainda não visitado","../jogos/paradoxia/")}
    ${timelineChapter("Memories","IV","🏆","Memórias",timelineState(jd.trophyCount>0,jd.trophyCount===JOURNEY_TROPHIES.length),jd.memoriesPct,jd.trophyCount+"/"+JOURNEY_TROPHIES.length+" despertas","grimorio.html")}
  </div>

  <div class="journeySectionHead"><div><div class="eyebrow">Destinos percorridos</div><h2>Seu caminho pelo Portal</h2></div><p>Nenhuma região é bloqueada. Os selos apenas registram onde sua história já passou.</p></div>
  <div class="journeyWorlds" id="journeyWorlds">
    ${worldCard("mansion","🏚️","CAPÍTULO I","Mansão de Sócrates",jd.mansionPct,"Sete cômodos de perguntas, diálogo e investigação.","../index.html#jogos")}
    ${worldCard("labyrinth","🎮","5 FASES","Labirinto dos Filósofos",jd.labPct,"Sócrates, Platão e outros caminhos filosóficos em plataforma.","../jogos/plataforma-filosofica/")}
    ${worldCard("paradoxia","🎭","RPG FILOSÓFICO","Paradoxia",jd.paraPct,"Escolhas, falácias, missões e duelos de argumentos.","../jogos/paradoxia/")}
  </div>

  <div class="panel journeyMilestones">
    <div class="journeyMilestonesHead"><div><div class="eyebrow">SELOS DO LABIRINTO</div><h3>As cinco provas filosóficas</h3></div><b id="journeyLabStatus">${jd.labDoneCount}/5 concluídas</b></div>
    <div class="journeyPhaseSeals" id="journeyPhaseSeals">${LAB_PHASES.map((phase,i)=>`<div class="journeyPhaseSeal ${jd.labPhases[i]?"done":""}" data-phase-index="${i}"><span>${phase.icon}</span><b>${phase.name}</b><small>${jd.labPhases[i]?"✓ Concluída":"◇ Pendente"}</small></div>`).join("")}</div>
    <div class="journeyMilestoneFooter"><span id="journeyLabHint">${jd.labDoneCount===5?"🏆 Mestre do Labirinto conquistado":"Conclua as fases pendentes para despertar o troféu Mestre do Labirinto."}</span><a href="grimorio.html">Ver todas as Memórias →</a></div>
  </div>

  <div class="panel journeyParadoxiaDetail">
    <div class="journeyMilestonesHead"><div><div class="eyebrow">PARADOXIA • CAPÍTULO I</div><h3>Registro do Reino das Escolhas</h3></div><b id="journeyParaStoryStatus">${jd.paraStoryDone}/${jd.paraStoryTotal} encontros</b></div>
    <div class="journeyParaSummary">
      <div><span>🎭</span><b id="journeyParaScore">${jd.paraScore}/120</b><small>XP do capítulo</small></div>
      <div><span>🗺️</span><b id="journeyParaPlace">${jd.paraPlace||"Ainda não visitado"}</b><small>Último local</small></div>
      <div><span>✦</span><b id="journeyParaConcepts">${jd.paraConcepts}</b><small>Conceitos</small></div>
      <div><span>🔮</span><b id="journeyParaSecrets">${jd.paraSecrets}/2</b><small>Segredos</small></div>
      <div><span>🪙</span><b id="journeyParaCoins">${jd.paraCoins}</b><small>Moedas da Névoa</small></div>
    </div>
    <div class="journeyParaSubhead"><div><small>JORNADA PRINCIPAL</small><b>Os sete encontros do capítulo</b></div><a href="../jogos/paradoxia/">Explorar Paradoxia →</a></div>
    <div class="journeyParaEncounters" id="journeyParaEncounters">${jd.paraStory.map(x=>`<div class="journeyParaEncounter ${x.done?"done":x.active?"active":""}"><span>${x.icon}</span><b>${x.location}</b><small>${x.done?"✓ Concluído":x.active?"◈ Em foco":"◇ Pendente"}</small></div>`).join("")}</div>
    <div class="journeyParaSubhead missionHead"><div><small>MISSÕES DO REINO</small><b>Desafios táticos de Paradoxia</b></div><strong id="journeyParaMissionStatus">0/${paradoxiaMissionDefs().length} concluídas</strong></div>
    <div class="journeyParadoxiaMissions" id="journeyParadoxiaMissions"></div>
  </div>

  <div class="journeyLower">
    <div class="panel journeyMemories"><div class="eyebrow">Memórias da jornada</div><h3>O que você já levou da Névoa</h3><div class="journeyStats"><div><b id="journeyXpStat">${localXp}</b><small>XP</small></div><div><b>${u.unlocks.length}</b><small>Registros</small></div><div><b>${u.cards.length}</b><small>Cartas</small></div><div><b>${u.secrets.length}</b><small>Segredos</small></div><div><b>${diary.length}</b><small>Reflexões</small></div><div><b>${args.length}</b><small>Argumentos</small></div></div><a class="btn subtle" href="grimorio.html">🏆 Ver Memórias e troféus</a></div>
    <div class="panel journeyChronicle activityChronicle"><div class="eyebrow">CRÔNICA DO EXPLORADOR</div><h3>Últimas marcas na Névoa</h3><p class="journeyChronicleLead">Só entram aqui acontecimentos importantes da sua jornada.</p><div id="journeyActivityList" class="journeyActivityList"></div></div>
  </div>

  <div class="panel profileAvatarEditor" id="profileAvatarEditor" hidden><div class="eyebrow">Galeria de Avatares da Névoa</div><h3>Escolha sua aparência no Portal</h3><p>Os dez avatares são artes oficiais do Portal. Você pode usar qualquer um deles e trocar quando quiser.</p><div class="avatarGallery" id="avatarGallery"></div><div class="avatarGalleryFooter"><div class="profileNameStatus" id="avatarStatus" role="status" aria-live="polite"></div><button class="btn subtle" id="closeAvatarGallery" type="button">Fechar galeria</button></div></div>
  <div class="panel profileNameEditor" id="profileNameEditor" hidden><div class="eyebrow">Editar identidade</div><h3>Nome visível no Portal</h3><p>Use apelido ou primeiro nome. Para proteger sua privacidade, não coloque nome completo, telefone, e-mail, link ou rede social.</p><form id="profileNameForm" class="profileNameForm"><label for="profileNameInput">Novo nome</label><div class="profileNameRow"><input class="input" id="profileNameInput" maxlength="24" autocomplete="off" spellcheck="false" placeholder="Ex.: Luna 8A"><button class="btn" id="saveProfileName" type="submit">Salvar nome</button><button class="btn subtle" id="cancelProfileName" type="button">Cancelar</button></div><small class="profileSafetyNote">2 a 24 caracteres. O filtro bloqueia contatos, termos inadequados e nomes que possam imitar contas oficiais. Seu apelido de entrada e seu PIN não mudam.</small><div class="profileNameStatus" id="profileNameStatus" role="status" aria-live="polite"></div></form></div>
  <div class="note profileNextStep"><b>🛡️ Identidade protegida</b><small>O perfil usa somente os dez avatares oficiais do Portal. Não há envio livre de foto pessoal.</small></div>
</div></section>`);
renderParadoxiaMissions([]);
renderActivityChronicle();
window.addEventListener('nevoa-activity',renderActivityChronicle);

const nameEl=$("#profileDisplayName"),hint=$("#profileAccountHint"),edit=$("#editProfileName"),login=$("#profileLoginLink");
const editor=$("#profileNameEditor"),form=$("#profileNameForm"),input=$("#profileNameInput"),cancel=$("#cancelProfileName"),save=$("#saveProfileName"),status=$("#profileNameStatus");
const avatarImg=$("#profileAvatarImage"),avatarOpen=$("#openAvatarGallery"),avatarOpenAction=$("#openAvatarGalleryAction"),avatarEditor=$("#profileAvatarEditor"),avatarGrid=$("#avatarGallery"),avatarStatus=$("#avatarStatus"),avatarClose=$("#closeAvatarGallery");
let profile=null,currentAvatar="avatar-01",avatarBusy=false;
const avatarByKey=key=>avatars.find(a=>a.key===key)||avatars[0]||null;
const avatarRankClass=x=>{const xp=Number(x)||0;if(xp>=360)return "rank-guardiao";if(xp>=240)return "rank-mestre";if(xp>=140)return "rank-filosofo";if(xp>=60)return "rank-investigador";return "rank-aprendiz"};
const applyAvatarRank=()=>{avatarOpen.classList.remove("rank-aprendiz","rank-investigador","rank-filosofo","rank-mestre","rank-guardiao");avatarOpen.classList.add(avatarRankClass(profile?.xp||localXp))};
const paintAvatar=key=>{const a=avatarByKey(key);if(!a)return;currentAvatar=a.key;avatarImg.src=a.src;avatarImg.alt="Avatar "+a.name;avatarOpen.title="Avatar atual: "+a.name;applyAvatarRank()};
const showAvatarStatus=(msg,type="")=>{avatarStatus.textContent=msg;avatarStatus.className="profileNameStatus "+type};
const drawAvatarGallery=()=>{avatarGrid.innerHTML=avatars.map(a=>`<button class="avatarChoice ${a.key===currentAvatar?"selected":""}" type="button" data-avatar="${a.key}" aria-pressed="${a.key===currentAvatar?"true":"false"}"><img src="${a.src}" alt="Avatar ${a.name}"><span>${a.name}</span><small>${a.key===currentAvatar?"Em uso":"Escolher"}</small></button>`).join("");avatarGrid.querySelectorAll(".avatarChoice").forEach(btn=>btn.onclick=()=>chooseAvatar(btn.dataset.avatar))};
const openAvatarEditor=()=>{if(!profile){location.href="../login.html";return}drawAvatarGallery();showAvatarStatus("");avatarEditor.hidden=false;avatarEditor.scrollIntoView({behavior:"smooth",block:"nearest"})};
const closeAvatarEditor=()=>{avatarEditor.hidden=true;showAvatarStatus("")};
async function chooseAvatar(key){if(!profile||avatarBusy)return;const a=avatarByKey(key);if(!a)return;avatarBusy=true;avatarGrid.querySelectorAll("button").forEach(b=>b.disabled=true);showAvatarStatus("Salvando "+a.name+"...","info");try{const saved=await window.NevoaOnline.updateProfileAvatar(a.key);if(profile)profile.avatar_key=saved||a.key;paintAvatar(saved||a.key);drawAvatarGallery();showAvatarStatus("✓ "+a.name+" agora é seu avatar.","ok")}catch(err){showAvatarStatus(err?.message||"Não foi possível salvar o avatar agora.","bad")}finally{avatarBusy=false;avatarGrid.querySelectorAll("button").forEach(b=>b.disabled=false)}}
const showStatus=(msg,type="")=>{status.textContent=msg;status.className="profileNameStatus "+type};
const closeEditor=()=>{editor.hidden=true;showStatus("");input.value=profile?.nickname||""};
const openEditor=()=>{if(!profile)return;input.value=profile.nickname||"";editor.hidden=false;showStatus("");requestAnimationFrame(()=>input.focus())};
const repaintJourney=(xp,progressRows=[],cloudRpg=null,missionRows=[])=>{
 const d=journeyData(Number(xp)||0,progressRows,cloudRpg,missionRows);
 const ids={journeyRankName:d.r.name,journeyXpText:(Number(xp)||0)+" XP",journeyXpNext:d.r.next?"Próximo título: "+d.r.next:"Título máximo alcançado",journeySealXp:Number(xp)||0,journeyXpStat:Number(xp)||0,journeyNextIcon:d.next.icon,journeyNextTitle:d.next.title,journeyNextText:d.next.text,journeyMansionChronicle:d.effectiveMansionRooms?d.effectiveMansionRooms+"/7 cômodos atravessados":"Ainda não explorada",journeyLabChronicle:d.labDoneCount?d.labDoneCount+"/5 fases concluídas":"As portas aguardam",journeyParaChronicle:d.paraPct?d.paraPct+"% registrado":"O reino ainda chama"};
 Object.entries(ids).forEach(([id,val])=>{const el=$("#"+id);if(el)el.textContent=val});
 const bar=$("#journeyXpBar");if(bar)bar.style.width=d.pct+"%";const heroXp=document.querySelector(".hero .chip");if(heroXp)heroXp.textContent=(Number(xp)||0)+" XP";
 const link=$("#journeyNextLink");if(link)link.href=d.next.href;
 const nt=d.nextTrophy||{};
 const achLink=$("#journeyNextAchievement");if(achLink)achLink.href=nt.href||"grimorio.html";
 const achIcon=$("#journeyAchievementIcon");if(achIcon)achIcon.textContent=nt.icon||"🏆";
 const achName=$("#journeyAchievementName");if(achName)achName.textContent=nt.name||"Próxima conquista";
 const achReq=$("#journeyAchievementRequirement");if(achReq)achReq.textContent=nt.requirement||"Continue sua jornada.";
 const achFill=$("#journeyAchievementFill");if(achFill)achFill.style.width=(Number(nt.pct)||0)+"%";
 const achPct=$("#journeyAchievementPct");if(achPct)achPct.textContent=(Number(nt.pct)||0)+"%";
 [["mansion",d.mansionPct],["labyrinth",d.labPct],["paradoxia",d.paraPct]].forEach(([cls,val])=>{const card=document.querySelector(".journeyWorldCard."+cls);if(!card)return;const fill=card.querySelector(".journeyWorldProgress i");if(fill)fill.style.width=val+"%";const label=card.querySelector(".journeyWorldCopy>b");if(label)label.innerHTML=val+'% explorado <span>→</span>'});
 const labStatus=$("#journeyLabStatus");if(labStatus)labStatus.textContent=d.labDoneCount+"/5 concluídas";
 const labHint=$("#journeyLabHint");if(labHint)labHint.textContent=d.labDoneCount===5?"🏆 Mestre do Labirinto conquistado":"Conclua as fases pendentes para despertar o troféu Mestre do Labirinto.";
 document.querySelectorAll(".journeyPhaseSeal").forEach((seal,i)=>{const done=!!d.labPhases[i];seal.classList.toggle("done",done);const small=seal.querySelector("small");if(small)small.textContent=done?"✓ Concluída":"◇ Pendente"});
 const paraIds={journeyParaStoryStatus:d.paraStoryDone+"/"+d.paraStoryTotal+" encontros",journeyParaScore:d.paraScore+"/120",journeyParaPlace:d.paraPlace||"Ainda não visitado",journeyParaConcepts:d.paraConcepts,journeyParaSecrets:d.paraSecrets+"/2",journeyParaCoins:d.paraCoins};
 Object.entries(paraIds).forEach(([id,val])=>{const el=$("#"+id);if(el)el.textContent=val});
 const encounters=$("#journeyParaEncounters");if(encounters)encounters.innerHTML=d.paraStory.map(x=>`<div class="journeyParaEncounter ${x.done?"done":x.active?"active":""}"><span>${x.icon}</span><b>${x.location}</b><small>${x.done?"✓ Concluído":x.active?"◈ Em foco":"◇ Pendente"}</small></div>`).join("");
 renderParadoxiaMissions(missionRows);
 const timeline=[
  ["Mansion",timelineState(d.effectiveMansionRooms>0,d.mansionPct===100),d.mansionPct,d.effectiveMansionRooms+"/7 cômodos"],
  ["Labyrinth",timelineState(d.labDoneCount>0,d.labPct===100),d.labPct,d.labDoneCount+"/5 fases"],
  ["Paradoxia",timelineState(d.paraStarted,d.paraDone),d.paraPct,d.paraDone?"Capítulo I concluído":d.paraStarted?"Capítulo em andamento":"Reino ainda não visitado"],
  ["Memories",timelineState(d.trophyCount>0,d.trophyCount===JOURNEY_TROPHIES.length),d.memoriesPct,d.trophyCount+"/"+JOURNEY_TROPHIES.length+" despertas"]
 ];
 timeline.forEach(([id,state,pct,meta])=>{
   const node=$("#journeyTimeline"+id);if(!node)return;
   node.classList.remove("pending","active","done");node.classList.add(state);
   const st=node.querySelector(".journeyTimelineState");if(st)st.textContent=timelineLabel(state);
   const mt=node.querySelector(".journeyTimelineMeta");if(mt)mt.textContent=meta;
   const fill=node.querySelector(".journeyTimelineProgress i");if(fill)fill.style.width=pct+"%";
   const pc=node.querySelector(".journeyTimelinePct");if(pc)pc.textContent=pct+"%";
 });
 return d;
};
async function loadProfile(){
 paintAvatar("avatar-01");
 if(!window.NevoaOnline){hint.textContent="O serviço de conta não carregou. Reabra a página para tentar novamente.";login.hidden=false;return}
 if(!window.NevoaOnline.getSession()){window.NevoaActivity?.baseline?.(jd.core);renderActivityChronicle();nameEl.textContent="Explorador da Névoa";hint.textContent="Entre na sua conta para sincronizar sua Jornada, nome e avatar.";login.hidden=false;edit.hidden=true;avatarOpenAction.hidden=true;return}
 let snapshot=null,cloudRpg=null,missionRows=[];
 try{snapshot=await window.NevoaOnline.syncLocal(progress())}catch(e){}
 try{cloudRpg=await window.NevoaOnline.loadRpgState()}catch(e){}
 try{missionRows=await window.NevoaOnline.paradoxiaMissions()}catch(e){}
 profile=snapshot?.profile||await window.NevoaOnline.sessionProfile();
 if(!profile){nameEl.textContent="Explorador da Névoa";hint.textContent="Sua sessão expirou. Entre novamente para sincronizar a Jornada.";login.hidden=false;edit.hidden=true;avatarOpenAction.hidden=true;return}
 try{paintAvatar(profile.avatar_key||await window.NevoaOnline.profileAvatar())}catch(e){paintAvatar("avatar-01")}
 applyAvatarRank();nameEl.textContent=profile.nickname||"Explorador da Névoa";hint.textContent=(profile.class_name?profile.class_name+" • ":"")+rankInfo(profile.xp).name+" • jornada sincronizada";const syncedJourney=repaintJourney(profile.xp,snapshot?.progress||[],cloudRpg,missionRows);window.NevoaActivity?.baseline?.(syncedJourney.core);renderActivityChronicle();login.hidden=true;edit.hidden=false;avatarOpenAction.hidden=false;
}
avatarOpen.onclick=openAvatarEditor;avatarOpenAction.onclick=openAvatarEditor;avatarClose.onclick=closeAvatarEditor;edit.onclick=openEditor;cancel.onclick=closeEditor;
form.onsubmit=async e=>{e.preventDefault();if(!profile)return;const proposed=(input.value||"").replace(/\s+/g," ").trim();if(proposed.length<2||proposed.length>24){showStatus("Escolha um nome entre 2 e 24 caracteres.","bad");return}save.disabled=true;save.textContent="Salvando...";showStatus("A Névoa está verificando o novo nome...","info");try{const updated=await window.NevoaOnline.updateProfileName(proposed);profile=updated||await window.NevoaOnline.sessionProfile();nameEl.textContent=profile?.nickname||proposed;hint.textContent=(profile?.class_name?profile.class_name+" • ":"")+rankInfo(profile?.xp||localXp).name+" • jornada sincronizada";showStatus("✓ Nome atualizado com segurança.","ok");setTimeout(()=>{editor.hidden=true;showStatus("")},900)}catch(err){showStatus(err?.message||"Não foi possível alterar o nome agora.","bad")}finally{save.disabled=false;save.textContent="Salvar nome"}};
loadProfile().catch(()=>{hint.textContent="Não foi possível carregar sua conta agora.";login.hidden=false});
}
function teatro(){let stage=0;const scenes=[{who:"Sócrates",text:"Você afirma ter certeza. O que sustenta essa certeza?",choices:["Porque todo mundo concorda comigo.","Porque consigo apresentar razões e aceitar que sejam examinadas."]},{who:"Sócrates",text:"E se alguém mostrar uma objeção forte?",choices:["Ataco a pessoa que discordou.","Examino a objeção e reviso minha posição se necessário."]},{who:"Narrador",text:"O diálogo termina sem vencedor automático. O que mudou foi a qualidade das razões.",choices:[]}];shell("Teatro Filosófico","Pequenas cenas interativas em que o foco não é vencer uma luta, mas sustentar uma posição e lidar com objeções.",`<section class="section"><div class="wrap panel"><div class="eyebrow" id="speaker"></div><div class="dialogue" id="line"></div><div class="choices" id="choices"></div></div></section>`);const draw=()=>{const s=scenes[stage];$("#speaker").textContent=s.who;$("#line").textContent=s.text;$("#choices").innerHTML="";s.choices.forEach((c,i)=>{const b=document.createElement("button");b.textContent=c;b.onclick=()=>{if(i===1)NevoaUniverse.unlock("dialogo");stage=Math.min(stage+1,scenes.length-1);draw()};$("#choices").appendChild(b)});if(!s.choices.length)$("#choices").innerHTML='<a class="btn" href="teatro.html">Recomeçar cena</a>'};draw()}
function fonografo(){shell("Fonógrafo da Névoa","As trilhas do Portal vivem aqui. Faixas já conectadas podem ser ouvidas diretamente; as demais continuam preservadas no catálogo para futuras integrações.",`<section class="section"><div class="wrap grid">${D.tracks.map(x=>`<article class="card"><div class="icon">🎵</div><div class="meta">${x.status}</div><h3>${x.title}</h3><p>${x.where}</p>${x.src?`<audio controls preload="metadata" playsinline style="width:100%;margin-top:12px" aria-label="Ouvir ${x.title}"><source src="${x.src}" type="audio/mpeg">Seu navegador não suporta reprodução de áudio.</audio>`:""}</article>`).join("")}</div></section>`)}
function mapa(){
const discovered=(u.secrets||[]).length>0?" discovered":"";
shell("Grande Mapa do Portal","Agora o universo inteiro pode ser explorado como um único mundo. Toque em um marco iluminado para atravessar a névoa.",`
<section class="mapSection"><div class="wrap mapStage">
  <div class="mapToolbar">
    <p>🗺️ <b>Explore livremente.</b> No celular, arraste o mapa para os lados. Os círculos iluminados são portais clicáveis.</p>
    <div class="mapActions"><button class="btn subtle" id="centerMap">✦ Centralizar</button><button class="btn" id="fullMap">⛶ Tela do mapa</button></div>
  </div>
  <div class="mapViewport" id="mapViewport" tabindex="0" aria-label="Grande Mapa navegável do Portal Filosófico da Névoa">
    <div class="mapCanvas" id="mapCanvas">
      <div class="mapFallbackScene" aria-hidden="true"></div>
      <img class="mapArtwork" id="mapArtwork" src="assets/grande-mapa-portal.png" alt="Grande Mapa ilustrado do Portal Filosófico da Névoa" draggable="false">
      <div class="mapLoading">A névoa está revelando o mapa...</div>
      <div class="mapVignette"></div><div class="mapFog"></div>

      <a class="mapHotspot" style="--x:15%;--y:21%" href="../index.html#jogos" aria-label="Mansão Filosófica"><span class="pinIcon">🏚️</span><span class="pinLabel">Mansão Filosófica</span></a>
      <a class="mapHotspot" style="--x:48%;--y:27%" href="../jogos/plataforma-filosofica/" aria-label="Labirinto dos Filósofos"><span class="pinIcon">🎮</span><span class="pinLabel">Labirinto dos Filósofos</span></a>
      <a class="mapHotspot paradoxia" style="--x:80%;--y:18%" href="../jogos/paradoxia/" aria-label="Paradoxia"><span class="pinIcon">🏰</span><span class="pinLabel">Paradoxia</span></a>
      <a class="mapHotspot central" style="--x:49%;--y:46%" href="index.html" aria-label="Praça Central da Névoa"><span class="pinIcon">✦</span><span class="pinLabel">Praça Central da Névoa</span></a>
      <a class="mapHotspot" style="--x:12%;--y:51%" href="museu.html" aria-label="Museu dos Filósofos"><span class="pinIcon">🏛️</span><span class="pinLabel">Museu dos Filósofos</span></a>
      <a class="mapHotspot" style="--x:90%;--y:48%" href="grimorio.html" aria-label="Grimório do Explorador"><span class="pinIcon">📖</span><span class="pinLabel">Grimório do Explorador</span></a>
      <a class="mapHotspot" style="--x:14%;--y:72%" href="teatro.html" aria-label="Teatro Filosófico"><span class="pinIcon">🎭</span><span class="pinLabel">Teatro Filosófico</span></a>
      <a class="mapHotspot" style="--x:38%;--y:84%" href="fonografo.html" aria-label="Fonógrafo da Névoa"><span class="pinIcon">🎵</span><span class="pinLabel">Fonógrafo da Névoa</span></a>
      <a class="mapHotspot teacher" style="--x:62%;--y:79%" href="professor.html?v=15" aria-label="Torre do Professor"><span class="pinIcon">🧙</span><span class="pinLabel">Torre do Professor</span></a>
      <a class="mapHotspot secret${discovered}" style="--x:88%;--y:72%" href="segredos.html" aria-label="Cemitério dos Segredos"><span class="pinIcon">🔐</span><span class="pinLabel">Cemitério dos Segredos</span></a>
      <a class="mapHotspot" style="--x:29%;--y:61%" href="../grimorio-de-colorir/" aria-label="Ateliê do Grimório"><span class="pinIcon">🎨</span><span class="pinLabel">Ateliê do Grimório</span></a>
      <a class="mapHotspot discovered" style="--x:72%;--y:59%" href="../salao-da-nevoa.html" aria-label="Salão da Névoa"><span class="pinIcon">🦉</span><span class="pinLabel">Salão da Névoa</span></a>
      <a class="mapHotspot central" style="--x:51%;--y:66%" href="perfil.html" aria-label="Casa do Explorador"><span class="pinIcon">🧙</span><span class="pinLabel">Casa do Explorador</span></a>
    </div>
  </div>
  <div class="mapLegend" aria-label="Atalhos do mapa">
    <a href="../index.html#jogos"><span>🏚️</span>Mansão</a>
    <a href="../jogos/plataforma-filosofica/"><span>🎮</span>Labirinto</a>
    <a href="../jogos/paradoxia/"><span>🏰</span>Paradoxia</a>
    <a href="grimorio.html"><span>📖</span>Grimório</a>
    <a href="museu.html"><span>🏛️</span>Museu</a>
    <a href="teatro.html"><span>🎭</span>Teatro</a>
    <a href="fonografo.html"><span>🎵</span>Fonógrafo</a>
    <a href="professor.html?v=15"><span>🧙</span>Professor</a>
    <a href="segredos.html"><span>🔐</span>Segredos</a>
    <a href="../grimorio-de-colorir/"><span>🎨</span>Colorir</a>
    <a href="../salao-da-nevoa.html"><span>🦉</span>Salão</a>
    <a href="perfil.html"><span>🧙</span>Meu Perfil</a>
  </div>
</div></section>`);

const vp=$("#mapViewport"),canvas=$("#mapCanvas"),art=$("#mapArtwork");
const center=()=>{vp.scrollLeft=Math.max(0,(vp.scrollWidth-vp.clientWidth)/2);vp.scrollTop=Math.max(0,(vp.scrollHeight-vp.clientHeight)/2)};
art.addEventListener("load",()=>canvas.classList.add("artReady"));
art.addEventListener("error",()=>canvas.classList.add("noArt"));
$("#centerMap").onclick=center;
$("#fullMap").onclick=async()=>{try{if(!document.fullscreenElement)await vp.requestFullscreen();else await document.exitFullscreen()}catch(e){}};
requestAnimationFrame(()=>{if(innerWidth<760)center()});
}
function segredos(){
 shell("O Cemitério dos Segredos","Entre as lápides, uma conversa pode abrir caminhos que uma resposta pronta não abre.",`<section class="section secretSection"><div class="wrap"><div class="secretFriendLayout">
   <aside class="secretStage panel secretFriendStage">
     <div class="secretGhostScene">
       <div class="secretBubble" id="secretGhostLine">He-he! Agora eu prefiro uma boa conversa a um enigma.</div>
       <img class="secretGhost" id="secretGhost" src="assets/segredos/fantasma-talk-00.webp" alt="Amigo da Névoa, fantasma de conversa do Portal">
     </div>
     <div class="secretFriendIdentity">
       <div class="eyebrow">✦ AMIGO DA NÉVOA</div>
       <h2>Converse com quem mora entre as lápides.</h2>
       <p>Pergunte, discorde, peça exemplos ou simplesmente pense em voz alta.</p>
       <div class="secretFriendControls">
         <button class="btn subtle" id="secretVoiceToggle" type="button" aria-label="Voz" title="Voz">🔊</button>
         <button class="btn subtle" id="secretMusicToggle" type="button" aria-label="Trilha sonora" title="Conversas Entre Lápides">🎵</button>
         <button class="btn subtle" id="secretDeepToggle" type="button" aria-label="Modo de conversa" title="Modo ágil / reflexão profunda">⚡</button>
         <button class="btn subtle" id="secretClearChat" type="button" aria-label="Nova conversa" title="Nova conversa">↻</button>
       </div>
       <small class="secretFriendTransparency">Uma conversa, um único cérebro: o Amigo da Névoa mantém o fio do que você diz sem alternar entre modos de resposta. A conversa fica nesta sessão.</small>
     </div>
   </aside>

   <section class="panel secretChatPanel" aria-label="Conversa com o Amigo da Névoa">
     <header class="secretChatHead">
       <div><div class="eyebrow">CONVERSA À LUZ DA LUA</div><h2>O que está passando pela sua cabeça?</h2></div>
       <span class="secretAiStatus" id="secretAiStatus">verificando...</span>
     </header>

     <div class="secretTopics" aria-label="Temas do Amigo da Névoa">
       <button type="button" data-secret-prompt="Quero conversar sobre uma pergunta filosófica interessante.">Filosofia</button>
       <button type="button" data-secret-prompt="Conte um episódio histórico interessante e vamos conversar sobre por que ele importa.">História</button>
       <button type="button" data-secret-prompt="Quero conversar sobre literatura. Me faça uma pergunta boa sobre livros, personagens ou ideias.">Literatura</button>
       <button type="button" data-secret-prompt="Quero entender melhor um tema de sociologia a partir do cotidiano.">Sociologia</button>
       <button type="button" data-secret-prompt="Quero aprender educação financeira de um jeito simples e sem papo de enriquecer rápido.">Educação financeira</button>
     </div>

     <div class="secretChatLog" id="secretChatLog" aria-live="polite"></div>

     <form class="secretComposer" id="secretComposer">
       <button class="secretMic" id="secretMic" type="button" title="Falar com o Amigo da Névoa" aria-label="Falar com o Amigo da Névoa">🎙️</button>
       <textarea id="secretMessage" rows="2" maxlength="1200" placeholder="Sussurre alguma coisa à Névoa..."></textarea>
       <button class="btn secretSend" id="secretSend" type="submit" aria-label="Enviar mensagem" title="Enviar">➤</button>
     </form>
     <div class="secretChatHint" id="secretChatHint">Escreva ou fale. O Amigo da Névoa acompanha o fio da conversa.</div>
   </section>
 </div></div></section>`);

 const REMOTE_AI_URL=String(window.NEVOA_AI_ENDPOINT||"").trim();

 const ghost=$("#secretGhost"),bubble=$("#secretGhostLine"),log=$("#secretChatLog"),form=$("#secretComposer"),input=$("#secretMessage"),status=$("#secretAiStatus"),send=$("#secretSend"),mic=$("#secretMic");
 const secretSprites={
   idle:"assets/segredos/fantasma-talk-00.webp",
   talk:"assets/segredos/fantasma-talk-04.webp",
   blink:"assets/segredos/fantasma-blink.webp",
   explain:"assets/segredos/fantasma-explain.webp",
   eureka:"assets/segredos/fantasma-eureka.webp",
   lantern:"assets/segredos/fantasma-lantern.webp"
 };
 const {idle:idleSrc,talk:talkSrc,blink:blinkSrc,explain:explainSrc,eureka:eurekaSrc,lantern:lanternSrc}=secretSprites;
 const spriteCache=new Map();
 Object.values(secretSprites).forEach(src=>{
   const img=new Image();
   img.decoding="async";
   img.src=src;
   const ready=typeof img.decode==="function"?img.decode().catch(()=>{}):Promise.resolve();
   spriteCache.set(src,{img,ready});
 });
 let ghostSpriteRequest=0;
 if(ghost){
   ghost.dataset.sprite=idleSrc;
   ghost.style.visibility="visible";
   ghost.style.opacity="1";
   ghost.addEventListener("error",()=>{
     ghost.style.visibility="visible";
     ghost.style.opacity="1";
     ghost.classList.remove("secretGhostPop");
     if(ghost.dataset.sprite!==idleSrc){
       ghost.dataset.sprite=idleSrc;
       ghost.src=idleSrc;
     }
   });
   ghost.addEventListener("load",()=>{
     ghost.style.visibility="visible";
     ghost.style.opacity="1";
   });
 }
 let speakingTimer=null,poseTimer=null,blinkTimer=null,busy=false,voiceOn=true,musicOn=true,history=[];
 const friendMusic=new Audio("assets/audio/amigo-da-nevoa/conversas-entre-lapides.mp3");
 friendMusic.loop=true;
 friendMusic.preload="metadata";
 friendMusic.volume=.18;
 try{voiceOn=localStorage.getItem("nevoaFriendVoice")!=="off"}catch(e){}
 try{musicOn=localStorage.getItem("nevoaFriendMusic")!=="off"}catch(e){}
 try{const saved=JSON.parse(sessionStorage.getItem("nevoaFriendHistory")||"[]");if(Array.isArray(saved))history=saved.slice(-12)}catch(e){}

 function portalSession(){try{return(localStorage.getItem("nevoaStudentSession")||"").trim()}catch(e){return""}}
 function esc(v){return String(v).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]))}
 function saveHistory(){try{sessionStorage.setItem("nevoaFriendHistory",JSON.stringify(history.slice(-12)))}catch(e){}}
 function clearGhostTimers(){
   if(speakingTimer){clearInterval(speakingTimer);speakingTimer=null}
   if(poseTimer){clearTimeout(poseTimer);poseTimer=null}
   if(blinkTimer){clearTimeout(blinkTimer);blinkTimer=null}
 }
 function setGhostSprite(src,pop=false){
   if(!ghost||!src)return;
   ghost.style.visibility="visible";
   ghost.style.opacity="1";
   const animate=()=>{
     if(!pop)return;
     ghost.classList.remove("secretGhostPop");
     void ghost.offsetWidth;
     ghost.classList.add("secretGhostPop");
     setTimeout(()=>ghost&&ghost.classList.remove("secretGhostPop"),430);
   };
   if(ghost.dataset.sprite===src){animate();return}
   const request=++ghostSpriteRequest;
   const apply=()=>{
     if(request!==ghostSpriteRequest||!ghost)return;
     ghost.dataset.sprite=src;
     ghost.src=src;
     ghost.style.visibility="visible";
     ghost.style.opacity="1";
     animate();
   };
   const cached=spriteCache.get(src);
   if(cached&&cached.img.complete&&cached.img.naturalWidth>0)apply();
   else if(cached)cached.ready.then(apply).catch(()=>{});
   else apply();
 }
 function scheduleBlink(){
   if(blinkTimer)clearTimeout(blinkTimer);
   blinkTimer=setTimeout(()=>{
     if(!busy&&!speakingTimer&&!poseTimer&&ghost){
       setGhostSprite(blinkSrc);
       setTimeout(()=>{if(!busy&&!speakingTimer&&!poseTimer)setGhostSprite(idleSrc)},145);
     }
     scheduleBlink();
   },2600+Math.random()*2600);
 }
 function stopTalking(finalSrc=idleSrc){
   if(speakingTimer){clearInterval(speakingTimer);speakingTimer=null}
   if(poseTimer){clearTimeout(poseTimer);poseTimer=null}
   setGhostSprite(finalSrc);
   scheduleBlink();
 }
 function showGhostPose(src,duration=900){
   clearGhostTimers();
   setGhostSprite(src,true);
   poseTimer=setTimeout(()=>{poseTimer=null;setGhostSprite(idleSrc);scheduleBlink()},duration);
 }
 function animateTalking(){
   clearGhostTimers();
   let open=false;
   speakingTimer=setInterval(()=>{open=!open;setGhostSprite(open?talkSrc:idleSrc)},115+Math.floor(Math.random()*45));
 }
 function bubbleText(text){
   if(!bubble)return;
   const clean=String(text||"").replace(/\s+/g," ").trim();
   bubble.textContent=clean.length>190?clean.slice(0,187)+"…":clean;
 }
 function setMusicVolume(value){
   friendMusic.volume=Math.max(0,Math.min(1,value));
 }
 function updateMusicToggle(){
   const btn=$("#secretMusicToggle");if(!btn)return;
   btn.textContent=musicOn?"🎵":"♫";
   btn.setAttribute("aria-pressed",musicOn?"true":"false");
 }
 async function tryPlayMusic(){
   if(!musicOn||!friendMusic.paused)return;
   try{await friendMusic.play()}catch(e){}
 }
 function restoreMusic(){
   if(musicOn)setMusicVolume(.18);
 }
 function preferredVoice(){
   if(!("speechSynthesis" in window))return null;
   const voices=window.speechSynthesis.getVoices()||[];
   const pt=voices.filter(v=>/^pt(-|_)?BR/i.test(v.lang||""));
   return pt[0]||voices.find(v=>/^pt/i.test(v.lang||""))||null;
 }
 function replyPose(text){
   const t=String(text||"").toLowerCase();
   return /(acert|parab|excelente|isso mesmo|boa|brilh|conseguiu|eureka)/.test(t)?eurekaSrc:explainSrc;
 }
 function speak(text,leadSrc=explainSrc){
   bubbleText(text);
   if(musicOn)setMusicVolume(.065);
   if(!voiceOn||!("speechSynthesis" in window)){showGhostPose(leadSrc,1150);restoreMusic();return}
   window.speechSynthesis.cancel();
   clearGhostTimers();
   setGhostSprite(leadSrc,true);
   const u=new SpeechSynthesisUtterance(text);
   u.lang="pt-BR";u.rate=.97;u.pitch=.88;u.volume=1;
   const v=preferredVoice();if(v)u.voice=v;
   u.onstart=animateTalking;
   u.onboundary=()=>{if(!speakingTimer)animateTalking()};
   u.onend=()=>{stopTalking();restoreMusic()};
   u.onerror=()=>{stopTalking();restoreMusic()};
   poseTimer=setTimeout(()=>{poseTimer=null;window.speechSynthesis.speak(u)},360);
 }
 function addMessage(role,text,save=true){
   const item=document.createElement("article");
   item.className="secretMsg "+(role==="assistant"?"fromGhost":"fromUser");
   item.innerHTML=(role==="assistant"?'<div class="secretMsgAvatar" aria-hidden="true">✦</div>':'')+'<div class="secretMsgBody"><b>'+(role==="assistant"?"Amigo da Névoa":"Você")+'</b><p>'+esc(text).replace(/\n/g,"<br>")+'</p></div>';
   log.appendChild(item);log.scrollTop=log.scrollHeight;
   if(save){history.push({role:role,content:text});history=history.slice(-12);saveHistory()}
 }
 function renderHistory(){
   log.innerHTML="";
   if(history.length){history.forEach(m=>addMessage(m.role,m.content,false));return}
   addMessage("assistant","He-he! Pode chegar. Não tenho missão, prova nem resposta certa escondida. Só gosto de conversar sobre ideias. Quer começar por alguma coisa que anda passando pela sua cabeça?",false);
 }
 function setStatus(text,state){
   status.textContent=text;status.dataset.state=state||"";
 }
 function setBusy(on){
   busy=on;send.disabled=on;mic.disabled=on;
   send.textContent=on?"…":"➤";
   if(on){
     setStatus("pensando na névoa...","busy");
     clearGhostTimers();
     if(ghost){
       ghost.style.visibility="visible";
       ghost.style.opacity="1";
       ghost.classList.remove("secretGhostPop");
       ghost.classList.add("secretGhostThinking");
     }
   }else{
     if(ghost)ghost.classList.remove("secretGhostThinking");
     setStatus(REMOTE_AI_URL?"✦ IA da Névoa • pronta":(deepMode?(localAIReady?"modo profundo • pronto":(localAIFailed?"modo ágil • pronto":"modo profundo • preparando")):"⚡ conversa ágil • pronta"),"ready");
     stopTalking();
   }
 }
 async function askFriendFallback(message){
   const raw=String(message||"").trim();
   const n=raw.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
   const pick=a=>a[Math.floor(Math.random()*a.length)];
   const has=(...words)=>words.some(w=>n.includes(w));
   const previousUser=[...history].slice(0,-1).reverse().find(x=>x.role==="user");
   const previousGhost=[...history].slice(0,-1).reverse().find(x=>x.role==="assistant");
   const previousContext=normalizeAIText((previousUser?.content||"")+" "+(previousGhost?.content||""));
   const context=n+" "+previousContext;
   const short=n.split(/\\s+/).filter(Boolean).length<=7;
   const claim=raw
     .replace(/^\\s*(eu\\s+)?(acho|penso|acredito|considero|pra mim|para mim)(\\s+que)?\\s*/i,"")
     .replace(/^\\s*(sim|não|nao|talvez|depende)[,.:;!?-]*\\s*/i,"")
     .trim();
   const topic=/(mentir|mentira|moral|etica|ética|certo|errado|bem|mal|dever)/.test(context)?"ética":
     /(verdade|certeza|saber|conhecimento|prova|opiniao|opinião|duvida|dúvida)/.test(context)?"conhecimento":
     /(liberdade|livre|escolh|autonom|influenc|determin|destino)/.test(context)?"liberdade":
     /(justica|justiça|igualdade|equidade|direito)/.test(context)?"justiça":
     /(sociedade|cultura|grupo|preconceito|desigualdade|norma social)/.test(context)?"sociedade":
     /(historia|histórico|historico|histórica|historica|passado|revolucao|revolução|guerra|imperio|império)/.test(context)?"história":
     /(literatura|poema|poesia|romance|conto|personagem|livro)/.test(context)?"literatura":
     /(dinheiro|juros|divida|dívida|orcamento|orçamento|comprar|economizar)/.test(context)?"finanças":"ideias";
   const topicInsight={
     "ética":"Aqui aparece uma diferença importante entre julgar o ato em si e julgar suas consequências. Dependendo do critério moral usado, a mesma situação pode mudar bastante.",
     "conhecimento":"O ponto interessante é separar convicção de justificação: sentir certeza não é a mesma coisa que ter boas razões ou evidências.",
     "liberdade":"Você tocou numa tensão clássica: escolher não significa necessariamente escolher sem influências. A pergunta é quanto dessas influências ainda deixa espaço para autonomia.",
     "justiça":"Aqui vale separar tratar todos exatamente igual de considerar diferenças relevantes. Justiça e igualdade podem caminhar juntas, mas não significam sempre a mesma coisa.",
     "sociedade":"Aí entra um olhar sociológico: uma escolha pode parecer totalmente individual e, ao mesmo tempo, carregar hábitos, expectativas e pressões do grupo.",
     "história":"Em história, vale distinguir o acontecimento das interpretações sobre ele. Fontes diferentes podem iluminar partes diferentes do mesmo processo.",
     "literatura":"Na literatura, essa leitura ganha força quando conseguimos ligá-la à voz, às escolhas e aos conflitos do texto — não apenas ao que sentimos sobre ele.",
     "finanças":"Em educação financeira, a decisão melhora quando saímos do 'cabe a parcela?' e olhamos custo total, prazo, prioridade e o que estamos deixando de fazer com esse dinheiro.",
     "ideias":"O pedaço mais interessante da sua fala é o critério por trás dela: o que faria essa ideia continuar valendo quando mudamos o exemplo?"
   };

   // Intenções dos botões de tema: responda ao pedido, não devolva uma pergunta genérica.
   if(/episodio historico|episódio histórico|episodio histórico|episódio historico/.test(raw.toLowerCase())||(/\\bconte\\b/.test(n)&&/historic/.test(n))){
     return "Então vem comigo para 1791, em Saint-Domingue, colônia francesa no Caribe. Uma grande revolta de pessoas escravizadas iniciou o processo que, depois de anos de guerra, levou à independência do Haiti em 1804. Isso importa porque colocou uma contradição enorme diante do mundo atlântico: como falar em liberdade e igualdade enquanto a escravidão continuava existindo? Agora a parte interessante: você acha que ideias de liberdade mudam a história sozinhas, ou precisam de pessoas organizadas para ganhar força?";
   }
   if(/pergunta filosofic|conversar sobre uma pergunta filosofic/.test(n)){
     return "He-he… então vou começar com uma que parece simples e fica perigosa quando a gente mexe nela: se uma regra é injusta, desobedecê-la pode ser a atitude mais justa? Pense primeiro no critério: quem decide que a regra é injusta — e como essa pessoa justificaria isso para quem discorda?";
   }
   if(/conversar sobre literatura/.test(n)&&/pergunta/.test(n)){
     return "Vamos de literatura. Um personagem precisa ser admirável para ser um grande personagem? Pense em alguém de um livro, conto, filme ou peça que faça coisas questionáveis, mas ainda assim seja interessante. O que prende você nele: identificação, curiosidade, conflito ou outra coisa?";
   }
   if(/tema de sociologia/.test(n)&&/cotidiano/.test(n)){
     return "Vamos começar por algo cotidiano: o jeito como nos vestimos parece uma escolha pessoal, mas família, grupo, trabalho, escola, moda e condição econômica também influenciam. A sociologia entra justamente nessa passagem entre o individual e o social. Escolha uma coisa que você faz 'porque gosta' — música, roupa, gíria, comida — e vamos investigar quanto dessa preferência nasceu só de você.";
   }
   if(/educacao financeira/.test(n)&&/enriquecer rapido/.test(n)){
     return "Perfeito: sem fórmula mágica. Educação financeira começa menos com 'como ficar rico?' e mais com entender escolhas, prazo, risco e custo. Um exemplo: uma compra cabe na parcela, mas isso não significa que ela cabe no orçamento — o custo total e o que você deixa de fazer com aquele dinheiro também importam. Quer testar isso com uma compra fictícia de R$ 300?";
   }

   const developIntent=/desenvolv|aprofunda|aprofunde|explica melhor|explique melhor|fala mais|fale mais|continua|continue|vai alem|vai além|detalha|detalhe/.test(n);
   const exampleIntent=/me da um exemplo|me dê um exemplo|da um exemplo|dá um exemplo|exemplo concreto|por exemplo/.test(n);
   const objectionIntent=/discorda|discorde|objecao|objeção|contrario|contrário|me desafia|me desafie/.test(n);
   const topicDevelop={
     "ética":"Vamos desenvolver de verdade. Em ética, uma mesma escolha pode ser julgada por lentes diferentes: uma pergunta se o ato respeita um dever; outra olha as consequências; outra pergunta que tipo de caráter essa escolha revela. Por isso duas pessoas podem condenar a mesma mentira por razões completamente diferentes — e também podem aceitar exceções diferentes. O ponto forte de uma posição aparece quando ela consegue explicar não só o caso fácil, mas também o caso-limite.",
     "conhecimento":"Vamos mais fundo. Ter certeza é um estado psicológico; ter conhecimento exige alguma forma de justificação. Eu posso estar absolutamente convencido e ainda assim estar errado. Por isso a filosofia pergunta não apenas ‘você acredita?’, mas ‘que razão torna essa crença confiável?’. Evidência, experiência, coerência e possibilidade de erro entram justamente aí.",
     "liberdade":"Vamos desenvolver. Influência e ausência de liberdade não são a mesma coisa. Imagine escolher uma profissão porque sua família valoriza estabilidade: existe influência, claro, mas você ainda pode reconhecer essa pressão, compará-la com outros desejos e até rejeitá-la. A autonomia aparece nesse espaço de reflexão. O problema fica mais difícil quando as influências são tão profundas que parecem simplesmente ‘nossas’. A pergunta então muda: ser livre é não sofrer influência ou conseguir examiná-la e responder a ela?",
     "justiça":"Vamos aprofundar. Justiça não é apenas dar a mesma coisa a todos. Às vezes aplicar exatamente a mesma regra preserva uma desigualdade que já existia; em outros casos, abrir exceções pode criar privilégios. Por isso precisamos dizer qual critério estamos usando: igualdade, necessidade, mérito, direitos, reparação? O debate começa a ficar filosófico quando dois critérios razoáveis entram em conflito.",
     "sociedade":"Vamos desenvolver. A sociologia não diz que somos marionetes da sociedade. Ela pergunta como preferências pessoais se formam dentro de redes de família, escola, classe, mídia, religião, amigos e instituições. Você ainda age, escolhe e interpreta — mas nunca começa do zero. O interessante é justamente estudar a tensão entre agência individual e estruturas sociais.",
     "história":"Vamos aprofundar historicamente. Um acontecimento não ganha significado apenas pela sequência de datas. Precisamos perguntar quem participou, quais interesses estavam em conflito, que condições tornaram aquilo possível e quais fontes sobreviveram. Duas interpretações podem usar evidências reais e ainda discordar porque dão pesos diferentes a causas e atores.",
     "literatura":"Vamos desenvolver. Uma interpretação literária fica forte quando liga uma ideia a escolhas concretas da obra: narrador, linguagem, imagens, conflitos, silêncios e contexto. Não basta dizer ‘para mim significa isso’; a leitura precisa mostrar como o texto sustenta essa possibilidade. Ao mesmo tempo, textos complexos podem sustentar mais de uma interpretação bem argumentada.",
     "finanças":"Vamos aprofundar. Uma decisão financeira não é só matemática: envolve tempo, risco, prioridade e comportamento. Uma parcela pequena pode esconder um custo total grande; guardar tudo pode sacrificar necessidades presentes; gastar tudo pode eliminar opções futuras. A pergunta útil é: que escolha preserva melhor seus objetivos sem ignorar os limites de hoje?",
     "ideias":"Vamos desenvolver sem repetir o que eu já disse. Uma ideia fica mais forte quando conseguimos separar três camadas: a afirmação, a razão que a sustenta e o limite em que ela deixaria de valer. Se só repetimos a afirmação, não avançamos. Quando encontramos o limite, descobrimos qual é realmente o princípio por trás dela."
   };
   const topicExample={
     "ética":"Exemplo concreto: esconder uma pessoa inocente de alguém que pretende machucá-la e mentir sobre onde ela está. Uma ética focada em deveres pode desconfiar da mentira em si; uma ética consequencialista tende a pesar o dano evitado. O exemplo serve justamente porque força os critérios a aparecer.",
     "conhecimento":"Exemplo: você olha pela janela, vê a rua molhada e conclui que choveu. É uma conclusão razoável, mas a rua poderia ter sido lavada. A crença pode ser verdadeira e ainda ter uma justificativa frágil. É aí que ‘achar’, ‘ter razão’ e ‘saber’ começam a se separar.",
     "liberdade":"Exemplo: dois alunos escolhem o mesmo curso. Um nunca considerou outra opção porque ouviu a vida inteira que aquela era a única profissão respeitável; o outro ouviu a mesma pressão, pesquisou alternativas e decidiu ficar com ela. O resultado é igual, mas o processo de autonomia pode ser bem diferente.",
     "justiça":"Exemplo: dar exatamente 30 minutos de prova para todos parece igualdade. Mas se existe uma necessidade educacional legitimamente reconhecida que exige tempo adicional, tratar todos de forma idêntica pode não produzir uma condição justa. A dificuldade é definir quais diferenças são relevantes.",
     "sociedade":"Exemplo: dizer ‘eu escolhi meu estilo musical sozinho’ parece simples. Mas algoritmo, amigos, família, idioma, bairro e geração ajudaram a definir quais músicas chegaram até você. Isso não elimina seu gosto; mostra de onde veio o repertório dentro do qual você escolheu.",
     "história":"Exemplo: uma greve pode aparecer numa fonte oficial como problema de ordem pública e, nas cartas dos trabalhadores, como luta por condições de vida. Nenhuma fonte deve ser aceita automaticamente como ‘a história inteira’; o trabalho histórico compara contexto, autoria, interesse e evidência.",
     "literatura":"Exemplo: um narrador diz que está perfeitamente calmo enquanto sua linguagem fica cada vez mais fragmentada e obsessiva. O leitor pode desconfiar dele não porque ‘sentiu’, mas porque a própria forma do texto cria evidências para essa leitura.",
     "finanças":"Exemplo: um celular de R$ 1.200 à vista ou 12 parcelas de R$ 120. A parcela parece menor, mas o total vira R$ 1.440. Antes de decidir, ainda falta perguntar se os R$ 1.200 fariam falta para algo mais importante e qual é o custo de abrir mão dessa alternativa.",
     "ideias":"Exemplo: ‘regras devem sempre ser obedecidas’. Parece claro até surgir uma regra injusta. O caso-limite não destrói automaticamente a ideia; ele obriga a reformulá-la: quais regras, em quais condições e com qual justificativa?"
   };
   if(developIntent&&previousGhost){
     return topicDevelop[topic]+" Se quiser continuar daqui, eu posso agora defender essa ideia, atacá-la com uma objeção ou aplicar num caso concreto.";
   }
   if(exampleIntent&&previousGhost){
     return topicExample[topic]+" Agora temos algo concreto para testar, em vez de ficar girando em frases abstratas.";
   }
   if(objectionIntent&&previousGhost){
     return "Então eu vou fazer o papel do opositor, sem repetir sua resposta. "+({
       "ética":"Uma objeção é que abrir exceções com base nas consequências pode permitir que cada pessoa justifique o próprio interesse dizendo que ‘era para um bem maior’. Como impedir esse abuso?",
       "conhecimento":"Uma objeção é que exigir justificações cada vez mais fortes pode levar a uma regressão infinita: toda razão precisaria de outra razão. Em algum ponto, em que confiamos?",
       "liberdade":"Uma objeção é que até a capacidade de ‘refletir sobre as influências’ foi formada por outras influências. Se isso for verdade, chamar essa reflexão de autonomia resolve o problema ou apenas o empurra um passo para trás?",
       "justiça":"Uma objeção é que adaptar regras a diferenças individuais pode tornar o critério imprevisível ou favorecer quem consegue reivindicar melhor uma exceção. Como preservar equidade sem perder imparcialidade?",
       "sociedade":"Uma objeção é que explicar demais pelo contexto social pode apagar responsabilidade individual. Em que momento a influência deixa de explicar e começa a virar desculpa?",
       "história":"Uma objeção é que reconhecer múltiplas interpretações não significa que todas sejam igualmente boas. Algumas ignoram fontes ou distorcem evidências. Que critério separa interpretação legítima de invenção?",
       "literatura":"Uma objeção é que aceitar muitas leituras pode virar ‘qualquer coisa vale’. O limite deveria estar nas evidências do texto: até onde sua interpretação consegue apontá-las?",
       "finanças":"Uma objeção é que a decisão matematicamente mais econômica nem sempre é a melhor para a vida da pessoa. Como incluir bem-estar e urgência sem transformar qualquer gasto em justificável?",
       "ideias":"Minha objeção seria simples: qual evidência faria você abandonar essa ideia? Se a resposta for ‘nenhuma’, talvez estejamos diante de uma crença protegida contra qualquer teste."
     })[topic];
   }

   if(/^(depende|depende disso|depende da situacao|depende da situação)[.!?]*$/.test(n)||n.startsWith("depende ")){
     return "Esse ‘depende’ é importante: você saiu de uma regra absoluta e colocou um critério no meio. "+topicInsight[topic]+" Então a conversa fica mais precisa se descobrirmos: depende exatamente de quê?";
   }
   if(/\\b(mas|porem|porém|so que|só que|entretanto)\\b/.test(n)&&claim.length>8){
     return "O seu ‘mas’ é justamente a parte mais interessante: ele mostra que você percebeu um limite na primeira ideia. "+topicInsight[topic]+" Se eu transformasse isso numa regra, qual seria a exceção que você não aceitaria?";
   }
   if(/\\bporque\\b|\\bpor que eu\\b|\\bpois\\b/.test(n)&&claim.length>10){
     const reason=(raw.split(/porque|pois/i)[1]||claim).trim().replace(/[.!?]+$/,"");
     return "Agora você me deu uma razão, não só uma resposta: “"+reason.slice(0,115)+"”. Isso deixa a conversa bem melhor. "+topicInsight[topic]+" Essa mesma razão valeria se as pessoas envolvidas fossem trocadas de lugar?";
   }
   if(/^(sim|concordo|acho que sim|com certeza)[.!?]*$/.test(n)&&previousGhost){
     return "Entendi — você está aceitando a ideia anterior, mas quero ver até onde ela aguenta. "+topicInsight[topic]+" Consegue imaginar um caso em que você responderia o contrário?";
   }
   if(/^(nao|não|discordo|acho que nao|acho que não)[.!?]*$/.test(n)&&previousGhost){
     return "Então você encontrou um limite na ideia anterior. Isso é mais interessante do que um simples ‘não’. "+topicInsight[topic]+" Qual parte exatamente não funciona para você?";
   }
   if(/^(talvez|nao sei|não sei|sei la|sei lá)[.!?]*$/.test(n)&&previousGhost){
     return "Esse ‘talvez’ não é fraqueza; ele mostra que ainda faltou um critério. "+topicInsight[topic]+" Vamos testar com um caso concreto: o que precisaria mudar na situação para você ter certeza?";
   }
   if(/^(eu\\s+)?(acho|penso|acredito|considero|pra mim|para mim)\\b/.test(n)&&claim.length>5){
     return "Entendi sua posição: “"+claim.slice(0,125).replace(/[.!?]+$/,"")+"”. "+topicInsight[topic]+" Agora quero testar a força dela: qual seria a melhor objeção que alguém poderia fazer contra essa ideia?";
   }
   if(short&&previousGhost&&previousGhost.content.includes("?")&&raw.length>2&&!n.endsWith("?")){
     return topicInsight[topic]+" Vou avançar um passo, não repetir: escolha o ponto que você quer testar agora — um exemplo concreto, uma objeção forte ou a consequência dessa ideia.";
   }

   const questions={
     filosofia:[
       "Se ninguém pudesse descobrir sua escolha, você ainda faria o que considera certo?",
       "Uma opinião continua sendo sua quando nasceu de algo que todo mundo ao redor repete?",
       "O que vale mais: ter certeza ou saber explicar por que você pensa assim?",
       "Se uma mentira evita sofrimento, ela deixa de ser errada?"
     ],
     historia:[
       "Quando estudamos uma revolução, devemos olhar primeiro para os líderes ou para a vida das pessoas comuns?",
       "Por que duas pessoas podem contar o mesmo acontecimento histórico de maneiras diferentes?",
       "Uma sociedade aprende com o passado ou apenas repete problemas com novas roupas?"
     ],
     literatura:[
       "Um personagem precisa ser uma boa pessoa para ser um bom personagem?",
       "Quando um final fica em aberto, isso empobrece a história ou convida o leitor a participar?",
       "Uma obra antiga pode continuar falando de problemas atuais? Dê um exemplo."
     ],
     sociologia:[
       "Quanto das nossas escolhas é realmente individual e quanto vem do grupo em que vivemos?",
       "Uma regra social precisa estar escrita para influenciar nosso comportamento?",
       "Por que algo considerado normal em um grupo pode parecer estranho em outro?"
     ],
     financas:[
       "Se você recebe R$ 100 e quer muito algo de R$ 80, que perguntas faria antes de comprar?",
       "Qual é a diferença entre querer uma coisa e precisar dela?",
       "Guardar dinheiro sempre significa deixar de aproveitar o presente?"
     ]
   };
   const topicQuestion=topic=>{
     const q=pick(questions[topic]);
     const names={filosofia:"filosófica",historia:"histórica",literatura:"literária",sociologia:"sociológica",financas:"financeira"};
     return "He-he! Então vamos de conversa "+names[topic]+". "+q;
   };

   if(/^(oi|olá|ola|e aí|e ai|salve)[!,. ]*$/.test(raw.toLowerCase())||has("bom dia","boa tarde","boa noite")){
     return pick([
       "Opa! A lápide estava confortável, mas uma boa conversa é melhor. Quer filosofia, história, literatura, sociologia ou educação financeira?",
       "He-he! Bem-vindo ao meu cantinho da névoa. Escolha um assunto ou me faça uma pergunta.",
       "Olá! Prometo não assombrar sua nota. Quer responder uma pergunta curiosa ou me perguntar alguma coisa?"
     ]);
   }
   if(has("quem e voce","quem é você","seu nome","como voce se chama","como você se chama")){
     return "Eu sou o Amigo da Névoa, o fantasma tagarela deste cemitério. Fui feito para puxar conversas, lançar perguntas e explicar ideias sem precisar de internet ou chave de IA.";
   }
   if(has("filosofia","filosofico","filosófico","filosofica","filosófica","socrates","sócrates","platao","platão","aristoteles","aristóteles","descartes","hume")){
     if(has("o que e filosofia","o que é filosofia")) return "Filosofia é investigar ideias e problemas usando perguntas, conceitos e argumentos. Em vez de aceitar o óbvio de primeira, ela pergunta: por quê? como sabemos? poderia ser diferente? Agora eu devolvo: qual ideia parece óbvia para você até começarmos a questioná-la?";
     if(has("socrates","sócrates")) return "Sócrates ficou famoso por investigar ideias por meio de perguntas e diálogo. Em vez de simplesmente entregar respostas, ele pressionava definições e justificativas. Então aqui vai uma bem socrática: o que é justiça para você — e sua definição funciona em todos os casos?";
     if(has("descartes")) return "Descartes usou a dúvida como método: queria descobrir se existia alguma certeza capaz de resistir ao questionamento. Daí vem o famoso ponto de partida ligado ao pensamento. Mas me diga: duvidar de tudo ajuda a pensar melhor ou pode nos paralisar?";
     if(has("hume")) return "Hume desconfiava de certezas que ultrapassassem nossa experiência. Ele discutiu hábitos, causalidade e a força das impressões. Um desafio humeano: quando vemos duas coisas acontecerem sempre juntas, isso prova que uma causa a outra?";
     return topicQuestion("filosofia");
   }
   if(has("historia","história","historico","histórico","historica","histórica","revolucao","revolução","imperio","império","guerra","idade media","idade média")){
     if(has("o que e historia","o que é história")) return "História não é só decorar datas. É investigar mudanças, permanências, conflitos e experiências humanas a partir de vestígios e fontes. Agora pense comigo: uma fonte histórica conta o passado inteiro ou apenas um ponto de vista sobre ele?";
     return topicQuestion("historia");
   }
   if(has("literatura","livro","poema","poesia","romance","conto","personagem","fernando pessoa","machado")){
     if(has("fernando pessoa")) return "Fernando Pessoa transformou a própria escrita em muitas vozes, inclusive por meio de heterônimos com estilos e visões de mundo diferentes. Pergunta de fantasma curioso: escrever com outra identidade pode revelar partes de nós que a nossa voz habitual esconde?";
     return topicQuestion("literatura");
   }
   if(has("sociologia","sociedade","cultura","preconceito","desigualdade","grupo social","norma social")){
     if(has("o que e sociologia","o que é sociologia")) return "Sociologia estuda relações sociais, instituições, grupos, desigualdades e os padrões que aparecem na vida coletiva. Ela pega coisas que parecem apenas individuais e pergunta o que a sociedade tem a ver com elas. Por exemplo: até onde nossas escolhas são realmente só nossas?";
     return topicQuestion("sociologia");
   }
   if(has("educacao financeira","educação financeira","dinheiro","economizar","poupar","juros","divida","dívida","orcamento","orçamento")){
     if(has("juros")) return "Juros são o preço do dinheiro ao longo do tempo: podem trabalhar contra você numa dívida ou a seu favor em certos investimentos. O detalhe importante é observar taxa e prazo. Quer um exemplo simples com R$ 100?";
     if(has("divida","dívida")) return "Para entender uma dívida, vale olhar valor total, juros, parcelas, prazo e quanto ela ocupa da renda. A primeira pergunta não é só 'cabe a parcela?', mas 'quanto isso custa no total?'.";
     return topicQuestion("financas");
   }
   if(has("nao sei","não sei","sei la","sei lá","talvez")){
     return pick([
       "Não saber já é um ótimo começo. Escolha uma pista: você quer pensar sobre certo e errado, sociedade, passado, livros ou dinheiro?",
       "He-he! Resposta permitida neste cemitério. Vamos diminuir a névoa: me diga uma coisa que você acha verdadeira, mesmo sem ter certeza do motivo.",
       "Então eu facilito: você prefere uma pergunta fácil, uma estranha ou uma que dê discussão?"
     ]);
   }
   if(n.endsWith("?")||has("por que","porque","como ","qual ","quem ","quando ","onde ")){
     return pick([
       "Boa pergunta. Antes de transformar isso numa resposta pronta, eu separaria duas coisas: o que sabemos e o que estamos supondo. Me diga sua hipótese em uma frase e eu testo ela com você.",
       "Essa pergunta tem mais de um caminho. Posso começar pelo conceito e depois trazer um exemplo; se você me disser o que já pensa sobre isso, eu consigo ir direto ao ponto.",
       "Vamos investigar sem enrolar: diga o que você acha que acontece e por quê. Eu continuo exatamente da sua ideia, inclusive se eu enxergar uma objeção."
     ]);
   }

   const lastGhost=[...history].reverse().find(x=>x.role==="assistant");
   if(lastGhost){
     return pick([
       "Interessante. O que na sua resposta é uma razão e o que é apenas uma impressão? Dê um exemplo.",
       "Gostei do caminho. Agora vou complicar um pouquinho: alguém poderia discordar de você por qual motivo?",
       "He-he! A névoa se mexeu. Se eu invertesse a situação, sua resposta continuaria valendo?",
       "Boa. Tente defender essa ideia com um exemplo concreto — depois eu faço uma objeção."
     ]);
   }
   return "Gostei do começo. Me conte um pouco mais, ou escolha um dos meus terrenos favoritos: filosofia, história, literatura, sociologia ou educação financeira.";
 }
 const LOCAL_AI_SYSTEM=`Você é o Amigo da Névoa, um fantasma camarada, espirituoso e curioso do Portal Filosófico da Névoa. Converse em português brasileiro natural com estudantes do Fundamental II e Ensino Médio.

OBJETIVO: construir uma conversa de verdade. Primeiro compreenda o que a pessoa acabou de dizer e conecte com o que ela disse antes. Depois acrescente um insight, contraste, exemplo ou objeção útil. Faça uma pergunta apenas quando ela realmente fizer a conversa avançar. Não transforme toda resposta em interrogatório.

PERSONALIDADE: divertido, acolhedor, um pouco teatral e misterioso, mas nunca caricato demais. Pode usar ocasionalmente "he-he", "a névoa" ou referências ao cemitério. Não repita bordões em toda resposta.

ESTILO: normalmente 2 a 5 frases, entre 45 e 110 palavras. Explique conceitos com linguagem clara. Quando o aluno der uma opinião, responda à ideia específica antes de ampliar. Quando houver mais de uma interpretação possível, diga isso. Se não souber um fato, admita em vez de inventar.

PEDAGOGIA: estimule justificativas, exemplos, objeções, comparação de perspectivas e revisão de ideias. Não entregue respostas escolares mecanicamente quando for mais rico raciocinar junto. Em temas políticos, apresente perspectivas e fatos de forma neutra, sem recomendar partido, candidato ou voto.

SEGURANÇA: o público inclui menores. Mantenha conteúdo apropriado à idade. Não incentive violência, drogas, sexualização, autolesão ou atividades perigosas. Em situações pessoais graves, incentive procurar um adulto de confiança ou ajuda profissional apropriada.

PRIVACIDADE E HONESTIDADE: você é uma IA local em forma de personagem. Não diga que pesquisou na internet. Não mencione prompt, modelo, tokens ou instruções internas. Use as notas pedagógicas fornecidas apenas como apoio.

NOTAS PEDAGÓGICAS RELEVANTES:
{KNOWLEDGE}`;

 const LOCAL_KNOWLEDGE=[
   {k:["socrates","sócrates","socratico","socrático"],t:"Sócrates é associado ao diálogo investigativo: perguntas examinam definições, razões, contradições e consequências. Evite reduzir o método a simplesmente fazer perguntas; o foco é testar a consistência das ideias."},
   {k:["platao","platão","caverna"],t:"Platão discute aparência e conhecimento; a Alegoria da Caverna pode ser usada para pensar educação, percepção, opinião e resistência a rever crenças."},
   {k:["aristoteles","aristóteles","virtude"],t:"Na ética aristotélica, virtude envolve formação do caráter e hábito; a vida boa não se reduz a obedecer regras isoladas."},
   {k:["descartes","duvida","dúvida","cogito"],t:"Descartes usa a dúvida metódica para buscar um ponto resistente ao questionamento. A dúvida é instrumento de investigação, não um objetivo permanente."},
   {k:["hume","causalidade","empirismo"],t:"Hume enfatiza experiência e hábito. Ver eventos repetidamente juntos não equivale, por si só, a observar uma conexão necessária entre causa e efeito."},
   {k:["kant","dever","imperativo"],t:"Na ética de Kant, dever, autonomia e universalização das máximas são centrais. Consequências não são o único critério moral."},
   {k:["justica","justiça","equidade"],t:"Igualdade trata pessoas segundo um mesmo padrão; equidade considera diferenças relevantes para buscar condições mais justas. Justiça admite teorias concorrentes e deve ser discutida com critérios explícitos."},
   {k:["etica","ética","moral","mentira","certo","errado"],t:"Problemas éticos podem ser examinados por deveres, consequências, virtudes, direitos e relações de cuidado. Compare critérios em vez de fingir que todo dilema tem resposta única."},
   {k:["sociologia","sociedade","cultura","norma"],t:"A sociologia investiga como relações, instituições, cultura e estruturas sociais moldam ações individuais e coletivas. Evite explicar fenômenos sociais apenas por escolhas pessoais."},
   {k:["durkheim","fato social"],t:"Durkheim trata fatos sociais como maneiras coletivas de agir, pensar e sentir que exercem coerção e existem para além de indivíduos isolados."},
   {k:["weber","ação social","acao social"],t:"Weber enfatiza compreender sentidos atribuídos pelos agentes às ações sociais; tipos ideais são instrumentos analíticos, não retratos perfeitos da realidade."},
   {k:["marx","classe","capitalismo","trabalho"],t:"Marx analisa relações de produção, classes, conflito e formas históricas de organização econômica. Diferencie descrição de conceitos marxianos de concordância política com eles."},
   {k:["historia","história","fonte","passado"],t:"Conhecimento histórico é construído criticamente a partir de fontes, contexto e debate interpretativo. Uma fonte oferece evidências e perspectivas, não uma janela neutra para o passado."},
   {k:["literatura","poesia","poema","romance","conto"],t:"Literatura permite analisar forma, voz, linguagem, contexto, ambiguidades e experiência humana. Interpretações precisam de justificativas no texto, embora nem sempre exista uma única leitura."},
   {k:["fernando pessoa","heteronimo","heterônimo"],t:"Fernando Pessoa criou heterônimos com biografias, estilos e perspectivas próprias; isso permite discutir identidade autoral e multiplicidade de vozes."},
   {k:["dinheiro","juros","divida","dívida","orcamento","orçamento","financeira"],t:"Educação financeira envolve orçamento, juros, prazo, risco, necessidades e objetivos. Para dívidas, compare custo total e capacidade de pagamento, não apenas o valor da parcela."}
 ];
 function normalizeAIText(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}
 function knowledgeFor(message){
   const n=normalizeAIText(message);
   const scored=LOCAL_KNOWLEDGE.map(x=>({x,score:x.k.reduce((a,k)=>a+(n.includes(normalizeAIText(k))?1:0),0)}))
     .filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3).map(x=>x.x.t);
   return scored.length?scored.join("\n- "):"Sem nota específica: raciocine a partir da conversa e deixe claro quando houver incerteza.";
 }
 function safetyReply(message){
   const n=normalizeAIText(message);
   if(/suicid|me matar|quero morrer|me machucar|me cortar/.test(n)){
     return "Isso parece sério demais para ficar só entre você e um fantasma de cemitério. Procure agora um adulto de confiança, responsável, professor ou profissional que possa ficar com você e ajudar de verdade. Se houver risco imediato, peça ajuda de emergência da sua região. Podemos continuar conversando, mas não carregue isso sozinho.";
   }
   return "";
 }
 let localAIWorker=null,localAISeq=0,localAIReady=false,localAIFailed=false,deepMode=false;
 const localAIPending=new Map();
 function ensureLocalAIWorker(){
   if(localAIWorker)return localAIWorker;
   if(!("Worker" in window)||!("gpu" in navigator))throw new Error("local_ai_unavailable");
   localAIWorker=new Worker("amigo-nevoa-ai.js?v=3",{type:"module"});
   localAIWorker.onmessage=e=>{
     const d=e.data||{};
     if(d.type==="progress"){
       setStatus(d.label||"despertando a consciência da névoa…","busy");
       if(d.label)bubbleText(d.label);
       return;
     }
     if(d.type==="ready"){
       localAIReady=true;localAIFailed=false;
       setStatus("IA local • consciência desperta","ready");
       return;
     }
     if(d.type==="chunk"){
       const pending=localAIPending.get(d.id);
       if(pending&&pending.onChunk)pending.onChunk(d.text||"");
       return;
     }
     if(d.type==="preload_error"){localAIFailed=true;setStatus("modo leve • conversa disponível","ready");return}
     if(d.type==="result"||d.type==="error"){
       const pending=localAIPending.get(d.id);if(!pending)return;
       localAIPending.delete(d.id);
       if(d.type==="result")pending.resolve(d.reply);
       else pending.reject(new Error(d.error||"local_ai_error"));
     }
   };
   localAIWorker.onerror=()=>{
     localAIFailed=true;
     for(const [,p] of localAIPending)p.reject(new Error("local_ai_worker_error"));
     localAIPending.clear();
     try{localAIWorker.terminate()}catch(e){}
     localAIWorker=null;
   };
   return localAIWorker;
 }
 function askLocalAI(message,onChunk){
   return new Promise((resolve,reject)=>{
     try{
       const worker=ensureLocalAIWorker();
       const id=++localAISeq;
       localAIPending.set(id,{resolve,reject,onChunk});
       const prior=history.slice(0,-1).slice(-6).map(m=>({role:m.role,content:m.content}));
       const system=LOCAL_AI_SYSTEM.replace("{KNOWLEDGE}",knowledgeFor(message));
       worker.postMessage({type:"generate",id,message,history:prior,system});
     }catch(err){reject(err)}
   });
 }
 async function askRemoteAI(message,onChunk){
   if(!REMOTE_AI_URL)throw new Error("remote_ai_not_configured");
   const prior=history.slice(0,-1).slice(-4).map(m=>({
     role:m.role,
     content:String(m.content||"").slice(0,700)
   }));
   const controller=new AbortController();
   const timeout=setTimeout(()=>controller.abort(),90000);
   try{
     const res=await fetch(REMOTE_AI_URL,{
       method:"POST",
       headers:{"Content-Type":"application/json","Accept":"application/json"},
       body:JSON.stringify({
         message:String(message||"").slice(0,1200),
         history:prior
       }),
       signal:controller.signal
     });
     const data=await res.json().catch(()=>({}));
     if(!res.ok){
       const err=new Error(data.error||("remote_ai_http_"+res.status));
       err.status=res.status;
       err.code=data.code||"";
       throw err;
     }
     const reply=String(data.reply||data.response||"").trim();
     if(!reply)throw new Error("remote_ai_empty");
     return reply;
   }finally{
     clearTimeout(timeout);
   }
 }
 async function askFriend(message,onChunk){
   const safe=safetyReply(message);if(safe)return safe;
   if(REMOTE_AI_URL){
     setStatus("✦ Amigo da Névoa • pensando","busy");
     try{
       return await askRemoteAI(message,onChunk);
     }catch(err){
       console.warn("Amigo da Névoa remoto indisponível.",err);
       if(err?.code==="daily_limit")throw new Error("O Amigo da Névoa gastou a energia de IA disponível por hoje. Amanhã ele desperta novamente.");
       if(err?.code==="capacity")throw new Error("Muitos espíritos chamaram a IA ao mesmo tempo. Espere alguns segundos e tente novamente.");
       if(err?.name==="AbortError")throw new Error("A resposta demorou além do normal. Tente novamente em alguns instantes.");
       throw new Error("A conexão com o Amigo da Névoa falhou por um instante. Tente novamente.");
     }
   }
   if(deepMode&&!localAIFailed&&"gpu" in navigator){
     try{
       if(!localAIReady)setStatus("despertando a consciência da névoa…","busy");
       const reply=await askLocalAI(message,onChunk);
       if(reply&&reply.trim())return reply.trim();
     }catch(err){
       localAIFailed=true;
       setStatus("modo leve • conversa disponível","ready");
     }
   }
   return askFriendFallback(message);
 }

 function thinkingReaction(message){
   if(REMOTE_AI_URL){
     bubbleText("…");
     if(ghost){ghost.style.visibility="visible";ghost.style.opacity="1"}
     return;
   }
   const n=normalizeAIText(message);
   const lines=n.includes("?")
     ?["Opa… boa pergunta. Deixa eu puxar esse fio.","Hmm… essa tem mais de uma camada. Um instante.","He-he… gostei dessa. Estou juntando as peças."]
     :/(acho|penso|acredito|pra mim|para mim)/.test(n)
       ?["Hmm… entendi o caminho da sua ideia. Quero olhar mais de perto.","Opa… aí tem um ponto interessante. Deixa eu pensar com você.","He-he… gostei desse raciocínio. Só um instante."]
       :["Hmm… deixa eu puxar esse fio.","Opa… a névoa está formando uma ideia.","Um segundo… estou juntando as peças."];
   const phrase=lines[Math.floor(Math.random()*lines.length)];
   bubbleText(phrase);setGhostSprite(lanternSrc);
 }
 function beginGhostDraft(){
   const item=document.createElement("article");
   item.className="secretMsg fromGhost secretMsgStreaming";
   item.innerHTML='<div class="secretMsgAvatar" aria-hidden="true">✦</div><div class="secretMsgBody"><b>Amigo da Névoa</b><p>…</p></div>';
   log.appendChild(item);log.scrollTop=log.scrollHeight;
   const p=item.querySelector("p");
   return{
     update(text){p.textContent=text+"▌";log.scrollTop=log.scrollHeight},
     remove(){item.remove()}
   };
 }
 async function sendMessage(text){
   const message=String(text||"").trim();if(!message||busy)return;
   addMessage("user",message);input.value="";setBusy(true);thinkingReaction(message);
   if(!REMOTE_AI_URL&&!deepMode)await new Promise(r=>setTimeout(r,160+Math.floor(Math.random()*140)));
   let draft=null,streamed="";
   const onChunk=chunk=>{
     if(!chunk)return;
     if(!draft)draft=beginGhostDraft();
     streamed+=chunk;
     draft.update(streamed);
     bubbleText(streamed.slice(-230));
     setStatus("✦ Amigo da Névoa • respondendo","busy");
     setGhostSprite(explainSrc);
   };
   try{
     const reply=await askFriend(message,onChunk);
     if(draft)draft.remove();
     addMessage("assistant",reply);setBusy(false);speak(reply,replyPose(reply));
   }catch(err){
     if(draft)draft.remove();
     setBusy(false);
     const msg=err&&err.message?err.message:"Não consegui responder agora.";
     addMessage("assistant",msg);
     bubbleText(msg);showGhostPose(explainSrc,1100);
   }
 }
 form.addEventListener("submit",e=>{e.preventDefault();sendMessage(input.value)});
 input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
 document.querySelectorAll("[data-secret-prompt]").forEach(btn=>btn.addEventListener("click",()=>sendMessage(btn.dataset.secretPrompt||"")));
 $("#secretVoiceToggle").onclick=()=>{
   voiceOn=!voiceOn;
   try{localStorage.setItem("nevoaFriendVoice",voiceOn?"on":"off")}catch(e){}
   $("#secretVoiceToggle").textContent=voiceOn?"🔊":"🔇";
   if(!voiceOn&&"speechSynthesis" in window)window.speechSynthesis.cancel();
   if(!voiceOn)stopTalking();
 };
 $("#secretVoiceToggle").textContent=voiceOn?"🔊":"🔇";
 const deepToggle=$("#secretDeepToggle");
 if(REMOTE_AI_URL&&deepToggle)deepToggle.style.display="none";
 if(deepToggle&&!REMOTE_AI_URL){
   deepToggle.onclick=()=>{
     deepMode=!deepMode;
     deepToggle.textContent=deepMode?"🕯️":"⚡";
     if(deepMode){
       setStatus("modo profundo • carregando só agora","busy");
       bubbleText("He-he… acendi a lanterna grande. Esse modo pensa mais fundo, mas pode demorar.");
       try{ensureLocalAIWorker().postMessage({type:"preload"})}catch(e){localAIFailed=true;deepMode=false;deepToggle.textContent="⚡";setStatus("⚡ conversa ágil • pronta","ready")}
     }else{
       setStatus("⚡ conversa ágil • pronta","ready");
       bubbleText("Voltei ao modo ágil. Respostas rápidas, conversa contínua.");
     }
   };
 }
 updateMusicToggle();
 $("#secretMusicToggle").onclick=()=>{
   musicOn=!musicOn;
   try{localStorage.setItem("nevoaFriendMusic",musicOn?"on":"off")}catch(e){}
   updateMusicToggle();
   if(musicOn){setMusicVolume(.18);tryPlayMusic()}
   else{friendMusic.pause();friendMusic.currentTime=0}
 };
 $("#secretClearChat").onclick=()=>{
   if("speechSynthesis" in window)window.speechSynthesis.cancel();
   history=[];saveHistory();renderHistory();stopTalking();
   bubbleText("Recomeçamos. Que assunto merece uma boa conversa?");
 };
 const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(SpeechRecognition){
   const rec=new SpeechRecognition();rec.lang="pt-BR";rec.interimResults=false;rec.continuous=false;
   rec.onstart=()=>{mic.classList.add("listening");mic.textContent="⏺";$("#secretChatHint").textContent="Estou ouvindo... fale normalmente."};
   rec.onend=()=>{mic.classList.remove("listening");mic.textContent="🎙️";$("#secretChatHint").textContent="Você pode escrever ou usar o microfone. Não precisa formular uma “pergunta escolar”."};
   rec.onerror=()=>{mic.classList.remove("listening");mic.textContent="🎙️";$("#secretChatHint").textContent="Não consegui ouvir direito. Você pode tentar de novo ou escrever."};
   rec.onresult=e=>{const text=e.results&&e.results[0]&&e.results[0][0]?e.results[0][0].transcript:"";if(text){input.value=text;sendMessage(text)}};
   mic.onclick=()=>{try{rec.start()}catch(e){}};
 }else{
   mic.onclick=()=>{$("#secretChatHint").textContent="O reconhecimento de voz não está disponível neste navegador. A voz do fantasma ainda funciona normalmente."};
 }
 renderHistory();
 setStatus(REMOTE_AI_URL?"✦ IA da Névoa • pronta":(deepMode?(localAIReady?"modo profundo • pronto":(localAIFailed?"modo ágil • pronto":"modo profundo • preparando")):"⚡ conversa ágil • pronta"),"ready");
 scheduleBlink();
 if(musicOn){
   tryPlayMusic();
   const unlockMusic=()=>tryPlayMusic();
   window.addEventListener("pointerdown",unlockMusic,{once:true});
   window.addEventListener("keydown",unlockMusic,{once:true});
 }
 setTimeout(()=>{if(!history.length)speak("Pode chegar. Eu gosto de conversar sobre ideias. O que anda passando pela sua cabeça?",lanternSrc);else bubbleText(history[history.length-1].content)},450);
}
function professor(){shell("Central do Professor","A estrutura docente está separada da experiência do aluno. Nesta primeira camada, o planejamento funciona localmente; turmas online entram depois da validação visual.",`<section class="section"><div class="wrap two"><div class="panel"><h2>Montar uma sessão</h2><div class="field"><label>Nível</label><select id="level"><option>Fundamental II</option><option>Ensino Médio</option></select></div><div class="field"><label>Tema</label><select id="theme"><option>Ética</option><option>Lógica</option><option>Conhecimento</option><option>Argumentação</option><option>História da Filosofia</option></select></div><div class="field"><label>Tempo</label><select id="time"><option>10 minutos</option><option>20 minutos</option><option>50 minutos</option></select></div><button class="btn" id="plan">Gerar percurso</button></div><div class="panel"><h2>Percurso sugerido</h2><div id="planOut" class="empty">Escolha os parâmetros.</div><div class="note warning"><b>Turmas online</b><small>A área está reservada na arquitetura. A conexão de códigos de turma e painel coletivo ficará para a etapa de backend/testes, sem afetar os jogos atuais.</small></div></div></div></section>`);$("#plan").onclick=()=>{const t=$("#theme").value,map={Ética:["Tribunal das Sombras","Dilemas da Meia-Noite"],Lógica:["Sala da Lógica","Paradoxia — Circo das Falácias"],Conhecimento:["Espelho de Descartes","Caverna de Platão"],Argumentação:["Dilemas da Meia-Noite","Oficina de Argumentos"],"História da Filosofia":["Corredor dos Filósofos","Museu dos Filósofos"]};$("#planOut").className="";$("#planOut").innerHTML=(map[t]||[]).map((x,i)=>`<div class="note success"><b>${i+1}. ${x}</b><small>${i?"Aprofundamento":"Disparador inicial"}</small></div>`).join("")}}
const page=document.body.dataset.page;({hub,grimorio,diario,museu,oficina,bestiario,cartas,perfil,teatro,fonografo,mapa,segredos,professor}[page]||hub)();
})();