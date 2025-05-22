<template>
  <div class="div">
      <v-alert 
          v-for="(alert, index) in useAlert.alerts"
          :text="alert.message"
          closable
          :type="alert.type"
          class="alert"
          :key="index"
      ></v-alert>
  </div>
</template>

<script setup lang="ts">
import { useAlertStore } from "@/stores/alert";

const useAlert = useAlertStore()

</script>

<style scoped>
  .div{
     position: fixed;
     top: 3rem;
     width: 100%;
     display: flex;
     flex-direction: column;
     align-items: center;
     z-index: 3000;
  }

  .alert{
      width: fit-content;
  }
</style>