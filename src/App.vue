<template>
  <v-app>
    <v-navigation-drawer
      clipped
      app
      temporary=""
      v-model="navBar"
    >
      <v-list>
        <v-list-item 
          v-for="item in drawerItems"
          :key="item.title"
          :dark="settings.general.items.colorTheme.value"
          @click="$router.push(item.to)"
        >
          <v-list-item-icon>
            <v-icon v-text="item.icon"></v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="item.title"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      dense=""
      :dark="settings.general.items.colorTheme.value"
      app
      width="100vw"
    >
      <v-app-bar-nav-icon @click.stop="navBar = !navBar"></v-app-bar-nav-icon>
      <v-toolbar-title>アンミー</v-toolbar-title>
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

      <v-list dense :dark="settings.general.items.colorTheme.value">
        <v-subheader class="text-subtitle-1">設定</v-subheader>
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
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import '@mdi/font/css/materialdesignicons.css'
import '@/assets/fonts/css/musisync.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
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
  data: () => ({
    drawer: false,
    drawerItems: {
      harmony: {
        title: "ハーモニー",
        to: "/",
        icon: "mdi-piano"
      },
      learning: {
        title: "純正律について",
        to: "/learning",
        icon: "mdi-music-circle-outline"
      },
      about: {
        title: "このアプリについて",
        to: "/about",
        icon: "mdi-information-outline"
      }
    },
    navBar: false,
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
    analyser: undefined,
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
