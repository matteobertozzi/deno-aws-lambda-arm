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

export enum SqsDataType {
  NUMBER = "Number",
  STRING = "String",
  BINARY = "Binary"
}

export interface SqsMessageAttribute {
  stringValue?: string;
  binaryValue?: string;
  stringListValues: string[];
  binaryListValues: [];
  dataType: SqsDataType | string;
}

export interface SqsAttributes {
  ApproximateReceiveCount: string;
  ApproximateFirstReceiveTimestamp?: string;
  MessageDeduplicationId?: string;
  MessageGroupId?: string;
  SenderId: string;
  SentTimestamp: string;
  SequenceNumber?: string;
}

export interface SqsRecord {
  messageId: string;
  receiptHandle: string;
  body: string;
  attributes: SqsAttributes;
  messageAttributes: Record<string, SqsMessageAttribute>;
  md5OfMessageAttributes: string;
  md5OfBody: string;
  eventSource: string;
  eventSourceARN: string;
  awsRegion: string;
}

export interface SqsMessage {
  Records: SqsRecord[];
}

export interface ApiGatewayRequestHttp {
  method: string;
  path: string;
  protocol: string;
  sourceIp: string;
  userAgent: string;
}

export interface ApiGatewayRequestContext {
  accountId: string;
  apiId: string;
  domainName: string;
  domainPrefix: string;
  http: ApiGatewayRequestHttp;
  requestId: string;
  routeKey: string;
  stage: string;
  time: string;
  timeEpoch: number;
}

export interface ApiGatewayMessage {
  version: string;
  routeKey: string;
  rawPath: string;
  rawQueryString: string;
  headers: Record<string, string>;
  requestContext: ApiGatewayRequestContext;
  body: string;
  isBase64Encoded: boolean;
}

export function isAwsSqsMessage(message: unknown): boolean {
  const sqsMessage = message as SqsMessage;
  return sqsMessage && !!sqsMessage.Records;
}

export function isAwsApiGatewayMessage(message: unknown): boolean {
  const apiGatewayMessage = message as ApiGatewayMessage;
  return apiGatewayMessage && !!apiGatewayMessage.routeKey;
}
