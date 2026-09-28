(()=>{
"use strict";
const $=s=>document.querySelector(s);
function inject(){
  const hud=$(".hud");
  if(hud&&!$("#phaseProfileHud")){
    const block=document.createElement("div");
    block.className="hudBlock phaseProfileHud";
    block.id="phaseProfileHud";
    block.innerHTML='<span class="phaseAvatar avatarFrame rank-aprendiz" id="phaseAvatarFrame"><img id="phaseAvatarImage" class="nevoaAvatar" alt="Seu avatar"></span><div><small>EXPLORADOR</small><b id="phaseProfileName">Visitante</b></div>';
    hud.prepend(block);
  }
  const win=$(".winCard");
  if(win&&!$("#phaseWinIdentity")){
    const id=document.createElement("div");
    id.className="phaseWinIdentity";
    id.id="phaseWinIdentity";
    id.innerHTML='<span class="phaseWinAvatar avatarFrame rank-aprendiz" id="phaseWinAvatarFrame"><img id="phaseWinAvatarImage" class="nevoaAvatar" alt="Seu avatar"></span><b id="phaseWinProfileName">Explorador da Névoa</b>';
    win.prepend(id);
  }
}
async function load(){
  inject();
  let profile=null,key="avatar-01";
  if(window.NevoaOnline?.getSession?.()){
    try{
      profile=await window.NevoaOnline.sessionProfile();
      key=profile?.avatar_key||await window.NevoaAvatar?.currentKey?.(true)||"avatar-01";
    }catch(e){}
  }
  const name=profile?.nickname||"Visitante";
  const xp=Number(profile?.xp||0);
  const rank=window.NevoaAvatar?.rankClass(xp)||"rank-aprendiz";
  const nameEl=$("#phaseProfileName"),winName=$("#phaseWinProfileName");
  if(nameEl)nameEl.textContent=name;
  if(winName)winName.textContent=profile?.nickname||"Explorador da Névoa";
  window.NevoaAvatar?.paint($("#phaseAvatarImage"),key,profile?"Seu avatar":"Avatar padrão");
  window.NevoaAvatar?.paint($("#phaseWinAvatarImage"),key,profile?"Seu avatar":"Avatar padrão");
  const frame=$("#phaseAvatarFrame"),winFrame=$("#phaseWinAvatarFrame");
  if(frame)frame.className="phaseAvatar avatarFrame "+rank;
  if(winFrame)winFrame.className="phaseWinAvatar avatarFrame "+rank;
}
load();
})();