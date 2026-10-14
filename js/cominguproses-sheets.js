/* Coming Up Roses : sheets. Chargé uniquement si son contenu est présent. */
(()=>{
 'use strict';
 const register=()=>window.ComingUpRoses.register('sheets',".cur-sheet",api=>{
 const {slug,paint,pounds,loadGroups}=api;
 let sheetNumber=0;
 function initSheet(sheet){
  if(sheet.dataset.curReady)return;
  sheet.dataset.curReady='true';
  const prefix='cur-sheet-'+(++sheetNumber);
  sheet.querySelectorAll('[data-cur-tab]').forEach((button,index)=>{
   const panel=Array.from(sheet.querySelectorAll('[data-cur-panel]')).find(panel=>panel.dataset.curPanel===button.dataset.curTab);
   if(!panel)return;
   button.id=prefix+'-tab-'+index;panel.id=prefix+'-panel-'+index;
   button.setAttribute('aria-controls',panel.id);panel.setAttribute('aria-labelledby',button.id);
  });
 }
 function activate(button){
  const sheet=button.closest('.cur-sheet');initSheet(sheet);
  sheet.querySelectorAll('[data-cur-tab]').forEach(tab=>{
   const selected=tab===button;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;
  });
  sheet.querySelectorAll('[data-cur-panel]').forEach(panel=>{panel.hidden=panel.dataset.curPanel!==button.dataset.curTab});
  sheet.querySelector('.cur-sheet-reading').hidden=false;
  sheet.querySelector('.cur-sheet-portrait').inert=true;
  sheet.querySelector('[data-cur-panel]:not([hidden])').focus({preventScroll:true});
 }
 function closeSheet(sheet){
  const active=sheet.querySelector('[data-cur-tab][aria-selected=true]');
  sheet.querySelector('.cur-sheet-reading').hidden=true;
  sheet.querySelector('.cur-sheet-portrait').inert=false;
  sheet.querySelectorAll('[data-cur-panel]').forEach(panel=>{panel.hidden=true});
  sheet.querySelectorAll('[data-cur-tab]').forEach(tab=>tab.setAttribute('aria-selected','false'));
  active?.focus({preventScroll:true});
 }
 document.addEventListener('click',event=>{
  const close=event.target.closest('.cur-sheet [data-cur-close]');
  if(close){closeSheet(close.closest('.cur-sheet'));return;}
  const button=event.target.closest('.cur-sheet [data-cur-tab]');if(button)activate(button);
 });
 document.addEventListener('keydown',event=>{
  const sheet=event.target.closest('.cur-sheet');
  if(event.key==='Escape'&&sheet&&!sheet.querySelector('.cur-sheet-reading').hidden){event.preventDefault();closeSheet(sheet);return;}
  const button=event.target.closest('.cur-sheet [data-cur-tab]');
  if(!button||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
  event.preventDefault();
  const tabs=Array.from(button.closest('.cur-sheet-tabs').querySelectorAll('[data-cur-tab]'));
  const index=tabs.indexOf(button),direction=['ArrowLeft','ArrowUp'].includes(event.key)?-1:1;
  const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+direction+tabs.length)%tabs.length;
  tabs.forEach((tab,index)=>{tab.tabIndex=index===next?0:-1});tabs[next].focus();
 });
 const init=()=>document.querySelectorAll('.cur-sheet').forEach(initSheet);
 document.addEventListener('cur-sheets-ready',init);
 document.addEventListener('cur-fragments-ready',init);
 init();

 });
 if(window.ComingUpRoses?.register)register();
 else document.addEventListener('cur-core-ready',register,{once:true});
})();
