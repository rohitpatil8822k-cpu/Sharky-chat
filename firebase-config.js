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

// ⚡ 1. Intel Capture Function (Sabke liye chalega)
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
    } catch (e) { console.error("Intel Error:", e); }
}

// 🛡️ 2. Admin Logic (Sirf Admin Panel page par trigger karein)
async function protectAdminPanel(user) {
    // Agar page ke naam mein 'admin' hai tabhi ye check kare
    if (window.location.pathname.includes("admin")) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();

        if (!userData || userData.role !== 'admin') {
            await setDoc(doc(db, "blacklist", user.uid), {
                type: "permanent",
                target: userData?.username || "Unauthorized",
                bannedAt: serverTimestamp(),
                reason: "Tried to access Admin Panel"
            });
            return false;
        }
    }
    return true; // Normal users chat page par safe rahenge
}

function showBanAlert(message) {
    const div = document.createElement('div');
    div.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:#000;color:red;display:flex;align-items:center;justify-content:center;z-index:999999;font-family:sans-serif;text-align:center;padding:20px;";
    div.innerHTML = `<div><h1>ACCESS DENIED</h1><p>${message}</p></div>`;
    document.body.appendChild(div);
}

export function initApp(callback) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Check Admin Security (Sirf admin pages ke liye)
            const isSafe = await protectAdminPanel(user);
            if (!isSafe) {
                showBanAlert("Security Breach: Your ID is blacklisted.");
                setTimeout(() => { signOut(auth); window.location.href = "login.html"; }, 3000);
                return;
            }

            // Capture Data (Sabka data capture hoga)
            captureIntel(user);

            // Real-time Ban Listener
            onSnapshot(doc(db, "blacklist", user.uid), (snap) => {
                if (snap.exists()) {
                    const d = snap.data();
                    if (d.type === "permanent" || (d.type === "temporary" && Date.now() < d.until)) {
                        showBanAlert("You are banned from the server.");
                        updateDoc(doc(db, "users", user.uid), { active: false });
                        setTimeout(() => { signOut(auth).then(() => location.href = "login.html"); }, 3000);
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