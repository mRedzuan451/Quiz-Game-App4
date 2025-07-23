// js/utils.js

// --- Global Variables (now imported/exported) ---
// These will be globally accessible because they're declared in the global scope
// when the script is loaded, or explicitly attached to `window` if strictly necessary.
// For simpler projects, this works. For complex ones, consider a state management object.
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
    adminSection.classList.add('hidden', 'opacity-0');
}

/**
 * Shows a specific section with a fade-in effect.
 * @param {HTMLElement} sectionElement The section to show.
 */
function showSection(sectionElement) {
    hideAllSections();
    sectionElement.classList.remove('hidden');
    void sectionElement.offsetWidth; // Force reflow
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