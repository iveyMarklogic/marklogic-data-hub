import React, {Component} from 'react';
import ErrorView from './ErrorView';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  errorMessage: string;
};


export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      errorMessage: ""
    }
    this.handleGoBackHome = this.handleGoBackHome.bind(this);
  }
  
  static getDerivedStateFromError(error) {
    return {hasError: true, errorMessage: error?.message};
  }

  handleGoBackHome() {
    this.setState({
      hasError: false,
      errorMessage: ""
    });
  }

  render() {
    if (this?.state?.hasError) return (<ErrorView onBackHome={this.handleGoBackHome} errorMessage={this.state.errorMessage} />)
    return (<>{this.props.children}</>)
  }
}

export default ErrorBoundary;