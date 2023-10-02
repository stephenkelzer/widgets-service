# This is a required variable for the image to be built correctly!
ARG FILE_PATH

FROM public.ecr.aws/lambda/nodejs:18 as builder
ARG FILE_PATH
WORKDIR /usr/app
COPY . .
RUN npm ci --omit=dev
RUN npx -y esbuild@0.19.4 ${FILE_PATH} --bundle --minify --sourcemap --platform=node --target=es2020 --outfile=dist/index.js

FROM public.ecr.aws/lambda/nodejs:18
COPY --from=builder /usr/app/dist/* ./
CMD ["index.handler"]