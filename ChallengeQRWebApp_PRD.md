# Product Requirements Document (PRD)  
**Project Name:** Challenge QR Web App  
**Prepared By:** [Your Name]  
**Date:** [Date]

---

## 1. Overview  
The **Challenge QR Web App** is a hosted website that allows users to scan a fixed QR code, open a challenge checklist page, tick completed items, and submit their results. Submissions are sent directly from the webpage to Google Sheets via a Google Apps Script Web App. This eliminates the need for a traditional backend and ensures lightweight, cost-efficient deployment.

---

## 2. Goals & Objectives
- Provide a hosted HTML page that serves as a **challenge card**.  
- Allow users to tick completed challenges and submit results.  
- Integrate with **Google Sheets** using Google Apps Script for data storage.  
- Enable admins to summarize results and determine winners from Google Sheets.  

---

## 3. Key Features

### 3.1 QR Code Access
- A **fixed QR code** links directly to the hosted HTML page.  
- QR code can be distributed via print or digital posters.  
- Compatible with any mobile browser.  

### 3.2 Challenge Card (HTML Page)
- Checklist of challenges displayed with **checkboxes**.  
- Input field(s) for user identification (e.g., name, email, or unique ID).  
- **Submit button** to send data.  

### 3.3 Submission Flow
- User ticks off challenges.  
- User enters name or identifier.  
- On **Submit**:  
  - JavaScript collects form data.  
  - Sends data to **Google Apps Script Web App** via `fetch` POST request.  
  - Apps Script appends the data to Google Sheets.  
- Success/Failure message displayed to user.  

### 3.4 Google Sheets Integration
- Each submission adds a new row in Google Sheets containing:  
  - User identifier  
  - Completed challenges  
  - Timestamp  
- Sheets formulas or pivot tables can summarize scores and identify winners.  

---

## 4. User Flow

1. User scans QR code.  
2. Hosted HTML challenge page opens.  
3. User checks off completed challenges.  
4. User enters name/ID.  
5. User clicks **Submit**.  
6. Data is sent to Google Apps Script → stored in Google Sheets.  
7. Admin reviews Google Sheets to determine winners.  

---

## 5. Technical Requirements

### 5.1 Frontend (Hosted Page)
- HTML/CSS/JavaScript.  
- Hosted on Netlify, GitHub Pages, Firebase Hosting, or own server.  
- QR code links to hosted URL.  

### 5.2 Backend (Google Integration)
- Google Apps Script Web App acts as API endpoint.  
- Receives JSON payload via POST request.  
- Appends submission data to Google Sheets.  

### 5.3 Platforms
- Mobile browsers (primary).  
- Desktop browsers (secondary).  

---

## 6. Success Metrics
- % of users successfully submitting via hosted page.  
- Accuracy and completeness of data stored in Google Sheets.  
- Admin’s ability to generate winner summary from Sheets quickly.  

---

## 7. Future Enhancements
- PWA (Progressive Web App) for offline support.  
- Leaderboard page displaying real-time scores.  
- Authentication to prevent duplicate or false submissions.  
- Multiple challenge sets linked to different QR codes.  

---

## 8. Risks & Dependencies
- Google Apps Script daily quota limits.  
- User browser compatibility for JavaScript fetch API.  
- Internet connection required at time of submission.  

---

## 9. Timeline (Draft)
- Week 1: Requirements & Design.  
- Week 2: Build HTML page with checklist.  
- Week 3: Configure Google Apps Script + Sheets.  
- Week 4: Integration testing (submit to Sheets).  
- Week 5: Deploy HTML page to hosting service.  
- Week 6: Generate QR code & distribute.  

---
