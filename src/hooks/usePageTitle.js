import { useEffect } from "react";

// React 18 doesn't turn <title> tags in components into the real tab title,
// so set document.title ourselves.
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Catch22` : "Catch22";
  }, [title]);
}
