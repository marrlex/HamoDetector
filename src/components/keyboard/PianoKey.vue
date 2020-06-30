<template>
  <div
    class="keyboards"
    :class="{
      'keyboard-pressed': isPressed,
      'key-space': isKeySpace,
      'white-key': isWhite,
      'black-key': !isWhite
    }"
    :style="isWhite
      ? `width: calc(100% / ${interval - ~~(interval / 12) * 5});`
      : `width: calc(70% / ${interval - ~~(interval / 12) * 5}); margin-left: calc(-35% / ${interval - ~~(interval / 12) * 5});`"
    :toneName="toneName"
    :octave="octave"
    :midiNoteNumber="midiNoteNumber"></div>
</template>

<script>
export default {
  name: 'piano-key',
  props: {
    isPressed: Boolean,
    isKeySpace: Boolean,
    isWhite: Boolean,
    toneName: String,
    midiNoteNumber: Number,
    octave: Number,
    interval: Number,
  },
  methods: {
    pressKey () {
      this.$emit('pressKey', this.midiNoteNumber)
    },
    releaseKey () {
      if (this.isPressed)
        this.$emit('releaseKey', this.midiNoteNumber)
    },
    moveKey (event) {
      console.log(event)
      if (!this.isPressed) {
        this.pressKey()
      }
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}
.keyboards {
    box-sizing: border-box;
    border-radius: 0 0 3px 3px;
    box-shadow: 1px 2px 5px rgba(0,0,0,0.6);
    display: inline-block;
}
.keyboard-pressed {
    background-color: rgb(204, 204, 204) !important;
    border-bottom: solid 1px black !important;
    box-shadow: 1px 1px 4px rgba(0,0,0,0.4) inset;
}
.white-key {
  box-sizing: border-box;
  height: 100%;
  border: solid 1px black;
  background-color: white;
  border-bottom: solid 4px #eee;
}
.black-key {
  box-sizing: border-box;
  height: 50%;
  border: solid 1px black;
  background-color: black;
  border-bottom: solid 4px #333;
}
</style>
