FROM public.ecr.aws/lambda/nodejs:18

# This is a required variable for the image to be built correctly!
ARG FILE_PATH

WORKDIR ${LAMBDA_TASK_ROOT}
COPY $FILE_PATH ./index.js
RUN ls -la
CMD ["index.handler"]