# Challenge QR Web App - Setup Instructions

## Overview
This application allows users to scan a QR code, complete challenges, and submit results to Google Sheets via Google Apps Script.

## Files Generated
- `index.html` - Main challenge page with checklist
- `styles.css` - Mobile-first responsive styling
- `script.js` - Frontend JavaScript for form handling
- `google-apps-script.js` - Google Apps Script for backend processing
- `SETUP-INSTRUCTIONS.md` - This setup guide

## Setup Steps

### 1. Google Apps Script Setup
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Replace the default `Code.gs` content with the code from `google-apps-script.js`
4. Save the project (give it a name like "Challenge QR Web App")

### 2. Deploy as Web App
1. In Apps Script, click "Deploy" → "New Deployment"
2. Choose "Web app" as the type
3. Set execute permissions to **"Anyone"**
4. Click "Deploy"
5. **Copy the Web App URL** provided

### 3. Update Frontend Configuration
1. Open `script.js`
2. Replace `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with your actual Web App URL
3. Save the file

### 4. Host the Web App
Deploy the files (`index.html`, `styles.css`, `script.js`) to any hosting service:

**Recommended hosting options:**
- **Netlify**: Drag and drop the files to [netlify.com/drop](https://netlify.com/drop)
- **GitHub Pages**: Upload to a GitHub repo and enable Pages
- **Firebase Hosting**: Use Firebase CLI to deploy
- **Vercel**: Connect your GitHub repo or use CLI

### 5. Generate QR Code
1. Use any QR code generator (e.g., [qr-code-generator.com](https://qr-code-generator.com))
2. Input your hosted website URL
3. Download and distribute the QR code

### 6. Test the Integration
1. Open your hosted website
2. Fill out the form and submit
3. Check Google Sheets for the new entry
4. Verify all data is captured correctly

## Google Sheets Structure
The script automatically creates a spreadsheet with these columns:
- **Timestamp** - When the submission was made
- **Name** - User's name
- **Email** - User's email (optional)
- **Completed Challenges** - Number of challenges completed
- **Challenge Count** - Same as above (for compatibility)
- **Total Challenges** - Total number of available challenges
- **Completion %** - Percentage of challenges completed
- **Challenge Details** - List of specific challenges completed

## Customization Options

### Modify Challenges
Edit the challenge list in `index.html` (lines 32-56):
```html
<div class="challenge-item">
    <input type="checkbox" id="challenge1" name="challenges" value="Your challenge description">
    <label for="challenge1">Your challenge description</label>
</div>
```

### Update Styling
Modify colors, fonts, and layout in `styles.css`. Key variables:
- Primary gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Accent color: `#4facfe`

### Add Features
- Additional form fields in `index.html`
- Update data collection in `script.js` → `collectFormData()`
- Modify Google Sheets columns in `google-apps-script.js`

## Troubleshooting

### Common Issues
1. **"URL not configured" error**: Update the URL in `script.js`
2. **CORS errors**: Ensure Apps Script permissions are set to "Anyone"
3. **No data in Sheets**: Check the Apps Script execution transcript for errors
4. **Mobile display issues**: Test responsive design on actual devices

### Testing Apps Script
Run `getSubmissionStats()` function in Apps Script editor to get submission analytics.

### Security Considerations
- Apps Script is set to "Anyone" for public access
- No authentication prevents duplicate submissions
- Consider adding rate limiting for production use

## Analytics & Results
Use Google Sheets features to analyze results:
- **Pivot Tables** - Summarize completion rates
- **Charts** - Visualize challenge popularity
- **Conditional Formatting** - Highlight top performers
- **Formulas** - Calculate winner rankings

## Next Steps
1. Test thoroughly with multiple submissions
2. Generate and distribute QR codes
3. Monitor submission data in Google Sheets
4. Analyze results and determine winners

## Support
For issues with this implementation, check:
- Browser developer console for JavaScript errors
- Google Apps Script execution transcript
- Network tab for failed API calls