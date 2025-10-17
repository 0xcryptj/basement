#!/usr/bin/env python3
"""
Simple Python HTTP Server for The Basement Arcade
Serves static files from the public directory
"""

import http.server
import socketserver
import os
from pathlib import Path

# Configuration
PORT = 8000
DIRECTORY = "public"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    
    def do_GET(self):
        # Redirect root to index.html
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()

def run_server():
    # Change to public directory
    os.chdir(Path(__file__).parent)
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"\n{'='*60}")
        print(f"  🎮 THE BASEMENT ARCADE - DEV SERVER")
        print(f"{'='*60}")
        print(f"\n  ✅ Server running at:")
        print(f"     http://localhost:{PORT}")
        print(f"     http://127.0.0.1:{PORT}")
        print(f"\n  📁 Serving files from: {DIRECTORY}/")
        print(f"\n  🎯 Quick Links:")
        print(f"     Homepage:    http://localhost:{PORT}/")
        print(f"     Chess:       http://localhost:{PORT}/arcade/chess.html")
        print(f"     LuckyBlock:  http://localhost:{PORT}/arcade/luckyblock.html")
        print(f"     CoinToss:    http://localhost:{PORT}/arcade/cointoss.html")
        print(f"\n  ⚠️  Press Ctrl+C to stop the server")
        print(f"{'='*60}\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n  ❌ Server stopped by user")
            print(f"{'='*60}\n")

if __name__ == "__main__":
    run_server()

