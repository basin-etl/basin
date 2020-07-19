import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'

@Component({
  name: 'Confirm'
})

export default class Confirm extends Vue {

  dialog= false
  resolve:Function= null
  reject:Function= null
  message= ""
  title = ""
  options =  {
      color: 'primary',
      width: 290
  }
  open (title:string, message:string, options:any={}) {
    this.dialog = true;
    this.title = title;
    this.message = message;
    this.options = Object.assign(this.options, options);
    return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    });
  }
  agree () {
    this.resolve(true);
    console.log(this.dialog);
    this.dialog = false;
  }
  cancel () {
    this.resolve(false);
    console.log(this.dialog);
    this.dialog = false;
  }
}
