<template>
  <div class="cesium">
    <!-- Empty toolbar containers - all buttons removed -->
    <div id="toolbarLeft">
    </div>
    <div id="toolbarRight">
    </div>
  </div>
</template>

<script>
export default {
  name: "Satvis",
  data() {
    return {
      showUI: true,
    };
  },
  mounted() {
    this.showUI = true;
  },
};
</script>
