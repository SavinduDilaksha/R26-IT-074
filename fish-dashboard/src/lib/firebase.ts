import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, remove, off } from 'firebase/database';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

// Firebase configuration targeting exact aqua-9e38e database
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_AQUASPHERE_REAL_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aqua-9e38e.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://aqua-9e38e-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aqua-9e38e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aqua-9e38e.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:aqua9e38eapp",
};

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Realtime Database & Auth
export const db = getDatabase(app);
export const auth = getAuth(app);

// ── Firebase Auth Helpers ───────────────────────────────────────────
export async function registerWithFirebase(email: string, pass: string, name: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (userCredential.user && name) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    return userCredential.user;
  } catch (err: any) {
    console.warn("Firebase Auth registration notice:", err?.message);
    throw err;
  }
}

export async function loginWithFirebase(email: string, pass: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  } catch (err: any) {
    console.warn("Firebase Auth sign-in notice:", err?.message);
    throw err;
  }
}

export async function resetPasswordFirebase(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (err: any) {
    console.warn("Firebase Auth password reset notice:", err?.message);
    throw err;
  }
}

export async function loginWithGoogleFirebase() {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (err: any) {
    console.warn("Firebase Auth Google sign-in notice:", err?.message);
    throw err;
  }
}

export async function logoutFirebase() {
  return firebaseSignOut(auth);
}

export function observeAuthState(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ── 1. Node: sensors ───────────────────────────────────────────────
export function subscribeToSensors(callback: (data: any) => void) {
  const sensorsRef = ref(db, 'sensors');
  onValue(sensorsRef, (snapshot) => {
    if (snapshot.exists()) {
      const val = snapshot.val() || {};
      const latest = val.latest || val || {};
      const data = {
        ...val,
        ...latest,
        temperature: latest.temperature ?? latest.temp ?? val.temperature ?? 28.0,
        temp: latest.temperature ?? latest.temp ?? val.temp ?? 28.0,
        ph: latest.ph ?? val.ph ?? 7.0,
        ionconcentration: latest.ionconcentration ?? val.ionconcentration ?? 500,
        turbidity: latest.turbidity ?? val.turbidity ?? 1500,
      };
      callback(data);
    }
  }, (error) => {
    console.warn("Firebase Realtime DB 'sensors' listener notice:", error);
  });

  return () => off(sensorsRef);
}

// ── 2. Node: water_quality ──────────────────────────────────────────
export function subscribeToWaterQuality(callback: (data: any) => void) {
  const wqRef = ref(db, 'water_quality');
  onValue(wqRef, (snapshot) => {
    if (snapshot.exists()) {
      const val = snapshot.val() || {};
      const latest = val.latest || {};
      const history = val.history || {};
      const data = {
        ...val,
        latest,
        history,
        water_quality: latest.water_quality || {},
        shap: latest.shap || {},
      };
      callback(data);
    }
  }, (error) => {
    console.warn("Firebase Realtime DB 'water_quality' listener notice:", error);
  });

  return () => off(wqRef);
}

// ── 3. Node: behavior ───────────────────────────────────────────────
export function subscribeToBehavior(callback: (data: any) => void) {
  const behRef = ref(db, 'behavior');
  onValue(behRef, (snapshot) => {
    if (snapshot.exists()) {
      const val = snapshot.val() || {};
      const latest = val.latest || {};
      const history = val.history || {};
      const data = {
        ...val,
        latest,
        history,
        behavior: latest.behavior || {},
        stress: latest.stress || {},
      };
      callback(data);
    }
  }, (error) => {
    console.warn("Firebase Realtime DB 'behavior' listener notice:", error);
  });

  return () => off(behRef);
}

// ── 4. Node: disease ────────────────────────────────────────────────
export function subscribeToDisease(callback: (data: any) => void) {
  const diseaseRef = ref(db, 'disease');
  onValue(diseaseRef, (snapshot) => {
    if (snapshot.exists()) {
      const val = snapshot.val() || {};
      const latest = val.latest || {};
      const history = val.history || {};
      const data = {
        ...val,
        latest,
        history,
        disease: latest.disease || val.disease,
        confidence: latest.confidence ?? val.confidence,
        reason: latest.reason || val.reason,
        breakdown: latest.breakdown || val.breakdown,
      };
      callback(data);
    }
  }, (error) => {
    console.warn("Firebase Realtime DB 'disease' listener notice:", error);
  });

  return () => off(diseaseRef);
}

// ── 5. Node: feeding ────────────────────────────────────────────────
export function subscribeToFeeding(callback: (data: any) => void) {
  const feedingRef = ref(db, 'feeding');
  onValue(feedingRef, (snapshot) => {
    if (snapshot.exists()) {
      const val = snapshot.val() || {};
      const latest = val.latest || {};
      const history = val.history || {};
      const data = {
        ...val,
        latest,
        history,
        feed: latest.feed || {},
        hunger: latest.hunger || {},
      };
      callback(data);
    }
  }, (error) => {
    console.warn("Firebase Realtime DB 'feeding' listener notice:", error);
  });

  return () => off(feedingRef);
}

export async function sendFeederTrigger(groupName: string, amount: number) {
  try {
    const feedingCommandsRef = ref(db, 'feeding/commands');
    const timestamp = new Date().toISOString();
    await push(feedingCommandsRef, {
      group: groupName,
      amount,
      timestamp,
      status: 'PENDING',
      is_manual_override: true,
    });

    // Also update feeding/latest node in Firebase RTDB
    const feedingLatestRef = ref(db, 'feeding/latest/feed');
    await set(feedingLatestRef, {
      dispensed: true,
      dispensed_amount: amount,
      group: groupName,
      last_dispense_timestamp: timestamp,
      rounds: Math.max(1, Math.round(amount / 0.05)),
      portion_unit: 'g',
      is_automatic: false,
    });
    return true;
  } catch (err) {
    console.error("Error triggering feeder command in Firebase:", err);
    return false;
  }
}

// ── 6. Node: symptoms ───────────────────────────────────────────────
export function subscribeToSymptoms(callback: (data: any) => void) {
  const symptomsRef = ref(db, 'symptoms');
  onValue(symptomsRef, (snapshot) => {
    if (snapshot.exists()) {
      const val = snapshot.val();
      callback(val);
    }
  }, (error) => {
    console.warn("Firebase Realtime DB 'symptoms' listener notice:", error);
  });

  return () => off(symptomsRef);
}

export async function saveSymptomObservation(observationText: string) {
  try {
    const timestamp = new Date().toISOString();
    // Path 1: symptoms/user_input (polled by Raspberry Pi nlp/symptom_input.py)
    const userInputRef = ref(db, 'symptoms/user_input');
    await set(userInputRef, observationText);

    // Path 2: symptoms/history (historical audit log)
    const symptomsHistoryRef = ref(db, 'symptoms/history');
    await push(symptomsHistoryRef, {
      text: observationText,
      timestamp,
    });
    return true;
  } catch (err) {
    console.error("Error saving symptom observation in Firebase:", err);
    return false;
  }
}

// ── 7. Node: system ────────────────────────────────────────────────
export function subscribeToSystem(callback: (data: any) => void) {
  const systemRef = ref(db, 'system');
  onValue(systemRef, (snapshot) => {
    if (snapshot.exists()) {
      const val = snapshot.val();
      const data = val?.latest ? { ...val, ...val.latest } : val;
      callback(data);
    }
  }, (error) => {
    console.warn("Firebase Realtime DB 'system' listener notice:", error);
  });

  return () => off(systemRef);
}

// Legacy helper compatibility aliases
export const subscribeToStressData = subscribeToBehavior;
export const subscribeToAlerts = subscribeToDisease;
export const subscribeToTanks = subscribeToFeeding;
export async function saveTankToFirebase(tank: any) {
  const tankRef = ref(db, `feeding/tanks/${tank.id}`);
  await set(tankRef, tank);
  return true;
}
export async function deleteTankFromFirebase(tankId: number) {
  const tankRef = ref(db, `feeding/tanks/${tankId}`);
  await remove(tankRef);
  return true;
}

export default app;
