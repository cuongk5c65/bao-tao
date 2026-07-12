import os
import re
import requests
from bs4 import BeautifulSoup
import urllib.parse

def setup_dirs():
    base = "/Users/cuongqnm/Desktop/App Khách/Bảo Táo/backend/public/uploads/cars"
    cars = ["ranger", "everest", "territory", "transit", "ranger-raptor", "mustang-mach-e"]
    for car in cars:
        os.makedirs(os.path.join(base, car, "versions"), exist_ok=True)

def crawl():
    base_url = "https://danaford.com.vn"
    targets = {
        "ranger": "/ford-ranger",
        "everest": "/ford-everest",
        "territory": "/ford-territory"
    }
    
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    for slug, path in targets.items():
        url = base_url + path
        try:
            resp = requests.get(url, headers=headers)
            soup = BeautifulSoup(resp.text, 'html.parser')
            
            # Simple heuristic: find images within 'Các phiên bản' section or just fetch car images
            # This is a generic approach since we don't have the exact DOM structure
            images = soup.find_all('img')
            count = 0
            for img in images:
                src = img.get('src')
                if not src: continue
                # Typically car version images might have 'png' or 'jpg' and a certain size/name
                if '.png' in src.lower() or '.jpg' in src.lower():
                    # Download the image
                    img_url = urllib.parse.urljoin(base_url, src)
                    filename = os.path.basename(urllib.parse.urlparse(img_url).path)
                    
                    # Basic filter to avoid logos/icons
                    if len(filename) > 10 and ('ford' in filename.lower() or slug in filename.lower()):
                        img_data = requests.get(img_url, headers=headers).content
                        save_path = f"/Users/cuongqnm/Desktop/App Khách/Bảo Táo/backend/public/uploads/cars/{slug}/versions/{filename}"
                        with open(save_path, 'wb') as f:
                            f.write(img_data)
                        count += 1
            print(f"Downloaded {count} images for {slug}")
        except Exception as e:
            print(f"Error crawling {slug}: {e}")

if __name__ == '__main__':
    setup_dirs()
    crawl()
