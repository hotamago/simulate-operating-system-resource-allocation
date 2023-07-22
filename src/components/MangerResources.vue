<script>
import Resource from "./services/resource.vue";
import ScrollDiv from "./common/scroll-div.vue";
import Processer from "./services/processor.vue";
import ProcessorsRequest from "./services/processors-request.vue";

import ModuleMangerResources from "@/module/system-resource-management/index.js";
import ModuleResource from "@/module/system-resource-management/entity/resource.js";
import ModuleProcessor from "@/module/system-resource-management/entity/processor.js";
import ModuleUsedResource from "@/module/system-resource-management/entity/used-resource.js";

import { getRndInteger, getRndIntegerInclude } from "@/module/utils/random.js";

import { reactive, ref } from "vue";

const moduleMangerResources = reactive(
  new ModuleMangerResources([
    ["camera", reactive(new ModuleResource("camera", 2))],
    ["microphone", reactive(new ModuleResource("microphone", 1))],
    ["speaker", reactive(new ModuleResource("speaker", 3))],
    ["screen", reactive(new ModuleResource("screen", 1))],
    ["cpu", reactive(new ModuleResource("cpu", 8))],
    ["gpu", reactive(new ModuleResource("gpu", 4))],
    ["tensor", reactive(new ModuleResource("tensor", 2))],
    ["memory", reactive(new ModuleResource("memory", 20))],
    ["disk", reactive(new ModuleResource("disk", 5))],
    ["network", reactive(new ModuleResource("network", 10))],
  ])
);

export default {
  components: {
    Resource,
    ScrollDiv,
    Processer,
    ProcessorsRequest,
  },
  data() {
    return {
      processors: {
        system: reactive(
          new ModuleProcessor(
            "System",
            [
              ["cpu", 2],
              ["gpu", 1],
              ["memory", 10],
              ["disk", 5],
              ["screen", 1],
              ["network", 2],
            ],
            moduleMangerResources
          )
        ),
        skyrim: reactive(
          new ModuleProcessor(
            "Skyrim",
            [
              ["cpu", 8],
              ["gpu", 4],
              ["memory", 15],
              ["disk", 3],
              ["tensor", 1],
            ],
            moduleMangerResources
          )
        ),
        minecraft: reactive(
          new ModuleProcessor(
            "Minecraft",
            [
              ["cpu", 6],
              ["gpu", 2],
              ["memory", 10],
              ["disk", 2],
            ],
            moduleMangerResources
          )
        ),
        chrome: reactive(
          new ModuleProcessor(
            "Chrome",
            [
              ["cpu", 2],
              ["gpu", 1],
              ["memory", 20],
              ["disk", 1],
              ["network", 10],
            ],
            moduleMangerResources
          )
        ),
        teams: reactive(
          new ModuleProcessor(
            "Teams",
            [
              ["cpu", 2],
              ["gpu", 1],
              ["memory", 5],
              ["disk", 3],
              ["network", 10],
              ["camera", 1],
              ["microphone", 1],
              ["speaker", 3],
            ],
            moduleMangerResources
          )
        ),
      },
      warningContentDisplay: "",
      warningContent: {
        default: "Error!",
      },
      simulateLoop: null,
      cachePathResource: [],
    };
  },
  computed: {
    resources() {
      return Object.fromEntries(moduleMangerResources.resources);
    },
    processorsRequest() {
      return Object.fromEntries(moduleMangerResources.processorsRequest);
    },
    lengthProcessorsRequest() {
      return Object.keys(
        Object.fromEntries(moduleMangerResources.processorsRequest)
      ).length;
    },
    pathSafeResources() {
      let safe = moduleMangerResources.isSafe();
      if (safe.safe) this.cachePathResource = safe.safeSequence;
      return this.cachePathResource.reverse();
    },
    pathSafeResourcesText() {
      let safeSequence = this.pathSafeResources;
      let text = "";
      for (let i = 0; i < safeSequence.length; i++) {
        text += safeSequence[i].processor.id;
        if (i != safeSequence.length - 1) {
          text += " -> ";
        }
      }
      return text;
    },
    isSafeResources() {
      let safe = moduleMangerResources.isSafe();
      return safe.safe;
    },
    isSafeResourcesStyle() {
      return this.isSafeResources == true ? "bg-success" : "bg-danger";
    },
    isSafeResourcesText() {
      return this.isSafeResources == true ? "OK" : "Waiting";
    },
    isWarning() {
      return this.warningContentDisplay != "";
    },
  },
  methods: {
    warningClick: function (content, fun) {
      let ok = fun();
      if (!ok) {
        this.warningContentDisplay = content;
      } else {
        this.warningContentDisplay = "";
      }
    },
    warningDefultClick: function (fun) {
      this.warningClick(this.warningContent.default, fun);
    },

    oneClickRandom: function () {
      let ok = [this.releaseRandom(), this.allocateRandom()];
      return ok.every((v) => v);
    },
    allocateRandom: function () {
      let processor = this._getRandomProcessor();
      let allocation = this._getRandomAllocation(processor);
      let ok = [
        moduleMangerResources.addProcessorRequest(processor, allocation),
      ];

      return ok.every((v) => v);
    },
    releaseRandom: function () {
      let processor = this._getRandomProcessor();
      let ok = [this._relsaseRandom(processor)];

      return ok.every((v) => v);
    },

    oneClickRandomAll: function () {
      let ok = [this.releaseRandomAll(), this.allocateRandomAll()];

      return ok.every((v) => v);
    },
    allocateRandomAll: function () {
      let ok = [];

      for (let processor of Object.values(this.processors)) {
        let allocation = this._getRandomAllocation(processor);
        ok.push(
          moduleMangerResources.addProcessorRequest(processor, allocation)
        );
      }

      return ok.every((v) => v);
    },
    releaseRandomAll: function () {
      let ok = [];

      for (let processor of Object.values(this.processors)) {
        ok.push(this._relsaseRandom(processor));
      }

      return ok.every((v) => v);
    },

    popSafeResources() {
      this.cachePathResource.pop();
    },
    acceptFirst: function () {
      let ok = [moduleMangerResources.acceptFirst()];
      if (ok.every((v) => v)) this.popSafeResources();
      return ok.every((v) => v);
    },
    acceptUntilNotSafe: function () {
      let ok = [];
      while (1) {
        ok.push(moduleMangerResources.acceptFirst());
        if (ok[ok.length - 1] == false) {
          ok.pop();
          break;
        }
      }
      return ok.every((v) => v);
    },
    loopRandomDelay: function (fun, minDelay, maxDelay) {
      let delay = getRndIntegerInclude(minDelay, maxDelay);
      setTimeout(() => {
        fun();
        this.loopRandomDelay(fun, minDelay, maxDelay);
      }, delay);
      return true;
    },
    simulate: function () {
      this.simulateLoop = [
        this.loopRandomDelay(this.allocateRandom, 500, 2000),
        this.loopRandomDelay(this.releaseRandom, 200, 10000),
        this.loopRandomDelay(this.acceptUntilNotSafe, 1000, 5000),
      ];

      return true;
    },

    _getRandomProcessor: function () {
      return this.processors[
        Object.keys(this.processors)[
          getRndInteger(0, Object.keys(this.processors).length)
        ]
      ];
    },
    _relsaseRandom: function (processor) {
      let ok = [];
      for (let [key, resourceUsed] of processor.resources) {
        let size = getRndIntegerInclude(0, resourceUsed.allocated);
        if (size > 0) {
          ok.push(processor.release(key, size));
        }
      }

      return ok.every((v) => v);
    },
    _getRandomAllocation: function (processor) {
      let allocation = new Map();
      for (let [resourceId, resource] of processor.resources) {
        let size = getRndIntegerInclude(0, resource.max - resource.allocated);
        if (size > 0) {
          allocation.set(resourceId, {
            size: size,
            resource: resource.resource,
          });
        }
      }
      return allocation;
    },
  },
};
</script>
<template>
  <div class="container">
    <div class="row mt-4">
      <div class="col">
        <button
          type="button"
          class="btn btn-primary m-2"
          @click="warningDefultClick(oneClickRandom)"
        >
          1 Click random
        </button>
        <button
          type="button"
          class="btn btn-primary m-2"
          @click="warningDefultClick(allocateRandom)"
        >
          Allocate random
        </button>
        <button
          type="button"
          class="btn btn-primary m-2"
          @click="warningDefultClick(releaseRandom)"
        >
          Release random
        </button>
      </div>
      <div class="col">
        <button
          type="button"
          class="btn btn-primary m-2"
          @click="warningDefultClick(oneClickRandomAll)"
        >
          1 Click random all
        </button>
        <button
          type="button"
          class="btn btn-primary m-2"
          @click="warningDefultClick(allocateRandomAll)"
        >
          Allocate random all
        </button>
        <button
          type="button"
          class="btn btn-primary m-2"
          @click="warningDefultClick(releaseRandomAll)"
        >
          Release random all
        </button>
      </div>
      <div class="col">
        <button
          type="button"
          class="btn btn-success m-2"
          @click="warningDefultClick(acceptFirst)"
        >
          Accept first
        </button>
        <button
          type="button"
          class="btn btn-warning m-2"
          @click="warningDefultClick(acceptUntilNotSafe)"
        >
          Accept until not safe
        </button>
        <button
          type="button"
          class="btn btn-primary m-2"
          @click="warningDefultClick(simulate)"
        >
          Simulate
        </button>
      </div>
    </div>

    <div class="row mt-1">
      <div class="col">
        <div class="alert alert-danger" role="alert" v-show="isWarning">
          {{ warningContentDisplay }}
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col">
        <h1>
          Queue requests ({{ lengthProcessorsRequest }})
          <span class="badge" :class="[isSafeResourcesStyle]">{{
            isSafeResourcesText
          }}</span>
        </h1>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col">
        <p>Safe Sequence: {{ pathSafeResourcesText }}</p>
      </div>
    </div>

    <ScrollDiv>
      <div
        class="col-lg-4 col-mb-6 col-sm-12 mt-2"
        v-for="request in pathSafeResources"
        :key="request.id"
        v-show="isSafeResources"
      >
        <ProcessorsRequest :data="request" />
      </div>
      <div
        class="col-lg-4 col-mb-6 col-sm-12 mt-2"
        v-for="request in processorsRequest"
        :key="request.id"
        v-show="!isSafeResources"
      >
        <ProcessorsRequest :data="request" />
      </div>
    </ScrollDiv>

    <div class="row mt-4">
      <div class="col">
        <h1>Manager Resources</h1>
      </div>
    </div>
    <ScrollDiv>
      <div
        class="col-lg-4 col-mb-6 col-sm-12 mt-2"
        v-for="resource in resources"
        :key="resource.id"
      >
        <Resource :data="resource" />
      </div>
    </ScrollDiv>

    <div class="row mt-4">
      <div class="col">
        <h1>Manager Programs</h1>
      </div>
    </div>
    <ScrollDiv>
      <div
        class="col-lg-4 col-mb-6 col-sm-12 mt-2"
        v-for="processor in processors"
        :key="processor.id"
      >
        <Processer :data="processor" />
      </div>
    </ScrollDiv>
  </div>
</template>