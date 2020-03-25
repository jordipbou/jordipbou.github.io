// TODO: How to ensure rxjs is imported? Should it just be loaded before?

// MIDI Events coming from MIDI parser or from Web Midi will have a data field
// that mimics real MIDI communication (MIDI parser has to be postprocessed to have this).

// MIDI Event = {
//		timeStamp: ms/us,
//		deltaTime: ticks?,
//		data: [status, data1, data2]	// or other options, could be streamed
// }

// Time in MIDI
// Realtime input event -> timeStamp --> equivalent to performance.now() ms/5us accurate, from beginning of document
// MIDI File event -> deltaTime -->

// Sequences:
// - a sequence is an ordered collection of MIDI events
// - the order is given by a deltaTime? 

// For MIDI file structure we will use MIDI Parse structure:
// MIDI File {
//		formatType: number,
//		tracks: number,
//		track: [
//			{ event: [] }
//		],
//		timeDivison: number		

(function() {
	'use strict'

	const { Subject, pipe } = rxjs;
	const { filter, map, mergeMap } = rxjs.operators;

	const RxMidi = {
		midiAccess: {},
		// == Initialization ==============================
		init: n => {
			navigator
				.requestMIDIAccess()
				.then(m => {
					RxMidi.midiAccess = m
					for (let [k, v] of m.inputs) {
						v.subject = new Subject()	
						v.onmidimessage = 
							d => v.subject.next(d)
					}
				})
		},
		// == Inputs and outputs ==========================
		logPorts: () => {
			console.log('--- Input ports ---')
			for (let [k, v] of RxMidi.midiAccess.inputs) 
				console.log(v.name)
			console.log('--- Output ports ---')
			for (let [k, v] of RxMidi.midiAccess.outputs) 
				console.log(v.name)
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
		},
		// == MIDI Message Helpers
		// ---- Channel Voice Messages
		isNoteOn: 
			d => d.data[0] >> 4 === 9,
		isNoteOff: 
			d => d.data[0] >> 4 === 8,
		isNote: 
			d => RxMidi.isNoteOn(d) || 
					RxMidi.isNoteOff(d),
		isPolyPressure: 
			d => d.data[0] >> 4 === 10,
		hasNote: 
			d => RxMidi.isNote(d) || 
					RxMidi.isPolyPressure(d),
		isControlChange: 
			d => d.data[0] >> 4 === 11,
		isProgramChange: 
			d => d.data[0] >> 4 === 12,
		isChannelPressure: 
			d => d.data[0] >> 4 === 13,
		isPitchBend: 
			d => d.data[0] >> 4 === 14,
		// ---- Channel Mode Messages
		isAllSoundOff: 
			d => RxMidi.isControlChange(d) && 
					d.data[1] === 120 && 
					d.data[2] === 0,
		isResetAll: 
			d => RxMidi.isControlChange(d) && 
					d.data[1] === 121,
		isLocalControlOff: 
			d => RxMidi.isControlChange(d) && 
					d.data[1] === 122 && 
					d.data[2] === 0,
		isLocalControlOn: 
			d => RxMidi.isControlChange(d) && 
					d.data[1] === 122 && 
					d.data[2] === 127,
		isAllNotesOff: 
			d => RxMidi.isControlChange(d) && 
					d.data[1] === 123 && 
					d.data[2] === 0,
		isOmniModeOff: 
			d => RxMidi.isControlChange(d) && 
					d.data[1] === 124 && 
					d.data[2] === 0,
		isOmniModeOn: 
			d => RxMidi.isControlChange(d) && 
					d.data[1] === 125 &&	
					d.data[2] === 0,
		isMonoModeOn: 
			d => RxMidi.isControlChange(d) && 
					d.data[1] === 126,
		isPolyModeOn: 
			d => RxMidi.isControlChange(d) && 
					d.data[1] === 127 && 
					d.data[2] === 0,
		isChannelMode: 
			d => RxMidi.isAllSoundOff(d) ||
					RxMidi.isResetAll(d) ||
					RxMidi.isLocalControlOff(d) ||
					RxMidi.isLocalControlOn(d) ||
					RxMidi.isAllNotesOff(d) ||
					RxMidi.isOmniModeOff(d) ||
					RxMidi.isOmniModeOn(d) ||
					RxMidi.isMonoModeOn(d) ||
					RxMidi.isPolyModeOn(d),
		isChannelVoice: 
			d => RxMidi.isNote(d) ||
					RxMidi.isPolyPressure(d) ||
					(RxMidi.isControlChange(d) && 
						!RxMidi.isChannelMode(d)) ||
					RxMidi.isProgramChange(d) ||
					RxMidi.isChannelPressure(d) ||
					RxMidi.isPitchBend(d),
		isChannelMessage: 
			d => RxMidi.isChannelMode(d) || 
					RxMidi.isChannelVoice(d),
		// TODO: System Common Messages and System Real-Time Messages
		// == MIDI Message Utilities
		// ---- Filtering
		filterNoteOn: 
			() => pipe(filter(RxMidi.isNoteOn)),
		filterNoteOff: 
			() => pipe(filter(RxMidi.isNoteOff)),
		filterNote: 
			() => pipe(filter(RxMidi.isNote)),
		filterPolyPressure: 
			() => pipe(filter(RxMidi.isPolyPressure)),
		filterControlChange: 
			() => pipe(filter(RxMidi.isControlChange)),
		filterProgramChange: 
			() => pipe(filter(RxMidi.isProgramChange)),
		filterChannelPressure: 
			() => pipe(filter(RxMidi.isChannelPressure)),
		filterPitchBend: 
			() => pipe(filter(RxMidi.isPitchBend)),
		filterChannelMode: 
			() => pipe(filter(RxMidi.isChannelMode)),
		filterChannelVoice: 
			() => pipe(filter(RxMidi.isChannelVoice)),
		filterChannelMessage: 
			() => pipe(filter(RxMidi.isChannelMessage)),
		// ---- Channel transformation
		forceChannel: ch => pipe(map(d => { 
			if (RxMidi.isChannelMessage(d)) d.data[0] = (d.data[0] & 0xF0) + ch;
			return d; })),
		mapChannel: (chin, chout) => pipe(map(d => {
			if (RxMidi.isChannelMessage(d) && (d.data[0] & 0xF) === chin) d.data[0] = (d.data[0] & 0xF0) + chout;
			return d; })),
		mapChannels: (chsin, chsout) => pipe(mergeMap(d => {
			if (RxMidi.isChannelMessage(d) && chsin.includes(d.data[0] & 0xF)) {
				let m = []
				for (let ch of chsout) {
					let t = {
						deltaTime: d.deltaTime,
						timeStamp: d.timeStamp,
						data: [...d.data]
					}
					t.data[0] = (t.data[0] & 0xF0) + ch
					m = m.concat(t)
				}

				return m
			} else {
				return rxjs.from([d])
			}})),
		// ---- Controller mapping
		mapController: (ccin, ccout) => pipe(map(d => {
			if (RxMidi.isControlChange(d) && d.data[1] === ccin) d.data[1] = ccout;
			return d; })),
		// ---- Note mapping
		transpose: i => pipe(map(d => { 
			if (RxMidi.hasNote(d)) d.data[1] = d.data[1] + i;
			return d; })),
		// ---- MIDI Message creation
		noteOn: o => {
			if (typeof o === object) {
				let msg = { ch: 0, note: 60, vel: 96 }
				return [144 + msg.ch, msg.note, msg.vel]
			} else {
				return [144, o, 96]
			}
		},
		noteOff: o => {
			if (typeof o === object) {
				let msg = {ch: 0, note: 60, vel: 96 }
				return [128 + msg.ch, msg.note, msg.vel]
			} else {
				return [128, o, 96]
			}
		},
		controller: (cn, val, ch = 0) => {
			return [176 + ch, cn, val]
		},
		nrpn: (n, v, ch = 0) => {
			return [
				176 + ch, 99, Math.floor(n / 128), 
				176 + ch, 98, n % 128, 
				176 + ch, 6, Math.floor(v / 128), 
				176 + ch, 38, v % 128, 
				176 + ch, 101, 127,
				176 + ch, 100, 127 ];
		}
	}

	let _global = 
		typeof window === 'object' && window.self === window && window ||
		typeof self === 'object' && self.self === self && self ||
		typeof global === 'object' && global.global === global && global

	_global.RxMidi = RxMidi
})();
