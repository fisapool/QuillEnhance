indicatorclassname={cn(
  styles.indicator,
  {
    [styles.indicatorSuccess]: status === 'success',
    [styles.indicatorError]: status === 'error',
  },
)}