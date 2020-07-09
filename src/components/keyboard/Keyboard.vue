<template>
    <div
      id="piano-keyboard"
      @pressKey="play"
      @releaseKey="stop"
      @mousedown="pressKey"
      @mouseup="releaseKey"
      @mouseleave="releaseKey"
      @touchmove.stop="moveKey"
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
import { HarmonyPlayer, NoteName } from './HarmonyPlayer'

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
      harmonyPlayer: undefined as HarmonyPlayer | undefined,
    }
  },
  props: {
    startMidiNoteNumber: Number,
    interval: Number,
    wavetype: String as PropType<OscillatorType>,
    attackTimeConst: Number,
    releaseTimeConst: Number,
    isMajor: Boolean,
    musicalKey: String as PropType<NoteName>,
    stdFrequency: Number,
    isPressedIndexes: Array as PropType<number[]>,
    sustainMethod: String as PropType<"momentary" | "exclusive" | "alternative">,
  },
  components: {
    'piano-key': PianoKey
  },
  /*
  mounted: function() {
    document.getElementById("piano-keyboard")?.addEventListener("touchstart", (event) => {
      this.audioCtx = new AudioContext()
      const emptySource = this.audioCtx.createBufferSource()
      emptySource.start(0)
      console.log(this.audioCtx, emptySource)
      emptySource.stop(0)
      console.log(this.audioCtx)
      this.audioCtx.resume().then(() => console.log("resumed"))
      this.pressKey(event)
    })
  },
  */
  methods: {
    initializeAudioContext() {
      if (this.audioCtx === undefined || this.audioCtx.state !== "running") {
        this.audioCtx = new AudioContext()
        this.masterGain = this.audioCtx.createGain()
        this.masterGain.gain.value = 0.1
        this.masterGain.connect(this.audioCtx.destination)
        this.comp = this.audioCtx.createDynamicsCompressor()
        this.comp.attack.value = 0;
        this.comp.release.value = 0;
        this.comp.connect(this.masterGain)
      }
    },
    play (midiNoteNumber: number) {
      this.harmonyPlayer?.play(midiNoteNumber)
      this.isPressedIndexes.push(midiNoteNumber)
    },
    stop (midiNoteNumber: number) {
      this.harmonyPlayer?.stop(midiNoteNumber)
      const index = this.isPressedIndexes.indexOf(midiNoteNumber)
      this.isPressedIndexes.splice(index, 1)
    },
    clear () {
      this.harmonyPlayer?.clear()
      this.isPressedIndexes.splice(0)
    },
    close () {
      this.harmonyPlayer?.close()
    },
    replay () {
      this.harmonyPlayer?.replay()
    },
    pressKey (event: MouseEvent | TouchEvent) {
      if (this.harmonyPlayer === undefined) {
        const toneData = {
          attackTimeConst: this.attackTimeConst,
          releaseTimeConst: this.releaseTimeConst,
          isMajor: this.isMajor,
          stdFreq: this.stdFrequency,
          musicalKey: this.musicalKey,
          wavetype: this.wavetype
        }
        this.harmonyPlayer = new HarmonyPlayer(toneData)
      }
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
    sustainMethod: function () {
      if (this.sustainMethod === "momentary") this.harmonyPlayer?.clear()
    },
    musicalKey: function () {
      this.harmonyPlayer?.replay()
    },
    isMajor: function () {
      this.harmonyPlayer?.replay()
    },
    wavetype: function () {
      this.harmonyPlayer?.replay()
    },
    stdFrequency: function () {
      this.harmonyPlayer?.replay()
    }
  },
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
