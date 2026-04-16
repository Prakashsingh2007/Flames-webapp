const FLAMES_LABELS = [
  'Friends',
  'Love',
  'Affection',
  'Marriage',
  'Enemies',
  'Siblings',
]

const normalizeName = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z]/g, '')

const removeCommonCharacters = (firstName, secondName) => {
  const secondCharacters = new Map()

  for (const character of secondName) {
    secondCharacters.set(character, (secondCharacters.get(character) || 0) + 1)
  }

  const remainingFirst = []

  for (const character of firstName) {
    const count = secondCharacters.get(character) || 0

    if (count > 0) {
      secondCharacters.set(character, count - 1)
    } else {
      remainingFirst.push(character)
    }
  }

  let remainingSecondCount = 0
  for (const count of secondCharacters.values()) {
    remainingSecondCount += count
  }

  return {
    remainingFirst: remainingFirst.join(''),
    remainingSecondCount,
  }
}

export const calculateFlames = (name1, name2) => {
  const cleanedName1 = normalizeName(name1)
  const cleanedName2 = normalizeName(name2)
  const { remainingFirst, remainingSecondCount } = removeCommonCharacters(
    cleanedName1,
    cleanedName2,
  )

  const remainingCount = remainingFirst.length + remainingSecondCount

  if (remainingCount === 0) {
    return {
      name1,
      name2,
      cleanedName1,
      cleanedName2,
      remainingCount,
      relationship: 'Siblings',
    }
  }

  const flames = [...FLAMES_LABELS]
  let index = 0

  while (flames.length > 1) {
    index = (index + remainingCount - 1) % flames.length
    flames.splice(index, 1)
  }

  return {
    name1,
    name2,
    cleanedName1,
    cleanedName2,
    remainingCount,
    relationship: flames[0],
  }
}
