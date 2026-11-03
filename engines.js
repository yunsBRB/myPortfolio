export function moveBoard(board,direction){
 if(!['left','right','up','down'].includes(direction))throw new Error('Invalid direction');
 const next=board.map(r=>r.slice());let score=0;
 for(let i=0;i<4;i++){
  const coordinates=Array.from({length:4},(_,j)=>direction==='left'?[i,j]:direction==='right'?[i,3-j]:direction==='up'?[j,i]:[3-j,i]);
  const values=coordinates.map(([r,c])=>board[r][c]).filter(Boolean);const collapsed=[];
  for(let j=0;j<values.length;j++){if(values[j]===values[j+1]){collapsed.push(values[j]*2);score+=values[j]*2;j++;}else collapsed.push(values[j]);}
  while(collapsed.length<4)collapsed.push(0);coordinates.forEach(([r,c],j)=>next[r][c]=collapsed[j]);
 }
 return{board:next,score,changed:next.some((row,r)=>row.some((v,c)=>v!==board[r][c]))};
}
export function addTile(board,random=Math.random){const next=board.map(r=>r.slice());const empty=[];next.forEach((row,r)=>row.forEach((v,c)=>{if(!v)empty.push([r,c]);}));if(!empty.length)return next;const[r,c]=empty[Math.min(empty.length-1,Math.floor(random()*empty.length))];next[r][c]=random()<.9?2:4;return next;}
export function freshBoard(random=Math.random){return addTile(addTile(Array.from({length:4},()=>[0,0,0,0]),random),random);}
export function isGameOver(board){if(board.some(r=>r.includes(0)))return false;return!['left','right','up','down'].some(d=>moveBoard(board,d).changed);}
export function analyzeLogins(records,{threshold=5,windowMinutes=5}={}){
 if(!Number.isInteger(threshold)||threshold<2||windowMinutes<=0)throw new Error('Invalid detection settings');
 const sorted=records.map((r,i)=>{const time=Date.parse(r.timestamp);if(!Number.isFinite(time)||!['success','failure'].includes(r.status)||!r.ip||!r.username)throw new Error(`Invalid login record at row ${i+1}`);return{...r,time,index:i};}).sort((a,b)=>a.time-b.time||a.index-b.index);
 const groups=new Map();const alerts=[];const duration=windowMinutes*60000;
 for(const record of sorted){const key=JSON.stringify([record.ip,record.username]);let failures=(groups.get(key)||[]).filter(t=>record.time-t<=duration);if(record.status==='failure'){failures.push(record.time);if(failures.length===threshold)alerts.push({type:'failure-burst',ip:record.ip,username:record.username,timestamp:record.timestamp,failures:failures.length,message:`${failures.length} failed attempts within ${windowMinutes} minutes`});}else{if(failures.length>=threshold)alerts.push({type:'success-after-failures',ip:record.ip,username:record.username,timestamp:record.timestamp,failures:failures.length,message:'Successful login after repeated failures — review this activity'});failures=[];}groups.set(key,failures);}
 return{total:records.length,failures:records.filter(r=>r.status==='failure').length,alerts};
}
export function sampleLogins(kind='burst'){
 const time=i=>new Date(Date.UTC(2026,0,1,9,0,0)+i*60000).toISOString();
 if(kind==='quiet')return[{timestamp:time(0),ip:'192.0.2.10',username:'demo',status:'success'},{timestamp:time(3),ip:'192.0.2.11',username:'alex',status:'failure'},{timestamp:time(4),ip:'192.0.2.11',username:'alex',status:'success'},{timestamp:time(8),ip:'192.0.2.12',username:'sam',status:'success'}];
 return[{timestamp:time(0),ip:'192.0.2.10',username:'demo',status:'success'},...Array.from({length:5},(_,i)=>({timestamp:time(i+1),ip:'192.0.2.42',username:'alex',status:'failure'})),{timestamp:time(5.5),ip:'192.0.2.42',username:'alex',status:'success'},{timestamp:time(8),ip:'192.0.2.12',username:'sam',status:'success'}];
}
