'use client'

import { useState } from 'react'
import PartnerLogin from '../../components/partner-admin/PartnerLogin'
import PartnerDashboard from '../../components/partner-admin/PartnerDashboard'

export default function PartnerAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PartnerLogin onLoginSuccess={() => setIsAuthenticated(true)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDashboard />
    </div>
  )
} 