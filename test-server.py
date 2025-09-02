#!/usr/bin/env python3
"""
Simple HTTP server to test the Challenge QR Web App locally
Run this script and open http://localhost:8000 in your browser
"""

import http.server
import socketserver
import os
import webbrowser

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers to allow requests to Google Apps Script
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

if __name__ == "__main__":
    # Change to the directory containing your HTML files
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 Server running at http://localhost:{PORT}")
        print("📱 Open this URL in your browser to test the Challenge QR Web App")
        print("⏹️  Press Ctrl+C to stop the server")
        
        # Automatically open browser
        try:
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            pass
            
        httpd.serve_forever()