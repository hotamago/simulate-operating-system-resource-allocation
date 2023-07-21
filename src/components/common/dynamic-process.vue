<script>
export default {
  props: {
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 1,
    },
    value: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    valuePercent() {
      return Number(((this.value / this.max) * 100).toFixed(1)) + "%";
    },
  },
};
</script>
<template>
  <div class="progress">
    <div
      class="progress-bar"
      role="progressbar"
      :style="{
        width: valuePercent,
      }"
      :aria-valuenow="value"
      :aria-valuemin="min"
      :aria-valuemax="max"
    >
      {{ valuePercent }}
    </div>
  </div>
</template>