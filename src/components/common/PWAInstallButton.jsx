import React, { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { getInstallPrompt, showInstallPrompt, isPWA } from '@/utils/pwaUtils'

/**
 * PWA Install Button Component
 * Shows an install button to users who can install the app
 */
export default function PWAInstallButton() {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if install prompt is available
    const prompt = getInstallPrompt()
    setCanInstall(prompt !== null)

    // Check if app is already installed
    setIsInstalled(isPWA())
  }, [])

  if (isInstalled) {
    return null // Don't show if already installed
  }

  if (!canInstall) {
    return null // Don't show if can't install
  }

  return (
    <button
      onClick={showInstallPrompt}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      title="Install Dhuripara app on your device"
    >
      <Download size={18} />
      <span>Install App</span>
    </button>
  )
}
