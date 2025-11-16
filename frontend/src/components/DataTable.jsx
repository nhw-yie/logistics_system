import React, { useEffect, useState } from 'react'
import './datatable.css'
import { apiGet } from '../services/api'

function flattenKeys(obj, prefix = '') {
  const keys = []
  for (const k of Object.keys(obj || {})) {
    if (k === '@class' || k === '@rid' || k === '@version') continue
    const v = obj[k]
    const path = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      for (const sub of flattenKeys(v, path)) keys.push(sub)
    } else {
      keys.push(path)
    }
  }
  return keys
}

function getValue(obj, path) {
  return path.split('.').reduce((acc, p) => (acc ? acc[p] : undefined), obj)
}

export default function DataTable({ apiPath = '/nhacungcap', title = '' }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    apiGet(apiPath)
      .then((json) => {
        // debug: log raw response to help diagnose empty results
        console.debug('[DataTable] fetched', apiPath, json)
        const arr = Array.isArray(json) ? json : (json.result && Array.isArray(json.result) ? json.result : [])
        if (mounted) setData(arr)
      })
      .catch((err) => setError(err.message || String(err)))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [apiPath])

  if (loading) return <div className="dt-loading">Loading {title}...</div>
  if (error) return <div className="dt-error">Error: {error}</div>
  if (!data || !Array.isArray(data) || data.length === 0) return <div className="dt-empty">No records found.</div>

  const columns = flattenKeys(data[0])

  return (
    <div className="dt-root">
      {title && <h3 className="dt-title">{title}</h3>}
      <div className="dt-table-wrap">
        <table className="dt-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c}>{String(getValue(row, c) ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
