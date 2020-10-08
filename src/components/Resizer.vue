<template>
  <span class="resizer" :resizing="resizing" :style="{cursor: `${isH?'ew':'ns'}-resize`}" @mousedown="startResize"></span>
</template>

<script>
export default {
  name: "Resizer",
  props: ['orient'],
  data (){
    return {
      resizing: false
    }
  },
  computed: {
    isH (){
      return this.orient === 'h'
    }
  },
  methods: {
    startResize (e){
      this.$emit('start', this.isH?e.screenX:e.screenY);
      let vue_ = this;
      document.body.setAttribute('unselectable', '');
      function resize(e) {
        vue_.$emit('resize', vue_.isH?e.screenX:e.screenY)
      }

      function release() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', release);
        document.body.removeAttribute('unselectable');
        vue_.resizing = false;
      }

      this.resizing = true;
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', release)
    },
  }
}
</script>

<style scoped lang="scss">

</style>