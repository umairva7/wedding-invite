import os
from PIL import Image

input_path = 'caricature/illustration.png'
output_path = 'caricature/illustration.webp'

if os.path.exists(input_path):
    img = Image.open(input_path)
    # Convert RGBA to WebP with lossy compression quality 75
    img.save(output_path, 'WEBP', quality=75, optimize=True)
    orig_size = os.path.getsize(input_path)
    new_size = os.path.getsize(output_path)
    print(f"Compressed from {orig_size / (1024*1024):.2f} MB to {new_size / 1024:.1f} KB")
else:
    print("Input image not found")
