#!/bin/bash
flask db upgrade
waitress-serve --port 8182 --call app:create_app