import { useEffect, useState } from "react";
import { getPageContent } from "../services/page.service";
import { mergePageContent } from "../data/pageContent";

export function usePageContent(page, defaults) {
  const [content, setContent] = useState(defaults);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getPageContent(page)
      .then((result) => {
        if (active) setContent(mergePageContent(defaults, result));
      })
      .catch((issue) => {
        if (active) setError(issue.response?.data?.message || "Page content could not be loaded.");
      });
    return () => { active = false; };
  }, [defaults, page]);

  return { content, error };
}
