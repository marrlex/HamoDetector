<template lang="pug">
  v-container
    router-view
</template>


<script>
import Vue from 'vue'
import VueKatex from 'vue-katex'
import 'katex/dist/katex.min.css'

export default {}
Vue.use(VueKatex, {
  globalOptions: {
    delimiters: [
      {left: "$$", right: "$$", display: true},
      {left: "\\[", right: "\\]", display: true},
      {left: "$", right: "$", display: false},
      {left: "\\(", right: "\\)", display: false},
    ]
  }
})
</script>
