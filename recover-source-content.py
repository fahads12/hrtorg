"""Targeted, repeatable recovery from saved public HTML; never executes source scripts."""
from pathlib import Path
import sys, json, re, ast
sys.path.insert(0, str(Path(__file__).parent / '.tools'))
from bs4 import BeautifulSoup
ROOT = Path(__file__).parent
ARCHIVE = ROOT / 'source-content/recovery'

def soup(name):
    return BeautifulSoup((ARCHIVE / (name + '.html')).read_text(encoding='utf8'), 'html.parser')

def clean(node):
    node = BeautifulSoup(str(node), 'html.parser')
    for el in node.find_all(['script', 'style', 'iframe', 'form', 'img']): el.decompose()
    for el in node.find_all(True):
        el.attrs = {'href': el['href']} if el.name == 'a' and el.get('href', '').startswith(('https://', '/')) else {}
    return ''.join(str(x) for x in node.contents)

def faqs(s):
    return [{'question': a.select_one('.accordion-title').get_text(' ', strip=True),
             'answer': clean(a.select_one('.accordion-content'))}
            for a in s.select('.accordion-item') if a.select_one('.accordion-title') and a.select_one('.accordion-content')]

recovered = {}
for name, slug in [('semaglutide', 'semaglutide-injections'), ('bioboost', 'semaglutide-bioboost-injections')]:
    s = soup(name)
    body = '\n'.join(clean(b) for b in s.select('.w-richtext') if b.get_text(strip=True))
    # BioBoost's side-effects paragraph sits outside Webflow rich text.
    if name == 'bioboost':
        heading = s.find(lambda t: t.name in ['h2', 'h3', 'h4'] and t.get_text(strip=True) == 'Side effects of Semaglutide + BioBoost Injections')
        if heading and heading.find_next_sibling(): body += clean(heading) + clean(heading.find_next_sibling())
    key = 'hrt-products/' + slug
    recovered[key] = {'key': key, 'title': s.h1.get_text(' ', strip=True), 'body': body, 'faqs': faqs(s),
                      'route': key + '/index.html', 'source': 'https://hrt.org/' + key}

s = soup('women-hair')
prefixes = ('Signs of hair loss', 'Our hair growth treatments', 'What are the benefits', 'How to stop hair loss', 'FAQs about hair loss')
recovered['women/hair-loss'] = {'body': '\n'.join(clean(b) for b in s.select('.w-richtext') if b.get_text(' ', strip=True).startswith(prefixes)), 'intro': '', 'faqs': []}
# The remaining accordion is template content; the relevant FAQs are in the rich text above.
recovered['return-policy'] = {'body': clean(soup('returns').select_one('.w-richtext'))}

assessments = {}
for gender in ['women', 'men']:
    script = (ARCHIVE / (gender + '-assessment.js')).read_text(encoding='utf8')
    keys = ['Q2_OPTIONS', 'Q1A_OPTIONS', 'Q1B_OPTIONS', 'Q1C_OPTIONS'] if gender == 'women' else ['Q1_OPTIONS', 'Q2A_OPTIONS', 'Q2B_OPTIONS', 'Q2C_OPTIONS']
    groups = []
    labels = ['Psychological', 'Reproductive & hormonal' if gender == 'women' else 'Sexual, urinary & energy', 'Metabolic & physical', 'Cardiovascular & chronic disease risk']
    for key, label in zip(keys, labels):
        raw = re.search(r'const ' + key + r' = (\[[\s\S]*?\]);', script).group(1)
        groups.append({'label': label, 'options': ast.literal_eval(re.sub(r'//[^\n]*', '', raw))})
    logic = re.search(r'function determineResult\([^)]*\) \{[\s\S]*?\n  \}', script).group(0)
    labels = re.findall(r"label: '([^']+)'", script)
    assessments[gender] = {'groups': groups, 'resultLabels': labels, 'scoringFunction': logic,
        'webhook': re.search(r"const WEBHOOK_URL = '([^']+)'", script).group(1),
        'submissionFields': ['first_name', 'email', 'mailing_list', 'cat1', 'cat2', 'cat3', 'cat4']}

(ARCHIVE / 'recovered-pages.json').write_text(json.dumps(recovered, ensure_ascii=False, indent=2), encoding='utf8')
(ARCHIVE / 'assessments.json').write_text(json.dumps(assessments, ensure_ascii=False, indent=2), encoding='utf8')

# Update the two existing content stores without regenerating unrelated pages.
pages_path = ROOT / 'source-content/page-content.json'
pages = json.loads(pages_path.read_text(encoding='utf8'))
for key in ['women/hair-loss', 'return-policy']: pages[key].update(recovered[key])
pages_path.write_text(json.dumps(pages, ensure_ascii=False), encoding='utf8')
index_path = ROOT / 'source-content/page-index.json'
index = json.loads(index_path.read_text(encoding='utf8'))
for p in index:
    if p['key'] == 'women/hair-loss': p['intro'] = ''
index_path.write_text(json.dumps(index, ensure_ascii=False), encoding='utf8')
raw_path = ROOT / 'source-content/restored-data.json'
raw = json.loads(raw_path.read_text(encoding='utf8'))
hair = raw['services']['women/hair-loss']
hair.update(recovered['women/hair-loss'])
hair['questions'] = []
hair['sections'] = []
# An unconfirmed offer must not be exposed through shared About data either.
for field in ['body', 'intro', 'description']:
    if field in raw['about']:
        doc = BeautifulSoup(raw['about'][field], 'html.parser')
        for el in list(doc.find_all(['p', 'li'])):
            if '$49.95' in el.get_text(): el.decompose()
        raw['about'][field] = str(doc)
raw['about']['sections'] = []
raw_path.write_text(json.dumps(raw, ensure_ascii=False), encoding='utf8')
print('Recovered two product descriptions, relevant hair-loss sections, return policy, and both assessment specifications.')
