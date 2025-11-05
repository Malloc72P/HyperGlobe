export function classnames(...args: Array<string | undefined | false | null>): string {
  return args.filter((arg) => Boolean(arg)).join(' ');
}
