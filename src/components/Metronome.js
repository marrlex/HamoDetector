window.AudioContext = window.AudioContext || window.webkitAudioContext;

export class MetronomeNote {
    constructor(beatInt, volume, freq) {
        this.beatInterval = beatInt
        this._volume = volume / 100
        this.frequency = freq
        this.ctx
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
    reserveBeat(current48Beat, nextBeatTime, currentTimeSignature) {
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
    set audioContext(ctx) {
        this.ctx = ctx
        this.init()
    }
    set volume(newVolume) {
        this._volume = newVolume / 100
    }
}

export class MetronomeBeater {
    constructor (metronomeNotes) {
        this.ctx
        this.metronomeNotes = metronomeNotes
    }
    start (tempo, timeSignature) {
        this.ctx = new AudioContext()
        this.currentTimeSignature = 0
        this.current48Beat = 0
        this.currentSignatureIndex = 0
        this.isChangedSignature = false
        const nowTimeStamp = performance.now()
        this.lastBeatTimeStamp = nowTimeStamp
        this.nextBeatTimeStamp = nowTimeStamp
        this.nextTimeSignature = this.nextNote.bind(this)
        this.baseTimeStamp = nowTimeStamp - this.ctx.currentTime * 1000
        for (const note of Object.values(this.metronomeNotes)) {
            note.audioContext = this.ctx
        }
        this.tempo = tempo
        this.timeSignatureNumerator = timeSignature;
        (this.scheduler.bind(this))()
        this.intervalId = setInterval(this.scheduler.bind(this), 500)
    }
    stop () {
        this.ctx.close()
        clearInterval(this.intervalId)
        this.intervalId = null
    }
    currentTimeStamp() {
        return this.baseTimeStamp + this.ctx.currentTime * 1000
    }
    timeStampToAudioContextTime(timeStamp) {
        return (timeStamp - this.baseTimeStamp) / 1000
    }
    nextNote() {
        const beatTick = 60 * 1000 / this.tempo
        if (this.isChangedSignature) {
            this.currentSignatureIndex = 0
            this.isChangedSignature = false
        }
        this.nextBeatTimeStamp += beatTick / 12
        this.current48Beat++
        this.current48Beat %= 12
        if (!this.current48Beat) {
            this.currentTimeSignature++
            this.currentSignatureIndex %= this.signature.length
            if (this.currentTimeSignature >= this.signature[this.currentSignatureIndex]) {
                this.currentTimeSignature = 0
                this.currentSignatureIndex++
                this.currentSignatureIndex %= this.signature.length
            }
        }
        return this
    }
    set timeSignatureNumerator(signature) {
        this.signature = [signature]
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