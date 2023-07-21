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
    requesters() {
      return Object.fromEntries(this.data.requesters);
    },
    lengthRequesters() {
      return Object.keys(this.requesters).length;
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
          <ul>
            <li>Max: {{ data.max }}</li>
            <li>Allocated: {{ data.allocated }}</li>
            <li>
              Status: <DynamicProcess :max="data.max" :value="data.allocated" />
            </li>
          </ul>
        </li>
        <li class="list-group-item">
          <p>Requesters ({{ lengthRequesters }}):</p>
          <ul>
            <li v-for="(requester, key) in requesters" :key="key">
              {{ key }} : {{ requester.size }}
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
</style>