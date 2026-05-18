import * as THREE from "three"; 

    import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"; 

    import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js"; 

 

    const MODEL_BASE = "https://cdn.jsdelivr.net/gh/Cadealishus/cades3dmodels@main/"; 

    const RAW_BASE = "https://raw.githubusercontent.com/Cadealishus/cades3dmodels/main/"; 

    const VERSION = "v=fast33"; 

    const file = (name) => MODEL_BASE + name + "?" + VERSION; 

    const rawFile = (name) => RAW_BASE + name + "?" + VERSION; 

 

    const FILES = { 

      soldier: "cadesoldier.glb", 

      scar: "scar.glb", 

      apc: "apclowpolyanimated.glb", 

      map: "nuketownfromcodwarzone.glb", 

      idle: "Happy%20Idle.glb", 

      run: "Jog%20Forward.glb", 

      macarena: "Macarena%20Dance.glb", 

      fpsArms: "fps_saiga_animations.glb", 

      rocket: "rocketprojectile.glb" 

    }; 

 

    const statusEl = document.getElementById("status"); 

    const modeEl = document.getElementById("mode"); 

    const weaponEl = document.getElementById("weapon"); 

    const loadingScreen = document.getElementById("loadingScreen"); 

    const progressInner = document.getElementById("progressInner"); 

    const loadingPercent = document.getElementById("loadingPercent"); 

    const loadingFile = document.getElementById("loadingFile"); 

     

    function hideCutsceneAtStart(){ 

      const overlay = document.getElementById("cutsceneOverlay"); 

      if(overlay){ 

        overlay.classList.remove("active"); 

        overlay.style.display = "none"; 

      } 

 

      const flash = document.getElementById("whiteFlash"); 

      if(flash){ 

        flash.classList.remove("flash"); 

        flash.style.opacity = "0"; 

      } 

    } 

 

    function setStatus(t){ statusEl.textContent = t; } 

    function setMode(t){ modeEl.textContent = t; } 

    function setWeapon(t){ weaponEl.textContent = t; } 

    function setLoading(p,t){ p=Math.max(0,Math.min(100,Math.round(p))); progressInner.style.width=p+"%"; loadingPercent.textContent=p+"%"; loadingFile.textContent=t; } 

    function hideLoading(){ setLoading(100,"ready ✅"); setTimeout(()=>{ loadingScreen.classList.add("hidden"); setTimeout(()=>loadingScreen.style.display="none",400); },350); } 

 

    var hitMarker = null, muzzleFlash = null, lastShotTime = 0; 

    const armsTune = { x:0.12, y:-0.71, z:-0.44, scale:0.85, rotX:0, rotY:180, rotZ:0 }; 

 

    const scene = new THREE.Scene(); 

    scene.background = new THREE.Color(0x9ccfff); 

    scene.fog = new THREE.Fog(0x9ccfff, 80, 260); 

    const camera = new THREE.PerspectiveCamera(65, innerWidth/innerHeight, .05, 1000); 

    scene.add(camera); 

    const renderer = new THREE.WebGLRenderer({ antialias:true }); 

    renderer.setSize(innerWidth, innerHeight); 

    renderer.setPixelRatio(Math.min(devicePixelRatio,2)); 

    renderer.shadowMap.enabled = true; 

    renderer.outputColorSpace = THREE.SRGBColorSpace; 

    document.body.appendChild(renderer.domElement); 

 

    hitMarker = document.createElement("div"); 

    hitMarker.style.position = "fixed"; 

    hitMarker.style.left = "50%"; 

    hitMarker.style.top = "50%"; 

    hitMarker.style.transform = "translate(-50%, -50%)"; 

    hitMarker.style.color = "white"; 

    hitMarker.style.fontSize = "34px"; 

    hitMarker.style.fontWeight = "bold"; 

    hitMarker.style.textShadow = "0 2px 8px black"; 

    hitMarker.style.zIndex = "50"; 

    hitMarker.style.pointerEvents = "none"; 

    hitMarker.style.opacity = "0"; 

    hitMarker.textContent = "×"; 

    document.body.appendChild(hitMarker); 

 

    muzzleFlash = new THREE.PointLight(0xffcc66, 0, 8); 

    muzzleFlash.position.set(0.25, -0.35, -1.45); 

    camera.add(muzzleFlash); 

 

 

    scene.add(new THREE.AmbientLight(0xffffff, 1.5)); 

    scene.add(new THREE.HemisphereLight(0xffffff, 0x555555, 2.8)); 

    const sun = new THREE.DirectionalLight(0xffffff, 4.2); sun.position.set(10,18,8); sun.castShadow=true; scene.add(sun); 

 

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(500,500), new THREE.MeshStandardMaterial({ color:0x4b9b4b, roughness:.9 })); 

    ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground); 

    scene.add(new THREE.GridHelper(500,100,0x223322,0x335533)); 

 

    const loader = new GLTFLoader(); 

    const clock = new THREE.Clock(); 

    const keys = {}; 

    let mpPeer=null, mpRoomCode="", mpEnabled=false, mpIsHost=false, mpLastSend=0; 

    let mpConnections=[]; 

    let mpRemotePlayers=new Map(); 

    let mpLocalName="DOUG_"+Math.floor(Math.random()*9999); 

    let remoteDougTemplate=null; 

    let remoteDougPromise=null; 

 

    let player=null, playerRoot=null, mixer=null, currentAction=null, boneMap=new Map(); 

    let enemy=null, enemyRoot=null, enemyMixer=null, enemyActions={}, enemyCurrent=null, enemyState="idle"; 

    let enemyHealth=100, enemyDead=false, enemyRespawnTimer=0; 

    let scarModel=null; 

    let fpsArms=null, fpsGun=null, fpsArmsMixer=null, fpsArmsActions={}, fpsArmsAction=null; 

    let apc=null, apcRoot=null, inVehicle=false, activeVehicle=null; 

    let mapRoot=null; 

    let mapColliders=[]; 

    let wallColliders=[]; 

    let floorColliders=[]; 

    let mapSolidMeshes=[]; 

    let foundationBlock=null; 

    let rocketBlockade=null, rocketHitbox=null, rocketHealth=100, rocketDead=false; 

    const LOCKED_ROCKET_PLACEMENT = { 

      x: -14.33, 

      y: 3.45, 

      z: 18.14, 

      rotX: 55.1, 

      rotY: 56.7, 

      rotZ: 0.4 

    }; 

    let gameEnded=false, cutsceneStarted=false; 

    const PLAYER_RADIUS=0.34, ENEMY_RADIUS=0.55, APC_RADIUS=2.4; 

    const STEP_HEIGHT=1.95, PLAYER_BODY_HEIGHT=2.2, GRAVITY=24; 

    const actions={}; 

    let yaw=0, cameraPitch=.22, mouseLocked=false; 

    let velocityY=0, onGround=true, wasGroundedLastFrame=true; 

 

    const tuning = { bootLift:1.55, spawnHeight:2.5, targetScale:5.0, cameraDistance:7.0, cameraHeight:3.2 }; 

    const fps = { eyeHeight:2.15, moveSpeed:5.2, sprintSpeed:8.0, strafeSpeed:4.5 }; 

    const enemyTuning = { targetScale:5.0 }; 

    const GROUND_Y=0, BOOT_CLEARANCE=.04; 

 

     

    function preloadModelFiles(){ 

      // Browser-level preload: starts downloads early so later GLTFLoader calls are faster. 

      [ 

        FILES.map, 

        FILES.soldier, 

        FILES.idle, 

        FILES.run, 

        FILES.fpsArms, 

        FILES.apc, 

        FILES.scar, 

        FILES.rocket, 

        FILES.macarena 

      ].forEach(name=>{ 

        try{ 

          const link=document.createElement("link"); 

          link.rel="preload"; 

          link.as="fetch"; 

          link.crossOrigin="anonymous"; 

          link.href=file(name); 

          document.head.appendChild(link); 

        }catch(e){} 

      }); 

    } 

 

 

    async function loadURL(url,label,start,end){ 

      setLoading(start,"loading "+label+"..."); 

      return new Promise((resolve,reject)=>{ 

        loader.load(url, g=>{ setLoading(end,"loaded "+label); resolve(g); }, xhr=>{ 

          if(xhr.lengthComputable){ const q=xhr.loaded/xhr.total; setLoading(start+q*(end-start),"loading "+label+"..."); } 

          else setLoading(Math.min(end-2,start+4),"loading "+label+"..."); 

        }, err=>{ console.warn("Failed loading",label,url,err); reject(err); }); 

      }); 

    } 

    function resolveAssetURLs(name){ 

      if(Array.isArray(name)) return name; 

      return [file(name), rawFile(name)]; 

    } 

 

    async function loadAsset(name,label,start,end){ 

      try { return await loadURL(file(name), label+" CDN", start, end); } 

      catch(e){ console.warn(label+" CDN failed, trying raw", e); return await loadURL(rawFile(name), label+" raw", start, end); } 

    } 

    async function tryLoadAsset(name,label,start,end){ try { return await loadAsset(name,label,start,end); } catch(e){ console.warn(label+" failed; continuing",e); return null; } } 

 

    function makeVisible(obj){ 

      obj.traverse(c=>{ 

        c.visible=true; c.frustumCulled=false; 

        if(c.isMesh || c.isSkinnedMesh){ c.castShadow=true; c.receiveShadow=true; const mats=Array.isArray(c.material)?c.material:[c.material]; mats.forEach(m=>{ if(!m)return; m.visible=true; m.transparent=false; m.opacity=1; m.side=THREE.DoubleSide; m.depthWrite=true; m.needsUpdate=true; }); } 

      }); 

    } 

    function normalizeBoneName(name){ return name.replace(/^mixamorig[:_]?/i,"").replace(/^Armature[_:]?/i,"").replace(/_\d+$/g,"").replace(/\s+/g,"").toLowerCase(); } 

    function buildBoneMap(model){ const map=new Map(); model.traverse(o=>{ if(o.isBone || o.type==="Bone"){ const k=normalizeBoneName(o.name); if(!map.has(k)) map.set(k,o.name); } }); console.log("Bone map",map); return map; } 

    function findBone(model, wanted){ let found=null; const targets=wanted.map(normalizeBoneName); model.traverse(o=>{ if(found) return; if(o.isBone || o.type==="Bone"){ if(targets.includes(normalizeBoneName(o.name))) found=o; } }); return found; } 

    function isRootLikeTrack(n){ n=n.toLowerCase(); return n==="_rootjoint"||n==="rootjoint"||n==="skeleton0"||n==="armature"||n==="scene"; } 

    function retargetClipToModel(clip,map){ 

      const newTracks=[]; let matched=0, skipped=0, missed=0; 

      for(const track of clip.tracks){ 

        const dot=track.name.indexOf("."); if(dot===-1){ skipped++; continue; } 

        const src=track.name.slice(0,dot), prop=track.name.slice(dot); 

        if(isRootLikeTrack(src) || prop.includes(".scale")){ skipped++; continue; } 

        if(prop.includes(".position") && normalizeBoneName(src)!=="hips"){ skipped++; continue; } 

        const target=map.get(normalizeBoneName(src)); 

        if(target){ const t=track.clone(); t.name=target+prop; newTracks.push(t); matched++; } 

        else missed++; 

      } 

      console.log("Retargeted",clip.name,{matched,skipped,missed,finalTracks:newTracks.length}); 

      return new THREE.AnimationClip(clip.name+"_retargeted", clip.duration, newTracks, clip.blendMode); 

    } 

    function firstClip(gltf){ return gltf.animations && gltf.animations.length ? gltf.animations[0] : null; } 

 

    function wrapCenterAndScale(model,targetHeight){ 

      const root=new THREE.Group(); root.add(model); scene.add(root); 

      model.updateMatrixWorld(true); 

      const box=new THREE.Box3().setFromObject(model), size=new THREE.Vector3(), center=new THREE.Vector3(); box.getSize(size); box.getCenter(center); 

      if(isFinite(size.y)&&size.y>0){ model.position.x-=center.x; model.position.z-=center.z; model.position.y-=box.min.y; model.scale.setScalar(targetHeight/size.y); } 

      root.updateMatrixWorld(true); const fb=new THREE.Box3().setFromObject(root); if(isFinite(fb.min.y)) root.position.y-=fb.min.y; 

      return root; 

    } 

    function fitObjectToHeight(obj,targetHeight){ 

      obj.updateMatrixWorld(true); const box=new THREE.Box3().setFromObject(obj), size=new THREE.Vector3(); box.getSize(size); 

      if(isFinite(size.y)&&size.y>0) obj.scale.multiplyScalar(targetHeight/size.y); 

      obj.updateMatrixWorld(true); const b2=new THREE.Box3().setFromObject(obj); if(isFinite(b2.min.y)) obj.position.y-=b2.min.y; 

    } 

 

    function playAction(name,fade=.18,once=false){ const next=actions[name]; if(!next||next===currentAction) return; if(currentAction) currentAction.fadeOut(fade); next.reset().setEffectiveWeight(1).setEffectiveTimeScale(1); if(once){ next.setLoop(THREE.LoopOnce,1); next.clampWhenFinished=true; } else { next.setLoop(THREE.LoopRepeat); next.clampWhenFinished=false; } next.fadeIn(fade).play(); currentAction=next; setStatus(name); } 

    function playEnemy(name,fade=.18){ const next=enemyActions[name]; if(!next||next===enemyCurrent) return; if(enemyCurrent) enemyCurrent.fadeOut(fade); next.reset().setLoop(THREE.LoopRepeat).fadeIn(fade).play(); enemyCurrent=next; enemyState=name; } 

 

    async function loadAnimInto(targetActions,targetMixer,targetModel,targetBoneMap,name,fileName,label,start,end){ 

      const glb=await loadAsset(fileName,label,start,end); const raw=firstClip(glb); if(!raw) return; 

      const fixed=retargetClipToModel(raw,targetBoneMap); targetActions[name]=targetMixer.clipAction(fixed,targetModel); console.log("Action ready",name,fixed.duration); 

    } 

 

    function attachScarToHand(){ 

      if(!player || !scarModel) return; 

      const hand=findBone(player,["RightHand","mixamorig:RightHand","right hand"]); 

      if(!hand){ 

        console.warn("No right hand bone found for SCAR"); 

        scene.add(scarModel); 

        scarModel.position.set(1,1,1); 

        return; 

      } 

 

      scarModel.removeFromParent(); 

      makeVisible(scarModel); 

 

      // Normalize gun size first so it is not GunArm.exe 💀 

      scarModel.updateMatrixWorld(true); 

      const box=new THREE.Box3().setFromObject(scarModel); 

      const size=new THREE.Vector3(); 

      box.getSize(size); 

      const longest=Math.max(size.x,size.y,size.z); 

 

      if(isFinite(longest)&&longest>0){ 

        scarModel.scale.setScalar(0.32); 

      } 

 

      hand.add(scarModel); 

 

      // Local hand offsets. These are the main "hold it instead of become it" numbers. 

      scarModel.position.set(0.20, -0.04, 0.42); 

      scarModel.rotation.set( 

        THREE.MathUtils.degToRad(90), 

        THREE.MathUtils.degToRad(0), 

        THREE.MathUtils.degToRad(90) 

      ); 

 

      console.log("SCAR attached to right hand with V2 offsets", hand.name); 

    } 

 

     

     

    function startGameOverCutscene(){ 

      if(cutsceneStarted) return; 

 

      cutsceneStarted = true; 

      gameEnded = true; 

 

      setStatus("GAME OVER 💀"); 

 

      if(document.exitPointerLock){ 

        document.exitPointerLock(); 

      } 

 

      const flash = document.getElementById("whiteFlash"); 

      if(flash){ 

        flash.classList.remove("flash"); 

        void flash.offsetWidth; 

        flash.classList.add("flash"); 

      } 

 

      setTimeout(()=>{ 

        const overlay = document.getElementById("cutsceneOverlay"); 

        if(overlay){ 

          overlay.style.display = "flex"; 

          overlay.classList.add("active"); 

        } 

      }, 650); 

    } 

 

    function restartMission(){ 

      // Simple mission restart after cutscene. 

      location.reload(); 

    } 

    function addRocketCollider(){ 

      if(!rocketHitbox) return; 

 

      rocketHitbox.updateMatrixWorld(true); 

      const box = new THREE.Box3().setFromObject(rocketHitbox); 

      const size = new THREE.Vector3(); 

      box.getSize(size); 

 

      const item = { 

        box: box.clone(), 

        obj: rocketHitbox, 

        size, 

        type: "wall", 

        isRocketBlockade: true 

      }; 

 

      mapColliders.push(item); 

      wallColliders.push(item); 

      mapSolidMeshes.push(rocketHitbox); 

 

      console.log("Rocket blockade collider added"); 

    } 

 

    async function addRocketBlockade(){ 

      const glb = await tryLoadAsset(FILES.rocket, "rocket blockade", 99, 100); 

 

      rocketBlockade = new THREE.Group(); 

      rocketBlockade.name = "Destructible_Rocket_Blockade"; 

 

      if(glb && glb.scene){ 

        const rocketModel = glb.scene; 

        makeVisible(rocketModel); 

 

        // Normalize model size so it is a big campaign blockade. 

        rocketModel.updateMatrixWorld(true); 

        const box = new THREE.Box3().setFromObject(rocketModel); 

        const size = new THREE.Vector3(); 

        box.getSize(size); 

        const longest = Math.max(size.x, size.y, size.z, 0.001); 

        rocketModel.scale.setScalar(5.2 / longest); 

 

        rocketModel.rotation.set( 

          THREE.MathUtils.degToRad(0), 

          THREE.MathUtils.degToRad(90), 

          THREE.MathUtils.degToRad(90) 

        ); 

 

        rocketBlockade.add(rocketModel); 

      } else { 

        // Fallback if rocketprojectile.glb is not uploaded yet. 

        const fallback = new THREE.Mesh( 

          new THREE.CylinderGeometry(0.55, 0.55, 5.2, 18), 

          new THREE.MeshStandardMaterial({ color:0x444444, metalness:0.3, roughness:0.55 }) 

        ); 

        fallback.rotation.z = Math.PI / 2; 

        fallback.name = "Fallback_Rocket_Blockade"; 

        rocketBlockade.add(fallback); 

      } 

 

      // V30 locked rocket/nuke placement from your coordinate panel. 

      rocketBlockade.position.set( 

        LOCKED_ROCKET_PLACEMENT.x, 

        LOCKED_ROCKET_PLACEMENT.y, 

        LOCKED_ROCKET_PLACEMENT.z 

      ); 

 

      rocketBlockade.rotation.set( 

        THREE.MathUtils.degToRad(LOCKED_ROCKET_PLACEMENT.rotX), 

        THREE.MathUtils.degToRad(LOCKED_ROCKET_PLACEMENT.rotY), 

        THREE.MathUtils.degToRad(LOCKED_ROCKET_PLACEMENT.rotZ) 

      ); 

      scene.add(rocketBlockade); 

 

      // Invisible-but-solid hitbox/collision box. 

      rocketHitbox = new THREE.Mesh( 

        new THREE.BoxGeometry(5.8, 2.4, 2.2), 

        new THREE.MeshBasicMaterial({ 

          color:0xff0000, 

          transparent:true, 

          opacity:0.0, 

          depthWrite:false 

        }) 

      ); 

 

      rocketHitbox.name = "Rocket_Blockade_Solid_Hitbox"; 

      rocketHitbox.position.copy(rocketBlockade.position); 

      rocketHitbox.rotation.copy(rocketBlockade.rotation); 

      rocketHitbox.userData.isRocketHitbox = true; 

      scene.add(rocketHitbox); 

 

      rocketHealth = 100; 

      rocketDead = false; 

 

      addRocketCollider(); 

      console.log("Rocket blockade loaded. Press N to move it, arrow keys to rotate."); 

    } 

 

    function damageRocketBlockade(){ 

      if(rocketDead || !rocketBlockade) return false; 

 

      rocketHealth -= 1; 

      flashHitMarker(false); 

      setStatus("rocket blockade: " + Math.max(0, rocketHealth) + "/100 shots left"); 

 

      // Tiny hit shake 

      rocketBlockade.rotation.z += THREE.MathUtils.degToRad((Math.random() - 0.5) * 4); 

 

      if(rocketHealth <= 0){ 

        explodeRocketBlockade(); 

      } 

 

      return true; 

    } 

 

    function explodeRocketBlockade(){ 

      if(rocketDead) return; 

 

      rocketDead = true; 

      rocketHealth = 0; 

 

      setStatus("rocket blockade destroyed 💥"); 

      broadcastMPGameOver("rocket blockade detonated"); 

      flashHitMarker(true); 

 

      const boom = new THREE.Group(); 

      boom.position.copy(rocketBlockade.position); 

      scene.add(boom); 

 

      const boomLight = new THREE.PointLight(0xffaa33, 12, 35); 

      boom.add(boomLight); 

 

      const boomBall = new THREE.Mesh( 

        new THREE.SphereGeometry(0.4, 20, 20), 

        new THREE.MeshBasicMaterial({ 

          color:0xffaa33, 

          transparent:true, 

          opacity:0.85 

        }) 

      ); 

      boom.add(boomBall); 

 

      let start = performance.now(); 

 

      function animateBoom(){ 

        const t = (performance.now() - start) / 650; 

        if(t >= 1){ 

          boom.removeFromParent(); 

          return; 

        } 

 

        const s = 1 + t * 9; 

        boomBall.scale.setScalar(s); 

        boomBall.material.opacity = 0.85 * (1 - t); 

        boomLight.intensity = 12 * (1 - t); 

 

        requestAnimationFrame(animateBoom); 

      } 

 

      animateBoom(); 

 

      if(rocketBlockade) rocketBlockade.removeFromParent(); 

      if(rocketHitbox) rocketHitbox.removeFromParent(); 

 

      // Remove rocket collider entries. 

      mapColliders = mapColliders.filter(item => !item.isRocketBlockade); 

      wallColliders = wallColliders.filter(item => !item.isRocketBlockade); 

      mapSolidMeshes = mapSolidMeshes.filter(obj => obj !== rocketHitbox); 

 

      rocketBlockade = null; 

      rocketHitbox = null; 

 

      setTimeout(()=>{ 

        startGameOverCutscene(); 

      }, 850); 

    } 

 

    async function addMap(){ 

      const glb=await tryLoadAsset(FILES.map,"Nuketown map",6,16); 

      if(!glb){ 

        // fallback test arena so the game still works if the GLB is not on GitHub yet 

        const mat=new THREE.MeshStandardMaterial({color:0x888888,roughness:.85}); 

        for(let i=0;i<8;i++){ const b=new THREE.Mesh(new THREE.BoxGeometry(6,4,6),mat); b.position.set((i%4)*12-18,2,Math.floor(i/4)*16-12); b.castShadow=b.receiveShadow=true; scene.add(b); } 

        setStatus("map missing, using fallback arena"); 

        return; 

      } 

      mapRoot=glb.scene; 

      makeVisible(mapRoot); 

      scene.add(mapRoot); 

 

      // V6 MAP FIX: 

      // The imported map was way too huge/tall and buildings were eating the street. 

      // Scale by actual footprint instead of height. 

      mapRoot.updateMatrixWorld(true); 

      const mapBox = new THREE.Box3().setFromObject(mapRoot); 

      const mapSize = new THREE.Vector3(); 

      mapBox.getSize(mapSize); 

 

      const targetMapFootprint = 145; // V7: bigger map, fixed jump, real Saiga FPS arms + shooting + hands closer + syntax checked + locked FPS arms + locked nuke position + no nuke tabs model, not tiny toy town 

      const footprint = Math.max(mapSize.x, mapSize.z, 0.001); 

      const mapAutoScale = targetMapFootprint / footprint; 

 

      mapRoot.scale.setScalar(mapAutoScale); 

      mapRoot.rotation.set(0, 0, 0); 

      mapRoot.position.set(0, 0, 0); 

      snapObjectToGround(mapRoot, 0); 

      addFoundationBlock(); 

      rebuildMapColliders(); 

 

      console.log("Map V21 footprint scale:", mapAutoScale, "original size:", mapSize); 

      setStatus("map ready + rocket blockade"); 

    } 

 

    async function addAPC(){ 

      const glb=await tryLoadAsset(FILES.apc,"APC",16,25); 

      if(!glb) return; 

 

      apc=glb.scene; 

      makeVisible(apc); 

 

      // Auto-scale by LENGTH instead of height so it stops being a Hot Wheels APC. 

      apc.updateMatrixWorld(true); 

      const apcBoxBefore = new THREE.Box3().setFromObject(apc); 

      const apcSizeBefore = new THREE.Vector3(); 

      apcBoxBefore.getSize(apcSizeBefore); 

 

      const targetApcLength = 8.5; 

      const apcCurrentLength = Math.max(apcSizeBefore.x, apcSizeBefore.z, 0.001); 

      const apcAutoScale = targetApcLength / apcCurrentLength; 

      apc.scale.setScalar(apcAutoScale); 

 

      apcRoot=new THREE.Group(); 

      apcRoot.add(apc); 

      scene.add(apcRoot); 

 

      apcRoot.position.set(4,0,-8); 

      apcRoot.rotation.y=Math.PI*0.15; 

      apcRoot.userData={ speed:0, turn:0, type:"apc" }; 

 

      snapObjectToGround(apcRoot,0); 

      console.log("APC auto scale fixed:", apcAutoScale); 

    } 

 

    async function loadPlayer(){ 

      const modelGLB=await loadAsset(FILES.soldier,"soldier",18,45); 

      player=modelGLB.scene; makeVisible(player); playerRoot=wrapCenterAndScale(player,tuning.targetScale); 

      player.rotation.x=Math.PI/2; 

      playerRoot.position.set(0, getSafeSpawnY(0, 14), 14); 

      boneMap=buildBoneMap(player); mixer=new THREE.AnimationMixer(player); 

 

      // Load animations in parallel instead of idle -> run -> macarena. 

      await Promise.all([ 

        loadAnimInto(actions,mixer,player,boneMap,"idle",FILES.idle,"idle animation",45,55), 

        loadAnimInto(actions,mixer,player,boneMap,"run",FILES.run,"run animation",55,65), 

        loadAnimInto(actions,mixer,player,boneMap,"macarena",FILES.macarena,"Macarena animation",65,72) 

      ]); 

 

      mixer.addEventListener("finished",()=>playAction("idle")); 

      playAction("idle",.1); 

    } 

 

    async function addEnemy(){ 

      // Extras load after playable, so enemy can take its time. 

      const glb=await loadAsset(FILES.soldier,"enemy soldier clone",72,78); 

      enemy=glb.scene; makeVisible(enemy); enemyRoot=wrapCenterAndScale(enemy,enemyTuning.targetScale); 

      enemy.rotation.x=Math.PI/2; enemyRoot.position.set(-18, getSafeSpawnY(-18, -14), -14); 

      const eMap=buildBoneMap(enemy); enemyMixer=new THREE.AnimationMixer(enemy); 

 

      await Promise.all([ 

        loadAnimInto(enemyActions,enemyMixer,enemy,eMap,"idle",FILES.idle,"enemy idle",78,84), 

        loadAnimInto(enemyActions,enemyMixer,enemy,eMap,"run",FILES.run,"enemy run",84,90) 

      ]); 

 

      playEnemy("idle",.1); 

    } 

 

    async function addWeapon(){ 

      const glb=await tryLoadAsset(FILES.scar,"SCAR",96,99); if(!glb) return; 

      scarModel=glb.scene; attachScarToHand(); setWeapon("SCAR"); 

    } 

 

    function setPlayerFPSVisibility(){ 

      // TRUE FPS BODY FIX: 

      // Hide the soldier body/face every frame so the camera does not stare at his forehead. 

      if(player){ 

        player.traverse((child)=>{ 

          if(child.isMesh || child.isSkinnedMesh){ 

            child.visible = false; 

            child.frustumCulled = false; 

          } 

        }); 

      } 

 

      // Keep the SCAR visible in walking mode, hide it while driving. 

      if(scarModel){ 

        scarModel.visible = !inVehicle; 

        scarModel.traverse((c)=>{ 

          if(c.isMesh || c.isSkinnedMesh){ 

            c.visible = !inVehicle; 

            c.frustumCulled = false; 

            if(c.material){ 

              const mats = Array.isArray(c.material) ? c.material : [c.material]; 

              mats.forEach((m)=>{ 

                if(!m) return; 

                m.visible = true; 

                m.transparent = false; 

                m.opacity = 1; 

                m.needsUpdate = true; 

              }); 

            } 

          } 

        }); 

      } 

    } 

 

     

    function applyArmsTune(){ 

      if(!fpsArms) return; 

 

      fpsArms.position.set(armsTune.x, armsTune.y, armsTune.z); 

      fpsArms.rotation.set( 

        THREE.MathUtils.degToRad(armsTune.rotX), 

        THREE.MathUtils.degToRad(armsTune.rotY), 

        THREE.MathUtils.degToRad(armsTune.rotZ) 

      ); 

      fpsArms.scale.setScalar(armsTune.scale); 

    } 

 

    async function makeFPSArms(){ 

      // V9: use your real fps_saiga_animations.glb instead of the blocky backup arms. 

      if(fpsArms){ 

        camera.remove(fpsArms); 

        fpsArms = null; 

      } 

 

      const glb = await tryLoadAsset(FILES.fpsArms, "FPS Saiga arms", 99, 100); 

 

      if(!glb){ 

        console.warn("fps_saiga_animations.glb missing from GitHub, using no FPS arms"); 

        return; 

      } 

 

      fpsArms = glb.scene; 

      fpsArms.name = "FPS_Saiga_Arms_Model"; 

      makeVisible(fpsArms); 

 

      // Attach to camera so it behaves like a real FPS viewmodel. 

      camera.add(fpsArms); 

 

      // Main viewmodel tuning. 

      // These are the numbers to tweak if the gun is too close/far/low. 

      applyArmsTune(); 

 

      fpsArms.traverse((c)=>{ 

        if(c.isMesh || c.isSkinnedMesh){ 

          c.frustumCulled = false; 

          c.castShadow = false; 

          c.receiveShadow = false; 

        } 

      }); 

 

      if(glb.animations && glb.animations.length){ 

        fpsArmsMixer = new THREE.AnimationMixer(fpsArms); 

 

        glb.animations.forEach((clip, i)=>{ 

          const action = fpsArmsMixer.clipAction(clip); 

          const key = (clip.name || ("anim_" + i)).toLowerCase(); 

          fpsArmsActions[key] = action; 

          if(i === 0){ 

            fpsArmsAction = action; 

            action.reset().setLoop(THREE.LoopRepeat).play(); 

          } 

        }); 

 

        console.log("FPS Saiga animations loaded:", Object.keys(fpsArmsActions)); 

      } 

 

      console.log("FPS Saiga arms added"); 

    } 

 

    function updateFPSArms(delta){ 

      if(fpsArmsMixer) fpsArmsMixer.update(delta); 

      if(!fpsArms) return; 

 

      fpsArms.visible = !inVehicle; 

 

      // Tiny viewmodel bob/sway. 

      const moving = keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD; 

      const t = clock.elapsedTime; 

      const bob = moving ? Math.sin(t * 10) * 0.018 : Math.sin(t * 2) * 0.004; 

 

      fpsArms.position.y = armsTune.y + bob; 

      fpsArms.rotation.x = THREE.MathUtils.degToRad(armsTune.rotX) + cameraPitch * 0.04; 

    } 

 

     

    function mpSetStatus(msg){ 

      const el=document.getElementById("mpStatus"); 

      if(el)el.textContent=msg; 

      console.log("MP:",msg); 

    } 

    function mpSafeRoomId(room){ 

      return ("cadeops_"+room).replace(/[^a-zA-Z0-9_-]/g,"_").slice(0,48); 

    } 

    function setupMultiplayerUI(){ 

      const roomInput=document.getElementById("mpRoomInput"); 

      const hostBtn=document.getElementById("mpHostBtn"); 

      const joinBtn=document.getElementById("mpJoinBtn"); 

      const leaveBtn=document.getElementById("mpLeaveBtn"); 

      const hideBtn=document.getElementById("mpHideBtn"); 

      if(hostBtn&&!hostBtn._wired){hostBtn._wired=true;hostBtn.onclick=()=>hostMultiplayer((roomInput.value||"cade-room").trim()||"cade-room");} 

      if(joinBtn&&!joinBtn._wired){joinBtn._wired=true;joinBtn.onclick=()=>joinMultiplayer((roomInput.value||"cade-room").trim()||"cade-room");} 

      if(leaveBtn&&!leaveBtn._wired){leaveBtn._wired=true;leaveBtn.onclick=()=>leaveMultiplayer(true);} 

      if(hideBtn&&!hideBtn._wired){hideBtn._wired=true;hideBtn.onclick=()=>{const p=document.getElementById("mpPanel");if(p)p.style.display="none";};} 

    } 

    function hostMultiplayer(room){ 

      if(typeof Peer==="undefined"){mpSetStatus("PeerJS did not load");return;} 

      leaveMultiplayer(false); 

      mpRoomCode=room;mpIsHost=true;mpEnabled=true; 

      const id=mpSafeRoomId(room); 

      mpSetStatus("hosting...\nroom: "+room+"\nid: "+id); 

      mpPeer=new Peer(id,{debug:1}); 

      mpPeer.on("open",peerId=>mpSetStatus("HOST ONLINE\nroom: "+room+"\nid: "+peerId+"\nplayers: 1")); 

      mpPeer.on("connection",conn=>setupConnection(conn)); 

      mpPeer.on("error",err=>mpSetStatus("HOST ERROR:\n"+(err&&err.message?err.message:err))); 

    } 

    function joinMultiplayer(room){ 

      if(typeof Peer==="undefined"){mpSetStatus("PeerJS did not load");return;} 

      leaveMultiplayer(false); 

      mpRoomCode=room;mpIsHost=false;mpEnabled=true; 

      const hostId=mpSafeRoomId(room); 

      mpSetStatus("joining...\nroom: "+room+"\nhost: "+hostId); 

      mpPeer=new Peer(undefined,{debug:1}); 

      mpPeer.on("open",id=>{ 

        const conn=mpPeer.connect(hostId,{reliable:false}); 

        setupConnection(conn); 

        mpSetStatus("JOINING\nmy id: "+id+"\nroom: "+room); 

      }); 

      mpPeer.on("error",err=>mpSetStatus("JOIN ERROR:\n"+(err&&err.message?err.message:err))); 

    } 

    function setupConnection(conn){ 

      if(!conn)return; 

      conn.on("open",()=>{ 

        if(!mpConnections.includes(conn))mpConnections.push(conn); 

        try{conn.send({type:"hello",id:(mpPeer&&mpPeer.id)||mpLocalName,name:mpLocalName});}catch(e){} 

        mpSetStatus((mpIsHost?"HOST":"JOIN")+" connected\nroom: "+mpRoomCode+"\npeers: "+mpConnections.length); 

      }); 

      conn.on("data",data=>handleMPData(conn,data)); 

      conn.on("close",()=>removeConnection(conn)); 

      conn.on("error",()=>removeConnection(conn)); 

    } 

    function removeConnection(conn){ 

      mpConnections=mpConnections.filter(c=>c!==conn); 

      for(const [id,remote] of mpRemotePlayers.entries()){ 

        if(remote.conn===conn){ 

          if(remote.root)remote.root.removeFromParent(); 

          mpRemotePlayers.delete(id); 

        } 

      } 

      mpSetStatus("peer disconnected\npeers: "+mpConnections.length); 

    } 

    function leaveMultiplayer(showStatus=true){ 

      mpEnabled=false;mpIsHost=false; 

      mpConnections.forEach(c=>{try{c.close();}catch(e){}}); 

      mpConnections=[]; 

      if(mpPeer){try{mpPeer.destroy();}catch(e){}} 

      mpPeer=null; 

      for(const remote of mpRemotePlayers.values()){if(remote.root)remote.root.removeFromParent();} 

      mpRemotePlayers.clear(); 

      if(showStatus)mpSetStatus("offline"); 

    } 

 

    function broadcastMPGameOver(reason="rocket blockade detonated"){ 

      if(!mpEnabled || !mpConnections.length) return; 

      const data={type:"gameover",id:(mpPeer&&mpPeer.id)||mpLocalName,name:mpLocalName,reason}; 

      mpConnections.forEach(c=>{ if(c&&c.open){ try{c.send(data);}catch(e){} } }); 

    } 

 

    function triggerRemoteGameOver(reason="rocket blockade detonated"){ 

      if(cutsceneStarted) return; 

      setStatus("remote game over: "+reason); 

      startGameOverCutscene(); 

    } 

 

 

    function handleMPData(conn,data){ 

      if(!data||typeof data!=="object")return; 

      const myId=(mpPeer&&mpPeer.id)||mpLocalName; 

      if(data.id&&data.id===myId)return; // do not draw yourself 

      if(data.type==="gameover"){ 

        triggerRemoteGameOver(data.reason||"rocket blockade detonated"); 

        if(mpIsHost){ 

          mpConnections.forEach(c=>{if(c!==conn&&c.open){try{c.send(data);}catch(e){}}}); 

        } 

        return; 

      } 

      if(data.type==="hello"){ 

        mpSetStatus("connected with:\n"+(data.name||data.id||"player")+"\npeers: "+mpConnections.length); 

        return; 

      } 

      if(data.type==="state"){ 

        updateRemotePlayer(conn,data); 

        if(mpIsHost){ 

          mpConnections.forEach(c=>{if(c!==conn&&c.open){try{c.send(data);}catch(e){}}}); 

        } 

      } 

    } 

 

    async function loadRemoteDougTemplate(){ 

      if(remoteDougTemplate) return remoteDougTemplate; 

      if(remoteDougPromise) return remoteDougPromise; 

      remoteDougPromise = loadAsset(FILES.soldier, "remote Doug model", 90, 93).then(glb=>{ 

        remoteDougTemplate = glb.scene; 

        makeVisible(remoteDougTemplate); 

        remoteDougTemplate.removeFromParent(); 

        return remoteDougTemplate; 

      }).catch(err=>{ 

        console.warn("Remote Doug template failed; using fallback", err); 

        return null; 

      }); 

      return remoteDougPromise; 

    } 

 

    function fitRemoteDougModel(model){ 

      makeVisible(model); 

      model.rotation.x = Math.PI / 2; 

      model.updateMatrixWorld(true); 

      const box = new THREE.Box3().setFromObject(model); 

      const size = new THREE.Vector3(); 

      const center = new THREE.Vector3(); 

      box.getSize(size); 

      box.getCenter(center); 

      model.position.x -= center.x; 

      model.position.z -= center.z; 

      model.position.y -= box.min.y; 

      const h = Math.max(size.x, size.y, size.z, 0.001); 

      model.scale.setScalar(2.05 / h); 

      model.traverse(c=>{ 

        if(c.isMesh || c.isSkinnedMesh){ 

          c.visible = true; 

          c.frustumCulled = false; 

          c.castShadow = true; 

          c.receiveShadow = true; 

        } 

      }); 

    } 

 

    function installDougOnRemoteRoot(root, name){ 

      loadRemoteDougTemplate().then(template=>{ 

        if(!template || !root || !root.parent) return; 

        if(root.userData.fallback) root.userData.fallback.removeFromParent(); 

        const clone = SkeletonUtils.clone(template); 

        clone.name = "Remote_Doug_Model_" + name; 

        fitRemoteDougModel(clone); 

        root.add(clone); 

        root.userData.dougModel = clone; 

      }); 

    } 

 

 

    function makeRemotePlayerModel(name="DOUG"){ 

      const root=new THREE.Group(); 

      root.name="Remote_Doug_Player_"+name; 

 

      const fallback=new THREE.Group(); 

      fallback.name="Temporary_Remote_Doug_Loading_Body"; 

 

      const bodyMat=new THREE.MeshStandardMaterial({color:0x6b5b45,roughness:.8}); 

      const vestMat=new THREE.MeshStandardMaterial({color:0x222222,roughness:.8}); 

      const headMat=new THREE.MeshStandardMaterial({color:0xffcc99,roughness:.75}); 

 

      const body=new THREE.Mesh(new THREE.CapsuleGeometry(.38,1.15,5,12),bodyMat); 

      body.position.y=1.05; body.castShadow=true; body.receiveShadow=true; fallback.add(body); 

 

      const vest=new THREE.Mesh(new THREE.BoxGeometry(.82,.82,.28),vestMat); 

      vest.position.y=1.25; vest.castShadow=true; fallback.add(vest); 

 

      const head=new THREE.Mesh(new THREE.SphereGeometry(.26,16,16),headMat); 

      head.position.y=1.92; head.castShadow=true; fallback.add(head); 

 

      root.add(fallback); 

      root.userData.fallback=fallback; 

      root.userData.targetPos=new THREE.Vector3(); 

      root.userData.targetYaw=0; 

      scene.add(root); 

 

      installDougOnRemoteRoot(root,name); 

 

      return root; 

    } 

    function updateRemotePlayer(conn,data){ 

      const id=data.id||(conn&&conn.peer)||"remote"; 

      let remote=mpRemotePlayers.get(id); 

      if(!remote){ 

        remote={conn,root:makeRemotePlayerModel(data.name||"DOUG")}; 

        mpRemotePlayers.set(id,remote); 

      } 

      const p=data.p||{}; 

      remote.root.userData.targetPos.set(Number(p.x||0),Number(p.y||0),Number(p.z||0)); 

      remote.root.userData.targetYaw=Number(data.yaw||0); 

    } 

    function updateRemotePlayers(delta){ 

      for(const remote of mpRemotePlayers.values()){ 

        const root=remote.root; 

        if(!root)continue; 

        root.position.lerp(root.userData.targetPos,Math.min(1,delta*12)); 

        root.rotation.y=THREE.MathUtils.lerp(root.rotation.y,root.userData.targetYaw,Math.min(1,delta*12)); 

      } 

    } 

    function sendMPState(){ 

      if(!mpEnabled||!playerRoot||!mpConnections.length)return; 

      const now=performance.now(); 

      if(now-mpLastSend<55)return; 

      mpLastSend=now; 

      const p=(typeof getPlayerWorldPos==="function")?getPlayerWorldPos():playerRoot.position; 

      const data={type:"state",id:(mpPeer&&mpPeer.id)||mpLocalName,name:mpLocalName,p:{x:+p.x.toFixed(3),y:+p.y.toFixed(3),z:+p.z.toFixed(3)},yaw:+yaw.toFixed(4),inVehicle:!!inVehicle}; 

      mpConnections.forEach(c=>{if(c&&c.open){try{c.send(data);}catch(e){}}}); 

    } 

 

    async function start(){ 

      try{ 

        hideCutsceneAtStart(); 

        setupMultiplayerUI(); 

        preloadModelFiles(); 

 

        setStatus("fast loading map + player..."); 

        setLoading(4, "starting fast load..."); 

 

        // Load must-have stuff together instead of one-at-a-time. 

        await Promise.all([ 

          addMap(), 

          loadPlayer() 

        ]); 

 

        setPlayerFPSVisibility(); 

        updateCamera(); 

 

        // Player can start looking around sooner. 

        setStatus("playable - extras loading..."); 

        hideLoading(); 

 

        // Load extras after the game is already visible. 

        Promise.allSettled([ 

          addRocketBlockade(), 

          addAPC(), 

          addEnemy(), 

          addWeapon(), 

          makeFPSArms(), 

          loadRemoteDougTemplate() 

        ]).then(()=>{ 

          setPlayerFPSVisibility(); 

          setStatus("ready - multiplayer + extras loaded 😏"); 

        }).catch(err=>{ 

          console.warn("Fast-load extras warning", err); 

          setStatus("playable - some extras failed"); 

        }); 

 

      }catch(err){ 

        console.error(err); 

        setStatus("FAILED - check console 😭"); 

        loadingFile.textContent="FAILED — check console"; 

      } 

    } 

 

    function keepRootOnGround(root){ 

      if(!root) return; root.updateMatrixWorld(true); const box=new THREE.Box3().setFromObject(root); if(!isFinite(box.min.y)) return; 

      const target=GROUND_Y+BOOT_CLEARANCE+tuning.bootLift; 

      if(box.min.y<target) root.position.y += target-box.min.y; 

    } 

    function keepBootsOnGround(){ 

      if(!playerRoot || inVehicle) return; 

 

      if(playerRoot.position.y < -30){ 

        playerRoot.position.y = getSafeSpawnY(playerRoot.position.x, playerRoot.position.z); 

        velocityY = 0; 

        onGround = true; 

        setStatus("rescued from void 💀"); 

      } 

    } 

 

    function dist2D(a,b){ const dx=a.x-b.x, dz=a.z-b.z; return Math.sqrt(dx*dx+dz*dz); } 

    function snapObjectToGround(obj, groundY=0){ 

      if(!obj) return; 

      obj.updateMatrixWorld(true); 

      const box = new THREE.Box3().setFromObject(obj); 

      if(!isFinite(box.min.y)) return; 

      obj.position.y += groundY - box.min.y; 

    } 

 

     

    function addFoundationBlock(){ 

      // V21: reliable safety floor under the whole game. 

      if(foundationBlock){ 

        foundationBlock.removeFromParent(); 

        foundationBlock = null; 

      } 

 

      let centerX = 0, centerZ = 0; 

      let width = 280, depth = 280; 

      let topY = 0; 

 

      if(mapRoot){ 

        mapRoot.updateMatrixWorld(true); 

        const mapBox = new THREE.Box3().setFromObject(mapRoot); 

        const mapSize = new THREE.Vector3(); 

        const mapCenter = new THREE.Vector3(); 

        mapBox.getSize(mapSize); 

        mapBox.getCenter(mapCenter); 

 

        centerX = mapCenter.x; 

        centerZ = mapCenter.z; 

        width = Math.max(280, mapSize.x + 50); 

        depth = Math.max(280, mapSize.z + 50); 

      } 

 

      const thickness = 2.0; 

      foundationBlock = new THREE.Mesh( 

        new THREE.BoxGeometry(width, thickness, depth), 

        new THREE.MeshStandardMaterial({ 

          color: 0x226622, 

          roughness: 0.95, 

          transparent: true, 

          opacity: 0.12 

        }) 

      ); 

 

      foundationBlock.name = "V21_Giant_Solid_Foundation_Block"; 

      foundationBlock.position.set(centerX, topY - thickness / 2, centerZ); 

      foundationBlock.receiveShadow = true; 

      foundationBlock.castShadow = false; 

      foundationBlock.userData.isFoundation = true; 

      scene.add(foundationBlock); 

 

      console.log("V21 foundation added", { width, depth, topY, centerX, centerZ }); 

    } 

 

    function addCollider(box, obj, type){ 

      const size = new THREE.Vector3(); 

      box.getSize(size); 

 

      const item = { 

        box: box.clone(), 

        obj, 

        size, 

        type 

      }; 

 

      mapColliders.push(item); 

 

      if(type === "wall") wallColliders.push(item); 

      if(type === "floor") floorColliders.push(item); 

    } 

 

    function rebuildMapColliders(){ 

      mapColliders = []; 

      wallColliders = []; 

      floorColliders = []; 

      mapSolidMeshes = []; 

 

      if(mapRoot){ 

        mapRoot.updateMatrixWorld(true); 

 

        mapRoot.traverse((obj)=>{ 

          if(!(obj.isMesh || obj.isSkinnedMesh)) return; 

 

          obj.updateMatrixWorld(true); 

          obj.visible = true; 

          obj.frustumCulled = false; 

 

          const box = new THREE.Box3().setFromObject(obj); 

          if(!isFinite(box.min.x) || !isFinite(box.max.x)) return; 

 

          const size = new THREE.Vector3(); 

          box.getSize(size); 

 

          // Skip only tiny garbage. 

          if(size.x < 0.08 || size.z < 0.08) return; 

 

          // Thin pieces act like floors/ramps/stairs. Tall pieces act like walls. 

          const type = size.y < 0.40 ? "floor" : "wall"; 

          addCollider(box, obj, type); 

          mapSolidMeshes.push(obj); 

        }); 

      } 

 

      // Add the giant foundation as a real floor collider. 

      if(foundationBlock){ 

        foundationBlock.updateMatrixWorld(true); 

        const fBox = new THREE.Box3().setFromObject(foundationBlock); 

        addCollider(fBox, foundationBlock, "floor"); 

        mapSolidMeshes.push(foundationBlock); 

      } 

 

      console.log("V21 COLLISION:", { 

        total: mapColliders.length, 

        walls: wallColliders.length, 

        floors: floorColliders.length 

      }); 

    } 

 

    function circleOverlapsBoxXZ(pos, radius, box){ 

      return ( 

        pos.x > box.min.x - radius && 

        pos.x < box.max.x + radius && 

        pos.z > box.min.z - radius && 

        pos.z < box.max.z + radius 

      ); 

    } 

 

     

    function getGLBFloorHit(pos, radius){ 

      if(!mapSolidMeshes || !mapSolidMeshes.length) return null; 

 

      // V23: 

      // Real GLB floor collision. Cast down onto the actual model triangles, 

      // not just bounding boxes. This makes thin GLB floors work. 

      const origin = new THREE.Vector3(pos.x, pos.y + 6.0, pos.z); 

      glbFloorRaycaster.set(origin, new THREE.Vector3(0, -1, 0)); 

      glbFloorRaycaster.far = 16.0; 

 

      const hits = glbFloorRaycaster.intersectObjects(mapSolidMeshes, true); 

 

      for(const hit of hits){ 

        if(!hit || !hit.point) continue; 

 

        const y = hit.point.y; 

 

        // Ignore surfaces too far above or way below current body. 

        if(y > pos.y + STEP_HEIGHT + 0.65) continue; 

        if(y < pos.y - 8.0) continue; 

 

        // Prefer upward-facing surfaces: floors, ramps, stairs. 

        if(hit.face){ 

          const normal = hit.face.normal.clone(); 

          normal.transformDirection(hit.object.matrixWorld); 

 

          if(normal.y < 0.24) continue; 

        } 

 

        return hit; 

      } 

 

      return null; 

    } 

 

    function getSpawnFloorY(x, z){ 

      // Spawn uses a very high raycast so if the player starts slightly wrong, 

      // they still land on the actual GLB map instead of the void. 

      if(!mapSolidMeshes || !mapSolidMeshes.length) return 0; 

 

      glbFloorRaycaster.set( 

        new THREE.Vector3(x, 80, z), 

        new THREE.Vector3(0, -1, 0) 

      ); 

      glbFloorRaycaster.far = 180; 

 

      const hits = glbFloorRaycaster.intersectObjects(mapSolidMeshes, true); 

 

      for(const hit of hits){ 

        if(!hit || !hit.point) continue; 

 

        if(hit.face){ 

          const normal = hit.face.normal.clone(); 

          normal.transformDirection(hit.object.matrixWorld); 

          if(normal.y < 0.24) continue; 

        } 

 

        // Avoid absurd roof spawns. For this map, street/floor height is usually low. 

        if(hit.point.y <= 8){ 

          return hit.point.y; 

        } 

      } 

 

      return 0; 

    } 

 

    function getGroundYAt(pos, radius){ 

      let bestY = -Infinity; 

 

      // 1) Real GLB triangle floor collision. 

      // This is the main fix for floors that are thin/odd GLB meshes. 

      const glbHit = getGLBFloorHit(pos, radius); 

      if(glbHit){ 

        bestY = Math.max(bestY, glbHit.point.y); 

      } 

 

      // 2) AABB fallback for foundation block, simple block stairs, and chunky objects. 

      for(const item of mapColliders){ 

        const box = item.box; 

 

        if(!circleOverlapsBoxXZ(pos, radius * 0.75, box)) continue; 

 

        const top = box.max.y; 

 

        if(top <= pos.y + STEP_HEIGHT + 0.65 && top >= pos.y - 20){ 

          if(top > bestY) bestY = top; 

        } 

      } 

 

      if(bestY === -Infinity) return 0; 

      return bestY; 

    } 

 

    function getSafeSpawnY(x, z){ 

      // Spawn a little in the air above the real GLB floor, 

      // then gravity settles the player onto it. 

      const y = getSpawnFloorY(x, z); 

 

      if(y > 8) return 2.2; 

      return Math.max(2.2, y + 1.25); 

    } 

 

     

    function objectHasWalkableSurfaceAt(pos, item, radius){ 

      if(!item || !item.obj) return false; 

 

      // V24 INSIDE STAIR FIX: 

      // Some inside stairs are one big mesh. The bounding box says "wall", 

      // but the real triangles have step/tread surfaces. Check that exact object. 

      const obj = item.obj; 

 

      if(!(obj.isMesh || obj.isSkinnedMesh)) return false; 

 

      stairRaycaster.set( 

        new THREE.Vector3(pos.x, pos.y + STEP_HEIGHT + 2.2, pos.z), 

        new THREE.Vector3(0, -1, 0) 

      ); 

      stairRaycaster.far = STEP_HEIGHT + 3.8; 

 

      const hits = stairRaycaster.intersectObject(obj, true); 

 

      for(const hit of hits){ 

        if(!hit || !hit.point) continue; 

 

        const y = hit.point.y; 

 

        // Surface must be close enough to step onto. 

        if(y < pos.y - 0.75) continue; 

        if(y > pos.y + STEP_HEIGHT + 0.45) continue; 

 

        // Surface must be floor/stair-like, not a vertical wall face. 

        if(hit.face){ 

          const normal = hit.face.normal.clone(); 

          normal.transformDirection(hit.object.matrixWorld); 

 

          // Be slightly forgiving because imported stair normals can be messy. 

          if(normal.y < 0.24) continue; 

        } 

 

        return true; 

      } 

 

      return false; 

    } 

 

    function bodyHitsWall(pos, radius, bodyHeight=PLAYER_BODY_HEIGHT){ 

      const feetY = pos.y + 0.12; 

      const headY = pos.y + bodyHeight; 

 

      for(const item of wallColliders){ 

        const box = item.box; 

 

        if(!circleOverlapsBoxXZ(pos, radius, box)) continue; 

 

        // If the top of this block is step-able, it is a stair/curb, not a wall. 

        if(box.max.y > pos.y - 0.15 && box.max.y <= pos.y + STEP_HEIGHT){ 

          continue; 

        } 

 

        // Vertical overlap = wall collision... 

        // unless this "wall" is actually a giant inside stair mesh with walkable treads. 

        if(headY > box.min.y && feetY < box.max.y){ 

          if(objectHasWalkableSurfaceAt(pos, item, radius)){ 

            continue; 

          } 

          return true; 

        } 

      } 

 

      return false; 

    } 

 

     

    const stairRaycaster = new THREE.Raycaster(); 

    const glbFloorRaycaster = new THREE.Raycaster(); 

 

    function findStairSurfaceAt(x, z, baseY, radius){ 

      if(!mapSolidMeshes || !mapSolidMeshes.length) return null; 

 

      // Shoot downward from above the point we are trying to move into. 

      // This reads the REAL triangle surface of the stairs, not just its huge box. 

      const origin = new THREE.Vector3(x, baseY + STEP_HEIGHT + 3.0, z); 

      stairRaycaster.set(origin, new THREE.Vector3(0, -1, 0)); 

      stairRaycaster.far = STEP_HEIGHT + 5.2; 

 

      const hits = stairRaycaster.intersectObjects(mapSolidMeshes, true); 

 

      for(const hit of hits){ 

        const y = hit.point.y; 

 

        // Don't use ceilings or giant roofs. 

        if(y < baseY - 0.85) continue; 

        if(y > baseY + STEP_HEIGHT + 0.55) continue; 

 

        // Need mostly-upward surface, not a vertical wall face. 

        if(hit.face){ 

          const normal = hit.face.normal.clone(); 

          normal.transformDirection(hit.object.matrixWorld); 

          if(normal.y < 0.24) continue; 

        } 

 

        return hit; 

      } 

 

      return null; 

    } 

 

    function tryStairAssist(pos, radius, oldY){ 

      // Check the actual ground/stair surface under the new XZ. 

      const hit = findStairSurfaceAt(pos.x, pos.z, oldY, radius); 

      if(!hit) return false; 

 

      const stepY = hit.point.y; 

 

      if(stepY < oldY - 0.55 || stepY > oldY + STEP_HEIGHT + 0.30){ 

        return false; 

      } 

 

      const previousY = pos.y; 

      pos.y = stepY; 

 

      // Make sure the player's body has room at the new step height. 

      if(bodyHitsWall(pos, radius)){ 

        pos.y = previousY; 

        return false; 

      } 

 

      velocityY = Math.max(0, velocityY); 

      onGround = true; 

      return true; 

    } 

 

    function resolveHorizontal(root, dx, dz, radius){ 

      const pos = root.position; 

 

      function tryAxis(axis, amount){ 

        if(amount === 0) return; 

 

        const oldAxis = pos[axis]; 

        const oldY = pos.y; 

 

        pos[axis] += amount; 

 

        if(!bodyHitsWall(pos, radius)){ 

          // Even when not blocked, let stairs/ramp surface lift us gently. 

          if(velocityY <= 0.2){ 

            tryStairAssist(pos, radius, oldY); 

          } 

          return; 

        } 

 

        // NEW V22 STAIR ASSIST: 

        // If a whole staircase is one giant mesh, the AABB says "wall". 

        // Before rejecting the move, raycast the actual step surface ahead. 

        pos.y = oldY; 

 

        if(velocityY <= 0.2 && tryStairAssist(pos, radius, oldY)){ 

          if(!bodyHitsWall(pos, radius)){ 

            return; 

          } 

        } 

 

        // Old blocky step-up fallback. 

        pos.y = oldY + STEP_HEIGHT; 

 

        if(!bodyHitsWall(pos, radius)){ 

          return; 

        } 

 

        // Nope, it is a real wall. Revert. 

        pos[axis] = oldAxis; 

        pos.y = oldY; 

      } 

 

      tryAxis("x", dx); 

      tryAxis("z", dz); 

    } 

 

    function applyGravityAndVerticalCollision(root, delta, radius){ 

      if(!root) return; 

 

      velocityY -= GRAVITY * delta; 

      root.position.y += velocityY * delta; 

 

      const groundY = getGroundYAt(root.position, radius); 

 

      if(root.position.y <= groundY && velocityY <= 0){ 

        root.position.y = groundY; 

        velocityY = 0; 

        onGround = true; 

      } else { 

        onGround = false; 

      } 

 

      // If somehow stuck in a wall, lift up a bit. 

      let safety = 0; 

      while(bodyHitsWall(root.position, radius) && safety < 18){ 

        root.position.y += 0.1; 

        safety++; 

      } 

    } 

 

    function moveWithMapCollision(root, dx, dz, radius){ 

      if(!root) return; 

      resolveHorizontal(root, dx, dz, radius); 

    } 

    function getPlayerWorldPos(){ return inVehicle&&activeVehicle ? activeVehicle.position : playerRoot.position; } 

 

     

    function flashHitMarker(kill=false){ 

      if(!hitMarker) return; 

      hitMarker.textContent = kill ? "☠" : "×"; 

      hitMarker.style.color = kill ? "#ff4444" : "white"; 

      hitMarker.style.opacity = "1"; 

      clearTimeout(hitMarker._hideTimer); 

      hitMarker._hideTimer = setTimeout(()=>{ hitMarker.style.opacity = "0"; }, 120); 

    } 

 

    function setEnemyVisible(v){ 

      if(!enemyRoot) return; 

      enemyRoot.visible = v; 

      enemyRoot.traverse((c)=>{ 

        c.visible = v; 

      }); 

    } 

 

    function killEnemy(){ 

      if(enemyDead) return; 

      enemyDead = true; 

      enemyRespawnTimer = 3.0; 

      enemyHealth = 0; 

      setEnemyVisible(false); 

      setStatus("enemy eliminated 💀"); 

      flashHitMarker(true); 

    } 

 

    function respawnEnemy(){ 

      if(!enemyRoot) return; 

      enemyDead = false; 

      enemyHealth = 100; 

      enemyRoot.position.set(-18, getSafeSpawnY(-18, -14), -14); 

      enemyRoot.rotation.y = 0; 

      setEnemyVisible(true); 

      setStatus("enemy respawned"); 

    } 

 

    function shoot(){ 

      if(gameEnded) return; 

      if(inVehicle) return; 

 

      const now = performance.now(); 

      if(now - lastShotTime < 145) return; // fire-rate limiter 

      lastShotTime = now; 

 

      if(muzzleFlash){ 

        muzzleFlash.intensity = 5; 

        setTimeout(()=>{ if(muzzleFlash) muzzleFlash.intensity = 0; }, 45); 

      } 

 

      // Raycast straight out of the center of the camera. 

      const raycaster = new THREE.Raycaster(); 

      raycaster.setFromCamera(new THREE.Vector2(0,0), camera); 

 

      const targets = []; 

 

      if(enemyRoot && !enemyDead){ 

        enemyRoot.traverse((c)=>{ 

          if(c.isMesh || c.isSkinnedMesh) { 

            c.userData.hitType = "enemy"; 

            targets.push(c); 

          } 

        }); 

      } 

 

      if(rocketBlockade && !rocketDead){ 

        rocketBlockade.traverse((c)=>{ 

          if(c.isMesh || c.isSkinnedMesh) { 

            c.userData.hitType = "rocket"; 

            targets.push(c); 

          } 

        }); 

 

        if(rocketHitbox){ 

          rocketHitbox.userData.hitType = "rocket"; 

          targets.push(rocketHitbox); 

        } 

      } 

 

      const hits = raycaster.intersectObjects(targets, true); 

 

      if(hits.length){ 

        let obj = hits[0].object; 

        let hitType = obj.userData.hitType; 

 

        // Walk up parents if GLB child mesh did not get the type copied. 

        let p = obj.parent; 

        while(!hitType && p){ 

          hitType = p.userData ? p.userData.hitType : null; 

          p = p.parent; 

        } 

 

        if(hitType === "rocket"){ 

          damageRocketBlockade(); 

          return; 

        } 

 

        enemyHealth -= 34; 

        flashHitMarker(false); 

        setStatus("enemy hit: " + Math.max(0, enemyHealth) + " HP"); 

 

        if(enemyHealth <= 0){ 

          killEnemy(); 

        } 

      } else { 

        setStatus("shot missed"); 

      } 

    } 

 

    function updateEnemy(delta){ 

      if(gameEnded) return; 

      if(enemyMixer && !enemyDead) enemyMixer.update(delta); 

      if(!enemyRoot) return; 

 

      if(enemyDead){ 

        enemyRespawnTimer -= delta; 

        if(enemyRespawnTimer <= 0) respawnEnemy(); 

        return; 

      } 

      const target=getPlayerWorldPos(); 

      const dx=target.x-enemyRoot.position.x, dz=target.z-enemyRoot.position.z; 

      const d=Math.sqrt(dx*dx+dz*dz); 

      let moving=false; 

      if(d<35 && d>5.0){ 

        const speed=3.0; moveWithMapCollision(enemyRoot, (dx/d)*speed*delta, (dz/d)*speed*delta, ENEMY_RADIUS); 

        enemyRoot.rotation.y = Math.atan2(dx,dz); moving=true; 

      } else if(d>=35){ 

        // patrol figure-eight-ish, not perfect haunted Roomba circle 

        const t=clock.elapsedTime*.45; const tx=-10+Math.sin(t)*10; const tz=-8+Math.sin(t*0.7)*7; 

        const px=tx-enemyRoot.position.x, pz=tz-enemyRoot.position.z; const pd=Math.sqrt(px*px+pz*pz); 

        if(pd>.5){ enemyRoot.position.x+=(px/pd)*1.5*delta; enemyRoot.position.z+=(pz/pd)*1.5*delta; enemyRoot.rotation.y=Math.atan2(px,pz); moving=true; } 

      } 

      keepRootOnGround(enemyRoot); 

      playEnemy(moving?"run":"idle"); 

    } 

 

    function enterExitVehicle(){ 

      if(!apcRoot||!playerRoot) return; 

      if(inVehicle){ 

        inVehicle=false; activeVehicle=null; setPlayerFPSVisibility(); setMode("walking"); 

        playerRoot.visible=true; 

        const exitOffset=new THREE.Vector3(2,0,0).applyAxisAngle(new THREE.Vector3(0,1,0), apcRoot.rotation.y); 

        playerRoot.position.copy(apcRoot.position).add(exitOffset); playerRoot.position.set(0, getSafeSpawnY(0, 14), 14); 

        return; 

      } 

      if(dist2D(playerRoot.position, apcRoot.position)<7){ 

        inVehicle=true; activeVehicle=apcRoot; setMode("APC"); playerRoot.visible=false; setPlayerFPSVisibility(); playAction("idle"); 

      } 

    } 

 

    function updateAPC(delta){ 

      if(gameEnded) return; 

      if(!apcRoot) return; 

      if(!inVehicle){ apcRoot.userData.speed*=Math.pow(.2,delta); return; } 

      let throttle=0; if(keys.KeyW) throttle+=1; if(keys.KeyS) throttle-=.7; 

      const boost=keys.ShiftLeft?1.55:1; 

      apcRoot.userData.speed += throttle*10*delta; 

      apcRoot.userData.speed *= Math.pow(.85,delta*4); 

      apcRoot.userData.speed = Math.max(-5,Math.min(10*boost,apcRoot.userData.speed)); 

      let turn=0; if(keys.KeyA) turn+=1; if(keys.KeyD) turn-=1; 

      apcRoot.rotation.y += turn*1.8*delta*(Math.abs(apcRoot.userData.speed)/8+.25); 

      const forward=new THREE.Vector3(Math.sin(apcRoot.rotation.y),0,Math.cos(apcRoot.rotation.y)); 

      apcRoot.position.addScaledVector(forward, apcRoot.userData.speed*delta); 

      apcRoot.position.y=0; 

    } 

 

    function updatePlayer(delta){ 

      if(gameEnded) return; 

      if(!playerRoot || inVehicle) return; 

 

      const doingEmote = currentAction === actions.macarena; 

 

      if(!doingEmote){ 

        const forward = new THREE.Vector3( 

          -Math.sin(yaw), 

          0, 

          -Math.cos(yaw) 

        ); 

 

        const right = new THREE.Vector3( 

          Math.cos(yaw), 

          0, 

          -Math.sin(yaw) 

        ); 

 

        const move = new THREE.Vector3(); 

 

        if(keys.KeyW) move.add(forward); 

        if(keys.KeyS) move.sub(forward); 

        if(keys.KeyD) move.add(right); 

        if(keys.KeyA) move.sub(right); 

 

        if(move.lengthSq() > 0){ 

          move.normalize(); 

 

          const speed = keys.ShiftLeft ? fps.sprintSpeed : fps.moveSpeed; 

 

          moveWithMapCollision( 

            playerRoot, 

            move.x * speed * delta, 

            move.z * speed * delta, 

            PLAYER_RADIUS 

          ); 

 

          playerRoot.rotation.y = yaw; 

          playAction("run"); 

        } else { 

          playerRoot.rotation.y = yaw; 

          playAction("idle"); 

        } 

      } 

 

      // Real gravity + real landing. 

      applyGravityAndVerticalCollision(playerRoot, delta, PLAYER_RADIUS); 

 

      keepBootsOnGround(); 

      setPlayerFPSVisibility(); 

    } 

 

    function updateCamera(){ 

      if(inVehicle && activeVehicle){ 

        const target = activeVehicle; 

        const dist = 10.5; 

        const height = 4.2; 

        const lookHeight = 2.2; 

        const camYaw = activeVehicle.rotation.y; 

 

        const tx = target.position.x; 

        const ty = target.position.y + lookHeight; 

        const tz = target.position.z; 

 

        const desired = new THREE.Vector3( 

          tx + Math.sin(camYaw) * dist, 

          ty + height + cameraPitch * 2.0, 

          tz + Math.cos(camYaw) * dist 

        ); 

 

        camera.position.lerp(desired, 0.22); 

        camera.lookAt(tx, ty, tz); 

        return; 

      } 

 

      if(!playerRoot) return; 

 

      // First-person camera at normal human height, not 7th-grade Slenderman height. 

      // playerRoot has boot lift/spawn correction, so use a lower eye offset. 

      const eyeY = playerRoot.position.y + fps.eyeHeight; 

      camera.position.set(playerRoot.position.x, eyeY, playerRoot.position.z); 

 

      const lookDistance = 12; 

      const lookTarget = new THREE.Vector3( 

        camera.position.x - Math.sin(yaw) * lookDistance, 

        camera.position.y - Math.sin(cameraPitch) * lookDistance, 

        camera.position.z - Math.cos(yaw) * lookDistance 

      ); 

 

      camera.lookAt(lookTarget); 

    } 

 

    function animate(){ requestAnimationFrame(animate); 

      if(!gameEnded){ 

        const overlay=document.getElementById("cutsceneOverlay"); 

        if(overlay && overlay.style.display !== "none") overlay.style.display="none"; 

      } const delta=Math.min(clock.getDelta(),.05); if(mixer) mixer.update(delta); updatePlayer(delta); updateAPC(delta); updateEnemy(delta); updateFPSArms(delta); sendMPState(); updateRemotePlayers(delta); setPlayerFPSVisibility(); updateCamera(); renderer.render(scene,camera); } 

 

    window.addEventListener("keydown",e=>{ 

      keys[e.code]=true; 

      if(e.code==="KeyR" && gameEnded){ restartMission(); return; } 

      if(e.code==="Space" && playerRoot && !inVehicle && onGround){ velocityY=9.2; onGround=false; setStatus("jump"); } 

      if(e.code==="KeyM" && actions.macarena && !inVehicle){ playAction("macarena",.12,true); } 

      if(e.code==="KeyE") enterExitVehicle(); 

      if(e.code==="Digit1") { setWeapon("Saiga"); } 

      if(e.code==="KeyO") { const p=document.getElementById("mpPanel"); if(p) p.style.display = (p.style.display==="none" ? "block" : "none"); } 

      if(e.code==="KeyF") shoot(); 

    }); 

    window.addEventListener("keyup",e=>{ keys[e.code]=false; }); 

    renderer.domElement.addEventListener("click",()=>{ 

      if(document.pointerLockElement === renderer.domElement){ 

        shoot(); 

      } else { 

        renderer.domElement.requestPointerLock(); 

      } 

    }); 

 

    document.addEventListener("pointerlockchange",()=>{ 

      mouseLocked = document.pointerLockElement === renderer.domElement; 

      setStatus(mouseLocked ? "mouse locked - ESC unlocks" : "click game to lock mouse"); 

    }); 

 

    document.addEventListener("mousemove",e=>{ 

      if(!mouseLocked) return; 

      const sensitivity = 0.0028; 

      yaw -= e.movementX * sensitivity; 

      cameraPitch += e.movementY * sensitivity; 

      cameraPitch = Math.max(-0.55, Math.min(0.85, cameraPitch)); 

    }); 

 

    document.addEventListener("mousedown",e=>{ 

      if(mouseLocked && e.button === 0){ 

        shoot(); 

      } 

    }); 

    window.addEventListener("resize",()=>{ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); }); 

 

    start(); animate();