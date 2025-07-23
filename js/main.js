// js/main.js

// Firebase Configuration (Replace with your actual config)
// This will be processed by build-vars.js
const firebaseConfig = {
    apiKey: "@@FIREBASE_API_KEY@@",
    authDomain: "@@FIREBASE_AUTH_DOMAIN@@",
    projectId: "@@FIREBASE_PROJECT_ID@@",
    storageBucket: "@@FIREBASE_STORAGE_BUCKET@@",
    messagingSenderId: "@@FIREBASE_MESSAGING_SENDER_ID@@",
    appId: "@@FIREBASE_APP_ID@@",
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // if already initialized, use that one
}

const auth = firebase.auth();
const db = firebase.firestore();

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
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

    // Initial checks and form setup
    checkInitialAuthToken();
    clearAdminForm(); // Initialize the admin form with two options on page load
});

// Define global access to Firebase instances for other modules
// For a small project, attaching to window can work. For larger,
// consider passing these as arguments or using a more formal module system.
window.firebaseConfig = firebaseConfig; // Needed by build-vars.js
window.auth = auth;
window.db = db;

// Define global access to state and utility functions
// This is important because the separate files won't share scope automatically
// without explicit export/import or attaching to window.
// Given this is a simple setup without module bundlers, attaching to window is practical.
window.currentUser = currentUser;
window.currentGameState = currentGameState;
window.currentGameId = currentGameId;
window.currentPlayerId = currentPlayerId;
window.currentPlayerName = currentPlayerName;
window.isGameMaster = isGameMaster;
window.gameSubscription = gameSubscription;
window.playersSubscription = playersSubscription;
window.sampleQuestions = sampleQuestions; // Keep for initial populate

// Utility functions
window.generateGameId = generateGameId;
window.hideAllSections = hideAllSections;
window.showSection = showSection;
window.applyTheme = applyTheme;
window.updateAuthUI = updateAuthUI;
window.displayAuthError = displayAuthError;

// Auth functions
window.signInWithGoogle = signInWithGoogle;
window.signUpWithEmail = signUpWithEmail;
window.signInWithEmail = signInWithEmail;
window.signInAnonymously = signInAnonymously;
window.signOutUser = signOutUser;
window.checkInitialAuthToken = checkInitialAuthToken;

// Game Logic functions
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

// Game UI functions
window.renderUI = renderUI;
window.renderLobbyPlayers = renderLobbyPlayers;
window.renderGameMasterControls = renderGameMasterControls;
window.updatePauseButtonState = updatePauseButtonState;
window.displayQuestion = displayQuestion;
window.renderLeaderboard = renderLeaderboard;
window.renderFinalLeaderboard = renderFinalLeaderboard;

// Admin functions
window.addOptionInput = addOptionInput;
window.displayAdminFeedback = displayAdminFeedback;
window.clearAdminForm = clearAdminForm;
window.submitNewQuestion = submitNewQuestion;