from flask import Blueprint, Response, send_from_directory

serve_static_bp = Blueprint("serve_static", __name__)

@serve_static_bp.route("/<path:path>", methods=["GET"])
def serve_static(path) -> Response:
    """
    This endpoint sends static files to the client, like CSS and JS files.
    :param path: The path to the file to be sent.
    :return: Response object with the file.
    """
    return send_from_directory("out", path)