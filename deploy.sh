# take a parameter that specifies if the frontend should be built
cd ./frontend
if [ "$1" == "build_frontend" ]; then
    npm i
    # build the nextjs app
    npm run build
    # move the out folder in the backend folder (if it already exists, replace it)
    rm -rf ../backend/out
    mv ./out ../backend
fi
# deploy the backend
cd ../backend
# docker build . --tag flask
# docker run -v $(pwd)/config:/app/config -p 5000:5000 --rm flask
python3 -m venv my_backend && source flask/bin/activate
pip install -r requirements.txt
python3 ./app.py
deactivate
