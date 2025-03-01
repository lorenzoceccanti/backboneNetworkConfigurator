from flask import Flask
from flask_cors import CORS
from routes.configure import configure_bp
from routes.serve_index import serve_index_bp
from routes.serve_static import serve_static_bp
from routes.deploy import deploy_bp
from routes.transit import transit_bp

if __name__ == "__main__":
  app = Flask(__name__, static_folder="out", static_url_path="")
  CORS(app, resources={r"/*": {"origins": "*"}})
  
  app.register_blueprint(serve_index_bp)
  app.register_blueprint(serve_static_bp)
  app.register_blueprint(configure_bp)
  app.register_blueprint(deploy_bp)
  app.register_blueprint(transit_bp)
  
  app.run(debug=True, host="0.0.0.0", port=5000)
