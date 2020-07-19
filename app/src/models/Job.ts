import Block from "./Block";
import Link from "./Link";
export enum JobStatus {
    Stopped,
    Running,
    Completed,
}

export default class Job {
  blocks: Array<Block> = []
  links: Array<Link> = []
  container: Object = {}
}
