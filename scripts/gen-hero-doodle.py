# Extracts the hero character frames from scripts/source/hero-doodle.html.
# Usage: python3 scripts/gen-hero-doodle.py scripts/source/hero-doodle.html components/hero/heroDoodleFrames.ts
import re,sys,json
src,out=sys.argv[1],sys.argv[2]
s=open(src).read().split('\n')
def attrs(t): return dict(re.findall(r'([\w-]+)="([^"]*)"',t))
INK={'var(--ink)':'ink','var(--paper)':'paper'}
def parse(line):
    body=re.match(r'\s*<g id="\w+"[^>]*>(.*)</g>\s*$',line).group(1)
    toks=re.findall(r'<g class="(\w+)"[^>]*>|</g>|<path[^>]*/>|<rect[^>]*/>',body)
    items=re.findall(r'(<g class="\w+"[^>]*>|</g>|<path[^>]*/>|<rect[^>]*/>)',body)
    assert ''.join(items)==body, 'unparsed content'
    ground=None; static=[]; groups={}; cur=None
    for it in items:
        if it.startswith('<g'):
            cur={'cls':attrs(it)['class'],'rect':None,'d':None}
        elif it=='</g>':
            groups.setdefault(cur['cls'],[]).append({'mask':cur['rect'],'d':cur['d']}); cur=None
        elif it.startswith('<rect'):
            a=attrs(it); assert a['fill']=='var(--paper)' and cur
            cur['rect']=[float(a['x']),float(a['y']),float(a['width']),float(a['height'])]
        else:
            a=attrs(it)
            if 'stroke' in a:
                assert ground is None and a['stroke-width']=='6.6'; ground=a['d']
            elif cur:
                assert a['fill']=='var(--ink)' and a.get('fill-rule')=='evenodd'; cur['d']=a['d']
            else:
                assert a.get('fill-rule')=='evenodd'; static.append({'fill':INK[a['fill']],'d':a['d']})
    return ground,static,groups
ly=parse(s[43]); si=parse(s[44])
assert 'translate(-680 0)' in s[44]
def j(x): return json.dumps(x,ensure_ascii=False)
with open(out,'w') as f:
    f.write('''/*
 * Hand-drawn frames of the hero character, extracted 1:1 from scripts/source/hero-doodle.html (paths are untouched).
 * Generated: do not edit by hand. Coordinates are in the original scene space (hero-doodle.html viewBox -60 160 1000 660).
 * - static: drawn once; fill "ink" is the line colour, "paper" knocks out the background.
 * - frames: flipbook frames; each one is a paper mask (x, y, w, h) under the inked path.
 */
export type DoodlePath = { fill: "ink" | "paper"; d: string };
export type DoodleFrame = { mask: [number, number, number, number]; d: string };
export type DoodlePose = { ground: string; static: DoodlePath[] };

export { VIEW_BOX, SIT_DX } from "./heroDoodleGeometry";

''')
    f.write(f'export const LYING: DoodlePose = {j({"ground":ly[0],"static":ly[1]})};\n\n')
    f.write(f'export const SITTING: DoodlePose = {j({"ground":si[0],"static":si[1]})};\n\n')
    f.write(f'/** Lying: foot swing (~15 fps). */\nexport const FOOT_FRAMES: DoodleFrame[] = {j(ly[2]["ff"])};\n\n')
    f.write(f'/** Sitting: head nod while reading (~6 fps), eyes open. */\nexport const HEAD_FRAMES: DoodleFrame[] = {j(si[2]["hf"])};\n\n')
    f.write(f'/** Sitting: the same head frames with eyes closed (blink). */\nexport const BLINK_FRAMES: DoodleFrame[] = {j(si[2]["hb"])};\n\n')
    f.write(f'/** Sitting: typing on the laptop (~10 fps). */\nexport const TYPE_FRAMES: DoodleFrame[] = {j(si[2]["tf"])};\n')
    print({k:len(v) for k,v in ly[2].items()},{k:len(v) for k,v in si[2].items()},len(ly[1]),len(si[1]))
