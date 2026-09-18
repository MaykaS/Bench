/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS loader tests TypeScript repositories without adding a test runtime dependency. */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const resolveOriginal = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) {
  return resolveOriginal.call(this, id.startsWith('@/') ? path.join(__dirname, '../src', id.slice(2)) : id, ...args);
};
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { esModuleInterop: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
const ExcelJS = require('exceljs');
const { CaseSession } = require('../src/domain/CaseSession.ts');
const { CaseImportService } = require('../src/services/CaseImportService.ts');
const { CaseExportService } = require('../src/services/CaseExportService.ts');
const { MemoryRecordStorage } = require('../src/repositories/RecordStorage.ts');
const { LocalCaseSessionRepository } = require('../src/repositories/LocalCaseSessionRepository.ts');
const { SupabaseCaseSessionRepository } = require('../src/repositories/cloud/SupabaseCaseSessionRepository.ts');
const { CaseStatsService } = require('../src/services/CaseStatsService.ts');
const { getCaseRubric } = require('../src/domain/rubrics/index.ts');
const { Goal } = require('../src/domain/Goal.ts');
const user = '00000000-0000-0000-0000-000000000001';
const row = (overrides={}) => new CaseSession({ id:'case-1',userId:user,sessionNumber:1,caseName:'Example case',caserName:'Partner',caseeName:'Candidate',observerName:null,occurredOn:'2026-09-18',durationMin:35,difficulty:2,caseBook:'Book',overall:4,industry:'Software',scores:{structure:3,math:4,coaching:5,businessAcumen:2,conclusion:3,creativity:4},caseType:'Growth',track:'consulting',myRole:'casee',notes:'  Keep paragraphs.\n\nAnd spacing.  ',createdAt:'2026-09-18T10:30:00.000Z',...overrides });
const parse = (buffer,track='consulting') => new CaseImportService().parseFile(new File([buffer],'cases.xlsx'),track);
const build = (rows,track='consulting') => new CaseExportService().buildWorkbookBuffer(rows,track);
async function editWorkbook(buffer,change){const w=new ExcelJS.Workbook();await w.xlsx.load(buffer);change(w.worksheets[0]);return w.xlsx.writeBuffer();}

test('Excel round trips both tracks including scores, IDs, notes, dates and long durations',async()=>{
 for(const track of ['consulting','tech']) {
  const records=[row({track}),row({id:'observer',sessionNumber:8,track,myRole:'observer',overall:null,scores:null,durationMin:0}),row({id:'long',sessionNumber:12,track,durationMin:1500}),row({id:'unscored',sessionNumber:14,track,overall:null,scores:null,durationMin:90})];
  const result=await parse(await build(records,track),track);assert.deepEqual(result.errors,[]);assert.deepEqual(result.warnings,[]);assert.deepEqual(result.records,records.map(r=>({...r})));
  const empty=await parse(await build([],track),track);assert.deepEqual(empty.errors,[]);assert.deepEqual(empty.records,[]);
 }
});

test('legacy tracker retains headers, infers roles and assigns stable track IDs',async()=>{
 const buffer=await editWorkbook(await build([row()]),s=>{for(let col=19;col<=23;col++){s.getColumn(col).eachCell(c=>{c.value=null;});}s.name='Sheet1';});
 const first=await parse(buffer,'tech'),second=await parse(buffer,'tech');assert.deepEqual(first.errors,[]);assert.equal(first.warnings.length,1);assert.equal(first.records[0].track,'tech');assert.equal(first.records[0].myRole,'casee');assert.equal(first.records[0].id,second.records[0].id);
});

test('Excel preview rejects invalid fields, missing names/numbers, mismatched track, duplicate IDs and malformed files',async()=>{
 const buffer=await build([row(),row({id:'two',sessionNumber:2})]);
 for(const [column,value] of [[1,null],[2,null],[6,'2026-02-30'],[7,'bad'],[8,6],[10,8],[12,'bad'],[20,'invalid'],[21,'tech'],[22,'two'],[23,'invalid']]) {
  const parsed=await parse(await editWorkbook(buffer,s=>{s.getCell(3,column).value=value;}));assert.ok(parsed.errors.length,`column ${column}`);
 }
 assert.ok((await parse(await build([],'tech'))).errors.length);
 assert.ok((await parse(Buffer.from('bad file'))).errors.length);
 assert.ok((await new CaseImportService().parseFile(new File(['{}'],'cases.json'),'tech')).errors.length);
});

test('track replacement preserves the other track and other users; rejects conflicts and rolls back failed writes',async()=>{
 const consulting=row(),otherUser=row({userId:'other'}),tech=row({id:'tech',sessionNumber:2,track:'tech'});
 const store=new MemoryRecordStorage({'bench:case_sessions':[consulting,otherUser]});const repo=new LocalCaseSessionRepository(store);
 await repo.replaceTrack(user,'tech',[tech]);assert.equal((await repo.list(user)).length,2);assert.equal((await repo.list('other')).length,1);
 for(const invalid of [{...tech,id:consulting.id},{...tech,sessionNumber:1},{...tech,track:'consulting'}])await assert.rejects(()=>repo.replaceTrack(user,'tech',[invalid]));
 const before=store.getItem('bench:case_sessions');store.setItem=()=>{throw Error('Quota');};await assert.rejects(()=>repo.replaceTrack(user,'tech',[]));assert.equal(store.getItem('bench:case_sessions'),before);
});

test('Tech create/edit/delete persists and drives its own statistics and goals',async()=>{
 const store=new MemoryRecordStorage({'bench:case_sessions':[row()]});const repo=new LocalCaseSessionRepository(store);
 assert.equal((await repo.list(user)).filter(r=>r.track==='tech').length,0);
 const saved=await repo.create(user,{...row(),track:'tech'});assert.equal(saved.sessionNumber,2);
 await repo.update(saved.id,user,{notes:'Updated',overall:5});const tech=(await new LocalCaseSessionRepository(store).list(user)).filter(r=>r.track==='tech');
 assert.equal(tech[0].notes,'Updated');assert.equal(new CaseStatsService().summarize(tech,getCaseRubric('tech')).averageOverall,5);
 const goal=new Goal({id:'goal',userId:user,title:'Tech',kind:'tech',target:5,current:0,storyIds:[],deadline:null});
 assert.equal(goal.progress(await repo.list(user),[]).current,1);
 await repo.delete(saved.id,user);assert.equal((await repo.list(user)).length,1);
});

test('cloud track replacement is atomic and preserves unrelated records on revision conflict',async()=>{
 const original=global.fetch;let snapshot={revision:1,data:{cases:[row()],pei:[],applications:[],network:[],preparation:[]}},conflict=false;
 global.fetch=async(_url,options)=>{if(options?.method!=='PUT')return Response.json(snapshot);if(conflict)return Response.json({error:'Conflict; retry'},{status:409});const data=JSON.parse(options.body);assert.equal(data.revision,snapshot.revision);snapshot={...data,revision:data.revision+1};return Response.json(snapshot);};
 try{const repo=new SupabaseCaseSessionRepository();await repo.replaceTrack(user,'tech',[row({track:'tech',id:'tech',sessionNumber:2})]);assert.equal(snapshot.data.cases.length,2);const before=structuredClone(snapshot);conflict=true;await assert.rejects(()=>repo.replaceTrack(user,'tech',[]),/Conflict/);assert.deepEqual(snapshot,before);}finally{global.fetch=original;}
});

