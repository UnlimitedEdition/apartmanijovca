#!/usr/bin/env python3
"""
Script to extract all translation keys from i18n JSON files and generate SQL
to populate the content table in Supabase database.
"""

import json
import os
from pathlib import Path

# Sections to extract from common.json
SECTIONS = ['home', 'apartments', 'attractions', 'location', 'prices', 'contact', 'gallery', 'footer']
LANGUAGES = ['sr', 'en', 'de', 'it']

def flatten_dict(d, parent_key='', sep='.'):
    """Flatten nested dictionary into dot-notation keys"""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

def escape_sql_string(s):
    """Escape string for SQL"""
    if s is None:
        return '""'
    # Replace backslash first, then quotes
    s = str(s).replace('\\', '\\\\').replace('"', '\\"')
    return f'"{s}"'

def generate_sql():
    """Generate SQL INSERT statements for all content"""
    sql_statements = []
    
    for lang in LANGUAGES:
        json_path = Path(f'public/locales/{lang}/common.json')
        
        if not json_path.exists():
            print(f"Warning: {json_path} not found")
            continue
            
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        for section in SECTIONS:
            if section not in data:
                print(f"Warning: Section '{section}' not found in {lang}/common.json")
                continue
            
            # Flatten the section data
            section_data = flatten_dict(data[section])
            
            for key, value in section_data.items():
                # Skip if value contains template variables like {{number}}
                if isinstance(value, str) and '{{' in value:
                    continue
                    
                full_key = f"{section}.{key}"
                escaped_value = escape_sql_string(value)
                
                sql = f"('{full_key}', '{lang}', '{escaped_value}'::jsonb, true)"
                sql_statements.append(sql)
    
    # Generate complete SQL
    sql = "INSERT INTO content (key, language, value, published) VALUES\n"
    sql += ",\n".join(sql_statements)
    sql += "\nON CONFLICT (key, language) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();"
    
    return sql

if __name__ == '__main__':
    sql = generate_sql()
    
    # Write to file
    output_path = Path('scripts/populate-content.sql')
    output_path.parent.mkdir(exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(sql)
    
    print(f"SQL generated successfully: {output_path}")
    print(f"Total statements: {sql.count('INSERT')}")
