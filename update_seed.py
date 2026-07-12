import re

def update_seed():
    path = "/Users/cuongqnm/Desktop/App Khách/Bảo Táo/backend/src/index.ts"
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to replace image_url: '/uploads/cars/[slug]/colors/[ten_file]'
    # with '/uploads/cars/[slug]/versions/[ten_file]'
    # Only for image_url property (or generally just replace '/colors/' with '/versions/' inside image_url)
    
    # We can match image_url: '/uploads/cars/([^/]+)/colors/([^']+)'
    new_content = re.sub(
        r"image_url:\s*'/uploads/cars/([^/]+)/colors/([^']+)'",
        r"image_url: '/uploads/cars/\1/versions/\2'",
        content
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print("Updated database seed.")

if __name__ == '__main__':
    update_seed()
