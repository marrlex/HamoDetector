<template>
  <v-sheet
    class="overflow-hidden"
    style="position: relative; height: 100%"
  >
    <v-container class="fill-height">
      <v-row
        align="center"
        justify="center"
      >
        <v-btn
          color="pink"
          dark
          @click.stop="drawer = !drawer"
        >
          {{ menuName }}
        </v-btn>
      </v-row>
    </v-container>


  </v-sheet>
</template>

<script>
export default {
  data () {
    return {
      drawer: null,
      items: [
        { title: 'Home', icon: 'dashboard' },
        { title: 'About', icon: 'question_answer' }
      ]
    }
  },
  props: [
    'menuName'
  ]
}
</script>

<style scoped>
button {
    color: black;
    padding: 0.1em 0.5em;
    background: transparent;
    border-radius: 30px;
    border: 2px solid var(--active);
    box-shadow: 1px 1px 1px rgba(0,0,0,0.4);
}
</style>
