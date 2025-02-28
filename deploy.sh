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
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 ./app.py
deactivate
