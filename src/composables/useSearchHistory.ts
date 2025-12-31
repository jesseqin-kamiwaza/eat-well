import { useLocalStorage } from '@vueuse/core'

/**
 * Composable for managing search history with localStorage persistence
 *
 * Usage:
 * ```ts
 * const { history, add, remove, clear } = useSearchHistory(10)
 *
 * add('宫保鸡丁')
 * remove('麻婆豆腐')
 * clear()
 * ```
 *
 * @param maxItems - Maximum number of items to store (default: 10)
 * @param storageKey - localStorage key (default: 'search-history')
 */
export function useSearchHistory(
  maxItems = 10,
  storageKey = 'search-history'
) {
  // 使用 @vueuse/core 的 useLocalStorage 自动持久化
  const history = useLocalStorage<string[]>(storageKey, [])

  /**
   * 添加搜索记录
   * - 自动去重（移除已存在的相同项）
   * - 添加到列表开头
   * - 限制最大数量
   */
  const add = (query: string) => {
    if (!query.trim()) return

    // 移除重复项
    const filtered = history.value.filter(item => item !== query)

    // 添加到开头并限制数量
    history.value = [query, ...filtered].slice(0, maxItems)
  }

  /**
   * 移除指定搜索记录
   */
  const remove = (query: string) => {
    history.value = history.value.filter(item => item !== query)
  }

  /**
   * 清空所有搜索记录
   */
  const clear = () => {
    history.value = []
  }

  /**
   * 获取最近 N 条记录
   */
  const getRecent = (count: number) => {
    return history.value.slice(0, count)
  }

  /**
   * 检查是否包含某个搜索记录
   */
  const has = (query: string): boolean => {
    return history.value.includes(query)
  }

  return {
    history,
    add,
    remove,
    clear,
    getRecent,
    has
  }
}
