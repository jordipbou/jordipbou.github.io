// TODO: How to ensure rxjs is imported? Should it just be loaded before?

(function() {
	'use strict'

	const RxMidi = {
		midiAccess: {},
		init: n => {
			navigator
				.requestMIDIAccess()
				.then(m => {
					RxMidi.midiAccess = m
					for (let [k, v] of RxMidi.midiAccess.inputs) {
						v.subject = new rxjs.Subject()	
						v.onmidimessage = d => v.subject.next(d.data)
					}
				})
		},
		logPorts: () => {
			console.log('--- Input ports ---')
			for (let [k, v] of RxMidi.midiAccess.inputs) console.log(v.name)
			console.log('--- Output ports ---')
			for (let [k, v] of RxMidi.midiAccess.outputs) console.log(v.name)
		},
		inputByName: n => {
			for (let [k, v] of RxMidi.midiAccess.inputs) {
				if (v.name.includes(n)) {
					return v
				}
			}
		},
		outputByName: n => {
			for (let [k, v] of RxMidi.midiAccess.outputs) {
				if (v.name.includes(n)) {
					return v
				}
			}
		},
		openOutputByName: n => {
			let o = RxMidi.outputByName(n)
			if (o !== undefined) o.open()
			return o
		}
	}

	let _global = 
		typeof window === 'object' && window.self === window && window ||
		typeof self === 'object' && self.self === self && self ||
		typeof global === 'object' && global.global === global && global

	_global.RxMidi = RxMidi
})();
