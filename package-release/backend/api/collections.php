<?php
/**
 * IYMPACK CMS — Collections REST API
 * 
 * Mengelola penyimpanan JSON collections ke MySQL Hostinger.
 */

require_once __DIR__ . '/db.php';

setSecureCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if (!in_array($method, ['GET', 'POST'], true)) {
    respondJson(['success' => false, 'error' => 'Metode HTTP tidak diizinkan.'], 405);
}

/**
 * Validasi nama collection key agar tidak ada karakter ilegal / path traversal
 */
function isValidCollectionKey($key) {
    return is_string($key) && preg_match('/^[a-zA-Z0-9_\-]{2,64}$/', $key);
}

/**
 * Daftar koleksi privat yang berisi PII (data pribadi) atau data kredensial
 * yang TIDAK BOLEH diakses tanpa autentikasi admin yang valid.
 */
$PRIVATE_COLLECTIONS = [
    'iympack_applicants',
    'applicants',
    'iympack_users',
    'users',
    'iympack_audit_logs',
    'audit_logs',
    'iympack_slot_holds',
    'slot_holds'
];

function isPrivateCollection($name) {
    global $PRIVATE_COLLECTIONS;
    return in_array(strtolower(trim((string)$name)), $PRIVATE_COLLECTIONS, true);
}

/**
 * Sanitasi data masukan secara rekursif untuk mencegah Stored XSS dan byte anomali
 */
function sanitizePayloadData($data, $depth = 0) {
    if ($depth > 12) return null;
    if (is_array($data)) {
        $clean = [];
        foreach ($data as $k => $v) {
            $cleanKey = is_string($k) ? substr(strip_tags($k), 0, 100) : $k;
            $clean[$cleanKey] = sanitizePayloadData($v, $depth + 1);
        }
        return $clean;
    }
    if (is_string($data)) {
        $clean = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $data);
        $clean = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $clean);
        return $clean;
    }
    return $data;
}

// Folder data fallback
$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0777, true);
}
@chmod($dataDir, 0777);

$dataFile = $dataDir . '/collections.json';
if (!file_exists($dataFile)) {
    @file_put_contents($dataFile, '{}');
    @chmod($dataFile, 0666);
}

function getFileCollections($file) {
    if (!file_exists($file)) return [];
    $raw = @file_get_contents($file);
    if (!$raw) return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function saveFileCollections($file, $allData) {
    $json = json_encode($allData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $res = @file_put_contents($file, $json, LOCK_EX);
    if ($res === false) {
        $res = @file_put_contents($file, $json);
    }
    if ($res !== false) {
        @chmod($file, 0666);
    }
    return $res !== false;
}

/**
 * Auto-seed database MySQL jika tabel iympack_collections masih kosong
 */
function ensureDatabaseSeeded($pdo, $dataFile) {
    if ($pdo === null) return;
    try {
        $countStmt = $pdo->query("SELECT COUNT(*) AS total FROM `iympack_collections`");
        $total = (int)$countStmt->fetchColumn();
        if ($total === 0 && file_exists($dataFile)) {
            $seedData = getFileCollections($dataFile);
            if (!empty($seedData) && is_array($seedData)) {
                $ins = $pdo->prepare("INSERT INTO `iympack_collections` (`name`, `data`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `data` = VALUES(`data`)");
                foreach ($seedData as $cName => $cVal) {
                    $ins->execute([$cName, json_encode($cVal, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
                }
            }
        }
    } catch (Throwable $e) {
        error_log('[Seed Check] ' . $e->getMessage());
    }
}
ensureDatabaseSeeded($pdo, $dataFile);

// ─── 1. GET METHOD ─────────────────────────────────────────────
if ($method === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    // Endpoint khusus untuk mem-parsing link Google Maps (ekstrak nama tempat & URL embed)
    if ($action === 'parse_maps') {
        $rawUrl = isset($_GET['url']) ? trim($_GET['url']) : '';
        if (empty($rawUrl)) {
            respondJson(['success' => false, 'error' => 'URL peta tidak boleh kosong.'], 400);
        }

        if (preg_match('/src=["\'](.*?)["\']/', $rawUrl, $matches)) {
            $rawUrl = $matches[1];
        }

        $resolvedUrl = $rawUrl;

        // Resolve link pendek maps.app.goo.gl atau goo.gl
        if (strpos($rawUrl, 'maps.app.goo.gl') !== false || strpos($rawUrl, 'goo.gl/maps') !== false) {
            if (function_exists('curl_init')) {
                $ch = curl_init($rawUrl);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
                curl_setopt($ch, CURLOPT_TIMEOUT, 6);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_exec($ch);
                $finalUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
                curl_close($ch);
                if (!empty($finalUrl)) {
                    $resolvedUrl = $finalUrl;
                }
            }
        }

        $placeName = '';
        $lat = '';
        $lng = '';

        if (preg_match('#/place/([^/@?]+)#', $resolvedUrl, $m)) {
            $placeName = urldecode(str_replace('+', ' ', $m[1]));
        } elseif (preg_match('#[?&]q=([^&]+)#', $resolvedUrl, $m)) {
            $placeName = urldecode(str_replace('+', ' ', $m[1]));
        }

        if (preg_match('#/@(-?\d+\.\d+),(-?\d+\.\d+)#', $resolvedUrl, $m)) {
            $lat = $m[1];
            $lng = $m[2];
        } elseif (preg_match('#[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)#', $resolvedUrl, $m)) {
            $lat = $m[1];
            $lng = $m[2];
        }

        $embedUrl = '';
        if (strpos($resolvedUrl, 'google.com/maps/embed') !== false) {
            $embedUrl = $resolvedUrl;
        } elseif (!empty($lat) && !empty($lng)) {
            $q = !empty($placeName) ? urlencode($placeName) : ($lat . ',' . $lng);
            $embedUrl = "https://maps.google.com/maps?q={$q}&ll={$lat},{$lng}&z=16&output=embed";
        } elseif (!empty($placeName)) {
            $embedUrl = "https://maps.google.com/maps?q=" . urlencode($placeName) . "&z=16&output=embed";
        }

        respondJson([
            'success' => true,
            'placeName' => $placeName,
            'lat' => $lat,
            'lng' => $lng,
            'embedUrl' => $embedUrl,
            'resolvedUrl' => $resolvedUrl,
            'originalUrl' => $rawUrl
        ]);
    }

    $key = isset($_GET['key']) ? trim($_GET['key']) : '';
    $keysParam = isset($_GET['keys']) ? trim($_GET['keys']) : '';
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : null;
    $limit = isset($_GET['limit']) ? max(1, min(500, (int)$_GET['limit'])) : null;
    $search = isset($_GET['search']) ? trim(mb_strtolower($_GET['search'])) : '';

    $authUser = getAuthenticatedUser($pdo);
    $isAdmin = ($authUser !== null);

    if ($pdo !== null) {
        // Mode MySQL
        if (!empty($keysParam)) {
            // Ambil hanya sekumpulan key tertentu (menghemat memori & transfer data)
            $keyList = array_values(array_filter(array_map('trim', explode(',', $keysParam))));

            // Jika bukan admin, saring seluruh key privat
            if (!$isAdmin) {
                $keyList = array_values(array_filter($keyList, function($k) {
                    return !isPrivateCollection($k);
                }));
                if (empty($keyList)) {
                    respondJson([
                        'success' => false,
                        'error' => 'Akses ditolak: Koleksi yang diminta bersifat privat dan memerlukan autentikasi sesi admin.'
                    ], 401);
                }
            }

            if (!empty($keyList)) {
                $placeholders = implode(',', array_fill(0, count($keyList), '?'));
                $stmt = $pdo->prepare("SELECT `name`, `data` FROM `iympack_collections` WHERE `name` IN ($placeholders)");
                $stmt->execute($keyList);
                $results = [];
                while ($row = $stmt->fetch()) {
                    if (!$isAdmin && isPrivateCollection($row['name'])) {
                        continue;
                    }
                    $decoded = json_decode($row['data'], true);
                    $results[$row['name']] = $decoded !== null ? $decoded : [];
                }
                respondJson([
                    'success' => true,
                    'driver' => 'mysql',
                    'count' => count($results),
                    'data' => $results
                ]);
            }
        }

        if ($key === 'all' || empty($key)) {
            $stmt = $pdo->query("SELECT `name`, `data` FROM `iympack_collections`");
            $results = [];
            while ($row = $stmt->fetch()) {
                // Keamanan Kritis: Jika pengunjung umum, jangan pernah sertakan koleksi privat!
                if (!$isAdmin && isPrivateCollection($row['name'])) {
                    continue;
                }
                $decoded = json_decode($row['data'], true);
                $results[$row['name']] = $decoded !== null ? $decoded : [];
            }
            respondJson([
                'success' => true,
                'driver' => 'mysql',
                'count' => count($results),
                'data' => $results
            ]);
        } else {
            // Cek akses per-koleksi spesifik
            if (!$isAdmin && isPrivateCollection($key)) {
                respondJson([
                    'success' => false,
                    'error' => 'Akses ditolak: Koleksi "' . htmlspecialchars($key, ENT_QUOTES, 'UTF-8') . '" bersifat privat dan memerlukan autentikasi sesi admin.'
                ], 401);
            }

            $stmt = $pdo->prepare("SELECT `data` FROM `iympack_collections` WHERE `name` = ? LIMIT 1");
            $stmt->execute([$key]);
            $row = $stmt->fetch();
            $decoded = $row ? json_decode($row['data'], true) : null;

            // Fitur Pagination & Filtering jika diminta untuk koleksi array (misal: applicants, audit_logs)
            if (is_array($decoded) && ($page !== null || $limit !== null)) {
                $items = $decoded;

                // Filter pencarian jika ada parameter search
                if (!empty($search)) {
                    $items = array_values(array_filter($items, function ($item) use ($search) {
                        if (!is_array($item)) return false;
                        $searchable = mb_strtolower(json_encode($item, JSON_UNESCAPED_UNICODE));
                        return strpos($searchable, $search) !== false;
                    }));
                }

                $total = count($items);
                $effectiveLimit = $limit ? $limit : 20;
                $effectivePage = $page ? $page : 1;
                $offset = ($effectivePage - 1) * $effectiveLimit;
                $paginatedData = array_slice($items, $offset, $effectiveLimit);

                respondJson([
                    'success' => true,
                    'driver' => 'mysql',
                    'key' => $key,
                    'pagination' => [
                        'page' => $effectivePage,
                        'limit' => $effectiveLimit,
                        'total' => $total,
                        'total_pages' => (int)ceil($total / $effectiveLimit)
                    ],
                    'data' => $paginatedData
                ]);
            }

            respondJson([
                'success' => true,
                'driver' => 'mysql',
                'data' => $decoded
            ]);
        }
    } else {
        // Mode File Storage Fallback
        $allData = getFileCollections($dataFile);
        if ($key === 'all' || empty($key)) {
            // Saring koleksi privat jika bukan admin
            if (!$isAdmin) {
                foreach (array_keys($allData) as $k) {
                    if (isPrivateCollection($k)) {
                        unset($allData[$k]);
                    }
                }
            }
            respondJson([
                'success' => true,
                'driver' => 'file',
                'count' => count($allData),
                'data' => $allData
            ]);
        } else {
            if (!$isAdmin && isPrivateCollection($key)) {
                respondJson([
                    'success' => false,
                    'error' => 'Akses ditolak: Koleksi "' . htmlspecialchars($key, ENT_QUOTES, 'UTF-8') . '" bersifat privat dan memerlukan autentikasi sesi admin.'
                ], 401);
            }
            $data = isset($allData[$key]) ? $allData[$key] : null;
            if (is_array($data) && ($page !== null || $limit !== null)) {
                $items = $data;
                if (!empty($search)) {
                    $items = array_values(array_filter($items, function ($item) use ($search) {
                        if (!is_array($item)) return false;
                        return strpos(mb_strtolower(json_encode($item)), $search) !== false;
                    }));
                }
                $total = count($items);
                $effectiveLimit = $limit ? $limit : 20;
                $effectivePage = $page ? $page : 1;
                $offset = ($effectivePage - 1) * $effectiveLimit;
                $paginatedData = array_slice($items, $offset, $effectiveLimit);

                respondJson([
                    'success' => true,
                    'driver' => 'file',
                    'key' => $key,
                    'pagination' => [
                        'page' => $effectivePage,
                        'limit' => $effectiveLimit,
                        'total' => $total,
                        'total_pages' => (int)ceil($total / $effectiveLimit)
                    ],
                    'data' => $paginatedData
                ]);
            }

            respondJson([
                'success' => true,
                'driver' => 'file',
                'data' => $data
            ]);
        }
    }
}

// ─── 2. POST METHOD ────────────────────────────────────────────
if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');

    if (strlen($rawInput) > 10 * 1024 * 1024) {
        respondJson(['success' => false, 'error' => 'Ukuran payload melebihi batas 10MB.'], 413);
    }

    $payload = json_decode($rawInput, true);

    if (!is_array($payload)) {
        respondJson(['success' => false, 'error' => 'Invalid JSON payload.'], 400);
    }

    $payload = sanitizePayloadData($payload);

    $action = isset($_GET['action']) ? $_GET['action'] : (isset($payload['action']) ? $payload['action'] : 'save');

    // ─── Authorization Check (OWASP A01: Broken Access Control) ────
    // Hanya proses pendaftaran publik yang diizinkan tanpa autentikasi admin
    $publicActions = ['hold_slot', 'release_hold', 'register_applicant'];

    if (!in_array($action, $publicActions, true)) {
        // Semua operasi penulisan/modifikasi data lainnya WAJIB autentikasi admin
        $authAdmin = requireAdminAuth($pdo);

        // Operasi modifikasi akun pengguna (iympack_users) hanya boleh dilakukan oleh Super Admin
        $targetKey = isset($payload['key']) ? trim($payload['key']) : '';
        if (($targetKey === 'iympack_users' || $targetKey === 'users') && ($authAdmin['role'] ?? '') !== 'super_admin') {
            respondJson([
                'success' => false,
                'error' => 'Akses ditolak: Hanya Super Admin yang berhak memodifikasi akun pengguna.'
            ], 403);
        }
    }

    if ($pdo !== null) {
        // ─── Mode MySQL ────────────────────────────────────────
        if ($action === 'bulk_sync' && isset($payload['collections']) && is_array($payload['collections'])) {
            $pdo->beginTransaction();
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO `iympack_collections` (`name`, `data`)
                    VALUES (:name, :data)
                    ON DUPLICATE KEY UPDATE `data` = VALUES(`data`), `updated_at` = CURRENT_TIMESTAMP
                ");
                foreach ($payload['collections'] as $collName => $collData) {
                    if (!isValidCollectionKey($collName)) continue;
                    $json = json_encode($collData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                    $stmt->execute([':name' => $collName, ':data' => $json]);
                }
                $pdo->commit();
                respondJson(['success' => true, 'driver' => 'mysql', 'message' => 'Bulk sync berhasil disimpan ke MySQL.']);
            } catch (Exception $e) {
                $pdo->rollBack();
                respondJson(['success' => false, 'error' => 'Gagal memproses bulk sync.'], 500);
            }
        }

        // ─── ACTION: HOLD SLOT (Reservasi Slot 15 Menit) ────────
        if ($action === 'hold_slot') {
            $eventId = isset($payload['eventId']) ? trim($payload['eventId']) : '';
            $holdId = isset($payload['holdId']) ? trim($payload['holdId']) : '';
            $email = isset($payload['email']) ? trim($payload['email']) : '';
            $fullName = isset($payload['fullName']) ? trim($payload['fullName']) : '';

            if (empty($eventId) || empty($holdId)) {
                respondJson(['success' => false, 'error' => 'Parameter eventId dan holdId wajib disertakan.'], 400);
            }

            $pdo->beginTransaction();
            try {
                $now = time();

                // 1. Ambil & kunci holds
                $hStmt = $pdo->prepare("SELECT `data` FROM `iympack_collections` WHERE `name` = 'iympack_slot_holds' FOR UPDATE");
                $hStmt->execute();
                $hRow = $hStmt->fetch();
                $holds = $hRow ? json_decode($hRow['data'], true) : [];
                if (!is_array($holds)) $holds = [];

                // Bersihkan hold yang sudah expired (> 15 menit)
                $holds = array_values(array_filter($holds, function ($h) use ($now) {
                    return isset($h['expiresAt']) && (int)$h['expiresAt'] > $now;
                }));

                // 2. Kunci events
                $evStmt = $pdo->prepare("SELECT `name`, `data` FROM `iympack_collections` WHERE `name` IN ('iympack_events', 'events') ORDER BY (`name` = 'iympack_events') DESC LIMIT 1 FOR UPDATE");
                $evStmt->execute();
                $evRow = $evStmt->fetch();
                $events = $evRow ? json_decode($evRow['data'], true) : [];
                if (!is_array($events)) $events = [];

                $eventIndex = -1;
                foreach ($events as $idx => $ev) {
                    if ((isset($ev['id']) && (string)$ev['id'] === (string)$eventId) || (isset($ev['slug']) && (string)$ev['slug'] === (string)$eventId)) {
                        $eventIndex = $idx;
                        break;
                    }
                }

                if ($eventIndex === -1) {
                    $pdo->rollBack();
                    respondJson(['success' => false, 'error' => 'Kegiatan tidak ditemukan di database.'], 404);
                }

                $targetEvent = $events[$eventIndex];
                if (isset($targetEvent['status']) && $targetEvent['status'] === 'closed') {
                    $pdo->rollBack();
                    respondJson(['success' => false, 'error' => 'KUOTA_PENUH', 'message' => 'Pendaftaran untuk kegiatan ini sudah ditutup resmi.'], 409);
                }

                $maxQuota = isset($targetEvent['maxQuota']) ? (int)$targetEvent['maxQuota'] : 0;
                $currentCount = isset($targetEvent['currentApplicants']) ? (int)$targetEvent['currentApplicants'] : 0;

                // 3. Kunci applicants untuk hitung pendaftar riil
                $appStmt = $pdo->prepare("SELECT `data` FROM `iympack_collections` WHERE `name` IN ('iympack_applicants', 'applicants') ORDER BY (`name` = 'iympack_applicants') DESC LIMIT 1 FOR UPDATE");
                $appStmt->execute();
                $appRow = $appStmt->fetch();
                $applicants = $appRow ? json_decode($appRow['data'], true) : [];
                if (!is_array($applicants)) $applicants = [];

                $actualEventId = (string)($targetEvent['id'] ?? $eventId);
                $actualSlug = (string)($targetEvent['slug'] ?? '');

                $realCount = 0;
                foreach ($applicants as $app) {
                    if (isset($app['eventId']) && ((string)$app['eventId'] === $actualEventId || ($actualSlug && (string)$app['eventId'] === $actualSlug))) {
                        $realCount++;
                    }
                }

                // 4. Hitung hold aktif dari pendaftar LAIN (yang bukan holdId saya)
                $otherActiveHolds = 0;
                $myExistingHold = null;
                foreach ($holds as $h) {
                    $matchEv = isset($h['eventId']) && ((string)$h['eventId'] === $actualEventId || ($actualSlug && (string)$h['eventId'] === $actualSlug));
                    if ($matchEv) {
                        if (isset($h['holdId']) && $h['holdId'] === $holdId) {
                            $myExistingHold = $h;
                        } else {
                            $otherActiveHolds++;
                        }
                    }
                }

                $totalOccupied = max($currentCount, $realCount) + $otherActiveHolds;

                // Jika kuota penuh dan saya belum punya hold aktif
                if ($maxQuota > 0 && $totalOccupied >= $maxQuota && $myExistingHold === null) {
                    $pdo->rollBack();
                    respondJson([
                        'success' => false,
                        'error' => 'SLOT_SEDANG_DITAHAN',
                        'message' => 'Sisa slot saat ini sedang diamankan oleh pendaftar lain yang sedang menyelesaikan pembayaran (batas waktu 15 menit). Silakan coba lagi dalam beberapa saat jika slot dilepaskan.'
                    ], 409);
                }

                // Masih ada slot / perpanjang slot saya
                $expiresAt = $now + 900; // 15 menit dari sekarang
                $holds = array_values(array_filter($holds, function ($h) use ($holdId) {
                    return isset($h['holdId']) && $h['holdId'] !== $holdId;
                }));

                $holds[] = [
                    'holdId' => $holdId,
                    'eventId' => $actualEventId,
                    'email' => $email,
                    'fullName' => $fullName,
                    'createdAt' => $now,
                    'expiresAt' => $expiresAt
                ];

                // Simpan holds
                $saveHStmt = $pdo->prepare("
                    INSERT INTO `iympack_collections` (`name`, `data`)
                    VALUES ('iympack_slot_holds', :data)
                    ON DUPLICATE KEY UPDATE `data` = VALUES(`data`), `updated_at` = CURRENT_TIMESTAMP
                ");
                $saveHStmt->execute([':data' => json_encode($holds, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);

                $pdo->commit();

                respondJson([
                    'success' => true,
                    'holdId' => $holdId,
                    'expiresAt' => $expiresAt,
                    'durationSeconds' => 900,
                    'message' => '1 slot berhasil diamankan untuk Anda selama 15 menit.'
                ]);
            } catch (Exception $e) {
                $pdo->rollBack();
                respondJson(['success' => false, 'error' => 'Gagal mengamankan slot: ' . $e->getMessage()], 500);
            }
        }

        // ─── ACTION: RELEASE HOLD (Batal Reservasi) ─────────────
        if ($action === 'release_hold') {
            $holdId = isset($payload['holdId']) ? trim($payload['holdId']) : '';
            if (!empty($holdId)) {
                $pdo->beginTransaction();
                try {
                    $hStmt = $pdo->prepare("SELECT `data` FROM `iympack_collections` WHERE `name` = 'iympack_slot_holds' FOR UPDATE");
                    $hStmt->execute();
                    $hRow = $hStmt->fetch();
                    $holds = $hRow ? json_decode($hRow['data'], true) : [];
                    if (is_array($holds)) {
                        $holds = array_values(array_filter($holds, function ($h) use ($holdId) {
                            return isset($h['holdId']) && $h['holdId'] !== $holdId;
                        }));
                        $saveHStmt = $pdo->prepare("
                            INSERT INTO `iympack_collections` (`name`, `data`)
                            VALUES ('iympack_slot_holds', :data)
                            ON DUPLICATE KEY UPDATE `data` = VALUES(`data`), `updated_at` = CURRENT_TIMESTAMP
                        ");
                        $saveHStmt->execute([':data' => json_encode($holds, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
                    }
                    $pdo->commit();
                } catch (Exception $e) {
                    $pdo->rollBack();
                }
            }
            respondJson(['success' => true]);
        }

        if ($action === 'register_applicant') {
            $eventId = isset($payload['eventId']) ? trim($payload['eventId']) : '';
            $applicant = isset($payload['applicant']) ? $payload['applicant'] : null;

            if (empty($eventId) || !is_array($applicant)) {
                respondJson(['success' => false, 'error' => 'Parameter eventId dan data pendaftar wajib disertakan.'], 400);
            }

            $pdo->beginTransaction();
            try {
                // 1. Kunci baris events untuk validasi kuota atomic (dukung iympack_events & events)
                $evStmt = $pdo->prepare("SELECT `name`, `data` FROM `iympack_collections` WHERE `name` IN ('iympack_events', 'events') ORDER BY (`name` = 'iympack_events') DESC LIMIT 1 FOR UPDATE");
                $evStmt->execute();
                $evRow = $evStmt->fetch();
                $eventsKeyName = $evRow ? $evRow['name'] : 'iympack_events';
                $events = $evRow ? json_decode($evRow['data'], true) : [];
                if (!is_array($events)) $events = [];

                $eventIndex = -1;
                foreach ($events as $idx => $ev) {
                    if ((isset($ev['id']) && (string)$ev['id'] === (string)$eventId) || (isset($ev['slug']) && (string)$ev['slug'] === (string)$eventId)) {
                        $eventIndex = $idx;
                        break;
                    }
                }

                if ($eventIndex === -1) {
                    $pdo->rollBack();
                    respondJson(['success' => false, 'error' => 'Kegiatan tidak ditemukan di database.'], 404);
                }

                $targetEvent = &$events[$eventIndex];

                if (isset($targetEvent['status']) && $targetEvent['status'] === 'closed') {
                    $pdo->rollBack();
                    respondJson([
                        'success' => false,
                        'error' => 'KUOTA_PENUH',
                        'message' => 'Pendaftaran untuk kegiatan ini sudah ditutup resmi.'
                    ], 409);
                }

                $maxQuota = isset($targetEvent['maxQuota']) ? (int)$targetEvent['maxQuota'] : 0;
                $currentCount = isset($targetEvent['currentApplicants']) ? (int)$targetEvent['currentApplicants'] : 0;

                // 2. Kunci baris applicants dan hitung jumlah riil pendaftar untuk event ini
                $appStmt = $pdo->prepare("SELECT `name`, `data` FROM `iympack_collections` WHERE `name` IN ('iympack_applicants', 'applicants') ORDER BY (`name` = 'iympack_applicants') DESC LIMIT 1 FOR UPDATE");
                $appStmt->execute();
                $appRow = $appStmt->fetch();
                $applicantsKeyName = $appRow ? $appRow['name'] : 'iympack_applicants';
                $applicants = $appRow ? json_decode($appRow['data'], true) : [];
                if (!is_array($applicants)) $applicants = [];

                $realCount = 0;
                $actualEventId = (string)($targetEvent['id'] ?? $eventId);
                $actualSlug = (string)($targetEvent['slug'] ?? '');
                foreach ($applicants as $app) {
                    if (isset($app['eventId']) && ((string)$app['eventId'] === $actualEventId || ($actualSlug && (string)$app['eventId'] === $actualSlug))) {
                        $realCount++;
                    }
                }

                // 3. Kunci slot holds & periksa apakah pendaftar ini memegang reservasi slot aktif
                $holdId = isset($payload['holdId']) ? trim($payload['holdId']) : (isset($applicant['holdId']) ? trim($applicant['holdId']) : '');
                $hStmt = $pdo->prepare("SELECT `data` FROM `iympack_collections` WHERE `name` = 'iympack_slot_holds' FOR UPDATE");
                $hStmt->execute();
                $hRow = $hStmt->fetch();
                $holds = $hRow ? json_decode($hRow['data'], true) : [];
                if (!is_array($holds)) $holds = [];

                $now = time();
                $myHoldFound = false;
                $otherActiveHolds = 0;
                foreach ($holds as $h) {
                    if (isset($h['expiresAt']) && (int)$h['expiresAt'] > $now) {
                        $matchEv = isset($h['eventId']) && ((string)$h['eventId'] === $actualEventId || ($actualSlug && (string)$h['eventId'] === $actualSlug));
                        if ($matchEv) {
                            if (!empty($holdId) && isset($h['holdId']) && $h['holdId'] === $holdId) {
                                $myHoldFound = true;
                            } else {
                                $otherActiveHolds++;
                            }
                        }
                    }
                }

                // Jika pendaftar memegang slot valid, slot sudah direservasi untuknya!
                // Jika pendaftar tidak memegang slot, perhitungkan slot yang sedang di-hold orang lain
                $effectiveCount = max($currentCount, $realCount) + ($myHoldFound ? 0 : $otherActiveHolds);

                // Jika kuota sudah penuh dan pendaftar tidak memegang reservasi slot
                if ($maxQuota > 0 && $effectiveCount >= $maxQuota && !$myHoldFound) {
                    // Update event counter agar sinkron
                    $targetEvent['currentApplicants'] = max($currentCount, $realCount);
                    $saveEvStmt = $pdo->prepare("
                        INSERT INTO `iympack_collections` (`name`, `data`)
                        VALUES (:name, :data)
                        ON DUPLICATE KEY UPDATE `data` = VALUES(`data`), `updated_at` = CURRENT_TIMESTAMP
                    ");
                    $saveEvStmt->execute([':name' => $eventsKeyName, ':data' => json_encode($events, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
                    $pdo->commit();

                    respondJson([
                        'success' => false,
                        'error' => 'KUOTA_PENUH',
                        'message' => 'KUOTA_PENUH: Kuota pendaftaran untuk kegiatan ini baru saja terpenuhi oleh pendaftar lain.'
                    ], 409);
                }

                // Kuota masih tersedia! Tambahkan pendaftar & naikkan counter kuota
                $applicants[] = $applicant;
                $targetEvent['currentApplicants'] = max($currentCount, $realCount) + 1;

                // Simpan applicants
                $saveAppStmt = $pdo->prepare("
                    INSERT INTO `iympack_collections` (`name`, `data`)
                    VALUES (:name, :data)
                    ON DUPLICATE KEY UPDATE `data` = VALUES(`data`), `updated_at` = CURRENT_TIMESTAMP
                ");
                $saveAppStmt->execute([':name' => $applicantsKeyName, ':data' => json_encode($applicants, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);

                // Simpan events
                $saveEvStmt = $pdo->prepare("
                    INSERT INTO `iympack_collections` (`name`, `data`)
                    VALUES (:name, :data)
                    ON DUPLICATE KEY UPDATE `data` = VALUES(`data`), `updated_at` = CURRENT_TIMESTAMP
                ");
                $saveEvStmt->execute([':name' => $eventsKeyName, ':data' => json_encode($events, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);

                // Lepaskan reservasi slot yang dipegang pendaftar ini karena sudah resmi terdaftar
                if (!empty($holdId) || $myHoldFound) {
                    $holds = array_values(array_filter($holds, function ($h) use ($holdId) {
                        return isset($h['holdId']) && $h['holdId'] !== $holdId;
                    }));
                    $saveHStmt = $pdo->prepare("
                        INSERT INTO `iympack_collections` (`name`, `data`)
                        VALUES ('iympack_slot_holds', :data)
                        ON DUPLICATE KEY UPDATE `data` = VALUES(`data`), `updated_at` = CURRENT_TIMESTAMP
                    ");
                    $saveHStmt->execute([':data' => json_encode($holds, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
                }

                $pdo->commit();

                respondJson([
                    'success' => true,
                    'driver' => 'mysql',
                    'applicant' => $applicant,
                    'updatedEvent' => $targetEvent,
                    'remainingSlots' => $maxQuota > 0 ? max(0, $maxQuota - ($effectiveCount + 1)) : 999
                ]);
            } catch (Exception $e) {
                $pdo->rollBack();
                respondJson(['success' => false, 'error' => 'Gagal memproses pendaftaran atomic: ' . $e->getMessage()], 500);
            }
        }

        if ($action === 'append') {
            $key = isset($payload['key']) ? trim($payload['key']) : '';
            $item = isset($payload['item']) ? $payload['item'] : null;

            if (empty($key) || !isValidCollectionKey($key) || $item === null) {
                respondJson(['success' => false, 'error' => 'Parameter key tidak valid atau data item kosong.'], 400);
            }

            $pdo->beginTransaction();
            try {
                $stmt = $pdo->prepare("SELECT `data` FROM `iympack_collections` WHERE `name` = ? FOR UPDATE");
                $stmt->execute([$key]);
                $row = $stmt->fetch();
                $list = $row ? json_decode($row['data'], true) : [];
                if (!is_array($list)) $list = [];
                $list[] = $item;
                $json = json_encode($list, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

                $saveStmt = $pdo->prepare("
                    INSERT INTO `iympack_collections` (`name`, `data`)
                    VALUES (:name, :data)
                    ON DUPLICATE KEY UPDATE `data` = VALUES(`data`), `updated_at` = CURRENT_TIMESTAMP
                ");
                $saveStmt->execute([':name' => $key, ':data' => $json]);
                $pdo->commit();
                respondJson(['success' => true, 'driver' => 'mysql', 'item' => $item]);
            } catch (Exception $e) {
                $pdo->rollBack();
                respondJson(['success' => false, 'error' => 'Gagal menambahkan data ke server.'], 500);
            }
        }

        // Save single
        $key = isset($payload['key']) ? trim($payload['key']) : '';
        $data = isset($payload['data']) ? $payload['data'] : null;

        if (empty($key) || !isValidCollectionKey($key)) {
            respondJson(['success' => false, 'error' => 'Parameter key tidak valid atau kosong.'], 400);
        }

        try {
            $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $stmt = $pdo->prepare("
                INSERT INTO `iympack_collections` (`name`, `data`)
                VALUES (:name, :data)
                ON DUPLICATE KEY UPDATE `data` = VALUES(`data`), `updated_at` = CURRENT_TIMESTAMP
            ");
            $stmt->execute([':name' => $key, ':data' => $json]);
            respondJson(['success' => true, 'driver' => 'mysql', 'key' => $key]);
        } catch (Throwable $e) {
            respondJson(['success' => false, 'error' => $e->getMessage()], 500);
        }

    } else {
        // ─── Mode File Storage Fallback (Tanpa MySQL) ──────────
        $allData = getFileCollections($dataFile);

        if ($action === 'bulk_sync' && isset($payload['collections']) && is_array($payload['collections'])) {
            foreach ($payload['collections'] as $collName => $collData) {
                $allData[$collName] = $collData;
            }
            $saved = saveFileCollections($dataFile, $allData);
            if (!$saved) {
                respondJson(['success' => false, 'error' => 'Gagal menulis bulk_sync ke file storage.'], 500);
            }
            respondJson(['success' => true, 'driver' => 'file', 'message' => 'Bulk sync berhasil disimpan ke File Storage.']);
        }

        // ─── ACTION: HOLD SLOT (File Fallback) ─────────────────
        if ($action === 'hold_slot') {
            $eventId = isset($payload['eventId']) ? trim($payload['eventId']) : '';
            $holdId = isset($payload['holdId']) ? trim($payload['holdId']) : '';
            $email = isset($payload['email']) ? trim($payload['email']) : '';
            $fullName = isset($payload['fullName']) ? trim($payload['fullName']) : '';

            if (empty($eventId) || empty($holdId)) {
                respondJson(['success' => false, 'error' => 'Parameter eventId dan holdId wajib disertakan.'], 400);
            }

            $now = time();
            $holds = isset($allData['iympack_slot_holds']) && is_array($allData['iympack_slot_holds']) ? $allData['iympack_slot_holds'] : [];
            $holds = array_values(array_filter($holds, function ($h) use ($now) {
                return isset($h['expiresAt']) && (int)$h['expiresAt'] > $now;
            }));

            $eventsKey = isset($allData['iympack_events']) ? 'iympack_events' : (isset($allData['events']) ? 'events' : 'iympack_events');
            $events = isset($allData[$eventsKey]) && is_array($allData[$eventsKey]) ? $allData[$eventsKey] : [];

            $eventIndex = -1;
            foreach ($events as $idx => $ev) {
                if ((isset($ev['id']) && (string)$ev['id'] === (string)$eventId) || (isset($ev['slug']) && (string)$ev['slug'] === (string)$eventId)) {
                    $eventIndex = $idx;
                    break;
                }
            }

            if ($eventIndex === -1) {
                respondJson(['success' => false, 'error' => 'Kegiatan tidak ditemukan di database.'], 404);
            }

            $targetEvent = $events[$eventIndex];
            if (isset($targetEvent['status']) && $targetEvent['status'] === 'closed') {
                respondJson(['success' => false, 'error' => 'KUOTA_PENUH', 'message' => 'Pendaftaran untuk kegiatan ini sudah ditutup resmi.'], 409);
            }

            $maxQuota = isset($targetEvent['maxQuota']) ? (int)$targetEvent['maxQuota'] : 0;
            $currentCount = isset($targetEvent['currentApplicants']) ? (int)$targetEvent['currentApplicants'] : 0;

            $applicantsKey = isset($allData['iympack_applicants']) ? 'iympack_applicants' : (isset($allData['applicants']) ? 'applicants' : 'iympack_applicants');
            $applicants = isset($allData[$applicantsKey]) && is_array($allData[$applicantsKey]) ? $allData[$applicantsKey] : [];

            $actualEventId = (string)($targetEvent['id'] ?? $eventId);
            $actualSlug = (string)($targetEvent['slug'] ?? '');

            $realCount = 0;
            foreach ($applicants as $app) {
                if (isset($app['eventId']) && ((string)$app['eventId'] === $actualEventId || ($actualSlug && (string)$app['eventId'] === $actualSlug))) {
                    $realCount++;
                }
            }

            $otherActiveHolds = 0;
            $myExistingHold = null;
            foreach ($holds as $h) {
                $matchEv = isset($h['eventId']) && ((string)$h['eventId'] === $actualEventId || ($actualSlug && (string)$h['eventId'] === $actualSlug));
                if ($matchEv) {
                    if (isset($h['holdId']) && $h['holdId'] === $holdId) {
                        $myExistingHold = $h;
                    } else {
                        $otherActiveHolds++;
                    }
                }
            }

            $totalOccupied = max($currentCount, $realCount) + $otherActiveHolds;

            if ($maxQuota > 0 && $totalOccupied >= $maxQuota && $myExistingHold === null) {
                respondJson([
                    'success' => false,
                    'error' => 'SLOT_SEDANG_DITAHAN',
                    'message' => 'Sisa slot saat ini sedang diamankan oleh pendaftar lain yang sedang menyelesaikan pembayaran (batas waktu 15 menit). Silakan coba lagi dalam beberapa saat jika slot dilepaskan.'
                ], 409);
            }

            $expiresAt = $now + 900;
            $holds = array_values(array_filter($holds, function ($h) use ($holdId) {
                return isset($h['holdId']) && $h['holdId'] !== $holdId;
            }));

            $holds[] = [
                'holdId' => $holdId,
                'eventId' => $actualEventId,
                'email' => $email,
                'fullName' => $fullName,
                'createdAt' => $now,
                'expiresAt' => $expiresAt
            ];

            $allData['iympack_slot_holds'] = $holds;
            saveFileCollections($dataFile, $allData);

            respondJson([
                'success' => true,
                'holdId' => $holdId,
                'expiresAt' => $expiresAt,
                'durationSeconds' => 900,
                'message' => '1 slot berhasil diamankan untuk Anda selama 15 menit.'
            ]);
        }

        // ─── ACTION: RELEASE HOLD (File Fallback) ───────────────
        if ($action === 'release_hold') {
            $holdId = isset($payload['holdId']) ? trim($payload['holdId']) : '';
            if (!empty($holdId)) {
                $holds = isset($allData['iympack_slot_holds']) && is_array($allData['iympack_slot_holds']) ? $allData['iympack_slot_holds'] : [];
                if (is_array($holds)) {
                    $allData['iympack_slot_holds'] = array_values(array_filter($holds, function ($h) use ($holdId) {
                        return isset($h['holdId']) && $h['holdId'] !== $holdId;
                    }));
                    saveFileCollections($dataFile, $allData);
                }
            }
            respondJson(['success' => true]);
        }

        if ($action === 'register_applicant') {
            $eventId = isset($payload['eventId']) ? trim($payload['eventId']) : '';
            $applicant = isset($payload['applicant']) ? $payload['applicant'] : null;

            if (empty($eventId) || !is_array($applicant)) {
                respondJson(['success' => false, 'error' => 'Parameter eventId dan data pendaftar wajib disertakan.'], 400);
            }

            $eventsKey = isset($allData['iympack_events']) ? 'iympack_events' : (isset($allData['events']) ? 'events' : 'iympack_events');
            $events = isset($allData[$eventsKey]) && is_array($allData[$eventsKey]) ? $allData[$eventsKey] : [];

            $eventIndex = -1;
            foreach ($events as $idx => $ev) {
                if ((isset($ev['id']) && (string)$ev['id'] === (string)$eventId) || (isset($ev['slug']) && (string)$ev['slug'] === (string)$eventId)) {
                    $eventIndex = $idx;
                    break;
                }
            }

            if ($eventIndex === -1) {
                respondJson(['success' => false, 'error' => 'Kegiatan tidak ditemukan di database.'], 404);
            }

            $targetEvent = &$events[$eventIndex];
            if (isset($targetEvent['status']) && $targetEvent['status'] === 'closed') {
                respondJson([
                    'success' => false,
                    'error' => 'KUOTA_PENUH',
                    'message' => 'Pendaftaran untuk kegiatan ini sudah ditutup resmi.'
                ], 409);
            }

            $maxQuota = isset($targetEvent['maxQuota']) ? (int)$targetEvent['maxQuota'] : 0;
            $currentCount = isset($targetEvent['currentApplicants']) ? (int)$targetEvent['currentApplicants'] : 0;

            $applicantsKey = isset($allData['iympack_applicants']) ? 'iympack_applicants' : (isset($allData['applicants']) ? 'applicants' : 'iympack_applicants');
            $applicants = isset($allData[$applicantsKey]) && is_array($allData[$applicantsKey]) ? $allData[$applicantsKey] : [];

            $realCount = 0;
            $actualEventId = (string)($targetEvent['id'] ?? $eventId);
            $actualSlug = (string)($targetEvent['slug'] ?? '');
            foreach ($applicants as $app) {
                if (isset($app['eventId']) && ((string)$app['eventId'] === $actualEventId || ($actualSlug && (string)$app['eventId'] === $actualSlug))) {
                    $realCount++;
                }
            }

            $now = time();
            $holds = isset($allData['iympack_slot_holds']) && is_array($allData['iympack_slot_holds']) ? $allData['iympack_slot_holds'] : [];
            $holdId = isset($payload['holdId']) ? trim($payload['holdId']) : (isset($applicant['holdId']) ? trim($applicant['holdId']) : '');
            $myHoldFound = false;
            $otherActiveHolds = 0;
            foreach ($holds as $h) {
                if (isset($h['expiresAt']) && (int)$h['expiresAt'] > $now) {
                    $matchEv = isset($h['eventId']) && ((string)$h['eventId'] === $actualEventId || ($actualSlug && (string)$app['eventId'] === $actualSlug));
                    if ($matchEv) {
                        if (!empty($holdId) && isset($h['holdId']) && $h['holdId'] === $holdId) {
                            $myHoldFound = true;
                        } else {
                            $otherActiveHolds++;
                        }
                    }
                }
            }

            $effectiveCount = max($currentCount, $realCount) + ($myHoldFound ? 0 : $otherActiveHolds);

            if ($maxQuota > 0 && $effectiveCount >= $maxQuota && !$myHoldFound) {
                $targetEvent['currentApplicants'] = max($currentCount, $realCount);
                $allData[$eventsKey] = $events;
                saveFileCollections($dataFile, $allData);

                respondJson([
                    'success' => false,
                    'error' => 'KUOTA_PENUH',
                    'message' => 'KUOTA_PENUH: Kuota pendaftaran untuk kegiatan ini baru saja terpenuhi oleh pendaftar lain.'
                ], 409);
            }

            $applicants[] = $applicant;
            $targetEvent['currentApplicants'] = max($currentCount, $realCount) + 1;
            $allData[$applicantsKey] = $applicants;
            $allData[$eventsKey] = $events;

            if (!empty($holdId) || $myHoldFound) {
                $allData['iympack_slot_holds'] = array_values(array_filter($holds, function ($h) use ($holdId) {
                    return isset($h['holdId']) && $h['holdId'] !== $holdId;
                }));
            }

            $saved = saveFileCollections($dataFile, $allData);
            if (!$saved) {
                respondJson(['success' => false, 'error' => 'Gagal menulis pendaftaran ke file storage.'], 500);
            }

            respondJson([
                'success' => true,
                'driver' => 'file',
                'applicant' => $applicant,
                'updatedEvent' => $targetEvent,
                'remainingSlots' => $maxQuota > 0 ? max(0, $maxQuota - ($effectiveCount + 1)) : 999
            ]);
        }

        if ($action === 'append') {
            $key = isset($payload['key']) ? trim($payload['key']) : '';
            $item = isset($payload['item']) ? $payload['item'] : null;

            if (empty($key) || $item === null) {
                respondJson(['success' => false, 'error' => 'Parameter key dan item wajib disertakan.'], 400);
            }

            if (!isset($allData[$key]) || !is_array($allData[$key])) {
                $allData[$key] = [];
            }
            $allData[$key][] = $item;
            $saved = saveFileCollections($dataFile, $allData);
            if (!$saved) {
                respondJson(['success' => false, 'error' => 'Gagal menulis append ke file storage.'], 500);
            }
            respondJson(['success' => true, 'driver' => 'file', 'item' => $item]);
        }

        // Save single
        $key = isset($payload['key']) ? trim($payload['key']) : '';
        $data = isset($payload['data']) ? $payload['data'] : null;

        if (empty($key)) {
            respondJson(['success' => false, 'error' => 'Parameter key wajib diisi.'], 400);
        }

        $allData[$key] = $data;
        $saved = saveFileCollections($dataFile, $allData);
        if (!$saved) {
            respondJson(['success' => false, 'error' => 'Gagal menulis ke api/data/collections.json. Periksa permission folder.'], 500);
        }
        respondJson(['success' => true, 'driver' => 'file', 'key' => $key]);
    }
}

respondJson(['success' => false, 'error' => 'Method not allowed.'], 405);
