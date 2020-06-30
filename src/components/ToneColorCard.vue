<template>
  <v-card :dark="dark" class="overflow-y-auto">
    <v-container fluid>
    <v-row style="width; 98%" justify="space-around" align="center" align-content="center" dense="">
      <v-col cols=4 class="text-center">
        <span>音色</span>
        <v-divider
          inset
          vertical
        ></v-divider>
      </v-col>
      <v-col cols=8>
        <v-select
          :items="waveforms.select"
          item-text="text"
          item-value="waveform"
          :value="waveform"
          @change="$emit('update:waveform',  $event)"
          dense
          hide-details
          class="mb-2"
          :dark="dark"
        ></v-select>
      </v-col>
    </v-row>
    <v-row  style="width; 98%" justify="space-around" align="center" align-content="center" dense>
      <v-col cols=4 class="text-center">
        <span>音域</span>
        <v-divider
          inset
          vertical
        ></v-divider>
      </v-col>
      <v-col cols=8>
        <v-slider
          :value="toneRange"
          @change="$emit('update:toneRange', $event)"
          min="0"
          max="3"
          step="1"
          ticks="always"
          :tick-labels="toneRanges.items"
          tick-size="4"
          color="primary lighten-3"
          thumb-color="primary"
        ></v-slider>
      </v-col>
    </v-row>
    <v-row  style="width; 98%" justify="space-around" align="center" align-content="center" dense>
      <v-col cols=4 class="text-center">
        <span>持続</span>
        <v-divider
          inset
          vertical
        ></v-divider>
      </v-col>
      <v-col cols=8>
        <v-chip-group mandatory="" :value="sustainMethod" >
        <v-chip
            v-for="(text, key) in sustainMethods.items"
            :key="key"
            :value="key"
            @click="$emit('update:sustainMethod', key)"
            active-class="primary--text"
          >{{ text }}</v-chip>
        </v-chip-group>
      </v-col>
    </v-row>
    <v-row  style="width; 98%" justify="space-around" align="center" align-content="center" dense>
      <v-col cols=4 class="text-center">
        <span>調</span>
        <v-divider
          inset
          vertical
        ></v-divider>
      </v-col>
      <v-col cols=8>
        <v-select
          :items="scale.musicalKey.items"
          :value="musicalKey"
          @change="$emit('update:musicalKey',  $event)"
          dense
          hide-details
          class="mb-2"
          :dark="dark"
        ></v-select>
        <v-chip-group mandatory="" :value="isMajor">
        <v-chip
            v-for="scaleName in scale.scale.items"
            :key="scaleName.title"
            :value="scaleName.value"
            @click="$emit('update:isMajor', scaleName.value)"
            active-class="primary--text"
          >{{ scaleName.title }}</v-chip>
        </v-chip-group>
      </v-col>
    </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
  props: {
    waveform: String,
    sustainMethod: String,
    toneRange: Number,
    isMajor: Boolean,
    musicalKey: String,
    dark: Boolean
  },
  data: () => ({
    waveforms: {
      title: '波形',
      select: [
        {waveform: "sine", text: '正弦波'},
        {waveform: "square", text: '方形波'},
        {waveform: "triangle", text: '三角波'},
        {waveform: "sawtooth", text: '鋸波'}
      ]
    },
    sustainMethods: {
      value: 'momentary',
      items: {
        momentary: '瞬時',
        exclusive: '排他',
        alternative: '交互'
      }
    },
    scale: {
      title: '調',
      musicalKey: {
        items: ['平均律', 'A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab']
      },
      scale: {
        items: {
          major: {
            title: '長調',
            value: true,
          },
          minor: {
            title: '短調',
            value: false,
          },
        }
      }
    },
    toneRanges: {
      value: 2,
      items: ["低1", "低2", "中", "高"]
    }
  })
}
</script>

<style>

</style>