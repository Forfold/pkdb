import { test, expect, chromium, Locator } from '@playwright/test'
import * as fs from 'fs'

type Stat = {
  min: number
  max: number
}

interface Pokedex {
  [pokemon: string]: {
    link?: string
    name: string
    type?: string[]
    number?: number
    stats?: {
      hp: Stat
      attack: Stat
      defense: Stat
      specialAttack: Stat
      sspecialDefense: Stat
      speed: Stat
      total: Stat
    }
  }
}

test('get pokemon sv dex', async ({ page }) => {
  await page.goto('https://pokemondb.net/pokedex/game/scarlet-violet')

  const listContainer = page.locator(
    'div[class="infocard-list infocard-list-pkmn-lg"] div',
  )

  let pokedex: Pokedex = {}

  const count = await listContainer.count()
  for (let i = 0; i < count; i++) {
    await listContainer.nth(i).click()

    const name = (await page.locator('h1').textContent()) || ''
    console.log(name)
    pokedex[name] = {
      name,
    }

    fs.writeFileSync('svpkdx.json', JSON.stringify(pokedex))

    await page.goBack()
  }
})
