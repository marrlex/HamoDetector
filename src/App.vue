<template>
  <v-app>
    <v-app-bar
      dense=""
      :dark="settings.general.items.colorTheme.value"
      app
      width="100vw"
    >
      <v-toolbar-title>鱧ディテクター</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn :dark="settings.general.items.colorTheme.value" icon @click.stop="drawer = !drawer">
        <v-icon>settings</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      temporary
      right
      app
      :dark="settings.general.items.colorTheme.value"
    >
      <v-list-item :dark="settings.general.items.colorTheme.value">
        <v-list-item-content>
          <v-list-item-title class="text-subtitle-1">設定</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list dense :dark="settings.general.items.colorTheme.value">
        <v-list-group
          v-for="item in settings"
          :key="item.title"
          v-model="item.active"
          :prepend-icon="item.action"
          no-action
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item-content>
          </template>

          <v-container fluid>
            <v-row
              v-for="subItem in item.items"
              :key="subItem.title"
              no-gutters=""
              justify="space-between"
            >
              <v-col>
                <v-subheader>
                  {{ subItem.title }}
                  <span
                    v-if="'slider' in subItem"
                  >： {{ subItem.value }}</span>
                </v-subheader>
                <v-slider
                  v-if="'slider' in subItem"
                  v-model="subItem.value"
                  :min="subItem.slider.min"
                  :max="subItem.slider.max"
                  append-icon="add"
                  prepend-icon="remove"
                  @click:append="subItem.value++"
                  @click:prepend="subItem.value--"
                ></v-slider>
              </v-col>
              <v-col v-if="'select' in subItem">
                <v-select
                  :items="subItem.select"
                  v-model="subItem.value"
                  dense
                ></v-select>
              </v-col>
              <v-col v-if="subItem.switch">
                <v-switch v-model="subItem.value" class="mt-1" dense></v-switch>
              </v-col>
            </v-row>
          </v-container>
          <v-divider></v-divider>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-main style="height: 100vh">
      <v-container fluid style="height: 100%" class="overflow-y-auto">
        <v-row wrap dense>
          <v-col cols="12" md="12" lg="6" order-lg="4" order-xl="4" order-sm="first" order-md="first" :style="`width: ${$vuetify.breakpoint.thresholds.md}`">
            <harmony-display
              style="max-height: 100%"
              :dark="settings.general.items.colorTheme.value"
              :matchChords="harmony"
              :isMajor="toneConfig.isMajor"
              :musicalKey="toneConfig.musicalKey"
              :displayCent="settings.general.items.displayCent.value"
            ></harmony-display>
          </v-col>

          <v-col cols="12" md="6" lg="3" order-lg="first" order-xl="first" order-sm="7" order-md="7" :style="`width: ${$vuetify.breakpoint.thresholds.md}`">
            <tonecolor-card
              style="max-height: 100%"
              :dark="settings.general.items.colorTheme.value"
              :waveform.sync="toneConfig.waveform"
              :sustainMethod.sync="toneConfig.sustainMethod"
              :toneRange.sync="toneConfig.toneRange"
              :isMajor.sync="toneConfig.isMajor"
              :musicalKey.sync="toneConfig.musicalKey"
            ></tonecolor-card>
          </v-col>
          

          <v-col cols="12" md="6" lg="3" order="last" :style="`width: ${$vuetify.breakpoint.thresholds.md}`">
            <metronome-card
              :dark="settings.general.items.colorTheme.value"
              style="max-height: 100%"
            ></metronome-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-footer
      style="height: 40%; max-height: 50mm"
      padless=""
      app
    >
      <v-container fluid class="ma-0" style="height: 100%; width: 100vw">
        <piano-keyboard
          :startMidiNoteNumber="toneConfig.toneRange * 12 + 24"
          :interval="$vuetify.breakpoint.xs ? 13 : $vuetify.breakpoint.mdAndDown ? 25 : $vuetify.breakpoint.lg ? 37 : 49"
          :isPressedIndexes="playingMidiNoteNumbers"
          :sustainMethod="toneConfig.sustainMethod"
          :wavetype="toneConfig.waveform"
          :attackTimeConst="settings.toneColor.items.attack.value"
          :releaseTimeConst="settings.toneColor.items.release.value"
          :isMajor="toneConfig.isMajor"
          :musicalKey="toneConfig.musicalKey"
          :stdFrequency="settings.general.items.baseFrequency.value"
        ></piano-keyboard>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import '@mdi/font/css/materialdesignicons.css'
import './assets/fonts/css/musisync.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import PianoKeyboard from './components/keyboard/Keyboard.vue'
import MetronomeCard from './components/MetronomeCard.vue'
import ToneColorCard from './components/ToneColorCard.vue'
import HarmonyDisplay from './components/HarmonyDisplay.vue'
import { chordCheck } from './components/keyboard/harmony'

function storeData (key: string, data: Record<string, any>) {
  window.localStorage.setItem(key, JSON.stringify(data))
}

const storedSettings = JSON.parse(window.localStorage.getItem("settings") as string)
const storedToneConfig = JSON.parse(window.localStorage.getItem("toneConfig") as string)

const storedGeneralSettings = storedSettings?.general?.items

export default Vue.extend({
  name: 'App',

  components: {
    'piano-keyboard': PianoKeyboard,
    'metronome-card': MetronomeCard,
    'tonecolor-card': ToneColorCard,
    'harmony-display': HarmonyDisplay,
  },

  data: () => ({
    drawer: null,
    settings: {
      general: {
        title: '一般',
        active: false,
        items: {
          autoKeySelect: {
            title: '調の自動選択',
            value: storedGeneralSettings?.autoKeySelect?.value || true,
            switch: true
          },
          displayCent: {
            title: 'セント値を表示',
            value: storedGeneralSettings?.displayCent?.value || false,
            switch: true
          },
          baseFrequency: {
            title: '基本周波数',
            value: storedGeneralSettings?.baseFrequency?.value || 442,
            slider: {
              min: 435,
              max: 445
            }
          },
          /*
          keyboardSize: {
            title: 'キーボードサイズ',
            value: storedGeneralSettings.keyboardSize.value || 50,
            slider: {
              min: 1,
              max: 100
            }
          },
          */
          colorTheme: {
            title: 'ダークモード',
            value: storedGeneralSettings?.colorTheme?.value || false,
            switch: true
            /*
            select: [
              'Cute',
              'Nature',
              'Cool'
            ]
            */
          },
        },
      },
      toneColor: {
        title: '音形',
        active: false,
        items: {
          attack: {
            title: 'アタック',
            value: storedSettings?.ToneColor?.items?.attack?.value || 50,
            slider: {
              min: 0,
              max: 100
            }
          },
          release: {
            title: 'リリース',
            value: storedSettings?.ToneColor?.items?.release?.value ||  50,
            slider: {
              min: 0,
              max: 100
            }
          },
        },
      },
    },
    playingMidiNoteNumbers: [],
    toneConfig: {
      waveform: storedToneConfig?.waveform || "sine",
      sustainMethod: (storedToneConfig?.sustainMethod || "momentary") as "momentary" | "exclusive" | "alternative",
      isMajor: (storedToneConfig?.isMajor != null) ? storedToneConfig?.isMajor : true,
      musicalKey: storedToneConfig?.musicalKey || "平均律",
      toneRange: storedToneConfig?.toneRange || 2,
    },
    harmony: [{
      chordName: "",
      scaleName: "",
    }]
  }),

  watch: {
    playingMidiNoteNumbers: function () {
      const matches = chordCheck(this.playingMidiNoteNumbers)
      if (matches.length > 0) {
        this.harmony = matches
        if (this.settings.general.items.autoKeySelect.value) {
          this.toneConfig.musicalKey = matches[0].scaleName
          this.toneConfig.isMajor = matches[0].isMajor
        }
      }
    },
    settings: {
      handler: function () {
        storeData("settings", this.settings)
      },
      deep: true,
    },
    toneConfig: {
      handler: function () {
        storeData("toneConfig", this.toneConfig)
      },
      deep: true,
    }
  }
});
</script>
<style scoped>
</style>
