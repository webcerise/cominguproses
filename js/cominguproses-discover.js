/* Coming Up Roses : discover. Chargé uniquement si son contenu est présent. */
(()=>{
 'use strict';
 const register=()=>window.ComingUpRoses.register('discover',".rose-discover",api=>{
 const {slug,paint,pounds,loadGroups}=api;
 document.querySelectorAll('.rose-discover .feed-item').forEach(item=>paint(item,item.querySelector('.text a[href^="/u"]')));
 });
 if(window.ComingUpRoses?.register)register();
 else document.addEventListener('cur-core-ready',register,{once:true});
})();
