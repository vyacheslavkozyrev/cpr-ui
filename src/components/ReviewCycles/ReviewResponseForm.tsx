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
import React from 'react'
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

const ReviewResponseForm: React.FC<ReviewResponseFormProps> = ({
  cycle,
  nominee,
}) => {
  const { t } = useTranslation()
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

  const onSubmit = async (data: ISubmitResponseRequest) => {
    await submitMutation.mutateAsync(data)
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
      <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
        {t('components.reviewResponseForm.ratingLabel')}
      </Typography>
      <Controller
        name='overall_rating'
        control={control}
        rules={{ min: { value: 1, message: 'Rating required' } }}
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
          required: 'Comments are required',
          minLength: { value: 10, message: 'Minimum 10 characters' },
          maxLength: { value: 2000, message: 'Maximum 2000 characters' },
        })}
      />
      {submitMutation.isError && (
        <Alert severity='error' sx={{ mb: 1 }}>
          Submission failed. Please try again.
        </Alert>
      )}
      <Button
        type='submit'
        variant='contained'
        disabled={submitMutation.isPending}
        sx={{ mt: 1 }}
      >
        {t('components.reviewResponseForm.submitButton')}
      </Button>
    </Box>
  )
}

export default ReviewResponseForm
