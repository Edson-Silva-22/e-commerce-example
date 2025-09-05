<template>
  <v-container fluid height="100%" width="100vw">
    <div class="w-full my-10 d-flex justify-center">
      <v-text-field
        max-width="300px"
        height="54"
        name="search"
        placeholder="Buscar"
        variant="solo"
        bg-color="foregroud"
        append-inner-icon="mdi-magnify"
        type="text"
        clearable
      ></v-text-field>
    </div>

    <v-sheet 
      color="background" 
      class="w-full mx-auto" 
      max-width="1270px"
    >
      <div class="d-flex justify-space-between w-full">
        <h2>Categorias</h2>

        <v-btn 
          color="primary" 
          class="text-none text-subtitle-1"
          variant="tonal"
        >Ver Todas</v-btn>
      </div>

      <v-sheet class="w-full my-10 mx-auto" color="background">
        <v-slide-group
          :show-arrows="display.width.value < 600 ? false : true"
          prev-icon="mdi-arrow-left-drop-circle"
          next-icon="mdi-arrow-right-drop-circle"
          center-active
        >
          <v-slide-group-item
            v-for="(category, index) in categories"
            :key="index"
            v-slot="{ isSelected, toggle }"
          >
            <v-card 
              class="pa-3 mx-2 d-flex flex-column  align-center" 
              width="100px"
              height="150px"
              :color="isSelected ? 'primary' : 'foregroud'"
              rounded 
              @click="toggle"
            >
              <v-avatar size="58">
                <v-img v-if="category.image" :src="category.image" alt="avatar"/>
              </v-avatar>
              <p class="mt-2 text-center">{{ category.title }}</p>
            </v-card>
          </v-slide-group-item>        
        </v-slide-group>
      </v-sheet>

      <h2>Encontre o que procura</h2>
      <v-sheet class="w-full my-10 mx-auto" color="background" max-width="1270px">
        <v-row>
          <v-col v-for="value in [1,2,3,4,5,6,7,8]" xs="12" sm="4" md="3" lg="2">
            <v-card 
              
              color="foregroud"
              @click=""
            >
              <v-img 
                src="https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg" 
                alt="produto"
                width="100%"
              ></v-img>
              <v-card-title>R$ 99,99</v-card-title>
              <v-card-subtitle class="mb-2">Mouse Gamer 15000 DPI, Lorem, ipsum dolor sit amet consectetur adipisicing elit. Delectus neque dolorem iure vero accusantium, asperiores nihil deserunt quasi. Voluptatum, dolores! Repellat magnam officiis maxime saepe dignissimos corporis quae nobis eum.</v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>
      </v-sheet>
    </v-sheet>
  </v-container>
</template>

<script lang="ts" setup>
import { useDisplay } from 'vuetify';

  const display = useDisplay()
  const categories = ref([
    {
      title: "Esporte",
      image: "https://cdn.vuetifyjs.com/images/john.jpg",
    },
    {
      title: "Educação",
      image: "https://cdn.vuetifyjs.com/images/john.jpg",
    },
    {
      title: "Moda Infantil",
      image: "https://cdn.vuetifyjs.com/images/john.jpg",
    },
    {
      title: "Esporte",
      image: "https://cdn.vuetifyjs.com/images/john.jpg",
    },
    {
      title: "Educação",
      image: "https://cdn.vuetifyjs.com/images/john.jpg",
    },
    {
      title: "Moda Infantil",
      image: "https://cdn.vuetifyjs.com/images/john.jpg",
    },
    {
      title: "Esporte",
      image: "https://cdn.vuetifyjs.com/images/john.jpg",
    },
    {
      title: "Educação",
      image: "https://cdn.vuetifyjs.com/images/john.jpg",
    },
    {
      title: "Moda Infantil",
      image: "https://cdn.vuetifyjs.com/images/john.jpg",
    },
    {
      title: "Esporte",
      image: "https://cdn.vuetifyjs.com/images/john.jpg",
    },
    {
      title: "Educação",
      image: "https://cdn.vuetifyjs.com/images/john.jpg",
    },
    {
      title: "Moda Infantillll",
      image: "https://cdn.vuetifyjs.com/images/john.jpg",
    }
  ])
</script>
