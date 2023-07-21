<script>
export default {};
</script>

<style>
</style>

<template>
  <div
    class="row mt-3"
    style="
      height: 25em;
      scroll-behavior: smooth;
      scroll-snap-type: y mandatory;
      scroll-snap-points-y: repeat(100%);
      overflow-y: scroll;
    "
  >
    <slot></slot>
  </div>
</template>