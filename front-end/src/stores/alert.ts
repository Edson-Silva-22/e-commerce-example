import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlertStore = defineStore('alert', () => {
    const alerts = ref<{
        id: number,
        message: string, 
        type: "success" | "error" | "info" | "warning",
        timeClose: any
    }[]>([])
    let id = 0

    async function createAlert(message: string, type: "success" | "error" | "info" | "warning") {
        const tmpId = id++
        alerts.value?.push({
            id: tmpId,
            message,
            type,
            //definindo o tempo de fechamento automático dos alertas
            timeClose: setTimeout(() => {
                destroy(tmpId)
            }, 5000)
        })
    }

    function destroy(id:number) {
        alerts.value = alerts.value.filter((a) => a.id != id)
    }

    return{
        createAlert,
        alerts
    }
})