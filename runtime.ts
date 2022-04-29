// https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html
const AWS_LAMBDA_RUNTIME_API = Deno.env.get("AWS_LAMBDA_RUNTIME_API");
const AWS_LAMBDA_URI = 'http://' + AWS_LAMBDA_RUNTIME_API + '/2018-06-01/runtime/invocation';
const HANDLER = Deno.env.get("_HANDLER");

while (true) {
  const next = await fetch(AWS_LAMBDA_URI + '/next');
  const headers = next.headers;
  const requestId = headers.get('lambda-runtime-aws-request-id');

  let res;
  try {
    const event = await next.json();
    const body = {'executed': requestId, 'handler': HANDLER, 'event': event};
    console.log('send response', body);
    res = await fetch(AWS_LAMBDA_URI + '/' + requestId + '/response', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  } catch(e) {
    console.log('send error', e);
    res = await fetch(AWS_LAMBDA_URI + '/' + requestId + '/error', {
      method: 'POST',
      body: JSON.stringify({
        errorMessage: e.message,
        errorType: 'EXCEPTION'
      })
    });
  }
  const x = await res.blob();
  console.log('result upload', x);
}
