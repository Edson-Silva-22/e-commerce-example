<template>
  <v-container class="d-flex flex-column justify-center align-center">
    <v-card class="d-flex flex-column justify-center align-center ga-5 pa-2" max-width="500">
      <v-icon icon="mdi-handshake" size="64" color="#56105f"></v-icon>
      <h1>Agradecemos por sua compra</h1>
      <h3 class="text-center">Continue navegando e aproveite nossos produtos e descontos.</h3>
      <v-card-actions>
        <v-btn color="#56105f" variant="tonal" @click="router.push('/')">Continuar</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

  const router = useRouter();
</script>