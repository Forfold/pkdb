import { test } from '@playwright/test'
import * as fs from 'fs'

type Stat = {
  avg: number
  min: number
  max: number
}

type StatType =
  | 'HP'
  | 'Attack'
  | 'Defense'
  | 'Sp. Atk'
  | 'Sp. Def'
  | 'Speed'
  | 'Total'

type Stats = {
  hp: Stat
  attack: Stat
  defense: Stat
  specialAttack: Stat
  specialDefense: Stat
  speed: Stat
  total: number
}

interface Pokedex {
  [pokemon: string]: {
    link?: string
    name: string
    type?: string[]
    number?: number
    stats?: Stats
  }
}

test('get pokemon sv dex', async ({ page }) => {
  async function getRowVals(
    statType: StatType,
    index: number,
  ): Promise<number[]> {
    const row = page
      .locator('h2:has-text("Base stats") + div tr', {
        hasText: statType,
      })
      .nth(index)

    let text = (await row.textContent()) || ''

    let statVals = text
      .split('\n')
      .filter((text) => text !== statType && text !== '')
      .map((stat) => parseInt(stat, 10))
    return statVals
  }

  async function getStat(statType: StatType, index: number): Promise<Stat> {
    const statVals = await getRowVals(statType, index)

    return {
      avg: statVals[0],
      min: statVals[1],
      max: statVals[2],
    }
  }

  await page.goto('https://pokemondb.net/pokedex/game/scarlet-violet')

  const listContainer = page.locator(
    'div[class="infocard-list infocard-list-pkmn-lg"] div',
  )

  let dex: Pokedex = {}
  const count = await listContainer.count()
  console.log('Total number of Pokemon to index: ', count)

  fs.writeFileSync(
    'svpkdx.csv',
    'name, total_stats, hp,hp_min,hp_max, atk,atk_min,atk_max, def,def_min,def_max, spa,spa_min,spa_max, spd,spd_min,spd_max, spe,spe_min,spe_max\n',
  )

  for (let i = 0; i < count; i++) {
    await listContainer.nth(i).click()

    let name = (await page.locator('h1').textContent()) || ''

    // check if more than 1 type of this pokemon exists
    const numTypes = await page
      .locator('h2:has-text("Base stats") + div tr', {
        hasText: 'HP',
      })
      .count()

    // add pokemon (and any alternate versions) to pokedex dict
    for (let j = 0; j < numTypes; j++) {
      let n = `${name}${j > 0 ? ` (Alternate Version ${j})` : ''}`

      console.log(i + 1, n)

      dex[n] = {
        name: n,
        stats: {
          total: (await getRowVals('Total', j))[0],
          hp: await getStat('HP', j),
          attack: await getStat('Attack', j),
          defense: await getStat('Defense', j),
          specialAttack: await getStat('Sp. Atk', j),
          specialDefense: await getStat('Sp. Def', j),
          speed: await getStat('Speed', j),
        },
      }

      // append to csv
      fs.appendFileSync(
        'svpkdx.csv',
        `${n}, ${dex[n].stats?.total}, ${dex[n].stats?.hp.avg}, ${dex[n].stats?.hp.min}, ${dex[n].stats?.hp.max}, ${dex[n].stats?.attack.avg}, ${dex[n].stats?.attack.min}, ${dex[n].stats?.attack.max}, ${dex[n].stats?.defense.avg}, ${dex[n].stats?.defense.min}, ${dex[n].stats?.defense.max}, ${dex[n].stats?.specialAttack.avg}, ${dex[n].stats?.specialAttack.min}, ${dex[n].stats?.specialAttack.max}, ${dex[n].stats?.specialDefense.avg}, ${dex[n].stats?.specialDefense.min}, ${dex[n].stats?.specialDefense.max}, ${dex[n].stats?.speed.avg}, ${dex[n].stats?.speed.min}, ${dex[n].stats?.speed.max}\n`,
      )
    }

    // write to json
    // fs.writeFileSync('svpkdx.json', JSON.stringify(dex, null, 2))

    await page.goBack()
  }
})
