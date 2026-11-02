export type SpherePersistResult =
  | { ok: true; message: string }
  | { ok: false; message: string; unauthorized: boolean }

export async function persistSphereHotspot(input: {
  slug: string
  hotspotId: string
  yaw: number
  pitch: number
}): Promise<SpherePersistResult> {
  try {
    const res = await fetch('/api/mpz/hotspots/sphere', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        slug: input.slug,
        hotspotId: input.hotspotId,
        yaw: input.yaw,
        pitch: input.pitch,
      }),
    })
    const json = (await res.json()) as { message?: string }
    if (!res.ok) {
      if (res.status === 401) {
        return {
          ok: false,
          unauthorized: true,
          message: 'Nicht angemeldet — zuerst /mpz/unlock aufrufen.',
        }
      }
      return {
        ok: false,
        unauthorized: false,
        message: json.message ?? `Fehler (${res.status})`,
      }
    }
    return {
      ok: true,
      message: `Übernommen: ${input.hotspotId} → yaw=${input.yaw}°, pitch=${input.pitch}°`,
    }
  } catch {
    return {
      ok: false,
      unauthorized: false,
      message: 'Netzwerkfehler beim Speichern.',
    }
  }
}

export async function persistSphereStartView(input: {
  slug: string
  startYaw: number
  startPitch: number
}): Promise<SpherePersistResult> {
  try {
    const res = await fetch('/api/mpz/view/sphere', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        slug: input.slug,
        startYaw: input.startYaw,
        startPitch: input.startPitch,
      }),
    })
    const json = (await res.json()) as { message?: string }
    if (!res.ok) {
      if (res.status === 401) {
        return {
          ok: false,
          unauthorized: true,
          message: 'Nicht angemeldet — zuerst /mpz/unlock aufrufen.',
        }
      }
      return {
        ok: false,
        unauthorized: false,
        message: json.message ?? `Fehler (${res.status})`,
      }
    }
    return {
      ok: true,
      message: `Startblick übernommen: yaw=${input.startYaw}°, pitch=${input.startPitch}° (Reload für Vorschau)`,
    }
  } catch {
    return {
      ok: false,
      unauthorized: false,
      message: 'Netzwerkfehler beim Speichern.',
    }
  }
}
