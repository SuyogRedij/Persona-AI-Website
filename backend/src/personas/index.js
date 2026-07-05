import { hitesh } from './hitesh.js';
import { piyush } from './piyush.js';

const personas = { hitesh, piyush };

export function getPersona(id) {
  const persona = personas[id];
  if (!persona) throw new Error(`Unknown persona: "${id}". Valid options: ${Object.keys(personas).join(', ')}`);
  return persona;
}
