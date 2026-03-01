import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className={`mb-6 ${className}`}>
      <ol className="flex items-center gap-2 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isCurrent = item.current || isLast

          return (
            <li key={index} className="flex items-center gap-2">
              {isCurrent ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href || '#'}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
