// script.js

// Firebase Configuration (Replace with your actual config)
const firebaseConfig = {
    apiKey: "@@FIREBASE_API_KEY@@",
    authDomain: "@@FIREBASE_AUTH_DOMAIN@@",
    projectId: "@@FIREBASE_PROJECT_ID@@",
    storageBucket: "@@FIREBASE_STORAGE_BUCKET@@",
    messagingSenderId: "@@FIREBASE_MESSAGING_SENDER_ID@@",
    appId: "@@FIREBASE_APP_ID@@",
    // measurementId: "@@FIREBASE_MEASUREMENT_ID@@" // Optional
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // if already initialized, use that one
}

const auth = firebase.auth();
const db = firebase.firestore();

// --- DOM Elements ---
const appDiv = document.getElementById('app');
const authSection = document.getElementById('auth-section');
const lobbySection = document.getElementById('lobby-section');
const gameSection = document.getElementById('game-section');
const gameOverSection = document.getElementById('game-over-section');

// Auth elements
const googleSignInBtn = document.getElementById('google-signin-btn');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const emailSignUpBtn = document.getElementById('email-signup-btn');
const emailSignInBtn = document.getElementById('email-signin-btn');
const anonymousSignInBtn = document.getElementById('anonymous-signin-btn');
const authError = document.getElementById('auth-error');
const userInfo = document.getElementById('user-info');
const userDisplayName = document.getElementById('user-display-name');
const userUid = document.getElementById('user-uid');
const signoutBtn = document.getElementById('signout-btn');
const gameOptions = document.getElementById('game-options');

// Lobby elements
const createGameBtn = document.getElementById('create-game-btn');
const gameIdInput = document.getElementById('game-id-input');
const playerNameInput = document.getElementById('player-name-input');
const joinGameBtn = document.getElementById('join-game-btn');
const lobbyGameId = document.getElementById('lobby-game-id');
const playersInLobby = document.getElementById('players-in-lobby');
const gameMasterControlsLobby = document.getElementById('game-master-controls-lobby');
const gameModeSelect = document.getElementById('game-mode-select');
const displayModeSelect = document.getElementById('display-mode-select');
const startGameBtn = document.getElementById('start-game-btn');
const leaveLobbyBtn = document.getElementById('leave-lobby-btn');

// Game elements
const questionNumberElem = document.getElementById('question-number');
const questionTextElem = document.getElementById('question-text');
const answersContainer = document.getElementById('answers-container');
const feedbackArea = document.getElementById('feedback-area');
const currentPlayerScoreElem = document.getElementById('current-player-score');
const playerScoreValueElem = document.getElementById('player-score-value');
const gameMasterControlsGame = document.getElementById('game-master-controls-game');
const nextQuestionBtn = document.getElementById('next-question-btn');
const togglePauseBtn = document.getElementById('toggle-pause-btn');
const showLeaderboardBtn = document.getElementById('show-leaderboard-btn');
const endGameBtn = document.getElementById('end-game-btn');
const leaderboardSection = document.getElementById('leaderboard-section');
const leaderboardList = document.getElementById('leaderboard-list');

// Game Over elements
const finalLeaderboardList = document.getElementById('final-leaderboard-list');
const playAgainBtn = document.getElementById('play-again-btn');
const returnHomeBtn = document.getElementById('return-home-btn');

// --- Global Variables ---
let currentUser = null;
let currentGameState = null;
let currentGameId = null;
let currentPlayerId = null; // This will be the userId from Firebase Auth
let currentPlayerName = null;
let isGameMaster = false;
let gameSubscription = null; // To store the Firestore snapshot listener unsubscribe function
let playersSubscription = null; // To store the Firestore snapshot listener for players

// --- Sample Questions (Hardcoded for initial setup) ---
const sampleQuestions = {
    adult: [
        {
            question: "What year did the Titanic sink?",
            options: ["1910", "1912", "1914", "1916"],
            correctAnswer: "1912"
        },
        {
            question: "Which planet is known as the 'Red Planet'?",
            options: ["Earth", "Mars", "Jupiter", "Venus"],
            correctAnswer: "Mars"
        },
        {
            question: "What is the capital of France?",
            options: ["Berlin", "Madrid", "Paris", "Rome"],
            correctAnswer: "Paris"
        },
        {
            question: "Who painted the Mona Lisa?",
            options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"],
            correctAnswer: "Leonardo da Vinci"
        },
        {
            question: "What is the largest ocean on Earth?",
            options: ["Atlantic", "Indian", "Arctic", "Pacific"],
            correctAnswer: "Pacific"
        }
    ],
    kids: [
        {
            question: "What color is a banana?",
            options: ["Red", "Blue", "Yellow", "Green"],
            correctAnswer: "Yellow"
        },
        {
            question: "How many legs does a dog have?",
            options: ["Two", "Four", "Six", "Eight"],
            correctAnswer: "Four"
        },
        {
            question: "Which animal says 'Moo'?",
            options: ["Cat", "Cow", "Pig", "Duck"],
            correctAnswer: "Cow"
        },
        {
            question: "What do bees make?",
            options: ["Milk", "Honey", "Bread", "Cheese"],
            correctAnswer: "Honey"
        },
        {
            question: "What shape is a regular soccer ball?",
            options: ["Square", "Triangle", "Circle", "Star"],
            correctAnswer: "Circle"
        }
    ]
};

// --- Utility Functions ---

/**
 * Generates a unique 6-character alphanumeric game ID.
 * @returns {string} Unique game ID.
 */
function generateGameId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Hides all main sections of the application.
 */
function hideAllSections() {
    authSection.classList.add('hidden', 'opacity-0');
    lobbySection.classList.add('hidden', 'opacity-0');
    gameSection.classList.add('hidden', 'opacity-0');
    gameOverSection.classList.add('hidden', 'opacity-0');
}

/**
 * Shows a specific section with a fade-in effect.
 * @param {HTMLElement} sectionElement The section to show.
 */
function showSection(sectionElement) {
    hideAllSections();
    sectionElement.classList.remove('hidden');
    // Force reflow to ensure transition plays
    void sectionElement.offsetWidth;
    sectionElement.classList.remove('opacity-0');
    sectionElement.classList.add('opacity-100');
}

/**
 * Applies the specified theme to the body.
 * @param {string} theme 'neutral', 'adult', or 'kids'.
 */
function applyTheme(theme) {
    document.body.classList.remove('theme-neutral', 'theme-adult', 'theme-kids');
    document.body.classList.add(`theme-${theme}`);
}

/**
 * Updates the user information display after authentication.
 */
function updateAuthUI() {
    if (currentUser) {
        userInfo.classList.remove('hidden');
        gameOptions.classList.remove('hidden');
        userDisplayName.textContent = currentUser.displayName || (currentUser.isAnonymous ? 'Anonymous User' : currentUser.email || 'Unknown User');
        userUid.textContent = currentUser.uid;
        authSection.querySelector('.mb-4:first-of-type').classList.add('hidden'); // Hide login/signup fields
    } else {
        userInfo.classList.add('hidden');
        gameOptions.classList.add('hidden');
        authSection.querySelector('.mb-4:first-of-type').classList.remove('hidden'); // Show login/signup fields
    }
    authError.textContent = ''; // Clear any previous errors
}

/**
 * Displays an error message in the auth section.
 * @param {string} message The error message to display.
 */
function displayAuthError(message) {
    authError.textContent = message;
}

// --- Firebase Authentication ---

auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    if (user) {
        currentPlayerId = user.uid; // Set current player ID from authenticated user
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('__initial_auth_token');
        if (token && !user.isAnonymous) {
            // If token exists and user is not anonymous, it implies we might have just authenticated via token.
            // We can perhaps do a check if the token matches a previous session or just proceed.
            // For now, let's simply update UI if already logged in.
        } else if (token && user.isAnonymous) {
            // If token exists and user is anonymous, it could be a scenario where we want to link.
            // For this project, we prioritize the new auth options.
            // If anonymous and a token is provided, we can choose to sign out and force login or link account.
            // For simplicity, we'll proceed with anonymous for now if no other sign-in happened.
        }

        // Check if player name is already stored in local storage
        const storedPlayerName = localStorage.getItem('playerName');
        if (storedPlayerName) {
            playerNameInput.value = storedPlayerName;
            currentPlayerName = storedPlayerName;
        } else {
            // Prompt for player name if not set, or use display name if available
            playerNameInput.value = user.displayName || '';
            currentPlayerName = user.displayName || 'Player';
        }

        updateAuthUI();
        showSection(authSection); // Stay on auth section to choose game options
        applyTheme('neutral');
    } else {
        currentUser = null;
        currentPlayerId = null;
        currentPlayerName = null;
        updateAuthUI();
        showSection(authSection);
        applyTheme('neutral');
    }
});

async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
    } catch (error) {
        displayAuthError(error.message);
    }
}

async function signUpWithEmail() {
    const email = emailInput.value;
    const password = passwordInput.value;
    if (!email || !password) {
        displayAuthError('Email and Password are required for sign up.');
        return;
    }
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        alert('Account created successfully! You are now logged in.');
    } catch (error) {
        displayAuthError(error.message);
    }
}

async function signInWithEmail() {
    const email = emailInput.value;
    const password = passwordInput.value;
    if (!email || !password) {
        displayAuthError('Email and Password are required for sign in.');
        return;
    }
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        displayAuthError(error.message);
    }
}

async function signInAnonymously() {
    try {
        await auth.signInAnonymously();
    } catch (error) {
        displayAuthError(error.message);
    }
}

async function signOutUser() {
    try {
        await auth.signOut();
        // Clean up game state if user logs out while in a game
        if (gameSubscription) {
            gameSubscription();
            gameSubscription = null;
        }
        if (playersSubscription) {
            playersSubscription();
            playersSubscription = null;
        }
        currentGameState = null;
        currentGameId = null;
        isGameMaster = false;
        localStorage.removeItem('playerName');
        showSection(authSection); // Go back to auth screen
        applyTheme('neutral');
    } catch (error) {
        console.error("Error signing out:", error);
        alert("Error signing out. Please try again.");
    }
}

// Check for initial auth token on load
async function checkInitialAuthToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const initialAuthToken = urlParams.get('__initial_auth_token');
    if (initialAuthToken) {
        try {
            // Attempt to sign in with the custom token
            await auth.signInWithCustomToken(initialAuthToken);
            console.log("Signed in with initial auth token.");
            // Remove token from URL to keep it clean
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
            console.error("Error signing in with initial auth token:", error);
            displayAuthError("Could not sign in with provided token. Please try another method.");
            // If token fails, allow other sign-in options
            if (!currentUser) { // Only sign in anonymously if no user is logged in
                await signInAnonymously(); // Fallback to anonymous if token fails
            }
        }
    } else {
        // If no token, proceed with anonymous or existing session
        if (!currentUser) { // Only sign in anonymously if no user is logged in
            await signInAnonymously();
        }
    }
}

// --- Game Logic ---

/**
 * Creates a new game session.
 */
async function createGame() {
    if (!currentPlayerNameInput()) return;
    isGameMaster = true;
    const gameId = generateGameId();
    currentGameId = gameId;

    try {
        await db.collection('games').doc(gameId).set({
            gameId: gameId,
            gameMasterId: currentPlayerId,
            currentQuestionIndex: -1, // -1 means lobby, 0+ means game in progress
            mode: 'adult', // Default mode
            displayMode: 'shared', // Default display mode
            gameStatus: 'lobby',
            players: {
                [currentPlayerId]: {
                    id: currentPlayerId,
                    name: currentPlayerName,
                    score: 0,
                    isGameMaster: true,
                    lastAnswer: null
                }
            },
            quizStartedAt: null,
            paused: false,
            leaderboardVisible: false // New field for controlling leaderboard visibility by GM
        });
        console.log(`Game created with ID: ${gameId}`);
        await updateGameQuestionsInFirestore(gameId, 'adult'); // Populate initial questions

        listenToGameChanges(gameId);
        showSection(lobbySection);
        applyTheme('neutral');
    } catch (error) {
        console.error("Error creating game:", error);
        alert("Failed to create game. " + error.message);
    }
}

/**
 * Joins an existing game session.
 */
async function joinGame() {
    if (!currentPlayerNameInput()) return;
    isGameMaster = false;
    const gameId = gameIdInput.value.trim().toUpperCase();
    if (!gameId) {
        alert("Please enter a Game ID.");
        return;
    }
    currentGameId = gameId;

    try {
        const gameRef = db.collection('games').doc(gameId);
        const gameDoc = await gameRef.get();

        if (!gameDoc.exists) {
            alert("Game ID not found.");
            return;
        }

        const gameData = gameDoc.data();
        if (gameData.gameStatus !== 'lobby') {
            alert("This game has already started or finished. You cannot join now.");
            return;
        }

        // Add player to the game
        await gameRef.update({
            [`players.${currentPlayerId}`]: {
                id: currentPlayerId,
                name: currentPlayerName,
                score: 0,
                isGameMaster: false,
                lastAnswer: null
            }
        });

        console.log(`Joined game ${gameId}`);
        listenToGameChanges(gameId);
        showSection(lobbySection);
        applyTheme('neutral');
    } catch (error) {
        console.error("Error joining game:", error);
        alert("Failed to join game. " + error.message);
    }
}

/**
 * Ensures player name is entered and stored.
 * @returns {boolean} True if name is valid, false otherwise.
 */
function currentPlayerNameInput() {
    currentPlayerName = playerNameInput.value.trim();
    if (!currentPlayerName) {
        alert("Please enter your name.");
        playerNameInput.focus();
        return false;
    }
    localStorage.setItem('playerName', currentPlayerName); // Store for persistence
    return true;
}

/**
 * Starts the quiz game. Only Game Master can call this.
 */
async function startGame() {
    if (!isGameMaster || !currentGameId) return;

    const selectedMode = gameModeSelect.value;
    const selectedDisplayMode = displayModeSelect.value;

    try {
        await db.collection('games').doc(currentGameId).update({
            gameStatus: 'inProgress',
            currentQuestionIndex: 0, // Start with the first question
            mode: selectedMode,
            displayMode: selectedDisplayMode,
            quizStartedAt: firebase.firestore.FieldValue.serverTimestamp(),
            paused: false,
            leaderboardVisible: false
        });
        console.log("Game started!");
    } catch (error) {
        console.error("Error starting game:", error);
        alert("Failed to start game. " + error.message);
    }
}

/**
 * Populates Firestore with questions for a given game ID and mode.
 * This is called by the Game Master when creating a game to ensure questions exist.
 * @param {string} gameId The ID of the game.
 * @param {string} mode 'adult' or 'kids'.
 */
async function updateGameQuestionsInFirestore(gameId, mode) {
    const gameQuestionsRef = db.collection('games').doc(gameId).collection('questions');
    const existingQuestionsSnapshot = await gameQuestionsRef.get();

    if (existingQuestionsSnapshot.empty || existingQuestionsSnapshot.docs[0].data().mode !== mode) {
        // If no questions or mode changed, clear and add new ones
        const batch = db.batch();
        existingQuestionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

        sampleQuestions[mode].forEach((q, index) => {
            const docRef = gameQuestionsRef.doc(`q${index}`); // Use simple doc IDs
            batch.set(docRef, { ...q, index: index, mode: mode });
        });
        await batch.commit();
        console.log(`Questions for mode '${mode}' added to Firestore for game ${gameId}`);
    }
}

/**
 * Advances to the next question or ends the game. Only Game Master can call this.
 */
async function nextQuestion() {
    if (!isGameMaster || !currentGameState || !currentGameId) return;

    let nextIndex = currentGameState.currentQuestionIndex + 1;
    const questionsCount = sampleQuestions[currentGameState.mode].length; // Assuming questions are already populated

    try {
        // Clear last answers for all players before moving to next question
        const playersUpdate = {};
        Object.keys(currentGameState.players).forEach(playerId => {
            playersUpdate[`players.${playerId}.lastAnswer`] = null;
        });
        await db.collection('games').doc(currentGameId).update(playersUpdate);

        if (nextIndex < questionsCount) {
            await db.collection('games').doc(currentGameId).update({
                currentQuestionIndex: nextIndex,
                paused: false, // Unpause when moving to next question
                leaderboardVisible: false // Hide leaderboard for new question
            });
            console.log(`Advanced to question ${nextIndex + 1}`);
        } else {
            // End the game
            await db.collection('games').doc(currentGameId).update({
                gameStatus: 'finished',
                currentQuestionIndex: -1, // Reset index
                leaderboardVisible: true // Show final leaderboard
            });
            console("Game ended!");
        }
    } catch (error) {
        console.error("Error advancing question:", error);
        alert("Failed to advance question. " + error.message);
    }
}

/**
 * Toggles the game pause state. Only Game Master can call this.
 */
async function togglePauseGame() {
    if (!isGameMaster || !currentGameState || !currentGameId) return;

    try {
        await db.collection('games').doc(currentGameId).update({
            paused: !currentGameState.paused
        });
        console.log(`Game is now ${currentGameState.paused ? 'resumed' : 'paused'}`);
    } catch (error) {
        console.error("Error toggling pause:", error);
    }
}

/**
 * Toggles the leaderboard visibility. Only Game Master can call this.
 */
async function toggleLeaderboardVisibility() {
    if (!isGameMaster || !currentGameState || !currentGameId) return;

    try {
        await db.collection('games').doc(currentGameId).update({
            leaderboardVisible: !currentGameState.leaderboardVisible
        });
    } catch (error) {
        console.error("Error toggling leaderboard visibility:", error);
    }
}


/**
 * Ends the game session. Only Game Master can call this.
 */
async function endGame() {
    if (!isGameMaster || !currentGameId) return;

    if (confirm("Are you sure you want to end the game?")) {
        try {
            await db.collection('games').doc(currentGameId).update({
                gameStatus: 'finished',
                currentQuestionIndex: -1,
                leaderboardVisible: true
            });
            console.log("Game explicitly ended by Game Master.");
        } catch (error) {
            console.error("Error ending game:", error);
            alert("Failed to end game. " + error.message);
        }
    }
}

/**
 * Allows a player to leave the current lobby/game.
 */
async function leaveGame() {
    if (!currentGameId || !currentPlayerId) return;

    try {
        // Unsubscribe from game changes
        if (gameSubscription) {
            gameSubscription();
            gameSubscription = null;
        }
        if (playersSubscription) {
            playersSubscription();
            playersSubscription = null;
        }

        // Remove player from the game or delete game if GM and no other players
        const gameRef = db.collection('games').doc(currentGameId);
        const gameDoc = await gameRef.get();
        if (gameDoc.exists) {
            const gameData = gameDoc.data();
            const currentPlayers = gameData.players || {};

            if (isGameMaster) {
                // If GM leaves, and no other players, delete the game
                const otherPlayers = Object.values(currentPlayers).filter(p => p.id !== currentPlayerId);
                if (otherPlayers.length === 0) {
                    await gameRef.delete();
                    console.log(`Game ${currentGameId} deleted as GM left and no other players.`);
                } else {
                    alert("As Game Master, you cannot leave the game if other players are present. Please end the game first.");
                    listenToGameChanges(currentGameId); // Re-subscribe if cannot leave
                    return;
                }
            } else {
                // Regular player leaves
                delete currentPlayers[currentPlayerId];
                await gameRef.update({
                    players: currentPlayers
                });
                console.log(`Player ${currentPlayerName} left game ${currentGameId}`);
            }
        }

        currentGameState = null;
        currentGameId = null;
        isGameMaster = false;
        showSection(authSection); // Go back to home
        applyTheme('neutral');
    } catch (error) {
        console.error("Error leaving game:", error);
        alert("Failed to leave game. " + error.message);
    }
}


/**
 * Submits a player's answer.
 * @param {string} answer The selected answer.
 */
async function submitAnswer(answer) {
    if (!currentGameId || !currentPlayerId || !currentGameState || currentGameState.paused) return;

    const gameRef = db.collection('games').doc(currentGameId);
    const currentQuestion = sampleQuestions[currentGameState.mode][currentGameState.currentQuestionIndex];

    const isCorrect = answer === currentQuestion.correctAnswer;
    let newScore = currentGameState.players[currentPlayerId].score;

    // Only update score if they haven't answered this question yet
    if (currentGameState.players[currentPlayerId].lastAnswer === null) {
        if (isCorrect) {
            newScore += 10; // Award 10 points for correct answer
        }
        await gameRef.update({
            [`players.${currentPlayerId}.score`]: newScore,
            [`players.${currentPlayerId}.lastAnswer`]: answer // Record last answer
        });
    } else {
        console.log("Already answered this question.");
    }
}

/**
 * Listens to real-time changes in the game state from Firestore.
 * @param {string} gameId The ID of the game to listen to.
 */
function listenToGameChanges(gameId) {
    if (gameSubscription) {
        gameSubscription(); // Unsubscribe from previous game if any
    }

    gameSubscription = db.collection('games').doc(gameId)
        .onSnapshot(async (doc) => {
            if (!doc.exists) {
                console.log("Game has been deleted or no longer exists.");
                alert("The game has ended or the host left.");
                leaveGame(); // Force current player to leave too
                return;
            }

            currentGameState = doc.data();
            lobbyGameId.textContent = currentGameState.gameId;

            // Determine if current user is Game Master
            isGameMaster = (currentGameState.gameMasterId === currentPlayerId);

            // Update questions if mode changes (for GM)
            if (isGameMaster && currentGameState.gameStatus === 'lobby') {
                await updateGameQuestionsInFirestore(gameId, currentGameState.mode);
            }

            renderUI(currentGameState);
        }, (error) => {
            console.error("Error listening to game changes:", error);
            alert("Lost connection to game. Please try to rejoin.");
            leaveGame(); // Attempt to leave on error
        });
}

/**
 * Renders the UI based on the current game state and user role.
 * @param {object} gameState The current game state object.
 */
function renderUI(gameState) {
    const { gameStatus, currentQuestionIndex, mode, displayMode, players, leaderboardVisible } = gameState;

    applyTheme(mode === 'adult' ? 'adult' : mode === 'kids' ? 'kids' : 'neutral');

    if (gameStatus === 'lobby') {
        showSection(lobbySection);
        renderLobbyPlayers(players);
        gameMasterControlsLobby.classList.toggle('hidden', !isGameMaster);
        gameModeSelect.value = mode; // Set selected mode
        displayModeSelect.value = displayMode; // Set selected display mode
    } else if (gameStatus === 'inProgress') {
        showSection(gameSection);
        renderGameMasterControls(isGameMaster);
        updatePauseButtonState(gameState.paused);

        // Fetch the current question from Firestore if it's the Game Master or in Individual mode
        if (isGameMaster || displayMode === 'individual') {
            const questionIndexAtCall = currentQuestionIndex; // Capture the index
            const modeAtCall = mode; // Capture the mode
            const playersAtCall = players; // Capture players
            const currentPlayerIdAtCall = currentPlayerId; // Capture current player ID

            db.collection('games').doc(currentGameId).collection('questions').doc(`q${questionIndexAtCall}`).get()
                .then(questionDoc => {
                    if (questionDoc.exists) {
                        // Pass currentQuestionIndex explicitly as questionNumber
                        displayQuestion(questionDoc.data(), displayMode, players, currentPlayerId, questionIndexAtCall);
                    } else {
                        questionTextElem.textContent = "Loading question...";
                        answersContainer.innerHTML = '';
                    }
                })
                .catch(error => {
                    console.error("Error fetching question:", error);
                    questionTextElem.textContent = "Error loading question.";
                    answersContainer.innerHTML = '';
                });
        } else { // Player in Shared Screen mode
            // Player's phone shows simplified interface for input
            questionTextElem.textContent = "Look at the Game Master's screen for the question!";
            answersContainer.innerHTML = ''; // Clear options from player's phone by default
            feedbackArea.textContent = '';
            currentPlayerScoreElem.classList.remove('hidden');
            playerScoreValueElem.textContent = players[currentPlayerId]?.score || 0;

            // If Game Master's leaderboard is visible, show it on player's screen too.
            if (leaderboardVisible) {
                renderLeaderboard(players);
                leaderboardSection.classList.remove('hidden');
            } else {
                leaderboardSection.classList.add('hidden');
            }

            // Still need to show answer buttons for the current question
            const currentQuestion = sampleQuestions[mode][currentQuestionIndex]; // Get from local cache
            if (currentQuestion) {
                currentQuestion.options.forEach(option => {
                    const button = document.createElement('button');
                    button.textContent = option;
                    button.className = 'answer-button w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50';
                    button.onclick = () => submitAnswer(option);
                    answersContainer.appendChild(button);
                });
                // Show feedback if the player has answered
                const playerAnswer = players[currentPlayerId]?.lastAnswer;
                if (currentQuestion) {
                // Call displayQuestion for players in shared mode with explicit question data/number
                // Note: displayQuestion expects the full question object, not just options
                // This else block's logic for players in shared screen mode needs a slight refactor
                // to properly use displayQuestion or to have its own simplified display.
                // For now, let's just make sure the `sampleQuestions` access is safe.
                if (currentQuestionIndex !== -1 && sampleQuestions[mode] && sampleQuestions[mode][currentQuestionIndex]) {
                    const playerQuestionData = sampleQuestions[mode][currentQuestionIndex];
                    displayQuestion(playerQuestionData, displayMode, players, currentPlayerId, currentQuestionIndex);
                    // Adjusting the display for shared screen mode if displayQuestion is comprehensive
                    // The current if/else logic might be slightly redundant if displayQuestion handles all
                    // aspects including hiding things for shared mode player phones.
                } else {
                    questionTextElem.textContent = "Look at the Game Master's screen for the question!";
                    answersContainer.innerHTML = ''; // Clear options from player's phone by default
                    feedbackArea.textContent = '';
                    currentPlayerScoreElem.classList.remove('hidden');
                    playerScoreValueElem.textContent = players[currentPlayerId]?.score || 0;
                }

                // Existing logic to show feedback/buttons if playerAnswer is not null
                const playerAnswer = players[currentPlayerId]?.lastAnswer;
                if (playerAnswer !== null && currentQuestion) { // Ensure currentQuestion is defined
                    if (playerAnswer === currentQuestion.correctAnswer) {
                        feedbackArea.textContent = "Correct!";
                        feedbackArea.className = 'text-center mt-6 text-lg font-semibold text-green-600';
                    } else {
                        feedbackArea.textContent = `Incorrect! Correct answer was: ${currentQuestion.correctAnswer}`;
                        feedbackArea.className = 'text-center mt-6 text-lg font-semibold text-red-600';
                    }
                    Array.from(answersContainer.children).forEach(btn => btn.disabled = true);
                } else if (currentQuestion) { // Only enable buttons if currentQuestion is available and no answer yet
                    Array.from(answersContainer.children).forEach(btn => btn.disabled = false);
                }
            }

        }
    }
        // Always show leaderboard if GM has enabled it, or if it's Individual mode for all.
        if (leaderboardVisible || displayMode === 'individual') {
            renderLeaderboard(players);
            leaderboardSection.classList.remove('hidden');
        } else {
            leaderboardSection.classList.add('hidden');
        }

    } else if (gameStatus === 'finished') {
        showSection(gameOverSection);
        renderFinalLeaderboard(players);
        // Clear any active game subscriptions
        if (gameSubscription) {
            gameSubscription();
            gameSubscription = null;
        }
        if (playersSubscription) {
            playersSubscription();
            playersSubscription = null;
        }
        currentGameState = null; // Reset game state
        currentGameId = null;
        isGameMaster = false;
    }
}

/**
 * Renders the list of players in the lobby.
 * @param {object} players Object containing player data.
 */
function renderLobbyPlayers(players) {
    playersInLobby.innerHTML = '';
    Object.values(players).forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player.name} ${player.isGameMaster ? '(Game Master)' : ''}`;
        li.className = 'py-1 text-gray-800';
        playersInLobby.appendChild(li);
    });
}

/**
 * Renders Game Master controls based on role.
 * @param {boolean} isGM True if current user is Game Master.
 */
function renderGameMasterControls(isGM) {
    gameMasterControlsGame.classList.toggle('hidden', !isGM);
    // Hide player-specific score if GM
    currentPlayerScoreElem.classList.toggle('hidden', isGM);
}

/**
 * Updates the text and style of the pause button.
 * @param {boolean} isPaused Current pause state.
 */
function updatePauseButtonState(isPaused) {
    togglePauseBtn.textContent = isPaused ? 'Resume Game' : 'Pause Game';
    togglePauseBtn.classList.toggle('bg-yellow-500', !isPaused);
    togglePauseBtn.classList.toggle('hover:bg-yellow-600', !isPaused);
    togglePauseBtn.classList.toggle('bg-green-500', isPaused);
    togglePauseBtn.classList.toggle('hover:bg-green-600', isPaused);
}

/**
 * Displays the current question and answer options.
 * @param {object} question The current question object.
 * @param {string} displayMode The current display mode ('shared' or 'individual').
 * @param {object} players Object containing player data.
 * @param {string} currentPlayerId The ID of the current player.
 * @param {number} questionNumber The current question number (passed explicitly to avoid relying on global currentGameState).
 */
function displayQuestion(question, displayMode, players, currentPlayerId, questionNumber) { // Added questionNumber parameter
    // Use the passed questionNumber instead of relying on global currentGameState
    questionNumberElem.textContent = `Question ${questionNumber + 1}`;
    questionTextElem.textContent = question.question;
    answersContainer.innerHTML = '';
    feedbackArea.textContent = ''; // Clear feedback for new question
    currentPlayerScoreElem.classList.remove('hidden');
    playerScoreValueElem.textContent = players[currentPlayerId]?.score || 0;

    const playerAnswer = players[currentPlayerId]?.lastAnswer;

    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.className = 'answer-button w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50';
        button.onclick = () => submitAnswer(option);

        // Disable button if already answered
        if (playerAnswer !== null) {
            button.disabled = true;
            if (option === question.correctAnswer) {
                button.classList.add('correct');
            } else if (option === playerAnswer && option !== question.correctAnswer) {
                button.classList.add('incorrect');
            }
        }
        answersContainer.appendChild(button);
    });

    if (playerAnswer !== null) {
        if (playerAnswer === question.correctAnswer) {
            feedbackArea.textContent = "Correct!";
            feedbackArea.className = 'text-center mt-6 text-lg font-semibold text-green-600';
        } else {
            feedbackArea.textContent = `Incorrect! Correct answer was: ${question.correctAnswer}`;
            feedbackArea.className = 'text-center mt-6 text-lg font-semibold text-red-600';
        }
        // Disable answer buttons after submission
        Array.from(answersContainer.children).forEach(btn => btn.disabled = true);
    } else {
        // Ensure buttons are enabled if no answer submitted yet
        Array.from(answersContainer.children).forEach(btn => btn.disabled = false);
    }
}


/**
 * Renders the real-time leaderboard.
 * @param {object} players Object containing player data.
 * @param {HTMLElement} listContainer The UL element to render into.
 */
function renderLeaderboard(players, listContainer = leaderboardList) {
    listContainer.innerHTML = '';
    const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);

    sortedPlayers.forEach(player => {
        const li = document.createElement('li');
        li.className = 'leaderboard-item';
        li.innerHTML = `<span>${player.name}</span> <span class="text-purple-700">${player.score}</span>`;
        listContainer.appendChild(li);
    });
}

/**
 * Renders the final leaderboard at the end of the game.
 * @param {object} players Object containing player data.
 */
function renderFinalLeaderboard(players) {
    renderLeaderboard(players, finalLeaderboardList);
}


// --- Event Listeners ---
googleSignInBtn.addEventListener('click', signInWithGoogle);
emailSignUpBtn.addEventListener('click', signUpWithEmail);
emailSignInBtn.addEventListener('click', signInWithEmail);
anonymousSignInBtn.addEventListener('click', signInAnonymously);
signoutBtn.addEventListener('click', signOutUser);

createGameBtn.addEventListener('click', createGame);
joinGameBtn.addEventListener('click', joinGame);
startGameBtn.addEventListener('click', startGame);
leaveLobbyBtn.addEventListener('click', leaveGame);
nextQuestionBtn.addEventListener('click', nextQuestion);
togglePauseBtn.addEventListener('click', togglePauseGame);
showLeaderboardBtn.addEventListener('click', toggleLeaderboardVisibility);
endGameBtn.addEventListener('click', endGame);

playAgainBtn.addEventListener('click', () => {
    // For simplicity, just return to home page. A full "play again" would create a new game session.
    showSection(authSection);
    applyTheme('neutral');
});
returnHomeBtn.addEventListener('click', () => {
    showSection(authSection);
    applyTheme('neutral');
});

// Initial check for auth token and then sign in anonymously if needed
checkInitialAuthToken();