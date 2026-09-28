(()=>{
"use strict";
const cache=new Map();
function list(){return Array.isArray(window.NEVOA_AVATARS)?window.NEVOA_AVATARS:[]}
function item(key){const a=list();return a.find(x=>x.key===key)||a[0]||null}
function src(key){return item(key)?.src||""}
function rankClass(x){
  const xp=typeof x==="number"?x:Number(x?.xp||0);
  if(xp>=360)return "rank-guardiao";
  if(xp>=240)return "rank-mestre";
  if(xp>=140)return "rank-filosofo";
  if(xp>=60)return "rank-investigador";
  return "rank-aprendiz";
}
function paint(img,key,label="Avatar do Explorador"){
  if(!img)return;
  const a=item(key);if(!a)return;
  img.src=a.src;img.alt=label+" — "+a.name;img.dataset.avatarKey=a.key;
}
async function currentKey(force=false){
  if(!window.NevoaOnline?.getSession?.())return "avatar-01";
  const token=window.NevoaOnline.getSession();
  if(!force&&cache.has(token))return cache.get(token);
  try{
    const key=await window.NevoaOnline.profileAvatar();
    cache.set(token,key||"avatar-01");return key||"avatar-01";
  }catch(e){return "avatar-01"}
}
function clearCache(){cache.clear()}
window.NevoaAvatar={list,item,src,rankClass,paint,currentKey,clearCache};
})();