<template>
  <v-card id="metronome-card" :dark="dark">
    <v-card-text>
      <v-container class="overflow-y-auto pa-3" fluid>
        <v-row no-gutters="">
          <v-col cols="11">
            <v-row no-gutters="" align="center">
              <v-col cols="8" align-self="center">
                <v-row no-gutters="" align="center">
                  <v-col cols="auto"><v-icon @click="items.tempo.value--">remove</v-icon></v-col>
                  <v-col cols="auto" class="ml-2 mr-2">
                    <span class="display-1 font-weight-light">{{ items.tempo.value}}</span>
                    <span class="subheading font-weight-light ml-1">BPM</span>
                  </v-col>
                  <v-col cols="auto"><v-icon @click="items.tempo.value++">add</v-icon></v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="1">
            <v-btn
              depressed
              text
              outlined=""
              small
              icon
              @click="metroHandler"
            >
              <v-icon>
                {{ isPlaying ? 'mdi-pause' : 'mdi-play' }}
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-slider
              v-model="items.tempo.value"
              dense
              hide-details=""
              :min="items.tempo.slider.min"
              :max="items.tempo.slider.max"
              @change="isPlaying && (beater.tempo = items.tempo.value)"
            ></v-slider>
            </v-col>
        </v-row>
        <v-row
          no-gutters
          align="center"
        >
          <v-col cols="auto" class="musisync">
            <span>拍子</span>
          </v-col>
          <v-col cols="auto" style="max-width: 50%">
            <v-select
              v-if="Number.isInteger(items.timeSignature.value)"
              class="ml-2 mr-2 mt-0 mb-1"
              v-model="items.timeSignature.value"
              :items="items.timeSignature.select"
              outlined=""
              suffix="/4"
              dense
              hide-details
            ></v-select>
            <v-text-field
              v-else
              class="ml-2 mr-2 mt-0 mb-1"
              v-model="items.timeSignature.complexValue"
              autofocus=""
              placeholder="2+3"
              suffix="/4"
              hide-details=""
              append-icon="mdi-chevron-up"
              @click:append="items.timeSignature.value = 4"
              dense
            >
            </v-text-field>
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-card-subtitle class="pl-0">音量</v-card-subtitle>
        <v-row
          v-for="subItem in volumes"
          :key="subItem.title"
          no-gutters
          justify="space-between"
          align="center"
        >
          <v-col cols="auto" class="musisync">
            <span>{{ subItem.icon || subItem.title }}</span>
          </v-col>
          <v-col>
          <v-slider
              v-model="subItem.value"
              dense
              :min="subItem.slider.min"
              :max="subItem.slider.max"
              hide-details=""
          ></v-slider>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { MetronomeNote, MetronomeBeater } from './Metronome'

export default Vue.extend({
  props: {
    dark: Boolean
  },
  data: () => ({
    title: 'メトロノーム',
    active: false,
    isPlaying: false,
    items: {
      tempo: {
        title: 'テンポ',
        value: 60,
        slider: {
          min: 40,
          max: 300
        }
      },
      timeSignature: {
        title: '拍子',
        value: 4,
        complexValue: '',
        select: [1, 2, 3, 4, '複合']
      },
    },
    volumes: {
      stress: {
        title: '強拍',
        value: 100,
        slider: {
          min: 0,
          max: 100
        },
        metronomeNote: new MetronomeNote(0, 100, 2400)
      },
      quarter: {
        title: '4分音符',
        icon: 'q',
        value: 50,
        slider: {
          min: 0,
          max: 100
        },
        metronomeNote: new MetronomeNote(12, 80, 1200)
      },
      quaver: {
        title: '8分音符',
        icon: 'e',
        value: 0,
        metronomeNote: new MetronomeNote(6, 0, 1200),
        slider: {
          min: 0,
          max: 100
        }
      },
      semiquaver: {
        title: '16分音符',
        icon: 's',
        value: 0,
        metronomeNote: new MetronomeNote(3, 0, 1200),
        slider: {
          min: 0,
          max: 100
        }
      },
      triplet: {
        title: '3連符',
        icon: 'T',
        value: 0,
        metronomeNote: new MetronomeNote(4, 0, 1200),
        slider: {
          min: 0,
          max: 100
        }
      },
    },
    beater: undefined as MetronomeBeater | undefined
  }),
  methods: {
    metroHandler() {
      this.isPlaying = !this.isPlaying
      if (this.isPlaying) {
        this.start()
      } else  {
        this.stop()
      }
    },
    start() {
      this.beater = new MetronomeBeater({
        stress: this.volumes.stress.metronomeNote,
        quarter: this.volumes.quarter.metronomeNote,
        quaver: this.volumes.quaver.metronomeNote,
        semiquaver: this.volumes.semiquaver.metronomeNote,
        triplet: this.volumes.triplet.metronomeNote,
      })
      const timeSignatureValue = this.items.timeSignature.value
      const timeSignatureNumerator = Number.isInteger(timeSignatureValue) 
        ? [timeSignatureValue] 
        : (this.items.timeSignature.complexValue || "2+3").split(/[^\d]/).map((str) => Number(str))
      this.beater.start(this.items.tempo.value, timeSignatureNumerator)
    },
    stop() {
      this.beater && this.beater.stop()
    },
  },
  watch: {
    'items.timeSignature.value': function () {
      const timeSignatureValue = this.items.timeSignature.value
      const timeSignatureNumerator = Number.isInteger(timeSignatureValue) 
        ? [timeSignatureValue] 
        : (this.items.timeSignature.complexValue || "2+3").split(/[^\d]/).map((str) => Number(str))
      if (this.isPlaying && this.beater !== undefined) {
        this.beater.timeSignatureNumerator = timeSignatureNumerator
      }
    },
    'items.tempo.value': function (tempo: number) {
      if (this.beater !== undefined) {
        this.beater.tempo = tempo
      }
    },
    volumes: {
      handler: function (volume: {"value": number; "metronomeNote": MetronomeNote}) {
        volume.metronomeNote.volume = volume.value
      },
      deep: true
    }
  }
})
</script>

<style>
#metronome-card {
  overflow-y: auto;
}
.musisync {
  width: 4em !important;
  text-align: center;
}
</style>