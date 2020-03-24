(function() {
	'use strict'

	const LinnStrumentJS = {
	}

	let _global = 
		typeof window === 'object' && window.self === window && window ||
		typeof self === 'object' && self.self === self && self ||
		typeof global === 'object' && global.global === global && global

	_global.LinnStrumentJS = LinnStrumentJS
})();
