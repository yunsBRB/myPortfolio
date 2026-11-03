import{readdirSync,readFileSync,existsSync}from'node:fs';import{execFileSync}from'node:child_process';
for(const file of readdirSync('.').filter(f=>f.endsWith('.js')))execFileSync(process.execPath,['--check','./'+file],{stdio:'inherit'});
for(const file of['index.html','styles.css','vendor/three.module.js','vendor/three.core.js','vendor/SVGRenderer.js','vendor/Projector.js','assets/Younes-Berebia-CV.pdf'])if(!existsSync('./'+file))throw new Error('Missing file: '+file);
const html=readFileSync('index.html','utf8');for(const match of html.matchAll(/(?:src|href)="((?:assets|vendor)\/[^"#]+)"/g))if(!existsSync('./'+match[1]))throw new Error('Broken local asset: '+match[1]);
execFileSync(process.execPath,['--test',...readdirSync('tests').filter(f=>f.endsWith('.test.js')).map(f=>'tests/'+f)],{stdio:'inherit'});console.log('Source syntax, local assets and engine tests passed.');
