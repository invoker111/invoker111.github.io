<template>
  <div id="app">
    <the-index/>
  </div>
</template>

<script>
import TheIndex from '@/views/index';
import '@/assets/style/source-code-pro.css'
import '@/assets/style/write-font.css'

export default {
  name: 'App',
  components: {TheIndex},
}
</script>

<style lang="scss">
@import "src/assets/style/public";
html, body{
  width: 100%;
  height: 100%;
  font-size: 16px;
  @include media{
    font-size: 14px;
  }
  &[unselectable]{
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    -ms-user-select: none;
  }
}
#app{
  width: 100%;
  height: 100%;
}
* {
  margin: 0;
  padding: 0;
}

*[flex] {
  display: flex;
  align-items: center;
}

*[is-dialog] {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: $z-index-dialog;
  background: rgba(0, 0, 0, 0.4);
  justify-content: space-around;

  &, > .inner {
    display: flex;
    align-items: center;
  }

  > .inner {
      background: white;
      border-radius: 1rem;
      flex-direction: column;
      box-shadow: 0 0 1.5rem rgba(0, 0, 0, 0.4);
      border: 1px solid #939393;
  }
}
*[write-font]{
  font-family: "write-font", serif;
}

input, textarea, select, button {
  outline: none;
  resize: none;
  font-family: "Source Code Pro", serif;
}
table{
  border-collapse: collapse;
  box-shadow: 0 0 0.4rem rgba(0, 0, 0, 0.3);
  tr{
    td{

    }
  }
  thead{
    background: #2b2b2b;
    border-bottom: 2px solid #9f9f9f;
    td, th{
      padding: 0.5rem 0;
      color: white;
      font-size: 1.06rem;
      text-align: center;
      &:not(:last-of-type){
        border-right: 1px solid #d2d2d2;
      }
    }
  }
  tbody{
    tr{
      &:not(:last-of-type){
        border-bottom: 1px solid #d2d2d2;
      }
      background: white;
      &:nth-child(even){
        background: #f5f5f5;
      }
      &:hover{
          background: #ebfffc;
      }
      td{
        padding: 0.4rem 0;
        &:not(:last-of-type){
          border-right: 1px solid #d2d2d2;
        }
      }
    }
  }
}
::-webkit-scrollbar{
    width: 0.66rem;
    height: 0.66rem;
}
::-webkit-scrollbar-corner,
::-webkit-scrollbar-button{
    display: none;
}
::-webkit-scrollbar-thumb{
    border-radius: 0.6rem;
    background: #404040;
    border: 1px solid #828282;
}
::-webkit-scrollbar-thumb:hover{
    background: #323232
}
::-webkit-scrollbar-track{
    border-radius: 0.6rem;
    background: transparent;
}
@include media{
  ::-webkit-scrollbar{
    width: 0;
  }
}
</style>
