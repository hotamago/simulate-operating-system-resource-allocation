<script>
import DynamicProcess from "@/components/common/dynamic-process.vue";

export default {
  components: {
    DynamicProcess,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    usedResources() {
      return Object.fromEntries(this.data.resources);
    },
    lengthUsedResources() {
      return Object.keys(this.usedResources).length;
    },
  },
};
</script>

<template>
  <div class="card">
    <div class="card-header" style="font-size: 16px">
      <p class="text-danger">{{ data.id }}</p>
    </div>
    <div class="card-body">
      <ul class="list-group list-group-flush">
        <li class="list-group-item">
          <p>Assign: ({{ lengthUsedResources }}):</p>
          <ul>
            <li v-for="usedResource in usedResources" :key="usedResource.id">
              <span>
                {{ usedResource.resource.id }}: {{ usedResource.allocated }} /
                {{ usedResource.max }}
              </span>
              <DynamicProcess
                :max="usedResource.max"
                :value="usedResource.allocated"
              />
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>