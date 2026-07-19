'use client'

import { Starfield } from './Starfield'
import { CursorGlow } from './CursorGlow'
import { TechGrid } from './TechGrid'

export function BackgroundEffects() {
  return (
    <>
      <TechGrid />
      <Starfield />
      <CursorGlow />
    </>
  )
}
