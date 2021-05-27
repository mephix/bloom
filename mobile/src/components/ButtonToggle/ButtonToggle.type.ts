export interface ButtonToggleProps {
  title?: string
  value: string
  onToggle: (value: string, state: boolean) => void
  toggled?: boolean
}
