declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

window.AudioContext = window.AudioContext || window.webkitAudioContext;

export class MetronomeNote {
    beatInterval: number
    _volume: number
    frequency: number
    ctx: AudioContext
    osc: OscillatorNode
    gain: GainNode

    constructor(beatInterval: number, volume: number, freq: number) {
        this.beatInterval = beatInterval
        this._volume = volume / 100
        this.frequency = freq
        this.ctx = new AudioContext()
        this.osc = this.ctx.createOscillator()
        this.gain = this.ctx.createGain()
    }
    init() {
        this.osc = this.ctx.createOscillator()
        this.gain = this.ctx.createGain()

        this.osc.frequency.value = this.frequency
        this.gain.gain.value = this._volume
        this.osc.connect(this.gain)
        this.gain.connect(this.ctx.destination)
        this.osc.start()
    }
    reserveBeat(current48Beat: number, nextBeatTime: number, currentTimeSignature: number) {
        if (this.beatInterval) {
            if (current48Beat % this.beatInterval === 0) {
                this.gain.gain.setValueAtTime(this._volume, nextBeatTime)
                this.gain.gain.linearRampToValueAtTime(0, nextBeatTime + 0.05)
            }
        } else if (!currentTimeSignature && !current48Beat) {
            this.gain.gain.setValueAtTime(this._volume, nextBeatTime)
            this.gain.gain.linearRampToValueAtTime(0, nextBeatTime + 0.05);   
        }
    }
    set audioContext(ctx: AudioContext) {
        this.ctx = ctx
        this.init()
    }
    set volume(newVolume: number) {
        this._volume = newVolume / 100
    }
}

export class MetronomeBeater {
    ctx: AudioContext
    metronomeNotes: MetronomeNote[]
    tempo: number
    currentTimeSignature: number
    current48Beat: number
    currentSignatureIndex: number
    lastBeatTimeStamp: number
    nextBeatTimeStamp: number
    // nextTimeSignature: number
    baseTimeStamp: number
    intervalId: number
    signature: number[]


    constructor (metronomeNotes: MetronomeNote[]) {
        this.ctx = new AudioContext()
        this.metronomeNotes = metronomeNotes
        this.currentTimeSignature = 0
        this.current48Beat = 0
        this.currentSignatureIndex = 0
        this.lastBeatTimeStamp = 0
        this.nextBeatTimeStamp = 0
        this.baseTimeStamp = 0
        this.tempo = 60
        this.signature = [4]
        this.intervalId = 0
    }

    start (tempo: number, timeSignatures: number[]) {
        this.ctx = new AudioContext()
        this.currentTimeSignature = 0
        this.current48Beat = 0
        this.currentSignatureIndex = 0
        const nowTimeStamp = performance.now()
        this.lastBeatTimeStamp = nowTimeStamp
        this.nextBeatTimeStamp = nowTimeStamp
        this.baseTimeStamp = nowTimeStamp - this.ctx.currentTime * 1000
        for (const note of Object.values(this.metronomeNotes)) {
            note.audioContext = this.ctx
        }
        this.tempo = tempo
        this.timeSignatureNumerator = timeSignatures;
        (this.scheduler.bind(this))()
        this.intervalId = setInterval(this.scheduler.bind(this), 500)
    }
    stop () {
        this.ctx.close()
        clearInterval(this.intervalId)
    }
    currentTimeStamp() {
        return this.baseTimeStamp + this.ctx.currentTime * 1000
    }
    timeStampToAudioContextTime(timeStamp: number) {
        return (timeStamp - this.baseTimeStamp) / 1000
    }
    nextNote() {
        const beatTick = 60 * 1000 / this.tempo
        this.nextBeatTimeStamp += beatTick / 12
        this.current48Beat++
        this.current48Beat %= 12
        if (this.current48Beat > 0) {
            this.currentTimeSignature++
            this.currentSignatureIndex %= this.signature.length
            if (this.currentTimeSignature >= this.signature[this.currentSignatureIndex]) {
                this.currentTimeSignature = 0
                this.currentSignatureIndex++
                this.currentSignatureIndex %= this.signature.length
            }
        }
    }
    set timeSignatureNumerator(signatures: number[]) {
        this.currentSignatureIndex = 0
        this.signature = signatures
    }
    scheduler() {
        const now = this.currentTimeStamp()
        while (this.nextBeatTimeStamp < now + 700) {
            const next48BeatTime = this.timeStampToAudioContextTime(this.nextBeatTimeStamp)
            for (const note of Object.values(this.metronomeNotes)) {
                note.reserveBeat(this.current48Beat, next48BeatTime, this.currentTimeSignature)
            }
            this.nextNote()
        }
    }
}