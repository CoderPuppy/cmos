#!/usr/bin/env node
const chokidar = require('chokidar').watch
// const es6ify   = require('es6ify')
const path     = require('path')
const fs       = require('fs')

const browserify = require('browserify')
const watchify   = require('watchify')
const stylus     = require('stylus')
const jade       = require('jade')

const compile = {
	jade: function(name, cb) {
		console.log('Compiling %s.jade', name)
		fs.readFile(__dirname + '/' + name + '.jade', function(err, data) {
			if(err) return cb(err)

			try {
				const fn = jade.compile(data.toString('utf-8'), {
					filename: __dirname + '/' + name + '.jade',
					compileDebug: true,
					pretty: true
				})
				const out = fn({})
				fs.writeFile(__dirname + '/out/' + name + '.html', out, cb)
			} catch(e) {
				console.error(e.stack)
			}
		})
	},

	stylus: function(name, cb) {
		console.log('Compiling %s.styl', name)
		fs.readFile(__dirname + '/' + name + '.styl', function(err, data) {
			if(err) return cb(err)

			stylus(data.toString('utf-8'))
				.set('filename', __dirname + '/' + name + '.styl')
				.render(function(err, out) {
					if(err)
						console.error(err.stack)
					else
						fs.writeFile(__dirname + '/out/' + name + '.css', out, cb)
				})
		})
	}
}

chokidar(__dirname + '/..', {
	ignored: /lock\/out|public|node_modules/,
	persistent: true
}).on('all', function(type, file) {
	// console.log(type, file)
	if(/\.jade$/.test(file)) {
		compile.jade('index', function(err) { if(err) console.error(err.stack) })
	} else if(/\.styl$/.test(file)) {
		compile.stylus('index', function(err) { if(err) console.error(err.stack) })
	}
})

;(function buildBrowserify() {
	// es6ify.traceurOverrides = { blockBinding: true }

	const w = watchify(browserify({
		cache: {},
		pkgcache: {},
		packageCache: {},
		fullPaths: true
	})).add(require.resolve('./index.js'))
	   .transform(require('jadeify'))
	/*.add(es6ify.runtime)
	  .transform(es6ify)*/

	function bundle() {
		console.log('Compiling index.js')
		const wb = w.bundle({
			debug: true,
			insertGlobals: true,
			detectGlobals: false
		})
		var errored = false
		wb.on('error', function(err) {
			errored = true
			console.error(err.stack)
		})
		wb.pipe(fs.createWriteStream(__dirname + '/out/index.js'))
		// wb.on('end', function() {
		// 	if(errored) return
		// 	fs.createReadStream(__dirname + '/out/.index.js').pipe(fs.createWriteStream(__dirname + '/out/index.js')).on('end', function() {
		// 		fs.delete(__dirname + '/out/.index.js', function(err) {
		// 			if(err) console.error(err)
		// 		})
		// 	})
		// 	// fs.rename(__dirname + '/out/.index.js', __dirname + '/out/index.js', function(err) {
		// 	// 	if(err) throw err
		// 	// })
		// })
	}

	w.on('update', bundle)
	w.on('error', function(err) {
		console.error(err.stack)
		w.removeListener('update', bundle)
		setTimeout(buildBrowserify, 500)
	})
	bundle()

	return w
})()