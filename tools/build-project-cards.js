const {readFileSync,writeFileSync}=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const output=process.argv[2]?path.resolve(process.argv[2]):root;
const host='https://subtlesayak.github.io';
const read=file=>readFileSync(path.join(root,file),'utf8');
const lines=text=>text.split(/\r?\n/).map(line=>line.trim()).filter(line=>line&&!line.startsWith('#'));
const optional=file=>{
    try {return read(file);} catch (error) {if(error.code==='ENOENT')return '';throw error;}
};
const variants=JSON.parse(read('Config/project-image-layouts.json')).cards;
const thumbnail=source=>{
    const url=new URL(source,host);
    return url.origin===host?variants[decodeURIComponent(url.pathname)]||source:source;
};

function inferLabel(categories){
    if(categories.includes('uiux'))return 'Case Study';
    if(categories.includes('branding'))return 'Brand Study';
    if(categories.includes('web'))return 'Web Experiment';
    if(categories.includes('visual-design'))return 'Visual Study';
    return 'Project';
}

function fallbackContext(description){
    const clean=description.replace(/https?:\/\/\S+/gi,'').replace(/View the full case study here:?/gi,'').replace(/\s+/g,' ').trim();
    const context=(clean.match(/^.*?[.!?](?:\s|$)/)?.[0]||clean).trim();
    return context.length>140?`${context.slice(0,137).trimEnd()}...`:context;
}

const names=lines(read('Config/projects.txt'));
const selected=[...new Set(lines(optional('Config/selected-work.txt')).filter(name=>names.includes(name)))];
const order=[...selected,...names.filter(name=>!selected.includes(name))];
const projects=order.map((name,index)=>{
    const folder=`Projects/${name}`;
    const [title,description,,image,file]=read(`${folder}/description.txt`).split('---').map(part=>part.trim());
    const media=lines(read(`${folder}/media.txt`));
    const [label,...context]=lines(optional(`${folder}/card.txt`));
    const categories=lines(optional(`${folder}/categories.txt`));
    return {
        src:thumbnail(image), alt:title,
        label:label||inferLabel(categories), context:context.join(' ')||fallbackContext(description),
        galleryPageUrl:`/Projects/${encodeURIComponent(name)}/${encodeURIComponent(file)}`,
        hasMultipleImages:media.filter(line=>/\.(?:avif|gif|jpe?g|png|webp)\*?$/i.test(line)).length>1,
        hasVideo:media.some(line=>/\.mp4$/i.test(line)),
        hasYouTube:media.some(line=>line.includes('youtube.com')),
        hasSketchfab:media.some(line=>line.includes('sketchfab.com')),
        featured:selected.length?selected.includes(name):index<3,
    };
});
const fields=optional('Config/client-websites.txt').split('---').map(part=>part.trim());
const websites=[];
for(let offset=0;offset<fields.length;offset+=6){
    const [title,kind,summary,liveUrl,image,tags]=fields.slice(offset,offset+6);
    if(title&&liveUrl)websites.push({title,kind:kind||'Client Website',summary,liveUrl,thumbnail:thumbnail(image),tags});
}
writeFileSync(path.join(output,'Config/portfolio-cards.json'),JSON.stringify({projects,websites})+'\n');
