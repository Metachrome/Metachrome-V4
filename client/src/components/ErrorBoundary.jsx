var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import React, { Component } from 'react';
var ErrorBoundary = /** @class */ (function (_super) {
    __extends(ErrorBoundary, _super);
    function ErrorBoundary() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            hasError: false
        };
        return _this;
    }
    ErrorBoundary.getDerivedStateFromError = function (error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error: error };
    };
    ErrorBoundary.prototype.componentDidCatch = function (error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    };
    ErrorBoundary.prototype.render = function () {
        var _this = this;
        var _a;
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return this.props.fallback || (<div className="flex items-center justify-center min-h-[400px] bg-[#10121E] text-white">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-4">
              {((_a = this.state.error) === null || _a === void 0 ? void 0 : _a.message) || 'An unexpected error occurred'}
            </p>
            <button onClick={function () { return _this.setState({ hasError: false, error: undefined }); }} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Try again
            </button>
          </div>
        </div>);
        }
        return this.props.children;
    };
    return ErrorBoundary;
}(Component));
export default ErrorBoundary;
