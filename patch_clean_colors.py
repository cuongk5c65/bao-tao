import re

with open('backend/src/index.ts', 'r') as f:
    content = f.read()

# 1. Raptor colors mapping
raptor_colors_text = """          colors: [
            { color_name: 'Xanh Performance', hex_code: '#0D47A1', is_default: true, image_url: '/uploads/cars/ranger-raptor/colors/raptor_mau_color_0c26a6.png' },
            { color_name: 'Đen Shadow', hex_code: '#1A1A1A', is_default: false, image_url: '/uploads/cars/ranger-raptor/colors/raptor_mau_color_000000.png' },
            { color_name: 'Trắng Arctic', hex_code: '#F5F5F0', is_default: false, image_url: '/uploads/cars/ranger-raptor/colors/raptor_mau_color_ffffff.png' },
            { color_name: 'Đỏ Code Orange', hex_code: '#D84315', is_default: false, image_url: '/uploads/cars/ranger-raptor/colors/raptor_mau_color_cd4e18.webp' },
            { color_name: 'Xám Conquer', hex_code: '#616161', is_default: false, image_url: '/uploads/cars/ranger-raptor/colors/raptor_mau_color_454545.png' },
          ],"""

# 2. Territory colors mapping
territory_colors_text = """          colors: [
            { color_name: 'Trắng Tuyết', hex_code: '#F5F5F0', is_default: true, image_url: '/uploads/cars/territory/colors/territory_mau_color_ffffff.png' },
            { color_name: 'Xám Bạc', hex_code: '#8B8D8E', is_default: false, image_url: '/uploads/cars/territory/colors/territory_mau_color_bdbdbd.png' },
            { color_name: 'Đỏ Ruby', hex_code: '#9B1B30', is_default: false, image_url: '/uploads/cars/territory/colors/territory_mau_color_d73333.png' },
            { color_name: 'Đen Absolute', hex_code: '#1A1A1A', is_default: false, image_url: '/uploads/cars/territory/colors/territory_mau_color_000000.png' },
            { color_name: 'Xanh Thiên Thanh', hex_code: '#4B9CD3', is_default: false, image_url: '/uploads/cars/territory/colors/territory_mau_color_4687b9.png' },
          ],"""

# Replace Raptor block
# Find `slug: 'ranger-raptor',` block and then the nearest `colors: [` block
raptor_pattern = r"(slug:\s*'ranger-raptor'.*?colors:\s*\[)(.*?)(^\s*\]\s*,)"
def repl_raptor(m):
    return f"slug: 'ranger-raptor',\n{raptor_colors_text}"
content = re.sub(r"slug:\s*'ranger-raptor',\s*colors:\s*\[.*?\],", f"slug: 'ranger-raptor',\n{raptor_colors_text}", content, flags=re.DOTALL)

# Replace Territory block
content = re.sub(r"slug:\s*'territory',\s*colors:\s*\[.*?\],", f"slug: 'territory',\n{territory_colors_text}", content, flags=re.DOTALL)

with open('backend/src/index.ts', 'w') as f:
    f.write(content)

print("index.ts clean patched!")
