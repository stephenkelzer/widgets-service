FROM public.ecr.aws/lambda/nodejs:18

ARG FILE_PATH
RUN [ -z "$FILE_PATH" ] && echo "FILE_PATH is required" && exit 1 || true

COPY $FILE_PATH ${LAMBDA_TASK_ROOT}/index.js

CMD ["index.handler"]