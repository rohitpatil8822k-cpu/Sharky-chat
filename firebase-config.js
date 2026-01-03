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

// ⚡ ULTRA-FAST INTEL CAPTURE (IP, Location, ISP, Browser)
async function captureIntel(user) {
    try {
        // IP aur Location API (Fastest)
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        const intel = {
            ip: data.ip || "Hidden",
            location: `${data.city}, ${data.country_name}`,
            isp: data.org || "Unknown ISP",
            res: `${window.screen.width}x${window.screen.height}`,
            browsers: arrayUnion(navigator.userAgent.split(') ')[1] || navigator.appName),
            lastUpdated: serverTimestamp()
        };

        // Seedha user_analytics collection mein save karo
        await setDoc(doc(db, "user_analytics", user.uid), intel, { merge: true });
    } catch (e) {
        console.error("Intel Capture Failed:", e);
    }
}

async function verifyUserRole(user) {
    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();

        if (!userData || userData.role !== 'admin') {
            await setDoc(doc(db, "blacklist", user.uid), {
                type: "permanent",
                target: userData?.username || "Unauthorized Explorer",
                bannedAt: serverTimestamp(),
                reason: "Unauthorized Role Access Attempt"
            });
            showBanAlert("Security Protocol: Access Denied. Your ID has been Terminated.", "permanent");
            setTimeout(async () => { await signOut(auth); window.location.href = "login.html"; }, 3000);
            return false;
        }
        return true;
    } catch (error) { return false; }
}

function showBanAlert(message, type) {
    const overlay = document.createElement('div');
    overlay.style = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.98); z-index:99999; display:flex; align-items:center; justify-content:center; font-family:sans-serif;`;
    overlay.innerHTML = `<div style="background:#161b22; padding:40px; border-radius:20px; border:2px solid #f85149; text-align:center; color:white;">
        <h2>SECURITY BREACH</h2><p>${message}</p></div>`;
    document.body.appendChild(overlay);
}

async function updatePresence(uid, isActive) {
    if (!uid) return;
    updateDoc(doc(db, "users", uid), { active: isActive, lastActive: serverTimestamp() }).catch(() => {});
}

export function initApp(callback) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // 1. Role Check
            const isAuthorized = await verifyUserRole(user);
            if (!isAuthorized) return;

            // 2. ⚡ Capture Intelligence Immediately
            captureIntel(user);

            // 3. Presence & Ban Listener
            const banRef = doc(db, "blacklist", user.uid);
            onSnapshot(banRef, async (snap) => {
                if (snap.exists()) {
                    const data = snap.data();
                    if (data.type === "permanent" || (data.type === "temporary" && Date.now() < data.until)) {
                        showBanAlert("Terminated", data.type);
                        updatePresence(user.uid, false);
                        setTimeout(() => { signOut(auth); window.location.href = "login.html"; }, 3000);
                    }
                }
            });

            updatePresence(user.uid, true);
            if (callback) callback(user);
        } else if (!window.location.href.includes("login.html")) {
            window.location.href = "login.html";
        }
    });
}