<template>
  <div class="backg">
    <button v-for="item in btnInfo" :key="item.label" @click="goPlace(item)" class="btn">{{
        item.label
    }}</button>
  </div>
</template>

<script >
import { reactive } from 'vue'
import { useRouter  } from 'vue-router'
// import HelloWorld from './components/HelloWorld.vue'
export default {
  name: 'Index',
  components: {
    // HelloWorld
  },
  setup() {
    const router = useRouter()
    const btnInfo = reactive([
      {
        label: '烟草模型查看',
        type: 0
      },
      {
        label: '智慧园',
        type: 1
      }
    ])
    const goPlace = (item) => {
      if (item.type === 0) {
        router.push({ path: '/modelviewing' })
      } else {
        router.push({path: '/wisdompark'})
      }
    }
    return {
      btnInfo,
      goPlace,
    }
  }
}
</script>
<style scoped>
.backg {
  width: 100%;
  height: 90vh;
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn {
  height: 70px;
  width: 200px;
  margin: 50px;
  background-color: aqua;
  font-weight: 500;
  cursor: pointer; 
}
</style>
