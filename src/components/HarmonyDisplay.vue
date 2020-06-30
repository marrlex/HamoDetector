<template>
  <v-card id="harmony-display-card" :dark="dark">
    <div class="text-display">
      <v-card-title class="chord-name">{{ matchChords[0].scaleName }}{{ matchChords[0].chordName }}</v-card-title>
      <v-card-text
        class="chord-name"
      >{{ relatedChordNames.join(", ") }}</v-card-text>
    </div>

    <div id="harmony-display" 
          :style="`border: solid 1px ${dark ?'white':'#1E1E1E'}`">
      <div class="white-keyboard">
        <div
          v-for="noteName in whiteNoteNames"
          :key="noteName"
          :noteName="noteName"
          :style="`border: solid 1px ${dark ?'white':'#1E1E1E'}`"
          class="white-key"
          :class="[{'primary': pressedNoteNames.includes(noteName)}, dark ? 'darken-5' : 'lighten-3']"
        ><span class="note-text">{{noteName}}</span></div>
      </div>
      <div class="black-keyboard">
        <div
          v-for="(noteName, index) in blackNoteNames"
          :key="index"
          :noteName="noteName"
          :style="`border: solid 1px ${dark ?'white':'#1E1E1E'}; background-color: ${dark ? '#1E1E1E' : 'white'}`"
          :class="[{'primary': pressedNoteNames.includes(noteName)}, dark ? 'darken-5' : 'lighten-5', (noteName !== '') ? 'black-key' : 'key-space']"
        ><span class="note-text">{{noteName}}</span></div>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
const noteNames = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
const chordToNoteIndexes: Record<string, number[]> = {
  "": [0, 4, 7],
  "m": [0, 3, 7],
  "sus4": [0, 5, 7],
  "sus2": [0, 2, 7],
  "aug": [0, 4, 8],
  "dim": [0, 3, 6],
  "7": [0, 4, 7, 10],
  "m7": [0, 3, 7, 10],
  "M7": [0, 4, 7, 11],
  "m7-5": [0, 3, 6, 10],
  "7sus4": [0, 5, 7, 10],
  "mM7": [0, 3, 7, 11],
  "6": [0, 4, 7, 9],
  "m6": [0, 3, 7, 9],
  "7-5": [0, 4, 6, 10],
}

function chordNameToNoteNames(chordName: string, baseNote: string): string[] {
  const noteIntervalSequence: number[] = chordToNoteIndexes[chordName]
  const baseIndex: number = noteNames.indexOf(baseNote)
  return (baseIndex > -1) ? noteIntervalSequence.map((noteInterval) => noteNames[(noteInterval + baseIndex) % noteNames.length]) : []
}

export default Vue.extend({
  name: 'harmony-display',
  data: () => ({
    whiteNoteNames: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    blackNoteNames: ['', 'C#', 'Eb', '', '', 'F#', 'Ab', 'Bb', ''],
  }),
  props: {
    matchChords: Array as PropType<{scaleName: string; chordName: string; isMajor: boolean}[]>,
    dark: Boolean
  },
  computed: {
    relatedChordNames: function (): string[] {
      return this.matchChords.slice(1).map((chord) => `${chord.scaleName}${chord.chordName}`)
    },
    pressedNoteNames: function(): string[] {
      const topMatchChord = this.matchChords[0]
      return chordNameToNoteNames(topMatchChord.chordName, topMatchChord.scaleName)
    }
  },
  methods: {
  }
})
</script>

<style scoped>
#harmony-display-card {
  display: relative;
  height: 12rem;
}
#harmony-display {
  box-sizing: border-box;
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 6rem;
  border: solid 1px black !important;
}
.text-display {
  height: 6rem;
  display: grid;
}
.white-keyboard {
  z-index: 0;
  display: flex;
  height: 6rem;
  position: relative;
}
.black-keyboard {
  z-index: 1;
  position: absolute;
  top: 0;
  display: flex;
  height: 3rem;
  width: 100%;
}
.white-key {
  box-sizing: border-box;
  width: 100%;
  display: grid;
}
.black-key {
  flex-grow: 2;
  display: grid;
}
.note-text {
  align-self: end;
  justify-self: center;
}
.key-space{
  visibility: hidden;
  flex-grow: 1;
}
</style>
