from flask import Blueprint, Response, send_from_directory

serve_index_bp = Blueprint("serve_index", __name__)

@serve_index_bp.route("/", methods=["GET"])
def serve_index() -> Response:
    """
    Sends the index.html file to the client.
    :return: Response object with the index.html file.
    """
    return send_from_directory("out", "index.html")