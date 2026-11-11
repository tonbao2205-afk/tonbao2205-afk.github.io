"""python -I qa_seo.py <out.json> -> 6 trang Dzuong x 320/390/768/1366 x sang/toi + kiem tra bot.
Kiem tra: 1 H1, canonical, JSON-LD (parse + FAQ khop chu hien thi), loi JS, tran ngang, vung bam >=44px,
khoi .r hien du, tuong phan (check.js)."""
import asyncio, json, os, subprocess, sys, time, urllib.request
import websockets

sys.stdout.reconfigure(encoding='utf-8')
CH = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
HERE = os.path.dirname(os.path.abspath(__file__))
CHK = open(r'G:\VestLeHuong-Website-Latest\docs\bo-nhan-boc-box-20261103\contrast-check\check.js', encoding='utf-8').read()
CHK = CHK.replace("window.addEventListener('load',function(){setTimeout(run,1500)});", 'run();')
MOB = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
DESK = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'
BOT = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/130 Safari/537.36'
B = 'http://127.0.0.1:8112'
PATHS = ['/', '/san-pham', '/dong-phuc', '/nang-luc-san-xuat', '/gioi-thieu', '/phap-ly']
CHECK = r"""(function(){
var d=document,h=d.documentElement,r={};
r.h1=d.querySelectorAll('h1').length;
var c=d.querySelector('link[rel=canonical]');r.canonical=c&&c.href;
r.ld=[];r.ldErr=[];
[].forEach.call(d.querySelectorAll('script[type="application/ld+json"]'),function(s){try{r.ld.push(JSON.parse(s.textContent))}catch(e){r.ldErr.push(String(e))}});
var faqLd=[];r.ld.forEach(function(o){(o['@graph']||[o]).forEach(function(n){if(n['@type']==='FAQPage')n.mainEntity.forEach(function(q){faqLd.push([q.name,q.acceptedAnswer.text])})})});
var faqDom=[].map.call(d.querySelectorAll('.faq details'),function(x){return [x.querySelector('summary').textContent.trim(),x.querySelector('.a').textContent.trim()]});
r.faqCount=faqDom.length;r.faqMatch=JSON.stringify(faqLd)===JSON.stringify(faqDom);
r.types=[];r.ld.forEach(function(o){(o['@graph']||[o]).forEach(function(n){r.types.push(n['@type'])})});
r.overflow=h.scrollWidth>h.clientWidth;
var small=[];
[].forEach.call(d.querySelectorAll('a[href],button,summary'),function(e){
  if(e.closest('p,li,dd,dt,figcaption,.pillars'))return;
  var b=e.getBoundingClientRect();if(!b.width||!b.height)return;
  var st=getComputedStyle(e);if(st.visibility==='hidden')return;
  if(b.height<44||b.width<44)small.push((e.className||e.tagName)+' '+(e.textContent||'').trim().slice(0,24)+' '+Math.round(b.width)+'x'+Math.round(b.height));
});
r.small=small;
var hidden=[].filter.call(d.querySelectorAll('.r'),function(e){return !e.classList.contains('v')||getComputedStyle(e).opacity!=='1'});
r.hiddenR=hidden.length;
return r})()"""


async def main():
    out = sys.argv[1]
    proc = subprocess.Popen([CH, '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars', '--remote-debugging-port=9379',
                             '--user-data-dir=' + os.path.join(HERE, '..', 'qa', 'prof-seo'), 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    res = []
    try:
        for _ in range(60):
            try:
                tabs = json.load(urllib.request.urlopen('http://127.0.0.1:9379/json')); break
            except Exception:
                time.sleep(0.25)
        url = next(t['webSocketDebuggerUrl'] for t in tabs if t['type'] == 'page')
        async with websockets.connect(url, max_size=400_000_000) as ws:
            n = [0]; errs = []

            async def call(method, **p):
                n[0] += 1; i = n[0]
                await ws.send(json.dumps({'id': i, 'method': method, 'params': p}))
                while True:
                    m = json.loads(await asyncio.wait_for(ws.recv(), 60))
                    if m.get('method') == 'Runtime.exceptionThrown':
                        dd = m['params']['exceptionDetails']; errs.append((dd.get('exception', {}).get('description') or dd.get('text', ''))[:200])
                    if m.get('method') == 'Runtime.consoleAPICalled' and m['params'].get('type') == 'error':
                        errs.append('console: ' + str([a.get('value', a.get('description')) for a in m['params']['args']])[:200])
                    if m.get('method') == 'Log.entryAdded' and m['params']['entry'].get('level') == 'error':
                        errs.append('log: ' + m['params']['entry'].get('text', '')[:120] + ' ' + str(m['params']['entry'].get('url', ''))[:120])
                    if m.get('id') == i:
                        return m.get('result', m.get('error'))

            async def ev(x):
                r = await call('Runtime.evaluate', expression=x, returnByValue=True, awaitPromise=True)
                return r.get('result', {}).get('value')
            await call('Page.enable'); await call('Runtime.enable'); await call('Log.enable')
            # bot: khong cuon, moi khoi .r phai hien ngay
            await call('Emulation.setDeviceMetricsOverride', width=1366, height=900, deviceScaleFactor=1, mobile=False)
            await call('Emulation.setUserAgentOverride', userAgent=BOT)
            for p in PATHS:
                await call('Page.navigate', url=B + p); await asyncio.sleep(2.5)
                v = await ev("[].filter.call(document.querySelectorAll('.r'),function(e){return getComputedStyle(e).opacity!=='1'}).length")
                res.append({'bot': p, 'hiddenR': v}); print('bot', p, 'hidden', v, flush=True)
            # nguoi dung binh thuong: khong cuon, sau 1.5s khoi trong khung nhin phai hien
            await call('Emulation.setUserAgentOverride', userAgent=DESK)
            for p in PATHS:
                await call('Page.navigate', url=B + p); await asyncio.sleep(2.5)
                v = await ev("[].filter.call(document.querySelectorAll('.r'),function(e){var b=e.getBoundingClientRect();return b.top<innerHeight&&b.bottom>0&&getComputedStyle(e).opacity!=='1'}).length")
                res.append({'viewport': p, 'hiddenInView': v}); print('view', p, 'hidden in view', v, flush=True)
            for w in (320, 390, 768, 1366):
                mobile = w < 768
                await call('Emulation.setDeviceMetricsOverride', width=w, height=844 if w < 1024 else 900, deviceScaleFactor=1, mobile=mobile)
                await call('Emulation.setUserAgentOverride', userAgent=MOB if mobile else DESK)
                for mode in ('light', 'dark'):
                    sid = await call('Page.addScriptToEvaluateOnNewDocument', source="try{localStorage.setItem('mlh_theme','%s')}catch(e){}" % mode)
                    for p in PATHS:
                        errs.clear()
                        await call('Page.navigate', url=B + p); await asyncio.sleep(3)
                        await ev("document.documentElement.style.scrollBehavior='auto'")
                        await ev("new Promise(function(d){var y=0;(function s(){window.scrollTo(0,y);y+=400;if(y<document.documentElement.scrollHeight+400)setTimeout(s,80);else{setTimeout(d,900)}})()})")
                        info = await ev(CHECK)
                        await ev("document.querySelectorAll('details').forEach(function(x){x.open=true})")
                        await ev(CHK)
                        cout = await ev("(document.getElementById('contrast-out')||{}).textContent||''")
                        lines = (cout or '').split('\n')
                        fails = [l for l in lines[1:] if l.strip()]
                        exp = 'https://dzuongtailor.com' + (p if p != '/' else '/')
                        item = {'page': p, 'w': w, 'mode': mode, 'h1': info['h1'], 'canonical': info['canonical'], 'canonicalOk': info['canonical'] == exp,
                                'ldErr': info['ldErr'], 'types': info['types'], 'faqCount': info['faqCount'], 'faqMatch': info['faqMatch'],
                                'overflow': info['overflow'], 'small': info['small'], 'hiddenR': info['hiddenR'], 'contrastChecked': lines[0],
                                'contrastFails': fails, 'errs': list(errs)}
                        res.append(item)
                        bad = (item['h1'] != 1 or not item['canonicalOk'] or item['ldErr'] or (item['faqCount'] and not item['faqMatch']) or item['overflow']
                               or item['small'] or item['hiddenR'] or fails or item['errs'])
                        print(p, w, mode, 'BAD' if bad else 'ok', '' if not bad else json.dumps({k: item[k] for k in ('h1', 'canonical', 'ldErr', 'faqMatch', 'overflow', 'small', 'hiddenR', 'contrastFails', 'errs')}, ensure_ascii=False)[:600], flush=True)
                    await call('Page.removeScriptToEvaluateOnNewDocument', identifier=sid['identifier'])
    finally:
        proc.kill()
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(res, f, ensure_ascii=False, indent=1)


asyncio.run(main())
