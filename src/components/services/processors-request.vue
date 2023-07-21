<script>
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    allocateList() {
      return Object.fromEntries(this.data.allocateList);
    },
    sizeAllocateList() {
      return this.data.allocateList.size;
    },
  },
};
</script>

<template>
  <div class="card">
    <div class="card-header" style="font-size: 16px">
      <p class="text-danger">{{ data.processor.id }}</p>
    </div>
    <div class="card-body">
      <ul class="list-group list-group-flush">
        <li class="list-group-item">
          <p>Allocate: ({{ sizeAllocateList }}):</p>
          <ul>
            <li
              v-for="allocateRequest in allocateList"
              :key="allocateRequest.resource.id"
            >
              {{ allocateRequest.resource.id }}: {{ allocateRequest.size }}
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>