const crypto = require('crypto');

const createSign = (data, privateKey) => crypto.createSign('RSA-SHA256').update(data).sign(privateKey, 'base64')

const urlBase64 = (base64) => base64.replace(/[+/=]/g, match => ({ '+': '-', '/': '_', '=': '' }[match]) )

const encodeRequest = (method, url, params, data, auth, secret) => {
  const algorithm = 'SHA256';
  const date = new Date();
  const nonce = String(date.getTime());
  const timestamp = `${date.toISOString().split('.')[0]}-03:00`;

  const dataToEncode = ([
    method,
    url,
    params || '',
    data || '',
    auth,
    nonce,
    timestamp,
    algorithm
  ]).join('\n');

  const requestSignature = urlBase64(createSign(dataToEncode, secret));

  return {
    'X-Brad-Signature': requestSignature,
    'X-Brad-Nonce': nonce,
    'X-Brad-Timestamp': timestamp,
    'X-Brad-Algorithm': algorithm,
    'Content-Type': 'application/json'
  };
}

module.exports.requestHooks = [
  (context) => {
    if(context.request.hasHeader('X-Brad-Headers') && context.request.getHeader('X-Brad-Headers') == 'true')
    {
      const method = context.request.getMethod();
      var url = context.request.getUrl();
      url = url.slice(url.search(/((?<!\/)\/(?=[^\/]))/));  // get end of the string from a slash bar ('/') that is not followed or preceeded by another slash bar
      params = "";
      context.request.getParameters().forEach((param) => {
        params = params.concat(param['name'] + '=' + param['value'] + '&');
      })
      params = params.slice(0, -1);
      var data = "";
      if(context.request.getBody().text)
        data = context.request.getBody().text.replace(/\n|\s+(?=([^"]*"[^"]*")*[^"]*$)/g, '');  // remove linebreaks and whitespaces that are not inside quotes
      context.request.setBodyText(data);
      const auth = context.request.getAuthentication().token.split(' ').pop();
      const secret = context.request.getEnvironmentVariable('private-key');
      const headers = encodeRequest(method, url, params, data, auth, secret)
      for (const [header, value] of Object.entries(headers)) {
        context.request.setHeader(header, value)
      }
      context.request.removeHeader('X-Brad-Headers');
    }
  }
];
