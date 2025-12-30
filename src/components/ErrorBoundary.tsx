import React from 'react'

export default class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, message?: string}> {
  constructor(props:any){
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error:any){
    return { hasError: true, message: error?.message }
  }

  componentDidCatch(error:any, info:any){
    console.error('Uncaught error in UI:', error, info)
  }

  render(){
    if (this.state.hasError){
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg text-center bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600 mb-4">An unexpected error occurred while loading the app. Try disabling other browser wallet extensions or open the site in a clean browser profile.</p>
            <div className="text-xs text-red-600">{this.state.message}</div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
