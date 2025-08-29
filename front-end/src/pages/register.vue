<template>
  <v-container fluid height="100vh" width="100vw" class="d-flex justify-center align-center">
    <v-form 
      class="vForm pa-2"
      style="max-width: 400px; width: 100%;"
    >
      <h1 class="text-center">Criar Conta</h1>
      <p class="mb-10 text-center text-textSecundary font-weight-medium">Informe seus dados para criar sua conta</p>
  
      <v-text-field
        width="100%"
        height="54"
        name="name"
        placeholder="Nome Completo"
        variant="solo"
        bg-color="inputBackground"
        prepend-inner-icon="mdi-account"
        type="text"
        clearable
      ></v-text-field>

      <v-text-field
        width="100%"
        height="54"
        name="email"
        placeholder="Email"
        variant="solo"
        bg-color="inputBackground"
        prepend-inner-icon="mdi-at"
        type="text"
        clearable
      ></v-text-field>

      <v-text-field
        width="100%"
        height="54"
        name="cpf"
        placeholder="CPF"
        variant="solo"
        bg-color="inputBackground"
        prepend-inner-icon="mdi-card-account-details"
        type="text"
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

      <v-text-field
        width="100%"
        height="54"
        name="confirmPassword"
        placeholder="Confirmar Senha"
        variant="solo"
        bg-color="inputBackground"
        prepend-inner-icon="mdi-lock"
        :append-inner-icon="ConfirmPasswordIsVisible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="ConfirmPasswordIsVisible ? 'text' : 'password'"
        clearable
        @click:append-inner="ConfirmPasswordIsVisible = !ConfirmPasswordIsVisible"
      ></v-text-field>

      <v-text-field
        width="100%"
        height="54"
        name="phone"
        placeholder="Telefone"
        variant="solo"
        bg-color="inputBackground"
        prepend-inner-icon="mdi-phone"
        type="number"
        clearable
      ></v-text-field>

      <v-btn 
        color="primary"
        height="54"
        width="200"
        class="mb-5 mx-auto d-block"
      >Criar</v-btn>

      <v-btn 
        color="primary"
        height="54"
        width="200"
        class="mb-5 mx-auto d-block"
        variant="text"
        @click="router.back()"
      >Cancelar</v-btn>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
  const router = useRouter()
  const passwordIsVisible = ref(false);
  const ConfirmPasswordIsVisible = ref(false);
</script>