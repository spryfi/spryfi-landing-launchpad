interface TableOfContentsProps extends React.HTMLAttributes<HTMLElement> {
  items: { id: string; title: string }[];
}

export function TableOfContents({ items, className = "", ...props }: TableOfContentsProps) {
  return (
    <nav className={`rounded-lg border bg-card/50 p-6 ${className}`} {...props}>
      <h2 className="mb-4 text-lg font-semibold">Table of Contents</h2>
      <ol className="space-y-2 text-muted-foreground">
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="hover:text-primary hover:underline"
            >
              {index + 1}. {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}