# This is a required variable for the image to be built correctly!
ARG FILE_PATH

FROM public.ecr.aws/lambda/nodejs:18 as builder
ARG FILE_PATH
WORKDIR /usr/app
COPY package.json $FILE_PATH  ./
RUN npm ci
RUN esbuild $FILE_PATH --bundle --minify --sourcemap --platform=node --target=es2020 --outdir=dist

FROM public.ecr.aws/lambda/nodejs:18
ARG FILE_PATH
COPY --from=builder /usr/app/dist/* ./
CMD ["index.handler"]