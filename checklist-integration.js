/* Integration prepared from the nine supplied n8n exports.
   Live submissions to the configured n8n server were explicitly approved by the
   user on 12 October 2026. Only the final submit action sends contact/answer data.
   Automated tests intercept all writes. No credentials belong in this file. */
(() => {
  'use strict';
  const LIVE_ENABLED = true;
  const base = 'https://vmi3206755.contaboserver.net/webhook/';
  const paths = Object.freeze({
    women:'hormone-women-typeform-submit', men:'hormone-men-typeform-submit',
    pms:'pms-typeform-submit', thyroid:'thyroid-typeform-submit', adrenal:'adrenal-typeform-submit',
    osteoporosis:'osteoporosis-typeform-submit', andropause:'andropause-typeform-submit',
    menopause:'menopause-typeform-submit', perimenopause:'perimenopause-typeform-submit'
  });
  const emailPattern = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$/i;
  function fail(code, message, uncertain = false) {
    const error = new Error(message); error.code = code; error.uncertain = uncertain; return error;
  }
  function validate(assessmentId, payload) {
    const spec = window.HRT_ASSESSMENT;
    if (!Object.hasOwn(paths,assessmentId) || spec?.id !== assessmentId || !payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw fail('INVALID_PAYLOAD','This assessment could not be identified. Reload the page and try again.');
    }
    const fields = ['first_name','email','mailing_list',...(spec.mode==='hormone'?spec.groups.map(g=>g.name):spec.questions.map(q=>q.name))];
    if (Object.keys(payload).length !== fields.length || fields.some(key=>!Object.hasOwn(payload,key)) || Object.keys(payload).some(key=>!fields.includes(key))) {
      throw fail('INVALID_PAYLOAD','Some answers are missing. Review your checklist before submitting.');
    }
    const name = typeof payload.first_name==='string' ? payload.first_name.trim() : '';
    const email = typeof payload.email==='string' ? payload.email.trim() : '';
    // Existing email greetings interpolate names into HTML. Also repaired server-side
    // in the inactive workflow copies; this validation protects the local form path.
    if (!name || name.length>100 || /[<>\u0000-\u001f\u007f]/.test(name)) throw fail('INVALID_NAME','Enter your first name without markup or line breaks.');
    if (email.length>254 || !emailPattern.test(email)) throw fail('INVALID_EMAIL','Please check your email address and try again.');
    if (!spec.mailingOptions.some(option=>option.text===payload.mailing_list)) throw fail('INVALID_PAYLOAD','Please choose your mailing preference.');
    if (spec.mode==='hormone') {
      for (const group of spec.groups) if (!Number.isInteger(payload[group.name]) || payload[group.name]<0 || payload[group.name]>group.options.length) {
        throw fail('INVALID_PAYLOAD','Some answers could not be validated. Review your checklist before submitting.');
      }
    } else for (const question of spec.questions) if (!spec.options.some(option=>option.text===payload[question.name])) {
      throw fail('INVALID_PAYLOAD','Please answer every question before submitting.');
    }
    return Object.fromEntries(fields.map(key=>[key,key==='first_name'?name:key==='email'?email:payload[key]]));
  }
  async function submit({assessmentId,payload}) {
    if (!LIVE_ENABLED) throw fail('DELIVERY_DISABLED','Online delivery is unavailable. Your results remain on this page.');
    const body = validate(assessmentId,payload);
    if (['women','men'].includes(assessmentId) && ['cat1','cat2','cat3','cat4'].every(key=>body[key]===0)) {
      // Exported workflows incorrectly classify zero selections as risk.
      return {accepted:false,localOnly:true,reason:'no-symptoms'};
    }
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(),30000);
    try {
      const response = await fetch(base+paths[assessmentId],{
        method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(body),credentials:'omit',redirect:'error',cache:'no-store',signal:controller.signal
      });
      let result;
      try { result = await response.json(); }
      catch (_) { throw fail('UNCONFIRMED','We could not confirm whether your email was sent. Check your inbox before trying again to avoid duplicate emails.',true); }
      if (!response.ok || result?.success!==true) {
        if (response.status===400 && result?.error==='INVALID_EMAIL') throw fail('INVALID_EMAIL','Please check your email address, edit your details and try again.');
        throw fail('UNCONFIRMED','We could not confirm whether your email was sent. Check your inbox before trying again to avoid duplicate emails.',true);
      }
      // The supplied workflows respond success after Gmail. This confirms the send
      // step, not inbox arrival. Never render upstream narratives or follow redirects.
      return {accepted:true,emailSent:true};
    } catch (error) {
      if (error.code) throw error;
      throw fail('UNCONFIRMED',controller.signal.aborted
        ? 'Sending took longer than expected. Check your inbox before trying again to avoid duplicate emails.'
        : 'We could not confirm whether your email was sent. Check your connection and inbox before trying again to avoid duplicate emails.',true);
    } finally { clearTimeout(timeout); }
  }
  window.HRTChecklistDelivery = Object.freeze({enabled:LIVE_ENABLED,newsletterEnabled:false,submit});
})();
