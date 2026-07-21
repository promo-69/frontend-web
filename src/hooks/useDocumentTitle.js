import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `Cineflix | ${title}` : 'Cineflix';
  }, [title]);
}
