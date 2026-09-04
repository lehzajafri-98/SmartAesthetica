
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9cpy6fZXdunhkjosrt6hArjnVFKjhNh0",
  authDomain: "smartaesthetica-7faa3.firebaseapp.com",
  projectId: "smartaesthetica-7faa3",
  storageBucket: "smartaesthetica-7faa3.firebasestorage.app",
  messagingSenderId: "391308219683",
  appId: "1:391308219683:web:44ff7401bb95929743e896"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set persistence so auth state survives page reloads
setPersistence(auth, browserLocalPersistence);

// Configure Google provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});