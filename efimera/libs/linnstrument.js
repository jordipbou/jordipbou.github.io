(function() {
	'use strict'

	const { Subject, pipe } = rxjs;
	const { filter, map, mergeMap } = rxjs.operators;

	const LinnStrumentJS = {
		activateUserMode: () => {
		},
	}

	let _global = 
		typeof window === 'object' && window.self === window && window ||
		typeof self === 'object' && self.self === self && self ||
		typeof global === 'object' && global.global === global && global

	_global.LinnStrumentJS = LinnStrumentJS
})();
