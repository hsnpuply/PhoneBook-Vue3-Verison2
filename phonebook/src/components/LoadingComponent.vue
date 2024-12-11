<script setup>
import {onBeforeMount, ref } from 'vue'
const loadingState = ref(true)
import Loading from 'vue-loading-overlay';


onBeforeMount(()=>{
    setTimeout(()=>{
        loadingState.value = false
    },3200)
})


</script>
<template>
        <loading v-model:active="loadingState"
                 :can-cancel="true"
                 :on-cancel="onCancel"
                 is-full-page="true"/>
</template>
<style scoped>
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.spinner {
  border: 16px solid #f3f3f3; /* Light grey */
  border-top: 16px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 120px;
  height: 120px;
  animation: spin 1.7s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>