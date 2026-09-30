import { readonly, ref } from 'vue'
import type { HoroscopePeriod, HoroscopeReading, ZodiacSign } from '../types/zodiac'

export type ZodiacStoreStatus = 'idle' | 'loading' | 'ready' | 'error'

const signs = ref<ZodiacSign[]>([])
const readings = ref<HoroscopeReading[]>([])
const status = ref<ZodiacStoreStatus>('idle')
const errorMessage = ref('')

let loading: Promise<void> | null = null

export function loadZodiacStore(): Promise<void> {
  if (status.value === 'ready') return Promise.resolve()
  if (loading) return loading

  status.value = 'loading'
  errorMessage.value = ''

  loading = import('../database/zodiacRepository')
    .then(({ zodiacRepository }) => Promise.all([
      zodiacRepository.getAllSigns(),
      zodiacRepository.getAllReadings()
    ]))
    .then(([loadedSigns, loadedReadings]) => {
      if (loadedSigns.length !== 12) {
        throw new Error(`Expected 12 zodiac signs, received ${loadedSigns.length}`)
      }
      if (loadedReadings.length !== 36) {
        throw new Error(`Expected 36 horoscope readings, received ${loadedReadings.length}`)
      }
      signs.value = loadedSigns
      readings.value = loadedReadings
      status.value = 'ready'
    })
    .catch((error: unknown) => {
      signs.value = []
      readings.value = []
      status.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : String(error)
      throw error
    })
    .finally(() => {
      loading = null
    })

  return loading
}

export function getZodiacSign(id: string): ZodiacSign | undefined {
  return signs.value.find((sign) => sign.id === id)
}

export function getHoroscopeReading(
  signId: string,
  period: HoroscopePeriod
): HoroscopeReading | undefined {
  return readings.value.find(
    (reading) => reading.signId === signId && reading.period === period
  )
}

export function useZodiacStore() {
  return {
    signs: readonly(signs),
    readings: readonly(readings),
    status: readonly(status),
    errorMessage: readonly(errorMessage),
    load: loadZodiacStore,
    getSign: getZodiacSign,
    getReading: getHoroscopeReading
  }
}
