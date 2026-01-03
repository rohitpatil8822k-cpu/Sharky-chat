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

function showBanAlert(message, type) {
    const overlay = document.createElement('div');
    overlay.style = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); 
                     z-index:99999; display:flex; align-items:center; justify-content:center; font-family:'Inter',sans-serif;`;
    
    const box = document.createElement('div');
    box.style = `background:#161b22; padding:30px; border-radius:20px; border:2px solid #f85149; text-align:center; max-width:90%;`;
    
    const icon = type === 'permanent' ? '🚫' : '⏳';
    box.innerHTML = `
        <div style="font-size:50px; margin-bottom:15px;">${icon}</div>
        <h2 style="color:#f85149; margin:0;">ACCESS TERMINATED</h2>
        <p style="color:#8b949e; margin-top:10px;">${message}</p>
        <div style="margin-top:20px; font-weight:bold; color:#fff;">Redirecting in 3 seconds...</div>
    `;
    
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

async function updatePresence(uid, isActive) {
    if (!uid) return;
    updateDoc(doc(db, "users", uid), { active: isActive, lastActive: serverTimestamp() }).catch(() => {});
}

export function initApp(callback) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const banRef = doc(db, "blacklist", user.uid);
            onSnapshot(banRef, async (snap) => {
                if (snap.exists()) {
                    const data = snap.data();
                    let isBanned = false;
                    let msg = "";

                    if (data.type === "permanent") {
                        isBanned = true;
                        msg = "Bhai, you are permanently banned from Sharky Chat.";
                    } else if (data.type === "temporary" && Date.now() < data.until) {
                        isBanned = true;
                        const mins = Math.round((data.until - Date.now()) / 60000);
                        msg = `You are temporarily kicked. Try again after ${mins} minutes.`;
                    }

                    if (isBanned) {
                        showBanAlert(msg, data.type);
                        updatePresence(user.uid, false);
                        setTimeout(async () => {
                            await signOut(auth);
                            window.location.href = "login.html";
                        }, 3500);
                    }
                }
            });

            updatePresence(user.uid, true);
            document.addEventListener('visibilitychange', () => updatePresence(user.uid, document.visibilityState === 'visible'));
            window.addEventListener('pagehide', () => updatePresence(user.uid, false));
            setInterval(() => { if (document.visibilityState === 'visible') updatePresence(user.uid, true); }, 5000);

            if (callback) callback(user);
        } else if (!window.location.href.includes("login.html")) {
            window.location.href = "login.html";
        }
    });
}