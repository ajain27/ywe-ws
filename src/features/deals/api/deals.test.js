import { beforeEach, describe, expect, it, vi } from 'vitest'

const firestoreMocks = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn((db, path) => ({ db, path })),
  doc: vi.fn((db, path, id) => ({ db, path, id })),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
  orderBy: vi.fn((field, dir) => ({ field, dir })),
  query: vi.fn((ref, ...clauses) => ({ ref, clauses })),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}))

vi.mock('firebase/firestore', () => firestoreMocks)

describe('deals api, firebase configured', () => {
  let addDeal, subscribeToDeals, getDeal, addOffer
  const fakeDb = { name: 'fake-db' }

  beforeEach(async () => {
    vi.resetModules()
    Object.values(firestoreMocks).forEach((mockFn) => mockFn.mockClear())
    vi.doMock('../../../lib/firebase', () => ({ db: fakeDb }))
    ;({ addDeal, subscribeToDeals, getDeal, addOffer } = await import('./deals'))
  })

  it('addDeal writes to the deals collection with a server timestamp', async () => {
    firestoreMocks.addDoc.mockResolvedValueOnce({ id: 'new-id' })

    await addDeal({ address: '123 Main St' })

    expect(firestoreMocks.collection).toHaveBeenCalledWith(fakeDb, 'deals')
    expect(firestoreMocks.addDoc).toHaveBeenCalledWith(
      { db: fakeDb, path: 'deals' },
      { address: '123 Main St', createdAt: 'SERVER_TIMESTAMP' },
    )
  })

  it('addOffer writes to the offers collection with a server timestamp', async () => {
    firestoreMocks.addDoc.mockResolvedValueOnce({ id: 'offer-id' })

    await addOffer({ dealId: 'abc', buyerName: 'Jane' })

    expect(firestoreMocks.collection).toHaveBeenCalledWith(fakeDb, 'offers')
    expect(firestoreMocks.addDoc).toHaveBeenCalledWith(
      { db: fakeDb, path: 'offers' },
      { dealId: 'abc', buyerName: 'Jane', createdAt: 'SERVER_TIMESTAMP' },
    )
  })

  it('getDeal returns the document data with its id when it exists', async () => {
    firestoreMocks.getDoc.mockResolvedValueOnce({
      exists: () => true,
      id: 'abc',
      data: () => ({ address: '123 Main St' }),
    })

    const result = await getDeal('abc')

    expect(firestoreMocks.doc).toHaveBeenCalledWith(fakeDb, 'deals', 'abc')
    expect(result).toEqual({ id: 'abc', address: '123 Main St' })
  })

  it('getDeal returns null when the document does not exist', async () => {
    firestoreMocks.getDoc.mockResolvedValueOnce({ exists: () => false })

    const result = await getDeal('missing')

    expect(result).toBeNull()
  })

  it('subscribeToDeals maps snapshot docs into plain deal objects', () => {
    const docs = [
      { id: '1', data: () => ({ address: '123 Main St' }) },
      { id: '2', data: () => ({ address: '456 Oak Ave' }) },
    ]
    firestoreMocks.onSnapshot.mockImplementation((q, callback) => {
      callback({ docs })
      return 'unsubscribe-fn'
    })

    const callback = vi.fn()
    const unsubscribe = subscribeToDeals(callback)

    expect(firestoreMocks.orderBy).toHaveBeenCalledWith('createdAt', 'desc')
    expect(callback).toHaveBeenCalledWith([
      { id: '1', address: '123 Main St' },
      { id: '2', address: '456 Oak Ave' },
    ])
    expect(unsubscribe).toBe('unsubscribe-fn')
  })
})

describe('deals api, firebase not configured', () => {
  let addDeal, subscribeToDeals, getDeal, addOffer

  beforeEach(async () => {
    vi.resetModules()
    Object.values(firestoreMocks).forEach((mockFn) => mockFn.mockClear())
    vi.doMock('../../../lib/firebase', () => ({ db: null }))
    ;({ addDeal, subscribeToDeals, getDeal, addOffer } = await import('./deals'))
  })

  it('addDeal throws synchronously with a helpful error', () => {
    expect(() => addDeal({ address: '123 Main St' })).toThrow('Firebase is not configured')
  })

  it('getDeal rejects with a helpful error', async () => {
    await expect(getDeal('abc')).rejects.toThrow('Firebase is not configured')
  })

  it('addOffer throws synchronously with a helpful error', () => {
    expect(() => addOffer({ dealId: 'abc' })).toThrow('Firebase is not configured')
  })

  it('subscribeToDeals is a no-op that never calls back', () => {
    const callback = vi.fn()
    const unsubscribe = subscribeToDeals(callback)

    expect(callback).not.toHaveBeenCalled()
    expect(() => unsubscribe()).not.toThrow()
  })
})
