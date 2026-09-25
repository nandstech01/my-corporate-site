import { describe, expect, it } from 'vitest'
import {
  AUTHOR,
  ORGANIZATION,
  SITE_URL,
  organizationNode,
  organizationRef,
  personNode,
  personRef,
  postUrl,
  toJsonLdScript,
} from '@/lib/structured-data/site-entities'

describe('toJsonLdScript', () => {
  it('escapes "<" so a value cannot close the <script> tag', () => {
    const out = toJsonLdScript({ name: 'a</script><script>alert(1)</script>' })
    expect(out).not.toContain('<')
    expect(out).toContain('\\u003c/script>')
  })

  it('escapes every "<", including HTML comment openers', () => {
    const out = toJsonLdScript({ a: '<!--', b: ['<', '<<'] })
    expect(out).not.toContain('<')
    expect(out.match(/\\u003c/g)).toHaveLength(4)
  })

  it('round-trips through JSON.parse to the original object', () => {
    const obj = { '@context': 'https://schema.org', name: '原田賢治 <x> & "q"', n: 1, list: [null, true] }
    expect(JSON.parse(toJsonLdScript(obj))).toEqual(obj)
  })
})

describe('postUrl', () => {
  it('leaves an ASCII slug unchanged', () => {
    expect(postUrl('self-healing-rag-design-jua09i')).toBe(`${SITE_URL}/posts/self-healing-rag-design-jua09i`)
  })

  it('percent-encodes a Japanese slug exactly like the production canonical', () => {
    // 本番 https://nands.tech/posts/seoから次の時代へre の <link rel="canonical"> を実測した値
    expect(postUrl('seoから次の時代へre')).toBe(
      'https://nands.tech/posts/seo%E3%81%8B%E3%82%89%E6%AC%A1%E3%81%AE%E6%99%82%E4%BB%A3%E3%81%B8re'
    )
  })

  it('does not double-encode a slug that is already percent-encoded (e.g. params.slug)', () => {
    const raw = 'model-context-protocol-mcp-徹底解説-aiとデ-タの壁を取り払う革新的な標準基盤'
    expect(postUrl(encodeURIComponent(raw))).toBe(postUrl(raw))
  })

  it('normalizes lowercase percent-escapes to uppercase', () => {
    expect(postUrl('seo%e3%81%8bre')).toBe(`${SITE_URL}/posts/seo%E3%81%8Bre`)
  })

  it('encodes characters that would break the path and survives a stray "%"', () => {
    expect(postUrl('a b?c#d/e')).toBe(`${SITE_URL}/posts/a%20b%3Fc%23d%2Fe`)
    expect(postUrl('100%-real')).toBe(`${SITE_URL}/posts/100%25-real`)
  })
})

describe('entity nodes', () => {
  it('person and organization reference each other by @id', () => {
    const person = personNode()
    const org = organizationNode()
    expect(person['@id']).toBe('https://nands.tech/author/harada-kenji#person')
    expect(org['@id']).toBe('https://nands.tech/#organization')
    expect(person.worksFor).toEqual(organizationRef())
    expect(org.founder).toEqual(personRef())
    expect(personRef()).toEqual({ '@id': AUTHOR.id })
    expect(organizationRef()).toEqual({ '@id': ORGANIZATION.id })
  })

  it('carries the agreed facts', () => {
    const person = personNode()
    const org = organizationNode()
    expect(person.name).toBe('原田賢治')
    expect(person.jobTitle).toBe('代表取締役')
    expect(person.url).toBe('https://nands.tech/author/harada-kenji')
    expect(org.name).toBe('株式会社エヌアンドエス')
    expect(org.identifier).toMatchObject({ propertyID: '法人番号', value: '2160001004065' })
    expect(org.foundingDate).toBe('2008-04')
    expect(org.telephone).toBe('0120-407-638')
    expect(org.address).toMatchObject({ postalCode: '520-0025', streetAddress: '皇子が丘2丁目10-25-3004号' })
    expect(org.logo).toMatchObject({ url: 'https://nands.tech/images/logo.svg' })
  })

  it('keeps personal and company accounts apart and excludes known-wrong accounts', () => {
    const person = personNode()
    const org = organizationNode()
    expect(person.sameAs).toContain('https://orcid.org/0009-0007-2241-9100')
    expect(person.sameAs).toHaveLength(6)
    expect(org.sameAs).toEqual([
      'https://x.com/NANDS_AI',
      'https://github.com/nandstech01',
      'https://www.linkedin.com/company/nands-tech',
    ])
    const all = [...person.sameAs, ...org.sameAs].join(' ')
    expect(all).not.toMatch(/github\.com\/nands-tech|facebook\.com\/nands\.tech|nands_tech/i)
    expect(person.sameAs.some((u) => org.sameAs.includes(u))).toBe(false)
  })

  it('returns fresh objects so callers cannot mutate the shared definition', () => {
    const a = personNode()
    a.sameAs.push('https://example.com')
    expect(personNode().sameAs).toHaveLength(6)
    expect(AUTHOR.sameAs).toHaveLength(6)
  })
})
