// mocks.ts
import {vi} from 'vitest'

export const signInMock = vi.fn()
export const pushMock = vi.fn()
export const toastSuccessMock = vi.fn()
export const toastErrorMock = vi.fn()

vi.mock('next-auth/react', () => ({
    signIn: signInMock,
}))

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}))

vi.mock('sonner', () => ({
    toast: {
        success: toastSuccessMock,
        error: toastErrorMock,
    },
}))