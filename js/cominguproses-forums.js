/* Coming Up Roses : forums. Chargé uniquement si son contenu est présent. */
/* Forumactif : Sur l'index et Sur les sous-forums. */
(()=>{
 'use strict';
 const register=()=>window.ComingUpRoses.register('forums',".rose-forum,.subforums,.rose-topic-row",api=>{
 const {slug,paint,pounds,loadGroups}=api;
 function initForumImages(){
  const root=document.querySelector('#page-body')||document.body;
  if(root.dataset.forumImagesReady)return;
  root.dataset.forumImagesReady='true';
  function moveImages(){
   root.querySelectorAll('.subforums').forEach(subs=>{
    const walker=document.createTreeWalker(subs,NodeFilter.SHOW_TEXT);
    const separators=[];
    while(walker.nextNode()){
     const node=walker.currentNode;
     if(!node.parentElement.closest('a')&&/^\s*(,\s*)+$/.test(node.nodeValue))separators.push(node);
    }
    separators.forEach(node=>node.remove());
   });
   root.querySelectorAll('.rose-forum').forEach(forum=>{
    const frame=forum.querySelector('.rose-forum-image');
    if(!frame||frame.querySelector('img'))return;
    const photo=forum.querySelector('.rose-forum-description img');
    if(!photo)return;
    photo.style.removeProperty('float');
    frame.replaceChildren(photo);
   });
  }
  moveImages();
  let pending=false;
  new MutationObserver(records=>{
   const relevant=records.some(record=>Array.from(record.addedNodes).some(node=>node.nodeType===1&&(node.matches('.rose-forum,.subforums,.rose-forum-description')||node.querySelector('.rose-forum,.subforums,.rose-forum-description')))||record.target.closest?.('.rose-forum-description,.subforums'));
   if(!relevant||pending)return;
   pending=true;requestAnimationFrame(()=>{pending=false;moveImages()});
  }).observe(root,{childList:true,subtree:true});
 }
 initForumImages();
 document.querySelectorAll('.rose-topic-row').forEach(row=>{
  paint(row,row.querySelector('.rose-topic-last-author'));
  const status=row.querySelector('.topic-status-native');
  if(status?.title)row.querySelector('.topicslist-img').title=status.title;
  row.querySelectorAll('.topic-last-link a').forEach(link=>{
   const image=link.querySelector('img');if(!image)return;
   if(!link.title)link.title=image.title||'Voir le dernier message';
   const icon=document.createElement('i');icon.className='ph-thin ph-arrow-up-right';image.replaceWith(icon);
  });
 });
 document.querySelectorAll('.rose-category-caption').forEach(caption=>caption.remove());
 });
 if(window.ComingUpRoses?.register)register();
 else document.addEventListener('cur-core-ready',register,{once:true});
})();
