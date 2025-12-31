/**
 * A/B Testing Configuration
 *
 * Usage:
 * ```ts
 * import { useABTest } from '@/config/abTest'
 *
 * // In component
 * const showNewFeature = useABTest('newHomepage')
 * ```
 */

/**
 * A/B Test Configuration
 * - enabled: Whether the test is active
 * - rollout: Percentage of users to show the new feature (0-1)
 */
export const abTestConfig = {
  // 新首页（Phase 2）
  newHomepage: {
    enabled: true,
    rollout: 1.0, // 100% 用户 - Phase 2 已完成，全量发布
    description: '新版首页（1步生成流程 vs 3步wizard）'
  },

  // RecipeCardV2（Phase 3）
  newRecipeCard: {
    enabled: true,
    rollout: 0.5, // 50% 用户
    description: 'RecipeCardV2大图卡片 vs 旧版RecipeCard'
  },

  // BottomSheet（Phase 3）
  mobileBottomSheet: {
    enabled: true,
    rollout: 1.0, // 100% 移动端用户
    description: '移动端BottomSheet vs 居中Modal'
  },

  // 图片懒加载（Phase 4）
  imageLazyLoading: {
    enabled: true,
    rollout: 1.0, // 100% 用户
    description: '图片懒加载优化'
  },

  // 示例：未来的功能测试
  aiChef: {
    enabled: false,
    rollout: 0.1, // 10% 用户
    description: 'AI厨师语音助手'
  }
} as const

type ABTestName = keyof typeof abTestConfig

/**
 * Simple hash function for consistent user bucketing
 */
const simpleHash = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Get or create user ID for A/B testing
 */
const getUserId = (): string => {
  const USER_ID_KEY = 'ab-test-user-id'
  let userId = localStorage.getItem(USER_ID_KEY)

  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(USER_ID_KEY, userId)
  }

  return userId
}

/**
 * Determine if user should see the new feature in A/B test
 *
 * @param testName - Name of the A/B test
 * @returns true if user should see new feature, false otherwise
 *
 * @example
 * ```ts
 * const showNewFeature = useABTest('newHomepage')
 * if (showNewFeature) {
 *   // Show new homepage
 * } else {
 *   // Show old homepage
 * }
 * ```
 */
export const useABTest = (testName: ABTestName): boolean => {
  const config = abTestConfig[testName]

  // Test not enabled
  if (!config.enabled) return false

  // 100% rollout
  if (config.rollout >= 1.0) return true

  // 0% rollout
  if (config.rollout <= 0) return false

  // Consistent bucketing based on user ID
  const userId = getUserId()
  const hash = simpleHash(userId + testName)
  const bucket = (hash % 100) / 100

  return bucket < config.rollout
}

/**
 * Get all active A/B tests for current user
 *
 * @returns Object with test names as keys and boolean values
 */
export const getActiveTests = (): Record<ABTestName, boolean> => {
  const result = {} as Record<ABTestName, boolean>

  for (const testName in abTestConfig) {
    result[testName as ABTestName] = useABTest(testName as ABTestName)
  }

  return result
}

/**
 * Force enable/disable a test (for development/debugging)
 * Stored in localStorage
 *
 * @param testName - Name of the test
 * @param enabled - Force enable (true) or disable (false), or reset (null)
 */
export const forceABTest = (
  testName: ABTestName,
  enabled: boolean | null
): void => {
  const FORCE_KEY = `ab-test-force-${testName}`

  if (enabled === null) {
    localStorage.removeItem(FORCE_KEY)
  } else {
    localStorage.setItem(FORCE_KEY, enabled ? '1' : '0')
  }
}

/**
 * Check if test is force-enabled/disabled
 */
const getForcedTest = (testName: ABTestName): boolean | null => {
  const FORCE_KEY = `ab-test-force-${testName}`
  const value = localStorage.getItem(FORCE_KEY)

  if (value === null) return null
  return value === '1'
}

/**
 * Enhanced useABTest that respects force overrides
 */
export const useABTestWithForce = (testName: ABTestName): boolean => {
  const forced = getForcedTest(testName)
  if (forced !== null) return forced

  return useABTest(testName)
}

/**
 * Log A/B test assignment (for analytics)
 */
export const logABTestAssignment = (
  testName: ABTestName,
  variant: 'control' | 'treatment'
): void => {
  // In production, send to analytics service
  console.log('[A/B Test]', {
    test: testName,
    variant,
    userId: getUserId(),
    timestamp: new Date().toISOString()
  })

  // Store in localStorage for debugging
  const LOG_KEY = 'ab-test-assignments'
  const logs = JSON.parse(localStorage.getItem(LOG_KEY) || '[]')
  logs.push({
    test: testName,
    variant,
    timestamp: new Date().toISOString()
  })
  localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(-100))) // Keep last 100
}
