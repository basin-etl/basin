import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch, Ref } from 'vue-property-decorator'
import Confirm from '@/components/confirm/Confirm.vue'
import Prompt from '@/components/prompt.vue'
import InlineSvg from 'vue-inline-svg';

@Component({
    name: 'App',
    components: {
        Confirm,
        Prompt,
        InlineSvg
    },
})
export default class App extends Vue {
    
    drawer = false
    mounted() {
        this.$root.$confirm = <any>this.$refs.confirm;
        this.$root.$prompt = <any>this.$refs.prompt;
    
        // cleanup active kernel
        window.addEventListener('beforeunload', () => {
          this.$store.dispatch('job/destroy')
        }, false)
    }
    beforeDestroy() {
        // cleanup active kernel
        this.$store.dispatch('job/destroy')
    }
    async created() {
        // initialize kernel
        this.$store.dispatch('job/initialize')
    }
    get connectionStatus() {
        return this.$store.state.job.connectionStatus
    }
    get kernelStatus() {
        return this.$store.state.job.kernelStatus
    }
    
}
    