import Vue from 'vue'
import Dexie from 'dexie';
import Confirm from './components/confirm/Confirm';
import Prompt from './components/prompt/Prompt';

declare module 'vue/types/vue' {
  interface Vue {
    $loading: boolean
    $confirm: Confirm
    $prompt: Prompt
    $idb: Dexie
  }
}