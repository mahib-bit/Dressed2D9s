// A retro "window" panel: gradient title bar, fake window buttons, hard shadow.
// `right` is optional extra controls (links, tabs) shown in the title bar.

export function TitleBar({ title, right }) {
  return (
    <div className="c22-titlebar">
      <span className="truncate">★ {title}</span>
      <div className="flex items-center gap-3">
        {right}
        <span className="c22-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}

export default function WindowFrame({ title, right, children, className = "" }) {
  return (
    <section className={`c22-window mb-10 ${className}`}>
      <TitleBar title={title} right={right} />
      <div className="p-4">{children}</div>
    </section>
  );
}
