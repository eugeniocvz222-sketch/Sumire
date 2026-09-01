import React, { Component, ErrorInfo, ReactNode } from 'react'
import { GhostErrorView } from './GhostErrorView'
import { logger } from '../../lib/logger'

interface Props {
  children: ReactNode
  fallbackTitle?: string
  fallbackMessage?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Log exact details to our System Logger
    logger.error('React_ErrorBoundary', error.message, {
      componentStack: errorInfo.componentStack,
    }, error.stack)
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <GhostErrorView
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          title={this.props.fallbackTitle || '¡Oops! Algo desapareció inesperadamente'}
          message={this.props.fallbackMessage || 'La aplicación encontró un detalle inesperado al procesar esta vista. Tus datos y notas están a salvo en la base de datos.'}
          errorCode="500"
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}
