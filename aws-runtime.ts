// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { ApiGatewayMessage, SqsMessage, isAwsApiGatewayMessage, isAwsSqsMessage } from './aws-events.ts';

// =====================================================================================
//  Handle specific message
// =====================================================================================
async function handleSqsMessage(message: SqsMessage) {
  console.debug(`received ${message.Records.length} events from sqs`, message);
  for (const record of message.Records) {
    console.debug('process', record);
  }

  // NOTE: YOUR SQS Event Handler code should go here.
  return {'test': 'hello sqs'};
}

async function handleApiGatewayMessage(message: ApiGatewayMessage) {
  console.debug('received request from API Gateway', message);

  // NOTE: YOUR API Gatway Handler code should go here.
  return {'test': 'hello gateway'};
}

// =====================================================================================
//  AWS Runtime
// =====================================================================================
const AWS_LAMBDA_RUNTIME_API = Deno.env.get("AWS_LAMBDA_RUNTIME_API");
const AWS_LAMBDA_URI = 'http://' + AWS_LAMBDA_RUNTIME_API + '/2018-06-01/runtime/invocation';
//const HANDLER = Deno.env.get("_HANDLER");

async function uploadResult(requestId: string, response: unknown): Promise<void> {
  const result = await fetch(AWS_LAMBDA_URI + '/' + requestId + '/response', {
    method: 'POST',
    body: JSON.stringify(response)
  });
  const data = await result.text();
  console.debug('completion: upload result', data);
}

async function uploadError(requestId: string, exception: Error): Promise<void> {
  const result = await fetch(AWS_LAMBDA_URI + '/' + requestId + '/error', {
    method: 'POST',
    body: JSON.stringify({ errorMessage: exception.message, errorType: 'EXCEPTION' })
  });
  const data = await result.text();
  console.error('failure: upload result', data);
}

// =====================================================================================
//  Main loop waiting on events
//  https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html
// =====================================================================================
while (true) {
  const next = await fetch(AWS_LAMBDA_URI + '/next');
  const headers = next.headers;
  const requestId = headers.get('lambda-runtime-aws-request-id')!;

  try {
    const event = await next.json();

    // handle different types of input events...
    let response;
    if (isAwsSqsMessage(event)) {
      response = await handleSqsMessage(event as SqsMessage);
    } else if (isAwsApiGatewayMessage(event)) {
      response = await handleApiGatewayMessage(event as ApiGatewayMessage);
    } else {
      response = { status: 'UNSUPPORTED_EVENT', message: 'unsupported runtime event', data: event };
    }

    console.debug(`${requestId} send response`, response);
    await uploadResult(requestId, response);
  } catch(e) {
    console.error(e, `${requestId} send error`);
    await uploadError(requestId, e);
  }
}
