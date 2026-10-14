/* Coming Up Roses : profile. Chargé uniquement si son contenu est présent. */
(()=>{
 'use strict';
 const register=()=>window.ComingUpRoses.register('profile',".live-profile",api=>{
 const {slug,paint,pounds,loadGroups}=api;
 document.querySelectorAll('.live-profile').forEach(profile=>{
  const title=profile.querySelector('.page-title');paint(profile,title);
  if(title){const parts=title.textContent.trim().split(/\s+/),surname=parts.pop();const given=document.createElement('span'),last=document.createElement('strong');given.className='profile-given';last.className='profile-surname';given.textContent=parts.join(' ');last.textContent=surname;title.replaceChildren(given,last)}
  const content=profile.querySelector('.profile_content');if(!content)return;
  const fields=Array.from(content.querySelectorAll('.profile_field'));
  const groups={
   character:{title:'',names:['fc','faceclaim','avatar','credits','credit-s','lieu-de-naissance','age','occupation','statut-civil','residence','lieu-d-habitation']},
   player:{title:'',names:['multicomptes','multi-comptes','pseudo','pseudo-prenom','joue-par']},
   writing:{title:'',names:['ecriture','pronoms','nombre-de-mots','langue']},
   sensitive:{title:'',names:['triggers','trigger','warnings','tw','trigger-warnings','sujets-sensibles-risquant-d-etre-abordes','sujets-sensibles']},
   activity:{title:'',names:['activite','presence','disponibilite']},
   rp:{title:'',names:['rp-en-cours','rps-en-cours']}
  };
  const section=(key,title)=>{const node=document.createElement('section');node.className='profile-fields-section profile-fields-'+key;if(title){const heading=document.createElement('h4');heading.textContent=title;node.append(heading)}return node};
  const sections=Object.fromEntries(Object.entries(groups).map(([key,group])=>[key,section(key,group.title)]));
  const other=section('native','');
  const contacts=profile.querySelector('[data-profile-slot="contacts"]');
  const gif=profile.querySelector('[data-profile-slot="gif"]');
  const balance=profile.querySelector('[data-profile-slot="balance"]');
  const activity=profile.querySelector('[data-profile-slot="activity"]');
  const awards=profile.querySelector('[data-profile-slot="awards"]');
  const imageSlots={image1:profile.querySelector('[data-profile-slot="image1"]'),image2:profile.querySelector('[data-profile-slot="image2"]'),image3:profile.querySelector('[data-profile-slot="image3"]')};
  const imageFields=[];
  const pointNames=['points','pounds','nombre-de-points','solde','livres'];
  const contactNames=['fiche-de-presentation','presentation','fiche-de-liens','fiche-de-lien','liens','reseau-social'];
  let pointField,activityField;const contactFields=[];
  fields.forEach(field=>{
   const name=slug(field.querySelector('label')?.textContent||'');
   const imageSlot=imageSlots[name.replace(/^image-(\d)$/,'image$1')];
   if(imageSlot){imageFields.push(field);imageSlot.append(field);return}
   if(pointNames.includes(name)&&balance){pointField=field;balance.append(field);balance.hidden=false;return}
   if(['gif','gif-icon','gif-du-profil'].includes(name)&&gif){gif.append(field);gif.hidden=false;return}
   if(contactNames.includes(name)&&contacts){contactFields.push(field);contacts.append(field);return}
   const key=Object.keys(groups).find(key=>groups[key].names.includes(name));
   if(key){if(key==='activity'){activityField=field;(activity||sections[key]).append(field)}else sections[key].append(field)}else other.append(field);
  });
  const tabs=document.createElement('nav');tabs.className='profile-tabs';tabs.setAttribute('role','tablist');
  const panes=document.createElement('div');panes.className='profile-panes';
  const buttons=[];
  [['character','personnage',['character']],['player','joueur',['player','sensitive']],['writing','écriture',['writing','rp','native']],['awards','badges',[]]].forEach(([key,label,keys],index)=>{
   const pane=document.createElement('div');pane.className='profile-pane';pane.id='profile-pane-'+key;pane.setAttribute('role','tabpanel');pane.setAttribute('aria-labelledby','profile-tab-'+key);pane.hidden=index!==0;
   keys.forEach(group=>{const node=group==='native'?other:sections[group];if(node.children.length)pane.append(node)});
   if(key==='awards'){
    pane.classList.add('profile-pane-awards');pane.tabIndex=0;
    if(awards)pane.append(awards);
    if(!awards?.querySelector('.award,img')){const empty=document.createElement('div');empty.className='profile-awards-empty';empty.textContent='Aucun badge.';(awards||pane).append(empty)}
   }
   const button=document.createElement('button');button.type='button';button.id='profile-tab-'+key;button.textContent=label;button.setAttribute('role','tab');button.setAttribute('aria-controls',pane.id);button.setAttribute('aria-selected',String(index===0));button.tabIndex=index===0?0:-1;
   buttons.push(button);tabs.append(button);panes.append(pane);
  });
  if(!activity&&sections.activity.children.length)panes.firstElementChild.prepend(sections.activity);
  Array.from(content.children).forEach(node=>panes.querySelector('#profile-pane-writing').append(node));
  content.replaceChildren(panes);content.before(tabs);
  const selectTab=tab=>buttons.forEach(button=>{const active=button===tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;profile.querySelector('#'+button.getAttribute('aria-controls')).hidden=!active});
  buttons.forEach((button,index)=>{button.addEventListener('click',()=>selectTab(button));button.addEventListener('keydown',event=>{const next=event.key==='ArrowRight'?(index+1)%buttons.length:event.key==='ArrowLeft'?(index+buttons.length-1)%buttons.length:event.key==='Home'?0:event.key==='End'?buttons.length-1:-1;if(next<0)return;event.preventDefault();selectTab(buttons[next]);buttons[next].focus()})});
  const contactForm=profile.querySelector('.profile_contact');if(contacts&&contactForm)contacts.prepend(contactForm);
  if(contacts)contacts.hidden=!contacts.querySelector('a,.profile_field');
  function decorateValues(){
   Object.values(imageSlots).forEach(slot=>{if(slot)slot.hidden=!slot.querySelector('.field_uneditable img,field>img')});
   profile.querySelector('.profile-sheet').classList.toggle('profile-has-moodboard',Object.values(imageSlots).some(slot=>slot&&!slot.hidden));
   contactFields.forEach(field=>{
    const value=field.querySelector('.field_uneditable')||field.querySelector('field');
    if(!value||value.querySelector('a,.field_editable,input,select,textarea'))return;
    const text=value.textContent.trim();if(!/^(https?:\/\/|\/[^/])/i.test(text))return;
    try{const url=new URL(text,location.origin);if(!['https:','http:'].includes(url.protocol))return;const link=document.createElement('a');link.href=url.href;link.textContent=field.querySelector('label')?.textContent.replace(/\s*:\s*$/,'').trim()||'ouvrir';const icon=document.createElement('i');icon.className='ph-thin ph-arrow-up-right';link.append(icon);value.replaceChildren(link)}catch{}
   });
   if(pointField){
    const value=pointField.querySelector('.field_uneditable')||pointField.querySelector('field');
    if(value&&!value.querySelector('.profile-balance-value')){const amount=document.createElement('strong');amount.className='profile-balance-value';amount.textContent=pounds(value.textContent);if(!value.querySelector('.field_editable,input,select,textarea'))value.replaceChildren(amount)}
   }
   if(activityField){
    const value=activityField.querySelector('.field_uneditable')||activityField.querySelector('field');
    if(value&&!value.querySelector('.profile-activity-badge')&&!value.querySelector('.field_editable,input,select,textarea')){
     const label=value.textContent.trim(),current=slug(label);
     const state=current.includes('reduit')?'reduced':/^(present|presente|present-e)$/.test(current)?'present':/^(absent|absente|absent-e)$/.test(current)?'absent':null;
     if(state){const badge=document.createElement('span');badge.className='profile-activity-badge';badge.dataset.state=state;badge.textContent=label;value.replaceChildren(badge)}
    }
   }
  }
  decorateValues();
  if(pointField||activityField||contactFields.length||imageFields.length){let pending=false;new MutationObserver(records=>{if(pending||!records.some(record=>[pointField,activityField,...contactFields,...imageFields].some(field=>field?.contains(record.target))))return;pending=true;requestAnimationFrame(()=>{pending=false;decorateValues()})}).observe(profile,{childList:true,subtree:true,characterData:true})}
 });

 });
 if(window.ComingUpRoses?.register)register();
 else document.addEventListener('cur-core-ready',register,{once:true});
})();
