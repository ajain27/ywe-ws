import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const appMocks = vi.hoisted(() => ({ initializeApp: vi.fn(() => 'fake-app') }))
const firestoreMocks = vi.hoisted(() => ({ getFirestore: vi.fn(() => 'fake-db') }))

vi.mock('firebase/app', () => appMocks)
vi.mock('firebase/firestore', () => firestoreMocks)

describe('firebase lib', () => {
  beforeEach(() => {
    vi.resetModules()
    appMocks.initializeApp.mockClear()
    firestoreMocks.getFirestore.mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('is not configured and exposes no db when credentials are missing', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', '')
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', '')

    const { firebaseConfigured, db } = await import('./firebase')

    expect(firebaseConfigured).toBe(false)
    expect(db).toBeNull()
    expect(appMocks.initializeApp).not.toHaveBeenCalled()
  })

  it('is configured and initializes Firestore when both apiKey and projectId are present', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key')
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project')

    const { firebaseConfigured, db } = await import('./firebase')

    expect(firebaseConfigured).toBe(true)
    expect(appMocks.initializeApp).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: 'test-api-key', projectId: 'test-project' }),
    )
    expect(db).toBe('fake-db')
  })

  it('is not configured when only one of apiKey/projectId is present', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key')
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', '')

    const { firebaseConfigured, db } = await import('./firebase')

    expect(firebaseConfigured).toBe(false)
    expect(db).toBeNull()
  })
})
