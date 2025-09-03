/**
 * Google Apps Script Web App for Challenge QR Web App - CORS Fixed
 * Deploy this as a Web App with execute permissions set to "Anyone"
 */

function doPost(e) {
  return processSubmission(e);
}

function doGet(e) {
  // Return basic status for GET requests
  return ContentService
    .createTextOutput(JSON.stringify({
      message: 'Challenge QR Web App API is running',
      timestamp: new Date().toISOString(),
      status: 'active'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function processSubmission(e) {
  try {
    let data;
    
    // Handle different types of POST data
    if (e.postData && e.postData.contents) {
      // JSON data
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonError) {
        // Form data fallback
        data = parseFormData(e.parameter);
      }
    } else if (e.parameter) {
      // Form data
      data = parseFormData(e.parameter);
    } else {
      throw new Error('No data received');
    }
    
    // Validate required fields
    if (!data.userName) {
      throw new Error('User name is required');
    }
    
    // Get or create the spreadsheet
    const spreadsheet = getOrCreateSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();
    
    // Add headers if this is the first entry
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp',
        'Name', 
        'Email',
        'Total Score',
        'Monkey Business',
        'Gecko Tower',
        'Atan\'s Leap',
        'Acrobat',
        'Flying Lemur',
        'Kite Flyer',
        'SlingShot',
        'Tubby Racer',
        'Details'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format headers
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
    }
    
    // Prepare the row data
    const timestamp = new Date(data.timestamp || new Date().toISOString());
    const totalScore = data.totalScore || data.completedCount || 0;
    const challengeData = data.challengeData || {};
    
    // Extract individual challenge counts
    const challenge1 = (challengeData.challenge1 && challengeData.challenge1.count) || 0;
    const challenge2 = (challengeData.challenge2 && challengeData.challenge2.count) || 0;
    const challenge3 = (challengeData.challenge3 && challengeData.challenge3.count) || 0;
    const challenge4 = (challengeData.challenge4 && challengeData.challenge4.count) || 0;
    const challenge5 = (challengeData.challenge5 && challengeData.challenge5.count) || 0;
    const challenge6 = (challengeData.challenge6 && challengeData.challenge6.count) || 0;
    const challenge7 = (challengeData.challenge7 && challengeData.challenge7.count) || 0;
    const challenge8 = (challengeData.challenge8 && challengeData.challenge8.count) || 0;
    
    // Create details string
    const details = data.completedChallenges ? data.completedChallenges.join('; ') : 
                   `C1:${challenge1}, C2:${challenge2}, C3:${challenge3}, C4:${challenge4}, C5:${challenge5}, C6:${challenge6}, C7:${challenge7}, C8:${challenge8}`;
    
    const rowData = [
      timestamp,
      data.userName,
      data.userEmail || '',
      totalScore,
      challenge1,
      challenge2,
      challenge3,
      challenge4,
      challenge5,
      challenge6,
      challenge7,
      challenge8,
      details
    ];
    
    // Add the row to the sheet
    sheet.appendRow(rowData);
    
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, sheet.getLastColumn());
    
    // Log the submission
    console.log('Challenge submission recorded:', {
      name: data.userName,
      totalScore: totalScore,
      timestamp: timestamp
    });
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Challenge submission recorded successfully',
        submissionId: sheet.getLastRow() - 1,
        totalScore: totalScore
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing challenge submission:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Failed to process submission: ' + error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function parseFormData(parameter) {
  const data = {
    userName: parameter.userName,
    userEmail: parameter.userEmail,
    totalScore: parseInt(parameter.totalScore) || parseInt(parameter.completedCount) || 0,
    totalChallenges: parseInt(parameter.totalChallenges) || 8,
    timestamp: parameter.timestamp || new Date().toISOString()
  };
  
  // Parse challengeData if it's a string
  try {
    data.challengeData = JSON.parse(parameter.challengeData || '{}');
  } catch (e) {
    data.challengeData = {};
  }
  
  // Parse completedChallenges for backward compatibility
  try {
    data.completedChallenges = JSON.parse(parameter.completedChallenges || '[]');
  } catch (e) {
    data.completedChallenges = [];
  }
  
  return data;
}

function getOrCreateSpreadsheet() {
  const SPREADSHEET_NAME = 'Challenge QR Submissions';
  
  try {
    // Try to find existing spreadsheet
    const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
    if (files.hasNext()) {
      const file = files.next();
      return SpreadsheetApp.openById(file.getId());
    }
  } catch (error) {
    console.log('No existing spreadsheet found, creating new one');
  }
  
  // Create new spreadsheet if not found
  const spreadsheet = SpreadsheetApp.create(SPREADSHEET_NAME);
  
  // Rename the default sheet
  const sheet = spreadsheet.getActiveSheet();
  sheet.setName('Submissions');
  
  console.log('Created new spreadsheet:', spreadsheet.getUrl());
  
  return spreadsheet;
}

/**
 * Test function to simulate a POST request
 */
function testDoPost() {
  const mockData = {
    userName: "Test User",
    userEmail: "test@example.com",
    totalScore: 15,
    challengeData: {
      challenge1: { name: "Take a selfie at the main entrance", count: 5 },
      challenge2: { name: "Find and photograph the oldest building", count: 3 },
      challenge3: { name: "Interview someone about their favorite local spot", count: 0 },
      challenge4: { name: "Try a local food specialty", count: 2 },
      challenge5: { name: "Visit the information center", count: 5 },
      challenge6: { name: "Take a group photo with 3+ people", count: 0 },
      challenge7: { name: "Find a hidden gem or secret spot", count: 0 },
      challenge8: { name: "Share your experience on social media", count: 0 }
    },
    completedChallenges: ["Take a selfie at the main entrance: 5", "Find and photograph the oldest building: 3", "Try a local food specialty: 2", "Visit the information center: 5"],
    totalChallenges: 8,
    timestamp: new Date().toISOString()
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(mockData)
    }
  };
  
  try {
    const result = processSubmission(mockEvent);
    const response = JSON.parse(result.getContent());
    console.log('doPost test result:', response);
    return response;
  } catch (error) {
    console.error('doPost test error:', error);
    return { success: false, error: error.message };
  }
}