/**
 * 全ページ共通の JSON-LD (app/layout.tsx が素の <script> で出力する)。
 *
 * Organization の完全ノードと、記事の isPartOf が参照する WebSite (#website) を 1 つの @graph に置く。
 * 中身は site-entities.ts だけから組み立て、ここで事実を足さない。
 */
import { ORGANIZATION, SITE_URL, organizationNode, organizationRef } from './site-entities'

export const WEBSITE_ID = `${SITE_URL}/#website`

export function websiteNode() {
  return {
    '@type': 'WebSite' as const,
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: ORGANIZATION.name,
    inLanguage: 'ja',
    publisher: organizationRef(),
  }
}

export function buildSiteGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationNode(), websiteNode()] as const,
  }
}
