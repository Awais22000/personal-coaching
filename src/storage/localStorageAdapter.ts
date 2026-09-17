import type { StorageAdapter } from './storageAdapter'

export const localStorageAdapter: StorageAdapter = {
  read<T>(key: string): T | null {
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? JSON.parse(raw) as T : null
    } catch { return null }
  },
  write<T>(key: string, value: T) {
    try { window.localStorage.setItem(key, JSON.stringify(value)) } catch { /* Storage unavailable; in-memory state still works. */ }
  },
  remove(key: string) {
    try { window.localStorage.removeItem(key) } catch { /* Storage unavailable. */ }
  },
}
