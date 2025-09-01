import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export function useSecretTap() {
  const router = useRouter()
  const store = useStore()
  
  const tapCount = ref(0)
  const lastTapTime = ref(0)
  const tapTimeout = ref<NodeJS.Timeout | null>(null)

  const handleLogoClick = () => {
    const now = Date.now()
    
    // 如果距离上次点击超过2秒，重置计数
    if (now - lastTapTime.value > 2000) {
      tapCount.value = 1
    } else {
      tapCount.value++
    }
    
    lastTapTime.value = now

    // 清除之前的定时器
    if (tapTimeout.value) {
      clearTimeout(tapTimeout.value)
    }

    // 设置新的定时器
    tapTimeout.value = setTimeout(() => {
      tapCount.value = 0
    }, 2000)

    // 如果连续点击5次，进入后台
    if (tapCount.value >= 5) {
      // 设置管理员状态
      store.dispatch('user/setAdminStatus', true)
      
      // 跳转到后台
      router.push('/admin/settings')
      
      // 重置计数
      tapCount.value = 0
      
      // 清除定时器
      if (tapTimeout.value) {
        clearTimeout(tapTimeout.value)
      }
    }
  }

  onMounted(() => {
    // 组件挂载时不需要额外操作
  })

  onUnmounted(() => {
    // 组件卸载时清理定时器
    if (tapTimeout.value) {
      clearTimeout(tapTimeout.value)
    }
  })

  return {
    handleLogoClick
  }
} 