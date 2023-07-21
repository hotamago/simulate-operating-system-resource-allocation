import BaseService from "./base_service.js";
import UsedResource from "./used-resource.js";
import Resource from "@/module/system-resource-management/entity/resource.js";
import MangerResources from "@/module/system-resource-management/index.js";

import { reactive, ref } from "vue";

export default class Processor extends BaseService {
  // Format assign_resorces:
  // [
  //   ["Key", [resource, max_size]], or ["Key", max_size]
  //   ...
  // ]
  constructor(id, assign_resorces = [], mangerResource = null) {
    super("Processor", id);
    if (mangerResource != null && mangerResource instanceof MangerResources) {
      for (let index = 0; index < assign_resorces.length; index++) {
        const element = assign_resorces[index];
        if (element.length == 2) {
          assign_resorces[index] = [
            element[0],
            [mangerResource.getResource(element[0]), element[1]],
          ];
        }
      }
    }
    this.resources = reactive(new Map(assign_resorces));
    this._checkFormatResource();
    this._rebuild();
  }
  // Check format of assign_resorces
  _checkFormatResource() {
    for (let [key, value] of this.resources) {
      if (!Array.isArray(value)) {
        throw new Error("Resource must be instance of Array");
      }
      if (value.length != 2) {
        throw new Error("Resource must have 2 elements");
      }
      if (!(value[0] instanceof Resource)) {
        throw new Error("Resource must be instance of Resource");
      }
      if (typeof value[1] != "number") {
        throw new Error("Max must be number");
      }
    }
  }
  // Rebuild assign_resorces
  _rebuild() {
    for (let [key, value] of this.resources) {
      this.resources.set(key, new UsedResource(this, value[0], value[1]));
    }
  }
  // Hàm lưu lại trạng thái cấp phát tài nguyên cho tiến trình
  allocate(id, size) {
    if (this.resources.has(id)) {
      return this.resources.get(id).allocate(size);
    }
    throw new Error("Resource not found");
  }
  allocates(list) {
    let ok = [];
    for (let [key, value] of list) {
      ok.push(this.allocate(key, value));
    }
    return ok.every((item) => item);
  }
  // Hàm lưu lại trạng thái giải phóng tài nguyên cho tiến trình
  release(id, size) {
    if (this.resources.has(id)) {
      return this.resources.get(id).release(size);
    }
    throw new Error("Resource not found");
  }
  releaseAll() {
    let ok = [];
    for (let [key, value] of this.resources) {
      ok.push(value.releaseAll());
    }
    return ok.every((item) => item);
  }
}
