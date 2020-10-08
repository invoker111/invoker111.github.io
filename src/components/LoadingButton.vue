<template>
  <div :class="{loading: loading}" :style="{fontSize: `${size}rem`}" class="loading-button" flex>
    <svg-icon :name="loading?'loading':icon"/>
    <span>{{ text }}</span>
  </div>
</template>

<script>
export default {
  name: "LoadingButton",
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      default: 1
    }
  }
}
</script>

<style scoped lang="scss">
.loading-button {
  color: white;
  padding: 0.2em 0.8em;
  border-radius: 0.3em;
  cursor: pointer;
  transition: all .1s linear;
  background: #4a91ff;
  box-shadow: 0 0 0.4em rgba(0, 0, 0, 0.3);

  &:hover {
    background: #8c8e8d;
  }

  &.loading {
    cursor: not-allowed;
    background: #8c8e8d;
  }

  > svg {
    width: 1.6em;
    height: 1.6em;
  }

  > span {
    font-size: 0.9em;
    line-height: 0.9em;
    margin-left: 0.6em;
  }
}
</style>