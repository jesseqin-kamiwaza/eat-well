<template>
    <div class="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 pb-20">
        <div class="max-w-2xl mx-auto">
            <!-- 简化的页面标题 -->
            <div class="pt-6 pb-4 px-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 mb-2">
                            我的收藏 ❤️
                        </h1>
                        <p class="text-sm text-gray-600">
                            共收藏了 {{ favorites.length }} 道菜谱
                        </p>
                    </div>
                    <!-- 清空按钮 -->
                    <button
                        v-if="favorites.length > 0"
                        @click="showClearConfirm = true"
                        class="px-3 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium border-2 border-black hover:bg-gray-50 active:scale-95 transition-all"
                    >
                        🗑️ 清空
                    </button>
                </div>
            </div>

            <!-- 搜索和筛选 -->
            <div v-if="favorites.length > 0" class="mb-4 px-4">
                <div class="card-brutal p-4 bg-white">
                    <div class="space-y-3">
                        <!-- 搜索框 -->
                        <input
                            v-model="searchQuery"
                            placeholder="搜索菜谱名称或食材..."
                            class="w-full px-4 py-2.5 border-2 border-black rounded-lg text-sm bg-white focus:outline-none focus:border-red-400 transition-all"
                        />

                        <!-- 筛选和排序 -->
                        <div class="flex gap-2">
                            <!-- 菜系筛选 -->
                            <select v-model="selectedCuisine" class="flex-1 px-3 py-2 border-2 border-black rounded-lg text-sm bg-white focus:outline-none focus:border-red-400 transition-all">
                                <option value="">全部菜系</option>
                                <option v-for="cuisine in availableCuisines" :key="cuisine" :value="cuisine">
                                    {{ cuisine }}
                                </option>
                            </select>

                            <!-- 排序 -->
                            <select v-model="sortBy" class="flex-1 px-3 py-2 border-2 border-black rounded-lg text-sm bg-white focus:outline-none focus:border-red-400 transition-all">
                                <option value="date-desc">最新收藏</option>
                                <option value="date-asc">最早收藏</option>
                                <option value="name-asc">名称 A-Z</option>
                                <option value="name-desc">名称 Z-A</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 收藏列表 -->
            <div v-if="filteredFavorites.length > 0" class="px-4 space-y-4">
                <div
                    v-for="favorite in filteredFavorites"
                    :key="favorite.id"
                    class="flex flex-col"
                >
                    <!-- 菜谱卡片 V2 - 大图布局 -->
                    <RecipeCardV2 :recipe="favorite.recipe" :showFavoriteButton="false" />

                    <!-- 收藏信息 - 卡片下方 -->
                    <div class="mt-2 p-3 bg-white border-2 border-black rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center gap-2">
                                <span class="text-red-500 text-sm">❤️</span>
                                <span class="text-xs text-gray-600">{{ formatDate(favorite.favoriteDate) }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <button @click="editNotes(favorite)" class="text-blue-500 hover:text-blue-600 text-sm" title="编辑备注">📝</button>
                                <button @click="confirmRemoveFavorite(favorite.recipe.id)" class="text-red-500 hover:text-red-600 text-sm" title="取消收藏">🗑️</button>
                            </div>
                        </div>

                        <!-- 用户备注 -->
                        <div v-if="favorite.notes" class="p-2 bg-yellow-50 rounded border border-yellow-200">
                            <div class="text-xs text-gray-600 mb-1">📝 我的备注：</div>
                            <div class="text-sm text-gray-800">{{ favorite.notes }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-else-if="favorites.length === 0" class="px-4">
                <div class="card-brutal bg-white p-8 text-center">
                    <div class="text-6xl mb-4">🤍</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">还没有收藏任何菜谱</h3>
                    <p class="text-gray-600 mb-6">去生成一些美味的菜谱，然后收藏起来吧！</p>
                    <router-link
                        to="/"
                        class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-bold border-2 border-black shadow-brutal-lg hover:shadow-brutal-md active:shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] transition-all"
                    >
                        <span>✨</span>
                        <span>开始生成菜谱</span>
                    </router-link>
                </div>
            </div>

            <!-- 搜索无结果 -->
            <div v-else class="px-4">
                <div class="card-brutal bg-white p-8 text-center">
                    <div class="text-4xl mb-4">🔍</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">没有找到匹配的菜谱</h3>
                    <p class="text-gray-600 mb-4">试试调整搜索条件或筛选选项</p>
                    <button
                        @click="clearFilters"
                        class="px-4 py-2 bg-white text-gray-800 rounded-lg font-medium border-2 border-black hover:bg-gray-50 active:scale-95 transition-all"
                    >
                        清除筛选条件
                    </button>
                </div>
            </div>
        </div>

        <!-- 备注编辑弹窗 -->
        <NotesModal v-if="editingFavorite" :favorite="editingFavorite" @close="editingFavorite = null" @save="saveNotes" />

        <!-- 清空确认弹窗 -->
        <ConfirmModal
            v-if="showClearConfirm"
            title="确认清空收藏"
            message="确定要清空所有收藏的菜谱吗？此操作不可恢复。"
            @confirm="clearAllFavorites"
            @cancel="showClearConfirm = false"
        />

        <!-- 单个删除确认弹窗 -->
        <ConfirmModal v-if="removingRecipeId" title="确认取消收藏" message="确定要取消收藏这道菜谱吗？" @confirm="removeFavorite" @cancel="removingRecipeId = null" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { FavoriteRecipe } from '@/types'
import { FavoriteService } from '@/services/favoriteService'
import RecipeCardV2 from '@/components/recipe/RecipeCardV2.vue'
import NotesModal from '@/components/NotesModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

// 响应式数据
const favorites = ref<FavoriteRecipe[]>([])
const searchQuery = ref('')
const selectedCuisine = ref('')
const sortBy = ref('date-desc')

const editingFavorite = ref<FavoriteRecipe | null>(null)
const showClearConfirm = ref(false)

// 统计信息
const stats = computed(() => FavoriteService.getFavoriteStats())

// 可用菜系列表
const availableCuisines = computed(() => {
    const cuisines = new Set(favorites.value.map(fav => fav.recipe.cuisine))
    return Array.from(cuisines).sort()
})

// 筛选后的收藏列表
const filteredFavorites = computed(() => {
    let filtered = [...favorites.value]

    // 搜索筛选
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(
            fav =>
                fav.recipe.name.toLowerCase().includes(query) ||
                fav.recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(query)) ||
                (fav.notes && fav.notes.toLowerCase().includes(query))
        )
    }

    // 菜系筛选
    if (selectedCuisine.value) {
        filtered = filtered.filter(fav => fav.recipe.cuisine === selectedCuisine.value)
    }

    // 排序
    filtered.sort((a, b) => {
        switch (sortBy.value) {
            case 'date-desc':
                return new Date(b.favoriteDate).getTime() - new Date(a.favoriteDate).getTime()
            case 'date-asc':
                return new Date(a.favoriteDate).getTime() - new Date(b.favoriteDate).getTime()
            case 'name-asc':
                return a.recipe.name.localeCompare(b.recipe.name)
            case 'name-desc':
                return b.recipe.name.localeCompare(a.recipe.name)
            default:
                return 0
        }
    })

    return filtered
})

// 格式化日期
const formatDate = (dateString?: string) => {
    if (!dateString) return '未知'

    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
        return '今天'
    } else if (diffDays === 1) {
        return '昨天'
    } else if (diffDays < 7) {
        return `${diffDays}天前`
    } else {
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }
}

// 刷新收藏列表
const refreshFavorites = () => {
    favorites.value = FavoriteService.getFavorites()
}

// 编辑备注
const editNotes = (favorite: FavoriteRecipe) => {
    editingFavorite.value = favorite
}

// 保存备注
const saveNotes = (notes: string) => {
    if (editingFavorite.value) {
        const success = FavoriteService.updateFavoriteNotes(editingFavorite.value.recipe.id, notes)
        if (success) {
            refreshFavorites()
            showToast('备注已更新', 'success')
        } else {
            showToast('更新备注失败', 'error')
        }
    }
    editingFavorite.value = null
}

// 移除收藏
const removingRecipeId = ref<string | null>(null)

const confirmRemoveFavorite = (recipeId: string) => {
    removingRecipeId.value = recipeId
}

const removeFavorite = () => {
    if (!removingRecipeId.value) return

    const success = FavoriteService.removeFavorite(removingRecipeId.value)
    if (success) {
        refreshFavorites()
        showToast('已取消收藏', 'info')
    } else {
        showToast('取消收藏失败', 'error')
    }
    removingRecipeId.value = null
}

// 清空所有收藏
const clearAllFavorites = () => {
    const success = FavoriteService.clearAllFavorites()
    if (success) {
        refreshFavorites()
        showToast('已清空所有收藏', 'info')
    } else {
        showToast('清空失败', 'error')
    }
    showClearConfirm.value = false
}

// 清除筛选条件
const clearFilters = () => {
    searchQuery.value = ''
    selectedCuisine.value = ''
    sortBy.value = 'date-desc'
}

// 简单的提示功能
const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const toast = document.createElement('div')
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white text-sm font-medium z-50 transition-all duration-300 transform translate-x-full`

    const styles = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    }

    toast.className += ` ${styles[type]}`
    toast.textContent = message

    document.body.appendChild(toast)

    setTimeout(() => {
        toast.style.transform = 'translateX(0)'
    }, 10)

    setTimeout(() => {
        toast.style.transform = 'translateX(full)'
        setTimeout(() => {
            document.body.removeChild(toast)
        }, 300)
    }, 2000)
}

// 初始化
onMounted(() => {
    refreshFavorites()
})
</script>

<style scoped>
/* 动画效果 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.hover\:scale-\[1\.02\]:hover {
    transform: scale(1.02);
}

/* 响应式调整 */
@media (max-width: 640px) {
    .grid-cols-1 {
        gap: 1rem;
    }
}
</style>
