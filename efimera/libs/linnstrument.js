(function() {
	'use strict'

	const { controller } = RxMidi;

	const LinnStrumentJS = {
		linnColors: {
			off: 0,
			red: 1,
			yellow: 2,
			green: 3,
			cyan: 4,
			blue: 5,
			magenta: 6,
			black: 7,
			white: 8,
			orange: 9,
			lime: 10,
			pink: 11
		},
		userModeOn: () => nrpn(245, 1),
		userModeOff: () => nrpn(245, 0),
		xSlideOn: r => cc(9, 1, r),
		xSlideOff: r => cc(9, 0, r),
		xDataOn: r => cc(10, 1, r),
		xDataOff: r => cc(10, 0, r),
		yDataOn: r => cc(11, 1, r),
		yDataOff: r => cc(11, 0, r),
		zDataOn: r => cc(12, 1, r),
		zDataOff: r => cc(12, 0, r),
		dataDecimation: t => cc(13, t),
		setCellColor: (x, y, c) => [...cc(20, x), ...cc(21, y), ...cc(22, c)],
		// Utilities
		clear: (c = LinnStrumentJS.linnColors.off) => {
			let r = []
			for (let i = 0; i <= 16; i++) {
				for (let j = 0; j < 8; j++) {
					r = r.concat(setCellColor(i, j, c))
				}
			}

			return r
		},
		// TODO: Add utilities for working with zones (rectangles)
		// like filtering, drawing, drawbars, etc.
	}

	let _global = 
		typeof window === 'object' && window.self === window && window ||
		typeof self === 'object' && self.self === self && self ||
		typeof global === 'object' && global.global === global && global

	_global.LinnStrumentJS = LinnStrumentJS
})();
