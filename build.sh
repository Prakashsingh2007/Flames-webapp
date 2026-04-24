#!/usr/bin/env bash

pip install --upgrade pip

pip install -r requirements.txt

python manage.py migrate

python manage.py collectstatic --noinput

# Create superuser automatically
python manage.py createsuperuser --noinput || true