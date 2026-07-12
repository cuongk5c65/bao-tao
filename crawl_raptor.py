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
list_path = "/danh-muc/54/ranger-raptor-the-he-moi"
headers = {'User-Agent': 'Mozilla/5.0'}

try:
    resp = requests.get(base_url + list_path, headers=headers)
    soup = BeautifulSoup(resp.text, 'html.parser')
    version_links = []
    for a in soup.find_all('a', href=True):
        href = a['href']
        if href.startswith('/') and 'raptor' in href:
            if href not in version_links and '/danh-muc/' not in href:
                version_links.append(href)
                
    print(f"Found Raptor links: {version_links}")
    
    raptor_colors = []
    seen_colors = set()
    
    for v_link in version_links:
        v_resp = requests.get(base_url + v_link, headers=headers)
        v_soup = BeautifulSoup(v_resp.text, 'html.parser')
        
        color_btns = v_soup.find_all(class_='btnChangeColor')
        for btn in color_btns:
            color_name = btn.get('aria-label', '').replace('Change color ', '').replace('car', '').strip()
            if not color_name:
                color_name = btn.get('title', '').strip()
            
            if not color_name:
                bg = btn.get('style', '')
                if bg:
                    color_name = f"Màu {slugify(bg)}"
                else:
                    continue
            
            color_name = color_name.replace('Change color', '').replace('car', '').strip()
            hex_code = btn.get('style', '').replace('--color:', '').replace(';', '').strip()
            if not hex_code: hex_code = '#000000'
            
            img_src = btn.get('data-image', '')
            if img_src and color_name not in seen_colors:
                seen_colors.add(color_name)
                
                img_data = requests.get(img_src, headers=headers).content
                safe_color_name = slugify(color_name)
                ext = img_src.split('.')[-1]
                if len(ext) > 4: ext = 'png'
                
                filename = f"raptor_{safe_color_name}.{ext}"
                save_dir = f"/Users/cuongqnm/Desktop/App Khách/Bảo Táo/backend/public/uploads/cars/ranger-raptor/colors"
                os.makedirs(save_dir, exist_ok=True)
                
                with open(os.path.join(save_dir, filename), 'wb') as f:
                    f.write(img_data)
                    
                image_url = f"/uploads/cars/ranger-raptor/colors/{filename}"
                raptor_colors.append({
                    "color_name": color_name,
                    "hex_code": hex_code,
                    "is_default": len(raptor_colors) == 0,
                    "image_url": image_url
                })
                print(f"Saved Raptor color: {color_name} -> {filename}")
                
except Exception as e:
    print(f"Error: {e}")

import json
with open('raptor_colors.json', 'w') as f:
    json.dump(raptor_colors, f, ensure_ascii=False, indent=2)
