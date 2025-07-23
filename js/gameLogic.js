// js/gameLogic.js

// Firebase, global state variables, and DOM elements are available globally

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
            leaderboardVisible: false
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
    localStorage.setItem('playerName', currentPlayerName);
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
            currentQuestionIndex: 0,
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
    const questionsCollectionRef = db.collection('questions');
    const modeQuestionsRef = questionsCollectionRef.where('mode', '==', mode);

    const existingQuestionsSnapshot = await modeQuestionsRef.get();

    if (existingQuestionsSnapshot.empty) {
        const batch = db.batch();
        sampleQuestions[mode].forEach((q) => {
            const docRef = questionsCollectionRef.doc();
            batch.set(docRef, { ...q, mode: mode, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        });
        await batch.commit();
        console.log(`Initial sample questions for mode '${mode}' added to Firestore.`);
    } else {
        console.log(`Questions for mode '${mode}' already exist in Firestore. Skipping sample data population.`);
    }
}

/**
 * Advances to the next question or ends the game. Only Game Master can call this.
 */
async function nextQuestion() {
    if (!isGameMaster || !currentGameState || !currentGameId) return;

    let nextIndex = currentGameState.currentQuestionIndex + 1;
    const mode = currentGameState.mode;

    const questionsCountSnapshot = await db.collection('questions').where('mode', '==', mode).get();
    const questionsCount = questionsCountSnapshot.size;

    try {
        const playersUpdate = {};
        Object.keys(currentGameState.players).forEach(playerId => {
            playersUpdate[`players.${playerId}.lastAnswer`] = null;
        });
        await db.collection('games').doc(currentGameId).update(playersUpdate);

        if (nextIndex < questionsCount) {
            await db.collection('games').doc(currentGameId).update({
                currentQuestionIndex: nextIndex,
                paused: false,
                leaderboardVisible: false
            });
            console.log(`Advanced to question ${nextIndex + 1}`);
        } else {
            await db.collection('games').doc(currentGameId).update({
                gameStatus: 'finished',
                currentQuestionIndex: -1,
                leaderboardVisible: true
            });
            console.log("Game ended!");
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
        if (gameSubscription) {
            gameSubscription();
            gameSubscription = null;
        }
        if (playersSubscription) {
            playersSubscription();
            playersSubscription = null;
        }

        const gameRef = db.collection('games').doc(currentGameId);
        const gameDoc = await gameRef.get();
        if (gameDoc.exists) {
            const gameData = gameDoc.data();
            const currentPlayers = gameData.players || {};

            if (isGameMaster) {
                const otherPlayers = Object.values(currentPlayers).filter(p => p.id !== currentPlayerId);
                if (otherPlayers.length === 0) {
                    await gameRef.delete();
                    console.log(`Game ${currentGameId} deleted as GM left and no other players.`);
                } else {
                    alert("As Game Master, you cannot leave the game if other players are present. Please end the game first.");
                    listenToGameChanges(currentGameId);
                    return;
                }
            } else {
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
        showSection(authSection);
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
    const questionSnapshot = await db.collection('questions')
        .where('mode', '==', currentGameState.mode)
        .orderBy('createdAt')
        .limit(currentGameState.currentQuestionIndex + 1)
        .get();

    const questionsArray = questionSnapshot.docs.map(doc => doc.data());
    const currentQuestion = questionsArray[currentGameState.currentQuestionIndex];

    if (!currentQuestion) {
        console.error("Could not find current question for mode:", currentGameState.mode, "index:", currentGameState.currentQuestionIndex);
        return;
    }

    const isCorrect = answer === currentQuestion.correctAnswer;
    let newScore = currentGameState.players[currentPlayerId].score;

    if (currentGameState.players[currentPlayerId].lastAnswer === null) {
        if (isCorrect) {
            newScore += 10;
        }
        await gameRef.update({
            [`players.${currentPlayerId}.score`]: newScore,
            [`players.${currentPlayerId}.lastAnswer`]: answer
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
        gameSubscription();
    }

    gameSubscription = db.collection('games').doc(gameId)
        .onSnapshot(async (doc) => {
            if (!doc.exists) {
                console.log("Game has been deleted or no longer exists.");
                alert("The game has ended or the host left.");
                leaveGame();
                return;
            }

            currentGameState = doc.data();
            lobbyGameId.textContent = currentGameState.gameId;
            isGameMaster = (currentGameState.gameMasterId === currentPlayerId);

            if (isGameMaster && currentGameState.gameStatus === 'lobby') {
                await updateGameQuestionsInFirestore(gameId, currentGameState.mode);
            }

            renderUI(currentGameState);
        }, (error) => {
            console.error("Error listening to game changes:", error);
            alert("Lost connection to game. Please try to rejoin.");
            leaveGame();
        });
}