import { useEffect, useState } from 'react'

//Debounce serve para ocasionar um delay enquanto o usuário não finaliza a digitação:
export default function useDebounceValue<T = unknown>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}