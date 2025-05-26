<template>
  <v-container>
    <h1>Produtos</h1>

    <v-row>
      <v-col 
        cols="12" 
        sm="6" 
        md="4"
        v-for="product in products" 
        :key="product.id"
      >
        <v-card 
          class="pa-2 vcard" 
          elevation="5"
        >
          <v-img
            width="100%"
            cover
            :src="product.image"
            rounded
          ></v-img>

          <p>{{ product.name }}</p>

          <h2>R$ {{ product.price }}</h2>

          <v-card-actions class="pl-0 d-flex justify-end">
            <v-btn 
              color="#56105f" 
              variant="tonal"
              @click="router.push('/payment')"
            >
              Comprar Agora
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
  const router = useRouter()
  const products = ref([
    {
      id: 1,
      name: "Teclado Gamer",
      price: 199.99,
      image: "src/assets/teclado.jpeg"
    },
    {
      id: 2,
      name: "Mouse Gamer",
      price: 139.99,
      image: "src/assets/mouse.jpeg"
    },
    {
      id: 3,
      name: "Monitor Gamer",
      price: 579.99,
      image: "src/assets/monitor.jpeg"
    },
    {
      id: 4,
      name: "HeadSet Gamer",
      price: 139.99,
      image: "src/assets/headset.jpeg"
    }
  ])
</script>

<style scoped>
@import "@/styles/home.page.css";
</style>
