<template>
  <v-container fluid height="100vh" width="100vw" class="d-flex justify-center align-center">
    <v-form 
      class="vForm pa-2"
      style="max-width: 400px; width: 100%;"
    >
      <h1 class="text-center">Login</h1>
      <p class="mb-10 text-center text-textSecundary font-weight-medium">Faça seu login para comerçar a comprar</p>
  
      <v-text-field
        width="100%"
        height="54"
        name="email"
        placeholder="Email"
        variant="solo"
        bg-color="inputBackground"
        prepend-inner-icon="mdi-account"
        type="email"
        clearable
      ></v-text-field>
  
      <v-text-field
        width="100%"
        height="54"
        name="password"
        placeholder="Senha"
        variant="solo"
        bg-color="inputBackground"
        prepend-inner-icon="mdi-lock"
        :append-inner-icon="passwordIsVisible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="passwordIsVisible ? 'text' : 'password'"
        clearable
        @click:append-inner="passwordIsVisible = !passwordIsVisible"
      ></v-text-field>

      <v-btn 
        color="primary"
        height="54"
        width="200"
        class="mb-5 mx-auto d-block"
      >Entrar</v-btn>

      <p class="mb-5 text-center text-textSecundary font-weight-medium">Ainda não se registrou? <span @click="router.push('/register')" class="text-primary cursor-pointer">Crie sua conta aqui</span></p>

      <v-divider class="mb-5">
        <p class="mb-5">Ou</p>
      </v-divider>

      <div class="d-flex justify-center align-center ga-2">
        <v-btn 
          color="primary" 
          prepend-icon="mdi-google" 
          variant="outlined"
          height="54"
          width="140"
          class="text-none text-subtitle-1"
        >Google</v-btn>

        <v-btn 
          color="primary" 
          prepend-icon="mdi-facebook" 
          variant="outlined"
          height="54"
          width="140"
          class="text-none text-subtitle-1"
        >Facebook</v-btn>
      </div>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
  const router = useRouter()
  const passwordIsVisible = ref(false);
</script>

<style scoped>
@import "@/styles/login.page.css";
</style>