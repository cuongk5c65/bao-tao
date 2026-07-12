import os
import re
import requests
from bs4 import BeautifulSoup
import unicodedata

def slugify(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^\w\s-]', '', text.lower())
    return re.sub(r'[-\s]+', '_', text).strip('_')

base_url = "https://danaford.com.vn"

car_targets = {
    "ranger": "/danh-muc/64/ranger-the-he-moi",
    "everest": "/danh-muc/63/everest-the-he-moi",
    "territory": "/danh-muc/65/territory-the-he-moi",
    "transit": "/danh-muc/56/transit-hoan-toan-moi",
    "ranger-raptor": "/danh-muc/54/ranger-raptor-the-he-moi",
    "mustang-mach-e": "/mustang-match-e" # special path
}

headers = {'User-Agent': 'Mozilla/5.0'}

color_mappings = {} # car_slug -> list of {color_name, hex_code, is_default, image_url}

for slug, list_path in car_targets.items():
    print(f"Crawling {slug}...")
    color_mappings[slug] = []
    seen_colors = set()
    
    # 1. Fetch the list page to find version links
    try:
        if list_path.startswith('/mustang'):
            version_links = [list_path] # it is a direct page
        else:
            resp = requests.get(base_url + list_path, headers=headers)
            soup = BeautifulSoup(resp.text, 'html.parser')
            version_links = []
            for a in soup.find_all('a', href=True):
                href = a['href']
                if href.startswith('/') and slug.replace('-raptor', '') in href and len(href) > max(len(list_path), 20):
                    if href not in version_links and '/danh-muc/' not in href:
                        version_links.append(href)
                        
        print(f"  Found {len(version_links)} version links")
        
        # 2. Fetch each version page
        for v_link in version_links:
            v_resp = requests.get(base_url + v_link, headers=headers)
            v_soup = BeautifulSoup(v_resp.text, 'html.parser')
            
            # Find color buttons
            color_btns = v_soup.find_all(class_='btnChangeColor')
            for btn in color_btns:
                color_name = btn.get('aria-label', '').replace('Change color ', '').replace('car', '').strip()
                if not color_name:
                    color_name = btn.get('title', '').strip()
                
                # Sometime title is not there, DanaFord uses JS, let's look for text or something
                if not color_name:
                    # heuristic
                    bg = btn.get('style', '')
                    if bg:
                        color_name = f"Màu {slugify(bg)}"
                    else:
                        continue
                
                # Cleanup color name (DanaFord puts "Change color Đỏ car" -> "Đỏ")
                color_name = color_name.replace('Change color', '').replace('car', '').strip()
                
                hex_code = btn.get('style', '').replace('--color:', '').replace(';', '').strip()
                if not hex_code: hex_code = '#000000'
                
                img_src = btn.get('data-image', '')
                if img_src and color_name not in seen_colors:
                    seen_colors.add(color_name)
                    
                    # Download image
                    img_data = requests.get(img_src, headers=headers).content
                    safe_color_name = slugify(color_name)
                    ext = img_src.split('.')[-1]
                    if len(ext) > 4: ext = 'png'
                    
                    filename = f"{slug}_{safe_color_name}.{ext}"
                    save_dir = f"/Users/cuongqnm/Desktop/App Khách/Bảo Táo/backend/public/uploads/cars/{slug}/colors"
                    os.makedirs(save_dir, exist_ok=True)
                    
                    with open(os.path.join(save_dir, filename), 'wb') as f:
                        f.write(img_data)
                        
                    image_url = f"/uploads/cars/{slug}/colors/{filename}"
                    is_default = (len(color_mappings[slug]) == 0)
                    
                    color_mappings[slug].append({
                        "color_name": color_name,
                        "hex_code": hex_code,
                        "is_default": is_default,
                        "image_url": image_url
                    })
                    print(f"    Saved {color_name} -> {filename}")
                    
    except Exception as e:
        print(f"Error {slug}: {e}")

print("\n--- Mapping Result ---")
for slug, colors in color_mappings.items():
    print(f"{slug}: {len(colors)} colors")
    
# We will inject this into index.ts in the next step
import json
with open('color_mappings.json', 'w') as f:
    json.dump(color_mappings, f, ensure_ascii=False, indent=2)

