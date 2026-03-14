import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Rating,
  TextField,
  Typography,
} from '@mui/material'
import { useCallback, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useSubmitReviewResponse } from '../../hooks/useReviewCycles'
import {
  EReviewCycleStatus,
  EReviewNomineeStatus,
  type IReviewCycleDetail,
  type IReviewNominee,
  type ISubmitResponseRequest,
} from '../../types/reviewCycle.types'

interface ReviewResponseFormProps {
  cycle: IReviewCycleDetail
  nominee: IReviewNominee | null
}

const getStyles = () => ({
  ratingHeading: { mt: 2 },
  errorAlert: { mb: 1 },
  submitButton: { mt: 1 },
})

const ReviewResponseForm: React.FC<ReviewResponseFormProps> = ({
  cycle,
  nominee,
}) => {
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])
  const submitMutation = useSubmitReviewResponse(cycle.id)

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitSuccessful },
  } = useForm<ISubmitResponseRequest>({
    defaultValues: { overall_rating: 0, comments: '' },
  })

  const commentsValue = watch('comments', '')

  const onSubmit = useCallback(
    async (data: ISubmitResponseRequest) => {
      await submitMutation.mutateAsync(data)
    },
    [submitMutation]
  )

  if (cycle.status !== EReviewCycleStatus.IN_PROGRESS) {
    return (
      <Alert severity='info'>
        {t('components.reviewResponseForm.notAccepting')}
      </Alert>
    )
  }

  if (!nominee) {
    return (
      <Alert severity='warning'>
        {t('components.reviewResponseForm.notNominated')}
      </Alert>
    )
  }

  if (nominee.status === EReviewNomineeStatus.SUBMITTED || isSubmitSuccessful) {
    return (
      <Card variant='outlined'>
        <CardContent>
          <Alert severity='success'>
            {t('components.reviewResponseForm.alreadySubmittedTitle')}
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box component='form' onSubmit={handleSubmit(onSubmit)}>
      <Typography variant='h6' gutterBottom>
        {t('components.reviewResponseForm.title')}
      </Typography>
      <Typography variant='body2' color='text.secondary' gutterBottom>
        {t('components.reviewResponseForm.reviewingLabel')}:{' '}
        <strong>{cycle.subject_display_name}</strong>
      </Typography>
      <Typography variant='h6' gutterBottom sx={styles.ratingHeading}>
        {t('components.reviewResponseForm.ratingLabel')}
      </Typography>
      <Controller
        name='overall_rating'
        control={control}
        rules={{
          min: {
            value: 1,
            message: t('components.reviewResponseForm.ratingRequired'),
          },
        }}
        render={({ field }) => (
          <Rating
            size='large'
            value={field.value}
            onChange={(_, val) => field.onChange(val ?? 0)}
          />
        )}
      />
      {errors.overall_rating && (
        <Typography color='error' variant='caption'>
          {errors.overall_rating.message}
        </Typography>
      )}
      <TextField
        label={t('components.reviewResponseForm.commentsLabel')}
        fullWidth
        multiline
        rows={4}
        margin='normal'
        required
        inputProps={{ minLength: 10, maxLength: 2000 }}
        helperText={`${commentsValue.length}/2000 — ${t('components.reviewResponseForm.commentsHint')}`}
        error={Boolean(errors.comments)}
        {...register('comments', {
          required: t('components.reviewResponseForm.commentsRequired'),
          minLength: {
            value: 10,
            message: t('components.reviewResponseForm.minLength'),
          },
          maxLength: {
            value: 2000,
            message: t('components.reviewResponseForm.maxLength'),
          },
        })}
      />
      {submitMutation.isError && (
        <Alert severity='error' sx={styles.errorAlert}>
          {t('components.reviewResponseForm.submitError')}
        </Alert>
      )}
      <Button
        type='submit'
        variant='contained'
        disabled={submitMutation.isPending}
        sx={styles.submitButton}
      >
        {t('components.reviewResponseForm.submitButton')}
      </Button>
    </Box>
  )
}

export default ReviewResponseForm
