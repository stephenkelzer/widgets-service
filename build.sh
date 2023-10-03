#!/bin/bash

# clear /dist folder
rm -rf dist


# loop over lambda functions
for entry in src/lambdas/*.ts;
do
    if [ ! -f "$entry" ]
    then
        # if first entry is not a file, then no matching files found
        echo "No matching files found"
        continue
    fi
    
    # parse out only the name of the current file
    file_name=$(basename -- "$entry" .ts)
    
    # run esbuild on the file
    npx -y esbuild@0.19.4 ./src/lambdas/$file_name.ts --bundle --minify --sourcemap --platform=node --target=es2020 --outfile=dist/$file_name/index.js
    
    # zip the directory
    # cd dist/$file_name && zip -FSTmr ../$file_name.zip . && cd ../..
    
    # clean up the directory
    # rm -rf dist/$file_name
done