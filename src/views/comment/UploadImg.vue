<template>
  <div class="upload-image" is-dialog>
    <div class="inner">
      <input ref="input" @change="inputImage" type="file" accept="image/*"/>
    </div>
  </div>
</template>

<script>
export default {
  name: "UploadImg",
  data() {
    return {}
  },
  methods: {
    inputImage() {
      let files = this.$refs.input.files;
      for (let file = files[0]; file.size / 1024 ** 2 < 5;) {

      }
    }
  }
}
</script>

<style scoped lang="scss">
.upload-image{
  > .inner{
  }
}
</style>