/* Coming Up Roses : posts. Chargé uniquement si son contenu est présent. */
/* Forumactif : Sur les sujets. */
(()=>{
 'use strict';
 const register=()=>window.ComingUpRoses.register('posts',".topic-post",api=>{
 const {slug,paint,pounds,loadGroups}=api;
 const halloweenGif='https://media4.giphy.com/media/XcFMdhecigphmH9v9I/giphy-downsized.gif';
 // Les numéros restent fixes pour conserver le sens des lancers dans les archives.
 const halloweenResults={
  1:['Vous perdez à la pêche aux canards.','game-controller'],
  2:['Vous avez peur dans le train fantôme.','ghost'],
  3:['Vous gagnez une peluche hideuse.','gift'],
  4:['Vous ratez tous vos tirs au stand de tir.','crosshair'],
  5:['Vous vomissez après trois tours de manège.','spiral'],
  6:['Vous faites un score nul au punching-ball.','boxing-glove'],
  7:['Vous faites un super score au punching-ball.','boxing-glove'],
  8:['Vous perdez votre téléphone dans les montagnes russes.','device-mobile'],
  9:['Vous gagnez le gros lot.','trophy'],
  10:['Vous vous retrouvez coincé·e dans une attraction.','lock-key'],
  11:['Vous faites un tour de grande roue avec votre ex.','heart-break'],
  12:['Vous perdez un pari et devez monter dans le manège le plus effrayant.','warning-circle'],
  13:['Vous trichez au jeu des anneaux.','game-controller'],
  14:['Vous provoquez un carambolage aux auto-tamponneuses.','lightning'],
  15:['Vous achetez une pomme d’amour particulièrement collante.','heart'],
  16:['Vous dépensez une fortune sans rien gagner.','coins'],
  17:['Vous goûtez une confiserie au goût suspect.','question'],
  18:['Vous renversez votre verre sur quelqu’un.','wine'],
  19:['Vous surprenez un forain en train de tricher.','eye'],
  20:['Un clown vous poursuit.','footprints'],
  21:['Vous apercevez une silhouette inquiétante dans la foule.','ghost'],
  22:['Une main froide vous saisit l’épaule.','hand'],
  23:['Vous recevez un message anonyme inquiétant.','device-mobile'],
  24:['Vous entendez votre prénom murmuré dans votre dos.','ear'],
  25:['Vous trouvez une poupée abandonnée sur un banc.','baby'],
  26:['Vous croisez une personne masquée qui connaît votre identité.','mask-happy'],
  27:['Vous découvrez un ticket pour une attraction qui n’existe pas sur le plan.','question'],
  28:['Une voyante vous fait une prédiction inquiétante.','cards'],
  29:['Vous apercevez votre double dans un miroir déformant.','eye'],
  30:['Vous entendez une annonce mystérieuse au haut-parleur.','speaker-high'],
  31:['Vous assistez à une coupure de courant générale.','lightning'],
  32:['Vous découvrez une porte interdite au public.','door-open'],
  33:['Vous perdez votre portefeuille dans la foule.','wallet'],
  34:['On vous accuse d’avoir volé un lot.','warning-circle'],
  35:['Vous surprenez une dispute derrière un stand.','ear'],
  36:['Vous entendez une rumeur croustillante.','chat-circle-dots'],
  37:['Vous recroisez votre ex au pire moment possible.','heart-break'],
  38:['Vous embrassez un·e inconnu·e sous une arche de citrouilles.','heart'],
  39:['Vous surprenez deux personnes en train de s’embrasser.','eye'],
  40:['On vous confond avec quelqu’un d’autre.','mask-happy'],
  41:['Vous acceptez un défi débile.','game-controller'],
  42:['Vous perdez votre groupe d’amis dans la foule.','users'],
  43:['Vous retrouvez un objet perdu depuis des années.','gift'],
  44:['Vous remportez un lot ayant appartenu à un visiteur disparu.','ghost'],
  45:['Vous apercevez une personne portant exactement le même costume que vous.','mask-happy'],
  46:['Vous découvrez que toutes les horloges indiquent minuit.','clock'],
  47:['Vous entendez parler d’une attraction qui aurait été fermée après un accident.','warning-circle'],
  48:['Vous vous retrouvez enfermé·e dans une attraction après la fermeture.','lock-key'],
  49:['Vous entendez un rire provenant d’une cabine de voyance vide.','cards'],
  50:['Toutes les lumières d’un stand s’éteignent à votre passage.','moon'],
  51:['Une silhouette vous suit tout au long de la soirée.','footprints'],
  52:['Vous trouvez une enveloppe mystérieuse dans la poche de votre costume.','envelope-simple'],
  53:['Vous réussissez à attraper une peluche aux machines à pinces.','gift'],
  54:['Vous partagez votre barbe à papa avec quelqu’un.','heart'],
  55:['Vous restez bloqué·e dans une attraction pendant une heure.','clock'],
  56:['Vous croisez un clown terrifiant et sanglant en arrivant à l’infirmerie.','first-aid-kit']
 };
 function renderHalloweenDice(){
  document.querySelectorAll('.topic-post .post-prose').forEach(prose=>{
   if(prose.closest('blockquote,.quote,.codebox,pre,code')||prose.querySelector('.cur-halloween-result'))return;
   const divider=prose.querySelector(':scope>hr');if(!divider)return;
   let prefix='',result='',after=false;
   prose.childNodes.forEach(node=>{if(node===divider){after=true;return}if(after)result+=node.textContent;else prefix+=node.textContent});
   const normalize=text=>text.replace(/[’‘“”«»"]/g,"'").replace(/\s+/g,' ').trim();
   if(!/^Le membre '.+' a effectué l'action suivante\s*:\s*Lancer de dés$/i.test(normalize(prefix)))return;
   const match=normalize(result).match(/^'event halloween'\s*:\s*(\d+(?:\s*,\s*\d+)*)$/i);if(!match)return;
   const numbers=match[1].split(',').map(number=>Number(number.trim()));
   if(numbers.some(number=>!Object.hasOwn(halloweenResults,number)))return;
   const cards=numbers.map(number=>{
    const [text,iconName]=halloweenResults[number];
    const card=document.createElement('article');card.className='cur-halloween-result';card.dataset.halloweenResult=number;
    const ticket=document.createElement('div');ticket.className='cur-halloween-ticket';
    const image=document.createElement('img');image.src=halloweenGif;image.alt='';image.loading='lazy';image.decoding='async';
    const icon=document.createElement('i');icon.className='ph-thin ph-'+iconName;icon.setAttribute('aria-hidden','true');
    const score=document.createElement('span');score.textContent=String(number).padStart(2,'0');score.setAttribute('aria-label','Résultat '+number+' sur 56');
    ticket.append(image,icon,score);
    const copy=document.createElement('div');copy.className='cur-halloween-result-copy';
    const label=document.createElement('span');label.className='cur-halloween-kicker';label.textContent='trick or treat?';
    const description=document.createElement('div');description.className='cur-halloween-result-text';description.textContent=text;
    copy.append(label,description);card.append(ticket,copy);return card;
   });
   prose.replaceChildren(...cards);
  });
 }
 renderHalloweenDice();
 document.addEventListener('cur-fragments-ready',renderHalloweenDice);
 document.querySelectorAll('.topic-post').forEach(post=>{
  paint(post,post.querySelector('.post_pseudo'));
  const fields=Array.from(post.querySelectorAll('.user_field'));
  // La fiche de présentation est un champ de profil normal, pas un champ contact.
  const presentationNames=['fiche-de-presentation','fiche-presentation','fiche-de-prez','fiche-prez','presentation','prez'];
  fields.forEach(field=>{
   if(!field.closest('.post_profile,.post-person,.post_userinfo'))return;
   if(!presentationNames.includes(slug(field.querySelector('.field_label')?.textContent||'')))return;
   const value=field.querySelector('.field_content');
   const nativeLink=value?.querySelector('a[href]');
   const raw=(nativeLink?.getAttribute('href')||value?.textContent||'').trim();
   if(!/^(https?:\/\/|\/[^/])/i.test(raw))return;
   let url;try{url=new URL(raw,location.href)}catch{return}
   if(!['https:','http:'].includes(url.protocol))return;
   let contacts=post.querySelector('.post_contact');
   if(!contacts){
    const person=field.closest('.post_profile,.post-person')||field.closest('.post_userinfo');
    contacts=document.createElement('div');contacts.className='post_contact';person.append(contacts);
   }
   let link=contacts.querySelector('[data-topic-presentation]');
   if(!link){
    link=document.createElement('a');link.className='topic-presentation-link';link.dataset.topicPresentation='true';
    link.title='Fiche de présentation';link.setAttribute('aria-label','Fiche de présentation');
    const icon=document.createElement('i');icon.className='ph-thin ph-identification-card';icon.setAttribute('aria-hidden','true');
    link.append(icon);contacts.append(link);
   }
   link.href=url.href;
   field.hidden=true;
  });
  const avatar=post.querySelector('.topic-avatar'),img=avatar?.querySelector('img');if(!img||avatar.querySelector('.topic-avatar-card'))return;
  img.classList.add('topic-avatar-photo');
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
