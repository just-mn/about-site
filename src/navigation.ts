export type NavigationItem = {
  id: string
  label: string
  to?: string
  href?: string
}

export const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Home', to: '/' },
  { id: 'calenbar', label: 'CalenBar', href: 'https://calenbar.just-mn.dev' },
  { id: 'contact', label: 'Contact', to: '/contact' },
]
