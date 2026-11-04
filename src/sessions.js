// Report sessions on disk: DATA_DIR/reports/<id>/session.json + photos + PDF.
import fs from 'node:fs/promises';
import path from 'node:path';
import { REPORTS_DIR } from './paths.js';

await fs.mkdir(REPORTS_DIR, { recursive: true });

export const validId = (id) => /^[a-f0-9-]{36}$/.test(id);
export const dirOf = (id) => path.join(REPORTS_DIR, id);
export const load = async (id) => JSON.parse(await fs.readFile(path.join(dirOf(id), 'session.json'), 'utf8'));
export const save = (s) => fs.writeFile(path.join(dirOf(s.id), 'session.json'), JSON.stringify({ ...s, updatedAt: new Date().toISOString() }, null, 1));
export const remove = (id) => fs.rm(dirOf(id), { recursive: true, force: true });

/** Summaries of all sessions (optionally only one owner's). */
export async function listSessions({ ownerId } = {}) {
  const out = [];
  for (const id of (await fs.readdir(REPORTS_DIR)).filter(validId)) {
    try {
      const s = await load(id);
      if (ownerId && s.ownerId !== ownerId) continue;
      out.push({
        id,
        ownerId: s.ownerId || null,
        ownerName: s.ownerName || '',
        donor: s.brief?.donor?.name || '',
        project: s.brief?.project?.name || '',
        amount: s.brief?.donor?.amount || '',
        givingType: s.brief?.donor?.givingType || '',
        hasReport: !!s.report,
        started: !!s.report || !!s.photos?.length || (s.transcript || []).some((m) => m.role === 'user'),
        styleId: s.report?.styleId || '',
        pages: s.report?.pages || null,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt || s.createdAt,
      });
    } catch {}
  }
  return out.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}
