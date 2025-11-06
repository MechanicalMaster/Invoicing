import { describe, it, expect } from 'vitest'
import { getQueryParams, validatePagination, isJsonRequest, isFormDataRequest } from './utils'

describe('API Utility Functions', () => {
  describe('getQueryParams', () => {
    it('should extract query parameters with defaults', () => {
      const searchParams = new URLSearchParams()
      const result = getQueryParams(searchParams)

      expect(result).toEqual({
        page: 1,
        limit: 50,
        search: '',
        cursor: undefined,
      })
    })

    it('should parse page and limit as numbers', () => {
      const searchParams = new URLSearchParams('page=3&limit=25')
      const result = getQueryParams(searchParams)

      expect(result.page).toBe(3)
      expect(result.limit).toBe(25)
    })

    it('should handle search parameter', () => {
      const searchParams = new URLSearchParams('search=invoice')
      const result = getQueryParams(searchParams)

      expect(result.search).toBe('invoice')
    })

    it('should handle cursor parameter', () => {
      const searchParams = new URLSearchParams('cursor=abc123')
      const result = getQueryParams(searchParams)

      expect(result.cursor).toBe('abc123')
    })
  })

  describe('validatePagination', () => {
    it('should return valid pagination with correct offset', () => {
      const result = validatePagination(2, 10)

      expect(result).toEqual({
        page: 2,
        limit: 10,
        offset: 10,
      })
    })

    it('should constrain page to minimum of 1', () => {
      const result = validatePagination(0, 10)

      expect(result.page).toBe(1)
      expect(result.offset).toBe(0)
    })

    it('should constrain limit to maximum of 100', () => {
      const result = validatePagination(1, 200)

      expect(result.limit).toBe(100)
    })

    it('should constrain limit to minimum of 1', () => {
      const result = validatePagination(1, 0)

      expect(result.limit).toBe(1)
    })

    it('should calculate offset correctly', () => {
      const result = validatePagination(3, 20)

      expect(result.offset).toBe(40) // (3-1) * 20
    })
  })

  describe('isJsonRequest', () => {
    it('should return true for JSON content type', () => {
      const request = new Request('http://localhost', {
        headers: {
          'content-type': 'application/json',
        },
      })

      expect(isJsonRequest(request)).toBe(true)
    })

    it('should return true for JSON with charset', () => {
      const request = new Request('http://localhost', {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
      })

      expect(isJsonRequest(request)).toBe(true)
    })

    it('should return false for non-JSON content type', () => {
      const request = new Request('http://localhost', {
        headers: {
          'content-type': 'text/plain',
        },
      })

      expect(isJsonRequest(request)).toBe(false)
    })

    it('should return false when content-type header is missing', () => {
      const request = new Request('http://localhost')

      expect(isJsonRequest(request)).toBe(false)
    })
  })

  describe('isFormDataRequest', () => {
    it('should return true for multipart/form-data content type', () => {
      const request = new Request('http://localhost', {
        headers: {
          'content-type': 'multipart/form-data; boundary=---123',
        },
      })

      expect(isFormDataRequest(request)).toBe(true)
    })

    it('should return false for non-FormData content type', () => {
      const request = new Request('http://localhost', {
        headers: {
          'content-type': 'application/json',
        },
      })

      expect(isFormDataRequest(request)).toBe(false)
    })

    it('should return false when content-type header is missing', () => {
      const request = new Request('http://localhost')

      expect(isFormDataRequest(request)).toBe(false)
    })
  })
})
