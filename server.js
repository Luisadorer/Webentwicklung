const http = require('http');
const mongodb = require('mongodb');

const hostname = '127.0.0.1';
const port = 3000;
const url = 'mongodb://127.0.0.1:27017';

const mongoClient = new mongodb.MongoClient(url);
const ObjectId = mongodb.ObjectId;

const server = http.createServer(async (request, response) => {

    console.log('REQUEST:', request.method, request.url);

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Preflight (CORS)
    if (request.method === 'OPTIONS') {
        response.writeHead(204);
        response.end();
        return;
    }

    const commentcollection =
        mongoClient.db('Reiseblog').collection('comments');

    // 🔹 GET
    if (request.method === 'GET') {
        response.setHeader('Content-Type', 'application/json');

        const urlObj = new URL(request.url, `http://${hostname}:${port}`);
        const ort = urlObj.searchParams.get('ort');

        const filter = ort ? { ort: ort } : {};
        const result = await commentcollection.find(filter).toArray();

        response.end(JSON.stringify(result));
    }

    // 🔹 POST
    if (request.method === 'POST') {
        let body = '';
        request.on('data', chunk => body += chunk);
        request.on('end', async () => {
            console.log('POST BODY:', body);
            const comment = JSON.parse(body);
            await commentcollection.insertOne(comment);
            response.end(JSON.stringify({ status: 'ok' }));
        });
    }

    // 🔹 DELETE
    if (request.method === 'DELETE') {
        let body = '';
        request.on('data', chunk => body += chunk);
        request.on('end', async () => {
            const { id } = JSON.parse(body);
            await commentcollection.deleteOne({ _id: new ObjectId(id) });
            response.end(JSON.stringify({ status: 'deleted' }));
        });
    }
});

async function startServer() {
    await mongoClient.connect();
    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
}

startServer();
