import os
from PIL import Image

def optimize_image(src_path, max_dim=1600, quality=80):
    if not os.path.exists(src_path):
        return
    orig_size = os.path.getsize(src_path)
    base, ext = os.path.splitext(src_path)
    webp_path = base + '.webp'
    
    with Image.open(src_path) as img:
        # Convert RGBA / P to RGB if saving JPEG, or keep RGBA for WebP/PNG
        w, h = img.size
        if w > max_dim or h > max_dim:
            if w > h:
                new_w = max_dim
                new_h = int(h * (max_dim / w))
            else:
                new_h = max_dim
                new_w = int(w * (max_dim / h))
            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Save WebP version
        img.save(webp_path, 'WEBP', quality=quality, method=6)
        webp_size = os.path.getsize(webp_path)
        
        # If original was PNG, optimize PNG
        if ext.lower() == '.png':
            img.save(src_path, 'PNG', optimize=True)
            new_orig_size = os.path.getsize(src_path)
            print(f"PNG {src_path}: {orig_size//1024}KB -> {new_orig_size//1024}KB (WebP: {webp_size//1024}KB)")
        elif ext.lower() in ('.jpg', '.jpeg'):
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img.save(src_path, 'JPEG', quality=quality, optimize=True)
            new_orig_size = os.path.getsize(src_path)
            print(f"JPG {src_path}: {orig_size//1024}KB -> {new_orig_size//1024}KB (WebP: {webp_size//1024}KB)")

if __name__ == '__main__':
    targets = [
        r'D:\iympack-react\public\hero-hands.png',
        r'D:\iympack-react\public\iympack-logo.png',
        r'D:\iympack-react\public\assets\images\hero.jpg',
        r'D:\iympack-react\public\assets\logo\logo-iympack.png',
        r'D:\iympack-react\public\assets\logo\logotp-removebg-preview.png',
        r'D:\iympack-react\public\assets\logo\logo-iympack-mengajar.png',
    ]
    for t in targets:
        optimize_image(t)
        
    events_dir = r'D:\iympack-react\public\events'
    if os.path.exists(events_dir):
        for f in os.listdir(events_dir):
            if f.lower().endswith(('.jpg', '.jpeg', '.png')) and not f.lower().endswith('.webp'):
                optimize_image(os.path.join(events_dir, f), max_dim=1200, quality=78)
