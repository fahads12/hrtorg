"""Build static, source-backed HRT pages from the read-only crawl. Shopify stays external."""
from pathlib import Path
import sys,json,re,html,hashlib,urllib.parse,urllib.request,concurrent.futures,io
ROOT=Path(__file__).parent
sys.path.insert(0,str(ROOT/'.tools'))
from bs4 import BeautifulSoup
from PIL import Image
sys.stdout.reconfigure(encoding='utf-8')
E=html.escape
records=json.loads((ROOT/'source-content/crawl.json').read_text(encoding='utf8'))
canonical={}
for r in records:
    if 'error' not in r:
        key=urllib.parse.urlparse(r['finalUrl']).path.strip('/')
        if key not in canonical or r['url'].rstrip('/')==r['finalUrl'].rstrip('/'):canonical[key]=r
PORTAL='https://portal.hrt.org/app/symptoms-tracker'
STORE='https://store.hrt.org/'
root_routes={'about':'About.html','contact':'Contact.html','lab-testing':'Lab Testing.html','providers':'Providers.html','join-our-network':'Join Our Network.html','privacy-policy':'Privacy Policy.html','terms-and-conditions':'Terms and Conditions.html','return-policy':'Return Policy.html','symptoms':'Resources.html','conditions':'Resources.html','search':'Resources.html'}
skip=('drafts/','template/','plans/','hrt-products/')
routes={k:root_routes.get(k,k.replace('%20','')+'/index.html') for k in canonical if k and not k.startswith(skip)}
routes['']='HRT Home.html'
aliases={urllib.parse.urlparse(r['url']).path.strip('/'):urllib.parse.urlparse(r['finalUrl']).path.strip('/') for r in records if 'error' not in r}
assess=[('female','Female Hormone Imbalance Test','hormone-symptom-checklist-for-women-female-hormone-imbalance-test'),('male','Male Hormone Imbalance Test','hormone-symptom-checklist-men'),('pms','PMS Self-Assessment Test','pms-assessment'),('thyroid','Thyroid Assessment Test','thyroid-assessment'),('adrenal','Adrenal Fatigue Assessment Test','adrenal-fatigue'),('osteoporosis','Osteoporosis Assessment Test','osteoporosis-assessment'),('andropause','Andropause Assessment Test','andropause-assessment'),('menopause','Menopause Assessment Test','menopause-assessment'),('perimenopause','Perimenopause Assessment Test','perimenopause-assessment')]
report={'inaccessible':[{'url':r['url'],'error':r['error']} for r in records if 'error'in r],'excluded':[],'thin':[],'policyChecks':[],'assetFailures':[],'pages':[]}
def href(url,base='https://hrt.org'):
    absolute=urllib.parse.urljoin(base,url)
    p=urllib.parse.urlparse(absolute)
    if p.scheme not in ('http','https','mailto','tel'):return '#main-content'
    if p.hostname in ('store.hrt.org','shop.hrt.org'):return absolute.replace('://shop.hrt.org','://store.hrt.org')
    if p.hostname not in ('hrt.org','www.hrt.org'):return absolute
    key=aliases.get(p.path.strip('/'),p.path.strip('/'))
    if key.startswith('hrt-products/'):
        product=canonical.get(key,{})
        return next((a['href'] for a in product.get('links',[]) if 'store.hrt.org/products/' in a['href']),STORE)
    if key in routes:return routes[key]+(('?'+p.query) if p.query else '')
    return absolute
def soup_for(r):
    s=BeautifulSoup((ROOT/'source-content/html'/ (r['file']+'.html')).read_text(encoding='utf8'),'html.parser')
    for n in s.select('script,style,noscript,nav,footer,.navbar-container,.navbar-2,.footer,.search-modal,.hide,.w-condition-invisible,.w-commerce-commercecartwrapper,.w-embed,form,.w-form-done,.w-form-fail'):
        n.decompose()
    return s
BAD=re.compile(r'heyday|lorem ipsum|Vitae dui|organic UI|visual language designed|hand-made in Australia|favorite template|praise this design|\bPoochmag\b|\bDomina\b|\bUppercut\b|jus tfantasy|Whose book|My book!|Is this the real life',re.I)
assets={}
def image_url(url):
    if not url.startswith('http'):return ''
    if url not in assets:assets[url]='uploads/source/'+hashlib.sha256(url.encode()).hexdigest()[:16]+'.webp'
    return assets[url]
def useful_image(s):
    for i in s.select('img[src]'):
        src=i['src']
        if re.search(r'\.svg|icon-|pattern-|logo|HRT-org|Landscape-\d|portrait-\d|brandmark|placeholder',src,re.I):continue
        if src.startswith('http'):return image_url(src)
    return ''
ALLOWED={'h2','h3','h4','h5','h6','p','ul','ol','li','a','strong','em','b','i','u','br','blockquote','table','thead','tbody','tr','th','td','figure','figcaption','img','sup','sub','hr'}
def clean(node,base,policy=False):
    s=BeautifulSoup(str(node),'html.parser')
    if not policy:
        for artifact in s.select('p,span'):
            if artifact.get_text(' ',strip=True) in ('4o mini','\u200d'):artifact.decompose()
    for x in s.find_all(True):
        if x.parent is None:continue
        if x.name in ('script','style','iframe','form','button','input','select','textarea'):x.decompose();continue
        if x.name=='h1':x.name='h2'
        if x.name not in ALLOWED:x.unwrap();continue
        attrs={}
        if x.name=='a':
            u=x.get('href','');attrs={'href':href(u,base)} if u else {}
        if x.name=='img':
            src=x.get('src','')
            if not src.startswith('http') or 'image-placeholder' in src:x.decompose();continue
            attrs={'src':image_url(src),'alt':x.get('alt',''),'loading':'lazy','decoding':'async'}
        if x.name in ('td','th'):
            attrs={k:x[k] for k in ('colspan','rowspan') if k in x.attrs}
        x.attrs=attrs
    return str(s)
pages={}
for key,r in canonical.items():
    if not key or key.startswith(skip):
        report['excluded'].append({'url':r['finalUrl'],'reason':'Homepage handled separately; store, draft and template pages not imported.'});continue
    s=soup_for(r);h=s.find('h1');title=h.get_text(' ',strip=True) if h else r['title'].split('|')[0].strip()
    for item in s.select('.accordion-item'):
        if BAD.search(item.get_text()):item.decompose()
    policy=key in ('privacy-policy','terms-and-conditions','return-policy') or key.startswith('legal/')
    blocks=s.select('.w-richtext')
    blocks=[b for b in blocks if not b.find_parent(class_='w-richtext') and b.get_text(strip=True)]
    fragments=[]
    if blocks:
        for b in blocks:
            if not policy and BAD.search(b.get_text()):continue
            fragments.append(clean(b,r['finalUrl'],policy))
    else:
        # Retain source prose/headings/lists in DOM order; omit UI/template material.
        for b in s.select('h2,h3,h4,h5,p,ul,ol,blockquote,div'):
            if b.find_parent(['p','ul','ol','blockquote']):continue
            if b.name=='div' and (b.find(['div','h1','h2','h3','h4','h5','p','ul','ol','button','input','form']) or b.find_parent('a')):continue
            txt=b.get_text(' ',strip=True)
            if not txt or BAD.search(txt) or txt in ('Get Started','Learn More','BUY NOW','Buy Now','Start Free Consult','Visit Our Blog','contact','About Us'):continue
            if b.name=='div' and ('This is some text' in txt or txt in ('1','2','3','4','5')):continue
            if any(BAD.search(parent.get_text(' ',strip=True)) for parent in list(b.parents)[:1]) and len(b.parent.get_text())<1200:continue
            fragments.append(('<p>'+clean(b,r['finalUrl'])+'</p>') if b.name=='div' else clean(b,r['finalUrl']))
    # FAQs live outside richtext on treatment pages.
    faqs=[]
    for a in s.select('.accordion-item'):
        q=a.select_one('.accordion-title');ans=a.select_one('.accordion-content')
        if q and ans and ans.get_text(strip=True) and not BAD.search(ans.get_text()):
            faqs.append({'question':q.get_text(' ',strip=True),'answer':clean(ans,r['finalUrl'])})
    body='\n'.join(dict.fromkeys(fragments)) if not policy else '\n'.join(fragments)
    if policy:
        normalize=lambda t:re.sub(r'\s+',' ',t).strip()
        before=normalize(' '.join(b.get_text(' ',strip=True) for b in blocks))
        after=normalize(BeautifulSoup(body,'html.parser').get_text(' ',strip=True))
        report['policyChecks'].append({'url':r['finalUrl'],'exactNormalizedText':before==after,'sha256':hashlib.sha256(before.encode()).hexdigest()})
        assert before==after, 'Policy text changed: '+key
    desc=r.get('description','')
    if BAD.search(desc):desc=''
    intro=''
    if h:
        par=h.parent.find('p')
        if par and not BAD.search(par.get_text()):intro=par.get_text(' ',strip=True)
    if not intro or intro=='Medically Reviewed by':intro=desc if len(desc)<400 else ''
    if len(BeautifulSoup(body,'html.parser').get_text(strip=True))<100:
        report['thin'].append(r['finalUrl'])
        if key.startswith('glp-1/'):body=''
    pic=useful_image(s) if not policy and not key.startswith(('checklist','glp-1')) else ''
    pages[key]={'key':key,'title':title,'description':desc,'intro':intro,'body':body,'image':pic,'faqs':faqs,'source':r['finalUrl'],'route':routes[key],'policy':policy}

# Shared shell follows the existing navy/plum, serif-heading design.
def nav():
    symptom=''.join(f'<a href="{href("/checklist/"+c)}">{E(b)}</a>' for a,b,c in assess)
    return f'''<a class="skip-link" href="#main-content">Skip to content</a><header class="nav"><div class="wrap nav-inner"><a href="HRT Home.html" aria-label="HRT.org home"><img class="logo hrt-logo" src="uploads/hrt-logo.png" alt="HRT.org" width="1800" height="900"></a><button class="mobile-menu" type="button" aria-expanded="false" aria-controls="site-navigation">Menu <span aria-hidden="true">☰</span></button><nav id="site-navigation" class="nav-links" aria-label="Main navigation"><a class="nav-link" href="Audience.html?g=women">For Women</a><a class="nav-link" href="Audience.html?g=men">For Men</a><a class="nav-link" href="Lab Testing.html">Lab Testing</a><a class="nav-link" href="Treatments.html">Treatments</a><a class="nav-link" href="How It Works.html">How It Works</a><a class="nav-link" href="Resources.html">Resources</a><details class="source-dropdown"><summary>Symptom Check</summary><div>{symptom}</div></details><a class="nav-link" href="{STORE}">Shop ↗</a></nav><div class="nav-actions"><a class="nav-link" href="https://portal.hrt.org">Sign in</a><a class="btn btn-primary" href="{PORTAL}">Get Started</a></div></div></header>'''
def footer():
    cols=[('Care',[('For Women','Audience.html?g=women'),('For Men','Audience.html?g=men'),('Treatments','Treatments.html'),('Lab Testing','Lab Testing.html'),('Shop',STORE)]),('HRT.org',[('About','About.html'),('Medical Board','Providers.html'),('Join Our Network','Join Our Network.html'),('Journal','Resources.html'),('FAQs','FAQ.html')]),('Support',[('Contact','Contact.html'),('info@hrt.org','mailto:info@hrt.org'),('(888) 574-5524','tel:+18885745524'),('Patient Portal','https://portal.hrt.org')]),('Policies',[('Privacy','Privacy Policy.html'),('Terms and Conditions','Terms and Conditions.html'),('Returns','Return Policy.html'),('Telehealth Consent','legal/consent-to-telehealth/index.html'),('Health Information Privacy','legal/health-information-privacy-practices/index.html'),('Pharmacy Information','legal/pharmacy-information/index.html'),('Supplement Consent','legal/informed-consent-regarding-nutritional-and-herbal-supplements/index.html')])]
    return '<footer class="footer"><div class="wrap"><div class="footer-grid"><div class="brand-block"><a href="HRT Home.html"><img class="logo hrt-logo" src="uploads/hrt-logo.png" alt="HRT.org" width="1800" height="900"></a><p>Personalized care for women and men.</p><p>Telehealth services currently available in Florida and California.</p></div>'+''.join('<div><h4>'+label+'</h4><ul>'+''.join(f'<li><a href="{E(url)}">{E(name)}</a></li>' for name,url in links)+'</ul></div>' for label,links in cols)+'</div><div class="footer-bottom"><span>© '+str(2026)+' HRT.org. All rights reserved.</span><span><a href="https://www.instagram.com/hrt_health/">Instagram</a> · <a href="https://www.facebook.com/hrthealth">Facebook</a> · <a href="https://twitter.com/hrt_org">Twitter</a></span></div></div></footer>'
def shell(title,description,content,file,source='',extra=''):
    depth=len(Path(file).parts)-1;base='../'*depth or './'
    text=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="{base}"><title>{E(title)} | HRT.org</title><meta name="description" content="{E(description or title)}"><link rel="icon" href="uploads/hrt-logo.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap" rel="stylesheet"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="premium.css"><link rel="stylesheet" href="source-site.css"></head><body>{nav()}<main id="main-content">{content}</main>{footer()}<script src="site-interactions.js" defer></script>{extra}</body></html>'''
    path=ROOT/file;path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text,encoding='utf8')
    report['pages'].append({'file':file,'title':title,'source':source})
def card(p):
    img=f'<img src="{p["image"]}" alt="" loading="lazy" decoding="async" width="640" height="400">' if p.get('image') else '<div class="card-mark" aria-hidden="true">HRT<span>health & knowledge</span></div>'
    return f'<article class="source-card" data-reveal data-search="{E((p["title"]+" "+p["key"]).lower())}"><a href="{E(p["route"])}">{img}<div><span class="eyebrow">{E(p["key"].split("/")[0].replace("-"," "))}</span><h2>{E(p["title"])}</h2><span class="text-link">Read more →</span></div></a></article>'
def faq_html(faqs):return '<div class="source-faqs">'+''.join(f'<details><summary>{E(f["question"])}</summary><div class="source-prose">{f["answer"]}</div></details>' for f in faqs)+'</div>' if faqs else ''
def hero(title,intro='',image=''):
    return f'<section class="source-hero"><div class="wrap source-hero-grid"><div><a class="eyebrow" href="HRT Home.html">HRT.org / Personal care</a><h1>{E(title)}</h1>{"<p>"+E(intro)+"</p>" if intro else ""}</div>{"<img src="+chr(34)+image+chr(34)+" alt="+chr(34)+chr(34)+" width="+chr(34)+640+chr(34)+">" if False else (f"<img src='{image}' alt='' width='640' height='480' fetchpriority='high'>" if image else '')}</div></section>'
def cta():return f'<aside class="source-cta"><div><h2>Care starts with a conversation.</h2><p>Explore your next steps with HRT.org.</p></div><a class="btn btn-primary" href="{PORTAL}">Get Started →</a></aside>'

for key,p in pages.items():
    if key in ('contact','join-our-network','providers','symptoms','conditions','search') or key.startswith('blog-categories/'):continue
    content=hero(p['title'],p['intro'] if not p['policy'] else '',p['image'])
    if key.startswith('checklist/') or 'assessment' in key or 'checklist' in key or key=='menopause-quiz':
        content+='<div class="wrap"><div class="source-cta"><div><h2>Explore your symptoms</h2><p>Prepare for a conversation with your care team.</p></div><a class="btn btn-primary" href="Symptom Check.html">Explore symptom checks</a></div></div>'
    if not p['body'].strip():content+='<div class="wrap source-prose"><p>Information on this topic is not available yet.</p><p><a href="Contact.html">Contact our team</a> for help.</p></div>'
    else:content+=f'<section class="wrap source-reading"><article class="source-prose">{p["body"]}</article>{faq_html(p["faqs"])}</section>'
    if key.startswith(('men/','women/')):content+='<div class="wrap">'+cta()+'</div>'
    shell(p['title'],p['description'],content,p['route'],p['source'])

services=[p for k,p in pages.items() if k.startswith(('men/','women/'))]
articles=[p for k,p in pages.items() if k.startswith(('health/','glp-1/')) and len(BeautifulSoup(p['body'],'html.parser').get_text(strip=True))>100]
articles.sort(key=lambda p:p['title'].lower())
def grid(items):return '<div class="source-grid">'+''.join(card(p) for p in items)+'</div>'
shell('Treatments','Explore HRT.org treatments for women and men.',hero('One care platform. Every part of your health.','Explore hormone therapy, peptides, weight management, sexual health, and hair loss care.')+'<section class="wrap">'+grid(services)+'</section>','Treatments.html')
shell('Care for women and men','Explore HRT.org care by your needs.',hero('Care built around you.','Explore care for women and men.')+'<section class="wrap"><div class="filter-row"><button type="button" data-audience="women">For Women</button><button type="button" data-audience="men">For Men</button></div>'+grid(services)+'</section>','Audience.html',extra='<script src="route-compat.js" defer></script>')
shell('Health education and journal','Read HRT.org articles about hormones, symptoms, testing and health.',hero('Knowledge for your next chapter.','Explore the HRT.org health journal.')+'<section class="wrap"><div class="filter-row"><label for="article-search">Search articles</label><input id="article-search" type="search" placeholder="Search hormones, symptoms, testing…"><span id="search-count" role="status"></span></div>'+grid(articles)+'<p id="no-results" hidden>No articles match your search.</p></section>','Resources.html')
for key,p in pages.items():
    if key.startswith('blog-categories/'):
        membership=json.loads((ROOT/'source-content/category-membership.json').read_text(encoding='utf8'))['categories']
        links=set(next(c['articles'] for c in membership if c['key']==key.replace('%20','')))
        items=[a for a in articles if a['key'] in links]
        shell(p['title'],p['description'],hero(p['title'])+'<section class="wrap">'+grid(items)+('<p><a href="Resources.html">Browse all articles</a></p>')+'</section>',p['route'],p['source'])
providers=[p for k,p in pages.items() if k.startswith('providers/')]
shell('Our medical board','Meet the our medical professionals.',hero('Our medical board.','Meet the people behind your care.')+'<section class="wrap">'+grid(providers)+'</section>','Providers.html','https://hrt.org/providers')
contact=hero('Let’s talk.','We’d love to hear any questions or feedback you have.')+'''<section class="wrap contact-grid"><div class="source-prose"><h2>Contact HRT.org</h2><p><a href="tel:+18885745524">(888) 574-5524</a><br><a href="mailto:info@hrt.org">info@hrt.org</a></p><h3>Order and return support</h3><p><a href="mailto:support@hrt.org">support@hrt.org</a></p></div><form class="email-draft-form source-form"><h2>Send an email</h2><p>This opens a draft in your email app. Nothing is submitted here.</p><label>Name<input name="name" autocomplete="name" required></label><label>Email<input name="email" type="email" autocomplete="email" required></label><label>Phone (optional)<input name="phone" type="tel" autocomplete="tel"></label><label>Message<textarea name="message" rows="5" required></textarea></label><button class="btn btn-primary" type="submit">Open email draft →</button></form></section>'''
shell('Contact HRT.org','Contact HRT.org by email or telephone.',contact,'Contact.html','https://hrt.org/contact')
network=pages.get('join-our-network',{})
shell('Join Our Network',network.get('description',''),hero('Join our provider network.')+'<section class="wrap source-reading"><article class="source-prose">'+network.get('body','')+f'</article><div class="source-cta"><div><h2>Connect with HRT.org</h2><p>Contact our team about joining the provider network.</p></div><a class="btn btn-primary" href="mailto:info@hrt.org?subject=Provider%20network%20enquiry">Contact our team →</a></div></section>','Join Our Network.html','https://hrt.org/join-our-network')
shell('Start your consultation','Continue to the HRT.org patient portal.',hero('Your next step starts here.','Continue to the HRT.org patient portal to share your symptoms and explore care.')+f'<section class="wrap source-reading"><div class="source-cta"><div><h2>HRT.org patient portal</h2><p>Telehealth services are currently available in Florida and California.</p></div><a class="btn btn-primary" href="{PORTAL}">Continue to patient portal →</a></div><p>Already have an account? <a href="https://portal.hrt.org">Sign in</a>.</p><p>Questions? <a href="tel:+18885745524">Call (888) 574-5524</a>.</p></section>','Consultation.html',PORTAL)
shell('Pricing and purchasing','Find current test-kit prices and purchase information at the HRT.org store.',hero('Choose your next step.','Shop test kits and products through the separate HRT.org store.')+f'<section class="wrap source-reading"><div class="source-cta"><div><h2>HRT.org store</h2><p>View current prices, product details, availability and checkout information in the store.</p></div><a class="btn btn-primary" href="{STORE}">Visit the shop →</a></div><div class="source-prose"><h2>Consultation and treatment</h2><p>Continue to the patient portal for care options. HRT.org’s terms describe its services as cash-pay.</p><p><a href="{PORTAL}">Get started with HRT.org</a> · <a href="Terms and Conditions.html">Terms and conditions</a> · <a href="Return Policy.html">Return policy</a></p></div></section>','Pricing.html')
steps=[('Order your test','Choose your test through the secure HRT.org store. Your kit is delivered to your door.'),('Collect and return','Follow the instructions supplied with your specific kit, then return your sample using its prepaid shipping package.'),('Receive your results','Results include graphics, symptom interpretation and clinically informed comments. Timing varies by test; refer to your kit’s information.'),('Discuss your care','Use the patient portal to connect with HRT.org about your symptoms, results and care options.')]
shell('How It Works','How at-home laboratory testing and care work with HRT.org.',hero('A clear path. A team beside you.','From choosing a test to understanding your next steps.')+'<section class="wrap"><ol class="source-steps">'+''.join(f'<li data-reveal><span>0{i+1}</span><h2>{t}</h2><p>{d}</p></li>' for i,(t,d) in enumerate(steps))+'</ol>'+cta()+'<p class="source-credit">Testing information: <a href="https://hrt.org/lab-testing">HRT.org lab testing</a>. Collection methods and timing depend on the kit.</p></section>','How It Works.html')
allfaq=[]
for p in services:
    for f in p['faqs']:
        if f['question'] not in [x['question'] for x in allfaq]:allfaq.append(f)
for k,r in canonical.items():
    if k.startswith('hrt-products/') and any(word in k for word in ('optimal-female','optimal-male','thyroid-test')) and ('test' in k):
        s=soup_for(r)
        for a in s.select('.accordion-item'):
            q=a.select_one('.accordion-title');ans=a.select_one('.accordion-content')
            if q and ans and not BAD.search(ans.get_text()):allfaq.append({'question':q.get_text(' ',strip=True),'answer':clean(ans,r['finalUrl'])+f'<p><a href="{r["finalUrl"]}">Source and test-kit context</a></p>'})
shell('Frequently Asked Questions','Answers from the HRT.org treatment pages.',hero('Your questions, answered.','Explore information from HRT.org’s treatment and testing pages.')+'<section class="wrap source-reading">'+faq_html(allfaq)+cta()+'</section>','FAQ.html')
shell('Symptom checks','Explore the HRT.org symptom assessments.',hero('Understand the changes you’ve noticed.','Choose an assessment to explore health information and questions.')+'<section class="wrap"><div class="assessment-grid">'+''.join(f'<a class="source-panel" data-test="{a}" href="{href("/checklist/"+c)}"><h2>{b}</h2><span>Explore assessment →</span></a>' for a,b,c in assess)+'</div></section>','Symptom Check.html',extra='<script src="route-compat.js" defer></script>')
# Legacy page entry points continue to work; route compatibility is explicit and finite.
for file,title in [('Product.html','Treatment information'),('Article.html','Health journal'),('HRT Landing.html','Personalized care')]:
    shell(title,title,hero(title)+'<section class="wrap source-reading"><p><a href="Treatments.html">Explore treatments</a> · <a href="Resources.html">Read the health journal</a> · <a href="'+STORE+'">Visit the shop</a></p></section>',file,extra='<script src="route-compat.js" defer></script>')

# Original kit photography is educational presentation only; purchasing stays in Shopify.
kit_cards=[]
for key,r in canonical.items():
    if key.startswith('hrt-products/') and any(word in key for word in ('optimal-female','optimal-male','thyroid-test')) and 'test' in key:
        s=soup_for(r);pic=useful_image(s);heading=s.find('h1')
        if pic and heading:
            title=heading.get_text(' ',strip=True)
            buy=next((a['href'] for a in r['links'] if 'store.hrt.org/products/' in a['href']),STORE)
            kit_cards.append(f'<article class="source-card" data-reveal><a href="{E(buy)}"><img src="{pic}" alt="{E(title)} packaging" loading="lazy" width="640" height="400" style="object-fit:contain"><div><h2>{E(title)}</h2><span class="text-link">View in the HRT.org shop ↗</span></div></a></article>')
if kit_cards:
    lab=ROOT/'Lab Testing.html';markup=lab.read_text(encoding='utf8')
    markup=markup.replace('</main>','<section class="wrap"><h2 class="source-section-title">Explore at-home testing</h2><div class="source-grid">'+''.join(kit_cards)+'</div></section></main>')
    lab.write_text(markup,encoding='utf8')
# Download only original main-site imagery; no fabricated product packaging.
(ROOT/'uploads/source').mkdir(parents=True,exist_ok=True)
def download(item):
    url,dest=item;path=ROOT/dest
    if path.exists():return
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
        data=urllib.request.urlopen(req,timeout=25).read()
        im=Image.open(io.BytesIO(data));im.thumbnail((1200,1000))
        if im.mode not in ('RGB','RGBA'):im=im.convert('RGBA')
        im.save(path,'WEBP',quality=82,method=5)
    except Exception as ex:report['assetFailures'].append({'url':url,'path':dest,'error':str(ex)})
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:list(pool.map(download,assets.items()))
# Keep broken assets out of rendered pages, while retaining failure evidence.
for fail in report['assetFailures']:
    for entry in report['pages']:
        path=ROOT/entry['file'];text=path.read_text(encoding='utf8')
        if fail['path'] in text:
            text=re.sub(r'<img\b[^>]*src=[\"\']'+re.escape(fail['path'])+r'[\"\'][^>]*>','',text)
            path.write_text(text,encoding='utf8')
(ROOT/'source-content/migration-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
(ROOT/'source-content/asset-manifest.json').write_text(json.dumps([{'source':u,'file':v,'rights':'Original HRT.org website asset; reused for this authorized redesign. Third-party license not independently established.'} for u,v in assets.items()],ensure_ascii=False,indent=2),encoding='utf8')
(ROOT/'source-content/page-index.json').write_text(json.dumps([{k:v for k,v in p.items() if k not in ('body','faqs')} for p in pages.values()],ensure_ascii=False,indent=2),encoding='utf8')
(ROOT/'source-content/page-content.json').write_text(json.dumps(pages,ensure_ascii=False),encoding='utf8')
(ROOT/'site-shell.json').write_text(json.dumps({'nav':nav(),'footer':footer()},ensure_ascii=False),encoding='utf8')
print('Built',len(report['pages']),'pages;',len(assets),'source assets;',len(report['assetFailures']),'asset errors;',len(report['policyChecks']),'exact policy checks.')
