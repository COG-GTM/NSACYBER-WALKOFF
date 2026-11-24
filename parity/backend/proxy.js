// usage: node proxy.js <listen-port> <api-port>
// Puts the API and the standalone Socket.IO server (:3000) behind one origin, like the nginx
// gateway does in the docker-compose deployment.
const http = require('http'); const httpProxy = require('http-proxy');
const [listen, api] = process.argv.slice(2).map(Number);
const proxy = httpProxy.createProxyServer({ ws: true });
proxy.on('error', (e, req, res) => { try { res.writeHead(502); res.end(); } catch (_) {} });
const target = u => u.startsWith('/walkoff/sockets') ? 'http://localhost:3000' : `http://localhost:${api}`;
const srv = http.createServer((req, res) => proxy.web(req, res, { target: target(req.url) }));
srv.on('upgrade', (req, sock, head) => proxy.ws(req, sock, head, { target: target(req.url) }));
srv.listen(listen, '127.0.0.1', () => console.log(`proxy :${listen} -> api :${api} + socketio :3000`));
