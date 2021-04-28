export type ToggleProps = {
  toggled?: boolean
  toggleMessages?: {
    on: string
    off: string
  }
  onToggle?: (state: boolean) => void
}