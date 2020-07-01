<template>
    <div
      id="piano-keyboard"
      @pressKey="play"
      @releaseKey="stop"
      @mousedown="pressKey"
      @mouseup="releaseKey"
      @mouseleave="releaseKey"
      @touchstart.prevent="pressKey"
      @touchmove.prevent="moveKey"
      @touchend.prevent="releaseKey"
      @touchcancel="releaseKey"
    >
      <piano-key
        v-for="n of interval"
        :midiNoteNumber="n - 1 + startMidiNoteNumber"
        :isPressed="isPressedIndexes.includes(n - 1 + startMidiNoteNumber)"
        :isWhite="[0, 2, 3, 5, 7, 8, 10].includes((n - 1 + startMidiNoteNumber - 21) % 12)"
        :key="n"
        :interval="interval"
      />
    </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import PianoKey from './PianoKey.vue'
import { getFreqByMidiNoteNumber } from './harmony'
const toneNames = ['A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab']
//window.AudioContext = window.AudioContext  || window.webkitAudioContext;

interface KeyDetailType {
  midiNoteNumber: number;
  toneName: string;
  octave: number;
  isWhite: boolean;
}

export default Vue.extend({
  name: 'piano-keyboard',
  data: () => {
    return {
      isMouseDown: false,
      touchIdentifiers: new Map() as Map<number, number>,
      willStopMidiNoteNumbers: new Map() as Map<number, number>,
      audioCtx: undefined as AudioContext | undefined,
      masterGain:undefined as GainNode | undefined,
      comp:undefined as DynamicsCompressorNode | undefined,
      audioNodes: new Map() as Map<number, {osc: OscillatorNode; gain: GainNode /* ; ana: AnalyserNode */}>,
    }
  },
  props: {
    startMidiNoteNumber: Number,
    interval: Number,
    wavetype: String,
    attackTimeConst: Number,
    releaseTimeConst: Number,
    isMajor: Boolean,
    musicalKey: String,
    stdFrequency: Number,
    isPressedIndexes: Array as PropType<number[]>,
    sustainMethod: String,
  },
  components: {
    'piano-key': PianoKey
  },
  methods: {
    initializeAudioContext() {
      this.audioCtx = new AudioContext()
      this.comp = this.audioCtx.createDynamicsCompressor()
      this.comp.attack.value = 0;
      this.comp.release.value = 0;
      this.comp.connect(this.audioCtx.destination)
      this.masterGain = this.audioCtx.createGain()
      this.masterGain.gain.value = 0.1
      this.masterGain.connect(this.comp)
    },
    play (midiNoteNumber: number) {
      this.isPressedIndexes.push(midiNoteNumber)
      if (this.audioCtx === undefined || this.audioCtx.state !== "running") {
        this.initializeAudioContext()
      }
      const ac = this.audioCtx as AudioContext
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      // const ana = this.audioCtx.createAnalyser();
      this.audioNodes.has(midiNoteNumber) || this.audioNodes.set(midiNoteNumber, {osc, gain})
      const freq = getFreqByMidiNoteNumber({
        midiNoteNumber,
        isMajor: this.isMajor,
        scaleKeyNumber: toneNames.indexOf(this.musicalKey),
        stdFreq: this.stdFrequency
      })
      osc.frequency.value = freq
      osc.type = this.wavetype as OscillatorType
      gain.gain.value = 0
      osc.connect(gain)
      gain.connect(this.masterGain as GainNode)
      // ana.connect(this.audioCtx.destination)
      osc.start()
      gain.gain.setTargetAtTime(1, ac.currentTime, this.attackTimeConst * 1e-3)
    },
    stop (midiNoteNumber: number) {
      const index = this.isPressedIndexes.indexOf(midiNoteNumber)
      const ac = this.audioCtx as AudioContext
      this.isPressedIndexes.splice(index, 1)
      this.audioNodes.get(midiNoteNumber)?.gain.gain.setTargetAtTime(0, ac.currentTime, this.releaseTimeConst * 1e-3);
      this.audioNodes.get(midiNoteNumber)?.osc.stop(ac.currentTime + 5);
      this.audioNodes.delete(midiNoteNumber)
    },
    stopTones (midiNoteNumbers: number[]) {
      for (const midiNoteNumber of midiNoteNumbers) {
        if (this.startMidiNoteNumber <= midiNoteNumber && midiNoteNumber <= this.startMidiNoteNumber + this.interval) this.stop(midiNoteNumber)
      }
    },
    clear () {
      for (const midiNoteNumber of this.audioNodes.keys()) {
        this.stop(midiNoteNumber)
      }
      if (this.audioCtx !== undefined && this.audioCtx.state !== "running") {
        const ac = this.audioCtx as AudioContext
        ac.close()
      }
    },
    replay () {
      const pressedIndexes = [...this.isPressedIndexes]
      for (const midiNoteNumber of pressedIndexes) {
        const freq = getFreqByMidiNoteNumber({
          midiNoteNumber,
          isMajor: this.isMajor,
          scaleKeyNumber: toneNames.indexOf(this.musicalKey),
          stdFreq: this.stdFrequency
        })
        const audioNode = this.audioNodes.get(midiNoteNumber);
        if (audioNode != undefined) {
          const ac = this.audioCtx as AudioContext
          const osc = audioNode.osc
          osc.frequency.setValueAtTime(freq, ac.currentTime)
          osc.type = this.wavetype as OscillatorType
        }
      }
    },
    pressKey (event: MouseEvent | TouchEvent) {
      const targetElement = event.target as HTMLDivElement
      const midiNoteNumberAttr = targetElement.attributes.getNamedItem('midiNoteNumber')
      if (midiNoteNumberAttr != null) {
        const midiNoteNumber = Number(midiNoteNumberAttr.value)
        if (this.sustainMethod === "exclusive" && this.touchIdentifiers.size === 0) {
          this.clear()
        }
        if (!this.isPressedIndexes.includes(midiNoteNumber)) {
          if (event.type === 'mousedown') {
            this.isMouseDown = true
          } else {
            const id: number = (event as TouchEvent).targetTouches[0].identifier
            this.touchIdentifiers.set(id, midiNoteNumber)
          }
          this.play(midiNoteNumber)
        } else {
          if (event.type === 'mousedown') {
            if (this.sustainMethod === "alternative") {
              this.willStopMidiNoteNumbers.set(0, midiNoteNumber)
            }
          } else {
            const id: number = (event as TouchEvent).targetTouches[0].identifier
            this.touchIdentifiers.set(id, midiNoteNumber)
            if (this.sustainMethod ==="alternative") {
              this.willStopMidiNoteNumbers.set(id, midiNoteNumber)
            }
          }
        }
      }
    },
    moveKey (event: TouchEvent) {
      for (const touch of event.changedTouches) {
        const id = touch.identifier
        const currentElement = document.elementFromPoint(touch.pageX, touch.pageY)
        if (currentElement != null) {
          const midiNoteNumberAttr = currentElement.attributes.getNamedItem('midiNoteNumber')
          if (midiNoteNumberAttr != null) {
            const currentMidiNoteNumber = Number(midiNoteNumberAttr.value)
            const oldMidiNoteNumber = this.touchIdentifiers.get(id)
            if (this.touchIdentifiers.has(id) && oldMidiNoteNumber !== currentMidiNoteNumber) {
              this.stop(this.touchIdentifiers.get(id) as number)
              this.touchIdentifiers.set(id, currentMidiNoteNumber)
              if (!this.isPressedIndexes.includes(currentMidiNoteNumber)) {
                this.play(currentMidiNoteNumber)
                if (this.sustainMethod ==="alternative") {
                  this.willStopMidiNoteNumbers.delete(id)
                }
              } else {
                if (this.sustainMethod ==="alternative") {
                  this.willStopMidiNoteNumbers.set(id, currentMidiNoteNumber)
                }
              }
            }
          }
        } else {
          const oldMidiNoteNumber = this.touchIdentifiers.get(id)
          if (oldMidiNoteNumber != undefined) {
            this.stop(oldMidiNoteNumber)
            this.touchIdentifiers.delete(id)
          }
        }
      }
    },
    releaseKey (event: MouseEvent | TouchEvent) {
      if (event.type === "mouseup") {
        this.isMouseDown = false
        const pressedKey = this.isPressedIndexes[0]
        switch(this.sustainMethod) {
          case "momentary":
            this.stop(pressedKey)
            break
          case "alternative":
            console.log(this.willStopMidiNoteNumbers.get(0))
            if (this.willStopMidiNoteNumbers.has(0)) {
              this.stop(this.willStopMidiNoteNumbers.get(0) as number)
              this.willStopMidiNoteNumbers.delete(0)
            }
            break
          case "exclusive":
            break
        }
      } else if (/touch/.test(event.type)) {
        const id = (event as TouchEvent).changedTouches[0].identifier
        switch(this.sustainMethod) {
          case "momentary":
            this.touchIdentifiers.has(id) && this.stop(this.touchIdentifiers.get(id) as number)
            break
          case "alternative":
            if (this.willStopMidiNoteNumbers.has(id)) {
              this.stop(this.willStopMidiNoteNumbers.get(id) as number)
              this.willStopMidiNoteNumbers.delete(id)
            }
            break
          case "exclusive":
            break
        }
        this.touchIdentifiers.delete(id)
      }
    }
  },
  watch: {
    sustainMethod: function() {
      if (this.sustainMethod === "momentary") this.clear()
    },
    musicalKey: function () {
      this.replay()
    },
    isMajor: function () {
      this.replay()
    },
    wavetype: function () {
      this.replay()
    },
    stdFrequency: function () {
      this.replay()
    }
  }
})
</script>

<style scoped>
#piano-keyboard {
  position: relative;
  height: 100%;
  width: 100%;
  white-space: nowrap;
  margin: 0;
}
.white-key {
  z-index: 0;
  position: relative;
}
.black-key {
  z-index: 1;
  position: absolute;
  top: 0px;
}
</style>
