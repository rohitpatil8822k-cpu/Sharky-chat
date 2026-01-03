import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, doc, updateDoc, onSnapshot, serverTimestamp, setDoc, getDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
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

async function captureIntel(user) {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const intel = {
            ip: data.ip || "Hidden",
            location: `${data.city || 'Unknown'}, ${data.country_name || 'Unknown'}`,
            isp: data.org || "Unknown ISP",
            res: `${window.screen.width}x${window.screen.height}`,
            browsers: arrayUnion(navigator.userAgent.split(') ')[1] || "Web Browser"),
            lastUpdated: serverTimestamp()
        };
        await setDoc(doc(db, "user_analytics", user.uid), intel, { merge: true });
    } catch (e) {}
}

function triggerGhostMode() {
    if (document.getElementById("activeCount")) document.getElementById("activeCount").innerText = "9,842";
    const container = document.getElementById("blacklistContainer");
    if (container) {
        container.innerHTML = `<div style="color:#f85149; font-weight:bold; padding:10px; border:1px dashed red;">CRITICAL SYSTEM ERROR: ENCRYPTION ACTIVE</div>`;
    }
}

function showLockdown(title, message, isTemp = false, until = 0) {
    if (document.getElementById("lockdown-overlay")) return;
    
    const overlay = document.createElement('div');
    overlay.id = "lockdown-overlay";
    overlay.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(11,14,20,0.98);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;z-index:99999999;font-family:'Segoe UI',sans-serif;color:#fff;overflow:hidden;";
    
    const box = document.createElement('div');
    box.style = "background:#161b22;border:2px solid #f85149;padding:40px;border-radius:15px;text-align:center;box-shadow:0 0 30px rgba(248,81,73,0.3);max-width:450px;width:90%;";
    
    box.innerHTML = `
        <div style="font-size:60px;margin-bottom:20px;">🚫</div>
        <h1 style="color:#f85149;margin:0;font-size:24px;text-transform:uppercase;letter-spacing:2px;">${title}</h1>
        <p style="color:#8b949e;margin:20px 0;line-height:1.6;font-size:16px;">${message}</p>
        <div id="timer-box" style="display:${isTemp ? 'block' : 'none'};margin-top:20px;padding:15px;background:#0d1117;border-radius:8px;border:1px solid #30363d;">
            <span style="color:#8b949e;display:block;font-size:12px;text-transform:uppercase;">Time Remaining</span>
            <span id="countdown-clock" style="color:#58a6ff;font-size:28px;font-family:monospace;font-weight:bold;">00:00:00</span>
        </div>
        <div style="margin-top:30px;font-size:10px;color:#484f58;text-transform:uppercase;letter-spacing:1px;">Hardware ID: ${Math.random().toString(16).substr(2, 8).toUpperCase()}</div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    if (isTemp) {
        const timer = setInterval(() => {
            const now = Date.now();
            const diff = until - now;
            if (diff <= 0) {
                clearInterval(timer);
                location.reload();
                return;
            }
            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            document.getElementById("countdown-clock").innerText = `${h}:${m}:${s}`;
        }, 1000);
    }
}

async function validateAccess(user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data() || {};
    if (userData.role === 'admin') return { isAdmin: true };
    if (window.location.pathname.includes("admin")) {
        triggerGhostMode();
        await setDoc(doc(db, "blacklist", user.uid), { type: "permanent", bannedAt: serverTimestamp(), reason: "Unauthorized Admin Access" });
        return { isBanned: true };
    }
    return { isAdmin: false };
}

export function initApp(callback) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const status = await validateAccess(user);
            if (status.isBanned) {
                showLockdown("Access Terminated", "Permanent Banned by Admin.");
                return;
            }

            captureIntel(user);
            onSnapshot(doc(db, "blacklist", user.uid), (snap) => {
                if (snap.exists()) {
                    const d = snap.data();
                    const now = Date.now();
                    if (d.type === "permanent") {
                        showLockdown("Access Terminated", "Permanent Banned by Admin.");
                        updateDoc(doc(db, "users", user.uid), { active: false }).catch(()=>{});
                    } else if (d.type === "temporary" && now < d.until) {
                        showLockdown("Temporary Suspension", "You have been temporary banned by admin.", true, d.until);
                        updateDoc(doc(db, "users", user.uid), { active: false }).catch(()=>{});
                    }
                }
            });

            updateDoc(doc(db, "users", user.uid), { active: true, lastActive: serverTimestamp() });
            if (callback) callback(user);
        } else if (!window.location.href.includes("login.html")) {
            window.location.href = "login.html";
        }
    });
}