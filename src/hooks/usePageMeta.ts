import { useEffect } from 'react'

type PageMetaOptions = {
  title: string
  description: string
}

function getOrCreateMeta(attribute: 'name' | 'property', value: string) {
  const selector = `meta[${attribute}="${value}"]`
  let element = document.head.querySelector<HTMLMetaElement>(selector)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, value)
    document.head.appendChild(element)
  }

  return element
}

export function usePageMeta({ title, description }: PageMetaOptions) {
  useEffect(() => {
    document.title = title
    getOrCreateMeta('name', 'description').content = description
    getOrCreateMeta('property', 'og:title').content = title
    getOrCreateMeta('property', 'og:description').content = description
  }, [description, title])
}
