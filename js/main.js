// js/main.js

// Firebase Configuration (Replace with your actual config)
const firebaseConfig = {
    apiKey: "@@FIREBASE_API_KEY@@",
    authDomain: "@@FIREBASE_AUTH_DOMAIN@@",
    projectId: "@@FIREBASE_PROJECT_ID@@",
    storageBucket: "@@FIREBASE_STORAGE_BUCKET@@",
    messagingSenderId: "@@FIREBASE_MESSAGING_SENDER_ID@@",
    appId: "@@FIREBASE_APP_ID@@",
};

// Initialize Firebase - These are global to main.js's scope
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Make Firebase instances globally accessible immediately
window.auth = auth;
window.db = db;

// --- Event Listeners and Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {

    // Global state variables (declared in utils.js, now also attached to window there)
    // No need to re-assign if utils.js directly puts them on window.
    // If they are just `let` declarations in utils.js, then you need to manage
    // state via a single object or similar. For simplicity, let's assume utils.js
    // also uses window. for its globals or they are only accessed in their own files.

    // If utils.js also assigns its globals to window (as in the suggested utils.js content):
    // window.currentUser, window.currentGameState, etc. are already global.

    // If functions like signInWithGoogle are declared `function signInWithGoogle() { ... }` in auth.js,
    // they become globally available by default as soon as auth.js runs.
    // So, explicitly doing `window.signInWithGoogle = signInWithGoogle;` within DOMContentLoaded
    // might be redundant if they're already global.
    // The previous main.js content was correct in making these global,
    // but the problem was DOM elements not being global early enough.

    // Re-confirm all global access from other files:
    // If your other files (`utils.js`, `auth.js`, `gameLogic.js`, `gameUI.js`, `admin.js`)
    // are structured like: `function myFunc() { ... }`, these functions automatically
    // become global properties of `window` when their script file runs.
    // The only global variables that might need explicit `window.` are `let` or `const`
    // at the top level of those files, unless they are already set on `window` in their own file.

    // Given the current setup, `domElements.js` and `utils.js` *should* be modified
    // to place their variables/functions directly on the window object, or
    // we need to pass them around explicitly.
    // The safest is to explicitly attach all to window at the start of DOMContentLoaded.

    // This ensures all element references from domElements.js are available here.
    // (Assuming domElements.js is loaded BEFORE main.js as in index.html)

    // --- All Event Listeners ---
    // Auth listeners
    googleSignInBtn.addEventListener('click', signInWithGoogle);
    emailSignUpBtn.addEventListener('click', signUpWithEmail);
    emailSignInBtn.addEventListener('click', signInWithEmail);
    anonymousSignInBtn.addEventListener('click', signInAnonymously);
    signoutBtn.addEventListener('click', signOutUser);

    // Game lobby/creation listeners
    createGameBtn.addEventListener('click', createGame);
    joinGameBtn.addEventListener('click', joinGame);
    startGameBtn.addEventListener('click', startGame);
    leaveLobbyBtn.addEventListener('click', leaveGame);

    // In-game controls listeners
    nextQuestionBtn.addEventListener('click', nextQuestion);
    togglePauseBtn.addEventListener('click', togglePauseGame);
    showLeaderboardBtn.addEventListener('click', toggleLeaderboardVisibility);
    endGameBtn.addEventListener('click', endGame);

    // Game over listeners
    playAgainBtn.addEventListener('click', () => {
        showSection(authSection);
        applyTheme('neutral');
    });
    returnHomeBtn.addEventListener('click', () => {
        showSection(authSection);
        applyTheme('neutral');
    });

    // Admin Event Listeners
    goToAdminBtn.addEventListener('click', () => {
        if (currentUser) {
            showSection(adminSection);
            applyTheme('neutral');
            clearAdminForm();
        } else {
            alert("You must be logged in to access the Admin page.");
            showSection(authSection);
        }
    });
    backToHomeFromAdminBtn.addEventListener('click', () => {
        showSection(authSection);
        applyTheme('neutral');
    });
    addOptionBtn.addEventListener('click', addOptionInput);
    submitQuestionBtn.addEventListener('click', submitNewQuestion);

    // Initial check for auth token and then sign in anonymously if needed
    checkInitialAuthToken();

    // Initialize the admin form with two options on load
    clearAdminForm();
});

// The firebase.initializeApp call does NOT need to be inside DOMContentLoaded,
// as it doesn't interact with the DOM directly. It can run as soon as SDKs are available.
// Keep it outside to initialize Firebase immediately.
// The variables `app`, `auth`, `db` are defined above this listener.