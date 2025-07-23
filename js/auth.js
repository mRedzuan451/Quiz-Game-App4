// js/auth.js

// Firebase and DOM elements are available globally after main.js and domElements.js load

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
        goToAdminBtn.classList.remove('hidden'); // Show admin button if logged in
    } else {
        userInfo.classList.add('hidden');
        gameOptions.classList.add('hidden');
        authSection.querySelector('.mb-4:first-of-type').classList.remove('hidden'); // Show login/signup fields
        goToAdminBtn.classList.add('hidden'); // Hide admin button if not logged in
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
        currentUser = null;
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
            await auth.signInWithCustomToken(initialAuthToken);
            console.log("Signed in with initial auth token.");
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
            console.error("Error signing in with initial auth token:", error);
            displayAuthError("Could not sign in with provided token. Please try another method.");
            if (!currentUser) {
                await signInAnonymously();
            }
        }
    } else {
        if (!currentUser) {
            await signInAnonymously();
        }
    }
}