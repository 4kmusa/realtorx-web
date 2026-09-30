import { useEffect } from 'react';
import { PageId, Property } from '../types';
import { applyPageSEO, PageSEOMetadata } from '../utils/seo';

interface SEOProps {
  pageId: PageId;
  property?: Property;
}

export const SEO: React.FC<SEOProps> = ({ pageId, property }) => {
  useEffect(() => {
    applyPageSEO(pageId, property);
  }, [pageId, property]);

  return null;
};
