<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  bannerHeight,
  bannerVisible,
  destroyBannerAd,
  hideBannerAd,
  showBannerAd
} from '../../services/advertising'
import { shouldShowBannerForPath } from '../../services/adPolicy'

const route = useRoute()

watch(
  () => route.path,
  (path) => {
    if (shouldShowBannerForPath(path)) {
      void showBannerAd()
    } else {
      void hideBannerAd()
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  void destroyBannerAd()
})
</script>

<template>
  <div
    v-if="bannerVisible"
    class="ad-banner-host"
    :style="{ height: `${bannerHeight}px` }"
    aria-hidden="true"
  />
</template>

<style scoped>
.ad-banner-host {
  width: 100%;
  flex: 0 0 auto;
  background: var(--color-surface-raised);
}
</style>
