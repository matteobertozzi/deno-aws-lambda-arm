# Dummy docker file just use it as reference

FROM public.ecr.aws/lambda/provided:al2

ENV DENO_VERSION=1.29.4

ADD bootstrap ${LAMBDA_RUNTIME_DIR}/bootstrap
ADD aws-runtime.ts ${LAMBDA_RUNTIME_DIR}/aws-runtime.ts
ADD aws-events.ts ${LAMBDA_RUNTIME_DIR}/aws-events.ts

RUN yum install -q -y gzip \
 && curl -fsSL https://github.com/matteobertozzi/deno-aws-lambda-arm/releases/download/v${DENO_VERSION}/deno-amazon-linux2-arm64.${DENO_VERSION}.gz --output deno.gz \
 && gzip -d deno.gz \
 && chmod 755 deno \
 && mv deno ${LAMBDA_RUNTIME_DIR}/deno \
 && chmod 755 ${LAMBDA_RUNTIME_DIR}/bootstrap

CMD [ "function.handler" ]