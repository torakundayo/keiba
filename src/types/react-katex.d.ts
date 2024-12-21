declare module 'react-katex' {
  import { FC, ComponentProps } from 'react'

  interface KaTeXProps extends ComponentProps<'div'> {
    math: string
    block?: boolean
    errorColor?: string
    renderError?: (error: Error | TypeError) => JSX.Element
    settings?: any
  }

  export const BlockMath: FC<KaTeXProps>
  export const InlineMath: FC<KaTeXProps>
}