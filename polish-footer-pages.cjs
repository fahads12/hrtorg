/* Idempotent layout/accessibility enhancements for the existing footer pages.
   Source biographies, policy wording and FAQ answers remain intact. */
const fs = require('fs');

const people = [
  { slug: 'dr-clarence-lee-jr', name: 'Dr. Clarence Lee Jr.', image: 'dr-lee-enhanced' },
  { slug: 'jessica-kikla', name: 'Jessica Kikla ARNP, Nurse Practitioner', image: 'jessica-kikla-enhanced' },
];
function edit(file, transform) {
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (before !== after) fs.writeFileSync(file, after);
}
function portraitMarkup(html, person, sizes) {
  return html.replace(new RegExp(`<img\\b[^>]*src=["']uploads/generated/${person.image}-1024\\.webp["'][^>]*>`, 'g'), tag => {
    tag = tag.replace(/\s(?:alt|srcset|sizes|width|height)=["'][^"']*["']/gi, '');
    return tag.replace(/>$/, ` alt="${person.name}" width="1024" height="1024" srcset="uploads/generated/${person.image}-512.webp 512w, uploads/generated/${person.image}-1024.webp 1024w" sizes="${sizes}">`);
  });
}
function replacePageHeading(html, title, intro) {
  return html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title} | HRT.org</title>`)
    .replace(/<h1>[\s\S]*?<\/h1>/, `<h1>${title}</h1>`)
    .replace(/(<h1>[\s\S]*?<\/h1>)<p>[\s\S]*?<\/p>/, `$1<p>${intro}</p>`);
}
function externalQuestionnaire(html, title, label, formId, alternative = '') {
  return html.replace(/<div class="source-cta"><div>[\s\S]*?<\/div><a\b[\s\S]*?<\/a><\/div>/,
    `<div class="source-cta"><div><h2>${title}</h2><p>This form opens on Typeform.${alternative}</p></div><a class="btn btn-primary" href="https://form.typeform.com/to/${formId}">${label}</a></div>`);
}
function polishSupplementaryPages() {
  edit('checklist/new-patient-health-supplement-required-intake-information/index.html', html => {
    html = replacePageHeading(html, 'Health Supplement Intake Preparation', 'Keep these details ready to discuss with your care team.');
    return html.replace(/<article class="source-prose">[\s\S]*?<\/article>/, '<article class="source-prose"><h2>Information to have ready</h2><p>This is a preparation guide. Share your information through the patient portal when your care team requests it.</p><ul><li>First and last name</li><li>Date of birth</li><li>Gender</li><li>Current or previous health issues</li><li>Medications or supplements currently taking</li><li>Any known allergies</li></ul><p><a class="btn btn-primary" href="https://portal.hrt.org">Open the patient portal</a></p></article>');
  });
  edit('checklist/general-nutritional-nutrient-deficiency-symptom-checklist/index.html', html => html
    .replace(/<p>\u200d<\/p>/g, '')
    .replace('Our Nutritional Deficiency Checklist and Quiz is designed to help you identify possible warning signs, so you can take proactive steps toward restoring balance and improving your overall health.', 'Use the questions below to prepare a discussion with your care team.')
    .replace('<h2>General Nutritional (Nutrient) Deficiency Symptom Checklist</h2>', '<h2>Questions to discuss with your care team</h2><p>These prompts are for preparation; this page does not collect answers or calculate a result.</p>')
    .replace(/<li>(?:123|Rate from 1 to 3|YesNo)<\/li>/g, '')
    .replace(/\*(<\/strong>)/g, '$1'));
  edit('checklist/erectile-dysfunction-ed-symptom-checklist/index.html', html => {
    html = replacePageHeading(html, 'Understanding Erectile Dysfunction', 'Prepare questions about symptoms and sexual health for a conversation with your care team.');
    html = externalQuestionnaire(html, 'Erectile dysfunction questionnaire', 'Open ED questionnaire', 'JZXYRv', ' You can also <a href="Symptom Check.html">explore on-site symptom checks</a>.');
    return html.replace(/<h2><strong>Erectile Dysfunction Quiz[\s\S]*?<\/strong><\/h2>/, '<h2>Discussing your concerns</h2>')
      .replace(/<p>Our Erectile Dysfunction \(ED\) self-test[\s\S]*?<\/p>/, '<p>Use this guide to prepare questions about sexual health for your care team. A healthcare provider can evaluate symptoms and recommend appropriate next steps.</p>')
      .replace('The quiz can help you identify patterns that point toward one cause over the other.', '')
      .replace(/<h2>(?:<strong>)?Interpreting Your Online Quiz Results(?:<\/strong>)?<\/h2>[\s\S]*?(?=<h2>)/, '')
      .replace(/(<h2>(?:<strong>)?When to Seek Professional Evaluation(?:<\/strong>)?<\/h2>)<p>[\s\S]*?<\/p>/, '$1<p>If symptoms persist, seek a professional evaluation.</p>');
  });
  edit('checklist/weight-loss/index.html', html => {
    html = replacePageHeading(html, 'Weight Management: Questions for Your Care Team', 'Explore weight management services and discuss your goals with a provider.');
    html = externalQuestionnaire(html, 'Weight-loss consultation request', 'Open weight-loss request form', 'qHRP4cxp');
    return html.replace(/<article class="source-prose">[\s\S]*?<\/article>/, '<article class="source-prose"><h2>Explore weight management care</h2><p>Learn about the available services before discussing your needs with your care team.</p><p><a href="women/weight-loss-and-management/index.html">Weight management for women</a></p><p><a href="men/weight-loss-and-management/index.html">Weight management for men</a></p><p><a class="btn btn-primary" href="Consultation.html">Prepare for a consultation</a></p></article>');
  });
  edit('menopause-quiz/index.html', html => {
    html = replacePageHeading(html, 'Explore Menopause Symptoms', 'Open the original questionnaire or explore the on-site assessment and care options.');
    html = externalQuestionnaire(html, 'Menopause questionnaire', 'Open menopause questionnaire', 'LgydNw');
    return html.replace(/<(article|div) class="(?:wrap )?source-prose">[\s\S]*?<\/\1>/, '<div class="wrap source-prose"><h2>More ways to explore your symptoms</h2><p>You can also use the on-site symptom assessment or learn about care for women.</p><p><a class="btn btn-primary" href="checklist/menopause-assessment/index.html">Open the on-site menopause assessment</a></p><p><a href="Audience.html?g=women">Explore care for women</a></p></div>');
  });
  edit('menopause/index.html', html => html
    .replace(/(<img\b[^>]*src='uploads\/source\/6c336acfb84bc1ec.webp'[^>]*alt=)''/, "$1'Woman sitting at home'")
    .replace('<h1>Menopause And HRT</h1>', '<h1>Menopause and HRT</h1>')
    .replace(/(<h2>\s*HRT can help dealing with the following symptoms during menopause<\/h2>)([\s\S]*?)(<p><a href="menopause-quiz\/index.html">We can help you<\/a><\/p>)/, (all, heading, items) => heading+'<ul>'+items.replace(/<p>([\s\S]*?)<\/p>/g, '<li>$1</li>')+'</ul><p><a href="checklist/menopause-assessment/index.html">Explore the menopause assessment</a></p>')
    .replace(/<h2>How does hormone replacement therapy \(HRT\) treatment work\?<\/h2>(?!<p><a href="How It Works.html">)/, '<h2>How does hormone replacement therapy (HRT) treatment work?</h2><p><a href="How It Works.html">Explore the care process</a></p>')
    .replace(/<h2>HRT Treatments and Products for Menopause<\/h2>[\s\S]*?(?=<h2>Why women choose HRT\.ORG<\/h2>)/, '<h2>HRT Treatments and Products for Menopause</h2><p><a href="women/hormone-replacement-therapy/index.html">Explore hormone therapy for women</a></p><p><a href="Lab Testing.html">Explore at-home lab testing</a></p>')
    .replace(/<h2>What our customers say<\/h2>[\s\S]*?(?=<h2>FAQs about HRT as Treatment for Menopause<\/h2>)/, '')
    .replace(/<h2>FAQs about HRT as Treatment for Menopause<\/h2>[\s\S]*?(?=<h2>Don't let hormone changes)/, '<h2>Questions about your care?</h2><p>Contact our team at <a href="tel:+18885745524">(888) 574-5524</a> or <a href="Contact.html">visit the contact page</a>.</p><p><a href="FAQ.html">Browse general testing FAQs</a></p>')
    .replace(/<h2>Don't let hormone changes hold you back. Explore your HRT options.<\/h2>(?!<p><a class="btn btn-primary")/, "<h2>Don't let hormone changes hold you back. Explore your HRT options.</h2><p><a class=\"btn btn-primary\" href=\"Audience.html?g=women\">Explore care for women</a></p>"));
}
module.exports = function polishFooterPages() {
  polishSupplementaryPages();
  // Correct the source's mistyped contact address without changing policy terms.
  for (const file of ['Privacy Policy.html', 'legal/privacy-policy/index.html']) {
    edit(file, html => html.replace('information below.minfo@hrt.org', 'information below: <a href="mailto:info@hrt.org">info@hrt.org</a>'));
  }
  edit('Contact.html', html => html.replace(/(<form\b[^>]*class="email-draft-form source-form"[^>]*>)([\s\S]*?)(<\/form>)/, (all, opening, body, closing) => {
    // Fail closed if JavaScript never loads: native GET submission would expose
    // the enquiry in the URL. The handler enables this control only when ready.
    body = body.replace(/(<button\b[^>]*type="submit")(?![^>]*\bdisabled)([^>]*>)/, '$1 disabled$2');
    if (!body.includes('class="email-draft-fallback"')) body += '<noscript><p class="email-draft-fallback">To prepare a draft here, enable JavaScript. You can also <a href="mailto:info@hrt.org">email info@hrt.org</a> directly.</p></noscript>';
    return opening + body + closing;
  }));
  edit('Providers.html', html => {
    html = html.replace('<main id="main-content">', '<main id="main-content" class="provider-directory">');
    for (const person of people) html = portraitMarkup(html, person, '(max-width: 650px) calc(100vw - 40px), (max-width: 1000px) 44vw, 380px');
    return html;
  });
  for (const person of people) edit(`providers/${person.slug}/index.html`, html => {
    html = html.replace('<main id="main-content">', '<main id="main-content" class="provider-profile">');
    html = portraitMarkup(html, person, '(max-width: 900px) calc(100vw - 40px), 500px');
    if (!html.includes('class="provider-back"')) html = html.replace('<section class="wrap source-reading">', '<section class="wrap source-reading"><a class="provider-back" href="Providers.html">← Back to medical board</a>');
    return html.replace('<p>Phone: 561-246-3751</p>', '<p>Phone: <a href="tel:+15612463751">561-246-3751</a></p>')
      .replace('<p>Email: jessica@hrt.org</p>', '<p>Email: <a href="mailto:jessica@hrt.org">jessica@hrt.org</a></p>');
  });
  edit('providers/medical-team/index.html', html => {
    if (html.includes('provider-team-grid')) return html;
    const directory = fs.readFileSync('Providers.html', 'utf8');
    const cards = [...directory.matchAll(/<article class="source-card"[\s\S]*?<\/article>/g)].slice(0, 2).map(m => m[0]).join('');
    html = html.replace('<main id="main-content">', '<main id="main-content" class="provider-directory">');
    return html.replace(/<section class="wrap source-reading">[\s\S]*?<\/section>/, `<section class="wrap"><div class="source-grid provider-team-grid">${cards}</div><a class="provider-back" href="Providers.html">← Back to medical board</a></section>`);
  });
  edit('Join Our Network.html', html => html.replace('Please fill out the form below to become a listed provider on hrt.org.', 'Please contact our team about becoming a listed provider on hrt.org.'));
  edit('glp-1/ozempic-vs-wegovy/index.html', html => html
    .replace(' Take the quiz to find the best next step (testing, consult, or program options).', '')
    .replace(/<p><strong>Best next step:<\/strong> take the quiz to see whether you should start with <strong>labs<\/strong>, a <strong>provider consult<\/strong>, or a <strong>program pathway<\/strong>\.<\/p>/, '')
    .replace(/<li><strong>Take the GLP-1 Quiz<\/strong> \(fastest way to get matched\)<\/li>/, '')
    .replace('<li><strong>Order labs first</strong>', '<li><a href="Lab Testing.html"><strong>Order labs first</strong></a>')
    .replace('<li><strong>Book a consult</strong>', '<li><a href="Consultation.html"><strong>Prepare for a consultation</strong></a>')
    .replace('<a href="Consultation.html"><strong>Book a consult</strong></a>', '<a href="Consultation.html"><strong>Prepare for a consultation</strong></a>'));
  edit('FAQ.html', html => {
    if (html.includes('class="faq-topics"')) return html;
    return html.replace(/<div class="source-faqs">([\s\S]*?)<\/div><aside/, (match, content) => {
      const questions = [...content.matchAll(/<details>[\s\S]*?<\/details>/g)].map(m => m[0]);
      if (questions.length !== 12) throw new Error('FAQ grouping must be reviewed when source questions change.');
      const groups = [['female-kit', 'Optimal Female Hormone Test Kit'], ['male-kit', 'Optimal Male Hormone Test Kit'], ['thyroid-kit', 'Thyroid testing']];
      const nav = `<nav class="faq-topics" aria-label="FAQ topics">${groups.map(([id, title]) => `<a href="FAQ.html#${id}">${title}</a>`).join('')}</nav>`;
      const sections = groups.map(([id, title], i) => `<section class="faq-group" id="${id}" aria-labelledby="${id}-title"><h2 id="${id}-title">${title}</h2><div class="source-faqs">${questions.slice(i * 4, i * 4 + 4).join('')}</div></section>`).join('');
      return nav + sections + '<aside';
    });
  });
};
if (require.main === module) module.exports();
