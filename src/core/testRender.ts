import {render} from './jobRenderer';
import jobContent from '../pages/demoJob'

let commands = render(jobContent)
console.log(commands.join("\n"))
