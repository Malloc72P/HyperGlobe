export function findById(array: any[], id: string, idField: string = 'id') {
  return array.find((item) => item[idField] === id);
}
