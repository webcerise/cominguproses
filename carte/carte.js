'use strict';
const editingEnabled=true;
const $=id=>document.getElementById(id);
let editing=false,canEdit=false;
function adminSession(user){return !!user&&Number(user.session_logged_in)===1&&Number(user.user_id)>0&&Number(user.user_level)===1}
function adminFromPage(html){
  const page=new DOMParser().parseFromString(html,'text/html');
  for(const script of page.head.querySelectorAll('script:not([src])')){
    const read=key=>{
      const pattern=new RegExp('(?:^|[;\\r\\n])\\s*_userdata\\s*(?:\\[\\s*["\\\']'+key+'["\\\']\\s*\\]|\\.'+key+')\\s*=\\s*["\\\']?(-?\\d+)["\\\']?\\s*;');
      const match=script.textContent.match(pattern);return match?Number(match[1]):undefined;
    };
    if(adminSession({session_logged_in:read('session_logged_in'),user_id:read('user_id'),user_level:read('user_level')}))return true;
  }
  return false;
}
async function checkAdmin(){
  if(window._userdata&&Object.hasOwn(window._userdata,'user_level'))return adminSession(window._userdata);
  // Une page HTML sans en-tête Forumactif n’expose pas _userdata.
  // Lire la session native dans le head de /forum, sans exécuter ses scripts.
  try{
    const response=await fetch('/forum',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(8000)});
    if(!response.ok||new URL(response.url||location.href).origin!==location.origin)return false;
    return adminFromPage(await response.text());
  }catch{return false}
}
const categories={lieu:'Lieux',residence:'Résidences',restaurant:'Bars & restaurants',commerce:'Commerces',culture:'Culture'};
const legacyIcons={lieu:'map-pin',residence:'house',restaurant:'wine',commerce:'storefront',culture:'buildings'};
const iconOptions={"first-aid-kit":"Hôpital","t-shirt":"Friperie","needle":"Tatouage","car":"Garage","bowl-food":"Cuisine indienne","palette":"Galerie","flower-lotus":"Céramique","basket":"Épicerie","camera":"Studio photo","beer-bottle":"Pub — bouteille","users-three":"Centre communautaire","coffee":"Café","film-slate":"Cinéma","barbell":"Sport","disco-ball":"Club","tree":"Parc","joystick":"Arcade","swimming-pool":"Piscine","storefront":"Marché","bowl-steam":"Cuisine asiatique","beer-stein":"Pub — chope","cross":"Cimetière","fork-knife":"Restaurant","rainbow":"Lieu LGBTQ+","drop":"Spa","person-simple-tai-chi":"Yoga","key":"Agence immobilière","chalkboard-teacher":"École","paw-print":"Vétérinaire","books":"Librairie","person-simple":"Danse","flower":"Fleuriste","bank":"Musée","martini":"Cocktails","armchair":"Antiquaire","mask-happy":"Théâtre","crown":"Hôtel","fire-truck":"Pompiers","scales":"Avocats","wine":"Bar","cooking-pot":"Brasserie","shield-star":"Police","gavel":"Tribunal","graduation-cap":"Université","diamond":"Bijouterie","music-notes":"Opéra","house":"Résidence","map-pin":"Autre lieu","buildings":"Bâtiment","vault":"Banque — siège européen","currency-gbp":"Banque — siège City","house-line":"Demeure","house-simple":"Maison","building-office":"Groupe immobilier","diamonds-four":"Bijouterie — Bellamy"};
const zones={east:{label:'East End · £',color:'#bd7868'},south:{label:'South London · ££',color:'#bc9a63'},north:{label:'North London · £££',color:'#929f7b'},west:{label:'West London · ££££',color:'#899fb5'},central:{label:'Central London · £££££',color:'#b7a0ba'}};
const iconButtons=new Map();
function syncIconPicker(){
  if(!$('icon-picker'))return;
  const value=$('icon').value,query=$('icon-filter').value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  $('icon-picker').style.setProperty('--place-color',zones[$('zone').value]?.color||'#c4a66b');
  $('icon-current-symbol').className='ph-thin ph-'+value;
  $('icon-current-name').textContent=iconOptions[value]||'Autre lieu';
  let visible=0;
  for(const [key,button] of iconButtons){
    const matches=(iconOptions[key]+' '+key).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query);
    button.hidden=!matches;button.setAttribute('aria-pressed',String(key===value));
    if(matches)visible++;
  }
  $('icon-empty').hidden=visible!==0;
}
function createIconPicker(){
  const picker=el('fieldset',undefined,'icon-picker');picker.id='icon-picker';
  picker.append(el('legend','Pictogramme'));
  const current=el('div',undefined,'icon-current');current.setAttribute('aria-live','polite');
  const symbol=el('i');symbol.id='icon-current-symbol';symbol.setAttribute('aria-hidden','true');
  const name=el('span');name.id='icon-current-name';current.append(symbol,name);picker.append(current);
  const search=el('input');search.id='icon-filter';search.type='search';search.placeholder='Café, maison, école…';search.setAttribute('aria-label','Rechercher une icône');search.oninput=syncIconPicker;picker.append(search);
  const choices=el('div',undefined,'icon-choices');choices.setAttribute('role','group');choices.setAttribute('aria-label','Choisir le pictogramme du lieu');
  for(const [key,label] of Object.entries(iconOptions)){
    const button=el('button');button.type='button';button.title=label;button.dataset.icon=key;button.setAttribute('aria-label',label);
    const image=el('i',undefined,'ph-thin ph-'+key);image.setAttribute('aria-hidden','true');button.append(image);
    button.onclick=()=>{$('icon').value=key;$('icon').dispatchEvent(new Event('change',{bubbles:true}))};
    iconButtons.set(key,button);choices.append(button);
  }
  picker.append(choices);
  const empty=el('div','Aucune icône pour cette recherche.','icon-empty');empty.id='icon-empty';empty.hidden=true;picker.append(empty);
  const label=$('icon').closest('label');label.after(picker);label.hidden=true;
  $('icon').addEventListener('change',syncIconPicker);$('zone').addEventListener('change',syncIconPicker);
  syncIconPicker();
}
function createResidenceTools(){
  const filters=el('div',undefined,'residence-filters');filters.id='residence-filters';filters.setAttribute('role','group');filters.setAttribute('aria-label','Afficher ou masquer les résidences');
  for(const [value,label] of Object.entries({all:'Tout',only:'Résidences uniquement',hide:'Sans résidences'})){
    const button=el('button',label);button.type='button';button.dataset.residences=value;button.setAttribute('aria-pressed',String(value==='all'));
    button.onclick=()=>{residenceMode=value;for(const item of filters.children)item.setAttribute('aria-pressed',String(item===button));render()};filters.append(button);
  }
  $('filters').after(filters);
  const toggle=el('label',undefined,'residential-toggle'),checkbox=el('input');checkbox.id='residential';checkbox.type='checkbox';checkbox.addEventListener('change',()=>syncResidenceEditor(true));
  toggle.append(checkbox,el('span','Domicile de membres'));
  const residents=el('fieldset',undefined,'residents-editor');residents.id='residents-editor';residents.hidden=true;residents.disabled=true;residents.append(el('legend','Résidents'));
  const entries=el('div');entries.id='resident-fields';residents.append(entries);
  const add=el('button','Ajouter un résident','add-resident');add.type='button';add.append(el('i',undefined,'ph-thin ph-plus'));add.onclick=()=>addResidentFields();residents.append(add);
  $('type').closest('label').after(toggle,residents);
}
function syncResidenceEditor(suggest=false){
  const enabled=$('residential').checked;$('residents-editor').hidden=!enabled;$('residents-editor').disabled=!enabled;
  if(enabled&&suggest){
    if(!$('type').value.trim())$('type').value='Résidence';
    if($('icon').value==='map-pin'){$('icon').value='house';syncIconPicker()}
  }
}
function addResidentFields(resident={}){
  const entry=el('div',undefined,'resident-entry'),heading=el('div',undefined,'resident-entry-heading');
  heading.append(el('span','Résident'));
  const remove=el('button');remove.type='button';remove.setAttribute('aria-label','Retirer ce résident');remove.title='Retirer ce résident';remove.append(el('i',undefined,'ph-thin ph-x'));remove.onclick=()=>entry.remove();heading.append(remove);entry.append(heading);
  for(const [key,label,placeholder,limit] of [
    ['name','Nom du personnage','Prénom Nom',100],['image','Photo (URL)','https://…',2000],
    ['profile','Lien du profil','/u42 ou https://…',2000],['note','Indication','Appartement 3, Propriétaire, Résident…',120]
  ]){
    const field=el('label',label),input=el('input');input.type=key==='image'?'url':'text';input.dataset.residentField=key;input.placeholder=placeholder;input.maxLength=limit;input.required=key==='name';input.value=resident[key]||'';field.append(input);entry.append(field);
  }
  $('resident-fields').append(entry);
}
function readResidentFields(){return Array.from($('resident-fields').children,entry=>Object.fromEntries(Array.from(entry.querySelectorAll('[data-resident-field]'),input=>[input.dataset.residentField,input.value.trim()]))).filter(resident=>resident.name)}
function renderResidents(place,copy){
  if(!place.residential||!place.residents.length)return;
  const section=el('section',undefined,'place-residents');section.append(el('h3','À cette adresse'));
  for(const resident of place.residents){
    const row=el(resident.profile?'a':'div',undefined,'place-resident');
    if(resident.profile){row.href=resident.profile;row.target='_blank';row.rel='noopener'}
    const avatar=el('span',undefined,'resident-avatar');
    const initial=el('span',resident.name.split(/\s+/).slice(0,2).map(word=>word[0]).join('').toUpperCase(),'resident-initial');
    if(resident.image){const image=el('img');image.src=resident.image;image.alt='';image.loading='lazy';image.addEventListener('error',()=>image.replaceWith(initial),{once:true});avatar.append(image)}else avatar.append(initial);
    const text=el('span',undefined,'resident-copy');text.append(el('strong',resident.name));if(resident.note)text.append(el('small',resident.note));row.append(avatar,text);
    if(resident.profile){const arrow=el('i',undefined,'ph-thin ph-arrow-up-right');arrow.setAttribute('aria-hidden','true');row.append(arrow)}
    section.append(row);
  }
  copy.append(section);
}
function placeColor(p){return zones[p.zone]?.color||'#c4a66b'}
function placeLabel(p){return [p.type,zones[p.zone]?.label,p.residential?'domicile de membres':''].filter(Boolean).join(' · ')}
function inferZone(p){return p.lng<-.19?'west':p.lat<51.49?'south':p.lng>-.085?'east':p.lat>51.535?'north':'central'}
function fitPlaces(duration=0){if(!map||!places.length)return;const bounds=new maplibregl.LngLatBounds();places.forEach(p=>bounds.extend([p.lng,p.lat]));const desktop=innerWidth>850;map.fitBounds(bounds,{padding:{top:130,bottom:80,left:desktop&&!$('directory').hidden?390:60,right:desktop&&editing&&!$('editor').hidden?390:60},maxZoom:14,duration})}
const dataSource=document.querySelector('meta[name="rose-map-data"]')?.content;
const dataURL=dataSource?new URL(dataSource,location.href).href:'';
function readPlaces(text){
  if(text.trimStart().startsWith('{'))return JSON.parse(text);
  const block=new DOMParser().parseFromString(text,'text/html').querySelector('script#map-data[type="application/json"]');
  if(!block)throw Error('La page des lieux doit contenir le bloc map-data.');
  return JSON.parse(block.textContent);
}
function exportPage(){return '<!doctype html>\n<html lang="fr"><head><meta charset="utf-8"><title>Lieux de Londres</title></head><body>\n<script type="application/json" id="map-data">\n'+JSON.stringify({version:3,places},null,2).replace(/</g,'\\u003c')+'\n</script>\n</body></html>'}
const KEY='roses-london-draft-v1',CACHE='roses-geocode-v1';
let places=[],publishedPlaces=[],markers=[],map,draftMarker,active='all',residenceMode='all',selectedId,lastRequest=0,searchBusy=false,dataLoadError='';
const motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
function message(text){$('status').textContent=text}
function el(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n}
function safeURL(value,base){if(!value)return '';try{const u=new URL(value,base);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}
function validateResidents(value){
  if(value===undefined)return [];
  if(!Array.isArray(value))throw Error('La liste des résidents est invalide.');
  return value.map(resident=>{
    if(!resident||typeof resident.name!=='string'||!resident.name.trim())throw Error('Chaque résident doit avoir un nom.');
    const image=safeURL(resident.image),profile=safeURL(resident.profile,'https://cominguproses.forumactif.com/');
    if(resident.image&&!image)throw Error('L’adresse de la photo d’un résident est invalide.');
    if(resident.profile&&!profile)throw Error('Le lien de profil d’un résident est invalide.');
    return {name:resident.name.trim().slice(0,100),image,profile,note:String(resident.note||'').trim().slice(0,120)};
  });
}
function validate(data){if(!data||!Array.isArray(data.places)||data.places.length>500)throw Error('Fichier invalide : 500 lieux maximum.');const ids=new Set();return data.places.map(p=>{if(!p||!p.id||ids.has(String(p.id))||typeof p.name!=='string'||!p.name.trim()||!Object.hasOwn(categories,p.category||'lieu')||(p.zone&&!Object.hasOwn(zones,p.zone))||(p.residential!==undefined&&typeof p.residential!=='boolean')||!Number.isFinite(p.lng)||!Number.isFinite(p.lat)||p.lng<-.55||p.lng>.35||p.lat<51.25||p.lat>51.75)throw Error('Un lieu est invalide ou situé hors de Londres.');ids.add(String(p.id));return {id:String(p.id),name:p.name.slice(0,100),category:p.category||'lieu',zone:p.zone||inferZone(p),type:String(p.type||categories[p.category||'lieu']).slice(0,80),icon:Object.hasOwn(iconOptions,p.icon)?p.icon:legacyIcons[p.category||'lieu'],address:String(p.address||'').slice(0,250),description:String(p.description||'').slice(0,1500),lng:p.lng,lat:p.lat,image:safeURL(p.image),link:safeURL(p.link),residential:p.residential===undefined?p.category==='residence':p.residential,residents:validateResidents(p.residents),example:!!p.example,positionPrecision:['building','street','postcode'].includes(p.positionPrecision)?p.positionPrecision:'building'}})}
function clonePlaces(rows){return rows.map(place=>({...place,residents:place.residents.map(resident=>({...resident}))}))}
function persist(){if(!editing)return;try{localStorage.setItem(KEY,JSON.stringify({version:3,places}));message('Brouillon enregistré sur cet appareil. Exportez pour publier.')}catch{message('Stockage local indisponible : exportez pour conserver vos lieux.')}}
function filtered(){const q=$('search').value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();return places.filter(p=>(active==='all'||p.zone===active)&&(residenceMode==='all'||(residenceMode==='only'?p.residential:!p.residential))&&(p.name+' '+p.address+' '+p.description+' '+placeLabel(p)+' '+(p.residential?p.residents.map(resident=>resident.name+' '+resident.note).join(' '):'')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q))}
function renderPins(){
  markers.forEach(marker=>marker.remove());markers=[];
  if(!map)return;
  for(const place of filtered()){
    const pin=el('button',undefined,'pin');pin.type='button';
    pin.title=place.name;pin.setAttribute('aria-label',pin.title);
    pin.style.setProperty('--place-color',placeColor(place));
    pin.append(el('i',undefined,'ph-thin ph-'+place.icon));
    pin.addEventListener('click',event=>{
      event.stopPropagation();
      showPlace(place);
    });
    markers.push(new maplibregl.Marker({element:pin}).setLngLat([place.lng,place.lat]).addTo(map));
  }
}
function render(){
  const rows=filtered();$('count').textContent=dataLoadError?'Lieux indisponibles':rows.length+' adresse'+(rows.length===1?'':'s');$('places').replaceChildren();
  if(selectedId&&!rows.some(p=>p.id===selectedId)){$('detail').hidden=true;selectedId=undefined}
  if(!rows.length)$('places').append(el('p',dataLoadError?'Les lieux sont temporairement indisponibles.':'Aucune adresse pour cette recherche.','empty'));
  rows.forEach(p=>{const row=el('button',undefined,'place-row');row.type='button';row.style.setProperty('--place-color',placeColor(p));const icon=el('span',undefined,'place-symbol');icon.append(el('i',undefined,'ph-thin ph-'+p.icon));row.append(icon);const content=el('div');content.append(el('strong',p.name),el('small',placeLabel(p)+(p.example?' · exemple':'')));row.append(content);row.addEventListener('click',()=>showPlace(p));$('places').append(row)});
  renderPins();
}
function showPlace(p){selectedId=p.id;const box=$('detail-content');$('detail').style.setProperty('--place-color',placeColor(p));box.replaceChildren();if(p.image){const img=el('img');img.src=p.image;img.alt='';img.addEventListener('error',()=>img.remove());box.append(img)}const copy=el('div',undefined,'detail-copy');const symbol=el('span',undefined,'detail-symbol');symbol.append(el('i',undefined,'ph-thin ph-'+p.icon));copy.append(symbol,el('small',placeLabel(p)+(p.example?' · exemple':'')),el('h2',p.name),el('p',p.address),el('p',p.description));if(p.link){const a=el('a','Ouvrir sur le forum ↗');a.href=p.link;a.target='_blank';a.rel='noopener';copy.append(a)}if(editing){const edit=el('button','Modifier');edit.onclick=()=>editPlace(p);const remove=el('button','Supprimer');remove.onclick=()=>{if(!confirm('Supprimer « '+p.name+' » du brouillon ?'))return;places=places.filter(x=>x.id!==p.id);persist();render();$('detail').hidden=true};copy.append(edit,remove)}renderResidents(p,copy);box.append(copy);$('detail').hidden=false;map?.easeTo({center:[p.lng,p.lat],zoom:16,padding:{left:innerWidth>850?350:0,right:editing&&innerWidth>850?350:0},duration:motion?700:0});if(innerWidth<850)$('directory').hidden=true;if(editing)$('editor').hidden=true}
function point(lng,lat){if(!editing)return;$('lng').value=lng.toFixed(6);$('lat').value=lat.toFixed(6);if(!map)return;if(!draftMarker){draftMarker=new maplibregl.Marker({color:'#c4a66b',draggable:true}).setLngLat([lng,lat]).addTo(map);draftMarker.on('dragend',()=>{const c=draftMarker.getLngLat();point(c.lng,c.lat)})}else draftMarker.setLngLat([lng,lat])}
function editPlace(p){if(!editing)return;$('detail').hidden=true;$('editor').hidden=false;for(const key of ['name','zone','type','icon','description','image','link','address','lng','lat'])$(key).value=p[key]||'';$('place-id').value=p.id;$('place-form').dataset.category=p.category;$('residential').checked=p.residential;$('resident-fields').replaceChildren();p.residents.forEach(addResidentFields);syncResidenceEditor();syncIconPicker();point(p.lng,p.lat)}
function resetForm(){if(!editing)return;$('place-form').reset();delete $('place-form').dataset.category;$('place-id').value='';$('address').value='';$('results').replaceChildren();draftMarker?.remove();draftMarker=null;$('detail').hidden=true;$('editor').hidden=false;$('resident-fields').replaceChildren();syncResidenceEditor();syncIconPicker()}
async function geocode(event){event.preventDefault();if(!editing||searchBusy)return;const query=$('address').value.trim();if(!query)return;searchBusy=true;$('find-address').disabled=true;try{let cache={};try{cache=JSON.parse(localStorage.getItem(CACHE)||'{}')}catch{};let results=cache[query.toLowerCase()];if(!results){if(Date.now()-lastRequest<1200)throw Error('Patientez un instant avant une nouvelle recherche.');lastRequest=Date.now();const url=new URL('https://nominatim.openstreetmap.org/search');url.search=new URLSearchParams({q:query,format:'jsonv2',limit:'5',countrycodes:'gb',viewbox:'-0.55,51.75,0.35,51.25',bounded:'1','accept-language':'fr'});message('Recherche de l’adresse…');const response=await fetch(url,{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('La recherche est temporairement indisponible. Placez le repère directement sur la carte.');results=await response.json();cache[query.toLowerCase()]=results;try{localStorage.setItem(CACHE,JSON.stringify(cache))}catch{}}$('results').replaceChildren();results.forEach(result=>{const b=el('button',result.display_name);b.type='button';b.onclick=()=>{point(Number(result.lon),Number(result.lat));map?.easeTo({center:[Number(result.lon),Number(result.lat)],zoom:16,duration:motion?700:0});message('Position trouvée. Vous pouvez déplacer le repère doré.')};$('results').append(b)});message(results.length?'Choisissez une adresse dans les résultats.':'Aucune adresse trouvée : essayez le nom de la rue ou cliquez sur la carte.')}catch(error){message(error.message)}finally{searchBusy=false;$('find-address').disabled=false}}
async function start(){canEdit=editingEnabled&&await checkAdmin();editing=canEdit&&new URLSearchParams(location.search).get('edition')==='1';document.body.classList.toggle('editing',editing);$('editor').hidden=!editing;$('editor-link').hidden=!canEdit||editing;$('toggle-editor').hidden=!canEdit;
try{if(!dataURL||dataSource.includes('URL_PAGE_LIEUX'))throw Error('Renseignez l’URL de la page des lieux dans rose-map-data.');const response=await fetch(dataURL,{cache:'no-store'});if(!response.ok)throw Error('Impossible de charger les lieux.');places=validate(readPlaces(await response.text()));publishedPlaces=clonePlaces(places);if(editing){try{const draft=localStorage.getItem(KEY);if(draft){const data=JSON.parse(draft);if(data.version>=2)places=validate(data);else{
const merged=new Map(publishedPlaces.map(p=>[p.id,p]));validate(data).filter(p=>!(p.example&&/^ex[1-6]$/.test(p.id))).forEach(p=>{const current=merged.get(p.id);merged.set(p.id,current?{...p,zone:current.zone,type:current.type,icon:current.icon}:p)});places=[...merged.values()];
}}}catch{message('Le brouillon local est illisible. Les lieux publiés sont affichés.')}}}catch(error){dataLoadError=error.message;message(dataLoadError)}
for(const [key,label] of Object.entries({all:'Tout',...Object.fromEntries(Object.entries(zones).map(([key,zone])=>[key,zone.label]))})){const b=el('button',label);b.type='button';if(zones[key])b.style.setProperty('--place-color',zones[key].color);b.classList.toggle('zone-filter',key!=='all');b.setAttribute('aria-pressed',String(key==='all'));b.onclick=()=>{active=key;Array.from($('filters').children).forEach(n=>n.setAttribute('aria-pressed',String(n===b)));render()};$('filters').append(b)}render();
if(!window.maplibregl){message('Le moteur de carte n’a pas chargé. Vérifiez votre connexion puis rechargez la page.');return}
try{const response=await fetch('https://tiles.openfreemap.org/styles/dark',{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Fond de carte indisponible.');const style=await response.json();style.layers=style.layers.filter(layer=>layer.type!=='symbol'||['transportation_name','water_name'].includes(layer['source-layer']));for(const layer of style.layers){if(layer.type==='background')layer.paint['background-color']='#191919';if(layer.type==='fill')layer.paint['fill-color']=layer['source-layer']==='water'?'#101010':layer['source-layer']==='building'?'#3b3b3b':'#222222';if(layer.type==='line'&&layer.paint?.['line-color'])layer.paint['line-color']=layer['source-layer']==='waterway'?'#111111':'#505050';if(layer.type==='symbol'){layer.paint={...layer.paint,'text-color':'#c4c4c4','text-halo-color':'#202020'}}}
// Draw all ground layers before buildings, then keep street labels above them.
style.layers=[...style.layers.filter(layer=>layer.type!=='symbol'),...style.layers.filter(layer=>layer.type==='symbol')];
const buildings=style.layers.find(l=>l['source-layer']==='building');if(buildings){delete buildings.paint['fill-outline-color'];buildings.paint['fill-antialias']=false;style.layers.splice(style.layers.findIndex(l=>l.type==='symbol'),0,{id:'roses-buildings',type:'fill-extrusion',source:buildings.source,'source-layer':'building',minzoom:14,filter:['!=',['get','hide_3d'],true],paint:{'fill-extrusion-color':'#626262','fill-extrusion-height':['coalesce',['get','render_height'],8],'fill-extrusion-base':['coalesce',['get','render_min_height'],0],'fill-extrusion-opacity':1}})}
map=new maplibregl.Map({container:'map',style,center:[-.145,51.509],zoom:14.8,pitch:52,bearing:-22,maxPitch:65,maxBounds:[[-.55,51.25],[.35,51.75]],attributionControl:false});map.addControl(new maplibregl.AttributionControl({compact:false}),'bottom-right');map.addControl(new maplibregl.NavigationControl({showCompass:true}),'bottom-left');map.on('load',()=>{fitPlaces();render();message(dataLoadError)});map.on('moveend',renderPins);map.on('resize',renderPins);map.on('error',()=>message('Certaines données cartographiques sont indisponibles. Vérifiez votre connexion.'));if(editing)map.on('click',event=>{if(event.originalEvent.target.closest('button'))return;point(event.lngLat.lng,event.lngLat.lat);$('editor').hidden=false;message('Position ajustée. Complétez puis enregistrez le lieu.')});}catch(error){message('Carte indisponible : '+error.message)}}
$('toggle-editor').onclick=()=>{if(!canEdit)return;if(!editing){const url=new URL(location.href);url.searchParams.set('edition','1');location.href=url.href;return} $('editor').hidden=!$('editor').hidden};
$('search').oninput=render;$('toggle-directory').onclick=()=>{$('directory').hidden=!$('directory').hidden};$('close-detail').onclick=()=>{$('detail').hidden=true;if(editing)$('editor').hidden=false};$('perspective').onclick=()=>{if(!map)return;const three=map.getPitch()<10;map.easeTo({pitch:three?52:0,bearing:three?-22:0,duration:motion?500:0});$('perspective').setAttribute('aria-pressed',String(three))};$('recenter').onclick=()=>fitPlaces(motion?650:0);
$('address-search').onsubmit=geocode;$('new-place').onclick=resetForm;
$('place-form').onsubmit=event=>{event.preventDefault();if(!editing)return;const data={id:$('place-id').value||crypto.randomUUID(),name:$('name').value.trim(),category:$('place-form').dataset.category||($('residential').checked||$('icon').value==='house'?'residence':'lieu'),zone:$('zone').value,type:$('type').value.trim(),icon:$('icon').value,address:$('address').value,description:$('description').value,image:$('image').value,link:$('link').value,residential:$('residential').checked,residents:readResidentFields(),positionPrecision:places.find(p=>p.id===$('place-id').value)?.positionPrecision||'building',lng:Number($('lng').value),lat:Number($('lat').value)};try{const p=validate({places:[data]})[0];const index=places.findIndex(x=>x.id===p.id);if(index<0)places.push(p);else places[index]=p;persist();render();resetForm()}catch(error){message(error.message)}};
$('export').onclick=()=>{if(!editing)return;const blob=new Blob([exportPage()],{type:'text/html;charset=utf-8'});const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='lieux.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('Fichier exporté : collez son contenu dans la page HTML des lieux pour publier.')};
$('import').onchange=async event=>{if(!editing)return;const file=event.target.files[0];if(!file)return;try{if(file.size>2e6)throw Error('Fichier trop volumineux.');const next=validate(readPlaces(await file.text()));if(!confirm('Remplacer le brouillon par les '+next.length+' lieux du fichier ?'))return;places=next;persist();render();resetForm()}catch(error){message(error.message)}finally{event.target.value=''}};
document.getElementById("close-editor").onclick=()=>{document.getElementById("editor").hidden=true};
for(const [key,zone] of Object.entries(zones)){const option=el('option',zone.label);option.value=key;$('zone').append(option)}
for(const [key,label] of Object.entries(iconOptions)){const option=el('option',label);option.value=key;option.defaultSelected=key==='map-pin';$('icon').append(option)}
$('icon').value='map-pin';
createIconPicker();
createResidenceTools();
$('load-published').onclick=()=>{if(!editing||!publishedPlaces.length)return;if(!confirm('Remplacer ce brouillon par les '+publishedPlaces.length+' adresses publiées ?'))return;places=clonePlaces(publishedPlaces);persist();render();resetForm();fitPlaces(motion?650:0)};
start();
