'use client'

import { useState, useEffect, useCallback } from 'react'

interface Lead {
  readonly id: string
  readonly email: string
  readonly status: string
  readonly lead_tier: string | null
  readonly lead_score: number | null
  readonly service_type: string | null
  readonly budget: string
  readonly industry: string
  readonly created_at: string
  readonly estimated_price: number | null
  readonly utm_source: string
}

interface LeadResponse {
  readonly success: boolean
  readonly data: readonly Lead[]
  readonly meta: { readonly total: number; readonly page: number; readonly limit: number }
}

const STATUS_LABELS: Record<string, string> = {
  new: '新規',
  contacted: '連絡済',
  qualified: '見込み',
  proposal: '提案中',
  negotiation: '交渉中',
  won: '成約',
  lost: '失注',
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-purple-100 text-purple-700',
  proposal: 'bg-cyan-100 text-cyan-700',
  negotiation: 'bg-orange-100 text-orange-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-gray-100 text-gray-500',
}

const TIER_LABELS: Record<string, string> = {
  hot: 'Hot',
  warm: 'Warm',
  cold: 'Cold',
}

const TIER_COLORS: Record<string, string> = {
  hot: 'bg-red-100 text-red-700',
  warm: 'bg-yellow-100 text-yellow-700',
  cold: 'bg-blue-100 text-blue-700',
}

function formatPrice(price: number): string {
  if (price >= 10000) return `${Math.round(price / 10000)}万円`
  return `${price.toLocaleString()}円`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<readonly Lead[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [apiKey, setApiKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)

  const fetchLeads = useCallback(async () => {
    if (!apiKey) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (statusFilter) params.set('status', statusFilter)
      if (tierFilter) params.set('tier', tierFilter)

      const res = await fetch(`/api/admin/leads?${params}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      const data: LeadResponse = await res.json()
      if (data.success) {
        setLeads(data.data)
        setTotal(data.meta.total)
        setAuthenticated(true)
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [apiKey, page, statusFilter, tierFilter])

  useEffect(() => {
    if (apiKey) fetchLeads()
  }, [fetchLeads, apiKey])

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      await fetchLeads()
    } catch {
      // Silently handle
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-xl font-bold mb-4">Lead Management</h1>
          <input
            type="password"
            placeholder="Admin API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') fetchLeads()
            }}
            className="w-full border rounded-lg px-4 py-2.5 text-sm mb-4"
          />
          <button
            type="button"
            onClick={fetchLeads}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Lead Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {total} leads total
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={tierFilter}
            onChange={(e) => {
              setTierFilter(e.target.value)
              setPage(1)
            }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Tiers</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Tier</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Score</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Service</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Budget</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Est. Price</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {lead.email}
                      </td>
                      <td className="px-4 py-3">
                        {lead.lead_tier && (
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${TIER_COLORS[lead.lead_tier] ?? ''}`}>
                            {TIER_LABELS[lead.lead_tier] ?? lead.lead_tier}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {lead.lead_score ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {lead.service_type ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {lead.budget || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {lead.estimated_price ? formatPrice(lead.estimated_price) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border-0 cursor-pointer ${STATUS_COLORS[lead.status] ?? 'bg-gray-100'}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {lead.utm_source || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {Math.ceil(total / 20)}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= total}
              className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
