import { useEffect } from 'react';
import { PageId } from '../types';
import { applyPageSEO } from '../utils/seo';

export const SEO: React.FC<{ pageId: PageId }> = ({ pageId }) => {
  useEffect(() => {
    applyPageSEO(pageId);
  }, [pageId]);
  return null;
};
