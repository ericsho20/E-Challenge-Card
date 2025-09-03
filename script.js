const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby2UM7uo_LFgoWP6_Af9snEI3bT_dAAb_muncR7YA3BYdHXBYXNc6ucAZpglRtThPizjQ/exec';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('challengeForm');
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', handleFormSubmit);
});

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span>Submitting...';
        
        hideMessage();
        
        const formData = collectFormData();
        
        if (!formData.userName.trim()) {
            throw new Error('Please enter your name');
        }
        
        if (formData.totalScore === 0) {
            throw new Error('Please enter at least one challenge count');
        }
        
        console.log('About to submit form data:', formData);
        console.log('Using URL:', GOOGLE_APPS_SCRIPT_URL);
        
        // Try JSON first, then fallback to form submission
        let response;
        try {
            response = await submitToGoogleSheets(formData);
        } catch (corsError) {
            console.log('CORS method failed, trying form submission fallback');
            response = await submitViaForm(formData);
        }
        
        console.log('Received response:', response);
        
        if (response.success) {
            showMessage('Success! Your challenges have been submitted. Thank you for participating!', 'success');
            resetForm();
        } else {
            throw new Error(response.error || 'Failed to submit challenges');
        }
        
    } catch (error) {
        console.error('Full submission error:', error);
        console.error('Error stack:', error.stack);
        
        // Show different messages based on error type
        let errorMessage = error.message;
        if (error.message.includes('fetch')) {
            errorMessage = `Network error: ${error.message}. Please check your internet connection.`;
        }
        
        showMessage(`Error: ${errorMessage}`, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '🚀 Submit Challenges';
    }
}

function collectFormData() {
    const userName = document.getElementById('userName').value;
    const userEmail = document.getElementById('userEmail').value;
    const challengeInputs = document.querySelectorAll('input[name="challenges"]');
    
    const challengeData = {};
    let totalScore = 0;
    
    challengeInputs.forEach((input, index) => {
        const value = parseInt(input.value) || 0;
        const challengeName = input.nextElementSibling.textContent.replace(':', '');
        challengeData[`challenge${index + 1}`] = {
            name: challengeName,
            count: value
        };
        totalScore += value;
    });
    
    // Prepare data compatible with both old and new Google Apps Script versions
    const completedChallenges = [];
    Object.values(challengeData).forEach(challenge => {
        if (challenge.count > 0) {
            completedChallenges.push(`${challenge.name}: ${challenge.count}`);
        }
    });
    
    return {
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        challengeData,
        totalScore,
        completedChallenges,
        completedCount: totalScore,
        totalChallenges: challengeInputs.length,
        timestamp: new Date().toISOString()
    };
}

async function submitToGoogleSheets(formData) {
    if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
        throw new Error('Google Apps Script URL not configured. Please update the script with your Web App URL.');
    }
    
    console.log('Submitting to URL:', GOOGLE_APPS_SCRIPT_URL);
    console.log('Form data:', formData);
    
    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        console.log('Request sent successfully with no-cors mode');
        
        // With no-cors mode, we can't read the response body or status
        // But if no error was thrown, we can assume the request was sent
        return { success: true, message: 'Data submitted successfully' };
        
    } catch (fetchError) {
        console.error('Fetch error details:', fetchError);
        throw new Error(`Failed to submit: ${fetchError.message}`);
    }
}

async function submitViaForm(formData) {
    return new Promise((resolve, reject) => {
        // Create a temporary form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = GOOGLE_APPS_SCRIPT_URL;
        form.target = '_blank';
        form.style.display = 'none';
        
        // Add form data as hidden inputs
        Object.entries(formData).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            if (typeof value === 'object' && value !== null) {
                input.value = JSON.stringify(value);
            } else {
                input.value = value;
            }
            form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        // Since we can't get a response from form submission,
        // we'll assume success after a short delay
        setTimeout(() => {
            resolve({ success: true, message: 'Data submitted via form method' });
        }, 1000);
    });
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.className = 'message hidden';
}

function resetForm() {
    document.getElementById('challengeForm').reset();
}

function getChallengeScore(totalScore, maxPossible) {
    return maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;
}