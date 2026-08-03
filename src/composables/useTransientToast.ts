import { onUnmounted, ref, type Ref } from "vue";

/** 一時表示のトーストメッセージを管理するフック */
export function useTransientToast(durationMs = 2500) {
  const message = ref<string | null>(null);
  const isVisible = ref(false);
  let timeoutId: ReturnType<typeof window.setTimeout> | null = null;
  let hideTimeoutId: ReturnType<typeof window.setTimeout> | null = null;

  const clearTimers = () => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (hideTimeoutId !== null) {
      window.clearTimeout(hideTimeoutId);
      hideTimeoutId = null;
    }
  };

  onUnmounted(() => {
    clearTimers();
  });

  const showToast = (nextMessage: string) => {
    clearTimers();

    message.value = nextMessage;
    isVisible.value = true;

    timeoutId = window.setTimeout(() => {
      isVisible.value = false;
      hideTimeoutId = window.setTimeout(() => {
        message.value = null;
        hideTimeoutId = null;
      }, 250);
      timeoutId = null;
    }, durationMs);
  };

  const hideToast = () => {
    clearTimers();
    isVisible.value = false;
    hideTimeoutId = window.setTimeout(() => {
      message.value = null;
      hideTimeoutId = null;
    }, 250);
  };

  return {
    message,
    isVisible,
    showToast,
    hideToast,
  };
}
