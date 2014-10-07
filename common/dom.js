const qwery = require('qwery')
const bean  = require('bean')

function normalizeRoot(root) {
	if(!root) return document
	if(typeof(root) == 'string') return $(root)
	return root
}

function $(selector, root) {
	// root = normalizeRoot(root)
	return wrapNode(qwery(selector, root)[0])
}

$.all = function $$(selector, root) {
	// root = normalizeRoot(root)
	return qwery(selector, root).map(function(node) {
		return wrapNode(node)
	})
}

bean.setSelectorEngine($.all)

$.wrap = function(node) {
	if(!node) return null
	
	if(typeof(node.length) == 'number') {
		return [].slice.call(node).map(function(node) {
			return wrapNode(node)
		})
	} else {
		return wrapNode(node)
	}
}

function wrapNode(node) {
	if(!node) return null

	Object.defineProperty(node, 'text', {
		get: function() { return this.textContent },
		set: function(newVal) { this.textContent = newVal },
		configurable: true,
		enumerable: true
	})

	Object.defineProperty(node, 'html', {
		get: function() { return this.innerHTML },
		set: function(newVal) { this.innerHTML = newVal },
		configurable: true,
		enumerable: true
	})

	Object.defineProperty(node, 'classes', {
		get: function() { return this.classList },
		configurable: true,
		enumerable: true
	})

	Object.defineProperty(node, 'data', {
		get: function() { return this.dataset },
		configurable: true,
		enumerable: true
	})

	Object.defineProperty(node, 'parent', {
		get: function() { return $.wrap(this.parentElement) },
		configurable: true,
		enumerable: true
	})

	node.find = function(sel) {
		return $(sel, node)
	}
	node.findAll = function(sel) {
		return $.all(sel, node)
	}

	node.attr = function(name, val) {
		if(val === undefined) {
			return node.getAttribute(name)
		} else {
			node.setAttribute(name, val)
			return this
		}
	}

	node.on = function() {
		bean.on.apply(bean, [node].concat([].slice.call(arguments)))
		return node
	}
	node.once = function() {
		bean.one.apply(bean, [node].concat([].slice.call(arguments)))
		return node
	}
	node.off = function() {
		bean.off.apply(bean, [node].concat([].slice.call(arguments)))
		return node
	}
	node.fire = function() {
		bean.fire.apply(bean, [node].concat([].slice.call(arguments)))
		return node
	}
	node.cloneFrom = function() {
		bean.clone.apply(bean, [node].concat([].slice.call(arguments)))
		return node
	}

	node.appendTo = function(el) {
		el.appendChild(node)
		return node
	}
	node.remove = function() {
		if(!node.parent) return node
		node.parent.removeChild(node)
		return node
	}
	node.addAfter = function(el) {
		el.parentNode.insertBefore(node, el.nextSibling)
		return node
	}
	node.addBefore = function(el) {
		el.parentNode.insertBefore(node, el)
		return node
	}

	return node
}

$.ready = require('domready')

$.comp = function(comp, el) {
	comp.el = el
	comp.appendTo = el.appendTo, comp.addAfter = el.addAfter, comp.addBefore = el.addBefore
	comp.on = el.on, comp.once = el.once, comp.off = el.off//, comp.fire = el.fire//, comp.cloneFrom = el.cloneFrom
	return comp
}

module.exports = $