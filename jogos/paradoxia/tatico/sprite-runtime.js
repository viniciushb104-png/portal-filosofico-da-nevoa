(()=>{
'use strict';
function spriteKey(unit){return unit.spriteKey||unit.classKey||unit.id||'unknown'}
function decorateUnitElement(el,unit){
 const key=spriteKey(unit);
 el.dataset.spriteKey=key;
 el.dataset.animState=unit.animState||'idle';
 el.dataset.direction=unit.direction||'front';
 const sprite=el.querySelector('.unitSprite');
 if(sprite){sprite.dataset.spriteKey=key;sprite.dataset.animState=unit.animState||'idle';sprite.dataset.direction=unit.direction||'front'}
}
window.ParadoxiaSpriteRuntime={spriteKey,decorateUnitElement};
})();