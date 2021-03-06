<template>
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
        <oscilloscope :dark="settings.general.items.colorTheme.value" :analyserNode="analyser"></oscilloscope>
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
          :isVirtualKeyboardShown.sync="isVirtualKeyboardShown"
          style="max-height: 100%"
        ></metronome-card>
      </v-col>
    </v-row>

    <v-footer
      v-if="!isVirtualKeyboardShown"
      style="height: 40%; max-height: 50mm"
      padless=""
      inset
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
          :analyser.sync="analyser"
        ></piano-keyboard>
      </v-container>
    </v-footer>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import '@mdi/font/css/materialdesignicons.css'
import '@/assets/fonts/css/musisync.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import PianoKeyboard from '@/components/keyboard/Keyboard.vue'
import MetronomeCard from '@/components/MetronomeCard.vue'
import ToneColorCard from '@/components/ToneColorCard.vue'
import HarmonyDisplay from '@/components/HarmonyDisplay.vue'
import Oscilloscope from '@/components/Oscilloscope.vue'
import { chordCheck } from '@/plugins/harmony'
interface SwitchSetting {
  title: string;
  value: boolean;
  switch: boolean;
}
interface SliderSetting {
  title: string;
  value: number;
  slider: {
    min: number;
    max: number;
  };
}
interface GeneralSettings {
  title: string;
  active: boolean;
  items: {
    autoKeySelect: SwitchSetting;
    displayCent: SwitchSetting;
    baseFrequency: SliderSetting;
    colorTheme: SwitchSetting;
  };
}
interface ToneColorSettings {
  title: string;
  active: boolean;
  items: {
    attack: SliderSetting;
    release: SliderSetting;
  };
}
interface ToneConfig {
  waveform: OscillatorType;
  sustainMethod: "momentary" | "exclusive" | "alternative";
  isMajor: boolean;
  musicalKey: string;
  toneRange: number;
}


function storeData (key: string, data: GeneralSettings | ToneColorSettings | ToneConfig) {
  window.localStorage.setItem(key, JSON.stringify(data))
}

const storedGeneralSettings: GeneralSettings | undefined = JSON.parse(window.localStorage.getItem("settings") as string)
const storedToneColorSettings: ToneColorSettings | undefined = JSON.parse(window.localStorage.getItem("settings") as string)
const storedToneConfig: ToneConfig | undefined = JSON.parse(window.localStorage.getItem("toneConfig") as string)

export default Vue.extend({
  name: 'App',

  components: {
    'piano-keyboard': PianoKeyboard,
    'metronome-card': MetronomeCard,
    'tonecolor-card': ToneColorCard,
    'harmony-display': HarmonyDisplay,
    'oscilloscope': Oscilloscope,
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
            value: storedGeneralSettings?.items?.autoKeySelect?.value || true,
            switch: true
          },
          displayCent: {
            title: 'セント値を表示',
            value: storedGeneralSettings?.items?.displayCent?.value || false,
            switch: true
          },
          baseFrequency: {
            title: '基本周波数',
            value: storedGeneralSettings?.items?.baseFrequency?.value || 442,
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
            value: storedGeneralSettings?.items?.colorTheme?.value || false,
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
      } as GeneralSettings,
      toneColor: {
        title: '音形',
        active: false,
        items: {
          attack: {
            title: 'アタック',
            value: storedToneColorSettings?.items?.attack?.value || 50,
            slider: {
              min: 0,
              max: 100
            }
          },
          release: {
            title: 'リリース',
            value: storedToneColorSettings?.items?.release?.value ||  50,
            slider: {
              min: 0,
              max: 100
            }
          },
        },
      } as ToneColorSettings,
    },
    playingMidiNoteNumbers: [],
    toneConfig: {
      waveform: storedToneConfig?.waveform || "sine",
      sustainMethod: (storedToneConfig?.sustainMethod || "momentary") as "momentary" | "exclusive" | "alternative",
      isMajor: (storedToneConfig?.isMajor != null) ? storedToneConfig?.isMajor : true,
      musicalKey: storedToneConfig?.musicalKey || "平均律",
      toneRange: storedToneConfig?.toneRange || 2,
    } as ToneConfig,
    harmony: [{
      chordName: "",
      scaleName: "",
    }],
    isVirtualKeyboardShown: false,
    analyser: undefined
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
    "settings.general": {
      handler: function (setting: GeneralSettings) {
        storeData(setting.title, setting)
      },
      deep: true,
    },
    "settings.toneColor": {
      handler: function (setting: ToneColorSettings) {
        storeData(setting.title, setting)
      },
      deep: true,
    },
    toneConfig: {
      handler: function (toneConfig: ToneConfig) {
        storeData("toneConfig", toneConfig)
      },
      deep: true,
    }
  }
});
</script>
<style scoped>
</style>
