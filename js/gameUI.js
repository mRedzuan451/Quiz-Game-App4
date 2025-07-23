// js/gameUI.js

// Global state variables and DOM elements are available globally

/**
 * Renders the UI based on the current game state and user role.
 * @param {object} gameState The current game state object.
 */
async function renderUI(gameState) {
    const { gameStatus, currentQuestionIndex, mode, displayMode, players, leaderboardVisible } = gameState;

    applyTheme(mode === 'adult' ? 'adult' : mode === 'kids' ? 'kids' : 'neutral');

    if (gameStatus === 'lobby') {
        showSection(lobbySection);
        renderLobbyPlayers(players);
        gameMasterControlsLobby.classList.toggle('hidden', !isGameMaster);
        gameModeSelect.value = mode;
        displayModeSelect.value = displayMode;
    } else if (gameStatus === 'inProgress') {
        showSection(gameSection);
        renderGameMasterControls(isGameMaster);
        updatePauseButtonState(gameState.paused);

        if (currentQuestionIndex !== -1 && mode) {
            try {
                const questionSnapshot = await db.collection('questions')
                    .where('mode', '==', mode)
                    .orderBy('createdAt')
                    .limit(currentQuestionIndex + 1)
                    .get();

                const questionsArray = questionSnapshot.docs.map(doc => doc.data());
                const currentQuestion = questionsArray[currentQuestionIndex];

                if (currentQuestion) {
                    displayQuestion(currentQuestion, displayMode, players, currentPlayerId, currentQuestionIndex);
                } else {
                    questionTextElem.textContent = "Loading question...";
                    answersContainer.innerHTML = '';
                    console.warn(`Question at index ${currentQuestionIndex} for mode ${mode} not found.`);
                }
            } catch (error) {
                console.error("Error fetching question in renderUI:", error);
                questionTextElem.textContent = "Error loading question.";
                answersContainer.innerHTML = '';
            }
        } else {
            questionTextElem.textContent = "Game starting...";
            answersContainer.innerHTML = '';
        }

        if (leaderboardVisible || displayMode === 'individual') {
            renderLeaderboard(players);
            leaderboardSection.classList.remove('hidden');
        } else {
            leaderboardSection.classList.add('hidden');
        }

    } else if (gameStatus === 'finished') {
        showSection(gameOverSection);
        renderFinalLeaderboard(players);
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
function displayQuestion(question, displayMode, players, currentPlayerId, questionNumber) {
    questionNumberElem.textContent = `Question ${questionNumber + 1}`;
    questionTextElem.textContent = question.question;
    answersContainer.innerHTML = '';
    feedbackArea.textContent = '';
    currentPlayerScoreElem.classList.remove('hidden');
    playerScoreValueElem.textContent = players[currentPlayerId]?.score || 0;

    const playerAnswer = players[currentPlayerId]?.lastAnswer;
    const isPlayerInSharedMode = !isGameMaster && displayMode === 'shared';

    if (isPlayerInSharedMode) {
        questionTextElem.textContent = "Look at the Game Master's screen for the question!";
    }

    if (!isGameMaster || displayMode === 'individual') {
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.className = 'answer-button w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50';
            button.onclick = () => submitAnswer(option);

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
    } else {
        answersContainer.innerHTML = '';
    }

    if (playerAnswer !== null) {
        if (playerAnswer === question.correctAnswer) {
            feedbackArea.textContent = "Correct!";
            feedbackArea.className = 'text-center mt-6 text-lg font-semibold text-green-600';
        } else {
            feedbackArea.textContent = `Incorrect! Correct answer was: ${question.correctAnswer}`;
            feedbackArea.className = 'text-center mt-6 text-lg font-semibold text-red-600';
        }
    } else {
        if (answersContainer.children.length > 0) {
            Array.from(answersContainer.children).forEach(btn => btn.disabled = false);
        }
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