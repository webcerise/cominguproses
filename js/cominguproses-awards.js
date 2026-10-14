/* Coming Up Roses : awards. Chargé uniquement si son contenu est présent. */
(()=>{
 'use strict';
 const register=()=>window.ComingUpRoses.register('awards',".award",api=>{
 const {slug,paint,pounds,loadGroups}=api;
 document.querySelectorAll('.award').forEach(award=>{
  const tooltip=award.querySelector('.award_tooltiptext');
  const heading=(tooltip?.querySelector('.award_tooltiptext_title')?.textContent||award.getAttribute('title')||'').trim();
  const description=tooltip?.cloneNode(true);
  description?.querySelector('.award_tooltiptext_title')?.remove();
  const text=description?.textContent.replace(/\s+/g,' ').trim()||'';
  if(!heading&&!text)return;
  if(heading){award.setAttribute('data-tooltip-head',heading);award.setAttribute('aria-label',heading)}
  if(text)award.setAttribute('title',text);else award.removeAttribute('title');
  tooltip?.remove();
 });

 });
 if(window.ComingUpRoses?.register)register();
 else document.addEventListener('cur-core-ready',register,{once:true});
})();
