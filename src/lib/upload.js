/**
 * IYMPACK CMS — Image Upload & Client Compression Helper
 *
 * Mengoptimalkan file gambar sebelum disimpan:
 * 1. Mengompresi ukuran gambar via Canvas (maks lebar/tinggi 1280px, kualitas 80%)
 * 2. Mencoba upload langsung ke backend PHP Hostinger (/api/upload.php) jika online
 * 3. Jika offline atau di dev environment tanpa PHP, fallback ke Base64 terkompresi (<150KB)
 *    sehingga tidak pernah memicu error "LocalStorage penuh".
 */

/**
 * Kompres file gambar di browser menggunakan HTML Canvas
 * @param {File} file
 * @param {number} maxWidth
 * @param {number} quality (0.1 - 1.0)
 * @returns {Promise<Blob>}
 */
export function compressImage(file, maxWidth = 1280, quality = 0.8) {
  return new Promise((resolve, reject) => {
    // Jika bukan file gambar (misal PDF), langsung kembalikan
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Hitung skala resize proporsional
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Export ke format image/jpeg terkompresi
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file); // fallback file asli jika blob gagal
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Convert Blob/File to Base64 String
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

/**
 * Upload gambar: Coba upload ke /api/upload.php di Hostinger.
 * Menggunakan FormData terlebih dahulu, lalu JSON Base64 fallback,
 * dan terakhir fallback ke local Base64 jika benar-benar offline / dev mode.
 * @param {File} file
 * @returns {Promise<string>} URL gambar (/uploads/xxx.jpg) atau Base64 data URL
 */
export async function uploadImage(file) {
  if (!file) return '';

  // Pastikan nama file aman dan berekstensi (terutama foto dari kamera HP)
  let safeName = file.name || 'upload.jpg';
  if (!safeName.includes('.')) {
    safeName = `${safeName}.jpg`;
  }

  // 1. Kompres gambar terlebih dahulu
  let compressedBlob;
  try {
    compressedBlob = await compressImage(file, 1280, 0.82);
  } catch {
    compressedBlob = file;
  }

  // 2. Coba upload ke endpoint PHP Hostinger via FormData (Multipart)
  try {
    const formData = new FormData();
    formData.append('file', compressedBlob, safeName);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    const res = await fetch('/api/upload.php', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.url) {
        return json.url;
      }
    }
  } catch (err) {
    console.warn('[upload] FormData upload ke /api/upload.php gagal, mencoba JSON fallback:', err);
  }

  // 3. Fallback: Upload Base64 via JSON ke /api/upload.php
  // Sangat efektif jika firewall/mod_security Hostinger atau koneksi HP bermasalah dengan multipart
  try {
    const tightBlob = await compressImage(file, 1080, 0.78);
    const base64Data = await blobToBase64(tightBlob);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    const res = await fetch('/api/upload.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Data }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.url) {
        return json.url;
      }
    }
  } catch (err) {
    console.warn('[upload] JSON Base64 upload ke /api/upload.php gagal:', err);
  }

  // 4. Fallback Terakhir: Kompresi ketat ke Base64 lokal (dev offline)
  try {
    const tightBlob = await compressImage(file, 800, 0.75);
    return await blobToBase64(tightBlob);
  } catch {
    return await blobToBase64(file);
  }
}
