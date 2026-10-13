/* Restore semantic blocks lost when original static content was imported.
   Wording is preserved: every article transformation checks its text signature. */
const fs = require('fs');
const path = require('path');
const excluded = new Set(['node_modules', 'uploads', 'source-content', 'scraps', '.tools', 'assets', '.git', 'dist', '.vercel']);
function files(dir = '.') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() && !excluded.has(entry.name) ? files(file) : entry.isFile() && entry.name.endsWith('.html') ? [file] : [];
  });
}
const policyLabels = new Set([
  'Terms and Conditions', 'Copyright', 'Trademarks', 'Warranty Disclaimer', 'Limitation of Liability',
  'Typographical Errors', 'Term; Termination', 'Notice', 'Miscellaneous', 'Use of Site', 'Participation Disclaimer',
  'Indemnification', 'Third-Party Links', 'Third-party links', 'Third-party disclosure', 'Google',
  'California Online Privacy Protection Act', 'COPPA (Children Online Privacy Protection Act)',
  'Fair Information Practices', 'CAN SPAM Act', 'Contacting Us', 'Opting out:',
  'How is Patient Privacy Protected?', 'How do we use and disclose health information?',
  'What personal information do we collect from the people that visit our blog, website or app?',
  'When do we collect information?', 'How do we use your information?', 'How do we protect your information?',
  'Do we use ‘cookies’?', 'How does our site handle Do Not Track signals?', 'Does our site allow third-party behavioral tracking?',
  'Nutritional Products', 'Additional Terms and Conditions', 'Release of Liability',
  'Testing Products Solely for Preliminary Screening Purposes',
  'Informed Consent Regarding Nutritional and Herbal Supplements',
  'Nutritional Counseling and Supplements from HRT.org', 'Privacy', 'Type of Information Collected',
  'Use of Cookies', 'Use of Information', 'Disclosure of Information',
  'Privacy of “Confidential Testing Information”', 'Security Policy', 'Additional Telehealth Terms'
]);
const bare = s => s.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
const signature = s => bare(s).replace(/[\s\u200b-\u200d\ufeff•]/g, '');
function wrapOrphanListItems(article) {
  let listDepth = 0, orphanDepth = 0, runOpen = false;
  return article.replace(/<\/?(?:ul|ol|li)\b[^>]*>/gi, (tag, offset) => {
    const closing = /^<\//.test(tag);
    if (!/^<\/?li\b/i.test(tag)) {
      listDepth += closing ? -1 : 1;
      return tag;
    }
    if (listDepth) return tag;
    if (!closing) {
      orphanDepth++;
      if (!runOpen) { runOpen = true; return `<ul>${tag}`; }
    } else if (orphanDepth) {
      orphanDepth--;
      if (!orphanDepth && !/^\s*<li\b/i.test(article.slice(offset + tag.length))) {
        runOpen = false;
        return `${tag}</ul>`;
      }
    }
    return tag;
  });
}
function linkPolicyContacts(article) {
  // Keep existing links and attributes intact; only link unambiguous text nodes.
  return article.split(/(<a\b[^>]*>[\s\S]*?<\/a>)/gi).map(part => {
    if (/^<a\b/i.test(part)) return part;
    return part.split(/(<[^>]*>)/g).map(text => text.startsWith('<') ? text : text
      .replace(/(?<![\w.@+-])info@hrt\.org(?![\w@-]|\.[A-Za-z])/g, '<a href="mailto:info@hrt.org">$&</a>')
      .replace(/\b1-888-574-5524\b|\(888\) 574-5524/g, '<a href="tel:+18885745524">$&</a>')
    ).join('');
  }).join('');
}
function formatParagraphs(article, isPolicy) {
  article = article
    .replace(/<h2><strong>([^<>]+)<\/h2><p><\/strong><br>/g, '<h2><strong>$1</strong></h2><p>')
    .replace(/(<strong>[^<>]*?)<br\s*\/?\s*>(<\/strong>)/gi, '$1$2<br>')
    .replace(/<h([2-6])>(?:\s|\u200b|\u200c|\u200d|\ufeff|<br\s*\/?\s*>)*<\/h\1>/gi, '');
  return article.replace(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi, (paragraph, body) => {
    if (!bare(body).replace(/[\s\u200b-\u200d\ufeff]/g, '')) return '';
    // A pair of line breaks in imported prose is a paragraph boundary.
    const parts = body.replace(/^(?:\s*<br\s*\/?\s*>)+|(?:<br\s*\/?\s*>\s*)+$/gi, '')
      .split(/(?:<br\s*\/?\s*>\s*){2,}/gi);
    return parts.map(part => {
      const lines = part.split(/<br\s*\/?\s*>/gi).map(s => s.trim()).filter(Boolean);
      const text = bare(part).replace(/\s+/g, ' ').trim();
      if (isPolicy && policyLabels.has(text) && !/^<a\b[^>]*>[\s\S]*<\/a>$/i.test(part.trim())) {
        return `<h2>${part.replace(/<br\s*\/?\s*>/gi, '')}</h2>`;
      }
      if (isPolicy && lines.length > 1 && policyLabels.has(bare(lines[0]))) {
        return `<h2>${lines.shift()}</h2><p>${lines.join('<br>')}</p>`;
      }
      if (isPolicy && /^<strong>[^<]*(?:<br\s*\/?\s*>)?<\/strong>$/i.test(part.trim()) && text.length < 160) {
        return `<h2>${part.replace(/<br\s*\/?\s*>/gi, '')}</h2>`;
      }
      const firstBullet = lines.findIndex(line => /^•\s*/.test(line));
      if (firstBullet >= 0 && lines.slice(firstBullet).every(line => /^•\s*/.test(line))) {
        const lead = lines.slice(0, firstBullet).join('<br>');
        return (lead ? `<p>${lead}</p>` : '') + `<ul>${lines.slice(firstBullet).map(line => `<li>${line.replace(/^•\s*/, '')}</li>`).join('')}</ul>`;
      }
      // An imported label sometimes follows a preceding paragraph with one break.
      if (isPolicy && lines.length > 1 && policyLabels.has(bare(lines[lines.length - 1]))) {
        const heading = lines.pop();
        return `<p>${lines.join('<br>')}</p><h2>${heading}</h2>`;
      }
      return `<p>${part}</p>`;
    }).join('');
  });
}
module.exports = function formatInnerPages() {
  const changed = [];
  for (const file of files()) {
    let html = fs.readFileSync(file, 'utf8');
    if (!html.includes('class="source-hero"')) continue;
    const original = html;
    const normalized = file.replaceAll('\\', '/');
    const isPolicy = /(?:Policy\.html|Terms and Conditions\.html|^legal\/)/i.test(normalized);
    html = html.replace(/<article class="source-prose">([\s\S]*?)<\/article>/g, (match, body) => {
      let formatted = formatParagraphs(body, isPolicy);
      if (isPolicy) formatted = linkPolicyContacts(wrapOrphanListItems(formatted));
      if (normalized === 'legal/consent-to-telehealth/index.html') {
        formatted = formatted.replace(/<h4>([\s\S]*?)<\/h4>/g, (heading, content) =>
          /^Possible (?:Benefits|Risks) of Telemedicine$/.test(bare(content)) ? `<h2>${content}</h2>` : heading);
      }
      formatted = formatted.replace(/<a>(<strong>)?(support@hrt\.org)(<\/strong>)?<\/a>/g,
        '<a href="mailto:support@hrt.org">$1$2$3</a>');
      if (normalized === 'providers/dr-clarence-lee-jr/index.html') {
        formatted = formatted.replace('USAF.Dr.', 'USAF.</p><p>Dr.')
          .replace('stations.A 2022', 'stations.</p><p>A 2022').replace('award.Dr.', 'award.</p><p>Dr.');
      }
      if (signature(formatted) !== signature(body)) throw new Error(`Inner-page formatting altered wording: ${file}`);
      return `<article class="source-prose">${formatted}</article>`;
    });
    if (normalized === 'providers/medical-team/index.html') {
      html = html.replace('<p>Back to providers</p>', '<p><a href="Providers.html">Back to providers</a></p>');
    }
    if (html !== original) { fs.writeFileSync(file, html); changed.push(normalized); }
  }
  return changed;
};
if (require.main === module) console.log(JSON.stringify({ formatted: module.exports() }));
