/* Injects an inline script that reads the persisted theme from localStorage
   and applies the "dark" class to <html> before React hydrates.
   This prevents the dark mode flash on page refresh. */
export default function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var raw = localStorage.getItem('theme-preference');
              if (raw) {
                var parsed = JSON.parse(raw);
                if (parsed.state && parsed.state.isDark === true) {
                  document.documentElement.classList.add('dark');
                }
              }
            } catch(e) {}
          })();
        `,
      }}
    />
  );
}
