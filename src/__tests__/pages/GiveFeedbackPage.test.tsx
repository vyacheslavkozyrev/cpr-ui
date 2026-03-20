import { screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { server } from '../../mocks/server'
import { GiveFeedbackPage } from '../../pages/feedback/GiveFeedbackPage'
import { renderWithProviders } from '../../tests/utils'

// Translation values from public/locales/en/translation.json:
// pages.feedback.new.title = "Give Feedback"

describe('GiveFeedbackPage', () => {
  beforeEach(() => server.listen({ onUnhandledRequest: 'warn' }))
  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('renders the page title', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/feedback/give']}>
        <Routes>
          <Route path='/feedback/give' element={<GiveFeedbackPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Give Feedback')).not.toBeNull()
    })
  })

  it('mounts without error when feedback_request_id and employee_id query params are present', async () => {
    renderWithProviders(
      <MemoryRouter
        initialEntries={[
          '/feedback/give?feedback_request_id=req-001&employee_id=emp-001',
        ]}
      >
        <Routes>
          <Route path='/feedback/give' element={<GiveFeedbackPage />} />
        </Routes>
      </MemoryRouter>
    )

    // Page title should render — confirms the page mounted without error
    await waitFor(() => {
      expect(screen.queryByText('Give Feedback')).not.toBeNull()
    })

    // The form container (Paper) should be present in the DOM
    const paper = document.querySelector('.MuiPaper-root')
    expect(paper).not.toBeNull()
  })
})
