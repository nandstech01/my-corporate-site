import { describe, it, expect } from 'vitest'
import { isLoginWall, isErrorPage } from '../../../lib/x-playwright/session'

describe('isLoginWall', () => {
  it('detects /i/flow/login URL', () => {
    expect(isLoginWall('https://x.com/i/flow/login', '')).toBe(true)
  })

  it('detects /login URL', () => {
    expect(isLoginWall('https://x.com/login', '')).toBe(true)
  })

  it('detects "Log in to X" title', () => {
    expect(isLoginWall('https://x.com/nands_tech', 'Log in to X')).toBe(true)
  })

  it('detects "Log in to Twitter" title', () => {
    expect(isLoginWall('https://x.com/nands_tech', 'Log in to Twitter')).toBe(true)
  })

  it('returns false for normal profile page', () => {
    expect(isLoginWall('https://x.com/nands_tech', 'nands_tech (@nands_tech) / X')).toBe(false)
  })

  it('returns false for normal tweet page', () => {
    expect(
      isLoginWall('https://x.com/nands_tech/status/12345', 'nands_tech on X'),
    ).toBe(false)
  })

  it('returns false for empty inputs', () => {
    expect(isLoginWall('', '')).toBe(false)
  })
})

describe('isErrorPage', () => {
  it('detects account restricted page', () => {
    expect(isErrorPage('https://x.com/account/access', '')).toBe('account_restricted')
  })

  it('detects "Something went wrong" title', () => {
    expect(isErrorPage('https://x.com/', 'Something went wrong')).toBe('something_went_wrong')
  })

  it('detects suspended account', () => {
    expect(
      isErrorPage('https://x.com/bad_user', 'This account has been suspended'),
    ).toBe('account_suspended')
  })

  it('detects page not found', () => {
    expect(
      isErrorPage('https://x.com/nonexistent', "Hmm...this page doesn't exist"),
    ).toBe('page_not_found')
  })

  it('detects rate limit from title', () => {
    expect(isErrorPage('https://x.com/', 'Rate limit exceeded')).toBe('rate_limited')
  })

  it('detects "Try again later" title', () => {
    expect(isErrorPage('https://x.com/', 'Try again later')).toBe('rate_limited')
  })

  it('detects Japanese page not found', () => {
    expect(
      isErrorPage('https://x.com/nonexistent', 'このページは存在しません'),
    ).toBe('page_not_found')
  })

  it('detects Japanese suspended account', () => {
    expect(
      isErrorPage('https://x.com/bad_user', 'アカウントは凍結されています'),
    ).toBe('account_suspended')
  })

  it('returns null for normal page', () => {
    expect(isErrorPage('https://x.com/nands_tech', 'nands_tech / X')).toBeNull()
  })

  it('returns null for empty inputs', () => {
    expect(isErrorPage('', '')).toBeNull()
  })
})
