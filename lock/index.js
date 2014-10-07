const dateformat = require('dateformat')
const $          = require('../common/dom')

console.log('loading')
$.ready(function() {
	console.log('domready')

	time()
	require('../common/patternlock')(3).appendTo(document.body)
})

function time() {
	const time = $('#time')
	const date = $('#date')
	setTimeout(function update() {
		time.text = dateformat('H:MM')
		// time.text = '21:42'
		// time.text = '9:42'
		date.text = dateformat('ddd, mmm d')
		setTimeout(update, 100)
	}, 0)
}

function lock() {
	
}