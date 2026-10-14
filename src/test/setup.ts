import { vi } from "vitest"
import "@testing-library/jest-dom/vitest"

class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", MockObserver)
vi.stubGlobal("IntersectionObserver", MockObserver)
