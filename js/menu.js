const IMG_BASE="https://cdn.jsdelivr.net/gh/Cadealishus/cadesphotos@main/";
const MODEL_BASE="https://raw.githubusercontent.com/Cadealishus/cades3dmodels/main/";
window.A={boot:IMG_BASE+"absolute%20bros.png",bg:IMG_BASE+"background.png",loading:IMG_BASE+"doug%20loadingscreen.png",doug:IMG_BASE+"dougpng.png",tabs:IMG_BASE+"tabs.png",play:IMG_BASE+"play.png",multi:IMG_BASE+"multiplayer.png",loadout:IMG_BASE+"loadout.png",operators:IMG_BASE+"operators.png",settings:IMG_BASE+"settings.png",quit:IMG_BASE+"quit.png",season1:IMG_BASE+"season1.png",newmap:IMG_BASE+"newmap.png",newoperator:IMG_BASE+"newoperator.png",xp:IMG_BASE+"xp.png",mpLobbyBg:IMG_BASE+"multiplayer%20background.png?v=1",armoryBg1:IMG_BASE+"loadout%20background.png",armoryBg2:IMG_BASE+"background.png",model:MODEL_BASE+"m416_modern_assault_rifle.glb?v=28",sight:IMG_BASE+"sight.png",barrel:IMG_BASE+"barrel.png",underbarrel:IMG_BASE+"underbarrel.png",ammo:IMG_BASE+"ammo.png",muzzle:IMG_BASE+"muzzle.png",laser:IMG_BASE+"laser.png",stock:IMG_BASE+"stock.png"};
const A=window.A;bootImg.src=A.boot;loadingImg.src=A.loading;backgroundImg.src=A.bg;pageBgImg.src=A.bg;tabsImg.src=A.tabs;operatorMiniImg.src=A.doug;setArmoryBackground();playImg.src=A.play;multiImg.src=A.multi;loadoutImg.src=A.loadout;operatorsImg.src=A.operators;settingsImg.src=A.settings;quitImg.src=A.quit;removeGreyWhiteBackground(A.doug,"dougImg");
function setArmoryBackground(){const img=document.getElementById("armoryBg");const list=[A.armoryBg1,A.armoryBg2];let i=0;img.onerror=()=>{i++;if(i<list.length)img.src=list[i]};img.src=list[0]}
function removeGreyWhiteBackground(url,imgId){const img=new Image();img.crossOrigin="anonymous";img.onload=()=>{const c=document.createElement("canvas"),x=c.getContext("2d");c.width=img.naturalWidth;c.height=img.naturalHeight;x.drawImage(img,0,0);const data=x.getImageData(0,0,c.width,c.height),p=data.data;for(let i=0;i<p.length;i+=4){const r=p[i],g=p[i+1],b=p[i+2],brightness=(r+g+b)/3,colorDiff=Math.max(r,g,b)-Math.min(r,g,b);if(brightness>165&&colorDiff<38)p[i+3]=0;if(brightness>135&&colorDiff<22)p[i+3]=Math.min(p[i+3],90)}x.putImageData(data,0,0);document.getElementById(imgId).src=c.toDataURL("image/png")};img.onerror=()=>document.getElementById(imgId).src=url;img.src=url}
function loadMultiplayerBackground(){const bg=document.getElementById("mpLobbyBg");if(!bg)return;bg.src=(window.A&&A.mpLobbyBg)?A.mpLobbyBg:"https://cdn.jsdelivr.net/gh/Cadealishus/cadesphotos@main/multiplayer%20background.png?v=1";}
loadMultiplayerBackground();
const boot=document.getElementById("boot"),loading=document.getElementById("loading"),menu=document.getElementById("menu"),pageScreen=document.getElementById("pageScreen"),armoryScreen=document.getElementById("armoryScreen"),loadText=document.getElementById("loadText"),pageLabel=document.getElementById("pageLabel"),pageLeft=document.getElementById("pageLeft"),pageRight=document.getElementById("pageRight");let started=false,selectedPage="play";

const signinMicroslop=document.getElementById("signinMicroslop");
const microslopNameInput=document.getElementById("microslopNameInput");
const microslopSignInBtn=document.getElementById("microslopSignInBtn");
const microslopGuestBtn=document.getElementById("microslopGuestBtn");
let playerUsername=(localStorage.getItem("flopOpsUsername")||"Doug").trim()||"Doug";
function cleanPlayerName(v){return (v||"Doug").replace(/[^a-zA-Z0-9_ -]/g,"").trim().slice(0,18)||"Doug";}
function applyPlayerUsername(){
  playerUsername=cleanPlayerName(playerUsername);
  document.querySelectorAll(".top-label b,.profile b,.page-player b,.armory-player b,.mp-lobby-profile b,.player-name-short").forEach(el=>el.textContent=playerUsername.toUpperCase());
  document.querySelectorAll(".op-text h3").forEach(el=>{ if(el.textContent.trim()==="DOUG") el.textContent=playerUsername.toUpperCase(); });
  if(Array.isArray(window.mpLobbyRoster) && window.mpLobbyRoster.length){
    window.mpLobbyRoster[0].name=playerUsername;
    if(typeof renderMpLobbyRoster==="function") renderMpLobbyRoster();
  }else{
    const hostLabel=document.querySelector(".mp-doug-card.host span");
    if(hostLabel) hostLabel.innerHTML="YOU / <b class='player-name-short'>"+playerUsername.toUpperCase()+"</b>";
  }
}
function finishMicroslopSignIn(name){
  playerUsername=cleanPlayerName(name);
  localStorage.setItem("flopOpsUsername",playerUsername);
  applyPlayerUsername();
  if(signinMicroslop) signinMicroslop.classList.add("hidden");
  boot.classList.remove("hidden");
}
if(microslopNameInput) microslopNameInput.value=playerUsername;
if(microslopSignInBtn) microslopSignInBtn.onclick=()=>finishMicroslopSignIn(microslopNameInput.value);
if(microslopGuestBtn) microslopGuestBtn.onclick=()=>finishMicroslopSignIn("Doug");
if(microslopNameInput) microslopNameInput.addEventListener("keydown",e=>{if(e.key==="Enter") finishMicroslopSignIn(microslopNameInput.value);});
applyPlayerUsername();

function start(){if(started)return;started=true;boot.classList.add("hidden");loading.classList.remove("hidden");loading.classList.add("fade");let p=0;const timer=setInterval(()=>{p+=Math.floor(Math.random()*11)+5;if(p>100)p=100;loadText.textContent=p+"%";if(p>=100){clearInterval(timer);setTimeout(()=>{loading.classList.add("hidden");menu.classList.remove("hidden");menu.classList.add("fade")},650)}},230)}boot.onclick=start;
document.addEventListener("keydown",e=>{if(!boot.classList.contains("hidden")&&["Enter"," ","x","X"].includes(e.key))start();if(e.key==="Escape"){if(!armoryScreen.classList.contains("hidden"))closeArmory();else if(!pageScreen.classList.contains("hidden"))closePage()}if(e.key==="Enter"&&!menu.classList.contains("hidden"))openPage(selectedPage)});
const pages={play:{label:"PLAY",left:`<h1>PLAY</h1><p>Choose your mode and deploy. Quick Play opens the actual game build inside this same file.</p><button class="deploy-btn" onclick="openGame()">DEPLOY</button>`,right:`<div class="page-grid"><button class="page-card" onclick="openGame()"><h2>QUICK PLAY</h2><p>Fast match. Opens the current game build.</p></button><div class="page-card"><h2>TEAM FLOPMATCH</h2><p>Two teams. One scoreboard. Infinite excuses.</p></div><div class="page-card"><h2>SEARCH & DOUGSTROY</h2><p>Plant, defuse, panic, blame lag.</p></div><div class="page-card"><h2>FREE FOR ALL</h2><p>Everyone is the problem.</p></div></div>`},multi:{label:"MULTIPLAYER",left:`<h1>MULTIPLAYER</h1><p>PeerJS lobby controls live here now. Later this gets its own full page, but for now HOST / JOIN launches Quick Play with the room code already loaded.</p><input id="menuRoomInput" class="menu-mp-input" value="cade-room" placeholder="room code"><div class="menu-mp-row"><button class="menu-mp-action" onclick="openGameWithMP('host')">HOST</button><button class="menu-mp-action" onclick="openGameWithMP('join')">JOIN</button></div><button class="deploy-btn" onclick="openGame()">QUICK PLAY SOLO</button>`,right:`<div class="page-grid"><div class="menu-mp-card"><h2>ROOM CODE</h2><p>Use the same code on both computers.</p><p class="menu-mp-note">Default: <b>cade-room</b></p></div><div class="menu-mp-card"><h2>HOST</h2><p>Creates the PeerJS room, then opens the game.</p></div><div class="menu-mp-card"><h2>JOIN</h2><p>Connects to the host room, then opens the game.</p></div><div class="menu-mp-card"><h2>STATUS</h2><p id="menuMpStatus">READY IN MENU</p></div></div>`},operators:{label:"OPERATORS",left:`<h1>OPERATORS</h1><p>Doug is currently equipped, but this page is ready for more characters later.</p><button class="deploy-btn">EQUIP DOUG</button>`,right:`<div class="operator-grid"><div class="operator-card"><h2>DOUG</h2><p>Main operator. Legendary questionable soldier energy.</p><span class="badge">EQUIPPED</span><img src="${A.doug}"></div><div class="operator-card"><h2>ABSOLUTE BRO</h2><p>Background bro unit. Unlock later with challenges.</p><span class="badge">LOCKED</span></div><div class="operator-card"><h2>SENSI DOUG</h2><p>Too powerful. Probably banned in ranked.</p><span class="badge">CLASSIFIED</span></div></div>`},settings:{label:"SETTINGS",left:`<h1>SETTINGS</h1><p>Settings page. These are visual sliders for now.</p><button class="deploy-btn">SAVE SETTINGS</button>`,right:`<div class="page-grid"><div class="page-card"><h2>GRAPHICS</h2><p>Cinematic potato mode.</p></div><div class="page-card"><h2>AUDIO</h2><p>Suspicious muttering level.</p></div><div class="page-card"><h2>CONTROLS</h2><p>Sensitivity and keybinds.</p></div></div>`},quit:{label:"QUIT",left:`<h1>QUIT?</h1><p>Browser games cannot close your computer. Doug tried. The browser said no.</p><button class="deploy-btn" onclick="closePage()">RETURN TO MENU</button>`,right:`<div class="page-grid"><div class="page-card"><h2>EXIT TO DESKTOP</h2><p>Denied. This is JSFiddle. We live here now.</p></div><div class="page-card"><h2>SAFE EXIT</h2><p>Click BACK or press ESC.</p></div></div>`}};
function selectButton(page){selectedPage=page;document.querySelectorAll(".btn,.tab").forEach(b=>b.classList.toggle("active",b.dataset.page===page));const names={play:"PLAY SELECTED",multi:"MULTIPLAYER SELECTED",loadout:"ARMORY SELECTED",operators:"OPERATORS SELECTED",settings:"SETTINGS SELECTED",quit:"QUIT SELECTED"};document.querySelector(".footer").textContent=names[page]+" • CLICK AGAIN / ENTER TO OPEN PAGE • FLOP OPS BUILD 8.3"}
function openPage(page){selectButton(page);if(page==="loadout"){openArmory();return}if(page==="multi"){openMultiplayerLobby();return}const data=pages[page];pageLabel.textContent=data.label;pageLeft.innerHTML=data.left;pageRight.innerHTML=data.right;menu.classList.add("hidden");pageScreen.classList.remove("hidden");pageScreen.classList.add("fade")}
function closePage(){pageScreen.classList.add("hidden");menu.classList.remove("hidden");menu.classList.add("fade")}function openArmory(){menu.classList.add("hidden");pageScreen.classList.add("hidden");armoryScreen.classList.remove("hidden");armoryScreen.classList.add("fade");if(window.initArmoryOnce)window.initArmoryOnce();setTimeout(()=>{if(window.resizeArmory)window.resizeArmory()},50)}function closeArmory(){armoryScreen.classList.add("hidden");menu.classList.remove("hidden");menu.classList.add("fade")}
document.querySelectorAll(".btn,.tab,#operatorMini").forEach(b=>b.onclick=()=>openPage(b.dataset.page));backBtn.onclick=closePage;armoryBack.onclick=closeArmory;
const news=[{img:A.season1,title:"SEASON 1 RELOADED",sub:"New Maps, Modes, and More"},{img:A.newmap,title:"NEW MAP",sub:"Derelict"},{img:A.newoperator,title:"NEW OPERATOR",sub:"Doug Variant Classified"},{img:A.xp,title:"DOUBLE XP EVENT",sub:"Live Now"}];let ni=0;function showNews(){const n=news[ni];newsImg.src=n.img;newsTitle.textContent=n.title;newsSub.textContent=n.sub;document.querySelectorAll(".news-dots span").forEach((d,i)=>d.classList.toggle("active",i===ni))}showNews();setInterval(()=>{ni=(ni+1)%news.length;showNews()},3200);
fullscreenBtn.onclick=()=>{const el=document.documentElement;if(!document.fullscreenElement){if(el.requestFullscreen)el.requestFullscreen();else if(el.webkitRequestFullscreen)el.webkitRequestFullscreen();else if(el.msRequestFullscreen)el.msRequestFullscreen()}else{if(document.exitFullscreen)document.exitFullscreen();else if(document.webkitExitFullscreen)document.webkitExitFullscreen();else if(document.msExitFullscreen)document.msExitFullscreen()}};
/* FLOP OPS QUICK PLAY GAME MERGE */
const GAME_URL="game/game.html";
function buildGameQuery(mode, room){
  const q=new URLSearchParams();
  if(mode) q.set("mp", mode);
  if(room) q.set("room", room);
  return q.toString() ? "?"+q.toString() : "";
}
let flopOpsGameLoaded=false;
let pendingMPMode=null;
let pendingMPRoom="cade-room";
let gameLoadTimer=null;
let gameLoadProgress=0;

function setMenuMpStatus(t){
  const el=document.getElementById("menuMpStatus");
  if(el) el.textContent=t;
}
function getMenuRoom(){
  const el=document.getElementById("menuRoomInput");
  return ((el && el.value) || "cade-room").trim() || "cade-room";
}
function showGameLoading(mode){
  gameLoadProgress=0;
  if(loadText) loadText.textContent="0%";
  if(loadingImg) loadingImg.src=A.loading;
  loading.classList.remove("hidden");
  loading.classList.add("fade");
  const lines=["MATCH DATA", "DOUG MODEL", "MAP GLB", "PEERJS", "FPS ARMS", "ROCKET BLOCKADE"];
  let i=0;
  clearInterval(gameLoadTimer);
  gameLoadTimer=setInterval(()=>{
    gameLoadProgress=Math.min(96,gameLoadProgress+Math.floor(Math.random()*7)+3);
    if(loadText) loadText.textContent=gameLoadProgress+"%";
    i=(i+1)%lines.length;
  },170);
  setMenuMpStatus(mode ? (mode.toUpperCase()+" QUEUED • "+pendingMPRoom) : "QUICK PLAY LOADING");
}
function hideGameLoading(){
  clearInterval(gameLoadTimer);
  gameLoadTimer=null;
  if(loadText) loadText.textContent="100%";
  setTimeout(()=>loading.classList.add("hidden"),180);
}
function applyMenuMultiplayerToFrame(){
  if(!pendingMPMode) return;
  const frame=document.getElementById("gameFrame");
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    try{
      const doc=frame.contentDocument || frame.contentWindow.document;
      if(!doc) return;
      const roomInput=doc.getElementById("mpRoomInput");
      const btn=doc.getElementById(pendingMPMode==="host" ? "mpHostBtn" : "mpJoinBtn");
      if(roomInput && btn){
        roomInput.value=pendingMPRoom;
        btn.click();
        setMenuMpStatus(pendingMPMode.toUpperCase()+" SENT TO GAME • "+pendingMPRoom);
        clearInterval(timer);
      }
    }catch(e){}
    if(tries>80){
      clearInterval(timer);
      setMenuMpStatus("MP AUTO-START FAILED • OPEN GAME PANEL WITH O");
    }
  },250);
}
function openGame(mode=null,room=null){
  try{ if(document.exitPointerLock) document.exitPointerLock(); }catch(e){}
  pendingMPMode=mode;
  pendingMPRoom=room || getMenuRoom();
  boot.classList.add("hidden");
  menu.classList.add("hidden");
  pageScreen.classList.add("hidden");
  armoryScreen.classList.add("hidden");
  const mpLobby=document.getElementById("mpLobbyScreen");
  if(mpLobby) mpLobby.classList.add("hidden");
  const host=document.getElementById("gameHost");
  const frame=document.getElementById("gameFrame");
  showGameLoading(mode);
  frame.onload=()=>{
    hideGameLoading();
    host.classList.remove("hidden");
    applyMenuMultiplayerToFrame();
  };
  // GitHub version: load the game as a real file instead of a giant base64 srcdoc.
  frame.src = GAME_URL + buildGameQuery(mode, pendingMPRoom);
  flopOpsGameLoaded = true;
}
function openGameWithMP(mode){
  openGame(mode,getMenuRoom());
}
function closeGame(){
  try{ if(document.exitPointerLock) document.exitPointerLock(); }catch(e){}
  clearInterval(gameLoadTimer);
  const host=document.getElementById("gameHost");
  const frame=document.getElementById("gameFrame");
  host.classList.add("hidden");
  loading.classList.add("hidden");
  frame.src="about:blank";
  flopOpsGameLoaded=false;
  pendingMPMode=null;
  const mpLobby=document.getElementById("mpLobbyScreen");
  if(mpLobby) mpLobby.classList.add("hidden");
  menu.classList.remove("hidden");
  menu.classList.add("fade");
  setMenuMpStatus("RETURNED TO MENU");
}
document.getElementById("gameBack").onclick=closeGame;
window.openGame=openGame;
window.openGameWithMP=openGameWithMP;
window.closeGame=closeGame;

window.closePage=closePage;


/* Multiplayer menu/lobby hooks */
let mpLobbyThreeStarted=false;
let mpLobbyChosenMode=null;
let mpLobbyPeer=null;
let mpLobbyConnections=[];
let mpLobbyIsHost=false;
window.mpLobbyRoster=[{id:"local",name:playerUsername,you:true}];

function setMpLobbyStatus(t){
  const a=document.getElementById("mpLobbyStatus");
  const b=document.getElementById("menuMpStatus");
  if(a) a.textContent=t;
  if(b) b.textContent=t;
}
function getMpLobbyRoom(){
  const a=document.getElementById("mpLobbyRoomInput");
  const b=document.getElementById("menuRoomInput");
  return ((a&&a.value)||(b&&b.value)||"cade-room").trim()||"cade-room";
}
function safeLobbyRoomId(room){
  return ("flopops_lobby_"+room).replace(/[^a-zA-Z0-9_-]/g,"_").slice(0,58);
}
function resetMpLobbyRoster(){
  window.mpLobbyRoster=[{id:"local",name:playerUsername,you:true}];
  renderMpLobbyRoster();
}
function upsertMpLobbyPlayer(id,name){
  id=id||("remote_"+Math.random().toString(36).slice(2));
  name=cleanPlayerName(name||"Doug");
  if(id==="local") return;
  let found=window.mpLobbyRoster.find(p=>p.id===id);
  if(found) found.name=name;
  else if(window.mpLobbyRoster.length<3) window.mpLobbyRoster.push({id,name,you:false});
  renderMpLobbyRoster();
}
function renderMpLobbyRoster(){
  if(!Array.isArray(window.mpLobbyRoster)||!window.mpLobbyRoster.length) resetMpLobbyRoster();
  window.mpLobbyRoster[0]={id:"local",name:playerUsername,you:true};
  document.querySelectorAll(".mp-doug-card").forEach((card,i)=>{
    const p=window.mpLobbyRoster[i];
    card.classList.toggle("occupied",!!p);
    const label=card.querySelector("span");
    if(label){
      if(!p){ label.textContent="EMPTY SLOT"; }
      else if(i===0){ label.innerHTML="YOU / <b class='player-name-short'>"+cleanPlayerName(p.name).toUpperCase()+"</b>"; }
      else{ label.textContent=cleanPlayerName(p.name).toUpperCase(); }
    }
  });
}
function sendLobbyData(conn,data){
  try{ if(conn&&conn.open) conn.send(data); }catch(e){}
}
function broadcastLobbyRoster(){
  const roster=window.mpLobbyRoster.map(p=>({id:p.id,name:p.name,you:false}));
  mpLobbyConnections.forEach(conn=>sendLobbyData(conn,{type:"lobbyRoster",roster,hostName:playerUsername}));
}
function setupLobbyConnection(conn){
  if(!conn) return;
  if(!mpLobbyConnections.includes(conn)) mpLobbyConnections.push(conn);
  conn.on("open",()=>{
    sendLobbyData(conn,{type:"lobbyHello",id:(mpLobbyPeer&&mpLobbyPeer.id)||"local",name:playerUsername});
    if(mpLobbyIsHost) broadcastLobbyRoster();
  });
  conn.on("data",data=>{
    if(!data||typeof data!=="object") return;
    if(data.type==="lobbyHello"){
      upsertMpLobbyPlayer(data.id||conn.peer,data.name||"Doug");
      if(mpLobbyIsHost){
        setMpLobbyStatus("PLAYER JOINED\nroom: "+getMpLobbyRoom()+"\nplayers: "+window.mpLobbyRoster.length+"/3\n"+cleanPlayerName(data.name).toUpperCase()+" linked ✅");
        broadcastLobbyRoster();
      }else{
        setMpLobbyStatus("LINKED TO HOST\nroom: "+getMpLobbyRoom()+"\nplayers: "+window.mpLobbyRoster.length+"/3");
      }
    }
    if(data.type==="lobbyRoster" && Array.isArray(data.roster)){
      const mine=(mpLobbyPeer&&mpLobbyPeer.id)||"local";
      const remotes=data.roster.filter(p=>p.id!==mine).map(p=>({id:p.id,name:p.name,you:false}));
      window.mpLobbyRoster=[{id:"local",name:playerUsername,you:true},...remotes].slice(0,3);
      renderMpLobbyRoster();
      setMpLobbyStatus("LOBBY SYNCED\nroom: "+getMpLobbyRoom()+"\nplayers: "+window.mpLobbyRoster.length+"/3");
    }
    if(data.type==="startGame"){
      const room=data.room||getMpLobbyRoom();
      setMpLobbyStatus("MATCH STARTING\nroom: "+room+"\nlinked as JOIN");
      setTimeout(()=>openGame("join",room),120);
    }
  });
  conn.on("close",()=>{
    mpLobbyConnections=mpLobbyConnections.filter(c=>c!==conn);
    window.mpLobbyRoster=window.mpLobbyRoster.filter(p=>p.id!==conn.peer);
    renderMpLobbyRoster();
    if(mpLobbyIsHost) broadcastLobbyRoster();
    setMpLobbyStatus("PLAYER LEFT\nroom: "+getMpLobbyRoom()+"\nplayers: "+window.mpLobbyRoster.length+"/3");
  });
  conn.on("error",err=>setMpLobbyStatus("LOBBY CONNECTION ERROR\n"+((err&&err.message)||err)));
}
function disconnectMpLobbyNetwork(show=true){
  mpLobbyConnections.forEach(c=>{try{c.close();}catch(e){}});
  mpLobbyConnections=[];
  if(mpLobbyPeer){try{mpLobbyPeer.destroy();}catch(e){}}
  mpLobbyPeer=null;
  mpLobbyIsHost=false;
  if(show) setMpLobbyStatus("OFFLINE");
}
function lobbyHostOnly(){
  mpLobbyChosenMode="host";
  disconnectMpLobbyNetwork(false);
  resetMpLobbyRoster();
  if(typeof Peer==="undefined"){
    setMpLobbyStatus("PeerJS did not load. Check school/network blocking.");
    return;
  }
  const room=getMpLobbyRoom();
  const id=safeLobbyRoomId(room);
  mpLobbyIsHost=true;
  setMpLobbyStatus("HOSTING...\nroom: "+room+"\nid: "+id+"\nwaiting for another Microslop user...");
  mpLobbyPeer=new Peer(id,{host:"0.peerjs.com",port:443,path:"/",secure:true,debug:1});
  mpLobbyPeer.on("open",peerId=>setMpLobbyStatus("HOST ONLINE\nroom: "+room+"\nid: "+peerId+"\nplayers: 1/3"));
  mpLobbyPeer.on("connection",setupLobbyConnection);
  mpLobbyPeer.on("error",err=>setMpLobbyStatus("HOST ERROR\n"+((err&&err.message)||err)+"\nTry a different room code."));
}
function lobbyJoinPreview(){
  mpLobbyChosenMode="join";
  disconnectMpLobbyNetwork(false);
  resetMpLobbyRoster();
  if(typeof Peer==="undefined"){
    setMpLobbyStatus("PeerJS did not load. Check school/network blocking.");
    return;
  }
  const room=getMpLobbyRoom();
  const hostId=safeLobbyRoomId(room);
  setMpLobbyStatus("JOINING...\nroom: "+room+"\nhost: "+hostId);
  mpLobbyPeer=new Peer(undefined,{host:"0.peerjs.com",port:443,path:"/",secure:true,debug:1});
  mpLobbyPeer.on("open",id=>{
    const conn=mpLobbyPeer.connect(hostId,{reliable:false});
    setupLobbyConnection(conn);
    setMpLobbyStatus("CONNECTING TO HOST...\nmy id: "+id+"\nroom: "+room);
  });
  mpLobbyPeer.on("error",err=>setMpLobbyStatus("JOIN ERROR\n"+((err&&err.message)||err)+"\nMake sure the host clicked HOST first."));
}
function openMultiplayerLobby(){
  selectedPage="multi";
  selectButton("multi");
  if(window.A && document.getElementById("mpLobbyBg")){
    document.getElementById("mpLobbyBg").src = A.mpLobbyBg || A.armoryBg1 || A.bg;
  }
  menu.classList.add("hidden");
  pageScreen.classList.add("hidden");
  armoryScreen.classList.add("hidden");
  const mp=document.getElementById("mpLobbyScreen");
  mp.classList.remove("hidden");
  mp.classList.add("fade");
  if(!mpLobbyThreeStarted && window.initMpDougLobby){
    window.initMpDougLobby();
    mpLobbyThreeStarted=true;
  }
  renderMpLobbyRoster();
}
function closeMultiplayerLobby(){
  const mp=document.getElementById("mpLobbyScreen");
  if(mp) mp.classList.add("hidden");
  menu.classList.remove("hidden");
  menu.classList.add("fade");
}
function deployFromLobby(mode){
  const room=getMpLobbyRoom();
  mode=mode||mpLobbyChosenMode||(mpLobbyIsHost?"host":(mpLobbyConnections.length?"join":"host"));
  pendingMPMode=mode;
  pendingMPRoom=room;
  const r=document.getElementById("menuRoomInput");
  if(r) r.value=room;

  if(mpLobbyIsHost && mpLobbyConnections.length){
    mpLobbyConnections.forEach(conn=>sendLobbyData(conn,{type:"startGame",room,hostName:playerUsername}));
    setMpLobbyStatus("MATCH STARTING\nroom: "+room+"\nplayers: "+window.mpLobbyRoster.length+"/3\nsent launch to linked players ✅");
    setTimeout(()=>openGame("host",room),140);
    return;
  }

  if(mode==="join"){
    setMpLobbyStatus("MATCH STARTING\nroom: "+room+"\nlinked as JOIN");
    setTimeout(()=>openGame("join",room),140);
    return;
  }

  setMpLobbyStatus("MATCH STARTING\nroom: "+room+"\nsolo host / Three.js MP preview");
  setTimeout(()=>openGame(mode||"host",room),140);
}
window.openMultiplayerLobby=openMultiplayerLobby;
window.closeMultiplayerLobby=closeMultiplayerLobby;
window.renderMpLobbyRoster=renderMpLobbyRoster;
document.addEventListener("DOMContentLoaded",()=>{
  const back=document.getElementById("mpLobbyBack");
  const host=document.getElementById("mpLobbyHostBtn");
  const join=document.getElementById("mpLobbyJoinBtn");
  const quick=document.getElementById("mpLobbyQuickPlayBtn");
  if(back) back.onclick=closeMultiplayerLobby;
  if(host) host.onclick=lobbyHostOnly;
  if(join) join.onclick=lobbyJoinPreview;
  if(quick) quick.onclick=()=>deployFromLobby(mpLobbyChosenMode);
  renderMpLobbyRoster();
});



/* Module code injected for JSFiddle separate JS panel */
const __flopOpsModuleCode = 'import * as THREE from "three";import{GLTFLoader}from"three/addons/loaders/GLTFLoader.js";import{OrbitControls}from"three/addons/controls/OrbitControls.js";import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";const A=window.A;\nconst SLOT_DATA={sight:{title:"SIGHT",image:A.sight,options:["HOLO SIGHT","RED DOT","COMPACT OPTIC"],stat:{accuracy:4,recoil:2,handling:-1}},barrel:{title:"BARREL",image:A.barrel,options:["LONG BARREL","LIGHT BARREL","SHORT BARREL"],stat:{damage:3,accuracy:3,mobility:-2}},underbarrel:{title:"UNDERBARREL",image:A.underbarrel,options:["ANGLED GRIP","VERTICAL GRIP","TACTICAL RAIL"],stat:{recoil:5,accuracy:2,handling:-1}},ammo:{title:"AMMO",image:A.ammo,options:["MATCH AMMO","LIGHT AMMO","HEAVY AMMO"],stat:{damage:4,fire:-1,accuracy:1}},muzzle:{title:"MUZZLE",image:A.muzzle,options:["COMPENSATOR","FLASH HIDER","QUIET MUZZLE"],stat:{recoil:4,accuracy:2,mobility:-1}},laser:{title:"LASER",image:A.laser,options:["TAC LASER","POINT LASER","STEALTH LASER"],stat:{handling:5,accuracy:2}},stock:{title:"STOCK",image:A.stock,options:["TACTICAL STOCK","HEAVY STOCK","LIGHT STOCK"],stat:{mobility:3,handling:2,recoil:-1}}};\nconst baseStats={damage:68,fire:77,accuracy:72,recoil:55,mobility:61,handling:64};\n\nconst ATTACHMENT_MODEL_URLS={\n  sight:{\n    "HOLO SIGHT":[A.holoSightModel,A.holoSightModelCdn]\n  }\n};\n\nconst attachmentModelCache={};\nconst DEFAULT_ATTACH_POINTS={sight:{pos:[-0.2,0.24,0],rot:[0,-1.6,0],scale:1},barrel:{pos:[1.28,0.15,0],rot:[1.56,0,-3.14],scale:1},muzzle:{pos:[1.65,0.16,0],rot:[0.01,-3.08,0],scale:1},underbarrel:{pos:[0.34,-0.05,-0.01],rot:[0,3.14,0],scale:1},ammo:{pos:[-0.05,-0.47,-0.31],rot:[0,0,0],scale:1},laser:{pos:[0.35,0.14,0.14],rot:[0,-3.14,0],scale:1},stock:{pos:[-0.81,0.1,0],rot:[0,-3.14,0],scale:1}};\nconst MUZZLE_NO_BARREL_POINT={pos:[0.98,0.16,0],rot:[0.01,-3.08,0],scale:1};const ATTACH_POINTS=JSON.parse(JSON.stringify(DEFAULT_ATTACH_POINTS));\nlet equipped={},armoryStarted=false,renderer,scene,camera,controls,weaponRig,gunMount,gunModel,canvas,attachmentRoot;let activeAttachMeshes={},attachmentTweens=[];const trayTitle=document.getElementById("trayTitle"),trayGrid=document.getElementById("trayGrid"),equippedText=document.getElementById("equippedText"),flash=document.getElementById("installFlash"),toast=document.getElementById("toast");\nfunction getAttachPoint(slot){if(slot==="muzzle"&&!equipped.barrel)return MUZZLE_NO_BARREL_POINT;return ATTACH_POINTS[slot]}\nfunction setupHotspotImages(){document.querySelectorAll(".hotspot").forEach(h=>{const slot=h.dataset.slot,data=SLOT_DATA[slot];h.innerHTML=`<img src="${data.image}" alt="${data.title}">`;h.onclick=()=>setSlot(slot)})}\nfunction setSlot(slot){document.querySelectorAll(".hotspot").forEach(h=>h.classList.toggle("active",h.dataset.slot===slot));const data=SLOT_DATA[slot];trayTitle.textContent=data.title;equippedText.textContent=data.title;trayGrid.innerHTML="";data.options.forEach((name,index)=>{const card=document.createElement("button");card.className="slot-card";if(equipped[slot]===name)card.classList.add("active");card.innerHTML=`<img src="${data.image}" alt="${data.title}"><div class="selected-label">${name} EQUIPPED</div>`;card.onclick=()=>{equipped[slot]=name;equipVisualAttachment(slot,name,true);if(slot==="barrel"&&equipped.muzzle)equipVisualAttachment("muzzle",equipped.muzzle,false);if(slot==="muzzle")equipVisualAttachment("muzzle",name,true);playInstall(slot,index);updateStats();setSlot(slot)};trayGrid.appendChild(card)})}\nfunction makeMat(color,emissive=0x000000){return new THREE.MeshStandardMaterial({color,emissive,metalness:.72,roughness:.34})}function box(w,h,d,x,y,z,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);return m}function cyl(r1,r2,h,x,y,z,rot,mat){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,28),mat);m.position.set(x,y,z);m.rotation.set(rot[0],rot[1],rot[2]);return m}\n\n\nfunction loadAttachmentGLB(slot,name,parent){\n  const urls=ATTACHMENT_MODEL_URLS[slot]?.[name];\n  if(!urls)return;\n\n  const urlList=Array.isArray(urls)?urls:[urls];\n  let tryIndex=0;\n\n  showToast("LOADING "+name+" GLB");\n\n  function fitModel(model){\n    model.updateMatrixWorld(true);\n\n    const box3=new THREE.Box3().setFromObject(model);\n    const size=new THREE.Vector3();\n    const center=new THREE.Vector3();\n    box3.getSize(size);\n    box3.getCenter(center);\n\n    if(!Number.isFinite(size.x) || (size.x===0 && size.y===0 && size.z===0)){\n      showToast(name+" GLB HAS NO VISIBLE MESH");\n      return;\n    }\n\n    model.position.sub(center);\n\n    const maxDim=Math.max(size.x,size.y,size.z)||1;\n    const targetSize=slot==="sight" ? 0.42 : 0.35;\n    const s=targetSize/maxDim;\n    model.scale.setScalar(s);\n\n    model.traverse(o=>{\n      if(o.isMesh){\n        o.visible=true;\n        o.castShadow=true;\n        o.receiveShadow=true;\n        if(o.material){\n          if(Array.isArray(o.material)){\n            o.material.forEach(m=>{\n              m.transparent=false;\n              m.opacity=1;\n              m.metalness=Math.min(1,m.metalness ?? .6);\n              m.roughness=Math.max(.32,m.roughness ?? .45);\n              m.needsUpdate=true;\n            });\n          }else{\n            o.material.transparent=false;\n            o.material.opacity=1;\n            o.material.metalness=Math.min(1,o.material.metalness ?? .6);\n            o.material.roughness=Math.max(.32,o.material.roughness ?? .45);\n            o.material.needsUpdate=true;\n          }\n        }\n      }\n    });\n\n    parent.clear();\n    parent.add(model);\n    applyAttachPoint(slot);\n    showToast(name+" GLB LOADED");\n  }\n\n  function tryNext(){\n    if(tryIndex>=urlList.length){\n      showToast(name+" GLB FAILED - USING PLACEHOLDER");\n      return;\n    }\n\n    const url=urlList[tryIndex++];\n    console.log("Trying attachment GLB:",url);\n\n    if(attachmentModelCache[url]){\n      fitModel(attachmentModelCache[url].clone(true));\n      return;\n    }\n\n    const loader=new GLTFLoader();\n    loader.load(\n      url,\n      gltf=>{\n        attachmentModelCache[url]=gltf.scene;\n        fitModel(gltf.scene.clone(true));\n      },\n      undefined,\n      err=>{\n        console.warn("Attachment GLB failed:",url,err);\n        tryNext();\n      }\n    );\n  }\n\n  tryNext();\n}\n\nfunction createAttachmentMesh(slot,name){const g=new THREE.Group(),black=makeMat(0x111111),dark=makeMat(0x252525),orange=makeMat(0xff8b1f,0x552200),blue=makeMat(0x45d9ff,0x003344),tan=makeMat(0x5a4a2a),red=makeMat(0xff1b1b,0x330000);if(slot==="sight"){if(name==="HOLO SIGHT"){g.add(box(.34,.13,.22,0,.03,0,dark));g.add(box(.22,.24,.05,0,.18,0,black));g.add(box(.17,.14,.035,0,.18,.031,blue));g.add(box(.22,.035,.2,0,.32,0,orange))}else if(name==="RED DOT"){g.add(box(.28,.09,.18,0,.03,0,dark));g.add(cyl(.09,.09,.18,0,.16,0,[Math.PI/2,0,0],black));g.add(cyl(.072,.072,.02,0,.16,.1,[Math.PI/2,0,0],red))}else{g.add(box(.38,.12,.19,0,.04,0,dark));g.add(cyl(.075,.075,.34,0,.17,0,[0,0,Math.PI/2],black));g.add(box(.16,.04,.16,0,.28,0,orange))}}if(slot==="barrel"){const len=name==="LONG BARREL"?.82:name==="SHORT BARREL"?.38:.58;g.add(cyl(.055,.055,len,0,0,0,[0,0,Math.PI/2],black));g.add(cyl(.075,.075,.16,-len/2+.08,0,0,[0,0,Math.PI/2],dark))}if(slot==="muzzle"){if(name==="COMPENSATOR"){g.add(cyl(.095,.095,.27,0,0,0,[0,0,Math.PI/2],dark));g.add(box(.07,.04,.24,-.04,.095,0,black));g.add(box(.07,.04,.24,.04,.095,0,black))}else if(name==="FLASH HIDER"){g.add(cyl(.08,.105,.24,0,0,0,[0,0,Math.PI/2],black));g.add(box(.04,.16,.04,.12,0,0,orange))}else{g.add(cyl(.11,.11,.34,0,0,0,[0,0,Math.PI/2],black));g.add(cyl(.082,.082,.37,0,0,0,[0,0,Math.PI/2],dark))}}if(slot==="underbarrel"){if(name==="VERTICAL GRIP"){g.add(box(.14,.45,.16,0,-.12,0,black));g.add(box(.18,.08,.2,0,.14,0,dark))}else if(name==="ANGLED GRIP"){const m=box(.18,.44,.14,0,-.12,0,black);m.rotation.z=.35;g.add(m);g.add(box(.28,.08,.18,0,.12,0,dark))}else{g.add(box(.55,.08,.18,0,.08,0,dark));g.add(box(.22,.08,.2,.08,-.03,0,black))}}if(slot==="ammo"){g.add(box(.42,.18,.22,0,0,0,dark));for(let i=0;i<4;i++)g.add(cyl(.025,.025,.21,-.15+i*.1,.02,0,[Math.PI/2,0,0],orange))}if(slot==="laser"){g.add(box(.42,.12,.13,0,0,0,black));g.add(box(.12,.15,.16,-.18,0,0,dark));g.add(cyl(.035,.035,.1,-.27,0,0,[0,0,Math.PI/2],red));g.add(box(.06,.06,.08,-.31,0,0,red))}if(slot==="stock"){if(name==="LIGHT STOCK"){g.add(box(.55,.14,.18,0,0,0,black));g.add(box(.22,.38,.12,.22,-.05,0,dark))}else if(name==="HEAVY STOCK"){g.add(box(.62,.22,.24,0,0,0,dark));g.add(box(.28,.42,.2,.25,-.04,0,black))}else{g.add(box(.58,.18,.21,0,0,0,black));g.add(box(.24,.36,.15,.24,-.04,0,dark));g.add(box(.18,.08,.24,-.2,.12,0,orange))}}g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});return g}\nfunction equipVisualAttachment(slot,name,animate=true){if(!attachmentRoot)return;if(activeAttachMeshes[slot]){attachmentRoot.remove(activeAttachMeshes[slot]);activeAttachMeshes[slot]=null}const point=getAttachPoint(slot);if(!point)return;const mesh=createAttachmentMesh(slot,name);mesh.position.set(point.pos[0],point.pos[1],point.pos[2]);mesh.rotation.set(point.rot[0],point.rot[1],point.rot[2]);mesh.scale.set(point.scale,point.scale,point.scale);if(animate){mesh.userData.targetPos=mesh.position.clone();mesh.userData.targetScale=point.scale;mesh.position.set(point.pos[0],-1.25,point.pos[2]+.75);mesh.scale.set(.6,.6,.6);attachmentTweens.push({mesh,start:performance.now(),duration:620,from:mesh.position.clone(),to:mesh.userData.targetPos.clone(),targetScale:point.scale})}attachmentRoot.add(mesh);activeAttachMeshes[slot]=mesh}\nfunction rebuildVisualAttachments(){if(!attachmentRoot)return;Object.keys(equipped).forEach(slot=>equipVisualAttachment(slot,equipped[slot],false))}function updateAttachmentTweens(){const now=performance.now();attachmentTweens=attachmentTweens.filter(t=>{const p=Math.min(1,(now-t.start)/t.duration),ease=1-Math.pow(1-p,3);t.mesh.position.lerpVectors(t.from,t.to,ease);const s=.6+(t.targetScale-.6)*ease;t.mesh.scale.set(s,s,s);t.mesh.rotation.y+=.045*(1-p);if(p>=1){t.mesh.position.copy(t.to);t.mesh.scale.set(t.targetScale,t.targetScale,t.targetScale);return false}return true})}\nfunction playInstall(slot,index){const h=document.querySelector(`[data-slot="${slot}"]`),r=h.getBoundingClientRect();flash.style.left=(r.left+r.width/2-80)+"px";flash.style.top=(r.top+r.height/2)+"px";flash.classList.remove("play");void flash.offsetWidth;flash.classList.add("play");toast.textContent=SLOT_DATA[slot].title+" EQUIPPED";toast.classList.remove("show");void toast.offsetWidth;toast.classList.add("show");if(gunMount){gunMount.position.y+=0.02;setTimeout(()=>gunMount.position.y-=0.02,180)}}\nfunction updateStats(){const stats={...baseStats};Object.keys(equipped).forEach(slot=>{const selected=equipped[slot];if(!selected)return;const mod=SLOT_DATA[slot].stat;Object.keys(mod).forEach(k=>stats[k]+=mod[k])});function clamp(v){return Math.max(0,Math.min(100,v))}[["damage","damageBar","damageVal"],["fire","fireBar","fireVal"],["accuracy","accuracyBar","accuracyVal"],["recoil","recoilBar","recoilVal"],["mobility","mobilityBar","mobilityVal"],["handling","handlingBar","handlingVal"]].forEach(([key,bar,val])=>{const v=clamp(stats[key]);document.getElementById(bar).style.width=v+"%";document.getElementById(val).textContent=v})}\nsetupHotspotImages();setSlot("sight");\nwindow.initArmoryOnce=function(){if(armoryStarted)return;armoryStarted=true;canvas=document.getElementById("modelCanvas");renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(38,1,0.01,200);camera.position.set(0,1.0,4.2);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=2.5;controls.maxDistance=7;controls.target.set(0,0.2,0);weaponRig=new THREE.Group();scene.add(weaponRig);gunMount=new THREE.Group();weaponRig.add(gunMount);attachmentRoot=new THREE.Group();gunMount.add(attachmentRoot);scene.add(new THREE.HemisphereLight(0xffffff,0x111111,1.2));const key=new THREE.DirectionalLight(0xffffff,2.4);key.position.set(3,5,4);scene.add(key);const red=new THREE.PointLight(0xff1b1b,1.5,8);red.position.set(-3,1,2);scene.add(red);const blue=new THREE.PointLight(0x77d9ff,1.0,8);blue.position.set(3,2,-1);scene.add(blue);tryLoadRealModel();resizeArmory();animate()};\nfunction normalizeGunIntoMount(){const box=new THREE.Box3().setFromObject(gunModel),size=new THREE.Vector3(),center=new THREE.Vector3();box.getSize(size);box.getCenter(center);gunModel.position.sub(center);const maxDim=Math.max(size.x,size.y,size.z),scale=2.8/maxDim;gunMount.scale.setScalar(scale);gunMount.rotation.set(0,Math.PI/2,0)}\nfunction tryLoadRealModel(){const loader=new GLTFLoader();loader.load(A.model,gltf=>{gunModel=gltf.scene;gunModel.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material){o.material.metalness=Math.min(1,o.material.metalness??.6);o.material.roughness=Math.max(.32,o.material.roughness??.45)}}});gunMount.add(gunModel);normalizeGunIntoMount();rebuildVisualAttachments();document.getElementById("modelLoading").classList.add("hide")},xhr=>{if(xhr.total){const p=Math.floor(xhr.loaded/xhr.total*100);document.getElementById("modelLoading").textContent="LOADING 3D MODEL "+p+"%"}},err=>{console.warn("Real GLB failed, using fallback rifle.",err);createFallbackRifle();normalizeGunIntoMount();rebuildVisualAttachments();document.getElementById("modelLoading").textContent="USING BUILT-IN ARMORY PREVIEW";setTimeout(()=>document.getElementById("modelLoading").classList.add("hide"),900)})}\nfunction createFallbackRifle(){gunModel=new THREE.Group();const matBlack=new THREE.MeshStandardMaterial({color:0x111111,metalness:.8,roughness:.38}),matDark=new THREE.MeshStandardMaterial({color:0x242424,metalness:.7,roughness:.42}),matTan=new THREE.MeshStandardMaterial({color:0x5a4a2a,metalness:.4,roughness:.6}),matRed=new THREE.MeshStandardMaterial({color:0xaa0000,emissive:0x330000,metalness:.5,roughness:.4});function addBox(w,h,d,x,y,z,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);gunModel.add(m);return m}addBox(2.4,.22,.22,0,0,0,matBlack);addBox(1.05,.34,.26,.15,.18,0,matDark);addBox(.8,.16,.18,-1.28,.02,0,matBlack);addBox(.7,.26,.25,1.43,.03,0,matDark);addBox(.22,.75,.18,.22,-.45,0,matTan);addBox(.18,.5,.18,-.35,-.42,0,matBlack);addBox(.45,.15,.3,.15,.45,0,matRed);addBox(.35,.12,.18,.15,.58,0,matBlack);addBox(.55,.12,.16,-.75,.34,0,matDark);addBox(.12,.18,.18,-1.9,.02,0,matBlack);const barrelGeo=new THREE.CylinderGeometry(.055,.055,.85,20),barrel=new THREE.Mesh(barrelGeo,matBlack);barrel.rotation.z=Math.PI/2;barrel.position.set(-1.75,.03,0);gunModel.add(barrel);gunMount.add(gunModel)}\nwindow.resizeArmory=function(){if(!renderer||!canvas)return;const rect=canvas.getBoundingClientRect(),w=Math.max(1,rect.width),h=Math.max(1,rect.height);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};window.addEventListener("resize",()=>window.resizeArmory());function animate(){requestAnimationFrame(animate);updateAttachmentTweens();if(controls)controls.update();if(renderer&&scene&&camera)renderer.render(scene,camera)}\n\n\n/* Doug idle multiplayer lobby preview - upright MW-style squad patch */\nwindow.initMpDougLobby = function(){\n  const MODEL_BASE="https://cdn.jsdelivr.net/gh/Cadealishus/cades3dmodels@main/";\n  const file=(name)=>MODEL_BASE+name+"?v=mpLobby15_upright_face_camera";\n  const canvases=[0,1,2,3].map(i=>document.getElementById("mpDougCanvas"+i)).filter(Boolean);\n  if(!canvases.length) return;\n\n  const loaders=new GLTFLoader();\n  let template=null;\n  let idleClip=null;\n\n  canvases.forEach((canvas,index)=>{\n    const scene=new THREE.Scene();\n    const camera=new THREE.PerspectiveCamera(38,1,0.05,100);\n    camera.position.set(0,1.42,13.8);\n    camera.lookAt(0,1.35,0);\n    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});\n    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));\n    scene.add(new THREE.HemisphereLight(0xffffff,0x161616,2.3));\n    const key=new THREE.DirectionalLight(0xffffff,2.2);\n    key.position.set(3,5,4);\n    scene.add(key);\n    const red=new THREE.PointLight(0xff2222,1.2,7);\n    red.position.set(-2,2,2);\n    scene.add(red);\n\n    const root=new THREE.Group();\n    root.position.y=-0.02;\n    root.rotation.y = Math.PI + (index===0 ? 0 : (index===1 ? -0.12 : index===2 ? 0.12 : 0)); // face camera yaw, model keeps upright correction\n    scene.add(root);\n    let mixer=null;\n\n    function resize(){\n      const rect=canvas.getBoundingClientRect();\n      const w=Math.max(1,rect.width), h=Math.max(1,rect.height);\n      renderer.setSize(w,h,false);\n      camera.aspect=w/h;\n      camera.updateProjectionMatrix();\n    }\n\n    function fit(model){\n      model.traverse(o=>{\n        if(o.isMesh||o.isSkinnedMesh){\n          o.visible=true;\n          o.frustumCulled=false;\n          o.castShadow=true;\n          o.receiveShadow=true;\n          if(o.material){\n            const mats=Array.isArray(o.material)?o.material:[o.material];\n            mats.forEach(m=>{if(m){m.transparent=false;m.opacity=1;m.side=THREE.DoubleSide;m.needsUpdate=true;}});\n          }\n        }\n      });\n      model.rotation.set(-Math.PI/2,Math.PI,0);\n      model.updateMatrixWorld(true);\n      const box=new THREE.Box3().setFromObject(model);\n      const size=new THREE.Vector3(), center=new THREE.Vector3();\n      box.getSize(size); box.getCenter(center);\n      model.position.x-=center.x;\n      model.position.z-=center.z;\n      model.position.y-=box.min.y;\n      if(size.y>0) model.scale.setScalar(2.45/size.y);\nmodel.updateMatrixWorld(true);\nconst box2=new THREE.Box3().setFromObject(model);\nmodel.position.y-=box2.min.y;\n    }\n\n    function normLobbyBoneName(name){\n      return String(name||"").replace(/^mixamorig[:_]?/i,"").replace(/^Armature[_:]?/i,"").replace(/_\\d+$/g,"").replace(/\\s+/g,"").toLowerCase();\n    }\n    function buildLobbyBoneMap(model){\n      const map=new Map();\n      model.traverse(o=>{\n        if(o.isBone||o.type==="Bone"){\n          const k=normLobbyBoneName(o.name);\n          if(!map.has(k)) map.set(k,o.name);\n        }\n      });\n      return map;\n    }\n    function retargetLobbyClip(clip,boneMap){\n      if(!clip||!clip.tracks) return clip;\n      const tracks=[];\n      for(const track of clip.tracks){\n        const dot=track.name.indexOf(".");\n        if(dot<0) continue;\n        const src=track.name.slice(0,dot);\n        const prop=track.name.slice(dot);\n        if(prop.includes(".scale")) continue;\n        if(prop.includes(".position") && normLobbyBoneName(src)!=="hips") continue;\n        const target=boneMap.get(normLobbyBoneName(src));\n        if(target){\n          const t=track.clone();\n          t.name=target+prop;\n          tracks.push(t);\n        }\n      }\n      return tracks.length ? new THREE.AnimationClip((clip.name||"idle")+"_lobbyRetarget",clip.duration,tracks,clip.blendMode) : null;\n    }\n\n    function install(){\n      if(!template) return;\n      const clone=SkeletonUtils.clone(template);\n      fit(clone);\n      root.add(clone);\n      if(idleClip){\n        mixer=new THREE.AnimationMixer(clone);\n        const boneMap=buildLobbyBoneMap(clone);\n        const fixedClip=retargetLobbyClip(idleClip,boneMap);\n        if(fixedClip && fixedClip.tracks && fixedClip.tracks.length){ mixer.clipAction(fixedClip,clone).reset().setLoop(THREE.LoopRepeat).play(); }\n      }\n    }\n\n    loaders.load(file("cadesoldier.glb"),g=>{\n      template=g.scene;\n      loaders.load(file("Happy%20Idle.glb"),a=>{\n        idleClip=(a.animations&&a.animations[0])||null;\n        install();\n      },undefined,()=>install());\n    },undefined,()=>{\n      const mat=new THREE.MeshStandardMaterial({color:0x333333,roughness:.65});\n      const body=new THREE.Mesh(new THREE.CapsuleGeometry(.45,1.35,6,12),mat);\n      body.position.y=1.2;\n      const head=new THREE.Mesh(new THREE.SphereGeometry(.32,16,16),new THREE.MeshStandardMaterial({color:0xccaa88}));\n      head.position.y=2.25;\n      root.add(body,head);\n    });\n\n    const clock=new THREE.Clock();\n    function animate(){\n      requestAnimationFrame(animate);\n      const dt=Math.min(clock.getDelta(),0.05);\n      if(mixer) mixer.update(dt);\n      root.position.y=-0.02+Math.sin(performance.now()/720+index)*0.01;\n      resize();\n      renderer.render(scene,camera);\n    }\n    animate();\n    window.addEventListener("resize",resize);\n  });\n};\n';
const __flopOpsModuleScript = document.createElement("script");
__flopOpsModuleScript.type = "module";
__flopOpsModuleScript.textContent = __flopOpsModuleCode;
document.body.appendChild(__flopOpsModuleScript);