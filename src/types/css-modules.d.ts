// Type stub for CSS Modules. Vite ships this support out of the box but
// TypeScript needs the ambient declaration to type the default-exported
// class-name map.
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
