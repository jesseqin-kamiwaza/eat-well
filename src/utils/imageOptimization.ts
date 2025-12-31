/**
 * Image optimization utilities for lazy loading and performance
 *
 * Usage in component:
 * ```ts
 * import { setupLazyLoading } from '@/utils/imageOptimization'
 * import { onMounted, onUnmounted } from 'vue'
 *
 * let imageObserver: IntersectionObserver | null = null
 *
 * onMounted(() => {
 *   imageObserver = setupLazyLoading()
 * })
 *
 * onUnmounted(() => {
 *   imageObserver?.disconnect()
 * })
 * ```
 *
 * Usage in template:
 * ```html
 * <img
 *   data-src="/real-image.jpg"
 *   src="/placeholder.jpg"
 *   class="lazy-load"
 *   alt="Description"
 * />
 * ```
 */

/**
 * Setup lazy loading for images using Intersection Observer
 *
 * @param options - IntersectionObserver options
 * @returns IntersectionObserver instance
 */
export const setupLazyLoading = (
  options?: IntersectionObserverInit
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    // Start loading when image is 50px from viewport
    rootMargin: '50px',
    // Trigger when 10% of the image is visible
    threshold: 0.1,
    ...options
  }

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        const src = img.dataset.src

        if (src) {
          // Load the real image
          img.src = src

          // Remove data-src to prevent reloading
          img.removeAttribute('data-src')

          // Add loaded class for CSS transitions
          img.classList.add('lazy-loaded')

          // Stop observing this image
          imageObserver.unobserve(img)
        }
      }
    })
  }, defaultOptions)

  // Observe all images with data-src attribute
  const lazyImages = document.querySelectorAll('img[data-src]')
  lazyImages.forEach(img => {
    imageObserver.observe(img)
  })

  return imageObserver
}

/**
 * Preload critical images (above the fold)
 *
 * @param urls - Array of image URLs to preload
 */
export const preloadImages = (urls: string[]): Promise<void[]> => {
  const promises = urls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    })
  })

  return Promise.all(promises)
}

/**
 * Generate responsive image srcset for different screen sizes
 *
 * @param baseUrl - Base URL of the image
 * @param sizes - Array of widths for responsive images
 * @returns srcset string
 */
export const generateSrcSet = (
  baseUrl: string,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1920]
): string => {
  return sizes
    .map(size => `${baseUrl}?w=${size} ${size}w`)
    .join(', ')
}

/**
 * Get optimal image format based on browser support
 *
 * @returns Preferred image format
 */
export const getOptimalImageFormat = (): 'webp' | 'avif' | 'jpg' => {
  // Check AVIF support
  const avifSupport = document.createElement('canvas')
    .toDataURL('image/avif')
    .startsWith('data:image/avif')

  if (avifSupport) return 'avif'

  // Check WebP support
  const webpSupport = document.createElement('canvas')
    .toDataURL('image/webp')
    .startsWith('data:image/webp')

  if (webpSupport) return 'webp'

  // Fallback to JPEG
  return 'jpg'
}

/**
 * Create blur placeholder from image URL
 *
 * @param url - Image URL
 * @param quality - Quality of the placeholder (0-100)
 * @returns Base64 blur placeholder
 */
export const createBlurPlaceholder = async (
  url: string,
  quality = 10
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // Set small canvas size for blur effect
      canvas.width = quality
      canvas.height = (quality * img.height) / img.width

      // Draw downscaled image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Convert to base64
      resolve(canvas.toDataURL('image/jpeg', 0.5))
    }

    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}
