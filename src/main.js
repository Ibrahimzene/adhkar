// JavaScript functionality for Adhkar Website

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const morningTab = document.getElementById("morning-tab")
  const eveningTab = document.getElementById("evening-tab")
  const morningSection = document.getElementById("morning-section")
  const eveningSection = document.getElementById("evening-section")
  const themeToggleBtn = document.getElementById("theme-toggle-btn")
  const themeIcon = themeToggleBtn.querySelector("i")
  const decreaseFontBtn = document.getElementById("decrease-font")
  const increaseFontBtn = document.getElementById("increase-font")
  const counterBtns = document.querySelectorAll(".counter-btn")
  const markReadBtns = document.querySelectorAll(".mark-read-btn")
  const shareBtns = document.querySelectorAll(".share-btn")

  // Tab switching functionality
  morningTab.addEventListener("click", function () {
    morningTab.classList.add("active")
    eveningTab.classList.remove("active")
    morningSection.classList.add("active")
    eveningSection.classList.remove("active")
    saveState("activeTab", "morning")
  })

  eveningTab.addEventListener("click", function () {
    eveningTab.classList.add("active")
    morningTab.classList.remove("active")
    eveningSection.classList.add("active")
    morningSection.classList.remove("active")
    saveState("activeTab", "evening")
  })

  // Theme toggle functionality
  themeToggleBtn.addEventListener("click", function () {
    const currentTheme = document.documentElement.getAttribute("data-theme")
    const newTheme = currentTheme === "dark" ? "light" : "dark"

    document.documentElement.setAttribute("data-theme", newTheme)

    // Update icon
    if (newTheme === "dark") {
      themeIcon.classList.remove("fa-moon")
      themeIcon.classList.add("fa-sun")
    } else {
      themeIcon.classList.remove("fa-sun")
      themeIcon.classList.add("fa-moon")
    }

    saveState("theme", newTheme)
  })

  // Font size control
  decreaseFontBtn.addEventListener("click", function () {
    changeFontSize(-1)
  })

  increaseFontBtn.addEventListener("click", function () {
    changeFontSize(1)
  })

  // Counter functionality
  counterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const action = this.getAttribute("data-action")
      const counterText =
        this.closest(".dhikr-counter").querySelector(".counter-text")
      const counterValue = counterText.textContent

      if (action === "increment") {
        incrementCounter(counterText, counterValue)
      } else if (action === "reset") {
        resetCounter(counterText)
      }

      // Save counter state
      const dhikrCard = this.closest(".dhikr-card")
      const dhikrId = Array.from(dhikrCard.parentNode.children).indexOf(
        dhikrCard
      )
      const section = dhikrCard.closest(".adhkar-section").id
      saveCounterState(section, dhikrId, counterText.textContent)
    })
  })

  // Mark as read functionality
  markReadBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const dhikrCard = this.closest(".dhikr-card")
      dhikrCard.classList.toggle("completed")

      if (dhikrCard.classList.contains("completed")) {
        this.innerHTML = 'تمت القراءة <i class="fas fa-check-circle"></i>'
        this.classList.add("completed")
      } else {
        this.innerHTML = 'تم القراءة <i class="far fa-check-circle"></i>'
        this.classList.remove("completed")
      }

      // Save completion state
      const dhikrId = Array.from(dhikrCard.parentNode.children).indexOf(
        dhikrCard
      )
      const section = dhikrCard.closest(".adhkar-section").id
      saveCompletionState(
        section,
        dhikrId,
        dhikrCard.classList.contains("completed")
      )
    })
  })

  // Share functionality
  shareBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const dhikrCard = this.closest(".dhikr-card")
      const dhikrTitle = dhikrCard.querySelector("h3").textContent
      const dhikrText = dhikrCard.querySelector(".arabic-text").textContent

      if (navigator.share) {
        navigator
          .share({
            title: "أذكار الصباح والمساء",
            text: `${dhikrTitle}: ${dhikrText}`,
            url: window.location.href,
          })
          .catch((error) => {
            console.error("Error sharing:", error)
            alert("حدث خطأ أثناء المشاركة")
          })
      } else {
        // Fallback for browsers that don't support Web Share API
        const textArea = document.createElement("textarea")
        textArea.value = `${dhikrTitle}: ${dhikrText}`
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        alert("تم نسخ الذكر إلى الحافظة")
      }
    })
  })

  // Helper functions
  function incrementCounter(counterElement, currentValue) {
    if (currentValue.includes("/")) {
      // Handle counters with max value (e.g., 1/3)
      const [current, max] = currentValue.split("/").map(Number)
      if (current < max) {
        counterElement.textContent = `${current + 1}/${max}`
      } else {
        // Reset to 1 when max is reached
        counterElement.textContent = `1/${max}`
      }
    } else {
      // Simple counter without max value
      counterElement.textContent = Number(currentValue) + 1
    }
  }

  function resetCounter(counterElement) {
    const currentValue = counterElement.textContent
    if (currentValue.includes("/")) {
      // Reset to 1/max for counters with max value
      const max = currentValue.split("/")[1]
      counterElement.textContent = `1/${max}`
    } else {
      // Reset to 1 for simple counters
      counterElement.textContent = "1"
    }
  }

  function changeFontSize(delta) {
    const root = document.documentElement
    const currentSize = parseFloat(getComputedStyle(root).fontSize)
    const newSize = currentSize + delta

    // Limit font size between 12px and 24px
    if (newSize >= 12 && newSize <= 24) {
      root.style.fontSize = `${newSize}px`
      saveState("fontSize", newSize)
    }
  }

  // Local storage functions
  function saveState(key, value) {
    localStorage.setItem(`adhkar_${key}`, JSON.stringify(value))
  }

  function loadState(key) {
    const value = localStorage.getItem(`adhkar_${key}`)
    return value ? JSON.parse(value) : null
  }

  function saveCounterState(section, dhikrId, value) {
    const counters = loadState("counters") || {}
    if (!counters[section]) counters[section] = {}
    counters[section][dhikrId] = value
    saveState("counters", counters)
  }

  function saveCompletionState(section, dhikrId, completed) {
    const completions = loadState("completions") || {}
    if (!completions[section]) completions[section] = {}
    completions[section][dhikrId] = completed
    saveState("completions", completions)
  }

  // Load saved states on page load
  function loadSavedStates() {
    // Load theme
    const savedTheme = loadState("theme")
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme)
      if (savedTheme === "dark") {
        themeIcon.classList.remove("fa-moon")
        themeIcon.classList.add("fa-sun")
      }
    }

    // Load font size
    const savedFontSize = loadState("fontSize")
    if (savedFontSize) {
      document.documentElement.style.fontSize = `${savedFontSize}px`
    }

    // Load active tab
    const savedTab = loadState("activeTab")
    if (savedTab === "evening") {
      eveningTab.click()
    }

    // Load counter values
    const savedCounters = loadState("counters")
    if (savedCounters) {
      Object.keys(savedCounters).forEach((section) => {
        const sectionElement = document.getElementById(`${section}-section`)
        if (sectionElement) {
          const dhikrCards = sectionElement.querySelectorAll(".dhikr-card")
          Object.keys(savedCounters[section]).forEach((dhikrId) => {
            const dhikrCard = dhikrCards[dhikrId]
            if (dhikrCard) {
              const counterText = dhikrCard.querySelector(".counter-text")
              if (counterText) {
                counterText.textContent = savedCounters[section][dhikrId]
              }
            }
          })
        }
      })
    }

    // Load completion states
    const savedCompletions = loadState("completions")
    if (savedCompletions) {
      Object.keys(savedCompletions).forEach((section) => {
        const sectionElement = document.getElementById(`${section}-section`)
        if (sectionElement) {
          const dhikrCards = sectionElement.querySelectorAll(".dhikr-card")
          Object.keys(savedCompletions[section]).forEach((dhikrId) => {
            const dhikrCard = dhikrCards[dhikrId]
            if (dhikrCard && savedCompletions[section][dhikrId]) {
              dhikrCard.classList.add("completed")
              const markReadBtn = dhikrCard.querySelector(".mark-read-btn")
              if (markReadBtn) {
                markReadBtn.innerHTML =
                  'تمت القراءة <i class="fas fa-check-circle"></i>'
                markReadBtn.classList.add("completed")
              }
            }
          })
        }
      })
    }
  }

  // Initialize the app
  loadSavedStates()

  // Add swipe gesture support for mobile devices
  let touchStartX = 0
  let touchEndX = 0

  document.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX
    },
    false
  )

  document.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX
      handleSwipe()
    },
    false
  )

  function handleSwipe() {
    const swipeThreshold = 100
    if (touchEndX - touchStartX > swipeThreshold) {
      // Swipe right - show morning
      morningTab.click()
    } else if (touchStartX - touchEndX > swipeThreshold) {
      // Swipe left - show evening
      eveningTab.click()
    }
  }
})
