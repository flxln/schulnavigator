export type InstanceCopy = {
  chipMark: string
  chipAria: string
  homeName: string
  layoutDescription: string
  homeDescription: string
  stationenDescription: string
  eintrittDescription: string
  eintrittScanDescription: string
  impressumDescription: string
  datenschutzDescription: string
  scanHint: string
  eintrittWrong: string
  hubAria: string
  studioFooter: string
  stationGridHint: string
}

const schoolCopy: InstanceCopy = {
  chipMark: '39.',
  chipAria: '39. Grundschule Dresden-Plauen',
  homeName: 'Grundschule Dresden-Plauen',
  layoutDescription: 'Web-App für den Tag der offenen Tür (39. Grundschule Dresden).',
  homeDescription:
    'Schematischer Rundgang durch die Stationen der 39. Grundschule Dresden — Tag der offenen Tür.',
  stationenDescription:
    'Übersicht aller Stationen der 39. Grundschule Dresden — Tag der offenen Tür.',
  eintrittDescription:
    'Zugang zur App über Einladungslink (Tag der offenen Tür, 39. Grundschule Dresden).',
  eintrittScanDescription: 'Eintritts-QR der 39. Grundschule Dresden scannen.',
  impressumDescription: 'Impressum des Schulnavigators der 39. Grundschule Dresden.',
  datenschutzDescription:
    'Datenschutzerklärung des Schulnavigators der 39. Grundschule Dresden.',
  scanHint: 'Nur Codes der 39. Grundschule werden akzeptiert.',
  eintrittWrong: 'Das ist kein Eintritts-QR der 39. Grundschule.',
  hubAria: 'Schulgebäude der 39. GS mit klickbaren Stationen',
  studioFooter: '39. Grundschule Dresden',
  stationGridHint: '12 Stationen · Schulrundgang GS39. Kachel anklicken oder Bearbeiten',
}

const demoCopy: InstanceCopy = {
  chipMark: 'SN',
  chipAria: 'Schulnavigator Demo',
  homeName: 'Schulnavigator Demo',
  layoutDescription: 'Demo des Schulnavigators mit erfundenen Texten und Bildern.',
  homeDescription: 'Beispielrundgang durch zwölf Stationen. Inhalte und Bilder sind erfunden.',
  stationenDescription: 'Übersicht der Beispielstationen in der Schulnavigator-Demo.',
  eintrittDescription: 'Zugang zur Demo über einen Einladungslink.',
  eintrittScanDescription: 'Eintritts-QR der Demo scannen.',
  impressumDescription: 'Impressum der Schulnavigator-Demo.',
  datenschutzDescription: 'Datenschutzhinweise der Schulnavigator-Demo.',
  scanHint: 'Nur Codes dieser Demo werden akzeptiert.',
  eintrittWrong: 'Das ist kein Eintritts-QR dieser Demo.',
  hubAria: 'Schulhaus mit klickbaren Beispielstationen',
  studioFooter: 'Schulnavigator Demo',
  stationGridHint: '12 Stationen · Beispielrundgang. Kachel anklicken oder Bearbeiten',
}

export function copyForInstance(instance: string | undefined): InstanceCopy {
  return instance === 'demo' ? demoCopy : schoolCopy
}

export const IS_DEMO_INSTANCE = process.env.NEXT_PUBLIC_SN_INSTANCE === 'demo'

export const instanceCopy = copyForInstance(process.env.NEXT_PUBLIC_SN_INSTANCE)
