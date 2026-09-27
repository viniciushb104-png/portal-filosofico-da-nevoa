(()=>{
'use strict';
const PLAYERS=new Set(['dialetico','cetico','etico','existencial']);
function spriteKey(unit){return unit.spriteKey||unit.classKey||unit.id||'unknown'}
function poseIndex(unit){
 const state=unit.animState||'idle',dir=unit.direction||'front';
 if(state==='attack'||state==='skill'||state==='action')return 1;
 if(dir==='side'||dir==='left'||dir==='right')return 2;
 if(dir==='back'||dir==='up')return 3;
 return 0;
}
function decorateUnitElement(el,unit){
 const key=spriteKey(unit),player=PLAYERS.has(key);
 el.dataset.spriteKey=key;
 el.dataset.animState=unit.animState||'idle';
 el.dataset.direction=unit.direction||'front';
 el.classList.toggle('hasCharacterArt',player);
 const sprite=el.querySelector('.unitSprite');
 if(sprite){
   sprite.dataset.spriteKey=key;
   sprite.dataset.animState=unit.animState||'idle';
   sprite.dataset.direction=unit.direction||'front';
   sprite.style.setProperty('--pose-index',String(poseIndex(unit)));
   sprite.classList.toggle('hasCharacterArt',player);
 }
}
window.ParadoxiaSpriteRuntime={spriteKey,poseIndex,decorateUnitElement};
})();