<template lang="pug">
v-dialog(v-model='dialog', :max-width='options.width', @keydown.esc='cancel()')
  v-toolbar(dark='', :color='options.color', dense='')
    v-toolbar-title.white--text {{ title }}
  v-card(tile='')
    v-card-text
      v-text-field(v-model="value")
    v-card-actions
      v-spacer
      v-btn(color='primary darken-1', text, @click.native='save()') OK
      v-btn(color='grey', text, @click.native='cancel()') Cancel
</template>

<script>
  export default {
    data () {
      return {
        dialog: false,
        resolve: null,
        reject: null,
        value: '',
        title: null,
        hintText: '',
        options: {
          color: 'primary',
          width: 290
        }
      };
    },
    methods: {
      open (title, defaultValue, hintText, options) {
        this.dialog = true;
        this.title = title;
        if (defaultValue) this.value = defaultValue;
        this.options = Object.assign(this.options, options);
        return new Promise((resolve, reject) => {
          this.resolve = resolve;
          this.reject = reject;
        });
      },
      save () {
        this.resolve(this.value);
        this.dialog = false;
      },
      cancel () {
        this.resolve(false);
        this.dialog = false;
      }
    }
  }
</script>
