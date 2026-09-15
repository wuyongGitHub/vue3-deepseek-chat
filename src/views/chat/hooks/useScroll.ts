import type { Ref } from 'vue'
import { nextTick, ref } from 'vue'
import type { ScrollbarInstance } from 'element-plus'
// type ScrollElement = HTMLDivElement | null

interface ScrollReturn {
  scrollRef: Ref<ScrollbarInstance | undefined>
  scrollToBottom: () => Promise<void>
  scrollToTop: () => Promise<void>
  scrollToBottomIfAtBottom: () => Promise<void>
  scrollToTopAnimated: () => Promise<void>
  scrollToBottomAnimated: () => Promise<void>
}

export function useScroll(): ScrollReturn {
  const scrollRef = ref<ScrollbarInstance>()

  const scrollToBottom = async () => {
    await nextTick()
    if (scrollRef.value)
      scrollRef.value.setScrollTop(scrollRef.value?.wrapRef?.scrollHeight || 0)
  }

  const scrollToTop = async () => {
    await nextTick()
    if (scrollRef.value)
      scrollRef.value.setScrollTop(0)
  }

  // 平滑滚动动画（供「回到顶部 / 到底部」按钮使用）
  let rafId = 0
  const cancelScrollAnimation = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  }

  const smoothScrollTo = (targetTop: number, duration = 450): Promise<void> => {
    cancelScrollAnimation()
    return new Promise<void>((resolve) => {
      const wrap = scrollRef.value?.wrapRef
      if (!wrap) {
        resolve()
        return
      }
      const start = wrap.scrollTop
      const maxTop = Math.max(0, wrap.scrollHeight - wrap.clientHeight)
      const target = Math.min(Math.max(targetTop, 0), maxTop)
      const change = target - start
      if (Math.abs(change) < 1) {
        resolve()
        return
      }
      const startTime = performance.now()
      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        wrap.scrollTop = start + change * easeInOutCubic(progress)
        if (progress < 1) {
          rafId = requestAnimationFrame(step)
        } else {
          rafId = 0
          resolve()
        }
      }
      rafId = requestAnimationFrame(step)
    })
  }

  const scrollToTopAnimated = async () => {
    await nextTick()
    await smoothScrollTo(0)
  }

  const scrollToBottomAnimated = async () => {
    await nextTick()
    await smoothScrollTo(scrollRef.value?.wrapRef?.scrollHeight || 0)
  }

  const scrollToBottomIfAtBottom = async () => {
    await nextTick()
    if (scrollRef.value) {
      const scrollHeight = scrollRef.value?.wrapRef?.scrollHeight || 0
      const threshold = 100 // Threshold, indicating the distance threshold to the bottom of the scroll bar.
      const distanceToBottom = scrollHeight - scrollRef.value?.wrapRef?.scrollTop! - scrollRef.value?.wrapRef?.clientHeight!
      if (distanceToBottom <= threshold)
        scrollRef.value.setScrollTop(scrollHeight)
    }
  }

  return {
    scrollRef,
    scrollToBottom,
    scrollToTop,
    scrollToBottomIfAtBottom,
    scrollToTopAnimated,
    scrollToBottomAnimated,
  }
}
