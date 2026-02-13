export function combinations<T>(array: T[], r: number): T[][] {
  const result: T[][] = []
  const recurse = (start: number, combo: T[]) => {
    if (combo.length === r) {
      result.push([...combo])
      return
    }
    for (let i = start; i < array.length; i++) {
      combo.push(array[i])
      recurse(i + 1, combo)
      combo.pop()
    }
  }
  recurse(0, [])
  return result
}
