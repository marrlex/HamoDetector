<template>
  <v-card id="metronome-card" :dark="dark">
    <v-card-text>
      <v-container class="overflow-y-auto pa-3" fluid>
        <v-row no-gutters="" align="center">
          <v-col align-self="center" cols=7>
          <v-icon class="mb-2 mr-2" @click="changeTempo('decrement')">remove</v-icon>
          <span class="display-1 font-weight-light">{{ items.tempo.value}}</span>
          <span class="subheading font-weight-light ml-1">BPM</span>
          <v-icon class="mb-2 ml-2" @click="changeTempo('increment')">add</v-icon>
          </v-col>
          <v-col cols=2>
            <v-select
                v-model="items.timeSignature.value"
                :items="items.timeSignature.select"
                dense
                hide-details
                label="拍子"
                @change="isPlaying && (beater.timeSignatureNumerator = items.timeSignature.value)"
            ></v-select>
          </v-col>
          <v-col class="text-right" cols=3>
          <v-btn
              depressed
              text
              outlined=""
              small
              @click="metroHandler"
          >
              <v-icon>
              {{ isPlaying ? 'mdi-pause' : 'mdi-play' }}
              </v-icon>
          </v-btn>
          </v-col>
      </v-row>
      <v-row>
        <v-col cols=12>
          <v-slider
              v-model="items.tempo.value"
              dense
              hide-details=""
              :min="items.tempo.slider.min"
              :max="items.tempo.slider.max"
              :label="items.tempo.title"
              @change="isPlaying && (beater.tempo = items.tempo.value)"
          ></v-slider>
          </v-col>
      </v-row>
      <v-row
          v-for="(subItem, key) in volumes"
          :key="subItem.title"
          no-gutters
          justify="space-between"
          align="center"
      >
          <v-col
          cols=12
          v-if="'slider' in subItem"
          >
          <v-slider
              v-model="subItem.value"
              dense
              :min="subItem.slider.min"
              :max="subItem.slider.max"
              class="musisync"
              hide-details=""
              :label="subItem.icon || subItem.title"
              @change="changeVolume(key)"
          ></v-slider>
          </v-col>
          <v-col v-if="'select' in subItem" cols=9>
          <v-select
              :items="subItem.select"
              v-model="subItem.value"
              dense
          ></v-select>
          </v-col>
          <v-col v-if="subItem.switch" cols=9>
          <v-switch v-model="subItem.value" class="mt-0" dense :label="subItem.title"></v-switch>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import { MetronomeNote, MetronomeBeater } from './Metronome.ts'
export default {
  name: "MetronomeCard",
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
        select: [1, 2, 3, 4]
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
    beater: null
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
      this.beater.start(this.items.tempo.value, this.items.timeSignature.value)
    },
    stop() {
      this.beater.stop()
    },
    changeTempo(operator) {
      if (operator) {
        switch(operator) {
          case 'increment':
            this.items.tempo.value++
            break
          case 'decrement':
            this.items.tempo.value--
        }
      }
      this.beater.tempo = this.items.tempo.value
    },
    changeVolume(key) {
      this.volumes[key].metronomeNote.volume = this.volumes[key].value
    }
  }
}
</script>

<style>
#metronome-card {
  overflow-y: auto;
}
label.v-label {
  width: 3em;
  text-align: center;
}
</style>