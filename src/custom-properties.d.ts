import Vue from 'vue'
import Confirm from './components/confirm/Confirm';

declare module 'vue/types/vue' {
  interface Vue {
    $loading: boolean
    $confirm: Confirm
  }
}