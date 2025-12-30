import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface SwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
}

export function useSwipe(
  elementRef: Ref<HTMLElement | null>,
  options: SwipeOptions
) {
  const startX = ref(0)
  const startY = ref(0)
  const endX = ref(0)
  const endY = ref(0)

  const threshold = options.threshold || 50

  const handleTouchStart = (e: TouchEvent) => {
    startX.value = e.touches[0].clientX
    startY.value = e.touches[0].clientY
  }

  const handleTouchEnd = (e: TouchEvent) => {
    endX.value = e.changedTouches[0].clientX
    endY.value = e.changedTouches[0].clientY
    handleSwipe()
  }

  const handleSwipe = () => {
    const deltaX = endX.value - startX.value
    const deltaY = endY.value - startY.value

    // Determine if it's a horizontal or vertical swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          options.onSwipeRight?.()
        } else {
          options.onSwipeLeft?.()
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          options.onSwipeDown?.()
        } else {
          options.onSwipeUp?.()
        }
      }
    }
  }

  onMounted(() => {
    const element = elementRef.value
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true })
      element.addEventListener('touchend', handleTouchEnd, { passive: true })
    }
  })

  onUnmounted(() => {
    const element = elementRef.value
    if (element) {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  })

  return {
    startX,
    startY,
    endX,
    endY
  }
}

export function useLongPress(
  elementRef: Ref<HTMLElement | null>,
  callback: () => void,
  duration = 500
) {
  let timeout: number | null = null

  const handleTouchStart = () => {
    timeout = window.setTimeout(() => {
      callback()
      // Optional: vibrate feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }, duration)
  }

  const handleTouchEnd = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  const handleTouchMove = () => {
    // Cancel long press if finger moves
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  onMounted(() => {
    const element = elementRef.value
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true })
      element.addEventListener('touchend', handleTouchEnd, { passive: true })
      element.addEventListener('touchmove', handleTouchMove, { passive: true })
    }
  })

  onUnmounted(() => {
    const element = elementRef.value
    if (element) {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchmove', handleTouchMove)
    }
    if (timeout) {
      clearTimeout(timeout)
    }
  })
}
