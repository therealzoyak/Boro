import {useState} from 'react';

export type ConditionPhoto={id:string,stage:'before'|'after',by:string,at:string,image:string};

export async function preparePhoto(file:File):Promise<string>{
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPG, PNG, or WebP photo.');
  if(file.size>20*1024*1024)throw new Error('Choose a photo smaller than 20 MB.');
  const objectUrl=URL.createObjectURL(file);
  try{
    const photo=new Image();
    await new Promise<void>((resolve,reject)=>{photo.onload=()=>resolve();photo.onerror=()=>reject(new Error('This photo could not be opened.'));photo.src=objectUrl});
    const canvas=document.createElement('canvas');
    const context=canvas.getContext('2d');
    if(!context)throw new Error('Photo processing is unavailable in this browser.');
    let longest=1200;
    for(const quality of [0.78,0.66,0.54,0.46]){
      const scale=Math.min(1,longest/Math.max(photo.naturalWidth,photo.naturalHeight));
      canvas.width=Math.max(1,Math.round(photo.naturalWidth*scale));
      canvas.height=Math.max(1,Math.round(photo.naturalHeight*scale));
      context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);
      context.drawImage(photo,0,0,canvas.width,canvas.height);
      const result=canvas.toDataURL('image/jpeg',quality);
      if(result.length<220000)return result;
      longest*=0.8;
    }
    throw new Error('This photo is too detailed for browser demo storage. Try a smaller image.');
  }finally{URL.revokeObjectURL(objectUrl)}
}

export function ListingPhotoPicker({images,onChange}:{images:string[],onChange:(images:string[])=>void}){
  const[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function add(files:FileList|null){if(!files?.length)return;setBusy(true);setError('');try{
    const added:string[]=[];
    for(const file of Array.from(files).slice(0,3-images.length))added.push(await preparePhoto(file));
    onChange([...images,...added]);
  }catch(e){setError(e instanceof Error?e.message:'Could not add photo.')}finally{setBusy(false)}}
  return <div className="photoUpload wide"><b>Listing photos</b><p>Add up to three real photos of your item or service. The first photo is the cover.</p><div className="uploadThumbs">{images.map((src,i)=><div className="uploadThumb" key={i}><img src={src} alt={`Listing upload ${i+1}`}/><button type="button" aria-label={`Remove photo ${i+1}`} onClick={()=>onChange(images.filter((_,j)=>j!==i))}>×</button></div>)}{images.length<3&&<label className="uploadTile">{busy?'Preparing…':'+ Add photos'}<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={e=>{void add(e.target.files);e.target.value=''}}/></label>}</div>{error&&<small className="uploadError">{error}</small>}</div>
}

export function ConditionEvidence({photos=[],account,name,canBefore,canAfter,onUpload}:{photos?:ConditionPhoto[],account:string,name:(id:string)=>string,canBefore:boolean,canAfter:boolean,onUpload:(stage:'before'|'after',image:string)=>void}){
  const[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function add(stage:'before'|'after',file:File|undefined){if(!file)return;setBusy(true);setError('');try{onUpload(stage,await preparePhoto(file))}catch(e){setError(e instanceof Error?e.message:'Could not add photo.')}finally{setBusy(false)}}
  return <section className="conditionEvidence"><h4>Item condition photos</h4><p>Document the item at pickup and return. Each person can add or replace one photo per step in this browser demo.</p><div className="conditionStages">{(['before','after'] as const).map(stage=><div className="conditionStage" key={stage}><div className="conditionStageHead"><b>{stage==='before'?'Before pickup':'After return'}</b>{(stage==='before'?canBefore:canAfter)&&<label className="conditionUpload">{photos.some(p=>p.stage===stage&&p.by===account)?'Replace my photo':`+ Upload ${stage} photo`}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{void add(stage,e.target.files?.[0]);e.target.value=''}}/></label>}</div><div className="evidenceThumbs">{photos.filter(p=>p.stage===stage).map(p=><figure key={p.id}><img src={p.image} alt={`${stage} condition uploaded by ${name(p.by)}`}/><figcaption>{name(p.by)} · {new Date(p.at).toLocaleString()}</figcaption></figure>)}{!photos.some(p=>p.stage===stage)&&<small>No photo yet</small>}</div></div>)}</div>{error&&<small className="uploadError">{error}</small>}</section>
}
