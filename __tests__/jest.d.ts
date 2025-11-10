import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R = void> {
      toBeInTheDocument(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toBeEmptyDOMElement(): R
      toBeInvalid(): R
      toBeRequired(): R
      toBeValid(): R
      toBeVisible(): R
      toContainElement(element: HTMLElement | null): R
      toContainHTML(html: string): R
      toHaveAccessibleDescription(description?: string | RegExp): R
      toHaveAccessibleName(name?: string | RegExp): R
      toHaveAttribute(attr: string, value?: string | RegExp): R
      toHaveClass(...classNames: string[]): R
      toHaveFocus(): R
      toHaveFormValues(values: Record<string, any>): R
      toHaveStyle(css: string | Record<string, any>): R
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R
      toHaveValue(value?: string | string[] | number): R
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R
      toBeChecked(): R
      toBePartiallyChecked(): R
      toHaveErrorMessage(message?: string | RegExp): R
    }
  }
}
