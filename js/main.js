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

// Initialize Firebase - These are now global within this file's scope
const app = firebase.initializeApp(firebaseConfig); // Assign app to a variable
const auth = firebase.auth();
const db = firebase.firestore();

// --- Event Listeners and Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    // Attach Firebase instances and global variables to window after DOM is ready
    // This makes them accessible to other scripts loaded before this one
    // or functions called from this script that are defined in other files.
    window.auth = auth;
    window.db = db;

    // Define global access to state and utility functions
    // It's crucial that these are defined *before* any functions in other modules
    // try to use them, or they need to be passed as arguments.
    // The current loading order (domElements, utils, gameLogic, gameUI, admin, auth, main)
    // means global variables and functions from earlier files *are* available to later ones.
    // However, explicitly assigning them to `window` here ensures they are truly global
    // *after* Firebase has been initialized and the DOM is ready for event listeners.

    // Global state variables (declared in utils.js)
    window.currentUser = null;
    window.currentGameState = null;
    window.currentGameId = null;
    window.currentPlayerId = null;
    window.currentPlayerName = null;
    window.isGameMaster = false;
    window.gameSubscription = null;
    window.playersSubscription = null;
    window.sampleQuestions = sampleQuestions; // from utils.js

    // Utility functions (from utils.js)
    window.generateGameId = generateGameId;
    window.hideAllSections = hideAllSections;
    window.showSection = showSection;
    window.applyTheme = applyTheme;

    // Auth functions (from auth.js)
    window.updateAuthUI = updateAuthUI;
    window.displayAuthError = displayAuthError;
    window.signInWithGoogle = signInWithGoogle;
    window.signUpWithEmail = signUpWithEmail;
    window.signInWithEmail = signInWithEmail;
    window.signInAnonymously = signInAnonymously;
    window.signOutUser = signOutUser;
    window.checkInitialAuthToken = checkInitialAuthToken; // Make global to call from here

    // Game Logic functions (from gameLogic.js)
    window.createGame = createGame;
    window.joinGame = joinGame;
    window.currentPlayerNameInput = currentPlayerNameInput;
    window.startGame = startGame;
    window.updateGameQuestionsInFirestore = updateGameQuestionsInFirestore;
    window.nextQuestion = nextQuestion;
    window.togglePauseGame = togglePauseGame;
    window.toggleLeaderboardVisibility = toggleLeaderboardVisibility;
    window.endGame = endGame;
    window.leaveGame = leaveGame;
    window.submitAnswer = submitAnswer;
    window.listenToGameChanges = listenToGameChanges;

    // Game UI functions (from gameUI.js)
    window.renderUI = renderUI;
    window.renderLobbyPlayers = renderLobbyPlayers;
    window.renderGameMasterControls = renderGameMasterControls;
    window.updatePauseButtonState = updatePauseButtonState;
    window.displayQuestion = displayQuestion;
    window.renderLeaderboard = renderLeaderboard;
    window.renderFinalLeaderboard = renderFinalLeaderboard;

    // Admin functions (from admin.js)
    window.addOptionInput = addOptionInput;
    window.displayAdminFeedback = displayAdminFeedback;
    window.clearAdminForm = clearAdminForm;
    window.submitNewQuestion = submitNewQuestion;

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