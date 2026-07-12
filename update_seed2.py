import re

with open('backend/src/index.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace /colors/ with /versions/ for all image_url that end in .png
def replacer(match):
    url = match.group(1)
    if url.endswith('.png'):
        url = url.replace('/colors/', '/versions/')
    elif 'wildtrak_3_0_1.jpg' in url:
        # Wildtrak 2.0 -> use Wildtrak 3.0 PNG instead of JPG with dirt background
        url = '/uploads/cars/ranger/versions/ford_ranger_moi_2026_wildtrak_3_0.png'
    return f"image_url: '{url}'"

new_content = re.sub(r"image_url: '([^']+)'", replacer, content)

with open('backend/src/index.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Updated backend/src/index.ts")
