import Vue from 'vue'
import Dexie from 'dexie';

declare module 'vue/types/vue' {
  interface Vue {
    $idb: Dexie
  }
}