// Root loading.tsx removed — the page components have their own
// loading skeletons. Keeping this file minimal prevents the Suspense
// fallback from masking the real page on Netlify streaming SSR.
export default function Loading() {
  return null;
}
