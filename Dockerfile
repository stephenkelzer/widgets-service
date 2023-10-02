FROM public.ecr.aws/lambda/nodejs:18

# This is a required variable for the image to be built correctly!
ARG FILE_PATH

COPY $FILE_PATH ${LAMBDA_TASK_ROOT}/index.js

CMD ["index.handler"]