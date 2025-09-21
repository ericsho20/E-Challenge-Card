const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw-dhb7i8SG1vq3pU03saK0BlPbtCXLbIZo0BAOm6tNAln6RBsvu4WaiWiw1l7QkvXc/exec';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('challengeForm');
    form.addEventListener('submit', handleFormSubmit);
});

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span>Submitting...';
        hideMessage();

        const formData = collectFormData();

        // --- Validation ---
        if (!formData.teamNumber.trim()) throw new Error('Please enter your team number');
        if (!formData.companyName.trim()) throw new Error('Please enter your company name');
        if (!formData.teamMembers || formData.teamMembers < 1) throw new Error('Please enter the number of team members');
        if (formData.totalScore === 0) throw new Error('Please enter at least one challenge count');

        // --- Ensure valid JSON ---
        const jsonPayload = JSON.stringify(formData);
        if (!validateJSON(jsonPayload)) {
            throw new Error("Form data could not be converted to valid JSON");
        }

        console.log("Final JSON Payload:", jsonPayload);

        // --- Submit ---
        const response = await submitToGoogleSheets(jsonPayload);

        if (response.success) {
            showMessage('✅ Success! Your challenges have been submitted. Thank you for participating!', 'success');
            resetForm();
        } else {
            throw new Error(response.error || 'Failed to submit challenges');
        }

    } catch (error) {
        console.error('Submission error:', error);
        showMessage(`❌ Error: ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '🚀 Submit Challenges';
    }
}

function collectFormData() {
    const teamNumber = document.getElementById('teamNumber').value;
    const companyName = document.getElementById('companyName').value;
    const teamMembers = document.getElementById('teamMembers').value;

    const challengeData = {};
    let totalScore = 0;

    // Multi-level games
    const multiLevelGames = [
        { id: 'challenge1', name: 'Monkey Business', levels: 3 },
        { id: 'challenge2', name: 'Gecko Tower', levels: 3 },
        { id: 'challenge3', name: "Atan's Leap", levels: 2 }
    ];

    multiLevelGames.forEach((game) => {
        let gameTotal = 0;
        const details = {};
        for (let level = 1; level <= game.levels; level++) {
            const input = document.getElementById(`${game.id}_level${level}`);
            const value = parseInt(input.value) || 0;
            details[`L${level}`] = value;
            gameTotal += value * level;
        }
        challengeData[game.id] = { name: game.name, count: gameTotal, details };
        totalScore += gameTotal;
    });

    // Single input games
    const singleInputGames = document.querySelectorAll('input[name="challenges"]');
    singleInputGames.forEach((input) => {
        const value = parseInt(input.value) || 0;
        const parentDiv = input.closest('.challenge-item');
        const challengeName = parentDiv.querySelector('.challenge-name').textContent.replace(':', '').trim();
        challengeData[input.id] = { name: challengeName, count: value };
        totalScore += value;
    });

    const completedChallenges = [];
    Object.values(challengeData).forEach(challenge => {
        if (challenge.count > 0) {
            if (challenge.details) {
                const detailsText = Object.entries(challenge.details).map(([level, val]) => `${level}=${val}`).join(', ');
                completedChallenges.push(`${challenge.name}: ${challenge.count} (${detailsText})`);
            } else {
                completedChallenges.push(`${challenge.name}: ${challenge.count}`);
            }
        }
    });

    const teamMembersCount = parseInt(teamMembers) || 1;
    const averageScore = Math.round(totalScore / teamMembersCount * 100) / 100;

    return {
        teamNumber: teamNumber.trim(),
        companyName: companyName.trim(),
        teamMembers: teamMembersCount,
        challengeData,
        totalScore,
        averageScore,
        completedChallenges,
        completedCount: totalScore,
        totalChallenges: Object.keys(challengeData).length,
        timestamp: new Date().toISOString()
    };
}

// --- Ensure valid JSON ---
function validateJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

// --- Submit with fetch ---
async function submitToGoogleSheets(jsonPayload) {
    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonPayload
        });

        const result = await response.json();
        console.log("Server response:", result);
        return result;
    } catch (err) {
        console.error("Fetch failed:", err);
        return { success: false, error: err.message };
    }
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideMessage() {
    document.getElementById('message').className = 'message hidden';
}

function resetForm() {
    document.getElementById('challengeForm').reset();
}
