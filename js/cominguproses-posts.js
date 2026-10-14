/* Coming Up Roses : posts. Chargé uniquement si son contenu est présent. */
/* Forumactif : Sur les sujets. */
(()=>{
 'use strict';
 const register=()=>window.ComingUpRoses.register('posts',".topic-post",api=>{
 const {slug,paint,pounds,loadGroups}=api;
 document.querySelectorAll('.topic-post').forEach(post=>{
  paint(post,post.querySelector('.post_pseudo'));
  const avatar=post.querySelector('.topic-avatar'),img=avatar?.querySelector('img');if(!img||avatar.querySelector('.topic-avatar-card'))return;
  img.classList.add('topic-avatar-photo');
  const fields=Array.from(post.querySelectorAll('.user_field'));
  const find=names=>fields.find(field=>names.includes(slug(field.querySelector('.field_label')?.textContent||'')));
  const content=field=>field?.querySelector('.field_content');
  const moodboard=document.createElement('div');moodboard.className='post-person-moodboard';
  [1,2,3].forEach(number=>{
   const field=find(['image'+number,'image-'+number]);
   const image=content(field)?.querySelector('img');
   if(image){const frame=document.createElement('span'),thumbnail=image.cloneNode();thumbnail.removeAttribute('style');thumbnail.removeAttribute('width');thumbnail.removeAttribute('height');thumbnail.loading='lazy';frame.append(thumbnail);moodboard.append(frame)}
   if(field)field.hidden=true;
  });
  if(moodboard.childElementCount)avatar.insertAdjacentElement('afterend',moodboard);
  const card=document.createElement('div');card.className='topic-avatar-card';
  const gifField=find(['gif','gif-icon','gif-du-profil']);
  const gif=content(gifField)?.querySelector('img');
  if(gif){const frame=document.createElement('div');frame.className='topic-avatar-gif';const inner=document.createElement('span');inner.append(gif.cloneNode());frame.append(inner);card.append(frame)}
  const player=document.createElement('span');player.className='topic-avatar-player';player.append('joué par ');const pseudo=document.createElement('strong');const playerField=find(['pseudo','pseudo-prenom','joue-par']);pseudo.textContent=content(playerField)?.textContent.trim()||'—';player.append(pseudo);card.append(player);
  const details=document.createElement('div');details.className='topic-avatar-details';
  [['pounds',['points','pounds','nombre-de-points','solde','livres']],['messages',['messages']],['faceclaim',['faceclaim','avatar','fc']],['crédits',['credits','credit-s']]].forEach(([label,names])=>{const field=find(names);const row=document.createElement('div'),key=document.createElement('span'),value=document.createElement('strong');key.textContent=label;const text=content(field)?.textContent.trim();value.textContent=label==='pounds'?pounds(text||''):text||'—';row.append(key,value);details.append(row);if(field)field.hidden=true});
  if(gifField)gifField.hidden=true;if(playerField)playerField.hidden=true;
  card.append(details);if(!gif)card.classList.add('without-gif');avatar.append(card);
 });

 });
 if(window.ComingUpRoses?.register)register();
 else document.addEventListener('cur-core-ready',register,{once:true});
})();
