// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { SessionDetail } from '../src/components/SessionHistory'
import { beginDebrief, initialData, saveSession, startWorkout } from '../src/services/appService'

afterEach(cleanup)

function savedSession() {
  return saveSession(beginDebrief(startWorkout(initialData())), '2026-09-17T21:50:00.000Z').sessions[0]
}

describe('saved session deletion dialog', () => {
  it('leaves the session untouched when deletion is cancelled', () => {
    const onDelete = vi.fn()
    const session = savedSession()
    render(<SessionDetail session={session} onBack={vi.fn()} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: 'DELETE WORKOUT' }))
    expect(screen.getByRole('dialog', { name: 'DELETE WORKOUT?' }).textContent).toContain('This will permanently remove this workout and its logged sets/cardio data.')
    fireEvent.click(screen.getByRole('button', { name: 'CANCEL' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: 'Strength A' })).toBeTruthy()
  })

  it('deletes only after confirmation with the saved session id', () => {
    const onDelete = vi.fn()
    const session = savedSession()
    render(<SessionDetail session={session} onBack={vi.fn()} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: 'DELETE WORKOUT' }))
    expect(onDelete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('dialog', { name: 'DELETE WORKOUT?' }).querySelector('.dialog-delete')!)
    expect(onDelete).toHaveBeenCalledOnce()
    expect(onDelete).toHaveBeenCalledWith(session.id)
  })
})
