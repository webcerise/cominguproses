/* Coming Up Roses : index. Chargé uniquement si son contenu est présent. */
/* Forumactif : Sur l'index. */
(()=>{
 'use strict';
 const register=()=>window.ComingUpRoses.register('index',".rose-pa,.group-legend",api=>{
 const {slug,paint,pounds,loadGroups}=api;
async function updatePaWeather(){
  const temperature=document.querySelector('#pa-weather-temperature');
  if(!temperature)return;
  try{
    const response=await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current=temperature_2m,weather_code,is_day&timezone=Europe%2FLondon',{signal:AbortSignal.timeout(8000)});
    if(!response.ok)throw new Error('Weather unavailable');
    const {current}=await response.json();
    if(!Number.isFinite(current?.temperature_2m))throw new Error('Missing temperature');
    const code=current.weather_code;
    const description=code===0?'ciel dégagé':code<3?'quelques nuages':code===3?'ciel couvert':code<50?'brouillard':code<60?'bruine':code<70?'pluie':code<80?'neige':code<85?'averses':code<90?'averses de neige':'orage';
    temperature.textContent=Math.round(current.temperature_2m)+'°C';
    document.querySelector('#pa-weather-description').textContent=description;
    document.querySelector('#pa-weather-icon').className='ph-thin ph-'+(code===0?(current.is_day?'sun':'moon'):code<4?'cloud':code<50?'cloud-fog':code<70?'cloud-rain':code<80?'cloud-snow':code<90?'cloud-rain':'cloud-lightning');
    temperature.closest('.rose-pa-weather').title='Londres · '+current.time.replace('T',' ')+' · Open-Meteo';
  }catch{
    temperature.textContent='—';document.querySelector('#pa-weather-description').textContent='météo indisponible';
  }
}
updatePaWeather();
async function initializeExchange(){
 const rateElement=document.querySelector('#exchange-rate');
 if(!rateElement)return;
 const gbp=document.querySelector('#exchange-gbp'),eur=document.querySelector('#exchange-eur'),chart=document.querySelector('#exchange-chart');
 const number=new Intl.NumberFormat('fr-FR',{maximumFractionDigits:4});
 let rate;
 async function getJson(url){const response=await fetch(url,{signal:AbortSignal.timeout(12000)});if(!response.ok)throw new Error('Exchange unavailable');return response.json()}
 async function history(days){
  chart.innerHTML='<p>Chargement de la courbe…</p>';
  const end=new Date(),start=new Date(end);start.setDate(start.getDate()-days);
  const iso=date=>date.toISOString().slice(0,10);
  try{
   const rows=await getJson('https://api.frankfurter.dev/v2/rates?base=GBP&quotes=EUR&from='+iso(start)+'&to='+iso(end));
   const points=rows.filter(row=>Number.isFinite(row.rate)).sort((a,b)=>a.date.localeCompare(b.date));
   if(points.length<2)throw new Error('Insufficient history');
   const width=480,height=195,left=52,right=14,top=12,bottom=30;
   const values=points.map(p=>p.rate),low=Math.min(...values),high=Math.max(...values),padding=Math.max((high-low)*.15,.0005),min=low-padding,max=high+padding;
   const first=new Date(points[0].date).getTime(),last=new Date(points.at(-1).date).getTime();
   const x=p=>left+(new Date(p.date).getTime()-first)/(last-first)*(width-left-right),y=p=>top+(max-p.rate)/(max-min)*(height-top-bottom);
   const line=points.map((p,i)=>(i?'L':'M')+x(p).toFixed(2)+','+y(p).toFixed(2)).join(' ');
   const accent=getComputedStyle(document.documentElement).getPropertyValue('--accent2').trim();
   const grid=Array.from({length:4},(_,i)=>{const value=min+(max-min)*i/3,gy=top+(max-value)/(max-min)*(height-top-bottom);return '<line x1="'+left+'" y1="'+gy+'" x2="'+(width-right)+'" y2="'+gy+'" stroke="#ffffff22"/><text x="0" y="'+(gy+4)+'">'+number.format(value)+'</text>'}).join('');
   const date=date=>new Date(date+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
   chart.innerHTML='<svg viewBox="0 0 480 195" aria-hidden="true">'+grid+'<path d="'+line+' L'+x(points.at(-1))+','+(height-bottom)+' L'+left+','+(height-bottom)+' Z" fill="'+accent+'" opacity=".1"/><path d="'+line+'" fill="none" stroke="'+accent+'" stroke-width="2"/><circle cx="'+x(points.at(-1))+'" cy="'+y(points.at(-1))+'" r="3" fill="'+accent+'"/><text x="'+left+'" y="190">'+date(points[0].date)+'</text><text x="466" y="190" text-anchor="end">'+date(points.at(-1).date)+'</text></svg>';
   chart.setAttribute('aria-label','Taux GBP vers EUR sur '+days+' jours : de '+number.format(points[0].rate)+' à '+number.format(points.at(-1).rate)+' euros pour une livre.');
  }catch{chart.innerHTML='<p>Historique indisponible pour le moment.</p>'}
 }
 try{
  const data=await getJson('https://api.frankfurter.dev/v2/rate/GBP/EUR');
  if(!Number.isFinite(data.rate))throw new Error('Missing rate');
  rate=data.rate;rateElement.textContent=number.format(rate)+' euros';
  document.querySelector('#exchange-date').textContent='Taux du '+new Date(data.date+'T12:00:00').toLocaleDateString('fr-FR');
  gbp.disabled=false;eur.disabled=false;eur.value=1000;gbp.value=(1000/rate).toFixed(4);
  gbp.addEventListener('input',()=>{eur.value=gbp.value===''?'':(Number(gbp.value)*rate).toFixed(4)});
  eur.addEventListener('input',()=>{gbp.value=eur.value===''?'':(Number(eur.value)/rate).toFixed(4)});
 }catch{rateElement.textContent='Taux indisponible';document.querySelector('#exchange-date').textContent='Réessayez en rechargeant la page.'}
 document.querySelectorAll('[data-fx-days]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-fx-days]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  history(Number(button.dataset.fxDays));
 }));
 await history(30);
}
initializeExchange();
 const showLegendGroup=name=>!['administrateurs','administrators'].includes(slug(name));
 function cleanLegends(){document.querySelectorAll('.group-legend').forEach(legend=>{
  const originalLinks=Array.from(legend.querySelectorAll('a'));
  const links=originalLinks.filter(link=>showLegendGroup(link.textContent));
  originalLinks.forEach(link=>{if(!showLegendGroup(link.textContent))link.remove()});
  if(legend.dataset.ready){if(originalLinks.length)legend.hidden=!links.length;return;}
  legend.dataset.ready='true';
  if(originalLinks.length){legend.replaceChildren(...links);legend.hidden=!links.length;return;}
  loadGroups().then(groups=>{
   const visibleGroups=groups.filter(group=>showLegendGroup(group.name));
   visibleGroups.forEach(group=>{const link=document.createElement('a');link.href=group.href;link.textContent=group.name;if(group.color)link.style.color=group.color;legend.append(link)});
   legend.hidden=!visibleGroups.length;
  }).catch(()=>{const link=document.createElement('a');link.href='/groups';link.textContent='Groupes';legend.append(link)});
 });}
 cleanLegends();
 document.addEventListener('cur-fragments-ready',cleanLegends);

 });
 if(window.ComingUpRoses?.register)register();
 else document.addEventListener('cur-core-ready',register,{once:true});
})();
