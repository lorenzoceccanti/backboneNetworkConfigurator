from flask import Flask
from flask_cors import CORS
from routes.configure import configure_bp
from routes.serve_index import serve_index_bp
from routes.serve_static import serve_static_bp
from routes.deploy import deploy_bp
from routes.transit import transit_bp
from routes.announce import announce_bp
from routes.stop_announce import stop_announce_bp
from routes.peering import peering_bp
from routes.local_preference import local_preference_bp
from routes.redistribute_ospf import redistribute_ospf_bp
from routes.redistribute_bgp import redistribute_bgp_bp

if __name__ == "__main__":
  app = Flask(__name__, static_folder="out", static_url_path="")
  CORS(app, resources={r"/*": {"origins": "*"}})
  
  app.register_blueprint(serve_index_bp)
  app.register_blueprint(serve_static_bp)
  app.register_blueprint(configure_bp)
  app.register_blueprint(deploy_bp)
  app.register_blueprint(transit_bp)
  app.register_blueprint(announce_bp)
  app.register_blueprint(stop_announce_bp)
  app.register_blueprint(peering_bp)
  app.register_blueprint(local_preference_bp)
  app.register_blueprint(redistribute_ospf_bp)
  app.register_blueprint(redistribute_bgp_bp)
  
  app.run(debug=True, host="0.0.0.0", port=5000)
