<?php
// api.php - Ultra simple API with maximum CORS compatibility

// Set all CORS headers first thing
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    exit(0);
}

header('Content-Type: application/json; charset=utf-8');

// Database connection
$host = 'localhost';
$dbname = 'u664777408_leave_api';
$username = 'u664777408_leave_api';
$password = 't3vWbKQ9Z!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Get the request method and URL
$method = $_SERVER['REQUEST_METHOD'];
$request = $_SERVER['REQUEST_URI'];

// Remove query string and get path
$path = parse_url($request, PHP_URL_PATH);
$path = str_replace('/api.php', '', $path);
$segments = explode('/', trim($path, '/'));

// Route the request
if (empty($segments[0])) {
    // Root endpoint - test if API is working
    echo json_encode([
        'status' => 'API is working',
        'method' => $method,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

switch ($segments[0]) {
    case 'login':
        handleLogin($pdo, $method);
        break;
    case 'events':
        handleEvents($pdo, $method, $segments);
        break;
    case 'claim-events':
        handleClaimEvents($pdo, $method);
        break;
    case 'leave-balance':
        handleLeaveBalance($pdo, $method);
        break;
    case 'clear-data':
        handleClearData($pdo, $method);
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
}

function handleLogin($pdo, $method) {
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data || !isset($data['email']) || !isset($data['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and name are required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT id, email, name FROM users WHERE email = ? AND name = ?");
        $stmt->execute([$data['email'], $data['name']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            echo json_encode([
                'success' => true,
                'user_id' => (int)$user['id'],
                'email' => $user['email'],
                'name' => $user['name']
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'User not found']);
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Login failed']);
    }
}

function handleEvents($pdo, $method, $segments) {
    switch ($method) {
        case 'GET':
            if (isset($_GET['user_id'])) {
                getUserEvents($pdo, $_GET['user_id']);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'User ID required']);
            }
            break;
        case 'POST':
            createEvent($pdo);
            break;
        case 'PUT':
            if (isset($segments[1])) {
                updateEvent($pdo, $segments[1]);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Event ID required']);
            }
            break;
        case 'DELETE':
            if (isset($segments[1])) {
                deleteEvent($pdo, $segments[1]);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Event ID required']);
            }
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

function getUserEvents($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM events WHERE user_id = ? ORDER BY event_date DESC");
        $stmt->execute([$userId]);
        $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($events);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to get events']);
    }
}

function createEvent($pdo) {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid data']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("INSERT INTO events (user_id, event_date, title, description, type, leave_type, consumed_leave_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['user_id'],
            $data['event_date'],
            $data['title'],
            $data['description'] ?? null,
            $data['type'] ?? 'note',
            $data['leave_type'] ?? null,
            $data['consumed_leave_id'] ?? null
        ]);
        
        echo json_encode(['success' => true, 'event_id' => $pdo->lastInsertId()]);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create event']);
    }
}

function updateEvent($pdo, $eventId) {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    try {
        $stmt = $pdo->prepare("UPDATE events SET title = ?, description = ?, type = ?, leave_type = ?, consumed_leave_id = ? WHERE id = ?");
        $stmt->execute([
            $data['title'] ?? '',
            $data['description'] ?? null,
            $data['type'] ?? 'note',
            $data['leave_type'] ?? null,
            $data['consumed_leave_id'] ?? null,
            $eventId
        ]);
        echo json_encode(['success' => true]);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update event']);
    }
}

function deleteEvent($pdo, $eventId) {
    try {
        $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
        $stmt->execute([$eventId]);
        echo json_encode(['success' => true]);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete event']);
    }
}

function handleLeaveBalance($pdo, $method) {
    switch ($method) {
        case 'GET':
            if (isset($_GET['user_id'])) {
                getLeaveBalance($pdo, $_GET['user_id']);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'User ID required']);
            }
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

function getLeaveBalance($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM leave_balance WHERE user_id = ?");
        $stmt->execute([$userId]);
        $balance = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($balance) {
            echo json_encode($balance);
        } else {
            echo json_encode(['user_id' => $userId, 'casual_leave' => 12, 'extra_days' => 0]);
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to get leave balance']);
    }
}

function handleClearData($pdo, $method) {
    if ($method !== 'DELETE') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['user_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID is required']);
        return;
    }

    $userId = $data['user_id'];

    try {
        $pdo->beginTransaction();

        // Delete all events for the user
        $stmt = $pdo->prepare("DELETE FROM events WHERE user_id = ?");
        $stmt->execute([$userId]);

        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'All user data cleared.']);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to clear user data: ' . $e->getMessage()]);
    }
}

function handleClaimEvents($pdo, $method) {
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['event_ids']) || !is_array($data['event_ids'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Event IDs are required']);
        return;
    }

    $eventIds = $data['event_ids'];
    if (empty($eventIds)) {
        echo json_encode(['success' => true, 'message' => 'No events to claim.']);
        return;
    }

    try {
        $placeholders = implode(',', array_fill(0, count($eventIds), '?'));
        $stmt = $pdo->prepare("UPDATE events SET is_month_claim = 1 WHERE id IN ($placeholders) AND type = 'extraDay'");
        $stmt->execute($eventIds);
        
        echo json_encode(['success' => true, 'affected_rows' => $stmt->rowCount()]);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to claim events: ' . $e->getMessage()]);
    }
}

?>