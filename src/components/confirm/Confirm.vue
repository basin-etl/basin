<template lang="pug">
  v-dialog(
    v-model="dialog" :max-width="options.width" @keydown.esc="cancel")
    v-toolbar(dark :color="options.color" dense)
      v-toolbar-title.white--text {{ title }}
    v-card(tile)
      v-card-text.pt-2(v-show="!!message") {{ message }}
      v-card-actions
        v-spacer
        v-btn(color="primary darken-1" text @click.native="agree") Yes
        v-btn(color="grey" flat="flat" @click.native="cancel") Cancel
</template>
<script lang="ts" src="./Confirm.ts">
</script>