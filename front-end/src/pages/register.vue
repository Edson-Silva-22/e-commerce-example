<template>
  <v-container fluid height="100vh" width="100vw" class="d-flex justify-center align-center">
    <Alert></Alert>
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
        bg-color="foregroud"
        prepend-inner-icon="mdi-account"
        type="text"
        clearable
        v-model="name"
        :error-messages="errors.name"
      ></v-text-field>

      <v-text-field
        width="100%"
        height="54"
        name="email"
        placeholder="Email"
        variant="solo"
        bg-color="foregroud"
        prepend-inner-icon="mdi-at"
        type="text"
        clearable
        v-model="email"
        :error-messages="errors.email"
      ></v-text-field>

      <v-text-field
        width="100%"
        height="54"
        name="cpf"
        placeholder="CPF"
        variant="solo"
        bg-color="foregroud"
        prepend-inner-icon="mdi-card-account-details"
        type="text"
        clearable
        v-maska="'###.###.###-##'"
        v-model="cpf"
        :error-messages="errors.cpf"
      ></v-text-field>

      <v-text-field
        width="100%"
        height="54"
        name="password"
        placeholder="Senha"
        variant="solo"
        bg-color="foregroud"
        prepend-inner-icon="mdi-lock"
        :append-inner-icon="passwordIsVisible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="passwordIsVisible ? 'text' : 'password'"
        clearable
        @click:append-inner="passwordIsVisible = !passwordIsVisible"
        v-model="password"
        :error-messages="errors.password"
      ></v-text-field>

      <v-text-field
        width="100%"
        height="54"
        name="confirmPassword"
        placeholder="Confirmar Senha"
        variant="solo"
        bg-color="foregroud"
        prepend-inner-icon="mdi-lock"
        :append-inner-icon="ConfirmPasswordIsVisible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="ConfirmPasswordIsVisible ? 'text' : 'password'"
        clearable
        @click:append-inner="ConfirmPasswordIsVisible = !ConfirmPasswordIsVisible"
        v-model="confirmPassword"
        :error-messages="errors.confirmPassword"
      ></v-text-field>

      <v-text-field
        width="100%"
        height="54"
        name="phone"
        placeholder="Telefone"
        variant="solo"
        bg-color="foregroud"
        prepend-inner-icon="mdi-phone"
        clearable
        v-maska="'(##) #####-####'"
        v-model="phone"
        :error-messages="errors.phone"
      ></v-text-field>

      <v-btn 
        color="primary"
        height="54"
        width="200"
        class="mb-5 mx-auto d-block"
        @click="register"
        :loading
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
  import { vMaska } from 'maska/vue';
  import { toTypedSchema } from '@vee-validate/zod';
  import * as z from 'zod';
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useField, useForm } from 'vee-validate';
  import { useUserStore } from '@/stores/users';
  import Alert from '@/components/Alert.vue';
  import { computed } from 'vue';

  const userStore = useUserStore()
  const router = useRouter()
  const loading = computed(() => userStore.loading)
  const passwordIsVisible = ref(false);
  const ConfirmPasswordIsVisible = ref(false);
  const validationSchema = toTypedSchema(
    z.object({
      name: z
        .string({required_error: 'Informe seu nome.', invalid_type_error: 'Informe seu nome'})
        .min(1, {message: 'Informe seu nome.'}),
      email: z
        .string({required_error: 'Informe seu email.', invalid_type_error: 'Informe seu email'})
        .min(1, {message: 'Informe seu email.'})
        .email({message: 'Informe um email válido.'})
        .endsWith('@gmail.com', {message: 'Email válido'}),
      cpf: z
        .string({required_error: 'Informe seu CPF.', invalid_type_error: 'Informe seu CPF'})
        .min(1, {message: 'Informe seu CPF.'})
        .length(14, {message: 'Informe um CPF válido.'}),
      password: z
        .string({required_error: 'Digite sua senha.', invalid_type_error: 'Digite sua senha'})
        .min(1, {message: 'Digite sua senha.'}),
      confirmPassword: z
        .string({required_error: 'Confirme sua senha.', invalid_type_error: 'Confirme sua senha'})
        .min(1, {message: 'Confirme sua senha.'})
        .refine((value) => value === password.value, {
          message: 'As senhas devem ser iguais.',
          path: ['confirmPassword']
        }),
      phone: z
        .string({required_error: 'Informe seu telefone.', invalid_type_error: 'Informe seu telefone'})
        .min(1, {message: 'Informe seu telefone.'})
        .length(15, {message: 'Informe um telefone válido.'}),
    })
  )
  const { handleSubmit, errors } = useForm({ validationSchema });
  const { value: name } = useField('name')
  const { value: email } = useField('email')
  const { value: cpf } = useField('cpf')
  const { value: password } = useField('password')
  const { value: confirmPassword } = useField('confirmPassword')
  const { value: phone } = useField('phone')


  const register = handleSubmit(async (values) => {
    const response = await userStore.create({
      name: values.name,
      email: values.email,
      cpf: values.cpf,
      password: values.password,
      phone: values.phone
    })
    
    if(response) router.push('/login')
  })

</script>