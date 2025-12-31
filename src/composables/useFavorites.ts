import { ref, computed } from 'vue'
import type { Recipe, FavoriteRecipe } from '@/types'
import { FavoriteService } from '@/services/favoriteService'

/**
 * Composable for managing favorite recipes with reactive state
 *
 * Usage:
 * ```ts
 * const { favorites, favoriteIds, isFavorited, toggleFavorite } = useFavorites()
 * ```
 */
export function useFavorites() {
  // 响应式收藏列表
  const favorites = ref<FavoriteRecipe[]>([])

  // 收藏的菜谱 ID Set（用于快速查找）
  const favoriteIds = computed(() =>
    new Set(favorites.value.map(fav => fav.recipe.id))
  )

  // 刷新收藏列表
  const refreshFavorites = () => {
    favorites.value = FavoriteService.getFavorites()
  }

  // 初始化加载
  refreshFavorites()

  /**
   * 检查菜谱是否已收藏
   */
  const isFavorited = (recipeId: string): boolean => {
    return favoriteIds.value.has(recipeId)
  }

  /**
   * 切换收藏状态
   */
  const toggleFavorite = (recipe: Recipe, notes?: string): boolean => {
    const isCurrentlyFavorited = isFavorited(recipe.id)

    if (isCurrentlyFavorited) {
      // 取消收藏
      const success = FavoriteService.removeFavorite(recipe.id)
      if (success) {
        refreshFavorites()
      }
      return !success // 返回新状态：false（已取消收藏）
    } else {
      // 添加收藏
      const success = FavoriteService.addFavorite(recipe, notes)
      if (success) {
        refreshFavorites()
      }
      return success // 返回新状态：true（已收藏）
    }
  }

  /**
   * 添加收藏
   */
  const addFavorite = (recipe: Recipe, notes?: string): boolean => {
    const success = FavoriteService.addFavorite(recipe, notes)
    if (success) {
      refreshFavorites()
    }
    return success
  }

  /**
   * 移除收藏
   */
  const removeFavorite = (recipeId: string): boolean => {
    const success = FavoriteService.removeFavorite(recipeId)
    if (success) {
      refreshFavorites()
    }
    return success
  }

  /**
   * 更新收藏备注
   */
  const updateNotes = (recipeId: string, notes: string): boolean => {
    const success = FavoriteService.updateFavoriteNotes(recipeId, notes)
    if (success) {
      refreshFavorites()
    }
    return success
  }

  /**
   * 清空所有收藏
   */
  const clearAll = (): boolean => {
    const success = FavoriteService.clearAllFavorites()
    if (success) {
      refreshFavorites()
    }
    return success
  }

  /**
   * 获取统计信息
   */
  const getStats = () => {
    return FavoriteService.getFavoriteStats()
  }

  return {
    // 状态
    favorites,
    favoriteIds,

    // 方法
    isFavorited,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    updateNotes,
    clearAll,
    refreshFavorites,
    getStats
  }
}
