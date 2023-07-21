import Resource from "./resource.js";
import Processor from "./processor.js";

import { reactive, ref } from "vue";

export default class UsedResource {
  // Contructor của lớp tài nguyên
  constructor(processor, resource, max) {
    if (!(processor instanceof Processor))
      throw new Error("Processor must be instance of Processor");
    if (!(resource instanceof Resource))
      throw new Error("Resource must be instance of Resource");

    this.processor = reactive(processor);
    this.resource = reactive(resource);
    this.id = ref(this.processor.id + "__" + this.resource.id);
    this.max = ref(max);
    this.allocated = ref(0);

    if (resource.max < max)
      throw new Error("Max must be less than resource.max");
  }
  allocate(size) {
    if (this.allocated + size <= this.max) {
      let ok = this.resource.allocate(this.processor.id, size, this.processor);
      if (ok) this.allocated += size;
      return ok;
    } else {
      return false;
    }
  }
  release(size) {
    if (size <= 0) throw new Error("Size must be greater than 0");
    if (size > this.allocated)
      throw new Error("Size must be less than allocated");
    let ok = this.resource.release(this.processor.id, size);
    if (ok) this.allocated -= size;
    return ok;
  }
  releaseAll() {
    return this.release(this.allocated);
  }
}
