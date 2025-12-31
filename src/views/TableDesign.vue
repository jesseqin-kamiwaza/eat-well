<template>
    <div class="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 px-2 md:px-4 py-6 pb-20">
        <!-- 简化的页面标题 -->
        <div class="max-w-2xl mx-auto px-4 pt-6 pb-4 md:pt-0">
            <h1 class="text-2xl font-bold text-gray-800 mb-2">
                一桌菜 🍽️
            </h1>
            <p class="text-sm text-gray-600">
                让每顿饭，都有剧本
            </p>
        </div>

        <div class="max-w-2xl mx-auto px-4">
            <!-- 步骤1: 菜品配置 -->
            <div class="mb-4">
                <div class="card-brutal p-4 bg-white">
                    <h2 class="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span class="text-xl">🥘</span>
                        <span>您的拿手菜（可选）</span>
                    </h2>

                    <!-- 拿手菜输入 -->
                    <div class="mb-3">
                        <div v-if="config.customDishes.length > 0" class="mb-3">
                            <div class="flex flex-wrap gap-2">
                                <div
                                    v-for="dish in config.customDishes"
                                    :key="dish"
                                    class="inline-flex items-center gap-1 bg-yellow-100 text-gray-800 px-2.5 py-1 rounded-full text-xs font-medium border-2 border-yellow-300"
                                >
                                    {{ dish }}
                                    <button @click="removeCustomDish(dish)" class="text-gray-600 hover:text-red-600 font-bold text-sm">
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-2">
                            <input
                                v-model="currentCustomDish"
                                @keyup.enter="addCustomDish"
                                placeholder="输入菜名（如：炒土豆丝、娃娃菜）"
                                class="flex-1 px-3 py-2 bg-gray-50 border-2 border-gray-300 rounded-lg text-sm
                                       focus:outline-none focus:border-yellow-400 focus:bg-white transition-all"
                            />
                            <button
                                @click="addCustomDish"
                                :disabled="!currentCustomDish.trim() || config.customDishes.length >= 3"
                                class="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium rounded-lg
                                       border-2 border-black active:scale-95 transition-all text-sm
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                添加
                            </button>
                        </div>
                        <div class="flex justify-between items-center mt-2 text-xs text-gray-500">
                            <span>💡 可添加0-3道您擅长的菜</span>
                            <span>{{ config.customDishes.length }}/3</span>
                        </div>
                    </div>

                    <!-- 总共要做几道菜 -->
                    <div class="pt-3 border-t-2 border-gray-100">
                        <h3 class="text-sm font-bold text-gray-700 mb-2">🍽️ 总共要做几道菜？</h3>
                        <div class="flex items-center gap-3 flex-wrap">
                            <div class="flex gap-2">
                                <button
                                    v-for="count in [4, 6, 8, 10]"
                                    :key="count"
                                    @click="config.dishCount = count"
                                    :class="[
                                        'px-3 py-1.5 rounded-lg font-medium border-2 border-black transition-all text-sm',
                                        config.dishCount === count
                                            ? 'bg-black text-white shadow-brutal-sm'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 active:scale-95'
                                    ]"
                                >
                                    {{ count }}道
                                </button>
                            </div>
                            <div class="h-4 w-px bg-gray-300"></div>
                            <div class="flex items-center gap-2">
                                <span class="text-sm text-gray-600">自定义</span>
                                <input
                                    v-model.number="config.dishCount"
                                    @input="validateDishCount"
                                    type="number"
                                    min="1"
                                    max="20"
                                    class="w-14 px-2 py-1 text-center border-2 border-black rounded-lg font-medium text-sm
                                           focus:outline-none focus:border-yellow-400 transition-all"
                                />
                                <span class="text-sm text-gray-600">道</span>
                            </div>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">
                            💡 AI会根据您的拿手菜，智能搭配其他菜品，凑满总数
                        </p>
                    </div>
                </div>
            </div>

            <!-- 步骤2: 偏好设置（可选） -->
            <div class="mb-4">
                <div class="card-brutal p-4 bg-white">
                    <h2 class="text-base font-bold text-gray-800 mb-2">
                        ⚙️ 偏好设置（可选）
                    </h2>
                    <p class="text-xs text-gray-500 mb-3">
                        💡 不设置也能生成精彩菜单
                    </p>

                    <!-- 可折叠的配置选项 -->
                    <div class="space-y-3">
                        <!-- 口味和风格设置 -->
                        <details class="bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden">
                            <summary class="cursor-pointer px-3 py-2 hover:bg-gray-100 font-medium text-sm flex items-center justify-between">
                                <span>🍽️ 口味和风格</span>
                                <span class="text-gray-400 text-xs">▼</span>
                            </summary>
                            <div class="p-3 border-t-2 border-gray-200 space-y-4 bg-white">
                                <!-- 口味偏好 -->
                                <div>
                                    <h5 class="text-xs font-bold text-gray-700 mb-2">👅 口味偏好（可多选）</h5>
                                    <div class="flex flex-wrap gap-2">
                                        <button
                                            v-for="taste in tasteOptions"
                                            :key="taste.id"
                                            @click="toggleTaste(taste.id)"
                                            :class="[
                                                'px-2.5 py-1.5 rounded-lg font-medium text-xs transition-all border-2 border-black',
                                                config.tastes.includes(taste.id)
                                                    ? 'bg-yellow-400 text-gray-800 shadow-brutal-sm'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 active:scale-95'
                                            ]"
                                        >
                                            {{ taste.icon }} {{ taste.name }}
                                        </button>
                                    </div>
                                </div>

                                <!-- 菜系风格 -->
                                <div>
                                    <h5 class="text-xs font-bold text-gray-700 mb-2">🌍 菜系风格</h5>
                                    <div class="flex flex-wrap gap-2">
                                        <button
                                            v-for="style in cuisineStyles"
                                            :key="style.id"
                                            @click="config.cuisineStyle = style.id"
                                            :class="[
                                                'px-2.5 py-1.5 rounded-lg font-medium text-xs transition-all border-2 border-black',
                                                config.cuisineStyle === style.id
                                                    ? 'bg-black text-white shadow-brutal-sm'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 active:scale-95'
                                            ]"
                                        >
                                            {{ style.icon }} {{ style.name }}
                                        </button>
                                    </div>
                                </div>

                                <!-- 用餐场景 -->
                                <div>
                                    <h5 class="text-xs font-bold text-gray-700 mb-2">🎭 用餐场景</h5>
                                    <div class="flex flex-wrap gap-2">
                                        <button
                                            v-for="scene in diningScenes"
                                            :key="scene.id"
                                            @click="config.diningScene = scene.id"
                                            :class="[
                                                'px-2.5 py-1.5 rounded-lg font-medium text-xs transition-all border-2 border-black',
                                                config.diningScene === scene.id
                                                    ? 'bg-black text-white shadow-brutal-sm'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 active:scale-95'
                                            ]"
                                        >
                                            {{ scene.icon }} {{ scene.name }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </details>

                        <!-- 营养和特殊要求 -->
                        <details class="bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden">
                            <summary class="cursor-pointer px-3 py-2 hover:bg-gray-100 font-medium text-sm flex items-center justify-between">
                                <span>⚖️ 营养和特殊要求</span>
                                <span class="text-gray-400 text-xs">▼</span>
                            </summary>
                            <div class="p-3 border-t-2 border-gray-200 space-y-4 bg-white">
                                <!-- 营养搭配 -->
                                <div>
                                    <h5 class="text-xs font-bold text-gray-700 mb-2">⚖️ 营养搭配</h5>
                                    <div class="flex flex-wrap gap-2">
                                        <button
                                            v-for="nutrition in nutritionOptions"
                                            :key="nutrition.id"
                                            @click="config.nutritionFocus = nutrition.id"
                                            :class="[
                                                'px-2.5 py-1.5 rounded-lg font-medium text-xs transition-all border-2 border-black',
                                                config.nutritionFocus === nutrition.id
                                                    ? 'bg-black text-white shadow-brutal-sm'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 active:scale-95'
                                            ]"
                                        >
                                            {{ nutrition.icon }} {{ nutrition.name }}
                                        </button>
                                    </div>
                                </div>

                                <!-- 特殊要求 -->
                                <div>
                                    <h5 class="text-xs font-bold text-gray-700 mb-2">💭 特殊要求</h5>
                                    <textarea
                                        v-model="config.customRequirement"
                                        placeholder="例如：不要太油腻，适合老人小孩，有一道汤..."
                                        class="w-full p-2.5 border-2 border-black rounded-lg text-sm resize-none
                                               focus:outline-none focus:border-yellow-400 transition-all"
                                        rows="3"
                                        maxlength="200"
                                    ></textarea>
                                    <div class="text-xs text-gray-500 mt-1 text-right">{{ config.customRequirement.length }}/200</div>
                                </div>
                            </div>
                        </details>
                    </div>
                </div>
            </div>

            <!-- 生成按钮 -->
            <div class="mb-6">
                <div v-if="!isGenerating && generatedDishes.length === 0">
                    <button
                        @click="generateTableMenuAction"
                        :disabled="isGenerating"
                        class="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-pink-400 text-white font-bold rounded-xl
                               border-2 border-black shadow-brutal-lg
                               hover:shadow-brutal-md active:shadow-brutal-sm
                               active:translate-x-[2px] active:translate-y-[2px]
                               transition-all duration-200
                               disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-brutal-lg"
                    >
                        <span class="flex items-center gap-2 justify-center text-sm">
                            <span>✨</span>
                            <span>开始生成一桌菜（{{ config.dishCount }}道）</span>
                        </span>
                    </button>
                </div>

                <!-- 生成中状态 -->
                <div v-if="isGenerating" class="card-brutal p-8 text-center bg-white">
                    <div class="animate-spin text-6xl mb-4">🍳</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">{{ generatingText }}</h3>
                    <p class="text-sm text-gray-600">AI大师正在为您精心搭配...</p>
                </div>

                <!-- 生成结果 -->
                <div v-if="!isGenerating && generatedDishes.length > 0" class="card-brutal p-4 bg-white">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-base font-bold text-gray-800 flex items-center gap-2">
                            <span>🎉</span>
                            <span>您的专属一桌菜</span>
                        </h3>
                        <button
                            @click="resetConfig"
                            class="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium
                                   border-2 border-black active:scale-95 transition-all text-sm"
                        >
                            🔄 重新生成
                        </button>
                    </div>

                    <!-- 菜品列表 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div
                            v-for="(dish, index) in generatedDishes"
                            :key="index"
                            class="border-2 border-black rounded-lg p-3 bg-gray-50 hover:bg-yellow-50 transition-all"
                        >
                            <div class="flex justify-between items-start mb-2">
                                <h4 class="font-bold text-gray-800 text-base">{{ dish.name }}</h4>
                                <span class="text-xs bg-pink-400 text-white px-2 py-0.5 rounded-full font-medium">{{ dish.category }}</span>
                            </div>
                            <p class="text-gray-600 text-xs mb-2 line-clamp-2">{{ dish.description }}</p>
                            <div class="flex justify-between items-center gap-2">
                                <div class="flex gap-1 flex-wrap flex-1">
                                    <span v-for="tag in dish.tags" :key="tag" class="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded font-medium">
                                        {{ tag }}
                                    </span>
                                </div>
                                <button
                                    @click="generateDishRecipeAction(dish, index)"
                                    :disabled="dish.isGeneratingRecipe"
                                    :class="[
                                        'px-2.5 py-1.5 text-white rounded-lg text-xs font-medium border-2 border-black transition-all active:scale-95',
                                        'disabled:opacity-50 disabled:cursor-not-allowed shrink-0',
                                        dish.recipe
                                            ? 'bg-green-500 hover:bg-green-600'
                                            : 'bg-blue-500 hover:bg-blue-600'
                                    ]"
                                >
                                    <span v-if="dish.isGeneratingRecipe" class="flex items-center gap-1">
                                        <div class="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>生成中</span>
                                    </span>
                                    <span v-else-if="dish.recipe">📖 查看</span>
                                    <span v-else>📝 生成</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 菜谱弹窗 -->
        <Teleport to="body">
        <div v-if="selectedRecipe" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 modal-overlay" @click="closeRecipeModal">
            <div
                class="bg-white rounded-2xl border-2 border-[#0A0910] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden modal-content transform transition-all duration-300"
                @click.stop
            >
                <!-- 弹窗头部 -->
                <div class="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">📖</span>
                        <h3 class="text-xl font-bold">{{ selectedRecipe.name }}</h3>
                    </div>
                    <button
                        @click="closeRecipeModal"
                        class="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                        <span class="text-white text-lg font-bold">✕</span>
                    </button>
                </div>

                <!-- 弹窗内容 -->
                <div class="max-h-[calc(90vh-80px)] overflow-y-auto scrollbar-hide">
                    <div class="">
                        <RecipeCard :recipe="selectedRecipe" />
                    </div>
                </div>
            </div>
        </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, Teleport, onMounted, onUnmounted } from 'vue'
import type { Recipe } from '@/types'
import RecipeCard from '@/components/RecipeCard.vue'
import { generateTableMenu, generateDishRecipe } from '@/services/aiService'

// 配置选项
interface TableConfig {
    dishCount: number
    tastes: string[]
    cuisineStyle: string
    diningScene: string
    nutritionFocus: string
    customRequirement: string
    customDishes: string[]
}

// 菜品信息
interface DishInfo {
    name: string
    description: string
    category: string
    tags: string[]
    recipe?: Recipe
    isGeneratingRecipe?: boolean
}

// 状态管理
const isGenerating = ref(false)
const generatingText = ref('正在生成菜单...')
const generatedDishes = ref<DishInfo[]>([])
const selectedRecipe = ref<Recipe | null>(null)

// 配置
const config = reactive<TableConfig>({
    dishCount: 6,
    tastes: [],
    cuisineStyle: 'mixed',
    diningScene: 'family',
    nutritionFocus: 'balanced',
    customRequirement: '',
    customDishes: []
})

// 自定义菜品输入
const currentCustomDish = ref('')

// 配置选项数据
const tasteOptions = [
    { id: 'spicy', name: '麻辣', icon: '🌶️' },
    { id: 'sweet', name: '甜味', icon: '🍯' },
    { id: 'sour', name: '酸味', icon: '🍋' },
    { id: 'salty', name: '咸鲜', icon: '🧂' },
    { id: 'light', name: '清淡', icon: '🌿' },
    { id: 'rich', name: '浓郁', icon: '🍖' }
]

const cuisineStyles = [
    { id: 'mixed', name: '混合菜系', icon: '🌍' },
    { id: 'chinese', name: '中式为主', icon: '🥢' },
    { id: 'western', name: '西式为主', icon: '🍽️' },
    { id: 'japanese', name: '日式为主', icon: '🍱' }
]

const diningScenes = [
    { id: 'family', name: '家庭聚餐', icon: '👨‍👩‍👧‍👦' },
    { id: 'friends', name: '朋友聚会', icon: '🎉' },
    { id: 'romantic', name: '浪漫晚餐', icon: '💕' },
    { id: 'business', name: '商务宴请', icon: '💼' },
    { id: 'festival', name: '节日庆祝', icon: '🎊' },
    { id: 'casual', name: '日常用餐', icon: '🍚' }
]

const nutritionOptions = [
    { id: 'balanced', name: '营养均衡', icon: '⚖️' },
    { id: 'protein', name: '高蛋白', icon: '💪' },
    { id: 'vegetarian', name: '素食为主', icon: '🥬' },
    { id: 'low_fat', name: '低脂健康', icon: '🏃‍♀️' },
    { id: 'comfort', name: '滋补养生', icon: '🍲' }
]

// 切换口味选择
const toggleTaste = (tasteId: string) => {
    const index = config.tastes.indexOf(tasteId)
    if (index > -1) {
        config.tastes.splice(index, 1)
    } else {
        config.tastes.push(tasteId)
    }
}

// 增加菜品数量 - 暂时未使用
// const increaseDishCount = () => {
//     if (config.dishCount < 20) {
//         config.dishCount++
//     }
// }

// 减少菜品数量 - 暂时未使用
// const decreaseDishCount = () => {
//     if (config.dishCount > 1) {
//         config.dishCount--
//     }
// }

// 验证菜品数量输入
const validateDishCount = (event: Event) => {
    const target = event.target as HTMLInputElement
    let value = parseInt(target.value)

    if (isNaN(value) || value < 1) {
        config.dishCount = 1
    } else if (value > 20) {
        config.dishCount = 20
    } else {
        config.dishCount = value
    }
}

// 添加自定义菜品
const addCustomDish = () => {
    const dish = currentCustomDish.value.trim()
    if (dish && !config.customDishes.includes(dish) && config.customDishes.length < 3) {
        config.customDishes.push(dish)
        currentCustomDish.value = ''
    }
}

// 移除自定义菜品
const removeCustomDish = (dish: string) => {
    const index = config.customDishes.indexOf(dish)
    if (index > -1) {
        config.customDishes.splice(index, 1)
    }
}

// 测试AI连接 - 暂时未使用
// const testConnection = async () => {
//     try {
//         const isConnected = await testAIConnection()
//         if (isConnected) {
//             alert('AI连接测试成功！')
//         } else {
//             alert('大厨暂时不在厨房，请稍后再试~')
//         }
//     } catch (error) {
//         alert('大厨暂时不在厨房：' + error)
//     }
// }

// 生成一桌菜
const generateTableMenuAction = async () => {
    isGenerating.value = true
    generatingText.value = '正在生成菜单...'

    try {
        // 调用AI服务生成菜单
        const aiDishes = await generateTableMenu(config)

        // 转换为本地格式
        const dishes: DishInfo[] = aiDishes.map(dish => ({
            name: dish.name,
            description: dish.description,
            category: dish.category,
            tags: dish.tags,
            isGeneratingRecipe: false
        }))

        generatedDishes.value = dishes
    } catch (error) {
        console.error('生成菜单失败:', error)
        // 显示错误提示
        alert('大厨表示这个菜单搭配太有挑战性了，哈哈！调整一下要求试试吧~')
    } finally {
        isGenerating.value = false
    }
}

// 阻止背景滚动
const disableBodyScroll = () => {
    document.body.style.overflow = 'hidden'
}

// 恢复背景滚动
const enableBodyScroll = () => {
    document.body.style.overflow = ''
}

// 生成单个菜品的菜谱
const generateDishRecipeAction = async (dish: DishInfo, _index: number) => {
    if (dish.recipe) {
        selectedRecipe.value = dish.recipe
        disableBodyScroll()
        return
    }

    dish.isGeneratingRecipe = true

    try {
        // 调用AI服务生成菜谱
        const recipe = await generateDishRecipe(dish.name, dish.description, dish.category)

        dish.recipe = recipe
        // 移除自动弹出，让用户手动点击查看
        // selectedRecipe.value = recipe
        // disableBodyScroll()
    } catch (error) {
        console.error('生成菜谱失败:', error)
        // 显示友好的错误提示
        alert(`大厨表示"${dish.name}"这道菜太有挑战性了，哈哈！换个菜试试吧~`)
    } finally {
        dish.isGeneratingRecipe = false
    }
}

// 关闭菜谱弹窗
const closeRecipeModal = () => {
    selectedRecipe.value = null
    enableBodyScroll()
}

// 测试弹窗功能 - 暂时未使用
// const testModal = () => {
//     // 创建一个测试菜谱
//     const testRecipe: Recipe = {
//         id: 'test-recipe',
//         name: '测试菜谱 - 红烧肉',
//         cuisine: '中式',
//         ingredients: ['五花肉 500g', '生抽 2勺', '老抽 1勺', '冰糖 30g', '料酒 1勺', '葱段 适量', '姜片 适量'],
//         steps: [
//             { step: 1, description: '五花肉切块，冷水下锅焯水去腥', time: 5 },
//             { step: 2, description: '热锅下油，放入冰糖炒糖色', time: 3 },
//             { step: 3, description: '下入肉块翻炒上色', time: 5 },
//             { step: 4, description: '加入生抽、老抽、料酒调色调味', time: 2 },
//             { step: 5, description: '加入开水没过肉块，大火烧开转小火炖煮', time: 45 }
//         ],
//         cookingTime: 60,
//         difficulty: 'medium',
//         tips: ['糖色要炒到微微冒烟', '炖煮时要小火慢炖', '最后大火收汁']
//     }

//     selectedRecipe.value = testRecipe
// }

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && selectedRecipe.value) {
        closeRecipeModal()
    }
}

// 组件挂载时添加键盘事件监听
onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
})

// 组件卸载时移除键盘事件监听
onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    enableBodyScroll() // 确保组件销毁时恢复滚动
})

// 重置配置
const resetConfig = () => {
    // 只清除生成的结果，保留用户的配置选择
    generatedDishes.value = []
    selectedRecipe.value = null
    // 不重置用户的配置选择，让用户可以基于当前配置重新生成
}
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

/* 弹窗动画 */
.modal-overlay {
    animation: fadeIn 0.3s ease-out;
}

.modal-content {
    animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* 确保弹窗在最顶层 */
.modal-overlay {
    backdrop-filter: blur(4px);
}

/* 隐藏滚动条但保持滚动功能 */
.scrollbar-hide {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
}

/* 折叠动画 */
.collapse-enter-active,
.collapse-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
    max-height: 0;
    opacity: 0;
}

.collapse-enter-to,
.collapse-leave-from {
    max-height: 500px;
    opacity: 1;
}
</style>
