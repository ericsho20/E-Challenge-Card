/**
 * Google Apps Script Web App for Challenge QR Web App
 * Deploy this as a Web App with execute permissions set to "Anyone"
 * Copy the Web App URL and update it in script.js
 */

function doPost(e) {
  try {
    // Parse the JSON data from the POST request
    const data = JSON.parse(e.postData.contents);
    
    // Get or create the spreadsheet
    const spreadsheet = getOrCreateSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();
    
    // Add headers if this is the first entry
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp',
        'Name', 
        'Email',
        'Completed Challenges',
        'Challenge Count',
        'Total Challenges',
        'Completion %',
        'Challenge Details'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format headers
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
    }
    
    // Prepare the row data
    const timestamp = new Date(data.timestamp);
    const completionPercentage = Math.round((data.completedCount / data.totalChallenges) * 100);
    const challengeDetails = data.completedChallenges.join('; ');
    
    const rowData = [
      timestamp,
      data.userName,
      data.userEmail || '',
      data.completedCount,
      data.completedCount, // Keeping for backward compatibility
      data.totalChallenges,
      completionPercentage + '%',
      challengeDetails
    ];
    
    // Add the row to the sheet
    sheet.appendRow(rowData);
    
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, sheet.getLastColumn());
    
    // Log the submission
    console.log('Challenge submission recorded:', {
      name: data.userName,
      challenges: data.completedCount,
      timestamp: timestamp
    });
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Challenge submission recorded successfully',
        submissionId: sheet.getLastRow() - 1 // Exclude header row
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

function doGet(e) {
  // Optional: Handle GET requests for testing
  return ContentService
    .createTextOutput(JSON.stringify({
      message: 'Challenge QR Web App API is running',
      timestamp: new Date().toISOString(),
      status: 'active'
    }))
    .setMimeType(ContentService.MimeType.JSON);
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
 * Test function to create the Google Sheet manually
 * Run this function to test sheet creation without a form submission
 */
function testCreateSheet() {
  try {
    const spreadsheet = getOrCreateSpreadsheet();
    console.log('Sheet created successfully!');
    console.log('Spreadsheet URL:', spreadsheet.getUrl());
    return {
      success: true,
      url: spreadsheet.getUrl(),
      name: spreadsheet.getName()
    };
  } catch (error) {
    console.error('Error creating sheet:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test function to simulate a POST request
 * Run this to test the full doPost functionality
 */
function testDoPost() {
  const mockData = {
    userName: "Test User",
    userEmail: "test@example.com",
    completedChallenges: ["Take a selfie at the main entrance", "Visit the information center"],
    completedCount: 2,
    totalChallenges: 8,
    timestamp: new Date().toISOString()
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(mockData)
    }
  };
  
  try {
    const result = doPost(mockEvent);
    const response = JSON.parse(result.getContent());
    console.log('doPost test result:', response);
    return response;
  } catch (error) {
    console.error('doPost test error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper function to get submission statistics
 * Call this function manually from the Apps Script editor to get stats
 */
function getSubmissionStats() {
  const spreadsheet = getOrCreateSpreadsheet();
  const sheet = spreadsheet.getActiveSheet();
  
  if (sheet.getLastRow() <= 1) {
    console.log('No submissions found');
    return;
  }
  
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  
  const stats = {
    totalSubmissions: data.length,
    averageCompletion: 0,
    topPerformers: [],
    challengePopularity: {}
  };
  
  let totalPercentage = 0;
  
  data.forEach(row => {
    const name = row[1];
    const completionCount = row[3];
    const totalChallenges = row[5];
    const percentage = (completionCount / totalChallenges) * 100;
    
    totalPercentage += percentage;
    
    if (percentage >= 75) {
      stats.topPerformers.push({
        name: name,
        completion: percentage + '%',
        challenges: completionCount
      });
    }
  });
  
  stats.averageCompletion = Math.round(totalPercentage / data.length) + '%';
  
  console.log('Submission Statistics:', JSON.stringify(stats, null, 2));
  return stats;
}