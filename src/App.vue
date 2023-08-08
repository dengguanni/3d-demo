<template>
  <div id="app">
    <router-view/> 
     
  </div>
</template>

<script>
import Index from './views/index.vue'

export default {
  name: 'App',
  components: {
    Index
  }
}
</script>

<style >
#app{
  margin: 0px;
  padding: 0px;
  margin-top: 0px !important;
}
</style>