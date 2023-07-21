import BaseService from "./base_service.js";
import Processor from "./processor.js";

import { reactive, ref } from "vue";

export default class Resource extends BaseService {
  // Contructor của lớp tài nguyên
  constructor(id, max) {
    super("Resource", id);
    this.max = ref(max);
    this.allocated = ref(0);
    this.requesters = reactive(new Map());
  }
  // Copy constructor
  copy() {
    let copyResource = new Resource(this.id, this.max);
    copyResource.id = this.id;
    copyResource.max = this.max;
    copyResource.allocated = this.allocated;
    copyResource.requesters = new Map(
      JSON.parse(JSON.stringify(Array.from(this.requesters)))
    );
    return copyResource;
  }
  // Hàm cấp phát tài nguyên cho tiến trình
  allocate(id, size, processor) {
    if (!(processor instanceof Processor))
      throw new Error("Processor must be instance of Processor");
    if (size < 0) throw new Error("Size must be greater than 0");

    if (this.allocated + size <= this.max) {
      this.allocated += size;
      if (!this.requesters.has(id)) {
        this.requesters.set(id, { size: size, processor: processor });
      } else {
        this.requesters.get(id).size += size;
      }
      return true;
    } else {
      return false;
    }
  }
  // Hàm giải phóng tài nguyên
  release(id, size) {
    if (size <= 0) throw new Error("Size must be greater than 0");
    if (this.requesters.has(id)) {
      if (this.allocated < size)
        throw new Error("Size must be less than allocated");
      if (this.requesters.get(id).size < size)
        throw new Error("Size must be less than requested");
      this.allocated -= size;
      this.requesters.get(id).size -= size;
      if (this.requesters.get(id).size == 0) this.requesters.delete(id);
      return true;
    }
    throw new Error("requester not found");
  }
  // Hàm giải phóng toàn bộ tài nguyên từ tiến trình
  releaseAll(id) {
    if (this.requesters.has(id)) {
      this.allocated -= this.requesters.get(id).size;
      this.requesters.delete(id);
      return true;
    }
    throw new Error("requester not found");
  }
}
