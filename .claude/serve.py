import functools
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler

DIRECTORY = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Handler = functools.partial(SimpleHTTPRequestHandler, directory=DIRECTORY)
HTTPServer(("127.0.0.1", 4321), Handler).serve_forever()
