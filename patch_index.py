import json
import re

with open('color_mappings.json', 'r') as f:
    mappings = json.load(f)

with open('backend/src/index.ts', 'r') as f:
    content = f.read()

# We need to find the `colors:` array for each car.
# The car objects in index.ts look like:
# slug: 'ranger',
# ...
# colors: [
#   ...
# ]

for slug, colors in mappings.items():
    if not colors: continue
    
    # Generate new colors array text
    new_colors_lines = []
    for c in colors:
        c_name = c['color_name'].replace("'", "\\'")
        h_code = c['hex_code']
        img_url = c['image_url']
        is_def = 'true' if c['is_default'] else 'false'
        line = f"            {{ color_name: '{c_name}', hex_code: '{h_code}', is_default: {is_def}, image_url: '{img_url}' }},"
        new_colors_lines.append(line)
        
    new_colors_text = "\n".join(new_colors_lines)
    
    # Regex to replace the colors array for the specific slug block
    # It finds `slug: 'ranger',` and then the nearest `colors: [` block
    pattern = r"(slug:\s*'" + re.escape(slug) + r"'.*?colors:\s*\[)(.*?)(^\s*\]\s*,)"
    
    def repl(m):
        return f"{m.group(1)}\n{new_colors_text}\n{m.group(3)}"
        
    content = re.sub(pattern, repl, content, flags=re.DOTALL | re.MULTILINE)

with open('backend/src/index.ts', 'w') as f:
    f.write(content)
print("index.ts updated successfully!")
