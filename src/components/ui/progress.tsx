// Assuming this is within a React component, and cn is imported from a library like classnames
indicatorclassname={cn(
  styles.indicator,
  {
    [styles.indicatorSuccess]: status === 'success',
    [styles.indicatorError]: status === 'error',
  },
)}