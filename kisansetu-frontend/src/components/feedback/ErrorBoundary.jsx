import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from '../common/Button';

/**
 * Application-wide Error Boundary for catching and displaying runtime React errors cleanly.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-paper-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-paper-100 border-2 border-indigo-900 shadow-hard-lg rounded-sm p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-sm bg-rust-100 border border-rust-600/30 flex items-center justify-center text-rust-600">
              <AlertCircle className="w-8 h-8 stroke-[1.75]" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-serif text-indigo-900">
              कुछ गड़बड़ हुई • Application Error
            </h1>

            <p className="text-sm text-ink-muted leading-relaxed">
              पृष्ठ लोड करने में समस्या आई है। कृपया पुनः प्रयास करें।
              <br />
              An unexpected error occurred while rendering this page.
            </p>

            <div className="pt-2">
              <Button
                variant="primary"
                onClick={this.handleReset}
                icon={<RotateCcw className="w-4 h-4" />}
                className="w-full"
              >
                पुनः लोड करें • Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
