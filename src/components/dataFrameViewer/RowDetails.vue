<template lang="pug">
v-card.flex-column.d-flex.height-100
    v-card-title
        div Row details
        v-spacer
        v-btn(icon,@click="closeDialog")
            v-icon close
    v-card-text.flex-grow-1(:style="{'min-height':'0px'}")
        v-data-table.height-100(
            :headers="headers",
            :items="items",
            dense,
            disable-filtering,
            hide-default-footer,
            :disable-pagination="true",
            fixed-header,
            height="100%"
            class="elevation-0"
        )
  
</template>

<script>
import Vue from 'vue'
import Component from 'vue-class-component'
@Component({
    name: 'RowDetails',
    props: {
        row: Object,
    },
})
export default class RowDetails extends Vue {
    headers= [
        {
            text:'column',
            value:'key'
        },
        {
            text: 'value',
            value:'value'
        }
    ]
    get items() {
        // convert object to array for datatable
        return Object.keys(this.row).map( (key) => {
            return {
                "key": key,
                "value": this.row[key]
            }
        });
    }
    closeDialog() {
        this.$emit("close")
    }
}
</script>
