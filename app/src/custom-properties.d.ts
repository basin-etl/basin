import Vue from 'vue'
import Dexie from 'dexie';
import Confirm from './components/confirm/Confirm';

declare module 'vue/types/vue' {
  interface Vue {
    $loading: boolean
    $confirm: Confirm
    $idb: Dexie
  }
}