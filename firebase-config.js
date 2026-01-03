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
        container.innerHTML = `
            <div style="color:#f85149; font-weight:bold; padding:10px; border:1px dashed red;">CRITICAL SYSTEM ERROR: ENCRYPTION ACTIVE</div>
            <div class="ban-item"><span>User_8829</span> <span>0.0.0.0</span> <span>STABLE</span></div>
            <div class="ban-item"><span>Bot_Recon</span> <span>127.0.0.1</span> <span>ENCRYPTED</span></div>
        `;
    }
    const dbView = document.getElementById("dbView");
    if (dbView) {
        dbView.style.display = "flex";
        dbView.innerHTML = `<h2 style="color:red; width:100%; text-align:center;">PROTOCOL_X_LOADED: UNAUTHORIZED</h2>`;
    }
}

async function validateAccess(user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data() || {};
    
    if (userData.role === 'admin') return { isAdmin: true };

    if (window.location.pathname.includes("admin")) {
        triggerGhostMode();
        await setDoc(doc(db, "blacklist", user.uid), {
            type: "permanent",
            target: userData.username || "Ghost_Hacker",
            bannedAt: serverTimestamp(),
            reason: "Honeypot Triggered: Unauthorized Admin Access"
        });
        return { isBanned: true };
    }
    return { isAdmin: false };
}

function showBanAlert(msg) {
    const div = document.createElement('div');
    div.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:#0b0e14;color:#f85149;display:flex;align-items:center;justify-content:center;z-index:9999999;font-family:monospace;text-align:center;";
    div.innerHTML = `<div><h1 style="font-size:2.5rem;text-shadow: 0 0 10px red;">[SECURITY_VIOLATION]</h1><p>${msg}</p></div>`;
    document.body.appendChild(div);
}

export function initApp(callback) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const status = await validateAccess(user);

            if (status.isBanned) {
                setTimeout(() => { 
                    showBanAlert("Local session purged. UID reported.");
                    signOut(auth).then(() => { setTimeout(() => window.location.href = "login.html", 2000); });
                }, 5000);
                return;
            }

            captureIntel(user);

            if (!status.isAdmin) {
                onSnapshot(doc(db, "blacklist", user.uid), (snap) => {
                    if (snap.exists()) {
                        const d = snap.data();
                        if (d.type === "permanent" || (d.type === "temporary" && Date.now() < d.until)) {
                            showBanAlert("Hardware ID Blacklisted.");
                            updateDoc(doc(db, "users", user.uid), { active: false });
                            setTimeout(() => { signOut(auth).then(() => location.href = "login.html"); }, 3000);
                        }
                    }
                });
            }

            updateDoc(doc(db, "users", user.uid), { active: true, lastActive: serverTimestamp() });
            if (callback) callback(user);
        } else if (!window.location.href.includes("login.html")) {
            window.location.href = "login.html";
        }
    });
}