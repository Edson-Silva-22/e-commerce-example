<template>
  <v-app-bar 
    :elevation="2" 
    color="#0f172a" 
    class="px-2"
    height="64"
  >
    <template v-slot:prepend>
      <p>Logo</p>
    </template>

    <template v-slot:append>
      <v-btn icon class="mr-2">
        <v-badge 
          color="primary"
          floating
          content="9+"
          height="15px"
        >
          <v-icon icon="mdi-cart"></v-icon>
        </v-badge>
      </v-btn>

      <v-menu
        :close-on-content-click="false"
      >
        <template v-slot:activator="{ props }">
          <v-btn icon class="mr-2">
            <v-badge 
              color="primary"
              floating
              content="9"
              height="15px"
              v-bind="props"
            >
              <v-icon icon="mdi-bell"></v-icon>
            </v-badge>
          </v-btn>
        </template>

        <div>
          <v-list
            class="mt-6"
            bg-color="foregroud"
            max-height="250px"
            max-width="400px"
            rounded
          >
            <v-list-item
              v-for="(item, index) in notifications"
              :key="index"
              :title="item.title"
              :value="index"
              lines="two"
            >
              <template v-slot:append>
                <v-btn 
                  icon="mdi-delete" 
                  variant="plain"
                  @click="notifications.splice(index, 1)"
                ></v-btn>
              </template>
              <v-list-item-subtitle class="text-textPrimary">{{ item.content }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </div>
      </v-menu>
      
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-menu" v-bind="props"></v-btn>
        </template>

        <v-list class="mt-3" bg-color="foregroud">
            <v-list-item
              v-for="(item, index) in items"
              v-show="item.visible"
              :key="index"
              :title="item.title"
              :value="index"
              :prepend-icon="item.icon"
              slim
              @click="items[index].onClick"
            ></v-list-item>
          </v-list>
      </v-menu>
    </template>
  </v-app-bar>
</template>

<script lang="ts" setup>
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  import { ref } from 'vue';

  const router = useRouter();
  const authStore = useAuthStore();
  const userAuth = computed(() => authStore.userAuth);

  const items = computed(() => [
    { 
      title: 'Perfil',
      icon: 'mdi-account',
      visible: !!userAuth.value,
      // onClick: () => router.push(`/profile/${authStore.userAuth._id}`)
    },
    { 
      title: 'Sair',
      icon: 'mdi-logout',
      visible: !!userAuth.value,
      // onClick: () => {
      //   authStore.logout();
      //   router.push('/login');
      // }
    },
    {
      title: "Entrar",
      icon: "mdi-login",
      visible: !userAuth.value,
      onClick: () => router.push("/login")
    },
    {
      title: "Cadastrar",
      icon: "mdi-account-plus",
      visible: !userAuth.value,
      onClick: () => router.push("/register")
    }
  ])
  const notifications = ref([
    {
      title: "Pedido Aprovado",
      content: "seu pedido foi aprovado."
    },
    {
      title: "Pedido Recusado",
      content: "seu pedido foi recusado."
    },
    {
      title: "Pedido Cancelado",
      content: "seu pedido foi cancelado."
    },
    {
      title: "Pedido Entregue",
      content: "seu pedido foi entregue."
    },
    {
      title: "Cupom Recebido",
      content: "Voçê recebeu um cupom de desconto."
    }
  ])

  onMounted(async () => {
    await authStore.me();
  })
</script>