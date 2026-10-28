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
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
const { OWNER_ID, storageKeys } = require('../src/repositories/cloud/CloudData.ts');
const { MemoryRecordStorage } = require('../src/repositories/RecordStorage.ts');
const { LocalNetworkContactRepository } = require('../src/repositories/LocalNetworkContactRepository.ts');
const { SupabaseNetworkContactRepository } = require('../src/repositories/cloud/SupabaseNetworkContactRepository.ts');
const { prepareCloudMigration } = require('../src/services/CloudMigrationService.ts');
const { validateCloudData } = require('../src/services/CloudValidation.ts');
const date = '2026-09-15T00:00:00Z';
const contact = { id: 'contact-current', userId: OWNER_ID, name: 'Example Contact', company: 'Example', role: null, email: null, profileUrl: null, notes: 'Keep\n\nthese paragraphs.', createdAt: date, updatedAt: date, applicationIds: ['application-1'] };
const app = { id: 'application-1', userId: OWNER_ID, company: 'Example', role: 'Engineer', appliedOn: '2026-09-15', location: null, link: null, referred: false, contactIds: ['contact-old', 'contact-current'], notes: null, resumeVersion: null, status: 'applied', nextActionOn: null, nextActionNote: null, timeline: [], completedSteps: [], createdAt: date, updatedAt: date };
const fixture = () => structuredClone({ cases: [], pei: [], applications: [app], network: [contact] });

const { Goal } = require('../src/domain/Goal.ts');
const { LocalGoalRepository } = require('../src/repositories/LocalGoalRepository.ts');
const { LocalPeiProgressRepository } = require('../src/repositories/LocalPeiProgressRepository.ts');
const { PeiImportService } = require('../src/services/PeiImportService.ts');
const { validateGoals, validateProgress } = require('../src/services/PreparationValidation.ts');
const seedStories = require('../seed/pei-stories.json');
const prepStorage = () => new MemoryRecordStorage({'bench:pei_stories':seedStories});

test('goal defaults persist once and count only solved cases by track', async()=>{
 const store=prepStorage(), repo=new LocalGoalRepository(store); const goals=await repo.list(OWNER_ID);
 assert.equal(goals.length,2); assert.equal(goals[0].target,15);
 assert.equal(goals[0].progress([{track:'consulting',myRole:'casee'},{track:'consulting',myRole:'caser'},{track:'tech',myRole:'casee'}],[]).current,1);
 for(const g of goals)await repo.remove(OWNER_ID,g.id);
 assert.deepEqual(await new LocalGoalRepository(store).list(OWNER_ID),[]);
 const custom=new Goal({id:'custom',userId:OWNER_ID,title:'Custom',kind:'custom',target:2,current:3,storyIds:[],deadline:'2020-01-01'});
 assert.equal(custom.progress([],[]).achieved,true);assert.equal(custom.progress([],[]).percent,100);
 await repo.save(OWNER_ID,custom);assert.equal((await repo.list(OWNER_ID))[0].current,3);
 assert.throws(()=>validateGoals([{...custom,target:0}]));assert.throws(()=>validateGoals([{...custom,deadline:'2026-02-30'}]));
});

test('practice date and creation time determine level; edits and baseline persist', async()=>{
 const store=prepStorage(),repo=new LocalPeiProgressRepository(store);const initial=(await repo.list(OWNER_ID))[0];assert.equal(initial.level,1);
 const entry=(id,on,level,createdAt)=>({id,occurredOn:on,level,createdAt,notes:'Keep\n\nparagraphs'});
 const row={...initial,practices:[entry('a','2026-09-14',4,'2026-09-15T10:00:00Z'),entry('b','2026-09-15',2,'2026-09-15T09:00:00Z'),entry('c','2026-09-15',5,'2026-09-15T11:00:00Z')]};
 await repo.save(OWNER_ID,row);assert.equal((await new LocalPeiProgressRepository(store).list(OWNER_ID))[0].level,5);
 assert.equal(new Goal({id:'pei',userId:OWNER_ID,title:'PEI',kind:'pei',target:5,current:0,storyIds:[row.id],deadline:null}).progress([], [row]).current,1);
 await repo.save(OWNER_ID,{...row,practices:row.practices.filter(p=>p.id!=='c')});assert.equal((await repo.list(OWNER_ID))[0].level,2);
 await repo.save(OWNER_ID,{...row,baseline:3,practices:[]});assert.equal((await repo.list(OWNER_ID))[0].level,3);
 assert.throws(()=>validateProgress([{...row,baseline:6}]));
});

test('PEI backup round trips practice, old backups preserve history, failed saves roll back', async()=>{
 const store=prepStorage(),repo=new LocalPeiProgressRepository(store);const row=(await repo.list(OWNER_ID))[0];
 row.practices=[{id:'practice',occurredOn:'2026-09-15',level:4,notes:'Original\n\nnotes',createdAt:date}];await repo.save(OWNER_ID,row);
 const records=seedStories.map(s=>({...s,...(s.id===row.id?{practiceProgress:row}:{})}));
 const file=new File([JSON.stringify({format:'bench-pei',version:1,records})],'pei.json');const parsed=await new PeiImportService().parseFile(file);
 assert.deepEqual(parsed.errors,[]);assert.equal(parsed.records.find(s=>s.id===row.id).practiceProgress.practices[0].notes,row.practices[0].notes);
 await repo.replaceStories(OWNER_ID,seedStories);assert.equal((await repo.list(OWNER_ID))[0].level,4);
 const before=store.getItem('bench:preparation'), original=store.setItem.bind(store);
 store.setItem=(key,value)=>{if(key==='bench:pei_stories')throw new Error('Quota');original(key,value);};
 await assert.rejects(()=>repo.replaceStories(OWNER_ID,seedStories,[{...row,baseline:5,practices:[]}]));assert.equal(store.getItem('bench:preparation'),before);
 store.setItem=()=>{throw new Error('Quota');};await assert.rejects(()=>repo.save(OWNER_ID,{...row,baseline:5}));assert.equal(store.getItem('bench:preparation'),before);
});

test('migration repairs only a unique saved application reference and preserves original backups', async () => {
  const input = fixture(), before = structuredClone(input);
  const result = await prepareCloudMigration(input);
  assert.deepEqual(input, before);
  assert.deepEqual(result.data.applications[0].contactIds, ['contact-current']);
  assert.deepEqual(result.data.network[0].sourceIds, ['contact-old']);
  assert.equal(result.data.network[0].notes, contact.notes);
  assert.equal(result.notices.length, 1);
  input.network.push({ ...contact, id: 'another-match' });
  await assert.rejects(() => prepareCloudMigration(input), /could not be matched/);
});

test('cloud validation rejects malformed data and scopes uploaded user IDs', async () => {
  const input = fixture(); input.network[0].userId = 'not-the-owner';
  assert.equal((await validateCloudData(input)).network[0].userId, OWNER_ID);
  input.network.push(input.network[0]);
  await assert.rejects(() => validateCloudData(input), /Duplicate/);
  await assert.rejects(() => validateCloudData({}), /Invalid/);
  const invalid = fixture(); invalid.applications[0].status = 'invented';
  await assert.rejects(() => validateCloudData(invalid), /Invalid status/);
});

test('isolated repositories retain follow-up history and atomically roll back relationships', async () => {
  const storage = new MemoryRecordStorage(Object.fromEntries(Object.entries(storageKeys).map(([key, value]) => [value, fixture()[key]])));
  const repo = new LocalNetworkContactRepository(storage);
  const saved = await repo.save(OWNER_ID, contact.id, { ...contact, nextFollowUpOn: '2026-09-25', nextFollowUpNote: 'Meeting' }, [app.id]);
  assert.equal(saved.followUpState('2026-09-24'), 'pending');
  assert.equal(saved.followUpState('2026-09-25'), 'due');
  assert.equal(saved.followUpState('2026-09-26'), 'overdue');
  const completed = await repo.completeFollowUp(contact.id, OWNER_ID, { expectedOn: '2026-09-25', expectedNote: 'Meeting', completedOn: '2026-09-24', notes: 'Went well', nextOn: null, nextNote: null });
  assert.equal(completed.completedFollowUps[0].notes, 'Went well');
  assert.equal(completed.nextFollowUpOn, null);
  const before = [storage.getItem(storageKeys.network), storage.getItem(storageKeys.applications)];
  const originalSet = storage.setItem.bind(storage); let fail = true;
  storage.setItem = (key, value) => { if (key === storageKeys.applications && fail) { fail = false; throw new Error('Quota'); } originalSet(key, value); };
  await assert.rejects(() => repo.save(OWNER_ID, contact.id, { ...completed, name: 'Should not save' }, []));
  assert.deepEqual([storage.getItem(storageKeys.network), storage.getItem(storageKeys.applications)], before);
});

test('cloud saves reject concurrent changes and never mutate browser backups', async () => {
  const originalFetch = global.fetch;
  let snapshot = { revision: 5, data: fixture() }, conflict = false;
  global.fetch = async (_url, options) => {
    if (options?.method !== 'PUT') return Response.json(snapshot);
    if (conflict) return Response.json({ error: 'Another device saved a change' }, { status: 409 });
    const value = JSON.parse(options.body);
    assert.equal(value.revision, snapshot.revision);
    snapshot = { ...value, revision: value.revision + 1 };
    return Response.json(snapshot);
  };
  try {
    const repo = new SupabaseNetworkContactRepository();
    const saved = await repo.save(OWNER_ID, contact.id, { ...contact, name: 'Saved in cloud' }, [app.id]);
    assert.equal(saved.name, 'Saved in cloud');
    assert.equal(contact.name, 'Example Contact');
    const before = structuredClone(snapshot); conflict = true;
    await assert.rejects(() => repo.save(OWNER_ID, contact.id, { ...contact, name: 'Stale draft' }, []), /Another device/);
    assert.deepEqual(snapshot, before);
  } finally { global.fetch = originalFetch; }
});

const { activeDestination, sidebarItems, networkTabs } = require('../src/components/nav/destinations.ts');
test('navigation selects only the deepest matching destination within each group',()=>{
 assert.equal(activeDestination('/network/coffee-chats',networkTabs),'/network/coffee-chats');
 assert.equal(activeDestination('/network/coffee-chats',sidebarItems),'/network/coffee-chats');
 assert.equal(activeDestination('/network/some-id/edit',networkTabs),'/network');
});
test('phone survives backup validation and deleting a contact removes only its relationships',async()=>{
 const { JsonBackupService }=require('../src/services/JsonBackupService.ts');
 const data=fixture();data.network[0].phone='+1 (212) 555-0100';
 const file=new File([JSON.stringify({format:'bench-network',version:1,records:data.network})],'network.json');
 const parsed=await JsonBackupService.parse(file,'bench-network',OWNER_ID);assert.deepEqual(parsed.errors,[]);assert.equal(parsed.records[0].phone,data.network[0].phone);
 const storage=new MemoryRecordStorage({[storageKeys.network]:data.network,[storageKeys.applications]:data.applications});
 const repo=new LocalNetworkContactRepository(storage);await repo.delete(contact.id,OWNER_ID);
 assert.equal((await repo.list(OWNER_ID)).length,0);const apps=JSON.parse(storage.getItem(storageKeys.applications));assert.equal(apps.length,1);assert.equal(apps[0].company,app.company);assert.ok(!apps[0].contactIds.includes(contact.id));
});

test('bulk deletion is scoped, atomic, and removes contact links without deleting applications',async()=>{
 const { LocalApplicationRepository }=require('../src/repositories/LocalApplicationRepository.ts');
 const { LocalCaseSessionRepository }=require('../src/repositories/LocalCaseSessionRepository.ts');
 const contacts=[{...contact,id:'c1'},{...contact,id:'c2'},{...contact,id:'keep'},{...contact,id:'foreign',userId:'other'}];
 const applications=[{...app,id:'a1',contactIds:['c1','c2','keep']},{...app,id:'a2',contactIds:['c1']},{...app,id:'foreign',userId:'other',contactIds:['c1']}];
 const storage=new MemoryRecordStorage({[storageKeys.network]:contacts,[storageKeys.applications]:applications,[storageKeys.cases]:[{id:'s1',userId:OWNER_ID},{id:'s2',userId:OWNER_ID},{id:'foreign',userId:'other'}]});
 const network=new LocalNetworkContactRepository(storage);
 await assert.rejects(()=>network.deleteMany(OWNER_ID,['c1','foreign']));assert.equal(JSON.parse(storage.getItem(storageKeys.network)).length,4);
 const before=[storage.getItem(storageKeys.network),storage.getItem(storageKeys.applications)];const original=storage.setItem.bind(storage);let fail=true;
 storage.setItem=(key,value)=>{if(key===storageKeys.applications&&fail){fail=false;throw Error('Quota');}original(key,value);};
 await assert.rejects(()=>network.deleteMany(OWNER_ID,['c1','c2']));assert.deepEqual([storage.getItem(storageKeys.network),storage.getItem(storageKeys.applications)],before);
 storage.setItem=original;await network.deleteMany(OWNER_ID,['c1','c2']);
 const remaining=JSON.parse(storage.getItem(storageKeys.applications));assert.equal(remaining.length,3);assert.deepEqual(remaining[0].contactIds,['keep']);assert.deepEqual(remaining[2].contactIds,['c1']);
 const apps=new LocalApplicationRepository(storage);await apps.deleteMany(OWNER_ID,['a1','a2']);assert.deepEqual(JSON.parse(storage.getItem(storageKeys.applications)).map(a=>a.id),['foreign']);assert.equal(JSON.parse(storage.getItem(storageKeys.network)).length,2);
 const cases=new LocalCaseSessionRepository(storage);await assert.rejects(()=>cases.deleteMany(OWNER_ID,['s1','foreign']));await cases.deleteMany(OWNER_ID,['s1','s2']);assert.deepEqual(JSON.parse(storage.getItem(storageKeys.cases)).map(s=>s.id),['foreign']);
});

test('cloud bulk deletion sends one revision-checked write and rejects conflicts without partial deletion',async()=>{
 const { SupabaseApplicationRepository }=require('../src/repositories/cloud/SupabaseApplicationRepository.ts');
 const original=global.fetch;let snapshot={revision:1,data:{...fixture(),applications:[{...app,id:'a1'},{...app,id:'a2'},{...app,id:'keep'}]}},writes=0,conflict=true;
 global.fetch=async(_url,options)=>{if(options?.method!=='PUT')return Response.json(snapshot);writes++;if(conflict)return Response.json({error:'Conflict'},{status:409});const next=JSON.parse(options.body);assert.equal(next.revision,snapshot.revision);snapshot={...next,revision:next.revision+1};return Response.json(snapshot);};
 try{const repo=new SupabaseApplicationRepository();await assert.rejects(()=>repo.deleteMany(OWNER_ID,['a1','a2']),/Conflict/);assert.equal(snapshot.data.applications.length,3);assert.equal(writes,1);conflict=false;await repo.deleteMany(OWNER_ID,['a1','a2']);assert.equal(writes,2);assert.deepEqual(snapshot.data.applications.map(a=>a.id),['keep']);}finally{global.fetch=original;}
});
