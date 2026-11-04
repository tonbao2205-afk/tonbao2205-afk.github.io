"""Vietnamese -> English segment translator shared by build_en_site.py.

Dictionaries (i18n/en/):
  units.json  {"<vi template>": "<en template>"}  placeholders: {N1} product name, {C1} product code, {D1} number
  names.json  {"<vi product name>": "<en product name>"}

A segment is translated by: exact template match -> sentence-by-sentence match.
Anything not found is recorded in `missing` (template form) and the Vietnamese text is kept.
"""
import json
import re
from pathlib import Path

VI_CHARS = re.compile('[À-ÃÈ-ÊÌÍÒ-ÕÙÚÝà-ãè-êìíò-õùúýĂăĐđĨĩŨũƠơƯưẠ-ỹ]')
LETTERS = re.compile(r'[A-Za-zÀ-ỹ]')
NUM = re.compile(r'\d+(?:[.,]\d+)*')
CODE = re.compile(r'(?<![A-Za-z0-9])[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+(?![A-Za-z0-9])')
SENT_SPLIT = re.compile(r'(?<=[.!?…])\s+(?=\S)')
WS = re.compile(r'\s+')
PRICE = re.compile('^(\\d{1,3}(?:\\.\\d{3})+)(\\s*[₫đ])$')


def has_vi(s):
    return bool(VI_CHARS.search(s or ''))


def norm(s):
    return WS.sub(' ', s or '').strip()


class Translator:
    def __init__(self, i18n_dir, product_names=(), product_codes=(), joiner=' '):
        self.joiner = joiner
        d = Path(i18n_dir)
        self.units = _load(d / 'units.json')
        self.names = _load(d / 'names.json')
        # Longest first so "Ca vat Mau Do Hoa Tiet" wins over "Ca vat Mau Do".
        self.name_list = sorted({n for n in product_names if n and len(n) >= 6}, key=len, reverse=True)
        self._name_re = re.compile('|'.join(re.escape(n) for n in self.name_list)) if self.name_list else None
        self.codes = sorted({c for c in product_codes if c and re.fullmatch(r'[A-Za-z0-9-]{2,}', c) and re.search(r'\d', c)}, key=len, reverse=True)
        self._code_re = re.compile(r'(?<![A-Za-z0-9\x00])(?:' + '|'.join(re.escape(c) for c in self.codes) + r')(?![A-Za-z0-9])') if self.codes else None
        self.missing = {}        # template -> example
        self.missing_names = {}  # vi name -> example
        self.ascii_seen = {}     # ascii-only segments seen in HTML text (may be Vietnamese without marks)
        self.hits = set()        # ('u', template) / ('n', name) used – lets callers ship a minimal runtime dict

    # ---------------------------------------------------------------- templates
    def templatize(self, s):
        slots = {'N': [], 'C': [], 'D': []}

        def put(kind, val):
            slots[kind].append(val)
            return '\x00%s%s\x00' % (kind, chr(0xE000 + len(slots[kind])))

        t = s
        if self._name_re:
            t = self._name_re.sub(lambda m: put('N', m.group(0)), t)
        if self._code_re:
            t = self._code_re.sub(lambda m: put('C', m.group(0)), t)
        t = CODE.sub(lambda m: put('C', m.group(0)), t)
        t = NUM.sub(lambda m: put('D', m.group(0)), t)
        t = re.sub('\x00([NCD])([-])\x00', lambda m: '{%s%d}' % (m.group(1), ord(m.group(2)) - 0xE000), t)
        return t, slots

    def fill(self, en_tpl, slots, example):
        ok = True

        def rep(m):
            nonlocal ok
            kind, idx = m.group(1), int(m.group(2)) - 1
            vals = slots.get(kind) or []
            if idx >= len(vals):
                ok = False
                return m.group(0)
            v = vals[idx]
            if kind == 'N':
                en = self.names.get(v)
                if en is None:
                    self.missing_names.setdefault(v, example)
                    ok = False
                    return v
                return en
            if kind == 'D':
                return en_number(v)
            return v

        out = re.sub(r'\{([NCD])(\d+)\}', rep, en_tpl)
        return out if ok else None

    # ---------------------------------------------------------------- translate
    def lookup(self, s, example=None):
        """Translate one normalized string (no sentence splitting). Returns None if unknown."""
        if s in self.units:
            self.hits.add(('u', s))
            return self.units[s]
        if s in self.names:
            self.hits.add(('n', s))
            return self.names[s]
        tpl, slots = self.templatize(s)
        en = self.units.get(tpl)
        if en is None:
            return None
        out = self.fill(en, slots, example or s)
        if out is not None:
            self.hits.add(('u', tpl))
            for n in slots['N']:
                self.hits.add(('n', n))
        return out

    def translate(self, text, record=True, context=None):
        """Translate a text segment keeping its outer whitespace. Returns translated text (or original)."""
        if not text or not LETTERS.search(text):
            m = PRICE.match(norm(text or ''))
            return polish(text.replace(m.group(1), en_number(m.group(1)))) if m else text
        lead = text[:len(text) - len(text.lstrip())]
        trail = text[len(text.rstrip()):]
        s = norm(text)
        if not s:
            return text
        if not has_vi(s):
            if s in self.units:
                self.hits.add(('u', s))
                return lead + self.units[s] + trail
            return text
        en = self.lookup(s, s)
        if en is None:
            parts = SENT_SPLIT.split(s)
            outs = None
            if len(parts) > 1:
                outs = [self.lookup(p, s) if has_vi(p) else self.units.get(p, p) for p in parts]
                if all(o is not None for o in outs):
                    en = self.joiner.join(outs)
            if en is None:
                en = self.split_list(s)
            if en is None and record:
                if outs:
                    for p, o in zip(parts, outs):
                        if o is None:
                            self._miss(p, context or s)
                else:
                    self._miss(s, context or s)
        if en is None:
            return text
        return lead + polish(en) + trail

    LIST_SEP = re.compile(r'( · | \| | / |, | – | - |: )')

    def split_list(self, s):
        """Fallback for label lists such as 'Size S · Trắng' or 'MÃ: P01'."""
        bits = self.LIST_SEP.split(s)
        if len(bits) < 3:
            return None
        out = []
        for i, b in enumerate(bits):
            if i % 2 == 1:
                out.append(b)
                continue
            if not has_vi(b):
                out.append(self.units.get(b, b))
                continue
            t = self.lookup(b, s)
            if t is None:
                return None
            out.append(t)
        return ''.join(out)

    def _miss(self, s, example):
        tpl, slots = self.templatize(s)
        for n in slots['N']:
            if n not in self.names:
                self.missing_names.setdefault(n, example)
        self.missing.setdefault(tpl, example[:300])


CUR = re.compile(r'(\d)\s?đ(?![A-Za-zÀ-ỹ])')


def polish(s):
    return CUR.sub(lambda m: m.group(1) + '₫', s).replace('VNĐ', 'VND')


def en_number(v):
    # Vietnamese thousand separators "3.800.000" -> "3,800,000"; decimal comma "1,5" -> "1.5"
    if re.fullmatch(r'\d{1,3}(?:\.\d{3})+', v):
        return v.replace('.', ',')
    if re.fullmatch(r'\d+,\d{1,2}', v):
        return v.replace(',', '.')
    return v


def _load(p):
    if not p.exists():
        return {}
    data = json.loads(p.read_text(encoding='utf-8'))
    return {norm(k): v for k, v in data.items() if not k.startswith('//')}
