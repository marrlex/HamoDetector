<template>
  <v-card id="harmony-display-card" :dark="dark" height="8rem">
    <v-container fluid="" class="pa-0">
      <v-row style="height: 5rem; width: 100%" no-gutters="">
        <v-col style="height: 100%" cols="12">
          <canvas
            id="canvas"
            style="border:1px solid #ccc; height: 100%; width: 100%"
            :width="width"
            :height="height"
          ></canvas>
        </v-col>
      </v-row>
      <v-row style="height: 3rem" no-gutters="" align="center" align-content="center" justify="center">
        <v-col cols="1" align-self="center">
          <div style="width: 100%; text-align: center">
            <v-btn
              depressed
              text
              outlined=""
              small
              icon
              @click="drawHandler"
            >
              <v-icon>
                {{ isDrawing ? 'mdi-pause' : 'mdi-play' }}
              </v-icon>
            </v-btn>
            <v-btn
              depressed
              text
              outlined=""
              small
              icon
              @click="setMaxLevel"
            >
              <v-icon>
                mdi-reload
              </v-icon>
            </v-btn>
          </div>
        </v-col>
        <v-col cols="5.5">
          <v-slider
            v-model="yRatio"
            dense
            :min="1"
            :max="10"
            label="振幅倍率"
            hide-details=""
          ></v-slider>
        </v-col>
        <v-col cols="5.5">
          <v-slider
            v-model="xRatio"
            dense
            step="0.1"
            :min="1"
            :max="20"
            label="時間倍率"
            hide-details=""
          ></v-slider>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export default Vue.extend({
  props: {
    dark: Boolean,
    analyserNode: AnalyserNode as PropType<AnalyserNode | undefined>
  },
  data: () => ({
    dataArray: undefined as Uint8Array | undefined,
    canvasCtx: undefined as CanvasRenderingContext2D | undefined,
    width: 0,
    height: 0,
    isDrawing: false,
    xRatio: 1,
    yRatio: 1,
    maxLevel: 128,
  }),
  methods: {
    start () {
      if (this.analyserNode !== undefined) {
        this.analyserNode.fftSize = 32768
      }
      const canvasElm =  document.getElementById('canvas') as HTMLCanvasElement
      this.canvasCtx = canvasElm.getContext('2d') as CanvasRenderingContext2D
      this.width = canvasElm.clientWidth
      this.height = canvasElm.clientHeight
      this.canvasCtx.clearRect(0, 0, this.width, this.height)
      this.draw()
    },
    setMaxLevel () {
      this.maxLevel = this.dataArray === undefined ? 128 : this.dataArray.reduce((a, b) => a > b ? a : b)
    },
    draw() {
      if (this.analyserNode === undefined) {
        return
      }
      const bufferLength = this.analyserNode.frequencyBinCount
      this.dataArray = new Uint8Array(bufferLength)
      this.analyserNode.getByteTimeDomainData(this.dataArray)
      const canvasCtx = this.canvasCtx as CanvasRenderingContext2D
      let dataArray = this.dataArray
      // /*
      // trigger
      const triggerLevel = this.maxLevel
      if (dataArray[0] > triggerLevel) {
        while (dataArray[0] >= triggerLevel) {
          dataArray = dataArray.slice(1)
        }
      }
      while (dataArray[0] < triggerLevel || (dataArray[0] === triggerLevel && dataArray[1] < triggerLevel)) {
        dataArray = dataArray.slice(1)
      }
      // */
      canvasCtx.fillStyle = 'white'
      canvasCtx.fillRect(0, 0, this.width, this.height)
    
      const yRatio = this.yRatio
      const height = this.height
      canvasCtx.strokeStyle = 'black'
      canvasCtx.beginPath()
      canvasCtx.moveTo(0, (1 - ((dataArray[0] - 128) * yRatio + 128) / 255) * height)
      const sliceWidth = this.width * 1.0 / bufferLength * this.xRatio
      dataArray.forEach((data, i) => {
        const y = (1 - ((data - 128) * yRatio + 128) / 255) * height
        canvasCtx.lineTo(i * sliceWidth, y)
      })
      canvasCtx.stroke()
      
      canvasCtx.strokeStyle = 'lightblue'; 
      canvasCtx.beginPath()
      canvasCtx.moveTo(0, this.height / 2)
      canvasCtx.lineTo(this.width, this.height / 2)
      canvasCtx.stroke()
      if (this.isDrawing) {
        requestAnimationFrame(this.draw)
      }
    },
    drawHandler () {
      this.isDrawing = !this.isDrawing
      this.draw()
    }
  },
  mounted: function () {
    this.start()
  },
  watch: {
    analyserNode: function () {
      this.start()
    }
  }
})
</script>

<style>

</style>