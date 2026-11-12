export function greeting(name: string | undefined) {
  return name ? `Hi, ${name}` : "Signed in";
}
