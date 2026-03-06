import { screen, waitFor } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { server } from '../../../mocks/server'
import SkillAssessmentPage from '../../../pages/skillAssessment/SkillAssessmentPage'
import { renderWithProviders } from '../../../tests/utils'

function renderPage() {
  return renderWithProviders(
    <MemoryRouter initialEntries={['/skills/assessment']}>
      <Routes>
        <Route path='/skills/assessment' element={<SkillAssessmentPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('SkillAssessmentPage', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('renders the page title', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.queryByText(/skill self-assessment/i)).not.toBeNull()
    })
  })

  it('renders position title from mock data', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.queryByText('Senior Software Engineer')).not.toBeNull()
    })
  })

  it('renders skill category from mock data', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.queryByText('Technical Skills')).not.toBeNull()
    })
  })

  it('renders skill title from mock data', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.queryByText('TypeScript')).not.toBeNull()
    })
  })

  it('renders career track from mock data', async () => {
    renderPage()
    // career_track title is rendered alongside career_path: "Backend Engineering • Engineering"
    await waitFor(() => {
      expect(screen.queryByText(/Backend Engineering/)).not.toBeNull()
    })
  })
})
