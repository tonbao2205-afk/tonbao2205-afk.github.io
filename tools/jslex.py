"""Minimal JavaScript lexer: finds string / template literals, skipping comments and regex literals.

Returns spans so callers can rewrite literal contents in place without touching code.
Template literals: only the static chunks between ${...} are reported (kind 'tpl'),
nested expressions are lexed recursively.
"""
import re

_ID = re.compile(r'[A-Za-z0-9_$À-￿]')
_REGEX_PREV_KEYWORDS = {'return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void',
                        'throw', 'case', 'do', 'else', 'yield', 'await'}


def literals(src):
    """Yield dicts {start, end, quote, kind} where src[start:end] is the literal *content* (no quotes)."""
    out = []
    _lex(src, 0, len(src), out, top=True)
    return out


def _lex(src, i, n, out, top=False, stop_at_brace=False):
    prev = ''  # last significant token: '' / 'id:<word>' / punct char / 'lit' / 'num' / ')' / ']'
    depth = 0
    while i < n:
        c = src[i]
        if c in ' \t\r\n ﻿':
            i += 1; continue
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i)
            i = n if j < 0 else j
            continue
        if c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2)
            i = n if j < 0 else j + 2
            continue
        if c in '\'"':
            j = i + 1
            while j < n and src[j] != c:
                if src[j] == '\\': j += 2; continue
                if src[j] == '\n': break
                j += 1
            out.append({'start': i + 1, 'end': j, 'quote': c, 'kind': 'str'})
            i = j + 1; prev = 'lit'; continue
        if c == '`':
            i = _template(src, i + 1, n, out)
            prev = 'lit'; continue
        if c == '/':
            regex_ok = prev == '' or (prev.startswith('id:') and prev[3:] in _REGEX_PREV_KEYWORDS) or \
                (len(prev) == 1 and prev in '(,=:[!&|?{};+-*%<>~^')
            if regex_ok:
                j = i + 1; in_cls = False
                while j < n:
                    d = src[j]
                    if d == '\\': j += 2; continue
                    if d == '[': in_cls = True
                    elif d == ']': in_cls = False
                    elif d == '/' and not in_cls: break
                    elif d == '\n': break
                    j += 1
                j += 1
                while j < n and _ID.match(src[j]): j += 1
                i = j; prev = 'lit'; continue
            i += 1; prev = '/'; continue
        if stop_at_brace:
            if c == '{': depth += 1
            elif c == '}':
                if depth == 0: return i + 1
                depth -= 1
        if _ID.match(c):
            j = i
            while j < n and _ID.match(src[j]): j += 1
            word = src[i:j]
            prev = 'num' if word[0].isdigit() else 'id:' + word
            i = j; continue
        prev = c
        i += 1
    return i


def _template(src, i, n, out):
    start = i
    while i < n:
        c = src[i]
        if c == '\\': i += 2; continue
        if c == '`':
            out.append({'start': start, 'end': i, 'quote': '`', 'kind': 'tpl'})
            return i + 1
        if c == '$' and i + 1 < n and src[i + 1] == '{':
            out.append({'start': start, 'end': i, 'quote': '`', 'kind': 'tpl'})
            i = _lex(src, i + 2, n, out, stop_at_brace=True)
            start = i
            continue
        i += 1
    return i
