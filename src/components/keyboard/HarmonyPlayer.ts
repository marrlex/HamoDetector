import { getFreqByMidiNoteNumber } from './harmony'

window.AudioContext = window.AudioContext || window.webkitAudioContext
const noteNames = ['A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab'] as const
export type NoteName = typeof noteNames[number]

export class HarmonyPlayer {
  audioCtx: AudioContext
  masterGain: GainNode
  comp: DynamicsCompressorNode
  playingAudioNodes: Map<number, {osc: OscillatorNode; gain: GainNode}>
  _attackTimeConst: number
  _releaseTimeConst: number
  _isMajor: boolean
  _stdFreq: number
  _wavetype: OscillatorType
  _musicalKey: NoteName

  constructor ({
    attackTimeConst,
    releaseTimeConst,
    isMajor,
    stdFreq,
    musicalKey,
    wavetype
  } : {
    attackTimeConst: number,
    releaseTimeConst: number,
    isMajor: boolean,
    stdFreq: number,
    musicalKey: NoteName,
    wavetype: OscillatorType
  }) {
    this.audioCtx = new AudioContext()
    this.masterGain = this.audioCtx.createGain()
    this.masterGain.gain.value = 0.1
    this.masterGain.connect(this.audioCtx.destination)
    this.comp = this.audioCtx.createDynamicsCompressor()
    this.comp.attack.value = 0;
    this.comp.release.value = 0;
    this.comp.connect(this.masterGain)
  
    this._attackTimeConst = attackTimeConst
    this._releaseTimeConst = releaseTimeConst
    this._isMajor = isMajor
    this._stdFreq = stdFreq
    this._wavetype = wavetype
    this._musicalKey = musicalKey
    this.playingAudioNodes = new Map()
  }

  play (midiNoteNumber: number) {
    const ac = this.audioCtx
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    // const ana = this.audioCtx.createAnalyser();
    this.playingAudioNodes.has(midiNoteNumber) || this.playingAudioNodes.set(midiNoteNumber, {osc, gain})
    const freq = getFreqByMidiNoteNumber({
      midiNoteNumber,
      isMajor: this._isMajor,
      scaleKeyNumber: noteNames.indexOf(this._musicalKey),
      stdFreq: this._stdFreq
    })
    osc.frequency.value = freq
    osc.type = this._wavetype
    gain.gain.setValueAtTime(0, ac.currentTime)
    osc.connect(gain)
    gain.connect(this.masterGain)
    // ana.connect(this.audioCtx.destination)
    osc.start(ac.currentTime)
    gain.gain.linearRampToValueAtTime(1, ac.currentTime + (100 - this._attackTimeConst) * 2e-3)
  }

  stop (midiNoteNumber: number) {
    const ac = this.audioCtx as AudioContext
    const audioNodes = this.playingAudioNodes.get(midiNoteNumber)
    if (audioNodes !== undefined) {
      const osc = audioNodes.osc
      const gainParam = audioNodes.gain.gain
      const tempVolume = gainParam.value
      gainParam.cancelScheduledValues(ac.currentTime)
      gainParam.setValueAtTime(tempVolume, ac.currentTime)
      gainParam.setTargetAtTime(0, ac.currentTime, this._releaseTimeConst * 2e-3)
      osc.stop(ac.currentTime + this._releaseTimeConst * 10e-3)
      this.playingAudioNodes.delete(midiNoteNumber)
    }
  }
  
  clear () {
    const playingMidiNoteNumbers = this.playingAudioNodes.keys()
    for (const midiNoteNumber of playingMidiNoteNumbers) {
      this.stop(midiNoteNumber)
    }
  }

  close () {
    if (this.audioCtx !== undefined && this.audioCtx.state !== "running") {
      const ac = this.audioCtx as AudioContext
      ac.close()
    }
  }

  replay () {
    const playingMidiNoteNumbers = this.playingAudioNodes.keys()
    for (const midiNoteNumber of playingMidiNoteNumbers) {
      const freq = getFreqByMidiNoteNumber({
        midiNoteNumber,
        isMajor: this._isMajor,
        scaleKeyNumber: noteNames.indexOf(this._musicalKey),
        stdFreq: this._stdFreq
      })
      const audioNode = this.playingAudioNodes.get(midiNoteNumber);
      if (audioNode != undefined) {
        const ac = this.audioCtx as AudioContext
        const osc = audioNode.osc
        osc.frequency.setValueAtTime(freq, ac.currentTime)
        osc.type = this._wavetype as OscillatorType
      }
    }
  }

  set attackTimeConst (val: number) {
    this._attackTimeConst = val
    this.replay()
  }
  set releaseTimeConst (val: number) {
    this._releaseTimeConst = val
    this.replay()
  }
  set isMajor (val: boolean){
    this._isMajor = val
    this.replay()
  }
  set stdFreq (val: number) {
    this._stdFreq = val
    this.replay()
  }
  set wavetype (type: OscillatorType) {
    this._wavetype = type
    this.replay()
  }
  set musicalKey (key: NoteName) {
    this._musicalKey = key
    this.replay()
  }
}
