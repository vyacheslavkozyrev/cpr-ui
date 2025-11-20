#!/usr/bin/env python3
"""
Fix BE translation file by adding pages.feedback.request structure.
Temporarily uses EN text as placeholder until proper Belarusian translations are provided.
"""

import json
import sys
from pathlib import Path

def main():
    # Paths
    be_file = Path(__file__).parent.parent / "public" / "locales" / "be" / "translation.json"
    en_file = Path(__file__).parent.parent / "public" / "locales" / "en" / "translation.json"
    
    print(f"Reading BE file: {be_file}")
    with open(be_file, 'r', encoding='utf-8') as f:
        be_data = json.load(f)
    
    print(f"Reading EN file: {en_file}")
    with open(en_file, 'r', encoding='utf-8-sig') as f:
        en_data = json.load(f)
    
    # Extract the request section from EN
    en_request = en_data['pages']['feedback']['request']
    
    # Update BE file
    if 'pages' not in be_data:
        be_data['pages'] = {}
    if 'feedback' not in be_data['pages']:
        be_data['pages']['feedback'] = {}
    
    # Also update the tabs if they don't exist
    if 'tabs' not in be_data['pages']['feedback']:
        be_data['pages']['feedback']['tabs'] = en_data['pages']['feedback']['tabs']
    
    # Add the request section (using EN text as placeholder)
    be_data['pages']['feedback']['request'] = en_request
    
    # Write back with UTF-8 encoding and proper formatting
    print(f"Writing updated BE file: {be_file}")
    with open(be_file, 'w', encoding='utf-8') as f:
        json.dump(be_data, f, ensure_ascii=False, indent=2)
    
    print("✓ BE translation file updated successfully")
    print("NOTE: The feedback.request section currently uses English text as placeholder.")
    print("      Please provide proper Belarusian translations to replace these placeholders.")

if __name__ == "__main__":
    main()
