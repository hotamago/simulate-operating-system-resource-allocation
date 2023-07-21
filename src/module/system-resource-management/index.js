import Resource from "./entity/resource.js";
import Processor from "./entity/processor.js";
import { copyMapResouces } from "./common/deepcopy.js";

import { reactive, ref } from "vue";

export default class MangerResource {
  constructor(assign_resorces = []) {
    this.resources = reactive(new Map(assign_resorces));
    this.processorsRequest = reactive(new Map());
  }

  // Check format of assign_resorces
  _checkFormatResource() {
    for (let [key, value] of this.resources) {
      if (!(value instanceof Resource)) {
        throw new Error("Resource must be instance of Resource");
      }
    }
  }

  // Create a request object
  _createRequest(processor, allocateList) {
    if (!(processor instanceof Processor)) {
      throw new Error("Processor must be instance of Processor");
    }
    this._checkFormatAllocateList(allocateList);
    return {
      allocateList: allocateList,
      processor: processor,
    };
  }

  // Hàm kiểm tra trạng thái hiện tại của hệ thống là an toàn hay không
  isSafe() {
    let available = copyMapResouces(this.resources);
    let finish = [];
    let finish_prev = [];
    let safeSequence = [];
    for (let [key, value] of this.processorsRequest) {
      finish[key] = false;
      finish_prev[key] = false;
    }
    while (Object.values(finish).some((item) => !item)) {
      for (let [key, value] of this.processorsRequest) {
        if (finish[key]) continue;
        let processorRequest = value;
        let ok = true;
        for (let [key2, value2] of processorRequest.allocateList) {
          let resource = available.get(key2);
          if (value2.size + resource.allocated > resource.max) {
            ok = false;
            break;
          }
        }
        if (ok) {
          for (let [key2, value2] of processorRequest.allocateList) {
            let resource = available.get(key2);
            resource.allocate(
              processorRequest.processor.id,
              value2.size,
              processorRequest.processor
            );
            resource.releaseAll(processorRequest.processor.id);
          }
          finish[key] = true;
          safeSequence.push(
            this._createRequest(
              processorRequest.processor,
              processorRequest.allocateList
            )
          );
        }
      }
      // Check if finish change
      if (
        Object.keys(finish_prev).every(function (key) {
          return finish_prev[key] == finish[key];
        })
      ) {
        return { safe: false, safeSequence: [] };
      }
      finish_prev = { ...finish };
    }
    return { safe: true, safeSequence: safeSequence };
  }

  // Accept request
  acceptFirst() {
    let safe = this.isSafe();
    if (!safe.safe) return false;
    if (safe.safeSequence.length == 0) return false;
    let item = safe.safeSequence.pop();
    for (let [key, value] of item.allocateList) {
      let resource = this.resources.get(key);
      // resource.allocate(item.processor.id, value.size, item.processor);
      item.processor.allocate(key, value.size);
    }
    this.processorsRequest.delete(item.processor.id);
    return true;
  }

  // Accept until not safe
  acceptUntilNotSafe() {
    while (this.acceptFirst()) {}
    return true;
  }

  // Check format allocateList
  _checkFormatAllocateList(allocateList) {
    // Check allocateList is map
    if (!(allocateList instanceof Map)) {
      throw new Error("AllocateList must be instance of Map");
    }
    for (let [key, value] of allocateList) {
      // value much have format
      // { "size": 0, "resource": resource }
      if (!("size" in value)) {
        throw new Error("AllocateList must have size");
      }
      if (!("resource" in value)) {
        throw new Error("AllocateList must have resource");
      }
      if (typeof value.size != "number") {
        throw new Error("Size must be number");
      }
      if (!(value.resource instanceof Resource)) {
        throw new Error("Resource must be instance of Resource");
      }
      if (value.size < 0) {
        throw new Error("Size must be greater than 0");
      }
      if (value.size > value.resource.max) {
        throw new Error("Size must be less than resource.max");
      }
      if (!this.resources.has(key)) {
        throw new Error("Resource not found");
      }
      // check unique in allocateList (Map with resource)
      let count = 0;
      for (let [key2, item] of allocateList) {
        if (item.resource.id == value.resource.id) count++;
      }
      if (count > 1) {
        throw new Error("AllocateList must be unique");
      }
    }
  }

  // Add new processor
  addProcessorRequest(processor, allocateList) {
    if (!(processor instanceof Processor)) {
      throw new Error("Processor must be instance of Processor");
    }
    this._checkFormatAllocateList(allocateList);

    let typeHis = 0;
    if (this.processorsRequest.has(processor.id)) {
      let processorsRequestTemp = this.processorsRequest.get(processor.id);
      for (let [key, value] of allocateList) {
        if (processorsRequestTemp.allocateList.has(key)) {
          processorsRequestTemp.allocateList.get(key).size += value.size;
        } else {
          processorsRequestTemp.allocateList.set(key, value);
        }
      }
    } else {
      typeHis = 1;
      this.processorsRequest.set(
        processor.id,
        this._createRequest(processor, allocateList)
      );
    }
    // console.log(this.processorsRequest);
    if (!this.isSafe().safe) {
      if (typeHis == 1) {
        this.processorsRequest.delete(processor.id);
      } else {
        let processorsRequestTemp = this.processorsRequest.get(processor.id);
        for (let [key, value] of allocateList) {
          processorsRequestTemp.allocateList.get(key).size -= value.size;
        }
      }
      return false;
    }
    return true;
  }

  // Remove processor
  removeProcessorRequest(processor) {
    if (!(processor instanceof Processor))
      throw new Error("Processor must be instance of Processor");
    if (this.processorsRequest.has(processor.id)) {
      this.processorsRequest.delete(processor.id);
      return true;
    }
    return false;
  }

  // Get resource
  getResource(id) {
    if (this.resources.has(id)) {
      return this.resources.get(id);
    }
    return null;
  }
}
