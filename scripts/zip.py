import zipfile
import os

dist_dir = 'dist'
zip_filename = 'dist-iympack.zip'

if os.path.exists(zip_filename):
    os.remove(zip_filename)

print("Packing dist to dist-iympack.zip with POSIX forward slashes...")

# Files that hold live database on Hostinger, live credentials, or maintenance tools
# and should NEVER be overwritten or bundled into production deployment zip
EXCLUDE_FILES = {'collections.json', 'config.php', 'clean_posts.php'}

with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(dist_dir):
        for file in files:
            if file in EXCLUDE_FILES:
                print(f"  [Safety] Excluding sensitive/live file from zip: {file}")
                continue
            file_path = os.path.join(root, file)
            # Linux Hostinger requires forward slashes (/) instead of Windows backslashes (\)
            arcname = os.path.relpath(file_path, dist_dir).replace('\\', '/')
            # Never overwrite user uploaded images on Hostinger, but preserve protection files (.htaccess)
            if arcname.startswith('uploads/') and not (arcname.endswith('.gitkeep') or arcname.endswith('.htaccess')):
                continue
            zipf.write(file_path, arcname)

print("Done! File dist-iympack.zip ready for Hostinger Linux (Safe & Non-Destructive).")
