export interface ToggleProps {
  toggled?: boolean
  toggleMessages?: {
    on: string
    off: string
  }
  onToggle?: (state: boolean) => void,
  className?: string
}
