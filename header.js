(function() {
    const style = document.createElement('style');
    style.innerHTML = `
    :root {
      --header-bg: #0b0c0f; --menu-bg: #07080a; --accent: #00d4ff; --accent-glow: rgba(0, 212, 255, 0.35);
      --gold: #fbbf24; --text-main: #e2e8f0; --text-dim: #94a3b8; --border: rgba(255, 255, 255, 0.08);
      --h-height: 48px; --transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    header { height: var(--h-height); background: var(--header-bg); position: fixed; top: 0; left: 0; width: 100%; z-index: 2000; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 16px; overflow: hidden; font-family: 'Inter', sans-serif; }
    .smoke-layer { position: absolute; top: 0; left: -100%; width: 300%; height: 100%; background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.06) 15%, rgba(255, 255, 255, 0.12) 50%, rgba(0, 212, 255, 0.06) 85%, transparent); animation: smokeMove 8s linear infinite; filter: blur(12px); pointer-events: none; z-index: 1; }
    @keyframes smokeMove { 0% { transform: translateX(0); } 100% { transform: translateX(33.33%); } }
    .header-inner { width: 100%; display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 5; }
    .logo-container { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    .logo-container img { height: 23px; filter: drop-shadow(0 0 5px var(--accent-glow)); }
    .logo-text { font-family: "Orbitron", sans-serif; font-size: 1.05rem; font-weight: 800; letter-spacing: 1.2px; color: #fff; }
    .menu-btn { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); color: #fff; width: 38px; height: 38px; border-radius: 8px; display: flex; justify-content: center; align-items: center; font-size: 1.25rem; cursor: pointer; position: relative; transition: var(--transition); }
    .notif-badge { position: absolute; top: -4px; right: -4px; background: var(--gold); color: #000; font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 900; min-width: 17px; height: 17px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid var(--header-bg); }
    .menu-dropdown { position: fixed; top: 0; right: -105%; width: 285px; height: 100vh; background: var(--menu-bg); border-left: 1px solid var(--border); z-index: 2500; transition: right 0.5s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; padding: 70px 15px 20px; overflow-y: auto; }
    header.expanded .menu-dropdown { right: 0; }
    .close-btn { position: absolute; top: 18px; left: 18px; color: var(--text-dim); cursor: pointer; z-index: 10; }
    .menu-group { margin-bottom: 20px; display: flex; flex-direction: column; gap: 6px; }
    .menu-dropdown a { display: flex; align-items: center; gap: 12px; color: var(--text-dim); text-decoration: none; padding: 14px 16px; border-radius: 12px; font-size: 1rem; font-weight: 500; transition: var(--transition); background: rgba(255,255,255,0.02); }
    .menu-dropdown a:hover { background: rgba(0, 212, 255, 0.08); color: #fff; transform: translateX(5px); }
    .icon { width: 21px; height: 21px; stroke: var(--accent); stroke-width: 2; fill: none; flex-shrink: 0; }
    .mem-link { background: rgba(251, 191, 36, 0.05) !important; color: var(--gold) !important; }
    .dropdown-notif { margin-left: auto; background: var(--gold); color: #000; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 6px; font-family: 'Orbitron', sans-serif; }
    .menu-footer { margin-top: auto; padding-top: 20px; text-align: center; border-top: 1px solid var(--border); }
    .copyright { font-size: 10.5px; color: #475569; letter-spacing: 1.2px; font-family: 'Orbitron', sans-serif; }
    .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 1900; opacity: 0; visibility: hidden; transition: 0.4s; }
    header.expanded ~ .overlay { opacity: 1; visibility: visible; }
    `;
    document.head.appendChild(style);

    const headerHTML = `
  <header id="mainHeader">
    <div class="smoke-layer"></div>
    <div class="header-inner">
      <a href="profile.html" class="logo-container">
        <img src="https://firebasestorage.googleapis.com/v0/b/sharky-chat-007.firebasestorage.app/o/gc-logo.png?alt=media&token=ddfe6e46-7351-4a07-8140-ea702b1bd823" alt="Logo" />
        <div class="logo-text">SHARKY CHAT</div>
      </a>
      <button class="menu-btn" id="menuBtn">☰<span class="notif-badge" id="menuNotif" style="display:none;">0</span></button>
    </div>
    <nav class="menu-dropdown">
      <div class="close-btn" id="closeBtn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
      <div class="menu-group">
        <a href="profile.html"><svg class="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Profile</a>
        <a href="chatrooms.html"><svg class="icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Chat Rooms</a>
      </div>
      <div class="menu-group">
        <a href="friends.html"><svg class="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> Friends <span id="friends-notif" class="dropdown-notif" style="display:none;">0</span></a>
        <a href="add-friends.html"><svg class="icon" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Add Friend</a>
        <a href="inbox.html"><svg class="icon" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Messages <span id="messages-notif" class="dropdown-notif" style="display:none;">0</span></a>
      </div>
      <div class="menu-group"><a href="membership.html" class="mem-link"><svg class="icon" style="stroke:var(--gold)" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> Membership</a></div>
      <div class="menu-group">
        <a href="wallet.html"><svg class="icon" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M16 12h4"/><circle cx="16" cy="12" r="2"/></svg> Wallet <span id="wallet-notif" class="dropdown-notif" style="display:none;">!</span></a>
        <a href="shop.html"><svg class="icon" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> Shop</a>
        <a href="inventory.html"><svg class="icon" viewBox="0 0 24 24"><path d="M21 8V21H3V8"/><path d="M1 3H23V8H1V3Z"/><path d="M10 12H14"/></svg> Inventory</a>
      </div>
      <div class="menu-group">
        <a href="news.html"><svg class="icon" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg> Notice Board <span id="notice-notif" class="dropdown-notif" style="display:none;">0</span></a>
        <a href="level.html"><svg class="icon" viewBox="0 0 24 24"><path d="M2 20h20"/><path d="M7 20v-5"/><path d="M12 20V9"/><path d="M17 20V4"/></svg> My Level</a>
      </div>
      <div class="menu-group">
        <a href="refer.html"><svg class="icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg> Refer A Friend</a>
        <a href="socials.html"><svg class="icon" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> Social Media</a>
        <a href="verify-email.html"><svg class="icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Verification</a>
        <a href="contact.html"><svg class="icon" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> Contact Us</a>
      </div>
      <div class="menu-footer"><div class="copyright">SHARKY CHAT © 2026</div></div>
    </nav>
  </header>
  <div class="overlay" id="overlay"></div>
    `;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = headerHTML;
    document.body.prepend(wrapper);

    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
    import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
    import { getFirestore, doc, updateDoc, onSnapshot, serverTimestamp, setDoc, getDoc, increment, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyBGfgy9OeMTJ__oOAFxoBW-eIOYlvhObZM",
      authDomain: "sharky-chat-007.firebaseapp.com",
      projectId: "sharky-chat-007",
      storageBucket: "sharky-chat-007.appspot.com",
      messagingSenderId: "637104796242",
      appId: "1:637104796242:web:74ac36b86af91be15ea58b",
      measurementId: "G-HT9T3P9KST",
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    let userData = null; let userIPInfo = {}; let timerInterval;
    const menuNotif = document.getElementById("menuNotif");
    const friendsNotif = document.getElementById("friends-notif");
    const messagesNotif = document.getElementById("messages-notif");
    const walletNotif = document.getElementById("wallet-notif");
    const noticeNotif = document.getElementById("notice-notif");

    function getDeviceFingerprint() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        const debugInfo = gl ? gl.getExtension('WEBGL_debug_renderer_info') : null;
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "unknown";
        return btoa(\`\${navigator.userAgent}|\${screen.width}x\${screen.height}|\${renderer}\`).substring(0, 32);
    }

    async function logBanActivity(uid, reason, fingerprint) {
        try { await addDoc(collection(db, "admin_alerts"), { uid, username: userData?.username || "Unknown", reason, fingerprint, ip: userIPInfo.ip || "Hidden", location: userIPInfo.location || "Unknown", timestamp: serverTimestamp(), type: "AUTO_BAN_TRIGGER" }); } catch (e) {}
    }

    async function autoBanUser(reason) {
        if (!userData || userData.role === 'admin') return;
        const uid = auth.currentUser.uid; const fp = getDeviceFingerprint();
        await logBanActivity(uid, reason, fp);
        await setDoc(doc(db, "blacklist", uid), { type: "permanent", reason, fingerprint: fp, timestamp: serverTimestamp() });
        await setDoc(doc(db, "banned_devices", fp), { bannedUid: uid, reason: "Hardware Ban: " + reason, timestamp: serverTimestamp() });
        window.location.reload();
    }

    function showLockdown(title, message, isTemp = false, until = 0) {
        if (document.getElementById("lockdown-overlay")) return;
        const overlay = document.createElement('div'); overlay.id = "lockdown-overlay";
        overlay.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(2,4,8,0.98);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;z-index:99999999;font-family:'Orbitron',sans-serif;color:white;";
        overlay.innerHTML = \`<div style="border:1px solid #ff0000; padding:40px; border-radius:15px; text-align:center; background:#000; box-shadow: 0 0 40px rgba(255,0,0,0.4);">
            <h1 style="color:#ff0000; letter-spacing:3px;">SYSTEM LOCKDOWN</h1><h3 style="color:#fff;">\${title}</h3><p style="color:#888;">\${message}</p>
            \${isTemp ? '<h2 id="countdown-clock" style="color:#fbbf24;">00:00:00</h2>' : ''}
            <div style="margin-top:20px; font-size:11px; color:#444; border-top:1px solid #222; padding-top:10px">ID: \${getDeviceFingerprint()}</div></div>\`;
        document.body.appendChild(overlay); document.body.style.overflow = "hidden";
        if (isTemp) {
            timerInterval = setInterval(() => {
                const diff = until - Date.now(); if (diff <= 0) window.location.reload();
                const h = Math.floor(diff/3600000).toString().padStart(2,'0'); const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0'); const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
                const clock = document.getElementById("countdown-clock"); if(clock) clock.innerText = \`\${h}:\${m}:\${s}\`;
            }, 1000);
        }
    }

    function setupMenuNotifications(uid) {
      onSnapshot(query(collection(db, "friendRequests"), where("to", "==", uid), where("status", "==", "pending")), (snap) => {
        const frCount = snap.size; menuNotif.dataset.fr = frCount; friendsNotif.textContent = frCount;
        friendsNotif.style.display = frCount > 0 ? "inline-flex" : "none"; updateMenuBadge();
      });
    }

    async function setupMessageNotifications(uid, username) {
      const friendsSnap = await getDoc(doc(db, "friends", uid));
      if (!friendsSnap.exists()) return;
      const myFriends = Object.keys(friendsSnap.data());
      if (myFriends.length === 0) return;
      
      const usersSnap = await getDocs(query(collection(db, "users"), where("__name__", "in", myFriends.slice(0, 10))));
      let usernamesData = {};
      usersSnap.forEach(d => usernamesData[d.id] = d.data().username);

      let unseenTracker = {};
      for (const fid of myFriends) {
        const friendUsername = usernamesData[fid]; if (!friendUsername) continue;
        const chatId = [username, friendUsername].sort().join("_");
        onSnapshot(query(collection(db, "personalMessages", chatId, "messages"), where("recipient", "==", username), where("seen", "==", false)), (snap) => {
          unseenTracker[chatId] = snap.size;
          let total = Object.values(unseenTracker).reduce((a, b) => a + b, 0);
          messagesNotif.dataset.count = total; messagesNotif.textContent = total;
          messagesNotif.style.display = total > 0 ? "inline-flex" : "none"; updateMenuBadge();
        });
      }
    }

    function setupNoticeNotifications() {
      onSnapshot(collection(db, "updates"), (snap) => {
        const readNotices = JSON.parse(localStorage.getItem('readNotices') || '[]');
        const deletedNotices = JSON.parse(localStorage.getItem('deletedNotices') || '[]');
        let unread = 0; snap.forEach((doc) => { if (!readNotices.includes(doc.id) && !deletedNotices.includes(doc.id)) unread++; });
        noticeNotif.dataset.count = unread; noticeNotif.textContent = unread;
        noticeNotif.style.display = unread > 0 ? "inline-flex" : "none"; updateMenuBadge();
      });
    }

    function updateMenuBadge() {
      const walletCount = (localStorage.getItem('newGiftReceived') ? 1 : 0) + (localStorage.getItem('dailyMissionReady') ? 1 : 0);
      const total = (parseInt(menuNotif.dataset.fr) || 0) + (parseInt(messagesNotif.dataset.count) || 0) + walletCount + (parseInt(noticeNotif.dataset.count) || 0);
      menuNotif.textContent = total > 99 ? "99+" : total; menuNotif.style.display = total > 0 ? "flex" : "none";
      walletNotif.style.display = walletCount > 0 ? "inline-flex" : "none";
    }

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid)); userData = userDoc.data();
        if(userData?.role !== 'admin') {
            document.addEventListener('contextmenu', e => e.preventDefault());
            document.onkeydown = (e) => { if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74 || e.keyCode == 67)) || (e.ctrlKey && e.keyCode == 85)) { autoBanUser("DevTools Key Injection"); return false; } };
            setInterval(() => { if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) autoBanUser("DevTools Detected"); }, 2000);
        }
        const fp = getDeviceFingerprint();
        const banned = await getDoc(doc(db, "banned_devices", fp));
        if (banned.exists() && userData?.role !== 'admin') { showLockdown("HARDWARE BLACKLIST", "Device Banned."); return; }
        
        onSnapshot(doc(db, "blacklist", user.uid), (snap) => {
            if (snap.exists()) {
                const d = snap.data();
                if (d.type === "permanent") showLockdown("TERMINATED", d.reason);
                else if (d.type === "temporary" && Date.now() < d.until) showLockdown("RESTRICTED", "Suspended.", true, d.until);
            }
        });

        setupMenuNotifications(user.uid); setupMessageNotifications(user.uid, userData?.username || ""); setupNoticeNotifications();
        updateDoc(doc(db, "users", user.uid), { active: true, lastActive: serverTimestamp(), activeTabs: increment(1) }).catch(()=>{});
        window.addEventListener('beforeunload', () => updateDoc(doc(db, "users", user.uid), { activeTabs: increment(-1), active: false }));
      } else if (!window.location.href.includes("login.html")) { window.location.href = "login.html"; }
    });

    document.getElementById("menuBtn").onclick = () => document.getElementById("mainHeader").classList.add("expanded");
    document.getElementById("closeBtn").onclick = () => document.getElementById("mainHeader").classList.remove("expanded");
    document.getElementById("overlay").onclick = () => document.getElementById("mainHeader").classList.remove("expanded");
    `;
    document.body.appendChild(script);
})();