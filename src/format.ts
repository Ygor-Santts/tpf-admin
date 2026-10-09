// "5534999999999" or "34999999999" -> "(34) 99999-9999"
export function formatPhone(value: string) {
  let d = (value || '').replace(/\D/g, '')
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2)
  if (d.length < 10) return value
  const rest = d.slice(2)
  const split = rest.length > 8 ? 5 : 4
  return `(${d.slice(0, 2)}) ${rest.slice(0, split)}-${rest.slice(split)}`
}

// The API sends dates as "2026-10-09 19:21:55" or ISO; shown as dd/mm/aaaa.
export function formatDate(value?: string | null) {
  if (!value) return 'nunca'
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR')
}

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
