export function shouldShowDialogEndIcon(
  mascotDialogHotspot: boolean,
  dialogUiActive: boolean,
): boolean {
  return mascotDialogHotspot && dialogUiActive
}

export function handleStationBack(
  dialogUiActive: boolean,
  endDialog: () => void,
  navigate: () => void,
): void {
  if (dialogUiActive) {
    endDialog()
  }
  navigate()
}
