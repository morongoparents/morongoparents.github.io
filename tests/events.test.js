const assert=require('node:assert/strict');
const {normalize,partition,state,localClock,validDate}=require('../events.js');
const fixture={timezone:'America/Los_Angeles',events:[
 {id:'a',date:'2026-10-13',startTime:'18:00',endTime:'20:00',title:'Board',category:'board',status:'confirmed'},
 {id:'b',date:'2026-10-19',startTime:'',endTime:'',title:'Deadline',category:'deadline',status:'confirmed'},
 {id:'c',date:'2026-10-27',startTime:'',endTime:'',title:'Study',category:'board',status:'tentative'},
 {id:'d',date:'2026-11-03',startTime:'07:00',endTime:'20:00',title:'Election',category:'election',status:'confirmed'},
 {id:'e',date:'2026-11-05',startTime:'',endTime:'',title:'Cancelled',category:'other',status:'canceled'}
]};
const events=normalize(fixture);
assert.deepEqual(localClock(new Date('2026-10-19T06:59:00Z')),{date:'2026-10-18',time:'23:59'});
assert.deepEqual(localClock(new Date('2026-11-03T08:10:00Z')),{date:'2026-11-03',time:'00:10'});
assert.equal(state(events[0],{date:'2026-10-13',time:'18:01'}),'live');
assert.equal(state(events[0],{date:'2026-10-13',time:'20:00'}),'past');
assert.equal(state(events[1],{date:'2026-10-19',time:'23:59'}),'today');
assert.equal(state(events[1],{date:'2026-10-20',time:'00:00'}),'past');
let parts=partition(events,{date:'2026-10-15',time:'12:00'});
assert.deepEqual(parts.future.map(x=>x.id),['b','c','d']);
assert.deepEqual(parts.archive.map(x=>x.id),['e','a']);
parts=partition(events,{date:'2026-10-28',time:'12:00'});
assert.deepEqual(parts.future.map(x=>x.id),['d']);
assert.ok(validDate('2026-10-19'));
assert.ok(!validDate('2026-02-30'));
assert.throws(()=>normalize({...fixture,events:[events[0],events[0]]}),/duplicate/);
assert.throws(()=>normalize({...fixture,events:[{...events[0],endTime:'10:00'}]}),/End time/);
console.log('12 calendar lifecycle / validation assertions passed.');
