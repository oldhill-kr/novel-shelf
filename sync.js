import {firebaseConfig as cfg} from './firebase-config.js';
if(cfg.apiKey){
const V='10.12.2',B='https://www.gstatic.com/firebasejs/'+V+'/';
const [{initializeApp},A,F]=await Promise.all([import(B+'firebase-app.js'),import(B+'firebase-auth.js'),import(B+'firebase-firestore.js')]);
const app=initializeApp(cfg),auth=A.getAuth(app),db=F.getFirestore(app);
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lsg=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
const lss=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let user=null;

/* ---------- 읽기 기록 동기화 ---------- */
const ids=()=>(window.DATA||DATA).map(n=>n.id);
function localState(){
  const pos={},read={};
  ids().forEach(id=>{const p=lsg('pos-'+id,null);if(p&&typeof p.idx==='number')pos[id]={idx:p.idx,y:p.y||0,t:p.t||0};const r=lsg('read-'+id,[]);if(r.length)read[id]=r});
  return {pos,read};
}
async function pull(){
  if(!user)return false;
  const snap=await F.getDoc(F.doc(db,'users',user.uid));
  const d=snap.exists()?snap.data():{};
  let changed=false;
  ids().forEach(id=>{
    const rp=d.pos&&d.pos[id],lp=lsg('pos-'+id,null);
    if(rp&&(!lp||(rp.t||0)>(lp.t||0))){lss('pos-'+id,rp);changed=true}
    const rr=d.read&&d.read[id];
    if(rr){const u=[...new Set([...lsg('read-'+id,[]),...rr])].sort((a,b)=>a-b);if(u.length!==lsg('read-'+id,[]).length){lss('read-'+id,u);changed=true}}
  });
  return changed;
}
let pt=null;
const stat=(ok,m)=>{const b=$('#abtn');if(b)b.title=ok?'동기화됨':'동기화 실패: '+m;const s=$('#astat');if(s){s.textContent=ok?'✓ 동기화':'⚠ 동기화 실패: '+m;s.style.color=ok?'var(--muted)':'#D35'}};
async function push(){
  if(!user)return;
  try{await F.setDoc(F.doc(db,'users',user.uid),localState(),{merge:true});stat(true)}catch(e){console.warn('sync push',e);stat(false,e.code||e.message)}
}
window.__sync={push(){clearTimeout(pt);pt=setTimeout(push,1500)}};
async function syncAll(){
  try{
    const ch=await pull();await push();
    if(ch&&cur.view!=='reader')render();
  }catch(e){console.warn('sync',e);stat(false,e.code||e.message)}
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&user&&cur.view!=='reader')syncAll()});

/* ---------- 로그인 UI ---------- */
document.body.insertAdjacentHTML('beforeend',`
<div id="authbar"><span id="astat"></span><button type="button" id="abtn"></button></div>
<div id="amodal" hidden><div class="box" role="dialog" aria-modal="true" aria-labelledby="atitle">
  <button type="button" class="x" id="aclose" aria-label="닫기">×</button>
  <h2 id="atitle">로그인</h2>
  <div class="tabs"><button type="button" id="tin" aria-pressed="true">로그인</button><button type="button" id="tup" aria-pressed="false">회원가입</button></div>
  <form id="aform">
    <label id="nickrow" hidden>닉네임<input id="anick" maxlength="20" autocomplete="nickname"></label>
    <label>이메일<input id="aemail" type="email" required autocomplete="email"></label>
    <label>비밀번호<input id="apw" type="password" minlength="6" required autocomplete="current-password"></label>
    <p id="aerr" role="alert"></p>
    <button class="cta" type="submit" id="asubmit">로그인</button>
  </form>
  <button type="button" class="cta ghost" id="agoogle">구글로 계속하기</button>
</div></div>`);
const css=document.createElement('style');css.textContent=`
#authbar{position:fixed;top:10px;right:12px;z-index:30;display:flex;align-items:center;gap:8px}
#astat{font-size:12px}
#authbar button{background:var(--surface);border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-size:13px}
#amodal{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.55);display:grid;place-items:center;padding:16px}
#amodal[hidden]{display:none}
#amodal .box{position:relative;background:var(--surface);color:var(--fg);border:1px solid var(--line);border-radius:14px;padding:24px;width:min(380px,100%);display:flex;flex-direction:column;gap:12px}
#amodal h2{margin:0;font:700 20px var(--f-display)}
#amodal .x{position:absolute;top:8px;right:12px;font-size:24px;color:var(--muted)}
#amodal .tabs{display:flex;gap:6px}
#amodal .tabs button{flex:1;padding:8px;border:1px solid var(--line);border-radius:8px;color:var(--muted)}
#amodal .tabs button[aria-pressed=true]{color:var(--fg);border-color:var(--nv-a);font-weight:700}
#amodal form{display:flex;flex-direction:column;gap:10px}
#amodal label{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--muted)}
#amodal input{font:inherit;color:var(--fg);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:9px 10px}
#aerr{margin:0;color:#D35;font-size:13px;min-height:1em}
#amodal .cta{justify-content:center;background:var(--nv-a);color:var(--bg)}
#amodal .cta.ghost{background:none;color:var(--nv-a);border:1px solid var(--nv-a)}
#cmt{margin-top:36px;padding-top:20px;border-top:1px solid var(--line)}
#cmt h2{font:700 18px var(--f-display);margin:0 0 12px}
#cmt textarea{width:100%;min-height:76px;font:inherit;color:var(--fg);background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:10px;resize:vertical}
#cmt .row{display:flex;justify-content:space-between;align-items:center;margin:8px 0 18px;color:var(--muted);font-size:13px}
#cmt .row button,#cmt .login{background:var(--nv);color:var(--bg);font-weight:700;padding:8px 16px;border-radius:8px}
#cmt ul{list-style:none;margin:0;padding:0}
#cmt li{padding:12px 0;border-top:1px solid var(--line)}
#cmt .meta{font-size:12px;color:var(--muted);display:flex;gap:10px}
#cmt .meta b{color:var(--fg)}
#cmt .meta .del{margin-left:auto;color:var(--muted);text-decoration:underline;font-size:12px}
#cmt p{margin:4px 0 0;white-space:pre-wrap;overflow-wrap:anywhere}
`;document.head.appendChild(css);

let mode='in';
const setMode=m=>{mode=m;$('#tin').setAttribute('aria-pressed',m==='in');$('#tup').setAttribute('aria-pressed',m==='up');$('#nickrow').hidden=m!=='up';$('#atitle').textContent=m==='in'?'로그인':'회원가입';$('#asubmit').textContent=m==='in'?'로그인':'가입하기';$('#apw').autocomplete=m==='in'?'current-password':'new-password';$('#aerr').textContent=''};
const openM=()=>{setMode('in');$('#amodal').hidden=false;$('#aemail').focus()};
const closeM=()=>{$('#amodal').hidden=true};
$('#tin').onclick=()=>setMode('in');$('#tup').onclick=()=>setMode('up');
$('#aclose').onclick=closeM;
$('#amodal').addEventListener('click',e=>{if(e.target.id==='amodal')closeM()});
const EM={'auth/invalid-email':'이메일 형식이 올바르지 않습니다.','auth/invalid-credential':'이메일 또는 비밀번호가 틀렸습니다.','auth/wrong-password':'이메일 또는 비밀번호가 틀렸습니다.','auth/user-not-found':'이메일 또는 비밀번호가 틀렸습니다.','auth/email-already-in-use':'이미 가입된 이메일입니다.','auth/weak-password':'비밀번호는 6자 이상이어야 합니다.','auth/popup-closed-by-user':'','auth/too-many-requests':'시도가 너무 많습니다. 잠시 후 다시 시도하세요.'};
const showErr=e=>{$('#aerr').textContent=EM[e.code]!==undefined?EM[e.code]:'오류: '+(e.code||e.message)};
$('#aform').addEventListener('submit',async ev=>{
  ev.preventDefault();$('#aerr').textContent='';
  const em=$('#aemail').value.trim(),pw=$('#apw').value;
  try{
    if(mode==='in')await A.signInWithEmailAndPassword(auth,em,pw);
    else{
      const c=await A.createUserWithEmailAndPassword(auth,em,pw);
      const nick=$('#anick').value.trim()||em.split('@')[0];
      await A.updateProfile(c.user,{displayName:nick.slice(0,20)});
      user=auth.currentUser;
    }
    closeM();
  }catch(e){showErr(e)}
});
$('#agoogle').onclick=async()=>{
  try{await A.signInWithPopup(auth,new A.GoogleAuthProvider());closeM()}catch(e){showErr(e)}
};
$('#abtn').onclick=()=>{if(user){if(confirm('로그아웃할까요?'))A.signOut(auth)}else openM()};
const nameOf=u=>u.displayName||(u.email||'독자').split('@')[0];
const setBtn=()=>{$('#abtn').textContent=user?nameOf(user)+' · 로그아웃':'로그인 / 가입'};

/* ---------- 작품별 댓글 ---------- */
const fmt=ts=>{if(!ts)return'방금';const d=ts.toDate();return d.getFullYear()+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+String(d.getDate()).padStart(2,'0')+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
async function mountComments(){
  if(cur.view!=='novel')return;
  const nid=cur.nid;
  let box=$('#cmt');
  if(!box){box=document.createElement('section');box.id='cmt';$('#novel .wrap,#novel').appendChild(box)}
  box.innerHTML='<h2>댓글</h2><div id="cform"></div><ul id="clist"><li>불러오는 중…</li></ul>';
  $('#cform').innerHTML=user
    ?'<textarea id="ctext" maxlength="500" placeholder="이 작품에 대한 감상을 남겨 보세요 (500자)"></textarea><div class="row"><span id="ccount">0 / 500</span><button type="button" id="cpost">등록</button></div>'
    :'<div class="row"><span>댓글은 로그인 후 작성할 수 있습니다.</span><button type="button" class="login" id="clogin">로그인</button></div>';
  if(user){
    $('#ctext').addEventListener('input',e=>{$('#ccount').textContent=e.target.value.length+' / 500'});
    $('#cpost').onclick=async()=>{
      const text=$('#ctext').value.trim();if(!text)return;
      $('#cpost').disabled=true;
      try{await F.addDoc(F.collection(db,'comments'),{nid,uid:user.uid,name:nameOf(user).slice(0,30),text,t:F.serverTimestamp()});mountComments()}
      catch(e){alert('등록 실패: '+(e.code||e.message));$('#cpost').disabled=false}
    };
  }else $('#clogin').onclick=openM;
  try{
    const q=await F.getDocs(F.query(F.collection(db,'comments'),F.where('nid','==',nid),F.limit(300)));
    const rows=q.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.t?b.t.seconds:9e12)-(a.t?a.t.seconds:9e12));
    $('#clist').innerHTML=rows.length?rows.map(r=>'<li data-id="'+r.id+'"><div class="meta"><b>'+esc(r.name)+'</b><span>'+fmt(r.t)+'</span>'+(user&&r.uid===user.uid?'<button type="button" class="del">삭제</button>':'')+'</div><p>'+esc(r.text)+'</p></li>').join(''):'<li style="color:var(--muted)">아직 댓글이 없습니다.</li>';
    $('#clist').querySelectorAll('.del').forEach(b=>b.onclick=async()=>{if(!confirm('댓글을 삭제할까요?'))return;await F.deleteDoc(F.doc(db,'comments',b.closest('li').dataset.id));mountComments()});
  }catch(e){$('#clist').innerHTML='<li style="color:var(--muted)">댓글을 불러오지 못했습니다. ('+esc(e.code||e.message)+')</li>'}
}
window.__onRender=()=>{const c=$('#cmt');if(cur.view!=='novel'){if(c)c.remove();return}mountComments()};

A.onAuthStateChanged(auth,async u=>{
  user=u;setBtn();
  if(u)await syncAll();
  if(cur&&cur.view==='novel')mountComments();
});
setBtn();
if(typeof cur!=='undefined'&&cur.view)window.__onRender();
}
