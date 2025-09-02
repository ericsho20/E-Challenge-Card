const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyqgoVsrHrQUW-Iw4Tdbefap3C436GEYPrm35IcExT4OFxp7MAF9hthjYoHxJW5mSTGUw/exec';

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
        
        if (formData.completedChallenges.length === 0) {
            throw new Error('Please complete at least one challenge');
        }
        
        console.log('About to submit form data:', formData);
        console.log('Using URL:', GOOGLE_APPS_SCRIPT_URL);
        
        const response = await submitToGoogleSheets(formData);
        
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
    const checkboxes = document.querySelectorAll('input[name="challenges"]:checked');
    
    const completedChallenges = Array.from(checkboxes).map(checkbox => checkbox.value);
    
    return {
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        completedChallenges,
        completedCount: completedChallenges.length,
        totalChallenges: document.querySelectorAll('input[name="challenges"]').length,
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
            input.value = Array.isArray(value) ? JSON.stringify(value) : value;
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

function getChallengeScore(completedCount, totalCount) {
    return Math.round((completedCount / totalCount) * 100);
}