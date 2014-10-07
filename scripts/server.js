#!/usr/bin/env node
require('./livereload')

require('http').createServer(require('ecstatic')({ root: __dirname + '/../public' })).listen(process.env.PORT || 3000, '0.0.0.0', function(err) {
	if(err) {
		throw err
	} else {
		const addr = this.address()
		console.log('Listening on http://%s:%d', addr.address, addr.port)
	}
})