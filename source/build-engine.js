const fs=require('fs');
let src=fs.readFileSync(__dirname+'/src/engine.js','utf8');
src=src.replace("'__TERMS__'","'"+fs.readFileSync(__dirname+'/src/terms.txt','utf8')+"'").replace('__LUNAR__',fs.readFileSync(__dirname+'/src/lunar.json','utf8'));
fs.writeFileSync(__dirname+'/build/engine.built.js',src);
