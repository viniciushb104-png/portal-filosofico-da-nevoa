(()=>{
const D=window.NEVOA_DATA,$=s=>document.querySelector(s);
function readJSON(k,f){try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}}
function progress(){return readJSON("nevoaProgressV4",readJSON("nevoaProgressV3",{xp:0,completed:{},achievements:{},socrates:0}))}
function universe(){const u=readJSON("nevoaUniverseV1",{unlocks:[],cards:[],secrets:[],coins:0});u.unlocks||=[];u.cards||=[];u.secrets||=[];return u}
function saveU(u){localStorage.setItem("nevoaUniverseV1",JSON.stringify(u))}
window.NevoaUniverse={unlock(id){const x=universe();if(!x.unlocks.includes(id))x.unlocks.push(id);saveU(x)},addCard(id){const x=universe();if(!x.cards.includes(id))x.cards.push(id);saveU(x)},addSecret(id){const x=universe();if(!x.secrets.includes(id))x.secrets.push(id);saveU(x)},addCoins(n=1){const x=universe();x.coins=(x.coins||0)+n;saveU(x)}};
function seed(){const p=progress(),x=universe(),c=p.completed||{},ids=["socrates","argumento"];if(c.platao)ids.push("platao","caverna");if(c.descartes)ids.push("descartes");if(c.logica)ids.push("popularidade","adhominem");if((p.xp||0)>=120)ids.push("autonomia");if(localStorage.getItem("paradoxiaSave"))ids.push("teseu","certeza");ids.forEach(i=>{if(!x.unlocks.includes(i))x.unlocks.push(i)});D.cards.forEach(i=>{if((p.xp||0)>=i.xp&&!x.cards.includes(i.id))x.cards.push(i.id)});saveU(x);return x}
const u=seed(),p=progress();
function shell(title,lead,body){document.title=title+" — Portal Filosófico da Névoa";$("#app").innerHTML=`<header class="top"><div class="wrap topIn"><a class="brand" href="../index.html#grande-mapa" title="Abrir o Grande Mapa">Portal Filosófico <span>da Névoa</span></a><nav class="nav"><a href="../index.html#grande-mapa">🗺️ Mapa</a><a href="../jogos/paradoxia/">Paradoxia</a><a href="../jogos/plataforma-filosofica/">Labirinto</a><a href="grimorio.html">Grimório</a><a href="perfil.html">Perfil</a><a href="../salao-da-nevoa.html">Salão</a></nav><a class="worldMapBtn" href="../index.html#grande-mapa" aria-label="Abrir Grande Mapa">🗺️ <span>Mapa</span></a></div></header><section class="hero"><div class="wrap"><div class="eyebrow">Universo da Névoa</div><h1>${title}</h1><p class="lead">${lead}</p><div class="chips"><span class="chip">${p.xp||0} XP</span><span class="chip">${u.unlocks.length} registros</span><span class="chip">${u.cards.length} cartas</span><span class="chip">${u.secrets.length} segredos</span></div></div></section>${body}<footer class="footer"><div class="wrap">PENSAR • QUESTIONAR • ARGUMENTAR • TRANSFORMAR<br><br><a href="../index.html">← Voltar ao Portal</a></div></footer>`}
const card=(icon,title,desc,href,meta="")=>`<article class="card"><div class="icon">${icon}</div>${meta?`<div class="meta">${meta}</div>`:""}<h3>${title}</h3><p>${desc}</p>${href?`<a href="${href}">Entrar →</a>`:""}</article>`;
function hub(){shell("O Universo da Névoa","Todos os caminhos do Portal reunidos em uma única rede. Esta é a estrutura-base que receberá a direção de arte definitiva depois.",`<section class="section"><div class="wrap"><div class="sectionHead"><div class="eyebrow">Novos sistemas</div><h2>Escolha para onde a névoa abre passagem</h2></div><div class="grid">${card("📖","Grimório do Explorador","Enciclopédia que registra filósofos, conceitos, paradoxos, falácias e criaturas encontrados.","grimorio.html","Coleção")}${card("📓","Diário Filosófico","Registre respostas e volte a elas no futuro para perceber como seu pensamento mudou.","diario.html","Reflexão")}${card("🏛️","Museu dos Filósofos","Galeria navegável de pensadores, problemas, conceitos e perguntas.","museu.html","Conhecimento")}${card("🧠","Oficina de Argumentos","Construa tese, razões, evidência, objeção e resposta.","oficina.html","Argumentação")}${card("👻","Bestiário Filosófico","Criaturas inspiradas em falácias e vícios argumentativos.","bestiario.html","Lógica")}${card("🃏","Cartas da Névoa","Coleção desbloqueada pela progressão do Portal.","cartas.html","Colecionável")}${card("🧙","Perfil do Explorador","XP, títulos, coleções, registros e jornada.","perfil.html","Progressão")}${card("🎭","Teatro Filosófico","Cenas interativas nas quais razões mudam o rumo do diálogo.","teatro.html","Narrativa")}${card("🎵","Fonógrafo da Névoa","Casa das trilhas e futuras músicas desbloqueáveis.","fonografo.html","Música")}${card("🔐","Segredos da Mansão","Enigmas opcionais e registros secretos.","segredos.html","Exploração")}${card("👨‍🏫","Central do Professor","Planejamento de sessões e estrutura para turmas.","professor.html?v=15","Docente")}${card("🗺️","Grande Mapa","Conecta Mansão, Labirinto, Paradoxia e novas áreas.","mapa.html","Navegação")}</div></div></section>`)}
function grimorio(){let filter="Todos";shell("Grimório do Explorador","O livro cresce junto com a jornada. Sistemas antigos e futuros podem registrar descobertas aqui sem alterar a página.",`<section class="section"><div class="wrap"><div class="toolbar" id="filters"></div><div id="entries" class="grid"></div></div></section>`);const render=()=>{$("#entries").innerHTML=D.grimorio.filter(x=>filter==="Todos"||x.type===filter).map(x=>`<article class="card ${u.unlocks.includes(x.id)?"":"locked"}"><div class="icon">${x.icon}</div><div class="meta">${x.type}</div><h3>${u.unlocks.includes(x.id)?x.title:"Entrada selada"}</h3><p>${u.unlocks.includes(x.id)?x.desc:"Continue explorando o Portal para revelar este registro."}</p></article>`).join("")};["Todos",...new Set(D.grimorio.map(x=>x.type))].forEach(t=>{const b=document.createElement("button");b.className="btn subtle";b.textContent=t;b.onclick=()=>{filter=t;render()};$("#filters").appendChild(b)});render()}
function diario(){const key="nevoaDiaryV1";let notes=readJSON(key,[]);shell("Diário Filosófico","Aqui não há resposta automática: o objetivo é registrar pensamento, razões e mudanças de posição.",`<section class="section"><div class="wrap two"><div class="panel"><div class="eyebrow">Pergunta do momento</div><h2>O que torna uma escolha verdadeiramente sua?</h2><div class="field"><label>Sua reflexão</label><textarea id="diaryText" placeholder="Escreva o que pensa hoje..."></textarea></div><button class="btn" id="saveDiary">Registrar no diário</button></div><div class="panel"><h3>Registros anteriores</h3><div id="notes"></div></div></div></section>`);const draw=()=>$("#notes").innerHTML=notes.length?notes.slice().reverse().map(n=>`<div class="note"><b>${n.q}</b><small>${n.date}</small><p>${n.text}</p></div>`).join(""):`<div class="empty">Seu diário ainda está em branco.</div>`;draw();$("#saveDiary").onclick=()=>{const text=$("#diaryText").value.trim();if(!text)return;notes.push({q:"O que torna uma escolha verdadeiramente sua?",text,date:new Date().toLocaleDateString("pt-BR")});localStorage.setItem(key,JSON.stringify(notes));$("#diaryText").value="";draw()}}
function museu(){shell("Museu dos Filósofos","Uma galeria de problemas e perguntas. Depois poderemos substituir estes símbolos por retratos e salas animadas.",`<section class="section"><div class="wrap"><input class="input search" id="search" placeholder="Buscar filósofo, época ou conceito..."><div class="grid" id="museum" style="margin-top:16px"></div></div></section>`);const draw=q=>{$("#museum").innerHTML=D.philosophers.filter(x=>(x.name+x.era+x.concept).toLowerCase().includes(q.toLowerCase())).map(x=>`<article class="card"><div class="icon">${x.icon}</div><div class="meta">${x.era}</div><h3>${x.name}</h3><p><b>${x.concept}</b></p><p>${x.question}</p></article>`).join("")};draw("");$("#search").oninput=e=>draw(e.target.value)}
function oficina(){const key="nevoaArgumentsV1";shell("Oficina de Argumentos","Monte um argumento por partes. A ferramenta avalia estrutura, não qual opinião você escolheu defender.",`<section class="section"><div class="wrap two"><div class="panel"><div class="field"><label>Tese</label><textarea id="thesis"></textarea></div><div class="field"><label>Razão</label><textarea id="reason"></textarea></div><div class="field"><label>Evidência ou exemplo</label><textarea id="evidence"></textarea></div><div class="field"><label>Possível objeção</label><textarea id="objection"></textarea></div><div class="field"><label>Resposta à objeção</label><textarea id="reply"></textarea></div><button class="btn" id="build">Construir argumento</button></div><div class="panel"><h2>Estrutura</h2><div id="preview" class="empty">Preencha os blocos para montar seu argumento.</div></div></div></section>`);$("#build").onclick=()=>{const ids=["thesis","reason","evidence","objection","reply"],vals=ids.map(id=>$("#"+id).value.trim()),names=["Tese","Razão","Evidência","Objeção","Resposta"];$("#preview").className="";$("#preview").innerHTML=vals.map((v,i)=>`<div class="note ${v?"success":"warning"}"><b>${names[i]}</b><small>${v||"Bloco ainda vazio"}</small></div>`).join("");if(vals.filter(Boolean).length===5){const a=readJSON(key,[]);a.push({date:new Date().toISOString(),values:vals});localStorage.setItem(key,JSON.stringify(a))}}}
function bestiario(){const discovered=(p.completed?.logica||0)>0||u.unlocks.includes("popularidade");shell("Bestiário Filosófico","Falácias viram criaturas porque um erro de raciocínio fica mais fácil de reconhecer quando ganha rosto, nome e fraqueza.",`<section class="section"><div class="wrap collection">${D.beasts.map((x,i)=>`<article class="miniCard ${(discovered||i<2)?"":"locked"}"><div class="icon">${x.icon}</div><b>${(discovered||i<2)?x.name:"Criatura desconhecida"}</b><small>${(discovered||i<2)?x.fallacy:"Continue explorando a Sala da Lógica"}</small>${(discovered||i<2)?`<p>${x.weakness}</p>`:""}</article>`).join("")}</div></section>`)}
function cartas(){shell("Cartas da Névoa","Coleção sem compra e sem vantagem paga: as cartas registram progresso e conhecimento conquistado nos jogos.",`<section class="section"><div class="wrap collection">${D.cards.map(x=>{const on=u.cards.includes(x.id);return `<article class="miniCard ${on?"":"locked"}"><div class="icon">${on?x.icon:"❔"}</div><b>${on?x.name:"Carta selada"}</b><small>${on?x.type:`Desbloqueia em ${x.xp} XP`}</small>${on?`<p>${x.skill}</p>`:""}</article>`}).join("")}</div></section>`)}
function perfil(){
const diary=readJSON("nevoaDiaryV1",[]),args=readJSON("nevoaArgumentsV1",[]),xp=p.xp||0,rank=xp>=360?"Guardião":xp>=240?"Mestre":xp>=140?"Filósofo":xp>=60?"Investigador":"Aprendiz";
const avatars=Array.isArray(window.NEVOA_AVATARS)?window.NEVOA_AVATARS:[];
shell("Perfil do Explorador","Sua identidade, progresso e coleções dentro do Portal — com privacidade pensada para estudantes.",`
<section class="section"><div class="wrap">
  <div class="profileIdentity panel">
    <button class="profileAvatarButton" id="openAvatarGallery" type="button" aria-label="Escolher avatar">
      <img id="profileAvatarImage" alt="Avatar do Explorador">
      <span>Trocar avatar</span>
    </button>
    <div class="profileIdentityMain">
      <div class="eyebrow">Identidade do explorador</div>
      <h2 id="profileDisplayName">Explorador da Névoa</h2>
      <p class="profileAccountHint" id="profileAccountHint">Conectando à sua conta...</p>
      <div class="profileIdentityActions">
        <button class="btn" id="editProfileName" type="button" hidden>✏️ Alterar nome do perfil</button>
        <button class="btn subtle" id="openAvatarGalleryAction" type="button" hidden>🖼️ Escolher avatar</button>
        <a class="btn subtle" id="profileLoginLink" href="../login.html" hidden>🔐 Entrar para editar</a>
      </div>
    </div>
    <div class="profileRankSeal"><small>Título atual</small><b>${rank} da Névoa</b><span>${xp} XP</span></div>
  </div>

  <div class="panel profileAvatarEditor" id="profileAvatarEditor" hidden>
    <div class="eyebrow">Galeria de Avatares da Névoa</div>
    <h3>Escolha sua aparência no Portal</h3>
    <p>Os dez avatares são artes oficiais do Portal. Você pode usar qualquer um deles e trocar quando quiser.</p>
    <div class="avatarGallery" id="avatarGallery"></div>
    <div class="avatarGalleryFooter">
      <div class="profileNameStatus" id="avatarStatus" role="status" aria-live="polite"></div>
      <button class="btn subtle" id="closeAvatarGallery" type="button">Fechar galeria</button>
    </div>
  </div>

  <div class="panel profileNameEditor" id="profileNameEditor" hidden>
    <div class="eyebrow">Editar identidade</div>
    <h3>Nome visível no Portal</h3>
    <p>Use apelido ou primeiro nome. Para proteger sua privacidade, não coloque nome completo, telefone, e-mail, link ou rede social.</p>
    <form id="profileNameForm" class="profileNameForm">
      <label for="profileNameInput">Novo nome</label>
      <div class="profileNameRow">
        <input class="input" id="profileNameInput" maxlength="24" autocomplete="off" spellcheck="false" placeholder="Ex.: Luna 8A">
        <button class="btn" id="saveProfileName" type="submit">Salvar nome</button>
        <button class="btn subtle" id="cancelProfileName" type="button">Cancelar</button>
      </div>
      <small class="profileSafetyNote">2 a 24 caracteres. O filtro bloqueia contatos, termos inadequados e nomes que possam imitar contas oficiais. Seu apelido de entrada e seu PIN não mudam.</small>
      <div class="profileNameStatus" id="profileNameStatus" role="status" aria-live="polite"></div>
    </form>
  </div>

  <div class="panel" style="margin-top:14px">
    <div class="eyebrow">Progresso</div>
    <h2>${rank} da Névoa</h2>
    <div class="progress"><i style="width:${Math.min(100,xp/360*100)}%"></i></div>
  </div>

  <div class="statGrid" style="margin-top:14px">
    <div class="stat"><b>${xp}</b><small>XP</small></div>
    <div class="stat"><b>${u.unlocks.length}</b><small>Grimório</small></div>
    <div class="stat"><b>${u.cards.length}</b><small>Cartas</small></div>
    <div class="stat"><b>${u.secrets.length}</b><small>Segredos</small></div>
    <div class="stat"><b>${diary.length}</b><small>Reflexões</small></div>
    <div class="stat"><b>${args.length}</b><small>Argumentos</small></div>
  </div>

  <div class="note profileNextStep">
    <b>🛡️ Galeria oficial e segura</b>
    <small>Nesta etapa o perfil usa somente os dez avatares aprovados do Portal. Não há envio livre de foto pessoal.</small>
  </div>
</div></section>`);

const nameEl=$("#profileDisplayName"),hint=$("#profileAccountHint"),edit=$("#editProfileName"),login=$("#profileLoginLink");
const editor=$("#profileNameEditor"),form=$("#profileNameForm"),input=$("#profileNameInput"),cancel=$("#cancelProfileName"),save=$("#saveProfileName"),status=$("#profileNameStatus");
const avatarImg=$("#profileAvatarImage"),avatarOpen=$("#openAvatarGallery"),avatarOpenAction=$("#openAvatarGalleryAction"),avatarEditor=$("#profileAvatarEditor"),avatarGrid=$("#avatarGallery"),avatarStatus=$("#avatarStatus"),avatarClose=$("#closeAvatarGallery");
let profile=null,currentAvatar="avatar-01",avatarBusy=false;

const avatarByKey=key=>avatars.find(a=>a.key===key)||avatars[0]||null;
const avatarRankClass=x=>{
  const xp=Number(x)||0;
  if(xp>=360)return "rank-guardiao";
  if(xp>=240)return "rank-mestre";
  if(xp>=140)return "rank-filosofo";
  if(xp>=60)return "rank-investigador";
  return "rank-aprendiz";
};
const applyAvatarRank=()=>{
  avatarOpen.classList.remove("rank-aprendiz","rank-investigador","rank-filosofo","rank-mestre","rank-guardiao");
  avatarOpen.classList.add(avatarRankClass(profile?.xp||0));
};
const paintAvatar=key=>{
  const a=avatarByKey(key);
  if(!a)return;
  currentAvatar=a.key;
  avatarImg.src=a.src;
  avatarImg.alt="Avatar "+a.name;
  avatarOpen.title="Avatar atual: "+a.name;
  applyAvatarRank();
};
const showAvatarStatus=(msg,type="")=>{avatarStatus.textContent=msg;avatarStatus.className="profileNameStatus "+type};
const drawAvatarGallery=()=>{
  avatarGrid.innerHTML=avatars.map(a=>`<button class="avatarChoice ${a.key===currentAvatar?"selected":""}" type="button" data-avatar="${a.key}" aria-pressed="${a.key===currentAvatar?"true":"false"}"><img src="${a.src}" alt="Avatar ${a.name}"><span>${a.name}</span><small>${a.key===currentAvatar?"Em uso":"Escolher"}</small></button>`).join("");
  avatarGrid.querySelectorAll(".avatarChoice").forEach(btn=>btn.onclick=()=>chooseAvatar(btn.dataset.avatar));
};
const openAvatarEditor=()=>{
  if(!profile){location.href="../login.html";return}
  drawAvatarGallery();showAvatarStatus("");avatarEditor.hidden=false;avatarEditor.scrollIntoView({behavior:"smooth",block:"nearest"});
};
const closeAvatarEditor=()=>{avatarEditor.hidden=true;showAvatarStatus("")};

async function chooseAvatar(key){
  if(!profile||avatarBusy)return;
  const a=avatarByKey(key);if(!a)return;
  avatarBusy=true;
  avatarGrid.querySelectorAll("button").forEach(b=>b.disabled=true);
  showAvatarStatus("Salvando "+a.name+"...","info");
  try{
    const saved=await window.NevoaOnline.updateProfileAvatar(a.key);
    if(profile)profile.avatar_key=saved||a.key;
    paintAvatar(saved||a.key);
    drawAvatarGallery();
    showAvatarStatus("✓ "+a.name+" agora é seu avatar.","ok");
  }catch(err){
    showAvatarStatus(err?.message||"Não foi possível salvar o avatar agora.","bad");
  }finally{
    avatarBusy=false;
    avatarGrid.querySelectorAll("button").forEach(b=>b.disabled=false);
  }
}

const showStatus=(msg,type="")=>{status.textContent=msg;status.className="profileNameStatus "+type};
const closeEditor=()=>{editor.hidden=true;showStatus("");input.value=profile?.nickname||""};
const openEditor=()=>{if(!profile)return;input.value=profile.nickname||"";editor.hidden=false;showStatus("");requestAnimationFrame(()=>input.focus())};

async function loadProfile(){
  paintAvatar("avatar-01");
  if(!window.NevoaOnline){
    hint.textContent="O serviço de conta não carregou. Reabra a página para tentar novamente.";
    login.hidden=false;return;
  }
  if(!window.NevoaOnline.getSession()){
    nameEl.textContent="Explorador da Névoa";
    hint.textContent="Entre na sua conta para editar o nome e escolher seu avatar.";
    login.hidden=false;edit.hidden=true;avatarOpenAction.hidden=true;return;
  }
  profile=await window.NevoaOnline.sessionProfile();
  if(!profile){
    nameEl.textContent="Explorador da Névoa";
    hint.textContent="Sua sessão expirou. Entre novamente para editar o perfil.";
    login.hidden=false;edit.hidden=true;avatarOpenAction.hidden=true;return;
  }
  try{paintAvatar(profile.avatar_key||await window.NevoaOnline.profileAvatar())}catch(e){paintAvatar("avatar-01")}
  applyAvatarRank();
  nameEl.textContent=profile.nickname||"Explorador da Névoa";
  hint.textContent=(profile.class_name?profile.class_name+" • ":"")+profile.title+" • identidade salva na sua conta";
  login.hidden=true;edit.hidden=false;avatarOpenAction.hidden=false;
}
avatarOpen.onclick=openAvatarEditor;
avatarOpenAction.onclick=openAvatarEditor;
avatarClose.onclick=closeAvatarEditor;
edit.onclick=openEditor;
cancel.onclick=closeEditor;
form.onsubmit=async e=>{
  e.preventDefault();
  if(!profile)return;
  const proposed=(input.value||"").replace(/\s+/g," ").trim();
  if(proposed.length<2||proposed.length>24){showStatus("Escolha um nome entre 2 e 24 caracteres.","bad");return}
  save.disabled=true;save.textContent="Salvando...";
  showStatus("A Névoa está verificando o novo nome...","info");
  try{
    const updated=await window.NevoaOnline.updateProfileName(proposed);
    profile=updated||await window.NevoaOnline.sessionProfile();
    nameEl.textContent=profile?.nickname||proposed;
    hint.textContent=(profile?.class_name?profile.class_name+" • ":"")+(profile?.title||(rank+" da Névoa"))+" • identidade salva na sua conta";
    showStatus("✓ Nome atualizado com segurança.","ok");
    setTimeout(()=>{editor.hidden=true;showStatus("")},900);
  }catch(err){
    showStatus(err?.message||"Não foi possível alterar o nome agora.","bad");
  }finally{
    save.disabled=false;save.textContent="Salvar nome";
  }
};
loadProfile().catch(()=>{hint.textContent="Não foi possível carregar sua conta agora.";login.hidden=false;});
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
function segredos(){shell("Segredos da Mansão","Área opcional para easter eggs e enigmas que não precisam aparecer no percurso principal.",`<section class="section"><div class="wrap two"><div class="panel"><div class="eyebrow">Porta que não existe</div><h2>“Quanto mais perguntas recebe, mais caminhos oferece. O que é?”</h2><div class="field"><input class="input" id="secretAnswer" placeholder="Digite sua resposta"></div><button class="btn" id="openSecret">Tentar abrir</button></div><div class="panel" id="secretResult"><div class="empty">A porta permanece silenciosa.</div></div></div></section>`);$("#openSecret").onclick=()=>{const a=$("#secretAnswer").value.toLowerCase().trim();if(a.includes("filosofia")||a.includes("pergunta")){NevoaUniverse.addSecret("porta-pergunta");$("#secretResult").innerHTML='<div class="note success"><b>🔓 Passagem encontrada</b><small>Segredo registrado no Perfil do Explorador.</small></div>'}else $("#secretResult").innerHTML='<div class="note warning"><b>A fechadura range...</b><small>Talvez a resposta não seja uma coisa, mas uma forma de investigar.</small></div>'}}
function professor(){shell("Central do Professor","A estrutura docente está separada da experiência do aluno. Nesta primeira camada, o planejamento funciona localmente; turmas online entram depois da validação visual.",`<section class="section"><div class="wrap two"><div class="panel"><h2>Montar uma sessão</h2><div class="field"><label>Nível</label><select id="level"><option>Fundamental II</option><option>Ensino Médio</option></select></div><div class="field"><label>Tema</label><select id="theme"><option>Ética</option><option>Lógica</option><option>Conhecimento</option><option>Argumentação</option><option>História da Filosofia</option></select></div><div class="field"><label>Tempo</label><select id="time"><option>10 minutos</option><option>20 minutos</option><option>50 minutos</option></select></div><button class="btn" id="plan">Gerar percurso</button></div><div class="panel"><h2>Percurso sugerido</h2><div id="planOut" class="empty">Escolha os parâmetros.</div><div class="note warning"><b>Turmas online</b><small>A área está reservada na arquitetura. A conexão de códigos de turma e painel coletivo ficará para a etapa de backend/testes, sem afetar os jogos atuais.</small></div></div></div></section>`);$("#plan").onclick=()=>{const t=$("#theme").value,map={Ética:["Tribunal das Sombras","Dilemas da Meia-Noite"],Lógica:["Sala da Lógica","Paradoxia — Circo das Falácias"],Conhecimento:["Espelho de Descartes","Caverna de Platão"],Argumentação:["Dilemas da Meia-Noite","Oficina de Argumentos"],"História da Filosofia":["Corredor dos Filósofos","Museu dos Filósofos"]};$("#planOut").className="";$("#planOut").innerHTML=(map[t]||[]).map((x,i)=>`<div class="note success"><b>${i+1}. ${x}</b><small>${i?"Aprofundamento":"Disparador inicial"}</small></div>`).join("")}}
const page=document.body.dataset.page;({hub,grimorio,diario,museu,oficina,bestiario,cartas,perfil,teatro,fonografo,mapa,segredos,professor}[page]||hub)();
})();