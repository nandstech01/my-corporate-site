import { describe, expect, it } from 'vitest'
import {
  ORGANIZATION,
  SITE_URL,
  organizationNode,
  toJsonLdScript,
} from '@/lib/structured-data/site-entities'
import { WEBSITE_ID, buildSiteGraph, websiteNode } from '@/lib/structured-data/site-graph'

describe('websiteNode', () => {
  it('is the #website node that BlogPosting.isPartOf references', () => {
    expect(WEBSITE_ID).toBe(`${SITE_URL}/#website`)
    expect(websiteNode()).toEqual({
      '@type': 'WebSite',
      '@id': 'https://nands.tech/#website',
      url: 'https://nands.tech',
      name: '株式会社エヌアンドエス',
      inLanguage: 'ja',
      publisher: { '@id': 'https://nands.tech/#organization' },
    })
  })
})

describe('buildSiteGraph', () => {
  it('holds exactly one Organization and one WebSite under a schema.org @context', () => {
    const graph = buildSiteGraph()
    expect(graph['@context']).toBe('https://schema.org')
    expect(graph['@graph'].map((node) => node['@type'])).toEqual(['Organization', 'WebSite'])
  })

  it('uses the single-source Organization node unchanged', () => {
    expect(buildSiteGraph()['@graph'][0]).toEqual(organizationNode())
  })

  it('resolves the WebSite publisher to the Organization in the same graph', () => {
    const [org, site] = buildSiteGraph()['@graph']
    expect(org['@id']).toBe(ORGANIZATION.id)
    expect(site.publisher).toEqual({ '@id': org['@id'] })
  })

  it('declares no certification and no dead X account', () => {
    const json = JSON.stringify(buildSiteGraph())
    expect(json).not.toContain('hasCertification')
    expect(json).not.toMatch(/nands_tech/i)
    expect(buildSiteGraph()['@graph'][0].sameAs).toContain('https://x.com/NANDS_AI')
  })

  it('serializes to script-safe JSON that parses back to the same graph', () => {
    const out = toJsonLdScript(buildSiteGraph())
    expect(out).not.toContain('<')
    expect(JSON.parse(out)).toEqual(buildSiteGraph())
  })
})
