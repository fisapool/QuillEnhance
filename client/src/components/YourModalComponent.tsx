import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can customize the fallback UI here.
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}


function MyComponent() {
  return (
    <ErrorBoundary>
      <Modal>
        {/* Modal content */}
      </Modal>
    </ErrorBoundary>
  );
}

// Dummy Modal component for demonstration purposes.  Replace with your actual Modal.
const Modal = ({children}) => <div>{children}</div>

export default MyComponent;