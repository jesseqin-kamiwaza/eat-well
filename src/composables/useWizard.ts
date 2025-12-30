import { ref, computed } from 'vue'

export interface WizardStep {
  title: string
  icon: string
  validate?: () => boolean
}

export function useWizard(steps: WizardStep[]) {
  const currentStep = ref(0)

  const isFirstStep = computed(() => currentStep.value === 0)
  const isLastStep = computed(() => currentStep.value === steps.length - 1)
  const progress = computed(() => ((currentStep.value + 1) / steps.length) * 100)

  const currentStepData = computed(() => steps[currentStep.value])

  const goNext = () => {
    if (!isLastStep.value) {
      // Validate current step
      if (currentStepData.value.validate && !currentStepData.value.validate()) {
        return false
      }
      currentStep.value++
      return true
    }
    return false
  }

  const goPrev = () => {
    if (!isFirstStep.value) {
      currentStep.value--
      return true
    }
    return false
  }

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      currentStep.value = step
    }
  }

  const reset = () => {
    currentStep.value = 0
  }

  return {
    currentStep,
    currentStepData,
    isFirstStep,
    isLastStep,
    progress,
    goNext,
    goPrev,
    goToStep,
    reset
  }
}
