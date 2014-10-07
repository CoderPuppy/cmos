#!/usr/bin/env node
const chokidar = require('chokidar')
const http     = require('http')
const path     = require('path')
const ws       = require('ws')
const fs       = require('fs')

const server = http.createServer(function(req, res) {
	if(/^\/livereload.js/.test(req.url)) {
		// console.log('Sending client javascript')
		res.writeHead(200, { 'Content-Type': 'application/javascript' })
		fs.createReadStream(__dirname + '/client.js').pipe(res)
	} else {
		res.writeHead(404, { 'Content-Type': 'text/plain' })
		console.warn('404 Not Found: %s', req.url)
		res.end('404 Not Found: ' + req.url)
	}
})
const wss = new ws.Server({ server: server })
wss.on('connection', function(conn) {
	console.log('Browser connected')
	conn.send(JSON.stringify({
		command: 'hello',
		protocols: [ 'http://livereload.com/protocols/official-7' ],
		serverName: 'CoderPuppy Custom LiveReload Server'
	}))
	conn.on('message', function(msg) {
		msg = JSON.parse(msg)
		const cmd = msg.command
		delete msg.command
		switch(cmd) {
		case 'hello':
		case 'info':
			break

		default:
			console.warn('unknown command: %s(%j)', cmd, msg)
		}
	})
})
server.listen(35729, '0.0.0.0', function(err) {
	if(err) {
		throw err
	} else {
		const addr = this.address()
		console.log('CCLS Listening on http://%s:%d', addr.address, addr.port)
	}
})
const m = chokidar.watch(path.normalize(__dirname + '/../../public'), {
	ignoreInitial: true
})

function reload(path) {
	console.log('%s was changed', path)
	if(reload.timeout !== undefined) clearTimeout(reload.timeout)
	reload.timeout = setTimeout(function() {
		console.log('Reloading')
		for(var i in wss.clients) {
			wss.clients[i].send(JSON.stringify({
				command: 'reload',
				path: path,
				liveCSS: false
			}))
		}
		delete reload.timeout
	}, 100)
}
m.on(      'add', reload)
m.on(   'addDir', reload)
m.on(   'change', reload)
m.on(   'unlink', reload)
m.on('unlinkDir', reload)