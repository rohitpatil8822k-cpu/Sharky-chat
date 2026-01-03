import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, doc, updateDoc, onSnapshot, serverTimestamp, setDoc, getDoc, arrayUnion, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

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
export const db = getFirestore(app);
export const auth = getAuth(app);

let timerInterval;

function hideLockdown() {
    const overlay = document.getElementById("lockdown-overlay");
    if (overlay) {
        clearInterval(timerInterval);
        overlay.style.opacity = "0";
        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = "auto";
        }, 500);
    }
}

function showLockdown(title, message, isTemp = false, until = 0) {
    if (document.getElementById("lockdown-overlay")) {
        if (isTemp) updateTimer(until);
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.id = "lockdown-overlay";
    overlay.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(2,4,8,0.95);backdrop-filter:blur(15px);display:flex;align-items:center;justify-content:center;z-index:99999999;transition:all 0.5s ease;font-family:'Orbitron',sans-serif;";
    
    overlay.innerHTML = `
        <div style="background:#0d1117; border:1px solid #f85149; padding:50px; border-radius:20px; text-align:center; box-shadow:0 0 50px rgba(248,81,73,0.2); max-width:500px; width:90%; position:relative; overflow:hidden;">
            <div style="position:absolute; top:0; left:0; width:100%; height:4px; background:linear-gradient(90deg, transparent, #f85149, transparent); animation: scan 2s linear infinite;"></div>
            <div style="font-size:70px; margin-bottom:20px; filter: drop-shadow(0 0 10px #f85149);">🚫</div>
            <h1 style="color:#f85149; margin:0; font-size:28px; letter-spacing:4px; font-weight:900;">${title}</h1>
            <div style="height:1px; background:#30363d; margin:20px 0;"></div>
            <p style="color:#c9d1d9; font-size:16px; line-height:1.6; margin-bottom:25px;">${message}</p>
            
            <div id="timer-ui" style="display:${isTemp ? 'block' : 'none'};">
                <div style="background:#161b22; padding:20px; border-radius:12px; border:1px solid #30363d; position:relative;">
                    <span style="color:#8b949e; font-size:11px; text-transform:uppercase; letter-spacing:2px; display:block; margin-bottom:10px;">Restriction Uplift In</span>
                    <span id="countdown-clock" style="color:#ffcc00; font-size:35px; font-family:monospace; text-shadow:0 0 15px rgba(255,204,0,0.4);">00:00:00</span>
                </div>
            </div>

            <div style="margin-top:30px; display:flex; justify-content:center; gap:15px; opacity:0.6;">
                <span>🛰️</span><span>🛡️</span><span>🔒</span><span>💻</span>
            </div>
        </div>
        <style>
            @keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;900&display=swap');
        </style>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    if (isTemp) updateTimer(until);
}

function updateTimer(until) {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const diff = until - Date.now();
        if (diff <= 0) {
            clearInterval(timerInterval);
            hideLockdown();
            return;
        }
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        const clock = document.getElementById("countdown-clock");
        if(clock) clock.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

async function captureIntel(user) {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        await setDoc(doc(db, "user_analytics", user.uid), {
            ip: data.ip || "Hidden",
            location: `${data.city}, ${data.country_name}`,
            isp: data.org || "Unknown",
            lastUpdated: serverTimestamp()
        }, { merge: true });
    } catch (e) {}
}

export function initApp(callback) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const isAdmin = userDoc.data()?.role === 'admin';

            captureIntel(user);

            onSnapshot(doc(db, "blacklist", user.uid), (snap) => {
                if (snap.exists()) {
                    const d = snap.data();
                    const now = Date.now();
                    if (d.type === "permanent") {
                        showLockdown("ACCESS REVOKED", "This account has been permanently terminated by the Administrator.");
                    } else if (d.type === "temporary") {
                        if (now < d.until) {
                            showLockdown("TEMPORARY HALT", "System access restricted due to policy violation.", true, d.until);
                        } else {
                            hideLockdown(); // Time over, auto unban
                        }
                    }
                } else {
                    hideLockdown(); // Document deleted by Admin, live unban
                }
            });

            updateDoc(doc(db, "users", user.uid), { active: true, lastActive: serverTimestamp() }).catch(()=>{});
            if (callback) callback(user);
        } else if (!window.location.href.includes("login.html")) {
            window.location.href = "login.html";
        }
    });
}