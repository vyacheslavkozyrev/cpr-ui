import { analyticsHandlers } from './analyticsHandlers'
import { dashboardHandlers } from './dashboardHandlers'
import { feedbackRequestHandlers } from './feedbackRequestHandlers'
import { gapAnalysisHandlers } from './gapAnalysisHandlers'
import goalsHandlers from './goalsHandlers'
import reviewCyclesHandlers from './reviewCyclesHandlers'
import skillAssessmentHandlers from './skillAssessmentHandlers'
import taxonomyHandlers from './taxonomyHandlers'
import { userHandlers } from './userHandlers'

export {
  analyticsHandlers,
  dashboardHandlers,
  feedbackRequestHandlers,
  gapAnalysisHandlers,
  goalsHandlers,
  reviewCyclesHandlers,
  skillAssessmentHandlers,
  taxonomyHandlers,
  userHandlers,
}

export const allHandlers = [
  ...userHandlers,
  ...dashboardHandlers,
  ...goalsHandlers,
  ...reviewCyclesHandlers,
  ...feedbackRequestHandlers,
  ...skillAssessmentHandlers,
  ...taxonomyHandlers,
  ...gapAnalysisHandlers,
  ...analyticsHandlers,
]
