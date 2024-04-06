const http = require('http');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const LOG_FILE = path.join(__dirname, 'access.log');

// Ensure the uploads directory exists
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const server = http.createServer((req, res) => {
    // Log request info
    logRequest(req);

    // Parse request URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const query = url.searchParams;

    // Route requests based on pathname
    switch (pathname) {
        case '/createFile':
            handleCreateFile(req, res, query);
            break;
        case '/getFiles':
            handleGetFiles(req, res);
            break;
        case '/getFile':
            handleGetFile(req, res, query);
            break;
        case '/modifyFile':
            handleModifyFile(req, res, query);
            break;
        case '/deleteFile':
            handleDeleteFile(req, res, query);
            break;
        default:
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
    }
});

const PORT = 8080;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

function logRequest(req) {
    const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
    fs.appendFile(LOG_FILE, logEntry, err => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
}

function handleCreateFile(req, res, query) {
    const filename = query.get('filename');
    const content = query.get('content');

    if (!filename || !content) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Filename and content are required');
        return;
    }

    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFile(filePath, content, err => {
        if (err) {
            console.error('Error writing file:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('File created successfully');
    });
}

function handleGetFiles(req, res) {
    fs.readdir(UPLOADS_DIR, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(files));
    });
}

function handleGetFile(req, res, query) {
    const filename = query.get('filename');

    if (!filename) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Filename is required');
        return;
    }

    const filePath = path.join(UPLOADS_DIR, filename);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(data);
    });
}

function handleModifyFile(req, res, query) {
    const filename = query.get('filename');
    const content = query.get('content');

    if (!filename || !content) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Filename and content are required');
        return;
    }

    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFile(filePath, content, err => {
        if (err) {
            console.error('Error writing file:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('File modified successfully');
    });
}

function handleDeleteFile(req, res, query) {
    const filename = query.get('filename');

    if (!filename) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Filename is required');
        return;
    }

    const filePath = path.join(UPLOADS_DIR, filename);
    fs.unlink(filePath, err => {
        if (err) {
            console.error('Error deleting file:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('File deleted successfully');
    });
}
