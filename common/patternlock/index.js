const domify = require('domify')
const sha512 = require('js-sha512')
const $      = require('../dom')

const tmpl = require('./index.jade')

module.exports = function(size) {
	const el = $.wrap(domify(tmpl({ size: size })))
	const comp = {}
	$.comp(comp, el)

	var code
	var down

	function add(point) {
		if(point.classes.contains('selected')) return
		const cell = point.parent
		point.classes.add('selected')
		if(cell.data.row === undefined || cell.data.col === undefined) debugger
		code.push(cell.data.col + ' ' + cell.data.row)
	}

	function done() {
		if(!down) return
		el.findAll('.point.selected').forEach(function(point) {
			point.classes.remove('selected')
		})
		console.log(code)
		console.log(code = code.join('|'))
		// TODO: customizable hash
		console.log(code = sha512(code))
		down = false
		code = undefined
	}

	// el.on('mousedown', '.point', function(e) {
	// 	const target = $.wrap(e.target)
	// 	down = true
	// 	code = []
	// 	add(target)
	// }).on('mouseover', '.point', function() {
	// 	if(down)
	// 		add($.wrap(this))
	// }).on('mouseup', done)

	el
		.on('touchstart', '.point', function(e) {
			const target = $.wrap(e.target)
			down = true
			code = []
			add(target)
		})
		.on('touchmove', function(e) {
			const touch = [].filter.call(e.changedTouches, function(touch) {
				return $.wrap(touch.target).classes.contains('point')
			})[0]
			if(touch) {
				const point = $.wrap(document.elementFromPoint(touch.clientX, touch.clientY))
				if(point && point.classes.contains('point'))
					add(point)
			}
		})
		.on('touchend', done)
		.on('touchleave', done)
		.on('touchcancel', function() {
			down = false
			code = undefined
		})

	return comp
}