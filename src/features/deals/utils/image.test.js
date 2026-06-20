import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resizeImageToDataUrl } from './image'

class FakeImage {
  set src(value) {
    this._src = value
    queueMicrotask(() => {
      if (this.onload) this.onload()
    })
  }
  get src() {
    return this._src
  }
}

function stubImageSize(width, height) {
  vi.stubGlobal(
    'Image',
    class extends FakeImage {
      constructor() {
        super()
        this.width = width
        this.height = height
      }
    },
  )
}

function stubCanvas(dataUrl) {
  const fakeCtx = { drawImage: vi.fn() }
  const fakeCanvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => fakeCtx),
    toDataURL: vi.fn(() => dataUrl),
  }
  const realCreateElement = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation((tag) =>
    tag === 'canvas' ? fakeCanvas : realCreateElement(tag),
  )
  return { fakeCanvas, fakeCtx }
}

describe('resizeImageToDataUrl', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:fake'),
      revokeObjectURL: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('downscales an oversized image to fit within maxDimension', async () => {
    stubImageSize(1600, 800)
    const { fakeCanvas, fakeCtx } = stubCanvas('data:image/jpeg;base64,resized')

    const file = new File(['bytes'], 'house.jpg', { type: 'image/jpeg' })
    const result = await resizeImageToDataUrl(file, { maxDimension: 800, quality: 0.75 })

    expect(fakeCanvas.width).toBe(800)
    expect(fakeCanvas.height).toBe(400)
    expect(fakeCtx.drawImage).toHaveBeenCalled()
    expect(fakeCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.75)
    expect(result).toBe('data:image/jpeg;base64,resized')
  })

  it('does not upscale an image smaller than maxDimension', async () => {
    stubImageSize(200, 100)
    const { fakeCanvas } = stubCanvas('data:image/jpeg;base64,small')

    const file = new File(['bytes'], 'house.jpg', { type: 'image/jpeg' })
    await resizeImageToDataUrl(file, { maxDimension: 800 })

    expect(fakeCanvas.width).toBe(200)
    expect(fakeCanvas.height).toBe(100)
  })

  it('revokes the temporary object URL after loading', async () => {
    stubImageSize(100, 100)
    stubCanvas('data:image/jpeg;base64,x')

    await resizeImageToDataUrl(new File(['bytes'], 'house.jpg', { type: 'image/jpeg' }))

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake')
  })

  it('rejects when the image fails to load', async () => {
    vi.stubGlobal(
      'Image',
      class {
        set src(_value) {
          queueMicrotask(() => this.onerror && this.onerror())
        }
      },
    )

    await expect(
      resizeImageToDataUrl(new File(['bytes'], 'bad.jpg', { type: 'image/jpeg' })),
    ).rejects.toThrow('Could not read image file.')
  })
})
