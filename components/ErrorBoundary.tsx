"use client";
import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-10 bg-black/80 text-white min-h-screen relative z-50">
          <h2 className="text-2xl font-bold text-red-500 mb-4">마이페이지 렌더링 오류 발생</h2>
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl font-mono text-sm mb-4">
            {this.state.error.toString()}
          </div>
          <details className="whitespace-pre-wrap font-mono text-xs text-white/60 bg-white/5 p-4 rounded-xl">
            <summary className="cursor-pointer mb-2 font-bold text-white">상세 스택 트레이스 보기</summary>
            {this.state.errorInfo?.componentStack}
            <br />
            {this.state.error.stack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
