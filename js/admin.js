// js/admin.js

// Global state variables, Firebase, and DOM elements are available globally

/**
 * Adds a new answer option input field to the admin form.
 */
function addOptionInput() {
    const div = document.createElement('div');
    div.className = 'flex items-center space-x-2';
    div.innerHTML = `
        <input type="text" class="admin-option-input p-2 border border-gray-300 rounded-lg flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" placeholder="Option ${adminOptionsContainer.children.length + 1}">
        <button class="remove-option-btn text-red-500 hover:text-red-700 text-2xl font-bold leading-none">&times;</button>
    `;
    adminOptionsContainer.appendChild(div);
    div.querySelector('.remove-option-btn').addEventListener('click', (e) => {
        if (adminOptionsContainer.children.length > 2) {
            e.target.closest('.flex').remove();
        } else {
            displayAdminFeedback('Keep at least two options.', 'error');
        }
    });
}

/**
 * Displays feedback messages on the admin page.
 * @param {string} message The message to display.
 * @param {string} type 'success' or 'error'.
 */
function displayAdminFeedback(message, type) {
    adminFeedbackMessage.textContent = message;
    adminFeedbackMessage.className = `text-sm font-semibold mb-4 text-center ${type === 'success' ? 'text-green-600' : 'text-red-600'}`;
    setTimeout(() => {
        adminFeedbackMessage.textContent = '';
        adminFeedbackMessage.className = `text-sm font-semibold mb-4 text-center`;
    }, 5000);
}

/**
 * Clears all input fields in the admin question form.
 */
function clearAdminForm() {
    adminQuestionText.value = '';
    adminCorrectAnswer.value = '';
    adminGameMode.value = 'adult';

    adminOptionsContainer.innerHTML = '';
    addOptionInput();
    addOptionInput();
    adminOptionsContainer.querySelectorAll('.remove-option-btn').forEach(btn => btn.style.display = 'inline-block');
}

/**
 * Handles the submission of a new question from the admin form.
 */
async function submitNewQuestion() {
    const questionText = adminQuestionText.value.trim();
    const correctAnswer = adminCorrectAnswer.value.trim();
    const mode = adminGameMode.value;

    const optionInputs = Array.from(adminOptionsContainer.querySelectorAll('.admin-option-input'));
    const options = optionInputs.map(input => input.value.trim()).filter(value => value !== '');

    if (!questionText || !correctAnswer || options.length < 2) {
        displayAdminFeedback('Please fill all fields and provide at least two options.', 'error');
        return;
    }

    if (!options.includes(correctAnswer)) {
        displayAdminFeedback('The correct answer must be one of the provided options.', 'error');
        return;
    }

    const newQuestion = {
        question: questionText,
        options: options,
        correctAnswer: correctAnswer,
        mode: mode,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('questions').add(newQuestion);
        displayAdminFeedback('Question added successfully!', 'success');
        clearAdminForm();
    } catch (error) {
        console.error("Error adding new question:", error);
        displayAdminFeedback('Failed to add question: ' + error.message, 'error');
    }
}