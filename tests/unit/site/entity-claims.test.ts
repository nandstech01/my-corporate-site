import { describe, expect, it } from 'vitest'
import { ORGANIZATION } from '@/lib/structured-data/site-entities'
import {
  createJapaneseGovernmentBenefits,
  generateLatestOrganizationSchema,
} from '@/lib/structured-data/schema-org-latest'
import { SERVICE_ENTITIES } from '@/lib/structured-data/entity-relationships'

/** 構造化データに根拠のない認証・助成金・政府 @id が戻ってこないか */

describe('generateLatestOrganizationSchema', () => {
  const base = { '@id': ORGANIZATION.id, name: ORGANIZATION.name, description: 'x', url: ORGANIZATION.url }

  it('emits no subsidy (GovernmentService) or japaneseEnterpriseFeatures markup as the home page calls it', () => {
    const org = generateLatestOrganizationSchema(base, {
      includeAITransparency: true,
      includeGovernmentBenefits: false,
    })
    expect(org).not.toHaveProperty('providesGovernmentService')
    expect(org).not.toHaveProperty('japaneseEnterpriseFeatures')
    expect(org).not.toHaveProperty('hasCertification')
    expect(org['@id']).toBe(ORGANIZATION.id)
  })
})

describe('createJapaneseGovernmentBenefits', () => {
  it('does not invent @ids on a non-existent government domain', () => {
    for (const benefit of createJapaneseGovernmentBenefits()) {
      expect(benefit).not.toHaveProperty('@id')
    }
    expect(JSON.stringify(createJapaneseGovernmentBenefits())).not.toMatch(/gov\.japan/)
  })
})

describe('SERVICE_ENTITIES faq-tech-3 (security FAQ fragment)', () => {
  it('does not list ISO27001, which the company does not hold', () => {
    const fragment = SERVICE_ENTITIES.find((entity) => entity['@id'] === 'https://nands.tech/faq#faq-tech-3')
    expect(fragment).toBeDefined()
    expect(JSON.stringify(fragment)).not.toMatch(/ISO\s*\/?\s*(IEC\s*)?27001/i)
  })
})
