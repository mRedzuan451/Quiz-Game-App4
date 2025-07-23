// js/domElements.js

// --- DOM Elements ---
const appDiv = document.getElementById('app');
const authSection = document.getElementById('auth-section');
const lobbySection = document.getElementById('lobby-section');
const gameSection = document.getElementById('game-section');
const gameOverSection = document.getElementById('game-over-section');
const adminSection = document.getElementById('admin-section'); // NEW

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
const goToAdminBtn = document.getElementById('go-to-admin-btn'); // NEW

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

// Admin elements (NEW)
const adminQuestionText = document.getElementById('admin-question-text');
const adminOptionsContainer = document.getElementById('admin-options-container');
const addOptionBtn = document.getElementById('add-option-btn');
const adminCorrectAnswer = document.getElementById('admin-correct-answer');
const adminGameMode = document.getElementById('admin-game-mode');
const adminFeedbackMessage = document.getElementById('admin-feedback-message');
const submitQuestionBtn = document.getElementById('submit-question-btn');
const backToHomeFromAdminBtn = document.getElementById('back-to-home-from-admin-btn');