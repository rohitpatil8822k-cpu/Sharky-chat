import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { getFirestore, doc, setDoc, updateDoc, getDoc, serverTimestamp, arrayUnion } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
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
export const analytics = getAnalytics(app);

async function updatePresence(uid, isActive) {
    if (!uid) return;
    try {
        await updateDoc(doc(db, "users", uid), {
            active: isActive,
            lastActive: serverTimestamp()
        });
    } catch (e) {
        console.error("Presence Error:", e);
    }
}

async function trackUserDeep(uid) {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const ipData = await response.json();
        const ua = navigator.userAgent;
        let browserName = ua.includes("Chrome") ? "Chrome" : ua.includes("Safari") ? "Safari" : ua.includes("Firefox") ? "Firefox" : "Other";

        await setDoc(doc(db, "user_analytics", uid), {
            ip: ipData.ip || "unknown",
            location: `${ipData.city || ''}, ${ipData.country_name || ''}`,
            isp: ipData.org || "unknown",
            browsers: arrayUnion(browserName),
            ua: ua,
            res: `${window.screen.width}x${window.screen.height}`,
            lastSeen: serverTimestamp()
        }, { merge: true });
    } catch (e) { }
}

async function checkBanStatus(uid) {
    const banSnap = await getDoc(doc(db, "blacklist", uid));
    if (banSnap.exists()) {
        const data = banSnap.data();
        if (data.type === "permanent" || (data.type === "temporary" && Date.now() < data.until)) {
            alert("⚠️ Access Denied!");
            await signOut(auth);
            window.location.href = "login.html";
            return true;
        }
    }
    return false;
}

export function initApp(callback) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            if (await checkBanStatus(user.uid)) return;

            trackUserDeep(user.uid);
            
            updatePresence(user.uid, true);

            document.addEventListener('visibilitychange', () => {
                const isVisible = document.visibilityState === 'visible';
                updatePresence(user.uid, isVisible);
            });

            window.addEventListener('pagehide', () => {
                updatePresence(user.uid, false);
            });

            const heartbeat = setInterval(() => {
                if (document.visibilityState === 'visible') {
                    updatePresence(user.uid, true);
                }
            }, 5000);

            if (callback) callback(user);
        } else {
            if (!window.location.href.includes("login.html")) {
                window.location.href = "login.html";
            }
        }
    });
}