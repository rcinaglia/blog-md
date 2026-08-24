export default function ArticleBody({ html }: { html: string }) {
  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const button = (e.target as HTMLElement).closest<HTMLButtonElement>('.copy-btn')
    if (!button) return

    const code = button.parentElement?.querySelector('code')?.textContent ?? ''
    navigator.clipboard.writeText(code)

    const original = button.textContent
    button.textContent = 'Copied!'
    setTimeout(() => { button.textContent = original }, 1500)
  }

  return <div onClick={handleClick} dangerouslySetInnerHTML={{ __html: html }} />
}
